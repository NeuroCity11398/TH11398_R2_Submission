
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, role: 'admin' | 'user') => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', result.user.uid);
      
      // Load user profile after successful login
      const profile = await loadUserProfile(result.user);
      if (profile) {
        setUserProfile(profile);
        console.log(`User logged in with role: ${profile.role}`);
        
        // Auto-redirect based on role
        const targetPath = profile.role === 'admin' ? '/admin' : '/user';
        window.history.replaceState(null, '', targetPath);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string, role: 'admin' | 'user') => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      
      const userProfile: UserProfile = {
        uid: result.user.uid,
        email: result.user.email!,
        displayName,
        phoneNumber: result.user.phoneNumber || undefined,
        role,
        createdAt: new Date()
      };
      
      // Always try to save to Firestore first
      try {
        await setDoc(doc(db, 'users', result.user.uid), userProfile);
        console.log('User profile saved to Firestore with role:', role);
        setUserProfile(userProfile);
      } catch (firestoreError) {
        console.log('Firestore save failed, using local storage:', firestoreError);
        // Store in localStorage as backup
        localStorage.setItem(`user_profile_${result.user.uid}`, JSON.stringify(userProfile));
        setUserProfile(userProfile);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const loadUserProfile = async (user: User): Promise<UserProfile | null> => {
    try {
      console.log(`Loading profile for user: ${user.uid}`);
      
      // First try to get from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        console.log('Profile loaded from Firestore:', profileData);
        
        // Ensure the profile has a valid role
        if (!profileData.role || (profileData.role !== 'admin' && profileData.role !== 'user')) {
          console.warn('Profile has invalid role, defaulting to user');
          profileData.role = 'user';
        }
        
        return profileData;
      }
      
      // Try localStorage as fallback
      const localProfile = localStorage.getItem(`user_profile_${user.uid}`);
      if (localProfile) {
        const profileData = JSON.parse(localProfile) as UserProfile;
        console.log('Profile loaded from localStorage:', profileData);
        
        // Ensure the profile has a valid role
        if (!profileData.role || (profileData.role !== 'admin' && profileData.role !== 'user')) {
          console.warn('Profile has invalid role, defaulting to user');
          profileData.role = 'user';
        }
        
        return profileData;
      }
      
      console.log('No existing profile found, creating default profile');
      
      // Create a default user profile if none exists
      const defaultProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || 'User',
        phoneNumber: user.phoneNumber || undefined,
        role: 'user', // Default to user role
        createdAt: new Date()
      };
      
      // Try to save this default profile
      try {
        await setDoc(doc(db, 'users', user.uid), defaultProfile);
        console.log('Default profile saved to Firestore');
      } catch (error) {
        console.log('Could not save default profile to Firestore, using localStorage:', error);
        localStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(defaultProfile));
      }
      
      return defaultProfile;
      
    } catch (error) {
      console.error('Error loading profile:', error);
      
      // Try localStorage backup
      const localProfile = localStorage.getItem(`user_profile_${user.uid}`);
      if (localProfile) {
        const profileData = JSON.parse(localProfile) as UserProfile;
        console.log('Profile loaded from localStorage backup:', profileData);
        
        // Ensure the profile has a valid role
        if (!profileData.role || (profileData.role !== 'admin' && profileData.role !== 'user')) {
          console.warn('Profile has invalid role, defaulting to user');
          profileData.role = 'user';
        }
        
        return profileData;
      }
      
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.uid || 'logged out');
      setCurrentUser(user);
      
      if (user) {
        const profile = await loadUserProfile(user);
        setUserProfile(profile);
        
        if (profile) {
          console.log(`User authenticated with role: ${profile.role}`);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
