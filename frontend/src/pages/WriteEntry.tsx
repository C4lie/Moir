import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Save, ArrowLeft, Calendar, FileText, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDebounce } from '../hooks/useDebounce';

import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

// Firebase logic integrated

interface Notebook {
  id: string;
  name: string;
}

interface Entry {
  id?: string;
  title: string;
  content: string;
  entry_date: string;
  notebookId: string;
  userId: string;
  created_at?: any;
  updated_at?: any;
}

export default function WriteEntry() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const notebookParam = searchParams.get('notebook');

  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [entry, setEntry] = useState<Entry>({
    title: '',
    content: '',
    entry_date: new Date().toISOString().split('T')[0],
    notebookId: notebookParam || '',
    userId: auth.currentUser?.uid || '',
  });
  const [lastSaved, setLastSaved] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const debouncedContent = useDebounce(entry.content, 2000);

  // Load notebooks
  useEffect(() => {
    fetchNotebooks();
  }, []);

  // Load existing entry if editing
  useEffect(() => {
    if (id) {
      fetchEntry(id);
    }
  }, [id]);

  // Auto-save when content changes (after debounce)
  useEffect(() => {
    if (debouncedContent && entry.id) {
      handleAutoSave();
    }
  }, [debouncedContent]);

  // Update word count
  useEffect(() => {
    const words = entry.content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [entry.content]);

  const fetchNotebooks = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(collection(db, 'notebooks'), where('userId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Notebook[];
      setNotebooks(data);
      if (data.length > 0 && !entry.notebookId && !notebookParam) {
        setEntry(prev => ({ ...prev, notebookId: data[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch notebooks:', error);
    }
  };

  const fetchEntry = async (entryId: string) => {
    try {
      const docRef = doc(db, 'entries', entryId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEntry({ id: docSnap.id, ...data } as Entry);
      }
    } catch (error) {
      console.error('Failed to fetch entry:', error);
    }
  };

  const handleAutoSave = async () => {
    if (!entry.id || !auth.currentUser) return;
    
    setIsSaving(true);
    try {
      const docRef = doc(db, 'entries', entry.id);
      await updateDoc(docRef, {
        title: entry.title,
        content: entry.content,
        entry_date: entry.entry_date,
        notebookId: entry.notebookId,
        updated_at: serverTimestamp()
      });
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      const entryData = {
        title: entry.title,
        content: entry.content,
        entry_date: entry.entry_date,
        notebookId: entry.notebookId,
        userId: auth.currentUser.uid,
        updated_at: serverTimestamp(),
      };

      if (entry.id) {
        // Update existing
        const docRef = doc(db, 'entries', entry.id);
        await updateDoc(docRef, entryData);
        setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        // Create new
        const newDocRef = await addDoc(collection(db, 'entries'), {
            ...entryData,
            created_at: serverTimestamp()
        });
        const newId = newDocRef.id;
        setEntry(prev => ({ ...prev, id: newId }));
        setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        window.history.replaceState(null, '', `/entry/${newId}/edit`);
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto pb-20"
    >
      {/* Header / Toolbar */}
      <div className="sticky top-0 z-30 bg-paper/80 backdrop-blur-md -mx-4 px-4 py-4 mb-8 border-b border-sage-100 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-sage-500 hover:bg-sage-100/50 hover:text-sage-800 rounded-full transition-colors"
                title="Back"
            >
                <ArrowLeft size={20} />
            </button>
            <div className="text-sm text-sage-500 font-medium">
                {isSaving ? 'Saving...' : lastSaved ? `Saved ${lastSaved}` : 'Unsaved changes'}
            </div>
         </div>
         
         <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-sage-400 hidden sm:inline-block">
                {wordCount} words
            </span>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary flex items-center gap-2 py-1.5 px-4 text-sm"
            >
              <Save size={16} />
              Save
            </button>
         </div>
      </div>

      {/* Editor Surface */}
      <div className="bg-white rounded-xl shadow-sm border border-sage-100 min-h-[70vh] p-6 md:p-12 relative">
        
        {/* Metadata Inputs (Date/Notebook) */}
        <div className="flex flex-wrap items-center gap-4 mb-8 text-sage-500">
            <div className="relative group">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                    type="date"
                    value={entry.entry_date}
                    onChange={(e) => setEntry({ ...entry, entry_date: e.target.value })}
                    className="pl-9 pr-3 py-1.5 bg-sage-50 rounded-lg text-sm font-medium focus:ring-1 focus:ring-sage-300 outline-none border-none hover:bg-sage-100 transition-colors cursor-pointer"
                />
            </div>
            
            <div className="relative group">
               <div className="relative">
                   <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                   <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                    <select 
                        value={entry.notebookId}
                        onChange={(e) => setEntry({ ...entry, notebookId: e.target.value })}
                        className="pl-9 pr-8 py-1.5 bg-sage-50 rounded-lg text-sm font-medium focus:ring-1 focus:ring-sage-300 outline-none border-none hover:bg-sage-100 transition-colors appearance-none cursor-pointer min-w-[140px]"
                    >
                        {notebooks.map(nb => (
                            <option key={nb.id} value={nb.id}>{nb.name}</option>
                        ))}
                    </select>
               </div>
            </div>
        </div>

        {/* Title Input */}
        <input
            type="text"
            placeholder="Title (Optional)"
            className="w-full text-4xl font-serif font-bold text-sage-900 placeholder-sage-200 border-none outline-none bg-transparent mb-6 p-0"
            value={entry.title}
            onChange={(e) => setEntry({ ...entry, title: e.target.value })}
            autoFocus
        />

        {/* Content Textarea */}
        <textarea
            value={entry.content}
            onChange={(e) => setEntry({ ...entry, content: e.target.value })}
            placeholder="Start writing..."
            className="w-full h-full min-h-[50vh] resize-none border-none outline-none text-lg leading-relaxed text-sage-800 placeholder-sage-200 bg-transparent font-sans"
            spellCheck={false}
        />
      </div>
    </motion.div>
  );
}
