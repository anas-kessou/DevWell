import React, { useEffect, useRef } from 'react';
import { CameraOff, Activity, Monitor } from 'lucide-react';

interface CameraMonitorProps {
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  isStreaming?: boolean;
  isScreenSharing?: boolean;
  cameraStream?: MediaStream | null;
}

const CameraMonitor: React.FC<CameraMonitorProps> = ({
  videoRef,
  isStreaming = false,
  isScreenSharing = false,
  cameraStream
}) => {
  const pipVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isScreenSharing && cameraStream && pipVideoRef.current) {
      pipVideoRef.current.srcObject = cameraStream;
    }
  }, [isScreenSharing, cameraStream]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800 group">
      {/* Video Element (Main) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-opacity duration-500 ${isStreaming ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* PiP Camera (Only when screen sharing) */}
      {isScreenSharing && isStreaming && (
        <div className="absolute bottom-4 right-4 w-48 aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-2xl border border-gray-700 z-20 transition-all hover:scale-105">
          <video
            ref={pipVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full shadow-lg"></div>
        </div>
      )}

      {/* Fallback */}
      {!isStreaming && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-900/90 backdrop-blur-sm">
          <div className="p-4 rounded-full bg-gray-800 mb-4 animate-pulse">
            <CameraOff size={48} />
          </div>
          <p className="text-lg font-medium">Camera Offline</p>
          <p className="text-sm">Start session to enable fatigue detection</p>
        </div>
      )}

      {/* Overlays */}
      {isStreaming && (
        <>
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 backdrop-blur-md px-3 py-1.5 rounded-full text-red-500 text-xs font-bold uppercase tracking-wider animate-pulse shadow-lg shadow-red-500/10">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
            Live
          </div>

          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs border border-white/10 shadow-lg">
            {isScreenSharing ? (
              <>
                <Monitor size={14} className="text-blue-400" />
                <span>Screen Share Active</span>
              </>
            ) : (
              <>
                <Activity size={14} className="text-green-400" />
                <span>Fatigue Analysis Active</span>
              </>
            )}
          </div>

          {/* Grid Overlay for "Tech" feel */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>
          
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/30 transition-colors duration-300 pointer-events-none rounded-xl" />
        </>
      )}
    </div>
  );
};

export default CameraMonitor;
