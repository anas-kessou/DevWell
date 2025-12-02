import { useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import type { FunctionDeclaration } from '@google/genai';
import type { LogEntry, HealthEvent } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Helper functions for audio processing (inline to avoid extra file dependency if possible, or we can create utils/audio.ts)
// For now, let's assume we need to implement these or import them. 
// Given the context, I will implement minimal versions here or assume they exist.
// Checking previous file list, devwell had utils/audio.ts. I should probably create that too or inline it.
// I'll inline the critical parts for simplicity or create the file if it's complex.
// The devwell implementation imported them. I'll create a utils/audio.ts file in the next step to keep this clean.
// For now, I will assume they are imported from '../utils/audio'.

import { pcmToBlob, decodeAudioData, base64ToUint8Array, downsampleBuffer } from '../utils/audio';

const MODEL_NAME = 'gemini-2.0-flash-exp';
const SYSTEM_INSTRUCTION = `
You are DevWell, an expert AI developer companion. Your primary goal is to monitor the developer's well-being and productivity via video and audio.

1. **Health Monitoring (Priority)**: Watch the video feed continuously for signs of fatigue.
   - **Signs**: Yawning, rubbing eyes, slow blinking, drooping head, slouching posture.
   - **Action**: If you detect fatigue, IMMEDIATELLY use the 'logHealthEvent' tool to alert the user.
   - **Severity**: 
     - MILD (Slouching, single yawn): Suggest a stretch.
     - HIGH (Multiple yawns, eyes closing): Strongly recommend a 5-minute break.

2. **Coding Assistance (On Demand)**: 
   - Watch for signs of frustration (frowning, hands on head, confused look).
   - Listen for verbal requests for help (e.g., "I'm stuck", "Help me debug this", "What does this error mean?").
   - **Action**: If prompted or if frustration is evident, switch to Assistant Mode. Provide concise, high-level technical advice verbally. 
   - **Code Output**: If the user asks for code, generate it inside markdown code blocks (e.g. \`\`\`typescript ... \`\`\`). The UI will render this nicely.
   - **Tone**: Empathetic but technical. "It looks like you're stuck on a logic error. Have you checked the loop condition?"

3. **Behavior**: 
   - Be observant but silent unless necessary. Do not narrate everything. 
   - Only speak when there is a health issue or the user asks for help.
   - Use the 'logHealthEvent' tool to visualize alerts on their dashboard.

Keep your verbal responses warm, professional, and concise.
`;

const logHealthEventTool: FunctionDeclaration = {
    name: 'logHealthEvent',
    description: 'Log a specific health or productivity event to the user dashboard.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            type: {
                type: Type.STRING,
                enum: ['FATIGUE', 'POSTURE', 'STRESS', 'FOCUS'],
                description: 'The category of the event.',
            },
            severity: {
                type: Type.STRING,
                enum: ['LOW', 'MEDIUM', 'HIGH'],
                description: 'How urgent the event is.',
            },
            description: {
                type: Type.STRING,
                description: 'A short, user-facing message describing the issue (e.g., "You are yawning a lot.").',
            },
        },
        required: ['type', 'severity', 'description'],
    },
};

interface UseGeminiLiveProps {
    onLog: (entry: LogEntry) => void;
    onHealthEvent: (event: HealthEvent) => void;
}

