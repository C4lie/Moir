import { useEffect, useState } from 'react';
import { Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase';

interface Action {
    id: number;
    action_text: string;
    problem_text: string;
}

const LatestActionWidget = () => {
    const [action, setAction] = useState<Action | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

// Firebase logic integrated

    /* Imports handled */
    
    useEffect(() => {
        const fetchLatest = async () => {
            if (!auth.currentUser) return;
            try {
                const q = query(
                    collection(db, 'thought_dumps'),
                    where('userId', '==', auth.currentUser.uid)
                );
                const snapshot = await getDocs(q);
                
                // Sort client-side and get latest
                const dumps = snapshot.docs.map((doc: any) => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                dumps.sort((a: any, b: any) => {
                    const aTime = a.created_at?.toMillis?.() || 0;
                    const bTime = b.created_at?.toMillis?.() || 0;
                    return bTime - aTime;
                });
                
                if (dumps.length > 0) {
                    const data = dumps[0];
                    setAction(data as any);
                }
            } catch (error) {
                console.error("Failed to load latest action", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLatest();
    }, [auth.currentUser]);

    if (loading || !action) return null;

    return (
        <div className="bg-gradient-to-r from-sage-700 to-sage-600 rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-sage-200 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-sage-100 font-medium tracking-wide text-sm uppercase">
                        <Target className="w-4 h-4" />
                        <span>Current Focus</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-serif font-bold leading-tight mb-2 text-white">
                        {action.action_text}
                    </h3>
                    <p className="text-sage-200 text-lg opacity-90">
                        To solve: <span className="italic">"{action.problem_text}"</span>
                    </p>
                </div>
                <button 
                    onClick={() => navigate('/thought-dump')}
                    className="flex-shrink-0 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all font-medium flex items-center group backdrop-blur-sm self-stretch md:self-auto justify-center"
                >
                    New Dump
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default LatestActionWidget;
