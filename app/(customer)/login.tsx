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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';
import { MOCK_CUSTOMERS } from '../../data/seedData';

const DEMO_ACCOUNT_IDS = ['c001', 'c002', 'c003'];

export default function CustomerLogin() {
  const router = useRouter();
  const loginWithPassword = useAppStore((s) => s.loginWithPassword);
  const customers = useAppStore((s) => s.customers);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');

    if (!phone || phone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }

    setLoading(true);
    try {
      await loginWithPassword(phone, password);
      // Auth state change triggers auto-redirect via _layout.tsx
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (customer) => {
    setErrorMsg('');
    const cleanPhone = customer.phone ? customer.phone.replace(/[^0-9]/g, '').slice(-10) : '';
    setPhone(cleanPhone);
    setPassword('demo123');
    setLoading(true);
    try {
      await loginWithPassword(cleanPhone, 'demo123');
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
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
                <Ionicons name="home" size={20} color={Colors.darkSurfaceDeep} />
              </View>
              <Text style={styles.brandTitle}>HomeSahay</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>CUSTOMER</Text>
              </View>
            </View>

            <Text style={styles.heroHeadline}>
              Trusted home services{'\n'}at cooperative rates.
            </Text>
            <Text style={styles.heroSub}>
              Zero surge fees · AI-powered matching · Fair worker wages
            </Text>

            <View style={styles.badgesRow}>
              <View style={styles.featureBadge}>
                <Ionicons name="shield-checkmark" size={14} color={Colors.accentPrimary} />
                <Text style={styles.featureBadgeText}>Verified Pros</Text>
              </View>
              <View style={styles.featureBadge}>
                <Ionicons name="lock-closed" size={14} color={Colors.accentPrimary} />
                <Text style={styles.featureBadgeText}>JWT Secured</Text>
              </View>
              <View style={styles.featureBadge}>
                <Ionicons name="sparkles" size={14} color={Colors.accentPrimary} />
                <Text style={styles.featureBadgeText}>AI Assistant</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Clean Ivory Sheet Card */}
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Welcome Back</Text>
            <Text style={styles.sheetSubtitle}>Log in with your phone number and password</Text>

            {/* Error Message */}
            {errorMsg ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Mobile Number Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.countryCodeBox}>
                  <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={(t) => { setPhone(t); setErrorMsg(''); }}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setErrorMsg(''); }}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.darkSurfaceDeep} />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>LOG IN SECURELY</Text>
                  <Ionicons name="log-in-outline" size={18} color={Colors.darkSurfaceDeep} />
                </>
              )}
            </TouchableOpacity>

            {/* Registration Link */}
            <TouchableOpacity
              style={styles.registerLinkBtn}
              onPress={() => router.push('/(customer)/register')}
              activeOpacity={0.8}
            >
              <Ionicons name="person-add-outline" size={18} color={Colors.accentPrimaryDark} />
              <Text style={styles.registerLinkText}>New customer? Create your account</Text>
            </TouchableOpacity>

            {/* Quick Demo Login Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>DEMO ACCOUNTS (password: demo123)</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* 1-Tap Demo Profiles */}
            <View style={styles.demoList}>
              {DEMO_ACCOUNT_IDS.map((id) => (
                (customers && customers.find((c) => c.id === id)) ||
                MOCK_CUSTOMERS.find((c) => c.id === id)
              )).filter(Boolean).map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.demoCard}
                  onPress={() => handleDemoLogin(c)}
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <View style={styles.demoAvatar}>
                    <Text style={styles.demoAvatarText}>{c.name ? c.name.charAt(0) : 'C'}</Text>
                  </View>
                  <View style={styles.demoInfo}>
                    <Text style={styles.demoName}>{c.name}</Text>
                    <Text style={styles.demoAddress} numberOfLines={1}>{c.address || c.phone}</Text>
                  </View>
                  <View style={styles.demoLoginBtn}>
                    <Text style={styles.demoLoginBtnText}>LOGIN</Text>
                    <Ionicons name="chevron-forward" size={14} color={Colors.textPrimary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Cooperative Note */}
            <View style={styles.coopFooter}>
              <Ionicons name="people-outline" size={16} color={Colors.textMuted} />
              <Text style={styles.coopFooterText}>
                Supported by South Bangalore Cooperative Society · Non-profit fair commission model
              </Text>
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
    fontSize: 36,
    fontWeight: Typography.fontWeight.black,
    color: Colors.textInverse,
    lineHeight: 40,
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
    fontWeight: Typography.fontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: -1,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: '#DC2626',
    fontWeight: Typography.fontWeight.medium,
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
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceLight,
    overflow: 'hidden',
  },
  countryCodeBox: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 16,
    backgroundColor: Colors.canvasCream,
    borderRightWidth: 1,
    borderRightColor: Colors.borderLight,
  },
  countryCodeText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 16,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.textPrimary,
    outlineStyle: 'none',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceLight,
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 16,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.textPrimary,
    outlineStyle: 'none',
  },
  eyeBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 16,
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
    letterSpacing: 1,
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
  demoName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  demoAddress: {
    fontSize: Typography.fontSize.xs,
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

  registerLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accentPrimaryLight,
    borderWidth: 1,
    borderColor: Colors.accentPrimary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
  registerLinkText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accentPrimaryDark,
  },

  coopFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: Spacing['2xl'],
    paddingHorizontal: Spacing.sm,
  },
  coopFooterText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    flex: 1,
  },
});
