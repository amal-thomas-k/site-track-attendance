import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { storeNotificationToken } from './userService';

export async function registerAdminNotifications(userId: string) {
  if (!Device.isDevice) {
    return;
  }

  const existingPermissions = await Notifications.getPermissionsAsync();
  let finalStatus = existingPermissions.status;

  if (finalStatus !== 'granted') {
    const requestedPermissions = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermissions.status;
  }

  if (finalStatus !== 'granted') {
    return;
  }

  try {
    const deviceToken = await Notifications.getDevicePushTokenAsync();
    const provider = deviceToken.type === 'ios' ? null : 'fcm';

    if (provider && deviceToken.data) {
      await storeNotificationToken(userId, provider, deviceToken.data);
      return;
    }
  } catch {
    // Fall back to Expo tokens when native device tokens are unavailable.
  }

  try {
    const expoToken = await Notifications.getExpoPushTokenAsync();
    if (expoToken.data) {
      await storeNotificationToken(userId, 'expo', expoToken.data);
    }
  } catch {
    if (Platform.OS === 'android') {
      // Ignore registration failures in development builds.
    }
  }
}
