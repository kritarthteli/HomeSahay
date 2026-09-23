import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { MOCK_WORKERS } from '../../data/seedData';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';

export default function WorkerLogin() {
  const router = useRouter();
  const { login } = useAppStore();

  const [partnerId, setPartnerId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [selectedCoop, setSelectedCoop] = useState('JP Nagar Workers Cooperative');
  const [loading, setLoading] = useState(false);

  const COOPERATIVES = [
    'JP Nagar Workers Cooperative',
    'South Bangalore Women Cooperative',
    'Jayanagar Artisans Guild',
  ];

  const handleLogin = (workerId = 'w001') => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login('worker', workerId);
      router.replace('/(worker)');
    }, 400);
  };

  const handleDemoSelect = (worker: any) => {
    login('worker', worker.id);
    router.replace('/(worker)');
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Dark Hero Header */}
        <View style={styles.header}>
          <SafeAreaView edges={['top']} />
          <View style={styles.headerContent}>
            <View style={styles.brandRow}>
              <View style={styles.logoBadge}>
                <Ionicons name="construct" size={20} color={Colors.darkSurfaceDeep} />
              </View>
              <Text style={styles.brandTitle}>HomeSahay</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>PARTNER</Text>
              </View>
            </View>

            <Text style={styles.heroHeadline}>
              Empowering local gig pros{'\n'}with zero commission.
            </Text>
            <Text style={styles.heroSub}>
              Direct cooperative dispatch · 100% daily earnings · Transparent queue
            </Text>

            <View style={styles.badgesRow}>
              <View style={styles.featureBadge}>
                <Ionicons name="cash-outline" size={14} color={Colors.accentPrimary} />
                <Text style={styles.featureBadgeText}>Daily Payout</Text>
              </View>
              <View style={styles.featureBadge}>
                <Ionicons name="shield-outline" size={14} color={Colors.accentPrimary} />
                <Text style={styles.featureBadgeText}>Coop Member</Text>
              </View>
              <View style={styles.featureBadge}>
                <Ionicons name="heart-outline" size={14} color={Colors.accentPrimary} />
                <Text style={styles.featureBadgeText}>Health Cover</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Clean Ivory Sheet Card */}
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Partner Sign In</Text>
            <Text style={styles.sheetSubtitle}>Access your dispatch jobs and daily earnings</Text>

            {/* Cooperative Society Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>REGISTERED COOPERATIVE</Text>
              <View style={styles.coopSelectorWrap}>
                {COOPERATIVES.map((coop) => (
                  <TouchableOpacity
                    key={coop}
                    style={[styles.coopPill, selectedCoop === coop && styles.coopPillActive]}
                    onPress={() => setSelectedCoop(coop)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={selectedCoop === coop ? 'checkmark-circle' : 'ellipse-outline'}
                      size={16}
                      color={selectedCoop === coop ? Colors.accentPrimaryDark : Colors.textMuted}
                    />
                    <Text
                      style={[styles.coopPillText, selectedCoop === coop && styles.coopPillTextActive]}
                      numberOfLines={1}
                    >
                      {coop}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Partner Mobile / ID */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PARTNER ID / MOBILE</Text>
              <View style={styles.inputFieldBox}>
                <Ionicons name="person-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. W001 or 98765 43210"
                  placeholderTextColor={Colors.textMuted}
                  value={partnerId}
                  onChangeText={setPartnerId}
                />
              </View>
            </View>

            {/* 4-digit Passcode */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>SECURITY PIN</Text>
                <Text style={styles.demoPinHint}>Default PIN: 1234</Text>
              </View>
              <View style={styles.inputFieldBox}>
                <Ionicons name="key-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter 4-digit PIN"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry
                  keyboardType="number-pad"
                  maxLength={4}
                  value={passcode}
                  onChangeText={setPasscode}
                />
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={() => handleLogin()}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>{loading ? 'AUTHENTICATING…' : 'ENTER WORKSPACE'}</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.darkSurfaceDeep} />
            </TouchableOpacity>

            {/* Beginner Training CTA */}
            <TouchableOpacity
              style={styles.trainingBtn}
              onPress={() => router.push('/(worker)/training')}
              activeOpacity={0.8}
            >
              <Ionicons name="school-outline" size={18} color={Colors.accentPrimaryDark} />
              <Text style={styles.trainingBtnText}>Beginner? Join Training Program</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.trainingBtn} onPress={() => router.push('/(worker)/register')} activeOpacity={0.8}>
              <Ionicons name="person-add-outline" size={18} color={Colors.accentPrimaryDark} />
              <Text style={styles.trainingBtnText}>New partner? Create your profile</Text>
            </TouchableOpacity>

            {/* Quick Demo Login Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>QUICK DEMO WORKERS</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* 1-Tap Demo Workers */}
            <View style={styles.demoList}>
              {MOCK_WORKERS.slice(0, 3).map((w) => (
                <TouchableOpacity
                  key={w.id}
                  style={styles.demoCard}
                  onPress={() => handleDemoSelect(w)}
                  activeOpacity={0.7}
                >
                  <View style={styles.demoAvatar}>
                    <Text style={styles.demoAvatarText}>{w.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.demoInfo}>
                    <View style={styles.workerNameRow}>
                      <Text style={styles.demoName}>{w.name}</Text>
                      <View style={styles.verifiedTag}>
                        <Ionicons name="checkmark-circle" size={12} color={Colors.accentPrimaryDark} />
                        <Text style={styles.verifiedTagText}>Verified</Text>
                      </View>
                    </View>
                    <Text style={styles.demoCategory}>
                      {w.category.toUpperCase()} · ₹{w.pricePerHour}/hr · {w.rating} ★
                    </Text>
                  </View>
                  <View style={styles.demoLoginBtn}>
                    <Text style={styles.demoLoginBtnText}>ENTER</Text>
                    <Ionicons name="chevron-forward" size={14} color={Colors.textPrimary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.darkSurfaceDeep },
  container: { flex: 1, backgroundColor: Colors.darkSurfaceDeep },
  header: {
    backgroundColor: Colors.darkSurfaceDeep,
    paddingBottom: Spacing.xl,
  },
  headerContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.lg,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.glow,
  },
  brandTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.black,
    color: Colors.textInverse,
    letterSpacing: -0.5,
  },
  roleTag: {
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  roleTagText: {
    color: Colors.textInverseMuted,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  heroHeadline: {
    fontSize: 32,
    fontWeight: Typography.fontWeight.black,
    color: Colors.textInverse,
    lineHeight: 38,
    letterSpacing: -1,
    marginBottom: 12,
  },
  heroSub: {
    fontSize: Typography.fontSize.base,
    color: Colors.textInverseMuted,
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkSurface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  featureBadgeText: {
    color: Colors.textInverse,
    fontSize: 12,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.medium,
  },

  // Sheet
  sheet: {
    flex: 1,
    backgroundColor: Colors.canvasLight,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  sheetContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing['4xl'],
  },
  sheetTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: -1,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoPinHint: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.accentPrimaryDark,
    fontWeight: Typography.fontWeight.bold,
  },
  coopSelectorWrap: {
    gap: 8,
  },
  coopPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surfaceLight,
    gap: 10,
  },
  coopPillActive: {
    borderColor: Colors.accentPrimary,
    backgroundColor: Colors.borderLight,
  },
  coopPillText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.semibold,
  },
  coopPillTextActive: {
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.bold,
  },
  inputFieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.md,
    gap: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.textPrimary,
    outlineStyle: 'none',
  },
  primaryBtn: {
    backgroundColor: Colors.accentPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
    gap: 10,
    ...Shadow.glow,
  },
  btnDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
  },
  primaryBtnText: {
    color: Colors.darkSurfaceDeep,
    fontSize: 14,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 1,
  },
  trainingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
    backgroundColor: Colors.canvasCream,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 10,
  },
  trainingBtnText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  dividerText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 1.5,
  },

  // Demo Profiles
  demoList: {
    gap: Spacing.sm,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceLight,
  },
  demoAvatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.canvasCream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  demoAvatarText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  demoInfo: {
    flex: 1,
  },
  workerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demoName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentPrimary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    gap: 2,
  },
  verifiedTagText: {
    fontSize: 9,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.darkSurfaceDeep,
    fontWeight: Typography.fontWeight.bold,
  },
  demoCategory: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  demoLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvasCream,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    gap: 4,
  },
  demoLoginBtnText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
});
