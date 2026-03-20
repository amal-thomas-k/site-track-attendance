import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { clearDemoSession, loadDemoSession, resolveDemoUser, saveDemoSession } from '../lib/demoStore';
import { AppUser, SessionUser } from '../types';

interface AuthContextValue {
  firebaseUser: User | null;
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: (role: 'worker' | 'admin') => void;
  logout: () => Promise<void>;
  isFirebaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toSessionUser(profile: AppUser, mode: SessionUser['mode']): SessionUser {
  return {
    ...profile,
    mode,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) {
      const session = loadDemoSession();
      if (session) {
        const profile = resolveDemoUser('admin')?.id === session.userId
          ? resolveDemoUser('admin')
          : resolveDemoUser('worker');

        if (profile && profile.id === session.userId) {
          setUser(toSessionUser(profile, 'demo'));
        }
      }

      setLoading(false);
      return;
    }

    const firestore = db;
    let unsubscribeProfile: () => void = () => undefined;

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setFirebaseUser(nextUser);
      unsubscribeProfile();

      if (!nextUser) {
        const session = loadDemoSession();
        if (session) {
          const storeUser =
            resolveDemoUser('admin')?.id === session.userId
              ? resolveDemoUser('admin')
              : resolveDemoUser('worker');
          setUser(storeUser && storeUser.id === session.userId ? toSessionUser(storeUser, 'demo') : null);
        } else {
          setUser(null);
        }
        setLoading(false);
        return;
      }

      unsubscribeProfile = onSnapshot(doc(firestore, 'users', nextUser.uid), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as AppUser;
          setUser(
            toSessionUser(
              {
                id: snapshot.id,
                name: data.name,
                role: data.role,
                assignedSite: data.assignedSite,
                email: data.email,
                phone: data.phone,
                trade: data.trade,
                zone: data.zone,
                shift: data.shift,
                availabilityStatus: data.availabilityStatus,
              },
              'firebase',
            ),
          );
        } else {
          setUser(null);
        }
        setLoading(false);
      });
    });

    return () => {
      unsubscribe();
      unsubscribeProfile();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      user,
      loading,
      isFirebaseConfigured,
      async login(email: string, password: string) {
        if (!auth || !isFirebaseConfigured) {
          throw new Error('Firebase is not configured for hosted sign in.');
        }

        setLoading(true);
        try {
          await signInWithEmailAndPassword(auth, email, password);
          clearDemoSession();
        } finally {
          setLoading(false);
        }
      },
      loginDemo(role) {
        const profile = resolveDemoUser(role);
        if (!profile) {
          throw new Error(`Demo ${role} user is not available.`);
        }

        saveDemoSession(profile.id);
        setUser(toSessionUser(profile, 'demo'));
      },
      async logout() {
        clearDemoSession();
        if (auth && firebaseUser) {
          await signOut(auth);
        }
        setUser(null);
      },
    }),
    [firebaseUser, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
