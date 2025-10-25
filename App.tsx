
import React, { useState, useCallback, useEffect } from 'react';
import { Wand2, ShoppingCart, Camera, Video } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import Spinner from './components/Spinner';
import ErrorAlert from './components/ErrorAlert';
import { analyzeImage } from './services/geminiService';
import { fileToGenerativePart } from './utils/imageUtils';
import GroceryList from './components/GroceryList';
import VideoAnalyzer from './components/VideoAnalyzer';

type Tab = 'image' | 'list' | 'video';

const ImageAnalyzer: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setResult(null);
    setError(null);
  };

  const handleClearImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = useCallback(async () => {
    if (!imageFile || isLoading) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const imagePart = await fileToGenerativePart(imageFile);
      const prompt = "Analyze the provided image. Your primary goal is to identify the main object. Ignore the background and any human interaction with the object, like hands holding it. Provide a very concise description of only the main object itself. Do not include phrases like 'a hand holding'. If there is any visible branding or label on the object, identify the main brand name from the label and include it in the description (e.g., for a can of Coca-Cola, describe it as 'a can of Coca-Cola'; for a jar of 'Bonne Maman Strawberry Preserves', describe it as 'a jar of Bonne Maman jam'). If the image is primarily text, transcribe the text verbatim. Your response should only be the object description or the transcription.";
      
      const analysisResult = await analyzeImage(imagePart, prompt);
      setResult(analysisResult);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, isLoading]);

  return (
    <>
      <ImageUploader
        onImageSelect={handleImageSelect}
        previewUrl={previewUrl}
        onClear={handleClearImage}
        isProcessing={isLoading}
      />

      <div className="mt-6 text-center">
        <button
          onClick={handleAnalyze}
          disabled={!imageFile || isLoading}
          className="inline-flex items-center justify-center px-8 py-3 font-semibold text-white bg-fuchsia-600 rounded-lg shadow-lg hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-fuchsia-500 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-70"
          aria-label="Analyze image"
        >
          {isLoading ? (
            <>
              <Spinner />
              Analyzing...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              Analyze Image
            </>
          )}
        </button>
      </div>

      <div className="mt-8">
        {error && <ErrorAlert message={error} />}
        {result && <ResultDisplay result={result} autoPlay={true} />}
        {!isLoading && !result && !error && (
             <div className="text-center text-indigo-300/70 p-4 border-2 border-dashed border-indigo-400/30 rounded-lg">
                Your analysis result will appear here.
             </div>
        )}
      </div>
    </>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('image');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-gray-200 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500 mb-3">Anne Eye</h1>
          <p className="text-lg text-indigo-200">Your friendly shopping assistant.</p>
        </header>

        <main className="bg-black/30 rounded-2xl shadow-2xl shadow-purple-900/40 p-6 sm:p-8 border border-white/10 backdrop-blur-lg">
          <div className="mb-6 border-b border-white/10">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('image')}
                className={`${
                  activeTab === 'image'
                    ? 'border-fuchsia-400 text-fuchsia-300'
                    : 'border-transparent text-indigo-300 hover:text-white hover:border-gray-300'
                } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                <Camera className="mr-2 h-5 w-5" />
                Image Analyzer
              </button>
              <button
                onClick={() => setActiveTab('video')}
                className={`${
                  activeTab === 'video'
                    ? 'border-fuchsia-400 text-fuchsia-300'
                    : 'border-transparent text-indigo-300 hover:text-white hover:border-gray-300'
                } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                <Video className="mr-2 h-5 w-5" />
                Video Analyzer
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`${
                  activeTab === 'list'
                    ? 'border-fuchsia-400 text-fuchsia-300'
                    : 'border-transparent text-indigo-300 hover:text-white hover:border-gray-300'
                } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Grocery List
              </button>
            </nav>
          </div>
          
          {activeTab === 'image' && <ImageAnalyzer />}
          {activeTab === 'video' && <VideoAnalyzer />}
          {activeTab === 'list' && <GroceryList />}

        </main>
        <footer className="text-center mt-8 text-indigo-300/60 text-sm">
            <p>Powered by Google Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
