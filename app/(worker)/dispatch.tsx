import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/appStore';
import JobModal from '../../components/JobModal';
import FeedbackCard from '../../components/FeedbackCard';
import { Colors, Spacing, Radius, Shadow, Typography } from '../../constants/theme';

const DEMO_JOBS = [
  { id: 'demo1', category: 'plumber', customerName: 'Arjun M.', address: 'JP Nagar 6th Phase', amount: 500, distance: '0.6', urgency: 'emergency' },
  { id: 'demo2', category: 'plumber', customerName: 'Kavitha R.', address: 'Jayanagar 3rd Block', amount: 380, distance: '0.9', urgency: 'normal' },
];

export default function DispatchScreen() {
  const { workers, activeWorkerId, jobs, acceptJob, rejectJob, addNotification, completeJob, feedback, submitFeedback } = useAppStore();
  const worker = workers.find((w) => w.id === activeWorkerId);
  const [showModal, setShowModal] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);

  const myJobs = jobs.filter((j) => j.workerId === activeWorkerId);
  const inProgressJobs = myJobs.filter((j) => j.status === 'in_progress' || j.status === 'accepted');
  const completedJobs = myJobs.filter((j) => j.status === 'completed');

  const handleSimulate = (job: any) => {
    setCurrentJob(job);
    setShowModal(true);
  };

  const handleAccept = (job: any) => {
    acceptJob(job.id);
    setShowModal(false);
    addNotification({ type: 'job', title: `Job Accepted!`, message: `Head to ${job.address}` });
  };

  const handleReject = (reason: string) => {
    setShowModal(false);
  };

  const handleComplete = (jobId: string) => {
    completeJob(jobId);
    addNotification({ type: 'success', title: 'Job Completed!', message: 'Payment will be processed shortly.' });
  };

  return (
    <View style={styles.mainContainer}>
      {/* Dark Header Surface */}
      <View style={styles.headerBackground}>
        <SafeAreaView edges={['top']} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Dispatch Queue</Text>
          <Text style={styles.subtitle}>
            LIVE MATCHING FOR {worker?.name?.split(' ')[0].toUpperCase() ?? 'PARTNER'}
          </Text>
        </View>
      </View>

      {/* Clean Ivory Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Demo dispatch triggers */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SIMULATE INCOMING JOBS</Text>
            {DEMO_JOBS.map((job) => (
              <View key={job.id} style={styles.demoCard}>
                <View
                  style={[
                    styles.urgencyDot,
                    { backgroundColor: job.urgency === 'emergency' ? Colors.danger : Colors.accentPrimary },
                  ]}
                />
                <View style={styles.demoInfo}>
                  <Text style={styles.demoCustomer}>{job.customerName}</Text>
                  <Text style={styles.demoAddress}>{job.address} · {job.distance} km away</Text>
                  <Text
                    style={[
                      styles.demoUrgency,
                      { color: job.urgency === 'emergency' ? Colors.danger : Colors.textSecondary },
                    ]}
                  >
                    {job.urgency.toUpperCase()} · ₹{job.amount}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.dispatchBtn,
                    { backgroundColor: job.urgency === 'emergency' ? Colors.danger : Colors.accentPrimary },
                  ]}
                  onPress={() => handleSimulate(job)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="notifications" size={14} color={Colors.darkSurfaceDeep} />
                  <Text style={[styles.dispatchBtnText, { color: Colors.darkSurfaceDeep }]}>TEST</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* In Progress */}
          {inProgressJobs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ACTIVE JOBS IN PROGRESS</Text>
              {inProgressJobs.map((job) => (
                <View key={job.id} style={styles.jobCard}>
                  <View style={styles.jobMeta}>
                    <Text style={styles.jobCategory}>{job.category.toUpperCase()}</Text>
                    <View style={styles.inProgressTag}>
                      <Text style={styles.inProgressTagText}>IN PROGRESS</Text>
                    </View>
                  </View>
                  <Text style={styles.jobAmount}>₹{job.amount}</Text>
                  <TouchableOpacity
                    style={styles.completeBtn}
                    onPress={() => handleComplete(job.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-circle" size={16} color={Colors.darkSurfaceDeep} />
                    <Text style={styles.completeBtnText}>MARK COMPLETED</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Completed Today */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>COMPLETED TODAY ({completedJobs.length})</Text>
            {completedJobs.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="checkmark-done-circle-outline" size={32} color={Colors.textMuted} />
                <Text style={styles.emptyText}>NO COMPLETED JOBS YET TODAY.</Text>
              </View>
            ) : (
              completedJobs.map((job) => (
                <View key={job.id} style={styles.completedCard}>
                  <View style={styles.completedSummary}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.completedCategory}>{job.category.toUpperCase()}</Text>
                      <Text style={styles.completedTime}>{job.time ?? 'Today'} · {job.customerName || 'Customer'}</Text>
                    </View>
                    <Text style={styles.completedAmount}>+₹{job.amount}</Text>
                  </View>
                  <FeedbackCard title="Rate the customer" subject={job.customerName || 'your customer'}
                    submitted={feedback.some((entry) => entry.jobId === job.id && entry.fromRole === 'worker')}
                    onSubmit={(entry: any) => submitFeedback({ ...entry, jobId: job.id, fromRole: 'worker', fromUserId: activeWorkerId, toCustomerId: job.customerId })} />
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      <JobModal
        job={currentJob}
        worker={worker}
        visible={showModal}
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  demoInfo: {
    flex: 1,
  },
  demoCustomer: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.bold,
  },
  demoAddress: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  demoUrgency: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  dispatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.full,
  },
  dispatchBtnText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  jobCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  jobMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobCategory: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  inProgressTag: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  inProgressTagText: {
    color: Colors.darkSurfaceDeep,
    fontSize: 9,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  jobAmount: {
    fontSize: Typography.fontSize['xl'],
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accentPrimary,
    borderRadius: Radius.full,
    paddingVertical: 16,
    ...Shadow.glow,
  },
  completeBtnText: {
    color: Colors.darkSurfaceDeep,
    fontSize: 12,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 1,
  },
  completedCard: {
    flexDirection: 'column',
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  completedSummary: { flexDirection: 'row', alignItems: 'center' },
  completedCategory: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  completedTime: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  completedAmount: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accentPrimaryDark,
  },
  emptyCard: {
    backgroundColor: Colors.canvasCream,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  emptyText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
});
