import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';

export default function WorkerProfile() {
  const router = useRouter();
  const { getActiveWorker, logout } = useAppStore();
  const worker = getActiveWorker();

  const handleLogout = () => {
    logout('worker');
    router.replace('/(worker)/login');
  };

  if (!worker) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partner Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={40} color="#6B7280" />
          </View>
          <Text style={styles.nameText}>{worker.name}</Text>
          <View style={styles.badge}>
            <Ionicons name="checkmark-circle" size={12} color="#3c20a1ff" />
            <Text style={styles.badgeText}>Verified Expert</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{worker.rating} ★</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{worker.totalJobs}</Text>
            <Text style={styles.statLabel}>Jobs Done</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{worker.yearsExperience} yrs</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
        </View>

        {/* List Menu */}
        <Text style={styles.sectionTitle}>Account & Settings</Text>
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.listItem}>
            <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.listIcon} />
            <Text style={styles.listText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem}>
            <Ionicons name="card-outline" size={20} color="#6B7280" style={styles.listIcon} />
            <Text style={styles.listText}>Payout Methods</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem}>
            <Ionicons name="document-text-outline" size={20} color="#6B7280" style={styles.listIcon} />
            <Text style={styles.listText}>KYC Documents</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem}>
            <Ionicons name="help-circle-outline" size={20} color="#6B7280" style={styles.listIcon} />
            <Text style={styles.listText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  scrollContent: { padding: Spacing.lg, paddingBottom: 40 },
  
  avatarSection: { alignItems: 'center', marginBottom: Spacing.xl, marginTop: Spacing.md },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  nameText: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, gap: 4 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#065F46' },

  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  statBox: { flex: 1, backgroundColor: '#fff', padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, borderColor: '#F3F4F6', alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#3c20a1ff', marginBottom: 2 },
  statLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  
  sectionTitle: { fontSize: 14, color: '#9CA3AF', fontWeight: '600', marginBottom: Spacing.sm, paddingHorizontal: 4 },
  listContainer: { backgroundColor: '#fff', borderRadius: Radius.lg, borderWidth: 1, borderColor: '#F3F4F6', overflow: 'hidden', marginBottom: Spacing.xl },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  listIcon: { marginRight: Spacing.md },
  listText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#374151' },
  listDivider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 48 },

  logoutBtn: { backgroundColor: '#FEE2E2', padding: Spacing.md, borderRadius: Radius.lg, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' },
  logoutBtnText: { color: '#EF4444', fontSize: 14, fontWeight: '700' }
});
