import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Clock, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE_URL = 'https://chandril.pythonanywhere.com/api';

interface InsightsData {
  has_enough_data: boolean;
  message?: string;
  summary_text?: string;
  top_keywords?: string[];
  dominant_time?: string;
  entry_count?: number;
}

export default function WeeklyReflection() {
  const navigate = useNavigate();
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/insights/weekly/`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        setError('Failed to load insights.');
      }
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
     return (
        <div className="flex items-center justify-center min-h-screen bg-paper">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600"></div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-paper p-6 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-sage-100 overflow-hidden relative"
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-sage-50 to-transparent pointer-events-none" />
        
        <div className="relative p-8 md:p-12">
            <div className="flex justify-between items-center mb-8">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="group flex items-center gap-2 text-sage-500 hover:text-sage-800 transition-colors"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Close</span>
                </button>
                <div className="flex items-center gap-2 text-sage-600 bg-sage-50 px-3 py-1 rounded-full text-sm font-medium">
                    <Sparkles size={16} />
                    Weekly Reflection
                </div>
            </div>

            {error ? (
                 <div className="text-center py-12">
                    <p className="text-red-500">{error}</p>
                 </div>
            ) : !data?.has_enough_data ? (
                <div className="text-center py-12">
                    <h2 className="text-2xl font-serif font-bold text-sage-900 mb-4">Not enough data yet</h2>
                    <p className="text-sage-600 max-w-md mx-auto mb-6">
                        {data?.message || "Write a few more entries in your 'Weekly Summary' enabled notebooks to see insights here."}
                    </p>
                    <button 
                        onClick={() => navigate('/write')}
                        className="btn-primary"
                    >
                        Write an Entry
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Main Summary Card */}
                    <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-sage-900 mb-6 leading-tight">
                            Your Week in Words
                        </h2>
                        <div className="bg-gradient-to-br from-sage-50 to-indigo-50/50 p-6 rounded-2xl border border-sage-100 shadow-sm">
                            <p className="text-lg md:text-xl text-sage-800 leading-relaxed italic font-serif">
                                "{data.summary_text}"
                            </p>
                        </div>
                    </div>

                    {/* Subtle Insights Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Time Insight */}
                        <div className="p-4 rounded-xl bg-white border border-sage-100 flex items-center gap-4 shadow-sm">
                             <div className="bg-amber-50 p-3 rounded-full text-amber-600">
                                <Clock size={24} />
                             </div>
                             <div>
                                 <p className="text-xs font-semibold text-sage-400 uppercase tracking-wider">Most Active</p>
                                 <p className="text-sage-900 font-medium capitalize">{data.dominant_time}</p>
                             </div>
                        </div>

                         {/* Volume Insight */}
                        <div className="p-4 rounded-xl bg-white border border-sage-100 flex items-center gap-4 shadow-sm">
                             <div className="bg-indigo-50 p-3 rounded-full text-indigo-600">
                                <Hash size={24} />
                             </div>
                             <div>
                                 <p className="text-xs font-semibold text-sage-400 uppercase tracking-wider">Entries</p>
                                 <p className="text-sage-900 font-medium">{data.entry_count} entries this week</p>
                             </div>
                        </div>
                    </div>

                    {/* Keywords (Subtle) */}
                    {data.top_keywords && data.top_keywords.length > 0 && (
                        <div>
                             <p className="text-center text-xs font-semibold text-sage-400 uppercase tracking-wider mb-3">
                                Recurring Themes
                             </p>
                             <div className="flex flex-wrap justify-center gap-2">
                                {data.top_keywords.map((word, i) => (
                                    <span 
                                        key={i}
                                        className="px-3 py-1 bg-sage-50 text-sage-600 text-sm rounded-full border border-sage-100"
                                    >
                                        #{word}
                                    </span>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      </motion.div>
    </div>
  );
}
