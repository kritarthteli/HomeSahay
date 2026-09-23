import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';

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
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={Colors.textInverse} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <View style={styles.tag}>
              <Ionicons name="school" size={14} color={Colors.accentPrimary} />
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
                <Text style={styles.progressTitle}>YOUR PROGRESS</Text>
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
                <Text style={styles.completeActionText}>SIMULATE COMPLETION</Text>
                <Ionicons name="play-forward" size={16} color={Colors.darkSurfaceDeep} />
              </TouchableOpacity>
            </View>
          )}

          {/* Certificate State */}
          {isCertified && (
            <View style={styles.certificateCard}>
              <View style={styles.certRibbon}>
                <Ionicons name="ribbon" size={48} color={Colors.accentPrimaryDark} />
              </View>
              <Text style={styles.certTitle}>Congratulations!</Text>
              <Text style={styles.certSub}>You are now a HomeSahay Certified Worker.</Text>
              
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyForWork} activeOpacity={0.8}>
                <Text style={styles.applyBtnText}>APPLY FOR WORK</Text>
                <Ionicons name="checkmark-done" size={18} color={Colors.darkSurfaceDeep} />
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionTitle}>CURRICULUM</Text>
          
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
                      color={isCompleted ? Colors.accentPrimaryDark : (isCurrent ? Colors.accentPrimary : Colors.textMuted)} 
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
  mainContainer: { flex: 1, backgroundColor: Colors.canvasDark },
  headerBackground: { backgroundColor: Colors.canvasDark, paddingBottom: Spacing.xl },
  headerContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: Radius.full, backgroundColor: Colors.surfaceInteractive, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.borderDark },
  headerTextWrap: { marginBottom: Spacing.sm },
  tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.darkSurfaceDeep, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, alignSelf: 'flex-start', gap: 6, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.borderDark },
  tagText: { color: Colors.accentPrimary, fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, letterSpacing: 1 },
  title: { color: Colors.textInverse, fontSize: Typography.fontSize['2xl'], fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, letterSpacing: -1, marginBottom: 4 },
  subtitle: { color: Colors.textInverseMuted, fontSize: Typography.fontSize.sm, lineHeight: 22 },
  
  bottomSheet: { flex: 1, backgroundColor: Colors.canvasLight, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, overflow: 'hidden' },
  scrollContent: { padding: Spacing.xl, paddingBottom: Spacing['4xl'] },
  
  progressCard: { backgroundColor: Colors.surfaceLight, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.borderLight, marginBottom: Spacing.xl },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  progressTitle: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary, letterSpacing: 1 },
  progressValue: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.accentPrimaryDark },
  progressBarBg: { height: 6, backgroundColor: Colors.borderLight, borderRadius: Radius.full, overflow: 'hidden', marginBottom: Spacing.xl },
  progressBarFill: { height: '100%', backgroundColor: Colors.accentPrimaryDark, borderRadius: Radius.full },
  
  completeActionBtn: { backgroundColor: Colors.accentPrimary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: Radius.full, gap: 10, ...Shadow.glow },
  completeActionText: { color: Colors.darkSurfaceDeep, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.black, fontSize: 12, letterSpacing: 1 },
  
  certificateCard: { backgroundColor: Colors.accentPrimary, borderRadius: Radius.lg, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.accentPrimaryDark, alignItems: 'center', marginBottom: Spacing.xl },
  certRibbon: { width: 90, height: 90, borderRadius: Radius.full, backgroundColor: Colors.canvasCream, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
  certTitle: { fontSize: Typography.fontSize['2xl'], fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.darkSurfaceDeep, marginBottom: 8, letterSpacing: -1 },
  certSub: { fontSize: Typography.fontSize.sm, color: Colors.darkSurfaceDeep, textAlign: 'center', marginBottom: Spacing.xl, fontWeight: Typography.fontWeight.semibold },
  applyBtn: { backgroundColor: Colors.darkSurfaceDeep, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: 18, borderRadius: Radius.full, gap: 10, width: '100%', justifyContent: 'center' },
  applyBtnText: { color: Colors.textInverse, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.black, fontSize: 12, letterSpacing: 1 },
  
  sectionTitle: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textMuted, marginBottom: Spacing.md, letterSpacing: 1.5 },
  modulesList: { gap: Spacing.md },
  moduleCard: { flexDirection: 'row', backgroundColor: Colors.surfaceLight, padding: Spacing.lg, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.borderLight, gap: Spacing.md },
  moduleCardCompleted: { backgroundColor: Colors.canvasCream, borderColor: Colors.borderLight },
  moduleCardCurrent: { borderColor: Colors.accentPrimaryDark, backgroundColor: Colors.surfaceLight },
  moduleIconBox: { width: 44, height: 44, borderRadius: Radius.full, backgroundColor: Colors.borderLight, justifyContent: 'center', alignItems: 'center' },
  moduleIconBoxCompleted: { backgroundColor: Colors.borderLight },
  moduleIconBoxCurrent: { backgroundColor: Colors.darkSurfaceDeep },
  moduleInfo: { flex: 1 },
  moduleTitle: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary, marginBottom: 4 },
  moduleTitleCompleted: { color: Colors.textSecondary },
  moduleDesc: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
});
