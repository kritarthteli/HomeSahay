import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Radius, Shadow, Spacing } from '../../constants/theme';

export default function CustomerLayout() {
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
