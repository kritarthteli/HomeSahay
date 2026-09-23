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

  const handleSimulate = (job) => {
    setCurrentJob(job);
    setShowModal(true);
  };

  const handleAccept = (job) => {
    acceptJob(job.id);
    setShowModal(false);
    addNotification({ type: 'job', title: `Job Accepted!`, message: `Head to ${job.address}` });
  };

  const handleReject = (reason) => {
    setShowModal(false);
  };

  const handleComplete = (jobId) => {
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
            Live order matching for {worker?.name?.split(' ')[0] ?? 'Partner'}
          </Text>
        </View>
      </View>

      {/* Clean White Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Demo dispatch triggers */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Simulate Incoming Jobs</Text>
            {DEMO_JOBS.map((job) => (
              <View key={job.id} style={styles.demoCard}>
                <View
                  style={[
                    styles.urgencyDot,
                    { backgroundColor: job.urgency === 'emergency' ? '#EF4444' : '#6366F1' },
                  ]}
                />
                <View style={styles.demoInfo}>
                  <Text style={styles.demoCustomer}>{job.customerName}</Text>
                  <Text style={styles.demoAddress}>{job.address} · {job.distance} km away</Text>
                  <Text
                    style={[
                      styles.demoUrgency,
                      { color: job.urgency === 'emergency' ? '#DC2626' : '#4B5563' },
                    ]}
                  >
                    {job.urgency.toUpperCase()} · ₹{job.amount}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.dispatchBtn,
                    { backgroundColor: job.urgency === 'emergency' ? '#EF4444' : '#3c20a1ff' },
                  ]}
                  onPress={() => handleSimulate(job)}
                >
                  <Ionicons name="notifications" size={14} color="#fff" />
                  <Text style={styles.dispatchBtnText}>Test Alert</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* In Progress */}
          {inProgressJobs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Jobs In Progress</Text>
              {inProgressJobs.map((job) => (
                <View key={job.id} style={styles.jobCard}>
                  <View style={styles.jobMeta}>
                    <Text style={styles.jobCategory}>{job.category.toUpperCase()}</Text>
                    <View style={styles.inProgressTag}>
                      <Text style={styles.inProgressTagText}>In Progress</Text>
                    </View>
                  </View>
                  <Text style={styles.jobAmount}>₹{job.amount}</Text>
                  <TouchableOpacity
                    style={styles.completeBtn}
                    onPress={() => handleComplete(job.id)}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                    <Text style={styles.completeBtnText}>Mark Completed</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Completed Today */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed Today ({completedJobs.length})</Text>
            {completedJobs.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="checkmark-done-circle-outline" size={36} color="#9CA3AF" />
                <Text style={styles.emptyText}>No completed jobs yet today.</Text>
              </View>
            ) : (
              completedJobs.map((job) => (
                <View key={job.id} style={styles.completedCard}>
                  <View style={styles.completedSummary}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.completedCategory}>{job.category.toUpperCase()}</Text>
                      <Text style={styles.completedTime}>{job.time ?? 'Today'} · Customer: {job.customerName || 'Customer'}</Text>
                    </View>
                    <Text style={styles.completedAmount}>+₹{job.amount}</Text>
                  </View>
                  <FeedbackCard title="Rate the customer" subject={job.customerName || 'your customer'}
                    submitted={feedback.some((entry) => entry.jobId === job.id && entry.fromRole === 'worker')}
                    onSubmit={(entry) => submitFeedback({ ...entry, jobId: job.id, fromRole: 'worker', fromUserId: activeWorkerId, toCustomerId: job.customerId })} />
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
  title: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
  },
  subtitle: {
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  urgencyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  demoInfo: {
    flex: 1,
  },
  demoCustomer: {
    color: '#111827',
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },
  demoAddress: {
    color: '#6B7280',
    fontSize: Typography.fontSize.xs,
    marginTop: 1,
  },
  demoUrgency: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  dispatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  dispatchBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  jobCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: Spacing.sm,
  },
  jobMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  jobCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  inProgressTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  inProgressTagText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '700',
  },
  jobAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: Spacing.md,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#3c20a1ff',
    borderRadius: Radius.md,
    paddingVertical: 12,
  },
  completeBtnText: {
    color: '#fff',
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },
  completedCard: {
    flexDirection: 'column',
    backgroundColor: '#F9FAFB',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: Spacing.xs,
  },
  completedSummary: { flexDirection: 'row', alignItems: 'center' },
  completedCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  completedTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  completedAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: '800',
    color: '#059669',
  },
  emptyCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    fontSize: Typography.fontSize.xs,
    color: '#9CA3AF',
  },
});
