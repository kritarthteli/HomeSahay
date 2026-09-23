import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import FeedbackCard from '../../components/FeedbackCard';
import { Colors, Spacing, Radius, Shadow, Typography } from '../../constants/theme';

export default function TrackingScreen() {
  const router = useRouter();
  const { checkoutData, workers, jobs, completeJob, feedback, submitFeedback, activeCustomerId } = useAppStore();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [etaLeft, setEtaLeft] = useState<number | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const PHASES = [
    { id: 'confirmed', label: 'Booking Confirmed', icon: 'checkmark-circle', color: Colors.accentPrimary },
    { id: 'heading', label: 'Worker Heading to You', icon: 'bicycle', color: Colors.accentPrimary },
    { id: 'arrived', label: 'Worker Arrived at Location', icon: 'home', color: Colors.warning },
    { id: 'inprogress', label: 'Work In Progress', icon: 'construct', color: Colors.accentPrimaryDim },
    { id: 'completed', label: 'Job Completed!', icon: 'trophy', color: Colors.success },
  ];

  const worker = workers.find((w) => w.id === checkoutData?.workerId) ?? workers[0];
  const currentJob = jobs.find((j) => j.id === checkoutData?.jobId);
  const eta = checkoutData?.estimatedArrival ?? worker?.etaMinutes ?? 12;

  useEffect(() => {
    setEtaLeft(eta);
    const intervals = [0, eta * 60 * 1000 * 0.2, eta * 60 * 1000 * 0.7, eta * 60 * 1000 * 0.9, eta * 60 * 1000];
    const timers = intervals.map((delay, i) =>
      setTimeout(() => setPhaseIndex(i), delay)
    );

    const countdownTimer = setInterval(() => {
      setEtaLeft((t) => {
        if (t !== null && t <= 1) { clearInterval(countdownTimer); return 0; }
        return t !== null ? t - 1 : null;
      });
    }, 60000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(countdownTimer);
    };
  }, [eta]);

  useEffect(() => {
    if (phaseIndex === PHASES.length - 1 && checkoutData?.jobId && currentJob?.status !== 'completed') completeJob(checkoutData.jobId);
  }, [phaseIndex, checkoutData?.jobId]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (phaseIndex / (PHASES.length - 1)) * 100,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [phaseIndex]);

  const currentPhase = PHASES[phaseIndex];

  return (
    <View style={styles.mainContainer}>
      {/* Dark Header Surface */}
      <View style={styles.headerBackground}>
        <SafeAreaView edges={['top']} />
        <View style={styles.headerContent}>
          <View style={styles.topRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={20} color={Colors.textInverse} />
            </TouchableOpacity>
            <View style={styles.headerTitles}>
              <Text style={styles.title}>Live Tracking</Text>
              <Text style={styles.subtitle}>ORDER #{checkoutData?.jobId ?? 'HS-8492'}</Text>
            </View>
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>ACTIVE</Text>
            </View>
          </View>

          {/* ETA Snapshot */}
          <View style={styles.etaCard}>
            <View style={[styles.etaIcon, { backgroundColor: currentPhase.color + '20' }]}>
              <Ionicons name={currentPhase.icon as any} size={24} color={currentPhase.color} />
            </View>
            <View style={styles.etaInfo}>
              <Text style={[styles.etaStatus, { color: currentPhase.color }]}>
                {currentPhase.label}
              </Text>
              <Text style={styles.etaTime}>
                {phaseIndex === 0
                  ? `ESTIMATED ARRIVAL: ~${etaLeft ?? eta} MINS`
                  : phaseIndex === PHASES.length - 1
                  ? 'SERVICE SUCCESSFULLY DELIVERED'
                  : 'WORKER IS ON THE WAY TO YOUR ADDRESS'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Clean Ivory Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Worker Profile Card */}
          <View style={styles.workerCard}>
            <Image source={{ uri: worker.avatar }} style={styles.avatar} />
            <View style={styles.workerInfo}>
              <Text style={styles.workerName}>{worker.name}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="star" size={12} color={Colors.textPrimary} />
                <Text style={styles.metaText}>{worker.rating}</Text>
                <View style={styles.dot} />
                <Text style={styles.metaText}>{worker.category.toUpperCase()}</Text>
                <View style={styles.dot} />
                <Ionicons name="shield-checkmark" size={12} color={Colors.success} />
                <Text style={styles.metaText}>Verified</Text>
              </View>
              <Text style={styles.coopText}>{worker.cooperative}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn} activeOpacity={0.8}>
              <Ionicons name="call" size={18} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>

          {/* Progress Timeline */}
          <View style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>DISPATCH PROGRESS</Text>
            {PHASES.map((p, i) => {
              const isPast = i < phaseIndex;
              const isCurrent = i === phaseIndex;
              const isFuture = i > phaseIndex;

              return (
                <View key={p.id} style={styles.stepRow}>
                  <View style={styles.stepLeft}>
                    <View
                      style={[
                        styles.stepNode,
                        isCurrent && { borderColor: p.color, backgroundColor: p.color + '20' },
                        isPast && { backgroundColor: Colors.accentPrimary, borderColor: Colors.accentPrimary },
                        isFuture && { backgroundColor: Colors.canvasCream, borderColor: Colors.borderLight },
                      ]}
                    >
                      {isPast ? (
                        <Ionicons name="checkmark" size={12} color={Colors.darkSurfaceDeep} />
                      ) : (
                        <View
                          style={[
                            styles.nodeInner,
                            isCurrent && { backgroundColor: p.color },
                            isFuture && { backgroundColor: Colors.borderLight },
                          ]}
                        />
                      )}
                    </View>
                    {i < PHASES.length - 1 && (
                      <View
                        style={[
                          styles.stepLine,
                          isPast && { backgroundColor: Colors.accentPrimary },
                          !isPast && { backgroundColor: Colors.borderLight },
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.stepRight}>
                    <Text
                      style={[
                        styles.stepLabel,
                        isCurrent && { color: Colors.textPrimary, fontWeight: Typography.fontWeight.bold },
                        isPast && { color: Colors.textSecondary },
                        isFuture && { color: Colors.textMuted },
                      ]}
                    >
                      {p.label}
                    </Text>
                    {isCurrent && (
                      <Text style={styles.currentStepHint}>IN PROGRESS NOW</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Safety & SOS Notice */}
          <View style={styles.safetyCard}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.accentPrimary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.safetyTitle}>COOPERATIVE SAFETY SHIELD</Text>
              <Text style={styles.safetyText}>
                Your session is GPS-monitored. 24/7 Cooperative SOS dispatch is on standby.
              </Text>
            </View>
          </View>
          {phaseIndex === PHASES.length - 1 && worker && currentJob?.status === 'completed' && (
            <FeedbackCard title="How was your experience?" subject={worker.name}
              submitted={feedback.some((entry) => entry.jobId === currentJob.id && entry.fromRole === 'customer')}
              onSubmit={(entry: any) => submitFeedback({ ...entry, jobId: currentJob.id, fromRole: 'customer', fromUserId: activeCustomerId, toWorkerId: worker.id })} />
          )}
        </ScrollView>
      </View>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceInteractive,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  headerTitles: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  title: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Colors.textInverseMuted,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    marginTop: 2,
    letterSpacing: 1,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentPrimary,
  },
  liveText: {
    color: Colors.accentPrimary,
    fontSize: 9,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },

  etaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDark,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  etaIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  etaInfo: { flex: 1 },
  etaStatus: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: -0.5,
  },
  etaTime: {
    color: Colors.textInverseMuted,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    marginTop: 4,
    letterSpacing: 0.5,
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
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  workerInfo: { flex: 1 },
  workerName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.bold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  metaText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderLight,
  },
  coopText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.textMuted,
    fontWeight: Typography.fontWeight.bold,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.darkSurfaceDeep,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.glow,
  },

  // Timeline
  timelineCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.xl,
  },
  timelineTitle: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: Spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  stepLeft: {
    alignItems: 'center',
    width: 24,
  },
  stepNode: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeInner: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  stepLine: {
    width: 2,
    height: 36,
  },
  stepRight: {
    flex: 1,
    paddingBottom: 24,
  },
  stepLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.semibold,
  },
  currentStepHint: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.accentPrimary,
    fontWeight: Typography.fontWeight.bold,
    marginTop: 4,
    letterSpacing: 0.5,
  },

  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDark,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    marginBottom: Spacing.xl,
  },
  safetyTitle: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accentPrimary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  safetyText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textInverseMuted,
    lineHeight: 18,
  },
});
