import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, PenLine, Trophy, Book } from 'lucide-react';
import { motion } from 'framer-motion';
import LatestActionWidget from '../components/thought_dump/LatestActionWidget';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db, auth } from '../firebase';

// Firebase logic integrated

interface Entry {
  id: string | number;
  title: string;
  content: string;
  entry_date: string;
}

interface Stats {
  total_entries: number;
  writing_streak: number;
  total_notebooks: number;
  recent_entries: Entry[];
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState<Stats>({
    total_entries: 0,
    writing_streak: 0,
    total_notebooks: 0,
    recent_entries: [],
  });
  const [statsLoading, setStatsLoading] = useState(true);

  /* Imports moved to top */

  useEffect(() => {
    if (user && !loading) {
      setStatsLoading(true);
      fetchStats();
    }
  }, [user, loading, location.pathname]);

  const fetchStats = async () => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    try {
      // 1. Recent Entries
      const entriesRef = collection(db, 'entries');
      // Fetch all user entries and sort client-side to avoid connection index requirement
      const recentQuery = query(
        entriesRef, 
        where('userId', '==', uid)
      );
      const recentSnapshot = await getDocs(recentQuery);
      
      // Convert and Sort
      let all_entries = recentSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as any[];

      all_entries.sort((a, b) => {
         if (a.entry_date < b.entry_date) return 1;
         if (a.entry_date > b.entry_date) return -1;
         return 0;
      });

      const recent_entries = all_entries.slice(0, 3);


      // 2. Counts
      // For counts, we can use getCountFromServer or just length of docs if small.
      // aggregateField not fully supported in all SDK versions comfortably without setup.
      // Let's use getDocs for now as dataset might be small for personal journal.
      // Optimization: use getCountFromServer if available in environment.
      // Assuming it acts like a "frontend-only" personal app.
      
      const allEntriesQuery = query(entriesRef, where('userId', '==', uid));
      const allEntriesSnapshot = await getCountFromServer(allEntriesQuery);
      const total_entries = allEntriesSnapshot.data().count;

      const notebooksRef = collection(db, 'notebooks');
      const allNotebooksQuery = query(notebooksRef, where('userId', '==', uid));
      const allNotebooksSnapshot = await getCountFromServer(allNotebooksQuery);
      const total_notebooks = allNotebooksSnapshot.data().count;

      // 3. Streak (Simple Calculation)
      // Fetch dates only? Firestore doesn't select fields easily in client SDK without getting docs.
      // We will perform a basic check on recent entries or store streak in User profile.
      // For migration, let's keep it simple: 0 if no entries.
      // Or calculate from simplified recent logic + store logic later.
      const writing_streak = 0; // TODO: Implement robust streak calc

      setStats({
        total_entries,
        writing_streak,
        total_notebooks,
        recent_entries
      });

    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-sage-900 mb-2">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.username}
          </h1>
          <p className="text-primary-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <motion.button
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={() => navigate('/write')}
           className="btn-primary flex items-center shadow-lg shadow-sage-200"
        >
          <PenLine size={20} className="mr-2" />
          Write Today's Entry
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={item} className="card bg-gradient-to-br from-white to-sage-50 border-sage-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-sage-600 mb-1">Writing Streak</p>
              <h3 className="text-3xl font-bold text-sage-900">{statsLoading ? '-' : stats.writing_streak}</h3>
              <p className="text-xs text-sage-400 mt-1">days in a row</p>
            </div>
            <div className="p-3 bg-sage-200 rounded-xl text-sage-700">
              <Trophy size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="card bg-gradient-to-br from-white to-primary-50 border-primary-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-primary-600 mb-1">Total Entries</p>
              <h3 className="text-3xl font-bold text-primary-900">{statsLoading ? '-' : stats.total_entries}</h3>
              <p className="text-xs text-primary-400 mt-1">lifetime words</p>
            </div>
            <div className="p-3 bg-primary-200 rounded-xl text-primary-700">
              <BookOpen size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="card bg-gradient-to-br from-white to-purple-50 border-purple-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Notebooks</p>
              <h3 className="text-3xl font-bold text-purple-900">{statsLoading ? '-' : stats.total_notebooks}</h3>
              <p className="text-xs text-purple-400 mt-1">active collections</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
              <Book size={24} />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-semibold text-primary-900">Recent Entries</h2>
            <button 
                onClick={() => navigate('/notebooks')}
                className="text-sm font-medium text-sage-600 hover:text-sage-800 transition-colors"
            >
                View all notebooks &rarr;
            </button>
        </div>
        
        {statsLoading ? (
            <div className="grid gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
                ))}
            </div>
        ) : stats.recent_entries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-primary-200">
             <div className="bg-sage-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <PenLine className="text-sage-400" size={32} />
             </div>
             <p className="text-primary-500 mb-4">You haven't written anything yet.</p>
             <button onClick={() => navigate('/write')} className="btn-primary">Start Writing</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {stats.recent_entries.map((entry) => (
              <motion.div
                key={entry.id}
                whileHover={{ y: -2 }}
                onClick={() => navigate(`/entry/${entry.id}`)}
                className="card cursor-pointer hover:border-sage-300 transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-primary-900 group-hover:text-sage-700 transition-colors line-clamp-1">
                    {entry.title || 'Untitled Entry'}
                  </h3>
                  <span className="text-xs font-medium text-primary-400 bg-primary-50 px-2 py-1 rounded-full">
                    {new Date(entry.entry_date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-primary-500 text-sm line-clamp-2">
                  {entry.content}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Latest Action Focus */}
      <LatestActionWidget />

    </div>
  );
}
