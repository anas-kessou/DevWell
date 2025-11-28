import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, AlertCircle, Loader, Settings } from 'lucide-react';
import { useDetectFatigue } from '../hooks';
import { TeachableMachineModel, mapPredictionToFatigueLevel } from '../lib/teachableMachine';
import type { FatigueLevel } from '../types';

interface CameraMonitorProps {
  onFatigueDetected?: (level: FatigueLevel, confidence: number) => void;
}

// Default Teachable Machine model URL
// To use your own model:
// 1. Go to https://teachablemachine.withgoogle.com/
// 2. Create an "Image Project"
// 3. Train classes like: "Awake/Focused", "Tired", "Drowsy/Alert"
// 4. Export the model and get the shareable link
// 5. Set VITE_TM_MODEL_URL in .env or paste it below
const DEFAULT_MODEL_URL = import.meta.env.VITE_TM_MODEL_URL || '';

/**
 * CameraMonitor Component
 * 
 * Features:
 * - Real-time webcam fatigue detection using Teachable Machine
 * - TanStack Query mutation for logging detections
 * - Optimistic updates for instant feedback
 * - Model URL configuration via settings panel
 * - Automatic logging when confidence > 60%
 */
export default function CameraMonitor({ onFatigueDetected }: CameraMonitorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState('');
  const [currentState, setCurrentState] = useState<FatigueLevel>('rested');
  const [confidence, setConfidence] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelURL, setModelURL] = useState(DEFAULT_MODEL_URL);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const modelRef = useRef<TeachableMachineModel | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  
  // TanStack Query mutation for fatigue detection
  const detectFatigueMutation = useDetectFatigue();

  // Load Teachable Machine model
  const loadModel = async () => {
    if (!modelURL || !modelURL.trim()) {
      setError('Please enter a valid Teachable Machine model URL');
      return;
    }

    setIsLoadingModel(true);
    setError('');

    try {
      const model = new TeachableMachineModel(modelURL);
      await model.load();
      modelRef.current = model;
      setModelLoaded(true);
      setError('');
      setShowSettings(false);
    } catch (err) {
      setError('Failed to load AI model. Please check the model URL.');
      console.error('Model loading error:', err);
      setModelLoaded(false);
    } finally {
      setIsLoadingModel(false);
    }
  };

  // Start camera stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user' 
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
        setError('');

        // Start predictions if model is loaded
        if (modelLoaded && modelRef.current) {
          startPrediction();
        }
      }
    } catch (err) {
      setError('Unable to access camera. Please grant camera permissions.');
      console.error('Camera error:', err);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    setCurrentState('rested');
    setConfidence(0);
  };

  // Start making predictions
  const startPrediction = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(async () => {
      if (videoRef.current && modelRef.current && videoRef.current.readyState === 4) {
        try {
          // Make prediction
          const prediction = await modelRef.current.predictTop(videoRef.current);
          
          // Map to fatigue level
          const { level, confidence: conf } = mapPredictionToFatigueLevel(prediction);
          const confidencePercent = Math.round(conf * 100);
          
          setConfidence(confidencePercent);
          setCurrentState(level);

          // Log fatigue events (tired or alert) using TanStack Query mutation
          if ((level === 'tired' || level === 'alert') && confidencePercent > 60) {
            try {
              // Use mutation for automatic cache invalidation
              detectFatigueMutation.mutate({
                status: level,
                confidence: conf,
                capturedAt: new Date().toISOString(),
              });

              if (onFatigueDetected) {
                onFatigueDetected(level, confidencePercent);
              }
            } catch (err) {
              console.error('Error logging fatigue:', err);
            }
          }
        } catch (err) {
          console.error('Prediction error:', err);
        }
      }
    }, 3000); // Predict every 3 seconds
  };

  // Toggle camera
  const toggleCamera = () => {
    if (isActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (modelRef.current) {
        modelRef.current.dispose();
      }
    };
  }, []);

  // Helper functions for UI
  const getStateColor = () => {
    switch (currentState) {
      case 'alert': return 'bg-red-100 text-red-700 border-red-300';
      case 'tired': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'rested': return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  const getStateText = () => {
    switch (currentState) {
      case 'alert': return 'High Fatigue Detected!';
      case 'tired': return 'Fatigue Detected';
      case 'rested': return 'You\'re Well Rested';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Camera Monitor</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Model Settings"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Model Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Teachable Machine Model</h3>
          <p className="text-sm text-gray-600 mb-3">
            Enter your Teachable Machine model URL from{' '}
            <a 
              href="https://teachablemachine.withgoogle.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              teachablemachine.withgoogle.com
            </a>
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={modelURL}
              onChange={(e) => setModelURL(e.target.value)}
              placeholder="https://teachablemachine.withgoogle.com/models/YOUR_MODEL/"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={loadModel}
              disabled={isLoadingModel || !modelURL}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm font-medium"
            >
              {isLoadingModel ? 'Loading...' : 'Load Model'}
            </button>
          </div>
          {modelLoaded && (
            <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              Model loaded successfully
            </p>
          )}
        </div>
      )}

      {/* Video Display */}
      <div className="relative mb-4 bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="text-center text-white">
              <CameraOff className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Camera is off</p>
            </div>
          </div>
        )}

        {isLoadingModel && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
            <div className="text-center text-white">
              <Loader className="w-12 h-12 mx-auto mb-2 animate-spin" />
              <p className="text-sm">Loading AI model...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={toggleCamera}
          disabled={!modelLoaded || isLoadingModel}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
            isActive
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed'
          }`}
        >
          {isActive ? (
            <>
              <CameraOff className="w-5 h-5" />
              Stop Camera
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              Start Camera
            </>
          )}
        </button>
      </div>

      {/* Status Display */}
      {isActive && modelLoaded && (
        <div className={`p-4 rounded-lg border-2 ${getStateColor()}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-lg">{getStateText()}</span>
            <span className="text-sm font-semibold">{confidence}%</span>
          </div>
          <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${confidence}%`,
                backgroundColor: currentState === 'alert' ? '#ef4444' : currentState === 'tired' ? '#f97316' : '#22c55e'
              }}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Info Message */}
      {!modelLoaded && !isLoadingModel && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Setup Required:</strong> Click the settings icon to configure your Teachable Machine model URL.
          </p>
        </div>
      )}
    </div>
  );
}
