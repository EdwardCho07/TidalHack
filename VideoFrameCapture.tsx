
import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { VideoOff, Camera } from 'lucide-react';

export interface VideoFrameCaptureHandle {
  captureFrame: () => string | null;
}

type PermissionState = 'idle' | 'requesting' | 'granted' | 'denied';

const VideoFrameCapture = forwardRef<VideoFrameCaptureHandle>((props, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      setPermissionState('requesting');
      setError(null);
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              setPermissionState('granted');
            };
          }
        } else {
          setError("Your browser does not support camera access.");
          setPermissionState('denied');
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        let errorMessage = "Could not access the camera. Please ensure it is not in use by another application.";
        if (err instanceof Error && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
          errorMessage = "Camera access denied. Please enable camera permissions for this site in your browser settings.";
        }
        setError(errorMessage);
        setPermissionState('denied');
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    captureFrame: () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && permissionState === 'granted') {
        const context = canvas.getContext('2d');
        if (context) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          return canvas.toDataURL('image/jpeg', 0.9);
        }
      }
      return null;
    },
  }), [permissionState]);

  return (
    <>
      {(permissionState === 'idle' || permissionState === 'requesting') && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black/50 text-indigo-200 p-4">
          <Camera className="w-12 h-12 mb-4 animate-pulse" />
          <p className="font-semibold">Requesting Camera Access</p>
          <p className="text-center text-sm">Please allow camera permission in the browser prompt.</p>
        </div>
      )}

      {permissionState === 'denied' && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black/50 text-red-300 p-4">
          <VideoOff className="w-12 h-12 mb-4" />
          <p className="font-semibold">Camera Error</p>
          <p className="text-center text-sm">{error}</p>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${permissionState !== 'granted' ? 'hidden' : ''}`}
      />
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
});

export default VideoFrameCapture;
