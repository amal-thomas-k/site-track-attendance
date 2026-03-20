# SiteTrack Attendance

SiteTrack Attendance is a cross-platform mobile app for civil construction companies to track worker attendance across multiple sites in real time. Workers can check in once per day with GPS-backed timestamps, and admins can monitor workforce presence, review attendance analytics, and receive instant notifications when someone arrives on site.

Docker support is included for teams that need a reproducible deployment handoff. Because this is an Expo mobile-first project, Docker is used here for the web export and Firebase emulator stack, not for generating Android or iOS binaries.

## What It Includes

- Worker login using Firebase Authentication
- One-tap attendance marking with live GPS coordinates and automatic timestamps
- One attendance record per worker per day
- Offline-first check-in queue with automatic sync when the device reconnects
- Worker attendance history with coordinate display and map links
- Admin dashboard with:
  - Total workers
  - Present today
  - Absent today
  - Attendance feed
  - Date filtering
  - Site filtering
  - Late arrival tracking
  - Worker-wise attendance counts
- Firebase Cloud Function to notify admins when a worker checks in

## Tech Stack

- Expo SDK 55
- React Native
- TypeScript
- Firebase Authentication
- Cloud Firestore
- Firebase Cloud Functions
- Expo Notifications
- AsyncStorage for offline queueing

## App Structure

```text
src/
  components/      Reusable UI building blocks
  config/          Firebase setup
  constants/       Theme and storage keys
  hooks/           Shared hooks
  navigation/      Role-based app navigation
  providers/       Authentication/session provider
  screens/         Worker and admin screens
  services/        Attendance, auth, notifications, offline sync
  types/           Shared TypeScript models
  utils/           Date and location helpers

functions/
  src/             Firebase Cloud Function for admin notifications
```

## Worker Experience

- Secure login
- Big `Mark Attendance` button
- Automatic timestamp capture
- GPS capture with permission handling
- Daily duplicate prevention
- Personal attendance history
- Offline save and later sync if internet is unavailable

## Admin Experience

- Real-time attendance monitoring
- Dashboard summaries and analytics
- Worker roster view
- Date and site filters
- Push notifications on every new check-in

## Firestore Data Model

### `users/{uid}`

```text
id: string
name: string
role: "worker" | "admin"
assignedSite: string
email: string
phone: string
fcmTokens: string[]
expoTokens: string[]
```

### `attendance/{userId_YYYY-MM-DD}`

```text
id: string
userId: string
workerName: string
assignedSite: string
timestamp: string
latitude: number
longitude: number
date: string
```

Using `{userId}_{YYYY-MM-DD}` as the document ID enforces one attendance entry per day per user.

## Local Setup

1. Install app dependencies:

```bash
npm install
```

2. Copy the Firebase environment template:

```bash
cp .env.example .env
```

3. Fill `.env` with your Firebase project values:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

4. Install Cloud Function dependencies:

```bash
cd functions
npm install
cd ..
```

5. Start the Expo app:

```bash
npm run start
```

## Docker Stack

### What It Covers

- Builds the Expo web export in a dedicated Node container
- Serves the built app through Nginx
- Runs Firebase Auth, Firestore, Functions, and the Emulator UI in a separate container
- Persists emulator state in a Docker volume
- Supports emulator-aware app builds using environment variables

### Docker Files

- `Dockerfile.web`
- `Dockerfile.firebase`
- `docker-compose.yml`
- `.dockerignore`
- `docker/nginx.conf`

### Environment For Docker

For a local all-in-one stack using Firebase emulators, set these values in `.env`:

```bash
EXPO_PUBLIC_USE_FIREBASE_EMULATORS=true
EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=localhost
EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT=9099
EXPO_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT=8085
```

### Run With Docker Compose

```bash
docker compose up --build
```

### Ports

- `8080`: SiteTrack web app
- `4000`: Firebase Emulator UI
- `5001`: Firebase Functions emulator
- `8085`: Firestore emulator
- `9099`: Firebase Auth emulator

### Deployment Notes

- This compose stack is intended for cloud handoff, QA review, reproducible local setup, and backend integration testing.
- Native iOS and Android releases should still be built with Expo/EAS or platform-native CI.
- If your cloud team deploys the web container outside local Docker, update the emulator host or point the app at real Firebase services instead.

## Firebase Setup Checklist

1. Create a Firebase project.
2. Enable Email/Password authentication.
3. Create the Firestore database.
4. Deploy `firestore.rules` and `firestore.indexes.json`.
5. Create users in Firebase Auth.
6. Add matching worker/admin profile documents in `users`.
7. Deploy the Cloud Function from `functions/`.
8. Configure FCM for Android and iOS builds if you want native push delivery.

## Commands

```bash
npm run start
npm run android
npm run ios
npm run web
npm run build:web
npm run typecheck
```

Cloud Functions:

```bash
cd functions
npm run build
firebase deploy --only firestore:rules,firestore:indexes,functions
```

## Current Scope

- Authentication is implemented with Firebase email/password login.
- Phone numbers are supported in the data model for future expansion.
- Admin notifications support native device tokens and Expo token fallback.
- Analytics are computed client-side for now; if usage grows, this should move to pre-aggregated server-side metrics.

## Future Extensions

- Face recognition for attendance verification
- Geo-fencing
- Payroll integration
- Shift scheduling
- Site supervisor approvals
