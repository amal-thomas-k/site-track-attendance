import {
  collection,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  where,
  doc,
} from 'firebase/firestore';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { loadDemoStore, saveDemoStore, updateDemoStore } from '../lib/demoStore';
import { attendanceId, DEFAULT_SETTINGS, todayKey } from '../lib/utils';
import { AppSettings, AppUser, AttendanceRecord } from '../types';

const SETTINGS_KEY = 'sitetrack-web-settings';
const READ_KEY = 'sitetrack-web-read-notifications';

interface AppDataContextValue {
  workers: AppUser[];
  attendance: AttendanceRecord[];
  dataLoading: boolean;
  settings: AppSettings;
  readNotificationIds: string[];
  saveSettings: (nextSettings: AppSettings) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (ids: string[]) => void;
  markAttendance: (coords: { latitude: number; longitude: number }) => Promise<{
    status: 'success' | 'duplicate';
    record?: AttendanceRecord;
  }>;
  addDemoWorker: (worker: Omit<AppUser, 'id' | 'role'>) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return DEFAULT_SETTINGS;
  }

  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function loadReadNotifications() {
  const raw = localStorage.getItem(READ_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function mapWorker(data: Record<string, unknown>, id: string): AppUser {
  return {
    id,
    name: String(data.name ?? 'Unnamed Worker'),
    role: (data.role as AppUser['role']) ?? 'worker',
    assignedSite: String(data.assignedSite ?? 'Unassigned Site'),
    email: typeof data.email === 'string' ? data.email : undefined,
    phone: typeof data.phone === 'string' ? data.phone : undefined,
    trade: typeof data.trade === 'string' ? data.trade : undefined,
    zone: typeof data.zone === 'string' ? data.zone : undefined,
    shift: typeof data.shift === 'string' ? data.shift : undefined,
    availabilityStatus: data.availabilityStatus as AppUser['availabilityStatus'] | undefined,
  };
}

function mapAttendance(data: Record<string, unknown>, id: string): AttendanceRecord {
  return {
    id,
    userId: String(data.userId),
    workerName: String(data.workerName),
    assignedSite: String(data.assignedSite ?? 'Unassigned Site'),
    timestamp: String(data.timestamp),
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    date: String(data.date),
  };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<AppUser[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(loadReadNotifications);

  useEffect(() => {
    if (!user) {
      setWorkers([]);
      setAttendance([]);
      setDataLoading(false);
      return;
    }

    if (user.mode === 'demo') {
      const store = loadDemoStore();
      setWorkers(store.users.filter((item) => item.role === 'worker'));
      const demoAttendance =
        user.role === 'admin'
          ? store.attendance
          : store.attendance.filter((item) => item.userId === user.id);

      setAttendance(
        [...demoAttendance].sort(
          (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
        ),
      );
      setDataLoading(false);
      return;
    }

    if (!db) {
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    const unsubscribers: Array<() => void> = [];

    if (user.role === 'admin') {
      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'users'), where('role', '==', 'worker')),
          (snapshot) => {
            setWorkers(snapshot.docs.map((item) => mapWorker(item.data(), item.id)));
            setDataLoading(false);
          },
        ),
      );
      unsubscribers.push(
        onSnapshot(query(collection(db, 'attendance'), orderBy('timestamp', 'desc')), (snapshot) => {
          setAttendance(snapshot.docs.map((item) => mapAttendance(item.data(), item.id)));
          setDataLoading(false);
        }),
      );
    } else {
      unsubscribers.push(
        onSnapshot(
          query(
            collection(db, 'attendance'),
            where('userId', '==', user.id),
            orderBy('timestamp', 'desc'),
          ),
          (snapshot) => {
            setAttendance(snapshot.docs.map((item) => mapAttendance(item.data(), item.id)));
            setDataLoading(false);
          },
        ),
      );
    }

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [user]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      workers,
      attendance,
      dataLoading,
      settings,
      readNotificationIds,
      saveSettings(nextSettings) {
        setSettings(nextSettings);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
      },
      markNotificationRead(id) {
        setReadNotificationIds((current) => {
          if (current.includes(id)) {
            return current;
          }

          const next = [...current, id];
          localStorage.setItem(READ_KEY, JSON.stringify(next));
          return next;
        });
      },
      markAllNotificationsRead(ids) {
        const merged = Array.from(new Set([...readNotificationIds, ...ids]));
        setReadNotificationIds(merged);
        localStorage.setItem(READ_KEY, JSON.stringify(merged));
      },
      async markAttendance(coords) {
        if (!user) {
          throw new Error('You must be signed in.');
        }

        const now = new Date();
        const date = todayKey(now);
        const record: AttendanceRecord = {
          id: attendanceId(user.id, date),
          userId: user.id,
          workerName: user.name,
          assignedSite: user.assignedSite,
          timestamp: now.toISOString(),
          latitude: coords.latitude,
          longitude: coords.longitude,
          date,
        };

        if (user.mode === 'demo') {
          const store = loadDemoStore();
          if (store.attendance.some((item) => item.id === record.id)) {
            return { status: 'duplicate' as const };
          }

          const nextStore = updateDemoStore((current) => ({
            ...current,
            attendance: [record, ...current.attendance],
          }));

          setAttendance(
            [...nextStore.attendance].sort(
              (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
            ),
          );
          return { status: 'success' as const, record };
        }

        if (!db) {
          throw new Error('Firebase is not configured.');
        }

        const recordRef = doc(db, 'attendance', record.id);
        try {
          await runTransaction(db, async (transaction) => {
            const existing = await transaction.get(recordRef);
            if (existing.exists()) {
              throw new Error('duplicate');
            }

            transaction.set(recordRef, record);
          });
          return { status: 'success' as const, record };
        } catch (error) {
          if (error instanceof Error && error.message === 'duplicate') {
            return { status: 'duplicate' as const };
          }
          throw error;
        }
      },
      addDemoWorker(worker) {
        if (!user || user.mode !== 'demo') {
          throw new Error('Adding workers is supported in demo mode only.');
        }

        const newWorker: AppUser = {
          ...worker,
          id: `worker-${Date.now()}`,
          role: 'worker',
        };

        const nextStore = updateDemoStore((current) => ({
          ...current,
          users: [...current.users, newWorker],
        }));

        saveDemoStore(nextStore);
        setWorkers(nextStore.users.filter((item) => item.role === 'worker'));
      },
    }),
    [attendance, dataLoading, readNotificationIds, settings, user, workers],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider.');
  }

  return context;
}
