import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { X, Upload, User, Loader2 } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Firebase logic integrated

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [occupation, setOccupation] = useState(user?.occupation || '');
  /* Avatar state removed as it is unused */
  // const [avatar, setAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar || null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with user data when modal opens or user updates
  useEffect(() => {
    if (user && isOpen) {
      setFirstName(user.first_name || '');
      setUsername(user.username || '');
      setOccupation(user.occupation || '');
      setPreviewUrl(user.avatar || null);
    }
  }, [user, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // setAvatar(file); // Unused
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      // setAvatar(file); // Unused
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    if (!user || !user.uid) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const updates: { [key: string]: any } = {
        first_name: firstName,
        username: username,
        occupation: occupation,
      };
      
      // Avatar upload skipped for now (requires Storage)
      // if (avatar) { ... }

      await updateDoc(userRef, updates);

      // Update local context
      updateUser({ ...user, ...updates });
      onClose();

    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-sage-900/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-sage-100">
              <h3 className="text-xl font-serif font-bold text-sage-900">Edit Profile</h3>
              <button onClick={onClose} className="text-sage-400 hover:text-sage-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Avatar Upload */}
              <div className="flex justify-center">
                <div 
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-sage-100 bg-sage-50 flex items-center justify-center">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User size={40} className="text-sage-300" />
                        )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="text-white" size={24} />
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        hidden 
                        accept="image/*"
                    />
                </div>
              </div>
              
              <div className="text-center text-xs text-sage-500 -mt-4">
                Click or drag to update photo
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input-field"
                    placeholder="e.g. Sarah"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field"
                    placeholder="e.g. sarah_writes"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-1">Occupation</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="input-field"
                    placeholder="e.g. Housewife, Teacher, Designer"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary w-full flex justify-center items-center gap-2"
                >
                  {saving && <Loader2 className="animate-spin" size={18} />}
                  {saving ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
