import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, Trash2, ArrowLeft, Calendar, Book, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Firebase logic integrated

interface Entry {
  id: string | number;
  title: string;
  content: string;
  entry_date: string;
  notebookId: string | number;
  notebook_name?: string;
  created_at: any;
  updated_at: any;
}

export default function ViewEntry() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEntry(id);
    }
  }, [id]);

  const fetchEntry = async (entryId: string) => {
    try {
      const entryRef = doc(db, 'entries', entryId);
      const entrySnap = await getDoc(entryRef);

      if (entrySnap.exists()) {
        const data = { id: entrySnap.id, ...entrySnap.data() } as Entry;
        
        // Fetch notebook name if notebookId exists
        if (data.notebookId) {
             const nbRef = doc(db, 'notebooks', data.notebookId.toString());
             const nbSnap = await getDoc(nbRef);
             if (nbSnap.exists()) {
                 data.notebook_name = nbSnap.data().name;
             }
        }
        setEntry(data);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch entry:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!entry) return;

    try {
      await deleteDoc(doc(db, 'entries', entry.id.toString()));
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('Failed to delete entry. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600"></div>
      </div>
    );
  }

  if (!entry) {
    return null;
  }

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto pb-12"
    >
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between mb-8">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-sage-600 hover:text-sage-900 transition-colors"
            >
                <ArrowLeft size={20} />
                Back
            </button>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate(`/entry/${entry.id}/edit`)}
                    className="flex items-center gap-2 px-4 py-2 text-sage-700 bg-white border border-sage-200 rounded-lg hover:bg-sage-50 transition-colors shadow-sm"
                >
                    <Edit size={16} />
                    Edit
                </button>
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 bg-white border border-red-100 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                >
                    <Trash2 size={16} />
                    Delete
                </button>
            </div>
        </div>

        {/* Paper Surface */}
        <article className="bg-white rounded-2xl shadow-sm border border-sage-100 p-8 md:p-16 relative overflow-hidden">
            {/* Decorative Top Border */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-sage-200 via-sage-100 to-sage-200" />
            
            {/* Metadata Header */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mb-8 text-sm font-medium text-sage-500 border-b border-sage-50 pb-6">
                <div className="flex items-center gap-2 text-sage-700">
                    <Calendar size={16} className="text-sage-400" />
                    {new Date(entry.entry_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </div>
                
                {entry.notebook_name && (
                    <div className="flex items-center gap-2">
                        <Book size={16} className="text-sage-400" />
                        <span className="px-2 py-0.5 bg-sage-50 rounded-md text-sage-600">
                            {entry.notebook_name}
                        </span>
                    </div>
                )}
                
                <div className="flex items-center gap-2 ml-auto text-xs text-sage-400">
                    <Clock size={14} />
                    {new Date(entry.updated_at || entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            {/* Content */}
            <div className="prose prose-sage prose-lg max-w-none">
                {entry.title ? (
                     <h1 className="font-serif text-3xl md:text-4xl text-sage-900 mb-8">{entry.title}</h1>
                ) : (
                    <h1 className="font-serif text-3xl md:text-4xl text-sage-300 mb-8 italic">Untitled Entry</h1>
                )}
                
                <div className="whitespace-pre-wrap leading-relaxed text-sage-800 font-sans">
                {entry.content}
                </div>
            </div>
        </article>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-sage-900/30 backdrop-blur-sm"
                onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl p-6 max-w-sm w-full relative z-10 shadow-xl"
            >
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Entry?</h3>
                <p className="text-gray-600 mb-6">
                    This action cannot be undone. Are you sure you want to proceed?
                </p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm"
                    >
                        Delete
                    </button>
                </div>
            </motion.div>
        </div>
      )}
    </motion.div>
  );
}
