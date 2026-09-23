import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Slot, Stack, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/appStore';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';

const NAV_ITEMS = [
  { label: 'Analytics', icon: 'bar-chart-outline' as const, path: '/(admin)' },
  { label: 'Workers', icon: 'people-outline' as const, path: '/(admin)/workers' },
  { label: 'KYC Queue', icon: 'document-text-outline' as const, path: '/(admin)/kyc' },
  { label: 'Settings', icon: 'settings-outline' as const, path: '/(admin)/profile' },
];

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { auth, logout } = useAppStore();


  const handleLogout = () => {
    logout('admin');
    router.replace('/(admin)/login');
  };

  const isActive = (path: string) => {
    if (path === '/(admin)') return pathname === '/(admin)' || pathname === '/';
    return pathname.startsWith(path.replace('/(admin)', ''));
  };

  return (
    <View style={styles.root}>
      {/* Sidebar */}
      {auth.admin && (
        <View style={styles.sidebar}>
          {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoIcon}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.darkSurfaceDeep} />
          </View>
          <View>
            <Text style={styles.logoTitle}>HomeSahay</Text>
            <Text style={styles.logoSub}>ADMIN HUB</Text>
          </View>
        </View>

        {/* Live indicator */}
        <View style={styles.liveTag}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE MONITORING</Text>
        </View>

        {/* Nav */}
        <View style={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            return (
              <TouchableOpacity
                key={item.path}
                style={[styles.navItem, active && styles.navItemActive]}
                onPress={() => router.push(item.path as any)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={active ? Colors.textInverse : Colors.textInverseMuted}
                />
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                  {item.label.toUpperCase()}
                </Text>
                {active && <View style={styles.navActivePill} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Cooperative info */}
        <View style={styles.sidebarFooter}>
          <Text style={styles.footerCoopName}>JP NAGAR COOPERATIVE</Text>
          <Text style={styles.footerRole}>COOPERATIVE ADMIN</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={16} color={Colors.danger} />
            <Text style={styles.logoutText}>SIGN OUT</Text>
          </TouchableOpacity>
        </View>
      </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.canvasLight,
    minHeight: '100vh' as any,
  },
  sidebar: {
    width: 260,
    backgroundColor: Colors.darkSurfaceDeep,
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    flexShrink: 0,
    minHeight: '100vh' as any,
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.lg,
    backgroundColor: Colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTitle: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: -0.5,
  },
  logoSub: {
    color: Colors.textInverseMuted,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accentPrimaryDim,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.accentPrimary,
    alignSelf: 'flex-start',
    marginBottom: Spacing['2xl'],
    marginLeft: Spacing.xs,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentPrimaryDark,
  },
  liveText: {
    color: Colors.accentPrimaryDark,
    fontSize: 9,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
  },
  nav: {
    gap: Spacing.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: Colors.surfaceInteractive,
  },
  navLabel: {
    color: Colors.textInverseMuted,
    fontSize: 11,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
    flex: 1,
  },
  navLabelActive: {
    color: Colors.textInverse,
  },
  navActivePill: {
    width: 4,
    height: 20,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentPrimary,
    ...Shadow.glow,
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderDark,
    paddingTop: Spacing.xl,
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  footerCoopName: {
    color: Colors.textInverse,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  footerRole: {
    color: Colors.textInverseMuted,
    fontSize: 9,
    fontFamily: Typography.fontFamily.mono,
    marginBottom: Spacing.md,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.dangerContainer,
    borderWidth: 1,
    borderColor: Colors.danger,
    alignSelf: 'flex-start',
  },
  logoutText: {
    color: Colors.danger,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    overflow: 'auto' as any,
  },
});
