import { useEffect } from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors, Typography, Radius, Shadow, Spacing } from '../../constants/theme';
import { useAppStore } from '../../store/appStore';

export default function WorkerLayout() {
  const router = useRouter();
  const segments = useSegments();

  // auth.worker is shared by both the real (JWT) and demo login paths —
  // either one is enough to be considered "logged in" as a worker.
  const isAuthenticated = useAppStore((s) => s.auth.worker);
  const workerAuthLoading = useAppStore((s) => s.workerAuthLoading);

  const currentScreen = segments[segments.length - 1];
  // register/login/training stay reachable regardless of auth state.
  const isOnAuthScreen = currentScreen === 'login' || currentScreen === 'register' || currentScreen === 'training';

  useEffect(() => {
    // Don't navigate while we're still checking for a saved worker JWT
    // — otherwise a real, valid session gets briefly kicked to /login
    // on every app reopen before restoreWorkerAuth() has a chance to
    // finish (see TEST 4: session persistence).
    if (workerAuthLoading) return;

    if (!isAuthenticated && !isOnAuthScreen) {
      router.replace('/(worker)/login');
    } else if (isAuthenticated && currentScreen === 'login') {
      router.replace('/(worker)');
    }
  }, [isAuthenticated, workerAuthLoading, isOnAuthScreen, currentScreen]);

  if (workerAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accentPrimary} />
      </View>
    );
  }

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.darkSurface,
          borderTopWidth: 0,
          position: 'absolute',
          bottom: Spacing.base,
          left: Spacing.base,
          right: Spacing.base,
          height: 64,
          borderRadius: Radius.full,
          paddingBottom: 0,
          paddingHorizontal: Spacing.sm,
          ...Shadow.lg,
          elevation: 12,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: Typography.fontFamily.mono,
          fontWeight: Typography.fontWeight.bold,
          textTransform: 'uppercase',
          marginBottom: 6,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
      }}
    >
      <Tabs.Screen
        name="login"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen name="register" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dispatch"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color, size }) => <Ionicons name="briefcase-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: 'Track',
          tabBarIcon: ({ color, size }) => <Ionicons name="navigate-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.darkSurfaceDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
