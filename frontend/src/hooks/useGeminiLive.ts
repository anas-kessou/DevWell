import { useRef, useState, useCallback, useEffect } from 'react';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { LogEntry, HealthEvent } from '../types';
import { v4 as uuidv4 } from 'uuid';

// We are switching to a "Simulated Live" mode using standard REST API polling
// to avoid the strict Quota limits of the WebSocket Live API.
// This means no real-time audio conversation, but reliable fatigue monitoring.

const MODEL_NAME = 'gemini-1.5-flash'; // Standard model with higher limits
const SYSTEM_INSTRUCTION = `
You are DevWell, an expert AI developer companion. Your primary goal is to monitor the developer's well-being via video snapshots.

1. **Health Monitoring**: Analyze the image for signs of fatigue.
   - **Signs**: Yawning, rubbing eyes, slow blinking, drooping head, slouching posture.
   - **Action**: If you detect fatigue, return a JSON object with the event details.
   - **Severity**: 
     - MILD (Slouching, single yawn): Suggest a stretch.
     - HIGH (Multiple yawns, eyes closing): Strongly recommend a 5-minute break.

2. **Output Format**:
   - You must return a JSON object matching this schema:
     {
       "detected": boolean,
       "event": {
         "type": "FATIGUE" | "POSTURE" | "STRESS" | "FOCUS",
         "severity": "LOW" | "MEDIUM" | "HIGH",
         "description": string
       } | null
     }
   - If nothing is detected, set "detected" to false and "event" to null.
`;

interface UseGeminiLiveProps {
    onLog: (entry: LogEntry) => void;
    onHealthEvent: (event: HealthEvent) => void;
}

