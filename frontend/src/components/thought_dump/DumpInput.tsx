import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface Props {
  onComplete: (text: string) => void;
}

const DumpInput: React.FC<Props> = ({ onComplete }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim().length > 0) {
      onComplete(text);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] items-center justify-center animate-in fade-in duration-500">
        <h2 className="text-2xl md:text-3xl font-serif text-sage-900 mb-8 text-center tracking-tight">
            Dump your thoughts. <br />
            <span className="text-sage-500 text-lg font-sans font-normal mt-2 block">Clear your mind. No formatting, just raw text.</span>
        </h2>
        
        <div className="w-full max-w-2xl relative">
            <textarea
                className="w-full h-80 p-6 text-lg bg-white border border-primary-200 rounded-2xl shadow-sm resize-none focus:ring-2 focus:ring-sage-400 focus:border-transparent outline-none transition-all placeholder:text-primary-300 text-primary-800 leading-relaxed custom-scrollbar"
                placeholder="Start typing here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
                spellCheck={false}
            />
             <div className="absolute bottom-4 right-4 text-xs text-primary-400 font-medium">
                {text.length} chars
            </div>
        </div>

        <div className="mt-8">
            <button
                onClick={handleSubmit}
                disabled={!text.trim()}
                className="group flex items-center px-8 py-3 bg-sage-700 text-white rounded-xl font-medium hover:bg-sage-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
                Done Dumping
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    </div>
  );
};

export default DumpInput;
