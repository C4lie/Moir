import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface User {
  id: number;
  uid?: string; // Firebase UID
  username: string;
  email: string;
  first_name?: string;
  avatar?: string;
  occupation?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore if needed, or construct User object
        // For now, minimal mapping
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                 const userData = userDoc.data();
                 setUser({
                    id: 0, 
                    uid: firebaseUser.uid,
                    username: userData.username || firebaseUser.displayName || 'User',
                    email: firebaseUser.email || '',
                    ...userData
                 } as User);
            } else {
                 // Fallback if no firestore doc yet
                 setUser({
                    id: 0,
                    uid: firebaseUser.uid,
                    username: firebaseUser.displayName || 'User',
                    email: firebaseUser.email || '',
                 });
            }
        } catch (e) {
            console.error("Error fetching user profile", e);
             setUser({
                    id: 0,
                    uid: firebaseUser.uid,
                    username: firebaseUser.email?.split('@')[0] || 'User',
                    email: firebaseUser.email || '',
                 });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (username: string, email: string, password: string) => {
    const userCredential: any = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
        username,
        email,
        createdAt: new Date().toISOString()
    });
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
