import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Save, ArrowLeft, Calendar, FileText, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDebounce } from '../hooks/useDebounce';

const API_BASE_URL = 'http://localhost:8000/api';

interface Notebook {
  id: number;
  name: string;
}

interface Entry {
  id?: number;
  title: string;
  content: string;
  entry_date: string;
  notebook: number;
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
    entry_date: (() => {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })(),
    notebook: notebookParam ? parseInt(notebookParam) : 0,
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
    try {
      const response = await fetch(`${API_BASE_URL}/notebooks/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setNotebooks(data);
        if (data.length > 0 && !entry.notebook && !notebookParam) {
          setEntry(prev => ({ ...prev, notebook: data[0].id }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch notebooks:', error);
    }
  };

  const fetchEntry = async (entryId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/entries/${entryId}/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setEntry(data);
      }
    } catch (error) {
      console.error('Failed to fetch entry:', error);
    }
  };

  const handleAutoSave = async () => {
    if (!entry.id) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/entries/${entry.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(entry),
      });

      if (response.ok) {
        setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const url = entry.id 
        ? `${API_BASE_URL}/entries/${entry.id}/`
        : `${API_BASE_URL}/entries/`;
      
      const method = entry.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(entry),
      });

      if (response.ok) {
        const data = await response.json();
        setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        if (!entry.id) {
          setEntry(data);
          // Update URL without refresh
          window.history.replaceState(null, '', `/entry/${data.id}/edit`);
        }
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
      <div className="bg-white rounded-xl shadow-sm border border-sage-100 min-h-[70vh] p-8 md:p-12 relative">
        
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
                        value={entry.notebook}
                        onChange={(e) => setEntry({ ...entry, notebook: parseInt(e.target.value) })}
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
