
import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud, FileImage, X } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  previewUrl: string | null;
  onClear: () => void;
  isProcessing: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, previewUrl, onClear, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event.target.files[0]);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelect(e.dataTransfer.files[0]);
    }
  };

  if (previewUrl) {
    return (
      <div className="relative group w-full aspect-video bg-black/20 rounded-lg overflow-hidden border-2 border-white/10">
        <img src={previewUrl} alt="Image preview" className="w-full h-full object-contain" />
        <button
          onClick={onClear}
          disabled={isProcessing}
          className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-500/80 disabled:cursor-not-allowed"
          aria-label="Clear image"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <label
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${
        isDragging ? 'border-fuchsia-400 bg-fuchsia-900/20' : 'border-indigo-400/40 hover:border-fuchsia-400/80 hover:bg-black/20'
      }`}
      htmlFor="file-upload"
      aria-label="Image upload area"
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-indigo-300">
        <UploadCloud className={`w-10 h-10 mb-3 transition-transform duration-300 ${isDragging ? 'scale-110 text-fuchsia-300' : ''}`} />
        <p className="mb-2 text-sm font-semibold">
          <span className="text-fuchsia-400">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs">PNG, JPG, GIF, or WEBP</p>
      </div>
      <input
        id="file-upload"
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/gif, image/webp"
        disabled={isProcessing}
      />
    </label>
  );
};

export default ImageUploader;
