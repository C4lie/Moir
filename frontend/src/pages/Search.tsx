import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '../hooks/useDebounce';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface Entry {
  id: number;
  title: string;
  content: string;
  entry_date: string;
  notebook: number;
}

export default function Search() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedQuery.trim()) {
        performSearch(debouncedQuery);
    } else {
        setResults([]);
        setHasSearched(false);
    }
  }, [debouncedQuery]);

  const performSearch = async (query: string) => {
    setLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/entries/?search=${encodeURIComponent(query)}`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-sage-200 text-sage-900 rounded-sm px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Search Header */}
      <div className="flex items-center gap-4">
        <button
            onClick={() => navigate('/dashboard')}
            className="p-2 -ml-2 text-sage-500 hover:text-sage-800 hover:bg-sage-100 rounded-full transition-colors"
        >
            <ArrowLeft size={24} />
        </button>
        <div className="relative flex-1">
            <SearchIcon 
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-sage-600' : 'text-sage-400'}`} 
                size={20} 
            />
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search entries..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-sage-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent text-lg text-sage-900 placeholder:text-sage-300 transition-all shadow-sm"
                autoFocus
            />
        </div>
      </div>

      {/* Results Area */}
      <div className="min-h-[400px]">
        {loading ? (
             <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600"></div>
            </div>
        ) : !hasSearched ? (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
            >
                <div className="w-20 h-20 bg-sage-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <SearchIcon className="w-10 h-10 text-sage-300" />
                </div>
                <h3 className="text-xl font-medium text-sage-900 mb-2">Search your journal</h3>
                <p className="text-sage-500">Find keywords, titles, or dates across all your notebooks</p>
            </motion.div>
        ) : results.length === 0 ? (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
            >
                <p className="text-sage-500 text-lg">No entries found matching "{searchQuery}"</p>
            </motion.div>
        ) : (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
            >
                <p className="text-sm font-medium text-sage-500 mb-6">
                    Found {results.length} {results.length === 1 ? 'result' : 'results'}
                </p>
                
                <AnimatePresence>
                    {results.map((entry) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => navigate(`/entry/${entry.id}`)}
                            className="bg-white p-6 rounded-xl shadow-sm border border-sage-100 hover:shadow-md hover:border-sage-200 cursor-pointer transition-all group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-xl font-serif font-bold text-sage-900 group-hover:text-sage-700 transition-colors">
                                    {entry.title ? highlightText(entry.title, searchQuery) : <span className="italic text-sage-400">Untitled</span>}
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs font-medium text-sage-400 bg-sage-50 px-2 py-1 rounded-full">
                                    <Calendar size={12} />
                                    {new Date(entry.entry_date).toLocaleDateString()}
                                </div>
                            </div>
                            
                            <p className="text-sage-600 line-clamp-2 leading-relaxed">
                                {highlightText(entry.content, searchQuery)}
                            </p>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        )}
      </div>
    </div>
  );
}
