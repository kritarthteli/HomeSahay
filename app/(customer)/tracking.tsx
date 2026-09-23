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

const PHASES = [
  { id: 'confirmed', label: 'Booking Confirmed', icon: 'checkmark-circle', color: '#10B981' },
  { id: 'heading', label: 'Worker Heading to You', icon: 'bicycle', color: '#6366F1' },
  { id: 'arrived', label: 'Worker Arrived at Location', icon: 'home', color: '#F59E0B' },
  { id: 'inprogress', label: 'Work In Progress', icon: 'construct', color: '#EC4899' },
  { id: 'completed', label: 'Job Completed!', icon: 'trophy', color: '#10B981' },
];

export default function TrackingScreen() {
  const router = useRouter();
  const { checkoutData, workers, jobs, completeJob, feedback, submitFeedback, activeCustomerId } = useAppStore();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [etaLeft, setEtaLeft] = useState(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

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
        if (t <= 1) { clearInterval(countdownTimer); return 0; }
        return t - 1;
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
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitles}>
              <Text style={styles.title}>Live Tracking</Text>
              <Text style={styles.subtitle}>Order #{checkoutData?.jobId ?? 'HS-8492'}</Text>
            </View>
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Active</Text>
            </View>
          </View>

          {/* ETA Snapshot */}
          <View style={styles.etaCard}>
            <View style={[styles.etaIcon, { backgroundColor: currentPhase.color + '20' }]}>
              <Ionicons name={currentPhase.icon as any} size={28} color={currentPhase.color} />
            </View>
            <View style={styles.etaInfo}>
              <Text style={[styles.etaStatus, { color: currentPhase.color }]}>
                {currentPhase.label}
              </Text>
              <Text style={styles.etaTime}>
                {phaseIndex === 0
                  ? `Estimated arrival: ~${etaLeft ?? eta} mins`
                  : phaseIndex === PHASES.length - 1
                  ? 'Service successfully delivered'
                  : 'Worker is on the way to your address'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Clean White Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Worker Profile Card */}
          <View style={styles.workerCard}>
            <Image source={{ uri: worker.avatar }} style={styles.avatar} />
            <View style={styles.workerInfo}>
              <Text style={styles.workerName}>{worker.name}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.metaText}>{worker.rating}</Text>
                <View style={styles.dot} />
                <Text style={styles.metaText}>{worker.category.toUpperCase()}</Text>
                <View style={styles.dot} />
                <Ionicons name="shield-checkmark" size={13} color="#10B981" />
                <Text style={styles.metaText}>Verified</Text>
              </View>
              <Text style={styles.coopText}>{worker.cooperative}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Ionicons name="call" size={18} color="#059669" />
            </TouchableOpacity>
          </View>

          {/* Progress Timeline */}
          <View style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>Dispatch Progress</Text>
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
                        isPast && { backgroundColor: '#10B981', borderColor: '#10B981' },
                        isFuture && { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' },
                      ]}
                    >
                      {isPast ? (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      ) : (
                        <View
                          style={[
                            styles.nodeInner,
                            isCurrent && { backgroundColor: p.color },
                            isFuture && { backgroundColor: '#D1D5DB' },
                          ]}
                        />
                      )}
                    </View>
                    {i < PHASES.length - 1 && (
                      <View
                        style={[
                          styles.stepLine,
                          isPast && { backgroundColor: '#10B981' },
                          !isPast && { backgroundColor: '#E5E7EB' },
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.stepRight}>
                    <Text
                      style={[
                        styles.stepLabel,
                        isCurrent && { color: '#111827', fontWeight: '700' },
                        isPast && { color: '#4B5563' },
                        isFuture && { color: '#9CA3AF' },
                      ]}
                    >
                      {p.label}
                    </Text>
                    {isCurrent && (
                      <Text style={styles.currentStepHint}>In progress now</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Safety & SOS Notice */}
          <View style={styles.safetyCard}>
            <Ionicons name="shield-checkmark" size={20} color="#6366F1" />
            <View style={{ flex: 1 }}>
              <Text style={styles.safetyTitle}>Cooperative Safety Shield</Text>
              <Text style={styles.safetyText}>
                Your session is GPS-monitored. 24/7 Cooperative SOS dispatch is on standby.
              </Text>
            </View>
          </View>
          {phaseIndex === PHASES.length - 1 && worker && currentJob?.status === 'completed' && (
            <FeedbackCard title="How was your experience?" subject={worker.name}
              submitted={feedback.some((entry) => entry.jobId === currentJob.id && entry.fromRole === 'customer')}
              onSubmit={(entry) => submitFeedback({ ...entry, jobId: currentJob.id, fromRole: 'customer', fromUserId: activeCustomerId, toWorkerId: worker.id })} />
          )}
        </ScrollView>
      </View>
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
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E1E22',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D35',
  },
  headerTitles: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  title: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: Typography.fontSize.xs,
    marginTop: 1,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },

  etaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E22',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: '#2D2D35',
  },
  etaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  etaInfo: { flex: 1 },
  etaStatus: {
    fontSize: Typography.fontSize.base,
    fontWeight: '800',
  },
  etaTime: {
    color: '#9CA3AF',
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
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
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  workerInfo: { flex: 1 },
  workerName: {
    color: '#111827',
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  metaText: {
    color: '#4B5563',
    fontSize: Typography.fontSize.xs,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D1D5DB',
  },
  coopText: {
    fontSize: 11,
    color: '#6366F1',
    fontWeight: '500',
    marginTop: 2,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },

  // Timeline
  timelineCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: Spacing.lg,
  },
  timelineTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: '#111827',
    marginBottom: Spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  stepLeft: {
    alignItems: 'center',
    width: 22,
  },
  stepNode: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stepLine: {
    width: 2,
    height: 34,
  },
  stepRight: {
    flex: 1,
    paddingBottom: 22,
  },
  stepLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  currentStepHint: {
    fontSize: 11,
    color: '#6366F1',
    fontWeight: '600',
    marginTop: 2,
  },

  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  safetyTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: '#3730A3',
  },
  safetyText: {
    fontSize: 11,
    color: '#4338CA',
    marginTop: 2,
    lineHeight: 15,
  },
});