export const useGeminiLive = ({ onLog, onHealthEvent }: UseGeminiLiveProps) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    const isConnectedRef = useRef(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const videoIntervalRef = useRef<number | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const analysisVideoRef = useRef<HTMLVideoElement>(document.createElement('video')); // Hidden video for fatigue analysis
    const isConnectingRef = useRef(false);

    useEffect(() => {
        // Configure hidden analysis video
        if (analysisVideoRef.current) {
            analysisVideoRef.current.autoplay = true;
            analysisVideoRef.current.muted = true;
            analysisVideoRef.current.playsInline = true;
        }
    }, []);

    useEffect(() => {
        isConnectedRef.current = isConnected;
    }, [isConnected]);

    const stopMediaStream = useCallback(() => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
    }, []);

    const startScreenShare = useCallback(async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: { width: 1280, height: 720, frameRate: 10 },
                audio: false
            });

            // Show screen in UI (videoRef)
            if (videoRef.current) {
                videoRef.current.srcObject = screenStream;
                await videoRef.current.play();
            }

            // Note: We DO NOT update analysisVideoRef. It keeps using the Camera stream 
            // (from mediaStreamRef) so fatigue detection continues in the background.

            screenStream.getVideoTracks()[0].onended = () => stopScreenShare();
            setIsScreenSharing(true);
            onLog({ id: uuidv4(), timestamp: new Date(), sender: 'system', message: 'Switched to Screen Share (Fatigue monitoring active in background).', type: 'normal' });
        } catch (e) {
            console.error("Failed to share screen", e);
            onLog({ id: uuidv4(), timestamp: new Date(), sender: 'system', message: 'Failed to share screen.', type: 'alert' });
        }
    }, [onLog]);

    const stopScreenShare = useCallback(async () => {
        try {
            // Revert UI to Camera
            if (videoRef.current && mediaStreamRef.current) {
                videoRef.current.srcObject = mediaStreamRef.current;
                await videoRef.current.play();
            }
            setIsScreenSharing(false);
            onLog({ id: uuidv4(), timestamp: new Date(), sender: 'system', message: 'Switched back to Camera.', type: 'normal' });
        } catch (e) {
            console.error("Failed to revert to camera", e);
        }
    }, [onLog]);

    const startPolling = useCallback((model: any) => {
        if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);

        videoIntervalRef.current = window.setInterval(async () => {
            // Use analysisVideoRef for fatigue detection (always Camera)
            if (!analysisVideoRef.current || !canvasRef.current || !isConnectedRef.current) return;

            const ctx = canvasRef.current.getContext('2d');
            if (!ctx) return;

            // Capture from Analysis Video (Camera)
            canvasRef.current.width = analysisVideoRef.current.videoWidth;
            canvasRef.current.height = analysisVideoRef.current.videoHeight;
            ctx.drawImage(analysisVideoRef.current, 0, 0);

            const base64 = canvasRef.current.toDataURL('image/jpeg', 0.6).split(',')[1];

            try {
                const result = await model.generateContent([
                    { inlineData: { data: base64, mimeType: "image/jpeg" } },
                    "Analyze this image for developer fatigue."
                ]);
                
                const response = result.response.text();
                const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
                const data = JSON.parse(cleanResponse);

                if (data.detected && data.event) {
                    onHealthEvent(data.event);
                    onLog({ id: uuidv4(), timestamp: new Date(), sender: 'system', message: `Detected: ${data.event.description}`, type: 'alert' });
                }
            } catch (err) {
                console.error("Analysis failed", err);
            }
        }, 10000);
    }, [onHealthEvent, onLog]);

    const connect = useCallback(async () => {
        if (isConnectedRef.current || isConnectingRef.current) return;

        const geminiApiKey = (import.meta.env.VITE_API_KEY ?? '').trim();
        if (!geminiApiKey) {
            onLog({
                id: uuidv4(),
                timestamp: new Date(),
                sender: 'system',
                message: "Gemini API key missing.",
                type: 'alert'
            });
            return;
        }

        isConnectingRef.current = true;

        try {
            const ai = new GoogleGenerativeAI(geminiApiKey);
            const model = ai.getGenerativeModel({ 
                model: MODEL_NAME,
                systemInstruction: SYSTEM_INSTRUCTION,
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: SchemaType.OBJECT,
                        properties: {
                            detected: { type: SchemaType.BOOLEAN },
                            event: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    type: { type: SchemaType.STRING, enum: ['FATIGUE', 'POSTURE', 'STRESS', 'FOCUS'], format: 'enum' },
                                    severity: { type: SchemaType.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'], format: 'enum' },
                                    description: { type: SchemaType.STRING }
                                },
                                nullable: true
                            }
                        }
                    }
                }
            });

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: { width: 640, height: 480, frameRate: 15 }
            });
            
            setIsStreaming(true);
            mediaStreamRef.current = stream;
            setCameraStream(stream);

            // 1. Show Camera in UI
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            // 2. Feed Camera to Analysis Video (Hidden)
            if (analysisVideoRef.current) {
                analysisVideoRef.current.srcObject = stream;
                await analysisVideoRef.current.play();
            }

            setIsConnected(true);
            onLog({ id: uuidv4(), timestamp: new Date(), sender: 'system', message: 'Connected (Monitoring Mode).', type: 'success' });

            startPolling(model);

        } catch (e) {
            console.error("Connection failed:", e);
            onLog({ id: uuidv4(), timestamp: new Date(), sender: 'system', message: `Failed to start: ${e instanceof Error ? e.message : String(e)}`, type: 'alert' });
            setIsConnected(false);
            setIsStreaming(false);
        } finally {
            isConnectingRef.current = false;
        }
    }, [startPolling, onLog]);

    const disconnect = useCallback(() => {
        if (videoIntervalRef.current) {
            window.clearInterval(videoIntervalRef.current);
            videoIntervalRef.current = null;
        }
        stopMediaStream();
        setIsConnected(false);
        setIsStreaming(false);
        setIsScreenSharing(false);
        setCameraStream(null);
        onLog({ id: uuidv4(), timestamp: new Date(), sender: 'system', message: 'Disconnected.', type: 'normal' });
    }, [onLog, stopMediaStream]);

    const sendTextMessage = useCallback(async (text: string) => {
        const geminiApiKey = (import.meta.env.VITE_API_KEY ?? '').trim();
        if (!geminiApiKey) return;

        try {
            const ai = new GoogleGenerativeAI(geminiApiKey);
            const chatModel = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
            
            let promptParts: any[] = [text];
            
            // Optionally include the current video frame for context
            if (canvasRef.current && videoRef.current) {
                 // Ensure canvas is up to date
                 const ctx = canvasRef.current.getContext('2d');
                 if (ctx) {
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                    ctx.drawImage(videoRef.current, 0, 0);
                    const base64 = canvasRef.current.toDataURL('image/jpeg', 0.6).split(',')[1];
                    promptParts = [
                        { inlineData: { data: base64, mimeType: "image/jpeg" } },
                        text
                    ];
                 }
            }

            const result = await chatModel.generateContent(promptParts);
            const response = result.response.text();

            onLog({ 
                id: uuidv4(), 
                timestamp: new Date(), 
                sender: 'ai', 
                message: response, 
                type: 'normal' 
            });

        } catch (e) {
            console.error("Chat failed", e);
            onLog({ 
                id: uuidv4(), 
                timestamp: new Date(), 
                sender: 'system', 
                message: "Failed to get response from AI.", 
                type: 'alert' 
            });
        }
    }, [onLog]);

    return {
        connect,
        disconnect,
        startScreenShare,
        stopScreenShare,
        sendTextMessage,
        isConnected,
        isStreaming,
        isScreenSharing,
        videoRef,
        canvasRef,
        cameraStream
    };
};
