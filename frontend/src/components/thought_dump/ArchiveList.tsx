import React, { useEffect, useState } from 'react';
import {  ArrowLeft } from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase';

interface Dump {
    id: string | number;
    created_at: string;
    action_text: string;
    problem_text: string;
    dump_text: string;
}

interface Props {
    onBack: () => void;
}

const ArchiveList: React.FC<Props> = ({ onBack }) => {
    const [dumps, setDumps] = useState<Dump[]>([]);
    const [loading, setLoading] = useState(true);

// Firebase logic integrated

    /* Imports handled */
    
    useEffect(() => {
        const fetchArchives = async () => {
            if (!auth.currentUser) return;
            try {
                const q = query(
                    collection(db, 'thought_dumps'),
                    where('userId', '==', auth.currentUser.uid),
                    orderBy('created_at', 'desc')
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map((doc: any) => {
                    const d = doc.data();
                    return {
                        id: doc.id,
                        ...d,
                        // Ensure created_at is handled if it's a Timestamp
                        created_at: d.created_at?.toDate ? d.created_at.toDate().toISOString() : d.created_at
                    };
                }) as Dump[];
                setDumps(data);
            } catch (error) {
                console.error("Failed to load archives", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArchives();
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
                onClick={onBack}
                className="flex items-center text-sage-600 hover:text-sage-800 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dump
            </button>

            <h2 className="text-2xl font-serif text-sage-900 mb-6">Archived Dumps</h2>

            {loading ? (
                <div className="text-center py-10 text-sage-400">Loading archives...</div>
            ) : dumps.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-primary-200 text-sage-500">
                    No dumps archived yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {dumps.map((dump) => (
                        <div key={dump.id} className="bg-white p-6 rounded-xl border border-primary-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-semibold text-sage-500 uppercase tracking-wider">
                                    {new Date(dump.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-sage-700 mb-1">Problem</h4>
                                    <p className="text-primary-800">{dump.problem_text}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-sage-700 mb-1">Action</h4>
                                    <p className="text-sage-800 font-medium bg-sage-50 px-3 py-1 rounded-lg inline-block">
                                        {dump.action_text}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Original dump is hidden or collapsed? PRD says "Can only be viewed in a dedicated Archived Dumps section" */}
                            <div className="mt-4 pt-4 border-t border-primary-50">
                                <details className="group">
                                    <summary className="text-sm text-primary-400 cursor-pointer hover:text-primary-600 transition-colors list-none flex items-center gap-2">
                                        <span className="group-open:hidden">Show original dump</span>
                                        <span className="hidden group-open:inline">Hide original dump</span>
                                    </summary>
                                    <p className="mt-3 text-sm text-primary-600 whitespace-pre-wrap leading-relaxed bg-primary-50 p-4 rounded-lg">
                                        {dump.dump_text}
                                    </p>
                                </details>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ArchiveList;
