import 'react-native-gesture-handler';

import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/providers/AuthProvider';
import { palette } from './src/constants/theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    Notifications.setNotificationChannelAsync('attendance-alerts', {
      name: 'Attendance Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: palette.signalGood,
    });
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </AuthProvider>
  );
}
