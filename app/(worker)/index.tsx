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

  const handleStatusToggle = async (value: boolean) => {
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
    setIncomingJob(DEMO_INCOMING_JOB as any);
    setShowJobModal(true);
  };

  const handleAccept = (job: any) => {
    acceptJob(job.id);
    setShowJobModal(false);
    addNotification({ type: 'job', title: 'Job Accepted!', message: `Head to ${job.address}` });
  };

  const handleReject = (reason: string) => {
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
                    <Ionicons name="shield-checkmark" size={14} color={Colors.accentPrimary} />
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
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={18} color={Colors.textInverseMuted} />
            </TouchableOpacity>
          </View>

          {/* Status Toggle Card */}
          <View style={[styles.statusCard, worker.isOnline && styles.statusCardOnline]}>
            <View style={styles.statusLeft}>
              <View style={[styles.statusIndicator, { backgroundColor: worker.isOnline ? Colors.accentPrimary : Colors.textMuted }]} />
              <View>
                <Text style={styles.statusTitle}>
                  {worker.isOnline ? 'ACTIVE — ACCEPTING JOBS' : 'OFFLINE MODE'}
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
              trackColor={{ false: Colors.borderDark, true: Colors.accentPrimaryDim }}
              thumbColor={worker.isOnline ? Colors.accentPrimary : Colors.textInverseMuted}
              ios_backgroundColor={Colors.borderDark}
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
                <Text style={styles.goalText}>GOAL: {Math.round(earningsProgress)}%</Text>
              </View>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${earningsProgress}%` }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Clean Ivory Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Quick Metrics Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="cash-outline" size={18} color={Colors.textPrimary} />
              <Text style={styles.statValue}>₹{worker.pricePerHour}/hr</Text>
              <Text style={styles.statLabel}>HOURLY RATE</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="star" size={18} color={Colors.textPrimary} />
              <Text style={styles.statValue}>{worker.rating} ★</Text>
              <Text style={styles.statLabel}>RATING</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="briefcase-outline" size={18} color={Colors.textPrimary} />
              <Text style={styles.statValue}>{worker.totalJobs}</Text>
              <Text style={styles.statLabel}>TOTAL JOBS</Text>
            </View>
          </View>

          {/* Weekly Work Volume Chart */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>WORK VOLUME</Text>
                <Text style={styles.sectionSub}>7-Day Dispatch Trend</Text>
              </View>
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
            <TouchableOpacity style={styles.demoBtn} onPress={handleSimulateJob} activeOpacity={0.8}>
              <Ionicons name="notifications" size={18} color={Colors.darkSurfaceDeep} />
              <Text style={styles.demoBtnText}>SIMULATE INCOMING JOB</Text>
            </TouchableOpacity>
          )}

          {/* Cooperative Benefit Card */}
          <View style={styles.benefitCard}>
            <Ionicons name="shield-checkmark" size={24} color={Colors.accentPrimary} />
            <View style={styles.benefitInfo}>
              <Text style={styles.benefitTitle}>COOPERATIVE PROTECTION</Text>
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
    backgroundColor: Colors.canvasDark,
  },
  headerBackground: {
    backgroundColor: Colors.canvasDark,
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
    marginBottom: Spacing.lg,
  },
  workerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderDark,
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
    color: Colors.textInverse,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: -0.5,
  },
  cooperative: {
    color: Colors.textInverseMuted,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceInteractive,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },

  // Status Card
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDark,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    marginBottom: Spacing.md,
  },
  statusCardOnline: {
    borderColor: Colors.accentPrimary,
    backgroundColor: Colors.accentPrimaryDim,
  },
  statusLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  statusTitle: {
    color: Colors.textInverse,
    fontSize: 11,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  statusSubtitle: {
    color: Colors.textInverseMuted,
    fontSize: 11,
    fontFamily: Typography.fontFamily.mono,
    marginTop: 2,
  },

  // Earnings
  earningsSnapshot: {
    backgroundColor: Colors.darkSurfaceDeep,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  earningsLabel: {
    color: Colors.textInverseMuted,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
  },
  earningsAmount: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    marginTop: 4,
    letterSpacing: -1,
  },
  goalPill: {
    backgroundColor: Colors.surfaceInteractive,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  goalText: {
    color: Colors.textInverse,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.surfaceInteractive,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accentPrimary,
    borderRadius: Radius.full,
    ...Shadow.glow,
  },

  // Bottom Sheet
  bottomSheet: {
    flex: 1,
    backgroundColor: Colors.canvasLight,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing['4xl'],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },

  // Section Card
  sectionCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.textSecondary,
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
    gap: 6,
  },
  weekBarCount: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
  },
  weekBar: {
    width: 16,
    backgroundColor: Colors.borderDark,
    borderRadius: Radius.full,
    minHeight: 12,
  },
  weekDay: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: 4,
  },

  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accentPrimary,
    borderRadius: Radius.full,
    paddingVertical: 18,
    marginBottom: Spacing.xl,
    ...Shadow.glow,
  },
  demoBtnText: {
    color: Colors.darkSurfaceDeep,
    fontSize: 12,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 1,
  },

  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkSurfaceDeep,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  benefitInfo: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accentPrimary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  benefitSub: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.textInverseMuted,
    lineHeight: 16,
  },
});
