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
import MapViewComponent from '../../components/MapViewComponent';
import { Colors, Spacing, Radius, Shadow, Typography } from '../../constants/theme';
import { BENGALURU_CENTER } from '../../data/seedData';

export default function TrackingScreen() {
  const router = useRouter();
  const { checkoutData, workers, jobs, completeJob, feedback, submitFeedback, activeCustomerId, getActiveCustomer } = useAppStore();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [etaLeft, setEtaLeft] = useState<number | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const PHASES = [
    { id: 'confirmed', label: 'Booking Confirmed', icon: 'checkmark-circle', color: Colors.accentPrimary },
    { id: 'heading', label: 'Worker Heading to You', icon: 'bicycle', color: Colors.accentPrimary },
    { id: 'arrived', label: 'Worker Arrived at Location', icon: 'location', color: Colors.warning },
    { id: 'inprogress', label: 'Work In Progress', icon: 'construct', color: Colors.accentPrimaryDim },
    { id: 'completed', label: 'Job Completed!', icon: 'trophy', color: Colors.success },
  ];

  const customer = getActiveCustomer();
  const worker = workers.find((w: any) => w.id === checkoutData?.workerId) ?? workers[0];
  const currentJob = jobs.find((j: any) => j.id === checkoutData?.jobId);
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
      <View style={styles.mapSection}>
        <MapViewComponent
          workers={worker ? [worker] : []}
          customerLocation={customer?.location ?? BENGALURU_CENTER}
          radiusKm={2}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView edges={['top']} style={styles.headerOverlay}>
          <View style={styles.topRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={20} color={Colors.textInverse} />
            </TouchableOpacity>
            <View style={styles.headerTitles}>
              <View style={styles.liveTag}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>

        <View style={styles.etaCardContainer}>
          <View style={styles.etaCard}>
            <View style={[styles.etaIcon, { backgroundColor: currentPhase.color }]}>
              <Ionicons name={currentPhase.icon as any} size={28} color={Colors.darkSurfaceDeep} />
            </View>
            <View style={styles.etaInfo}>
              <Text style={[styles.etaStatus, { color: Colors.textInverse }]}>
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

      <View style={styles.bottomSheet}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
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
                <Ionicons name="shield-checkmark" size={12} color={Colors.accentPrimary} />
                <Text style={[styles.metaText, { color: Colors.accentPrimary }]}>Verified</Text>
              </View>
              <Text style={styles.coopText}>{worker.cooperative}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn} activeOpacity={0.8}>
              <Ionicons name="call" size={20} color={Colors.darkSurfaceDeep} />
            </TouchableOpacity>
          </View>

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
                        isCurrent && { borderColor: p.color, backgroundColor: Colors.surfaceLight },
                        isPast && { backgroundColor: Colors.textPrimary, borderColor: Colors.textPrimary },
                        isFuture && { backgroundColor: Colors.canvasCream, borderColor: Colors.borderLight },
                      ]}
                    >
                      {isPast ? (
                        <Ionicons name="checkmark" size={12} color={Colors.surfaceLight} />
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
                          isPast && { backgroundColor: Colors.textPrimary },
                          !isPast && { backgroundColor: Colors.borderLight },
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.stepRight}>
                    <Text
                      style={[
                        styles.stepLabel,
                        isCurrent && { color: Colors.textPrimary, fontWeight: Typography.fontWeight.black },
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

          <View style={styles.safetyCard}>
            <Ionicons name="shield-checkmark" size={24} color={Colors.accentPrimary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.safetyTitle}>COOPERATIVE SAFETY SHIELD</Text>
              <Text style={styles.safetyText}>
                Your session is GPS-monitored. 24/7 Cooperative SOS dispatch is on standby.
              </Text>
            </View>
          </View>

          {phaseIndex === PHASES.length - 1 && worker && currentJob?.status === 'completed' && (
            <FeedbackCard title="How was your experience?" subject={worker.name}
              submitted={feedback.some((entry: any) => entry.jobId === currentJob.id && entry.fromRole === 'customer')}
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
  mapSection: {
    height: '45%',
    backgroundColor: Colors.canvasDark,
    position: 'relative',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.canvasDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderDark,
    ...Shadow.glow,
  },
  headerTitles: {
    flex: 1,
    alignItems: 'flex-end',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.canvasDark,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    ...Shadow.glow,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentPrimary,
  },
  liveText: {
    color: Colors.textInverse,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 1,
  },
  etaCardContainer: {
    position: 'absolute',
    bottom: Spacing['3xl'],
    left: Spacing.xl,
    right: Spacing.xl,
    zIndex: 10,
  },
  etaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    backgroundColor: Colors.canvasDark,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    ...Shadow.glow,
  },
  etaIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.glow,
  },
  etaInfo: { flex: 1 },
  etaStatus: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  etaTime: {
    color: Colors.textInverseMuted,
    fontSize: 9,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: Colors.canvasLight,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    overflow: 'hidden',
    marginTop: -Spacing.xl,
    zIndex: 20,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing['4xl'],
  },
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.xl,
    ...Shadow.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  workerInfo: { flex: 1 },
  workerName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: -0.5,
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
    fontSize: 9,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.textMuted,
    fontWeight: Typography.fontWeight.bold,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  callBtn: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.glow,
  },
  timelineCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
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
    marginBottom: Spacing.xl,
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
    width: 10,
    height: 10,
    borderRadius: Radius.full,
  },
  stepLine: {
    width: 2,
    height: 40,
  },
  stepRight: {
    flex: 1,
    paddingBottom: 28,
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
    fontWeight: Typography.fontWeight.black,
    marginTop: 6,
    letterSpacing: 1,
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDark,
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    marginBottom: Spacing.xl,
  },
  safetyTitle: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.black,
    color: Colors.accentPrimary,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  safetyText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textInverseMuted,
    lineHeight: 18,
    fontFamily: Typography.fontFamily.mono,
  },
});
