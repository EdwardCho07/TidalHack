
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';
import { cleanGroceryList } from '../services/geminiService';
import Notepad from './Notepad';
import ErrorAlert from './ErrorAlert';

// Handle browser compatibility for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechSupported = !!SpeechRecognition;

// Define a type for the speech recognition error event for better TS support
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported';
  readonly message: string;
}

const GroceryList: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [listItems, setListItems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!isSpeechSupported) {
      setError("Speech recognition is not supported by your browser. Please try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(prev => prev + finalTranscript);
    };

    recognition.onerror = (event: Event) => {
      const typedEvent = event as SpeechRecognitionErrorEvent;
      let errorMessage = `An unknown speech recognition error occurred: ${typedEvent.error}`;
      
      // Don't show an error for 'aborted' as it can be a normal way to stop.
      if (typedEvent.error === 'aborted') {
        setIsListening(false);
        return;
      }

      switch (typedEvent.error) {
        case 'not-allowed':
          errorMessage = "Microphone access denied. To use this feature, please enable microphone permissions for this site in your browser's settings.";
          break;
        case 'no-speech':
          errorMessage = "No speech was detected. Please make sure your microphone is working and try again.";
          break;
        case 'audio-capture':
          errorMessage = "There was a problem with your microphone. Please check your hardware and system settings.";
          break;
        case 'network':
          errorMessage = "A network error occurred during speech recognition. Please check your internet connection.";
          break;
        case 'service-not-allowed':
          errorMessage = "Speech recognition service is not allowed by your browser or system. Please check your settings.";
          break;
        default:
          break;
      }
      setError(errorMessage);
      setIsListening(false);
    };

    recognition.onend = () => {
      // This is called when recognition.stop() is called or on some errors.
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const processTranscript = useCallback(async () => {
    if (!transcript.trim()) return;

    setIsProcessing(true);
    setError(null);
    try {
      const cleanedItems = await cleanGroceryList(transcript);
      setListItems(prevItems => [...prevItems, ...cleanedItems]);
      setTranscript(''); // Clear transcript after processing
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError("An unknown error occurred while processing the list.");
    } finally {
      setIsProcessing(false);
    }
  }, [transcript]);

  // Process transcript when listening stops
  useEffect(() => {
    if (!isListening && transcript) {
      processTranscript();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  const handleToggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setError(null);
      setTranscript(''); // Clear previous transcript before starting a new session
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleClearList = () => {
    setListItems([]);
    setTranscript('');
    setError(null);
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-center text-indigo-200 mb-6">
        {isListening ? "Listening... Tap the mic to finish." : "Tap the mic and speak your grocery list."}
      </p>
      <button
        onClick={handleToggleListening}
        disabled={!isSpeechSupported || isProcessing}
        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
          ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-fuchsia-600 hover:bg-fuchsia-700'}
          disabled:bg-gray-500 disabled:cursor-not-allowed`}
        aria-label={isListening ? 'Stop listening' : 'Start listening'}
      >
        {isListening && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
        {isProcessing ? <Loader className="w-10 h-10 text-white animate-spin" /> : (isListening ? <MicOff className="w-10 h-10 text-white" /> : <Mic className="w-10 h-10 text-white" />)}
      </button>
      
      <div className="w-full mt-8">
        {error && <div className="mb-4"><ErrorAlert message={error} /></div>}
        <Notepad items={listItems} onClear={handleClearList} />
      </div>
    </div>
  );
};

export default GroceryList;
