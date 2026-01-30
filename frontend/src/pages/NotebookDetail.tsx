import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, BookOpen } from 'lucide-react';

const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8000/api';

interface Notebook {
  id: number;
  name: string;
  description: string;
  color_theme: string;
}

interface Entry {
  id: number;
  title: string;
  content: string;
  entry_date: string;
  notebook: number;
}

export default function NotebookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotebookAndEntries();
  }, [id]);

  const fetchNotebookAndEntries = async () => {
    try {
      // Fetch notebook details
      const notebookResponse = await fetch(`${API_BASE_URL}/notebooks/${id}/`, {
        credentials: 'include',
      });
      if (notebookResponse.ok) {
        const notebookData = await notebookResponse.json();
        setNotebook(notebookData);
      }

      // Fetch entries for this notebook
      const entriesResponse = await fetch(`${API_BASE_URL}/entries/?notebook=${id}`, {
        credentials: 'include',
      });
      if (entriesResponse.ok) {
        const entriesData = await entriesResponse.json();
        setEntries(entriesData);
      }
    } catch (error) {
      console.error('Failed to fetch notebook and entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWriteEntry = () => {
    navigate(`/write?notebook=${id}`);
  };

  const handleEntryClick = (entryId: number) => {
    navigate(`/entry/${entryId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!notebook) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">Notebook not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/notebooks')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Back to Notebooks
          </button>
          <button
            onClick={handleWriteEntry}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            New Entry
          </button>
        </div>

        {/* Notebook Header */}
        <div
          className="card mb-6"
          style={{ borderLeft: `4px solid ${notebook.color_theme || '#3B82F6'}` }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{notebook.name}</h1>
          {notebook.description && (
            <p className="text-gray-600 mb-4">{notebook.description}</p>
          )}
          <p className="text-sm text-gray-500">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>

        {/* Entries List */}
        {entries.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">No entries in this notebook yet.</p>
            <button onClick={handleWriteEntry} className="btn-primary">
              Write Your First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => handleEntryClick(entry.id)}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {entry.title || 'Untitled Entry'}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar size={16} />
                    <span>{new Date(entry.entry_date).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="text-gray-700 line-clamp-3 whitespace-pre-wrap">
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
