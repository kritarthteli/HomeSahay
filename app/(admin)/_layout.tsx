import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Slot, Stack, useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/appStore';

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
            <Ionicons name="shield-checkmark" size={22} color="#fff" />
          </View>
          <View>
            <Text style={styles.logoTitle}>HomeSahay</Text>
            <Text style={styles.logoSub}>Admin Hub</Text>
          </View>
        </View>

        {/* Live indicator */}
        <View style={styles.liveTag}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live Monitoring</Text>
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
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={active ? '#fff' : 'rgba(255,255,255,0.55)'}
                />
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                  {item.label}
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
          <Text style={styles.footerCoopName}>JP Nagar Workers Cooperative</Text>
          <Text style={styles.footerRole}>Cooperative Admin</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={16} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
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
    backgroundColor: '#F4F6FA',
    minHeight: '100vh' as any,
  },
  sidebar: {
    width: 240,
    backgroundColor: '#1E1B4B',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 16,
    flexShrink: 0,
    minHeight: '100vh' as any,
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#3c20a1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  logoSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '500',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignSelf: 'flex-start',
    marginBottom: 28,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  nav: {
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  navLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  navLabelActive: {
    color: '#fff',
  },
  navActivePill: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#7C3AED',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
    gap: 4,
  },
  footerCoopName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
  },
  footerRole: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    marginBottom: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    overflow: 'auto' as any,
  },
});
