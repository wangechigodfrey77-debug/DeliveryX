import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, DeliveryLocation } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, phone: string, location: DeliveryLocation) => Promise<void>;
  signOut: () => Promise<void>;
  upgradeToSeller: (businessName: string, description: string, phone: string, location: DeliveryLocation) => Promise<void>;
  updateLocationPreference: (loc: DeliveryLocation) => void;
  selectedLocation: DeliveryLocation;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<DeliveryLocation>('All');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const profile = userSnap.data() as UserProfile;
            setUserProfile(profile);
            if (profile.location) {
              setSelectedLocation(profile.location);
            }
          } else {
            // Create default profile if missing
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'DeliveryX User',
              phone: firebaseUser.phoneNumber || '',
              role: 'buyer',
              location: 'Karatina',
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
            setSelectedLocation('Karatina');
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'DeliveryX User',
          phone: firebaseUser.phoneNumber || '',
          role: 'buyer',
          location: 'Karatina',
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users');
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, phone: string, location: DeliveryLocation) => {
    const credential = await createUserWithEmailAndPassword(auth, email, pass);
    const firebaseUser = credential.user;
    const newProfile: UserProfile = {
      uid: firebaseUser.uid,
      email,
      name,
      phone,
      role: 'buyer',
      location,
    };
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userDocRef, newProfile);
    setUserProfile(newProfile);
    setSelectedLocation(location);
  };

  const signOut = async () => {
    await fbSignOut(auth);
    setUserProfile(null);
  };

  const upgradeToSeller = async (businessName: string, description: string, phone: string, location: DeliveryLocation) => {
    if (!user || !userProfile) return;
    const updatedProfile: UserProfile = {
      ...userProfile,
      role: 'seller',
      phone: phone || userProfile.phone,
      sellerInfo: {
        businessName,
        description,
        location,
        phone,
        verified: true,
      }
    };
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      role: 'seller',
      phone: updatedProfile.phone,
      sellerInfo: updatedProfile.sellerInfo
    });
    setUserProfile(updatedProfile);
  };

  const updateLocationPreference = (loc: DeliveryLocation) => {
    setSelectedLocation(loc);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      upgradeToSeller,
      updateLocationPreference,
      selectedLocation
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
