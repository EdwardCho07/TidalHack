
import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Copy, Check } from 'lucide-react';

interface ResultDisplayProps {
  result: string;
  autoPlay?: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, autoPlay = false }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load available voices from the browser
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(result).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [result]);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window) || !text) {
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    const femaleVoice = 
      voices.find(voice => voice.lang.startsWith('en') && voice.name.includes('Google') && voice.name.includes('Female')) ||
      voices.find(voice => voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female') && !voice.localService) ||
      voices.find(voice => voice.lang.startsWith('en') && ['Zira', 'Samantha', 'Victoria', 'Susan'].some(name => voice.name.includes(name))) ||
      voices.find(voice => voice.lang.startsWith('en') && voice.name.includes('Google')) ||
      voices.find(voice => voice.lang.startsWith('en') && !voice.localService) ||
      voices.find(voice => voice.lang === 'en-US' && voice.default) ||
      voices.find(voice => voice.lang.startsWith('en'));

    if (femaleVoice) {
      utterance.voice = femaleVoice;
      utterance.pitch = 1;
      utterance.rate = 0.95;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      setIsSpeaking(false);
      console.error("An error occurred during speech synthesis:", e);
    };
    
    window.speechSynthesis.cancel(); // Cancel previous before speaking
    window.speechSynthesis.speak(utterance);
  }, [voices]);

  const handleToggleSpeak = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      speak(result);
    }
  }, [isSpeaking, result, speak]);

  // Autoplay effect
  useEffect(() => {
    // Only run if autoPlay is true, there's a result, and voices are loaded.
    if (autoPlay && result && voices.length > 0) {
      speak(result);
    }
  }, [result, autoPlay, voices, speak]);

  return (
    <div className="bg-black/20 p-6 rounded-lg border border-white/10 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-fuchsia-400">Analysis Result</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleSpeak}
            className="p-2 rounded-full text-indigo-300 hover:bg-white/10 hover:text-fuchsia-400 transition-colors duration-200"
            aria-label={isSpeaking ? 'Stop speaking' : 'Read text aloud'}
          >
            {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            onClick={handleCopy}
            className="p-2 rounded-full text-indigo-300 hover:bg-white/10 hover:text-fuchsia-400 transition-colors duration-200"
            aria-label="Copy text to clipboard"
          >
            {isCopied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
        {result}
      </p>
    </div>
  );
};

export default ResultDisplay;
