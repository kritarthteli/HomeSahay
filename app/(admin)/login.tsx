import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';

export default function AdminLogin() {
  const router = useRouter();
  const { login } = useAppStore();

  const [email, setEmail] = useState('admin@jpnagar.coop');
  const [password, setPassword] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('JP Nagar Central Hub (Sector 4)');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const BRANCHES = [
    'JP Nagar Central Hub (Sector 4)',
    'South Bangalore Women Federation',
    'Jayanagar Cooperative Zonal Office',
  ];

  const FEATURES = [
    { icon: 'finger-print-outline' as const, label: 'KYC Approval', desc: 'Verify and onboard gig workers' },
    { icon: 'scale-outline' as const, label: 'Fairness Engine', desc: 'Anti-monopoly dispatch algorithm' },
    { icon: 'stats-chart-outline' as const, label: 'Live Analytics', desc: 'Real-time governance metrics' },
    { icon: 'shield-checkmark-outline' as const, label: 'Gov Certified', desc: 'Cooperative compliance verified' },
  ];

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login('admin');
      router.replace({ pathname: '/(admin)' });
    }, 500);
  };

  return (
    <View style={styles.root}>
      {/* Left Branding Panel */}
      <View style={styles.brandPanel}>
        <View style={styles.brandContent}>
          {/* Logo */}
          <View style={styles.brandLogoRow}>
            <View style={styles.logoIcon}>
              <Ionicons name="shield-checkmark" size={24} color={Colors.darkSurfaceDeep} />
            </View>
            <View>
              <Text style={styles.brandName}>HomeSahay</Text>
              <Text style={styles.brandTagline}>ADMIN HUB</Text>
            </View>
          </View>

          {/* Headline */}
          <Text style={styles.brandHeadline}>
            Cooperative{'\n'}governance &{'\n'}dispatch oversight.
          </Text>
          <Text style={styles.brandSubtitle}>
            Empowering fair, transparent gig work through algorithmic equity and cooperative ownership.
          </Text>

          {/* Feature Chips */}
          <View style={styles.featureList}>
            {FEATURES.map((f) => (
              <View key={f.label} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name={f.icon} size={18} color={Colors.textInverse} />
                </View>
                <View>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom version info */}
        <Text style={styles.brandVersion}>SIH 2024 Prototype · v1.0.0</Text>
      </View>

      {/* Right Login Form */}
      <ScrollView style={styles.formSide} contentContainerStyle={styles.formContent}>
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Welcome back</Text>
            <Text style={styles.formSubtitle}>Sign in to your admin account</Text>
          </View>

          {/* Branch Selector */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>COOPERATIVE BRANCH</Text>
            <View style={styles.branchPicker}>
              {BRANCHES.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.branchOption, selectedBranch === b && styles.branchOptionActive]}
                  onPress={() => setSelectedBranch(b)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={selectedBranch === b ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={selectedBranch === b ? Colors.textPrimary : Colors.textMuted}
                  />
                  <Text style={[styles.branchOptionText, selectedBranch === b && styles.branchOptionTextActive]}>
                    {b}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Email Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Enter your password"
                placeholderTextColor={Colors.textMuted}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.signInBtn, loading && styles.signInBtnLoading]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <Text style={styles.signInBtnText}>SIGNING IN…</Text>
            ) : (
              <>
                <Text style={styles.signInBtnText}>SIGN IN TO HUB</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.darkSurfaceDeep} />
              </>
            )}
          </TouchableOpacity>

          {/* Demo note */}
          <View style={styles.demoNote}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.demoNoteText}>
              Demo mode — credentials are pre-filled. Click Sign In to access the portal.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    minHeight: '100vh' as any,
  },

  // Left Panel
  brandPanel: {
    width: '42%' as any,
    backgroundColor: Colors.darkSurfaceDeep,
    padding: Spacing['4xl'],
    justifyContent: 'space-between',
    minHeight: '100vh' as any,
  },
  brandContent: { flex: 1, justifyContent: 'center', gap: Spacing['2xl'] },
  brandLogoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.xl,
    backgroundColor: Colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.glow,
  },
  brandName: { color: Colors.textInverse, fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, letterSpacing: -0.5 },
  brandTagline: { color: Colors.textInverseMuted, fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, letterSpacing: 1 },
  brandHeadline: {
    color: Colors.textInverse,
    fontSize: 42,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    lineHeight: 48,
    letterSpacing: -1.5,
  },
  brandSubtitle: {
    color: Colors.textInverseMuted,
    fontSize: Typography.fontSize.md,
    lineHeight: 26,
  },
  featureList: { gap: Spacing.xl },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceInteractive,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  featureLabel: { color: Colors.textInverse, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.bold, marginBottom: 2 },
  featureDesc: { color: Colors.textInverseMuted, fontSize: 11, fontFamily: Typography.fontFamily.mono },
  brandVersion: { color: Colors.textInverseMuted, fontSize: 10, fontFamily: Typography.fontFamily.mono },

  // Right Form
  formSide: {
    flex: 1,
    backgroundColor: Colors.canvasLight,
  },
  formContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['4xl'],
    minHeight: '100vh' as any,
  },
  formCard: {
    width: '100%' as any,
    maxWidth: 440,
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    gap: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.soft,
  },
  formHeader: { gap: 6 },
  formTitle: { fontSize: Typography.fontSize['3xl'], fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, letterSpacing: -1 },
  formSubtitle: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },

  fieldGroup: { gap: Spacing.sm },
  fieldLabel: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary, letterSpacing: 1, marginBottom: 4 },

  branchPicker: { gap: Spacing.sm },
  branchOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surfaceLight,
  },
  branchOptionActive: {
    borderColor: Colors.textPrimary,
    backgroundColor: Colors.borderLight,
  },
  branchOptionText: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.body, color: Colors.textSecondary, flex: 1 },
  branchOptionTextActive: { color: Colors.textPrimary, fontWeight: Typography.fontWeight.bold },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.md,
    height: 54,
  },
  inputIcon: { marginRight: Spacing.md },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.textPrimary,
    height: '100%' as any,
    outlineStyle: 'none' as any,
  },
  eyeBtn: { padding: 8 },

  signInBtn: {
    backgroundColor: Colors.accentPrimary,
    borderRadius: Radius.full,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: Spacing.sm,
    ...Shadow.glow,
  },
  signInBtnLoading: { opacity: 0.7 },
  signInBtnText: { color: Colors.darkSurfaceDeep, fontSize: 12, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.black, letterSpacing: 1 },

  demoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.canvasCream,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  demoNoteText: { flex: 1, fontSize: 11, fontFamily: Typography.fontFamily.mono, color: Colors.textSecondary, lineHeight: 18 },
});
