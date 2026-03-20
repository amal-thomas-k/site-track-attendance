import { AppUser, AttendanceRecord } from '../types';
import { attendanceId, todayKey, toDateTime } from './utils';

const STORE_KEY = 'sitetrack-demo-store';
const SESSION_KEY = 'sitetrack-demo-session';

interface DemoStore {
  users: AppUser[];
  attendance: AttendanceRecord[];
}

interface DemoSession {
  userId: string;
  mode: 'demo';
}

function buildSeedUsers(): AppUser[] {
  return [
    {
      id: 'admin-r-foreman',
      name: 'R. Foreman',
      role: 'admin',
      assignedSite: 'HQ Control',
      email: 'admin@sitetrack.local',
      trade: 'Site Administration',
      availabilityStatus: 'active',
    },
    {
      id: 'worker-john-doe',
      name: 'John Doe',
      role: 'worker',
      assignedSite: 'Alpha Site - 5th Ave',
      email: 'john@sitetrack.local',
      trade: 'Journeyman Pipefitter',
      zone: 'Zone A',
      shift: '06:00 - 14:00',
      availabilityStatus: 'active',
    },
    {
      id: 'worker-arjun-wallace',
      name: 'Arjun Wallace',
      role: 'worker',
      assignedSite: 'Alpha Site - 5th Ave',
      trade: 'Lead Architect',
      zone: 'Alpha Site - Central Block',
      shift: '06:00 - 14:00',
      availabilityStatus: 'active',
    },
    {
      id: 'worker-elena-martinez',
      name: 'Elena Martinez',
      role: 'worker',
      assignedSite: 'Zone D - Perimeter',
      trade: 'Safety Officer',
      zone: 'Zone D - Perimeter',
      shift: '07:00 - 15:00',
      availabilityStatus: 'on_leave',
    },
    {
      id: 'worker-sam-kowalski',
      name: 'Sam Kowalski',
      role: 'worker',
      assignedSite: 'Alpha Site - Basement L2',
      trade: 'Pipe Fitter',
      zone: 'Phase 3',
      shift: '08:00 - 16:00',
      availabilityStatus: 'active',
    },
    {
      id: 'worker-jameson-dale',
      name: 'Jameson Dale',
      role: 'worker',
      assignedSite: 'Zone C - North Gate',
      trade: 'Steel Crew Lead',
      zone: 'Zone C - North Gate',
      shift: '07:30 - 15:30',
      availabilityStatus: 'active',
    },
    {
      id: 'worker-lara-young',
      name: 'Lara Young',
      role: 'worker',
      assignedSite: 'Zone B - Grid 4',
      trade: 'Electrician',
      zone: 'Phase: High Voltage',
      shift: '09:00 - 17:00',
      availabilityStatus: 'active',
    },
    {
      id: 'worker-marcus-bell',
      name: 'Marcus Bell',
      role: 'worker',
      assignedSite: 'Supply Yard A',
      trade: 'Logistics Coordinator',
      zone: 'Inventory Focus',
      shift: '05:00 - 13:00',
      availabilityStatus: 'off_shift',
    },
  ];
}

function createRecord(user: AppUser, daysAgo: number, time: string, lat: number, lng: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const dateKey = todayKey(date);

  return {
    id: attendanceId(user.id, dateKey),
    userId: user.id,
    workerName: user.name,
    assignedSite: user.assignedSite,
    timestamp: toDateTime(dateKey, time),
    latitude: lat,
    longitude: lng,
    date: dateKey,
  } satisfies AttendanceRecord;
}

function buildSeedAttendance(users: AppUser[]) {
  const byId = Object.fromEntries(users.map((user) => [user.id, user])) as Record<string, AppUser>;

  return [
    createRecord(byId['worker-john-doe'], 0, '08:32', 9.99852, 76.30685),
    createRecord(byId['worker-arjun-wallace'], 0, '08:15', 9.99912, 76.3074),
    createRecord(byId['worker-sam-kowalski'], 0, '09:18', 9.99792, 76.30605),
    createRecord(byId['worker-jameson-dale'], 0, '08:48', 9.99691, 76.30534),
    createRecord(byId['worker-lara-young'], 0, '10:05', 9.99582, 76.30422),
    createRecord(byId['worker-john-doe'], 1, '08:29', 9.99852, 76.30685),
    createRecord(byId['worker-arjun-wallace'], 1, '08:11', 9.99912, 76.3074),
    createRecord(byId['worker-sam-kowalski'], 1, '09:05', 9.99792, 76.30605),
    createRecord(byId['worker-jameson-dale'], 1, '08:42', 9.99691, 76.30534),
    createRecord(byId['worker-lara-young'], 1, '09:44', 9.99582, 76.30422),
    createRecord(byId['worker-john-doe'], 2, '08:40', 9.99852, 76.30685),
    createRecord(byId['worker-arjun-wallace'], 2, '08:20', 9.99912, 76.3074),
    createRecord(byId['worker-jameson-dale'], 2, '08:36', 9.99691, 76.30534),
    createRecord(byId['worker-lara-young'], 2, '09:58', 9.99582, 76.30422),
    createRecord(byId['worker-john-doe'], 3, '08:30', 9.99852, 76.30685),
    createRecord(byId['worker-sam-kowalski'], 3, '09:10', 9.99792, 76.30605),
    createRecord(byId['worker-lara-young'], 3, '09:46', 9.99582, 76.30422),
    createRecord(byId['worker-arjun-wallace'], 4, '08:16', 9.99912, 76.3074),
    createRecord(byId['worker-john-doe'], 4, '08:31', 9.99852, 76.30685),
    createRecord(byId['worker-jameson-dale'], 4, '08:51', 9.99691, 76.30534),
  ];
}

function seedStore(): DemoStore {
  const users = buildSeedUsers();
  return {
    users,
    attendance: buildSeedAttendance(users),
  };
}

export function loadDemoStore(): DemoStore {
  const raw = localStorage.getItem(STORE_KEY);

  if (!raw) {
    const store = seedStore();
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    return store;
  }

  try {
    return JSON.parse(raw) as DemoStore;
  } catch {
    const store = seedStore();
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    return store;
  }
}

export function saveDemoStore(store: DemoStore) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function updateDemoStore(updater: (current: DemoStore) => DemoStore) {
  const next = updater(loadDemoStore());
  saveDemoStore(next);
  return next;
}

export function loadDemoSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as DemoSession;
  } catch {
    return null;
  }
}

export function saveDemoSession(userId: string) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      userId,
      mode: 'demo',
    } satisfies DemoSession),
  );
}

export function clearDemoSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function resolveDemoUser(role: 'worker' | 'admin') {
  const store = loadDemoStore();
  return (
    store.users.find((user) => user.role === role && user.name === (role === 'admin' ? 'R. Foreman' : 'John Doe')) ||
    store.users.find((user) => user.role === role) ||
    null
  );
}
