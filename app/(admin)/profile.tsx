import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';
import RankingSliders from '../../components/RankingSliders';

type SettingSection = 'overview' | 'algorithm' | 'cooperatives' | 'reports' | 'logs' | 'access';

const MENU_ITEMS = [
  {
    section: 'Platform Configuration',
    items: [
      { id: 'algorithm' as SettingSection, icon: 'options-outline' as const, label: 'Algorithm Settings', desc: 'Tune dispatch fairness weights' },
      { id: 'cooperatives' as SettingSection, icon: 'people-outline' as const, label: 'Manage Cooperatives', desc: 'Add or edit cooperative zones' },
      { id: 'reports' as SettingSection, icon: 'cash-outline' as const, label: 'Financial Reports', desc: 'Revenue and payout summaries' },
    ],
  },
  {
    section: 'Security & System',
    items: [
      { id: 'logs' as SettingSection, icon: 'server-outline' as const, label: 'System Logs', desc: 'Audit trail and events' },
      { id: 'access' as SettingSection, icon: 'lock-closed-outline' as const, label: 'Access Control', desc: 'Admin roles & permissions' },
    ],
  },
];

export default function AdminProfile() {
  const router = useRouter();
  const { logout } = useAppStore();
  const [activeSection, setActiveSection] = useState<SettingSection>('algorithm');

  const handleLogout = () => {
    logout('admin');
    router.replace('/(admin)/login');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'algorithm':
        return (
          <View style={styles.detailPanel}>
            <Text style={styles.detailTitle}>Algorithm Settings</Text>
            <Text style={styles.detailSub}>Calibrate dispatch weights to ensure fair job distribution among cooperative workers.</Text>
            <RankingSliders />
          </View>
        );
      case 'cooperatives':
        return (
          <View style={styles.detailPanel}>
            <Text style={styles.detailTitle}>Manage Cooperatives</Text>
            <Text style={styles.detailSub}>Configure cooperative zones, membership, and admin assignments.</Text>
            <View style={styles.placeholder}>
              <Ionicons name="people-outline" size={40} color={Colors.borderDark} />
              <Text style={styles.placeholderText}>Cooperative management coming soon</Text>
            </View>
          </View>
        );
      case 'reports':
        return (
          <View style={styles.detailPanel}>
            <Text style={styles.detailTitle}>Financial Reports</Text>
            <Text style={styles.detailSub}>Revenue breakdowns, worker payouts, and platform fee summaries.</Text>
            <View style={styles.placeholder}>
              <Ionicons name="bar-chart-outline" size={40} color={Colors.borderDark} />
              <Text style={styles.placeholderText}>Report generation coming soon</Text>
            </View>
          </View>
        );
      case 'logs':
        return (
          <View style={styles.detailPanel}>
            <Text style={styles.detailTitle}>System Logs</Text>
            <Text style={styles.detailSub}>Audit trail of all platform events, KYC actions, and dispatch decisions.</Text>
            <View style={styles.placeholder}>
              <Ionicons name="server-outline" size={40} color={Colors.borderDark} />
              <Text style={styles.placeholderText}>System log viewer coming soon</Text>
            </View>
          </View>
        );
      case 'access':
        return (
          <View style={styles.detailPanel}>
            <Text style={styles.detailTitle}>Access Control</Text>
            <Text style={styles.detailSub}>Manage admin roles, permissions, and two-factor authentication settings.</Text>
            <View style={styles.placeholder}>
              <Ionicons name="lock-closed-outline" size={40} color={Colors.borderDark} />
              <Text style={styles.placeholderText}>Access control coming soon</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
      {/* Page Header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Admin Settings</Text>
          <Text style={styles.pageSubtitle}>Platform configuration & system management</Text>
        </View>
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.textPrimary} />
          <Text style={styles.adminBadgeText}>SYSTEM ADMIN · CENTRAL HUB</Text>
        </View>
      </View>

      {/* Two Column Layout */}
      <View style={styles.twoCol}>
        {/* Left Menu */}
        <View style={styles.menuPanel}>
          {MENU_ITEMS.map((group) => (
            <View key={group.section} style={styles.menuGroup}>
              <Text style={styles.menuGroupLabel}>{group.section.toUpperCase()}</Text>
              {group.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuItem, activeSection === item.id && styles.menuItemActive]}
                  onPress={() => setActiveSection(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.menuItemIcon, activeSection === item.id && styles.menuItemIconActive]}>
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color={activeSection === item.id ? Colors.accentPrimary : Colors.textSecondary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.menuItemLabel, activeSection === item.id && styles.menuItemLabelActive]}>
                      {item.label}
                    </Text>
                    <Text style={styles.menuItemDesc}>{item.desc}</Text>
                  </View>
                  {activeSection === item.id && (
                    <Ionicons name="chevron-forward" size={16} color={Colors.textInverse} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={16} color={Colors.danger} />
            <Text style={styles.logoutText}>SIGN OUT</Text>
          </TouchableOpacity>
        </View>

        {/* Right Detail */}
        <View style={styles.detailPanelWrap}>
          {renderContent()}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.canvasLight },
  pageContent: { padding: Spacing['4xl'], paddingBottom: Spacing['4xl'], gap: Spacing['2xl'] },

  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pageTitle: { fontSize: Typography.fontSize['3xl'], fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, letterSpacing: -1 },
  pageSubtitle: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  adminBadgeText: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary, letterSpacing: 1 },

  twoCol: { flexDirection: 'row', gap: Spacing.xl, alignItems: 'flex-start' },

  menuPanel: {
    width: 280,
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.sm,
    ...Shadow.soft,
  },
  menuGroup: { gap: Spacing.sm },
  menuGroupLabel: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.sm,
    borderRadius: Radius.lg,
  },
  menuItemActive: { backgroundColor: Colors.darkSurfaceDeep },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.canvasCream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemIconActive: { backgroundColor: Colors.surfaceInteractive },
  menuItemLabel: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.body, fontWeight: Typography.fontWeight.semibold, color: Colors.textPrimary },
  menuItemLabelActive: { color: Colors.textInverse },
  menuItemDesc: { fontSize: 10, fontFamily: Typography.fontFamily.mono, color: Colors.textSecondary, marginTop: 4 },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.dangerContainer,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.danger,
    justifyContent: 'center',
  },
  logoutText: { color: Colors.danger, fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, letterSpacing: 1 },

  detailPanelWrap: { flex: 1 },
  detailPanel: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.xl,
    ...Shadow.soft,
  },
  detailTitle: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, letterSpacing: -0.5 },
  detailSub: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, lineHeight: 22 },

  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: Spacing.md,
    backgroundColor: Colors.canvasCream,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed' as any,
  },
  placeholderText: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.mono, color: Colors.textSecondary },
});
