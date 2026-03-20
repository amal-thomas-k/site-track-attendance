import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import * as logger from 'firebase-functions/logger';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

initializeApp();

interface AttendancePayload {
  workerName: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  assignedSite?: string;
}

function formatTime(timestamp: string) {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function formatLocation(latitude: number, longitude: number) {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

async function sendExpoNotifications(tokens: string[], title: string, body: string) {
  if (!tokens.length) {
    return;
  }

  const messages = tokens.map((token) => ({
    to: token,
    sound: 'default',
    title,
    body,
  }));

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    logger.warn('Expo push request failed', { status: response.status });
  }
}

export const notifyAdminsOnAttendance = onDocumentCreated(
  {
    document: 'attendance/{attendanceId}',
    region: 'asia-south1',
  },
  async (event) => {
    const snapshot = event.data;
    const data = snapshot?.data() as AttendancePayload | undefined;

    if (!data) {
      logger.warn('Attendance payload missing on create event.');
      return;
    }

    const db = getFirestore();
    const adminSnapshot = await db.collection('users').where('role', '==', 'admin').get();

    const fcmTokens = new Set<string>();
    const expoTokens = new Set<string>();

    adminSnapshot.forEach((document) => {
      const adminData = document.data();
      for (const token of adminData.fcmTokens ?? []) {
        fcmTokens.add(token);
      }
      for (const token of adminData.expoTokens ?? []) {
        expoTokens.add(token);
      }
    });

    const title = 'New attendance check-in';
    const body = `${data.workerName} checked in at ${formatTime(data.timestamp)} from ${formatLocation(
      data.latitude,
      data.longitude,
    )}`;

    if (fcmTokens.size) {
      const response = await getMessaging().sendEachForMulticast({
        tokens: [...fcmTokens],
        notification: {
          title,
          body,
        },
        data: {
          workerName: data.workerName,
          timestamp: data.timestamp,
          latitude: String(data.latitude),
          longitude: String(data.longitude),
          assignedSite: data.assignedSite ?? '',
        },
      });

      logger.info('FCM notifications sent', {
        successCount: response.successCount,
        failureCount: response.failureCount,
      });
    }

    if (expoTokens.size) {
      await sendExpoNotifications([...expoTokens], title, body);
      logger.info('Expo notifications sent', { count: expoTokens.size });
    }
  },
);
