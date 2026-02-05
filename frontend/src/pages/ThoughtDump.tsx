import { useState } from 'react';
import { CheckCircle, History } from 'lucide-react';
import DumpInput from '../components/thought_dump/DumpInput';
import CompressionForm from '../components/thought_dump/CompressionForm';
import ArchiveList from '../components/thought_dump/ArchiveList';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

const ThoughtDump = () => {
  const [step, setStep] = useState<'dump' | 'compress' | 'success' | 'archive'>('dump');
  const [dumpText, setDumpText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDumpComplete = (text: string) => {
    setDumpText(text);
    setStep('compress');
  };

  const handleCompressionSubmit = async (problem: string, action: string) => {
    setIsLoading(true);
    setError(null);
    
    if (!auth.currentUser) {
        setError("You must be logged in.");
        setIsLoading(false);
        return;
    }

    try {
        await addDoc(collection(db, 'thought_dumps'), {
            userId: auth.currentUser.uid,
            dump_text: dumpText,
            problem_text: problem,
            action_text: action,
            created_at: serverTimestamp()
        });
        
        setStep('success');
        // Optional: Redirect after a delay or show success screen
        setTimeout(() => {
            navigate('/dashboard'); // Or somewhere else
        }, 2000);

    } catch (err) {
        console.error("Error saving thought dump:", err);
        setError('Network error. Please check your connection.');
    } finally {
        setIsLoading(false);
    }
  };

  if (step === 'success') {
      return (
          <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-serif text-sage-900 mb-2">Action Saved</h2>
              <p className="text-sage-500 mb-8">Your thought dump has been archived.</p>
              <button 
                onClick={() => setStep('dump')}
                className="px-6 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
              >
                  New Dump
              </button>
          </div>
      );
  }

  if (step === 'archive') {
      return <ArchiveList onBack={() => setStep('dump')} />;
  }

  return (
    <div className="min-h-full relative">
      {step === 'dump' && (
        <>
            <div className="absolute top-4 right-4 z-10">
                <button 
                    onClick={() => setStep('archive')}
                    className="flex items-center text-sage-600 hover:text-sage-800 bg-white/50 px-4 py-2 rounded-lg hover:bg-white transition-all text-sm font-medium"
                >
                    <History className="w-4 h-4 mr-2" />
                    Archives
                </button>
            </div>
            <DumpInput onComplete={handleDumpComplete} />
        </>
      )}
      
      {step === 'compress' && (
        <CompressionForm 
            isLoading={isLoading} 
            error={error} 
            onSubmit={handleCompressionSubmit} 
        />
      )}
    </div>
  );
};

export default ThoughtDump;
