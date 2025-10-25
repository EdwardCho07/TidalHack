
import React, { useState, useRef, useCallback } from 'react';
import { Camera, Wand2 } from 'lucide-react';
import VideoFrameCapture, { VideoFrameCaptureHandle } from './VideoFrameCapture';
import Spinner from './Spinner';
import ErrorAlert from './ErrorAlert';
import ResultDisplay from './ResultDisplay';
import { analyzeImage } from '../services/geminiService';
import { dataUrlToGenerativePart } from '../utils/imageUtils';

const VideoAnalyzer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);
  const videoCaptureRef = useRef<VideoFrameCaptureHandle>(null);

  const handleAnalyzeFrame = useCallback(async () => {
    if (!videoCaptureRef.current) return;

    const frameDataUrl = videoCaptureRef.current.captureFrame();
    if (!frameDataUrl) {
      setError("Could not capture frame from video.");
      return;
    }
    
    setCapturedFrame(frameDataUrl);
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const imagePart = dataUrlToGenerativePart(frameDataUrl);
      const prompt = "Analyze this video frame. Your primary goal is to identify the main object(s). Ignore the background and any human interaction with the object, like hands holding it. Provide a very concise description of only the main object(s) itself. Do not include phrases like 'a hand holding'. If there is any visible branding or label on an object, identify the main brand name from the label and include it in the description (e.g., for a can of Coca-Cola, describe it as 'a can of Coca-Cola'). If the frame is primarily text, transcribe the text verbatim. Your response should only be the object description or the transcription.";
      
      const analysisResult = await analyzeImage(imagePart, prompt);
      setResult(analysisResult);
    // Fix: Corrected syntax for the catch block
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred during analysis.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full aspect-video bg-black/20 rounded-lg overflow-hidden border-2 border-white/10 mb-6 relative">
        <VideoFrameCapture ref={videoCaptureRef} />
        {capturedFrame && (
          <div className="absolute bottom-4 right-4 w-1/4 aspect-video border-2 border-fuchsia-400 rounded-md overflow-hidden shadow-lg">
            <img src={capturedFrame} alt="Captured frame" className="w-full h-full object-cover" />
            <div className="absolute top-0 left-0 w-full bg-black/50 text-white text-xs text-center py-0.5">Last Capture</div>
          </div>
        )}
      </div>

      <button
        onClick={handleAnalyzeFrame}
        disabled={isLoading}
        className="inline-flex items-center justify-center px-8 py-3 font-semibold text-white bg-fuchsia-600 rounded-lg shadow-lg hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-fuchsia-500 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-70"
        aria-label="Analyze video frame"
      >
        {isLoading ? (
          <>
            <Spinner />
            Analyzing...
          </>
        ) : (
          <>
            <Camera className="w-5 h-5 mr-2" />
            Analyze Frame
          </>
        )}
      </button>

      <div className="w-full mt-8">
        {error && <ErrorAlert message={error} />}
        {result && <ResultDisplay result={result} autoPlay={true} />}
        {!isLoading && !result && !error && (
             <div className="text-center text-indigo-300/70 p-4 border-2 border-dashed border-indigo-400/30 rounded-lg">
                Your analysis result will appear here.
             </div>
        )}
      </div>
    </div>
  );
};

export default VideoAnalyzer;
