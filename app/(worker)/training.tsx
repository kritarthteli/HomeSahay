import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';

export default function TrainingPortal() {
  const router = useRouter();
  const { traineeProgress, isCertified, completeModule, resetTraining } = useAppStore();

  const handleApplyForWork = () => {
    // In a real app, this would submit KYC docs and set status to pending.
    // For the prototype, we reset and send them to login.
    resetTraining();
    router.replace('/(worker)/login');
  };

  const modules = [
    { id: 1, title: 'Module 1: Safety & Ethics', desc: 'Platform guidelines, customer communication, and safety protocols.', progressAt: 34 },
    { id: 2, title: 'Module 2: Core Skills Mastery', desc: 'Best practices for delivering high-quality home services.', progressAt: 68 },
    { id: 3, title: 'Module 3: Final Assessment', desc: 'A quick quiz to test your readiness for gig dispatch.', progressAt: 100 },
  ];

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerBackground}>
        <SafeAreaView edges={['top']} />
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <View style={styles.tag}>
              <Ionicons name="school" size={12} color="#3c20a1ff" />
              <Text style={styles.tagText}>BEGINNER PROGRAM</Text>
            </View>
            <Text style={styles.title}>Training Academy</Text>
            <Text style={styles.subtitle}>Complete the modules to get certified and start earning.</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomSheet}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Progress Tracker */}
          {!isCertified && (
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Your Progress</Text>
                <Text style={styles.progressValue}>{traineeProgress}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${traineeProgress}%` }]} />
              </View>
              
              <TouchableOpacity
                style={styles.completeActionBtn}
                onPress={completeModule}
                activeOpacity={0.8}
              >
                <Text style={styles.completeActionText}>Simulate Module Completion</Text>
                <Ionicons name="play-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {/* Certificate State */}
          {isCertified && (
            <View style={styles.certificateCard}>
              <View style={styles.certRibbon}>
                <Ionicons name="ribbon" size={48} color="#3c20a1ff" />
              </View>
              <Text style={styles.certTitle}>Congratulations!</Text>
              <Text style={styles.certSub}>You are now a HomeSahay Certified Worker.</Text>
              
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyForWork}>
                <Text style={styles.applyBtnText}>Apply for Verification & Work</Text>
                <Ionicons name="checkmark-done" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionTitle}>Curriculum</Text>
          
          <View style={styles.modulesList}>
            {modules.map((mod, i) => {
              const isCompleted = traineeProgress >= mod.progressAt;
              const isCurrent = traineeProgress < mod.progressAt && traineeProgress >= (modules[i-1]?.progressAt || 0);
              
              return (
                <View key={mod.id} style={[styles.moduleCard, isCompleted && styles.moduleCardCompleted, isCurrent && styles.moduleCardCurrent]}>
                  <View style={[styles.moduleIconBox, isCompleted && styles.moduleIconBoxCompleted, isCurrent && styles.moduleIconBoxCurrent]}>
                    <Ionicons 
                      name={isCompleted ? "checkmark" : (isCurrent ? "play" : "lock-closed")} 
                      size={18} 
                      color={isCompleted ? "#3c20a1ff" : (isCurrent ? "#6366F1" : "#9CA3AF")} 
                    />
                  </View>
                  <View style={styles.moduleInfo}>
                    <Text style={[styles.moduleTitle, isCompleted && styles.moduleTitleCompleted]}>{mod.title}</Text>
                    <Text style={styles.moduleDesc}>{mod.desc}</Text>
                  </View>
                </View>
              )
            })}
          </View>
          
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#121212' },
  headerBackground: { backgroundColor: '#121212', paddingBottom: Spacing.xl },
  headerContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm },
  backBtn: { marginBottom: Spacing.md, alignSelf: 'flex-start' },
  tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, alignSelf: 'flex-start', gap: 4, marginBottom: Spacing.sm },
  tagText: { color: '#3c20a1ff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#9CA3AF', fontSize: Typography.fontSize.sm, marginTop: 4 },
  
  bottomSheet: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  scrollContent: { padding: Spacing.xl, paddingBottom: Spacing['3xl'] },
  
  progressCard: { backgroundColor: '#F9FAFB', borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: Spacing.xl },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  progressTitle: { fontSize: Typography.fontSize.base, fontWeight: '700', color: '#111827' },
  progressValue: { fontSize: Typography.fontSize.lg, fontWeight: '800', color: '#3c20a1ff' },
  progressBarBg: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden', marginBottom: Spacing.lg },
  progressBarFill: { height: '100%', backgroundColor: '#3c20a1ff', borderRadius: 4 },
  
  completeActionBtn: { backgroundColor: '#6366F1', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: Radius.md, gap: 8 },
  completeActionText: { color: '#fff', fontWeight: '700', fontSize: Typography.fontSize.sm },
  
  certificateCard: { backgroundColor: '#FFFBEB', borderRadius: Radius.lg, padding: Spacing.xl, borderWidth: 1, borderColor: '#FDE68A', alignItems: 'center', marginBottom: Spacing.xl },
  certRibbon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  certTitle: { fontSize: 22, fontWeight: '800', color: '#92400E', marginBottom: 4 },
  certSub: { fontSize: Typography.fontSize.sm, color: '#B45309', textAlign: 'center', marginBottom: Spacing.xl },
  applyBtn: { backgroundColor: '#3c20a1ff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: 14, borderRadius: Radius.lg, gap: 8, width: '100%', justifyContent: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: Typography.fontSize.base },
  
  sectionTitle: { fontSize: Typography.fontSize.lg, fontWeight: '700', color: '#111827', marginBottom: Spacing.md },
  modulesList: { gap: Spacing.md },
  moduleCard: { flexDirection: 'row', backgroundColor: '#F9FAFB', padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, borderColor: '#E5E7EB', gap: Spacing.md },
  moduleCardCompleted: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  moduleCardCurrent: { borderColor: '#A5B4FC', backgroundColor: '#EEF2FF' },
  moduleIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  moduleIconBoxCompleted: { backgroundColor: '#D1FAE5' },
  moduleIconBoxCurrent: { backgroundColor: '#E0E7FF' },
  moduleInfo: { flex: 1 },
  moduleTitle: { fontSize: Typography.fontSize.sm, fontWeight: '700', color: '#374151', marginBottom: 2 },
  moduleTitleCompleted: { color: '#065F46' },
  moduleDesc: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
});
