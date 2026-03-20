import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { palette, typography } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminWorkersScreen } from '../screens/admin/AdminWorkersScreen';
import { WorkerHistoryScreen } from '../screens/worker/WorkerHistoryScreen';
import { WorkerHomeScreen } from '../screens/worker/WorkerHomeScreen';

const WorkerTabs = createBottomTabNavigator();
const AdminTabs = createBottomTabNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.canvas,
    card: palette.surface,
    primary: palette.accent,
    text: palette.ink,
    border: palette.border,
  },
};

const tabScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: palette.accent,
  tabBarInactiveTintColor: palette.inkSoft,
  tabBarStyle: {
    backgroundColor: palette.surface,
    borderTopColor: palette.border,
    height: 68,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabBarLabelStyle: {
    fontFamily: typography.heading,
    fontSize: 12,
    fontWeight: '700' as const,
  },
};

function WorkerTabNavigator() {
  return (
    <WorkerTabs.Navigator screenOptions={tabScreenOptions}>
      <WorkerTabs.Screen component={WorkerHomeScreen} name="Check In" />
      <WorkerTabs.Screen component={WorkerHistoryScreen} name="History" />
    </WorkerTabs.Navigator>
  );
}

function AdminTabNavigator() {
  return (
    <AdminTabs.Navigator screenOptions={tabScreenOptions}>
      <AdminTabs.Screen component={AdminDashboardScreen} name="Dashboard" />
      <AdminTabs.Screen component={AdminWorkersScreen} name="Workers" />
    </AdminTabs.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingScreen}>
      <ActivityIndicator color={palette.accent} size="large" />
      <Text style={styles.loadingText}>Loading SiteTrack Attendance...</Text>
    </View>
  );
}

export function AppNavigator() {
  const { loading, user, firebaseReady } = useAuth();

  return (
    <NavigationContainer theme={navigationTheme}>
      {!firebaseReady || loading ? (
        <LoadingScreen />
      ) : !user ? (
        <LoginScreen />
      ) : user.role === 'admin' ? (
        <AdminTabNavigator />
      ) : (
        <WorkerTabNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: palette.canvas,
    flex: 1,
    gap: 14,
    justifyContent: 'center',
  },
  loadingText: {
    color: palette.inkSoft,
    fontFamily: typography.body,
    fontSize: 15,
  },
});