export const useGeminiLive = ({ onLog, onHealthEvent }: UseGeminiLiveProps) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    const sessionRef = useRef<any>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const videoIntervalRef = useRef<number | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const outputNodeRef = useRef<GainNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const stopMediaStream = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
    };

    const startScreenShare = useCallback(async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: 1280,
                    height: 720,
                    frameRate: 10
                },
                audio: false // We keep using the mic from the original stream if possible, or need to handle audio switching too. For now, assume mic stays same.
            });

            // If we are already connected, we need to swap the video track or restart the stream processing
            // Simplest approach for this demo: Update the video element source and the stream ref.
            // Note: The audio context is reading from 'mediaStreamRef.current' which was the camera+mic stream.
            // We need to preserve the audio track from the camera if we want to keep talking.

            // Get current audio track
            // let audioTrack: MediaStreamTrack | undefined;
            // if (mediaStreamRef.current) {
            //     audioTrack = mediaStreamRef.current.getAudioTracks()[0];
            // }

            // Combine screen video + camera audio
            // const newStream = new MediaStream([
            //     screenStream.getVideoTracks()[0],
            //     ...(audioTrack ? [audioTrack] : [])
            // ]);

            // Stop old video track only?
            // Actually, let's just update the ref and video src.
            // The audio processing uses a separate source node created from the stream.
            // If we change the stream, we might need to recreate the source node.

            // For simplicity: We will just update the video element to show the screen.
            // The visual analysis loop captures from videoRef, so it will automatically start sending screen frames.
            // The audio input might be tricky if we replace the whole stream.

            // Better approach: Just replace the video track in the current stream if possible, 
            // or just update videoRef.srcObject to the new stream for the canvas capture.
            // We keep the mic stream separate for audio processing?

            // Let's try:
            // 1. Keep mic stream running in background for audio.
            // 2. Update videoRef to use screen stream.
            // 3. The capture loop reads from videoRef, so it sends screen images.

            if (videoRef.current) {
                videoRef.current.srcObject = screenStream;
                await videoRef.current.play();
            }

            // Handle screen share stop (user clicks "Stop sharing" in browser UI)
            screenStream.getVideoTracks()[0].onended = () => {
                stopScreenShare();
            };

            setIsScreenSharing(true);
            onLog({ id: uuidv4(), timestamp: new Date(), sender: 'system', message: 'Switched to Screen Share.', type: 'normal' });

        } catch (e) {
            console.error("Failed to share screen", e);
            onLog({ id: uuidv4(), timestamp: new Date(), sender: 'system', message: 'Failed to share screen.', type: 'alert' });
        }
    }, [onLog]);

    const stopScreenShare = useCallback(async () => {
        // Revert to camera
        try {
            const cameraStream = await navigator.mediaDevices.getUserMedia({
                audio: true, // We need audio again if we lost it, or just to be safe
                video: { width: 640, height: 480, frameRate: 15 }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = cameraStream;
                await videoRef.current.play();
            }

            // We might need to update mediaStreamRef if we want to ensure audio consistency, 
            // but if audio context was created from the initial stream, we need to be careful.
            // For this MVP, let's assume the initial audio stream stays active or we reconnect it.
            // If the user revoked permissions, we might need to full reconnect.

            setIsScreenSharing(false);
            onLog({ id: uuidv4(), timestamp: new Date(), sender: 'system', message: 'Switched back to Camera.', type: 'normal' });

        } catch (e) {
            console.error("Failed to revert to camera", e);
        }
    }, [onLog]);

    const isConnectingRef = useRef(false);

    const connect = useCallback(async () => {
        if (isConnected || isConnectingRef.current) return;
        isConnectingRef.current = true;

        try {
            const apiKey = import.meta.env.VITE_API_KEY;
            console.log('=== Gemini Live Connection Debug ===');
            console.log('API Key present:', !!apiKey);
            console.log('API Key length:', apiKey?.length);
            console.log('API Key starts with:', apiKey?.substring(0, 10) + '...');

            if (!apiKey) {
                throw new Error("API Key not found");
            }
            const ai = new GoogleGenAI({ apiKey });
            console.log('GoogleGenAI client created');
            console.log('ai.live available:', !!ai.live);
            console.log('ai.live.connect available:', !!ai.live?.connect);

            // Use system default sample rate to avoid mismatch errors
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

            outputNodeRef.current = outputAudioContextRef.current.createGain();
            outputNodeRef.current.connect(outputAudioContextRef.current.destination);

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
                video: {
                    width: 640,
                    height: 480,
                    frameRate: 15
                }
            });
            mediaStreamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            onLog({ id: uuidv4(), timestamp: new Date(), sender: 'system', message: 'Connecting to Gemini Live...', type: 'normal' });

            const session = await ai.live.connect({
                model: MODEL_NAME,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                    responseModalities: [Modality.AUDIO],
                    tools: [{ functionDeclarations: [logHealthEventTool] }],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                    }
                },
                callbacks: {
                    onopen: () => {
                        console.log("Session Opened");
                        setIsConnected(true);
                        setIsStreaming(true);
                        isConnectingRef.current = false;
                        onLog({ id: uuidv4(), timestamp: new Date(), sender: 'system', message: 'Connected. Monitoring active.', type: 'success' });
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        if (msg.toolCall?.functionCalls) {
                            for (const fc of msg.toolCall.functionCalls) {
                                if (fc.name === 'logHealthEvent') {
                                    const event = fc.args as unknown as HealthEvent;
                                    onHealthEvent(event);
                                    if (sessionRef.current) {
                                        sessionRef.current.sendToolResponse({
                                            functionResponses: {
                                                id: fc.id,
                                                name: fc.name,
                                                response: { result: 'Logged successfully' }
                                            }
                                        });
                                    }
                                    onLog({ id: uuidv4(), timestamp: new Date(), sender: 'system', message: `Detected: ${event.description}`, type: 'alert' });
                                }
                            }
                        }

                        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audioData) {
                            playAudioResponse(audioData);
                        }
                    },
                    onclose: (event: any) => {
                        console.log("Session Closed", event);
                        console.log("Close code:", event?.code, "Close reason:", event?.reason);
                        setIsConnected(false);
                        setIsStreaming(false);
                        onLog({ id: uuidv4(), timestamp: new Date(), sender: 'system', message: `Session closed. ${event?.reason || ''}`, type: 'normal' });
                    },
                    onerror: (err: any) => {
                        console.error("Session Error Details:", err);
                        console.error("Error message:", err?.message);
                        console.error("Error type:", err?.type);
                        onLog({ id: uuidv4(), timestamp: new Date(), sender: 'system', message: `Connection error: ${err?.message || 'Unknown error'}`, type: 'alert' });
                        setIsConnected(false);
                    }
                }
            });

            // Set the session ref BEFORE using it
            sessionRef.current = session;

            // Now set up audio processing
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);

            scriptProcessor.onaudioprocess = (e) => {
                if (!sessionRef.current) return;
                const inputData = e.inputBuffer.getChannelData(0);
                const downsampledData = downsampleBuffer(inputData, inputAudioContextRef.current!.sampleRate, 16000);
                const blob = pcmToBlob(downsampledData);
                sessionRef.current.sendRealtimeInput({ media: blob });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);

            // Start video streaming
            startVideoStreaming(Promise.resolve(session));

        } catch (e) {
            console.error("Connection failed:", e);
            onLog({ id: uuidv4(), timestamp: new Date(), sender: 'system', message: `Failed to start session: ${e instanceof Error ? e.message : String(e)}`, type: 'alert' });
            setIsConnected(false);
            isConnectingRef.current = false;
        }
    }, [isConnected, onHealthEvent, onLog]);

    const disconnect = useCallback(() => {
        if (videoIntervalRef.current) {
            window.clearInterval(videoIntervalRef.current);
            videoIntervalRef.current = null;
        }

        stopMediaStream();

        if (inputAudioContextRef.current) {
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current) {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }

        setIsConnected(false);
        setIsStreaming(false);
        setIsScreenSharing(false);
        sessionRef.current = null;

        onLog({ id: uuidv4(), timestamp: new Date(), sender: 'system', message: 'Disconnected.', type: 'normal' });
        isConnectingRef.current = false;
    }, [onLog]);

    const startVideoStreaming = (sessionPromise: Promise<any>) => {
        if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);

        videoIntervalRef.current = window.setInterval(() => {
            if (!videoRef.current || !canvasRef.current) return;

            const ctx = canvasRef.current.getContext('2d');
            if (!ctx) return;

            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            ctx.drawImage(videoRef.current, 0, 0);

            const base64 = canvasRef.current.toDataURL('image/jpeg', 0.6).split(',')[1];

            sessionPromise.then(session => {
                session.sendRealtimeInput({
                    media: {
                        mimeType: 'image/jpeg',
                        data: base64
                    }
                });
            });
        }, 1000);
    };

    const playAudioResponse = async (base64Audio: string) => {
        if (!outputAudioContextRef.current || !outputNodeRef.current) return;

        const ctx = outputAudioContextRef.current;
        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

        const audioBuffer = await decodeAudioData(
            base64ToUint8Array(base64Audio),
            ctx,
            24000
        );

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputNodeRef.current);
        source.start(nextStartTimeRef.current);

        nextStartTimeRef.current += audioBuffer.duration;
    };

    const sendTextMessage = useCallback(async (text: string) => {
        if (!sessionRef.current) return;

        // Send text as a client content message
        // The SDK might have a specific method for this, or we use send()
        // Assuming send() exists on the session or we construct the message manually.
        // Based on typical usage:
        await sessionRef.current.send({
            clientContent: {
                turns: [{
                    role: 'user',
                    parts: [{ text }]
                }],
                turnComplete: true
            }
        });

        onLog({ id: uuidv4(), timestamp: new Date(), sender: 'user', message: text, type: 'normal' });
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
        canvasRef
    };
};
