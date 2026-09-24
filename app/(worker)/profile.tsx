import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';

export default function WorkerProfile() {
  const router = useRouter();
  const { getActiveWorker, logout, feedback, jobs } = useAppStore();
  const worker = getActiveWorker();
  const activeJobs = jobs.filter((job) => job.workerId === worker?.id && ['accepted', 'in_progress'].includes(job.status)).length;

  const handleLogout = () => {
    logout('worker');
    router.replace('/(worker)/login');
  };

  if (!worker) return null;

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.headerBackground}>
        <SafeAreaView edges={['top']} />
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.push('/(worker)')} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Partner Profile</Text>
          <View style={{ width: 44 }} />
        </View>
      </View>

      <View style={styles.sheetContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={40} color={Colors.textMuted} />
          </View>
          <Text style={styles.nameText}>{worker.name}</Text>
          <View style={[styles.badge, worker.isVerified ? styles.badgeVerified : styles.badgePending]}>
            <Ionicons name={worker.isVerified ? 'checkmark-circle' : 'time-outline'} size={12} color={worker.isVerified ? Colors.darkSurfaceDeep : Colors.warningDark} />
            <Text style={[styles.badgeText, worker.isVerified ? styles.badgeTextVerified : styles.badgeTextPending]}>
              {worker.isVerified ? 'VERIFIED EXPERT' : 'VERIFICATION PENDING'}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{worker.rating ? `${worker.rating} ★` : '—'}</Text>
            <Text style={styles.statLabel}>RATING</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{worker.totalJobs}</Text>
            <Text style={styles.statLabel}>JOBS DONE</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{worker.yearsExperience != null ? `${worker.yearsExperience} YRS` : '—'}</Text>
            <Text style={styles.statLabel}>EXPERIENCE</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>SERVICES & EXPERIENCE</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>SERVICE CATEGORIES</Text>
          <Text style={styles.infoValue}>{(worker.skills || []).length ? worker.skills.map((s: string) => s.replace(/_/g, ' ')).join(' · ') : 'Not provided yet'}</Text>
          <Text style={styles.infoLabel}>SERVICE AREA</Text>
          <Text style={styles.infoValue}>{worker.serviceArea || (worker.location ? 'Location available' : 'Not provided yet')}</Text>
          <Text style={styles.infoLabel}>AVAILABILITY</Text>
          <Text style={styles.infoValue}>{worker.availability || 'Not provided yet'}</Text>
          <Text style={styles.infoLabel}>CERTIFICATIONS</Text>
          <Text style={styles.infoValue}>{worker.certifications?.length ? worker.certifications.join(' · ') : 'None listed'}</Text>
          <Text style={styles.infoLabel}>COOPERATIVE</Text>
          <Text style={styles.infoValue}>{worker.cooperative || 'Not provided yet'}</Text>
          {worker.profileNote && <Text style={styles.note}>{worker.profileNote}</Text>}
        </View>
        <View style={styles.workloadCard}>
          <Ionicons name="briefcase-outline" size={18} color={Colors.accentPrimaryDark} />
          <Text style={styles.workloadText}>{activeJobs} ACTIVE {activeJobs === 1 ? 'JOB' : 'JOBS'} · {worker.isOnline ? 'AVAILABLE FOR DISPATCH' : 'CURRENTLY OFFLINE'}</Text>
        </View>

        <Text style={styles.sectionTitle}>RECENT FEEDBACK</Text>
        <View style={styles.infoCard}>
          {feedback.filter((entry) => entry.toWorkerId === worker.id && entry.fromRole === 'customer').length === 0 ? <Text style={styles.infoValue}>No customer feedback yet.</Text> : feedback.filter((entry) => entry.toWorkerId === worker.id && entry.fromRole === 'customer').map((entry) => <View key={entry.id} style={styles.review}><Text style={styles.reviewStars}>{'★'.repeat(entry.rating)}{'☆'.repeat(5 - entry.rating)}</Text><Text style={styles.infoValue}>{entry.comment || 'Rating only'}</Text></View>)}
        </View>

        {/* List Menu */}
        <Text style={styles.sectionTitle}>ACCOUNT & SETTINGS</Text>
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
            <View style={styles.listIconBox}>
              <Ionicons name="person-outline" size={18} color={Colors.textPrimary} />
            </View>
            <Text style={styles.listText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
            <View style={styles.listIconBox}>
              <Ionicons name="card-outline" size={18} color={Colors.textPrimary} />
            </View>
            <Text style={styles.listText}>Payout Methods</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
            <View style={styles.listIconBox}>
              <Ionicons name="document-text-outline" size={18} color={Colors.textPrimary} />
            </View>
            <Text style={styles.listText}>KYC Documents</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
            <View style={styles.listIconBox}>
              <Ionicons name="help-circle-outline" size={18} color={Colors.textPrimary} />
            </View>
            <Text style={styles.listText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutBtnText}>LOG OUT</Text>
        </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: Colors.canvasDark },
  headerBackground: { backgroundColor: Colors.canvasDark, paddingBottom: Spacing.xl },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceLight, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight },
  headerTitle: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textInverse, letterSpacing: -0.5 },
  sheetContainer: { flex: 1, backgroundColor: Colors.canvasLight, borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' },
  scrollContent: { padding: Spacing.xl, paddingBottom: 60 },
  
  avatarSection: { alignItems: 'center', marginBottom: Spacing['2xl'], marginTop: Spacing.md },
  avatarCircle: { width: 90, height: 90, borderRadius: Radius.full, backgroundColor: Colors.canvasCream, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight },
  nameText: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, marginBottom: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, gap: 4, borderWidth: 1 },
  badgeVerified: { backgroundColor: Colors.accentPrimary, borderColor: Colors.accentPrimaryDark },
  badgePending: { backgroundColor: Colors.warningContainer, borderColor: Colors.warning },
  badgeText: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, letterSpacing: 0.5 },
  badgeTextVerified: { color: Colors.darkSurfaceDeep },
  badgeTextPending: { color: Colors.warningDark },

  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  statBox: { flex: 1, backgroundColor: Colors.surfaceLight, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.borderLight, alignItems: 'center' },
  statValue: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, marginBottom: 4 },
  statLabel: { fontSize: 10, fontFamily: Typography.fontFamily.mono, color: Colors.textSecondary, fontWeight: Typography.fontWeight.bold, letterSpacing: 0.5 },
  
  workloadCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.surfaceDark, borderRadius: Radius.lg, padding: Spacing.md, marginTop: -Spacing.md, marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.borderDark },
  workloadText: { color: Colors.accentPrimary, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, fontSize: 10, flex: 1, letterSpacing: 0.5 },
  
  infoCard: { backgroundColor: Colors.surfaceLight, padding: Spacing.lg, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.borderLight, marginBottom: Spacing.xl },
  infoLabel: { fontSize: 10, fontFamily: Typography.fontFamily.mono, color: Colors.textSecondary, fontWeight: Typography.fontWeight.bold, marginTop: Spacing.md, letterSpacing: 1 },
  infoValue: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.body, color: Colors.textPrimary, marginTop: 4, textTransform: 'capitalize', fontWeight: Typography.fontWeight.medium },
  note: { fontSize: Typography.fontSize.xs, lineHeight: 18, color: Colors.textSecondary, marginTop: 16 },
  review: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight, paddingVertical: 12 },
  reviewStars: { color: Colors.accentPrimaryDark, fontSize: 14, marginBottom: 4 },
  
  sectionTitle: { fontSize: 10, fontFamily: Typography.fontFamily.mono, color: Colors.textMuted, fontWeight: Typography.fontWeight.bold, letterSpacing: 1.5, marginBottom: Spacing.sm, paddingHorizontal: 4 },
  listContainer: { backgroundColor: Colors.surfaceLight, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.borderLight, overflow: 'hidden', marginBottom: Spacing.xl },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, paddingVertical: 18 },
  listIconBox: { width: 32, height: 32, borderRadius: Radius.full, backgroundColor: Colors.canvasCream, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight },
  listText: { flex: 1, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.body, fontWeight: Typography.fontWeight.semibold, color: Colors.textPrimary },
  listDivider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 64 },

  logoutBtn: { backgroundColor: Colors.dangerContainer, padding: Spacing.md, paddingVertical: 16, borderRadius: Radius.full, alignItems: 'center', borderWidth: 1, borderColor: Colors.danger },
  logoutBtnText: { color: Colors.danger, fontSize: 12, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, letterSpacing: 1 }
});
