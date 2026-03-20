import NetInfo from '@react-native-community/netinfo';
import { User, onAuthStateChanged } from 'firebase/auth';
import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';

import { auth, getFriendlyFirebaseError, isFirebaseConfigured } from '../config/firebase';
import { loginWithEmail, logoutUser } from '../services/authService';
import { syncPendingAttendance } from '../services/attendanceService';
import { registerAdminNotifications } from '../services/notificationService';
import { subscribeToCurrentUser } from '../services/userService';
import { AppUser } from '../types/models';

interface AuthContextValue {
  firebaseUser: User | null;
  user: AppUser | null;
  loading: boolean;
  firebaseReady: boolean;
  isConfigured: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState(!auth);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setFirebaseReady(true);
      return;
    }

    let unsubscribeProfile: () => void = () => undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (nextUser) => {
      setFirebaseReady(true);
      setFirebaseUser(nextUser);
      unsubscribeProfile();

      if (!nextUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      unsubscribeProfile = subscribeToCurrentUser(nextUser.uid, (profile) => {
        setUser(profile);
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        syncPendingAttendance();
      }
    });

    syncPendingAttendance();

    if (user.role === 'admin') {
      registerAdminNotifications(user.id);
    }

    return () => {
      unsubscribeNetInfo();
    };
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      user,
      loading,
      firebaseReady,
      isConfigured: isFirebaseConfigured,
      async login(email: string, password: string) {
        setLoading(true);
        try {
          await loginWithEmail(email, password);
        } catch (error) {
          setLoading(false);
          throw new Error(getFriendlyFirebaseError(error));
        }
      },
      async logout() {
        await logoutUser();
      },
    }),
    [firebaseReady, firebaseUser, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
