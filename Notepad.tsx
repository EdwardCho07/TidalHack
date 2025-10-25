
import React from 'react';
import { Trash2 } from 'lucide-react';

interface NotepadProps {
  items: string[];
  onClear: () => void;
}

const Notepad: React.FC<NotepadProps> = ({ items, onClear }) => {
  return (
    <div className="bg-yellow-50 text-gray-800 rounded-lg shadow-lg p-6 font-serif w-full max-w-md mx-auto relative">
      <div className="absolute top-0 left-0 w-full h-12 bg-transparent border-b-2 border-red-400"></div>
      <div className="flex justify-between items-center mb-4 pt-6">
        <h3 className="text-2xl font-bold text-gray-700">My Grocery List</h3>
        {items.length > 0 && (
          <button 
            onClick={onClear}
            className="text-gray-500 hover:text-red-600 transition-colors"
            aria-label="Clear list"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
      <ul className="space-y-2">
        {items.length > 0 ? (
          items.map((item, index) => (
            <li key={index} className="border-b border-blue-200/50 py-2 text-lg capitalize flex items-center">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white border-2 border-gray-300 mr-3"></span>
              {item}
            </li>
          ))
        ) : (
          <p className="text-gray-500 py-8 text-center">Your list is empty. Speak into the mic to add items!</p>
        )}
      </ul>
    </div>
  );
};

export default Notepad;
