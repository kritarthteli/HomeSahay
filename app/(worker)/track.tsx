import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import MapViewComponent from '../../components/MapViewComponent';
import { Colors, Spacing, Radius, Shadow, Typography } from '../../constants/theme';
import { BENGALURU_CENTER } from '../../data/seedData';

// Local sub-steps (heading/arrived) are just an on-screen ride-progress
// flourish — the deterministic backend lifecycle has no state between
// ACCEPTED and IN_PROGRESS. Only the last step is a real transition.
const REAL_PHASE_FOR_STATUS: Record<string, number> = {
  accepted: 1,
  in_progress: 3,
};

export default function WorkerTrackingScreen() {
  const router = useRouter();
  const { activeWorkerId, jobs, getActiveWorker, customers, startJob, completeJob } = useAppStore();
  const worker = getActiveWorker();
  
  // Find the first active job for this worker
  const activeJob = jobs.find((j: any) => j.workerId === activeWorkerId && (j.status === 'in_progress' || j.status === 'accepted'));
  const customer = customers.find((c: any) => c.id === activeJob?.customerId);

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [updating, setUpdating] = useState(false);

  // Keep the stepper in sync with the job's real status (e.g. after
  // navigating back to this screen for an already-in-progress job).
  useEffect(() => {
    if (activeJob?.status && REAL_PHASE_FOR_STATUS[activeJob.status] != null) {
      setPhaseIndex((p) => Math.max(p, REAL_PHASE_FOR_STATUS[activeJob.status]));
    }
  }, [activeJob?.status]);

  const PHASES = [
    { id: 'accepted', label: 'Job Accepted', icon: 'checkmark-circle', color: Colors.accentPrimary },
    { id: 'heading', label: 'Heading to Customer', icon: 'bicycle', color: Colors.accentPrimary },
    { id: 'arrived', label: 'Arrived at Location', icon: 'location', color: Colors.warning },
    { id: 'inprogress', label: 'Work In Progress', icon: 'construct', color: Colors.accentPrimaryDim },
  ];

  const handleStepPress = async (i: number) => {
    if (!activeJob || updating) return;
    if (i === 3) {
      // ACCEPTED -> IN_PROGRESS is a real backend transition.
      if (activeJob.status === 'in_progress' || activeJob.status === 'completed') {
        setPhaseIndex(i);
        return;
      }
      setUpdating(true);
      try {
        await startJob(activeJob.id); // PATCH /api/jobs/:id/status — worker JWT
        setPhaseIndex(i);
      } catch (e: any) {
        Alert.alert('Could not update status', e?.message || 'Please try again.');
      } finally {
        setUpdating(false);
      }
    } else {
      // Sub-steps before "Work In Progress" are local-only flourish.
      setPhaseIndex(i);
    }
  };

  const handleCompleteJob = async () => {
    if (!activeJob || updating) return;
    setUpdating(true);
    try {
      await completeJob(activeJob.id); // PATCH /api/jobs/:id/status — worker JWT
      router.replace('/(worker)');
    } catch (e: any) {
      Alert.alert('Could not complete job', e?.message || 'Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (!activeJob || !customer) {
    return (
      <View style={styles.mainContainer}>
        <SafeAreaView edges={['top']} />
        <View style={styles.emptyState}>
          <Ionicons name="map-outline" size={48} color={Colors.borderDark} />
          <Text style={styles.emptyText}>NO ACTIVE JOBS TO TRACK</Text>
        </View>
      </View>
    );
  }

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
            <View style={{ flex: 1 }} />
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>ON ROUTE</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.bottomSheet}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.workerCard}>
            <View style={styles.avatarFallback}>
              <Ionicons name="person" size={24} color={Colors.textMuted} />
            </View>
            <View style={styles.workerInfo}>
              <Text style={styles.workerName}>{customer.name}</Text>
              <Text style={styles.coopText}>{activeJob.address ?? 'JP Nagar, Bengaluru'}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn} activeOpacity={0.8}>
              <Ionicons name="call" size={20} color={Colors.darkSurfaceDeep} />
            </TouchableOpacity>
          </View>

          <View style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>YOUR PROGRESS (TAP TO UPDATE)</Text>
            {PHASES.map((p, i) => {
              const isPast = i < phaseIndex;
              const isCurrent = i === phaseIndex;
              const isFuture = i > phaseIndex;

              return (
                <TouchableOpacity key={p.id} style={styles.stepRow} onPress={() => handleStepPress(i)} activeOpacity={0.9}>
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
                      <Text style={styles.currentStepHint}>CURRENT STATUS</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {activeJob.status === 'in_progress' && (
            <TouchableOpacity
              style={[styles.completeBtn, updating && { opacity: 0.6 }]}
              onPress={handleCompleteJob}
              disabled={updating}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-done" size={18} color={Colors.darkSurfaceDeep} />
              <Text style={styles.completeBtnText}>{updating ? 'UPDATING…' : 'MARK JOB COMPLETE'}</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 80 }} />
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    color: Colors.textInverseMuted,
    fontFamily: Typography.fontFamily.mono,
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
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
    paddingTop: Spacing.md,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  bottomSheet: {
    flex: 1,
    backgroundColor: Colors.canvasLight,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
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
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.canvasCream,
    justifyContent: 'center',
    alignItems: 'center',
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
  coopText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.bold,
    marginTop: 4,
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
    color: Colors.textPrimary,
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
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accentPrimary,
    borderRadius: Radius.full,
    paddingVertical: 18,
    ...Shadow.glow,
  },
  completeBtnText: {
    color: Colors.darkSurfaceDeep,
    fontSize: 12,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 1,
  },
});
