import React, { useState } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';

interface Props {
  isLoading: boolean;
  error: string | null;
  onSubmit: (problem: string, action: string) => void;
}

const CompressionForm: React.FC<Props> = ({ isLoading, error, onSubmit }) => {
  const [problem, setProblem] = useState('');
  const [action, setAction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (problem.trim() && action.trim()) {
      onSubmit(problem, action);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto justify-center p-6 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150">
      
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif text-sage-900 mb-3">Compress & Clarify</h2>
        <p className="text-sage-600">Reduce the noise to a single problem and a single step.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Problem Input */}
        <div className="space-y-3">
            <label className="block text-sm font-semibold text-sage-700 uppercase tracking-wider">
                One Real Problem
            </label>
            <input 
                type="text" 
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="What is the actual core issue?"
                className="w-full px-4 py-4 text-lg bg-white border border-primary-200 rounded-xl focus:ring-2 focus:ring-sage-400 focus:border-transparent outline-none transition-all placeholder:text-primary-300"
                maxLength={255}
                autoFocus
            />
        </div>

        {/* Action Input */}
        <div className="space-y-3">
             <label className="block text-sm font-semibold text-sage-700 uppercase tracking-wider flex justify-between">
                <span>One Next Action</span>
                <span className="text-xs font-normal text-sage-500 normal-case">Must be concrete & executable</span>
            </label>
            <input 
                type="text" 
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="e.g., 'Call mom', 'Email boss', 'Update resume'"
                className={`w-full px-4 py-4 text-lg bg-white border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all placeholder:text-primary-300 ${
                    error ? 'border-red-300 focus:ring-red-200' : 'border-primary-200 focus:ring-sage-400'
                }`}
                maxLength={255}
            />
            {error && (
                <div className="flex items-start gap-2 text-red-600 text-sm mt-2 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>

        <button
            type="submit"
            disabled={!problem.trim() || !action.trim() || isLoading}
            className="w-full flex items-center justify-center px-8 py-4 bg-sage-700 text-white rounded-xl font-medium hover:bg-sage-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-8"
        >
            {isLoading ? 'Processing...' : (
                <>
                    Convert to Action
                    <ArrowRight className="ml-2 w-5 h-5" />
                </>
            )}
        </button>

      </form>
    </div>
  );
};

export default CompressionForm;
