import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { Spacing, Radius } from '../../constants/theme';
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
              <Ionicons name="people-outline" size={40} color="#C7D2FE" />
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
              <Ionicons name="bar-chart-outline" size={40} color="#C7D2FE" />
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
              <Ionicons name="server-outline" size={40} color="#C7D2FE" />
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
              <Ionicons name="lock-closed-outline" size={40} color="#C7D2FE" />
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
          <Ionicons name="shield-checkmark" size={14} color="#3c20a1" />
          <Text style={styles.adminBadgeText}>System Admin · Central Hub</Text>
        </View>
      </View>

      {/* Two Column Layout */}
      <View style={styles.twoCol}>
        {/* Left Menu */}
        <View style={styles.menuPanel}>
          {MENU_ITEMS.map((group) => (
            <View key={group.section} style={styles.menuGroup}>
              <Text style={styles.menuGroupLabel}>{group.section}</Text>
              {group.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuItem, activeSection === item.id && styles.menuItemActive]}
                  onPress={() => setActiveSection(item.id)}
                >
                  <View style={[styles.menuItemIcon, activeSection === item.id && styles.menuItemIconActive]}>
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color={activeSection === item.id ? '#fff' : '#6B7280'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.menuItemLabel, activeSection === item.id && styles.menuItemLabelActive]}>
                      {item.label}
                    </Text>
                    <Text style={styles.menuItemDesc}>{item.desc}</Text>
                  </View>
                  {activeSection === item.id && (
                    <Ionicons name="chevron-forward" size={16} color="#3c20a1" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
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
  page: { flex: 1, backgroundColor: '#F4F6FA' },
  pageContent: { padding: 32, paddingBottom: 48, gap: 24 },

  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#111827' },
  pageSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  adminBadgeText: { fontSize: 13, fontWeight: '700', color: '#3c20a1' },

  twoCol: { flexDirection: 'row', gap: 20, alignItems: 'flex-start' },

  menuPanel: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  menuGroup: { gap: 4 },
  menuGroupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 10,
  },
  menuItemActive: { backgroundColor: '#EDE9FE' },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemIconActive: { backgroundColor: '#3c20a1' },
  menuItemLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  menuItemLabelActive: { color: '#3c20a1' },
  menuItemDesc: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: { color: '#EF4444', fontSize: 14, fontWeight: '700' },

  detailPanelWrap: { flex: 1 },
  detailPanel: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  detailTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  detailSub: { fontSize: 14, color: '#6B7280', lineHeight: 22 },

  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed' as any,
  },
  placeholderText: { fontSize: 14, color: '#9CA3AF', fontWeight: '500' },
});
