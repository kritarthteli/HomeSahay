import { useEffect, useState } from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors, Typography, Radius, Shadow, Spacing } from '../../constants/theme';
import { useAppStore } from '../../store/appStore';

export default function CustomerLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();

  const isAuthenticated = useAppStore((s) => s.auth.customer);
  const authLoading = useAppStore((s) => s.authLoading);

  // Determine current screen from segments
  const currentScreen = segments[segments.length - 1];
  const isOnAuthScreen = currentScreen === 'login' || currentScreen === 'register';

  useEffect(() => {
    // Don't navigate while auth state is loading
    if (authLoading) return;

    if (!isAuthenticated && !isOnAuthScreen) {
      // Not logged in and not on auth screen → send to login
      router.replace('/(customer)/login');
    } else if (isAuthenticated && isOnAuthScreen) {
      // Logged in but still on auth screen → send to main app
      router.replace('/(customer)');
    }
  }, [isAuthenticated, authLoading, isOnAuthScreen]);

  // Show loading spinner while checking stored JWT
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accentPrimary} />
      </View>
    );
  }

  return (
    <Tabs
      initialRouteName={isAuthenticated ? 'index' : 'login'}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: Colors.darkSurface,
          borderTopWidth: 0,
          position: 'absolute',
          bottom: Math.max(insets.bottom, Spacing.base),
          left: Spacing.base,
          right: Spacing.base,
          height: 64,
          borderRadius: Radius.full,
          paddingBottom: 0,
          paddingHorizontal: Spacing.sm,
          ...Shadow.lg,
          elevation: 12,
          // Hide tab bar when on auth screens
          display: isOnAuthScreen ? 'none' : 'flex',
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
      <Tabs.Screen
        name="register"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="checkout"
        options={{
          title: 'Checkout',
          tabBarIcon: ({ color, size }) => <Ionicons name="card-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          title: 'Track',
          tabBarIcon: ({ color, size }) => <Ionicons name="navigate-circle-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="manage-account"
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
    backgroundColor: '#0A0E1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
