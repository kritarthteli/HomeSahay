import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Redirect } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { updateWorkerStatus } from '../../services/mockApi';
import { Colors, Spacing, Radius, Shadow, Typography } from '../../constants/theme';
import JobModal from '../../components/JobModal';

const DEMO_INCOMING_JOB = {
  id: 'demo_job',
  category: 'plumber',
  customerName: 'Deepa S.',
  address: 'JP Nagar 3rd Phase, Bengaluru',
  amount: 450,
  distance: '0.4',
  urgency: 'normal',
};

export default function WorkerDashboard() {
  const router = useRouter();
  const {
    auth, logout,
    workers, activeWorkerId,
    updateWorkerOnlineStatus, getTodayJobs,
    acceptJob, rejectJob, addNotification,
  } = useAppStore();

  const worker = workers.find((w) => w.id === activeWorkerId);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [incomingJob, setIncomingJob] = useState(null);

  if (!auth.worker) {
    return <Redirect href="/(worker)/login" />;
  }

  if (!worker) return null;

  const todayJobs = getTodayJobs(activeWorkerId);
  const completedJobs = todayJobs.filter((j) => j.status === 'completed');

  const handleStatusToggle = async (value) => {
    setTogglingStatus(true);
    await updateWorkerStatus(worker.id, value);
    updateWorkerOnlineStatus(worker.id, value);
    setTogglingStatus(false);
    addNotification({
      type: 'status',
      title: value ? 'You are now Online' : 'You are now Offline',
      message: value ? 'You will start receiving job requests.' : 'You will not receive new jobs.',
    });
  };

  const handleSimulateJob = () => {
    setIncomingJob(DEMO_INCOMING_JOB);
    setShowJobModal(true);
  };

  const handleAccept = (job) => {
    acceptJob(job.id);
    setShowJobModal(false);
    addNotification({ type: 'job', title: 'Job Accepted!', message: `Head to ${job.address}` });
  };

  const handleReject = (reason) => {
    setShowJobModal(false);
    addNotification({
      type: 'info',
      title: 'Job Declined',
      message: reason === 'timeout' ? 'Auto-rejected due to timeout' : 'You declined the job.',
    });
  };

  const earningsGoal = 2000;
  const earningsProgress = Math.min((worker.todayEarnings / earningsGoal) * 100, 100);

  return (
    <View style={styles.mainContainer}>
      {/* Dark Header Surface */}
      <View style={styles.headerBackground}>
        <SafeAreaView edges={['top']} />
        <View style={styles.headerContent}>
          <View style={styles.topBar}>
            <View style={styles.workerProfileRow}>
              <Image source={{ uri: worker.avatar }} style={styles.avatar} />
              <View style={styles.workerInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{worker.name}</Text>
                  {worker.isVerified && (
                    <Ionicons name="shield-checkmark" size={16} color="#fff" />
                  )}
                </View>
                <Text style={styles.cooperative}>{worker.cooperative}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => {
                logout('worker');
                router.replace('/(worker)/login');
              }}
              title="Sign Out"
            >
              <Ionicons name="log-out-outline" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Status Toggle Card */}
          <View style={[styles.statusCard, worker.isOnline && styles.statusCardOnline]}>
            <View style={styles.statusLeft}>
              <View style={[styles.statusIndicator, { backgroundColor: worker.isOnline ? '#fff' : '#6B7280' }]} />
              <View>
                <Text style={styles.statusTitle}>
                  {worker.isOnline ? 'Active — Accepting Jobs' : 'Offline Mode'}
                </Text>
                <Text style={styles.statusSubtitle}>
                  {worker.isOnline ? 'Receiving priority dispatch requests' : 'Toggle on to start receiving jobs'}
                </Text>
              </View>
            </View>
            <Switch
              value={worker.isOnline}
              onValueChange={handleStatusToggle}
              disabled={togglingStatus}
              trackColor={{ false: '#374151', true: 'rgba(16, 185, 129, 0.4)' }}
              thumbColor={worker.isOnline ? '#fff' : '#9CA3AF'}
              ios_backgroundColor="#374151"
            />
          </View>

          {/* Today's Earnings Snapshot */}
          <View style={styles.earningsSnapshot}>
            <View style={styles.earningsRow}>
              <View>
                <Text style={styles.earningsLabel}>TODAY'S EARNINGS</Text>
                <Text style={styles.earningsAmount}>₹{worker.todayEarnings.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.goalPill}>
                <Text style={styles.goalText}>Daily Goal: {Math.round(earningsProgress)}%</Text>
              </View>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${earningsProgress}%` }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Clean White Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Quick Metrics Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="cash-outline" size={20} color="#059669" />
              <Text style={styles.statValue}>₹{worker.pricePerHour}/hr</Text>
              <Text style={styles.statLabel}>Hourly Rate</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="star" size={20} color="#3c20a1ff" />
              <Text style={styles.statValue}>{worker.rating} ★</Text>
              <Text style={styles.statLabel}>Quality Rating</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="briefcase-outline" size={20} color="#6366F1" />
              <Text style={styles.statValue}>{worker.totalJobs}</Text>
              <Text style={styles.statLabel}>Total Jobs</Text>
            </View>
          </View>

          {/* Weekly Work Volume Chart */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>This Week's Jobs</Text>
              <Text style={styles.sectionSub}>7-Day Dispatch Trend</Text>
            </View>
            <View style={styles.weekBars}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                const count = worker.weeklyJobs?.[i] ?? 0;
                const height = Math.max(12, (count / 10) * 64);
                return (
                  <View key={i} style={styles.weekBarWrapper}>
                    <Text style={styles.weekBarCount}>{count}</Text>
                    <View style={[styles.weekBar, { height }]} />
                    <Text style={styles.weekDay}>{day}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Simulate Incoming Dispatch Alert */}
          {worker.isOnline && (
            <TouchableOpacity style={styles.demoBtn} onPress={handleSimulateJob}>
              <Ionicons name="notifications" size={18} color="#fff" />
              <Text style={styles.demoBtnText}>Simulate Incoming Job Alert</Text>
            </TouchableOpacity>
          )}

          {/* Cooperative Benefit Card */}
          <View style={styles.benefitCard}>
            <Ionicons name="shield-checkmark" size={24} color="#3c20a1ff" />
            <View style={styles.benefitInfo}>
              <Text style={styles.benefitTitle}>Cooperative Guaranteed Protection</Text>
              <Text style={styles.benefitSub}>
                Zero platform commissions · Instant payout · ₹2,00,000 accidental coverage
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      <JobModal
        job={incomingJob}
        worker={worker}
        visible={showJobModal}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerBackground: {
    backgroundColor: '#121212',
    paddingBottom: Spacing.xl,
  },
  headerContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  workerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#2D2D35',
  },
  workerInfo: {
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    color: '#fff',
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
  },
  cooperative: {
    color: '#fff',
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
    marginTop: 2,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E1E22',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D35',
  },

  // Status Card
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E22',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#2D2D35',
    marginBottom: Spacing.md,
  },
  statusCardOnline: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: '#13211B',
  },
  statusLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusTitle: {
    color: '#fff',
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  statusSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 1,
  },

  // Earnings
  earningsSnapshot: {
    backgroundColor: '#1A1A1E',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#2D2D35',
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  earningsLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  earningsAmount: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  goalPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  goalText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#2D2D35',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },

  // Bottom Sheet
  bottomSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: {
    color: '#111827',
    fontSize: Typography.fontSize.base,
    fontWeight: '800',
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 11,
  },

  // Section Card
  sectionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: '#111827',
  },
  sectionSub: {
    fontSize: 11,
    color: '#6B7280',
  },
  weekBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 90,
  },
  weekBarWrapper: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 4,
  },
  weekBarCount: {
    color: '#4B5563',
    fontSize: 10,
    fontWeight: '600',
  },
  weekBar: {
    width: 22,
    backgroundColor: '#3c20a1ff',
    borderRadius: 4,
    minHeight: 10,
  },
  weekDay: {
    color: '#6B7280',
    fontSize: 10,
    marginTop: 2,
  },

  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#3c20a1ff',
    borderRadius: Radius.lg,
    paddingVertical: 16,
    marginBottom: Spacing.lg,
    shadowColor: '#3c20a1ff',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  demoBtnText: {
    color: '#fff',
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
  },

  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  benefitInfo: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: '#065F46',
  },
  benefitSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
    lineHeight: 15,
  },
});
