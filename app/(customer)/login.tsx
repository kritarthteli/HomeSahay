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
import { MOCK_CUSTOMERS } from '../../data/seedData';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';

export default function CustomerLogin() {
  const router = useRouter();
  const { login } = useAppStore();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setOtp('2026'); // Pre-fill mock OTP for easy testing
    }, 600);
  };

  const handleVerifyLogin = (customerId = 'c001') => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login('customer', customerId);
      router.replace('/(customer)');
    }, 400);
  };

  const handleDemoSelect = (customer: any) => {
    setPhone(customer.phone.replace('+91 ', ''));
    handleVerifyLogin(customer.id);
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
                <Ionicons name="flash" size={14} color={Colors.accentPrimary} />
                <Text style={styles.featureBadgeText}>SOS Dispatch</Text>
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
            <Text style={styles.sheetTitle}>Log in or Sign up</Text>
            <Text style={styles.sheetSubtitle}>Enter your phone number to book home services</Text>

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
                  onChangeText={setPhone}
                />
              </View>
            </View>

            {/* OTP Section (Visible after Send OTP) */}
            {otpSent && (
              <View style={styles.inputGroup}>
                <View style={styles.otpHeader}>
                  <Text style={styles.inputLabel}>Enter 4-digit OTP</Text>
                  <Text style={styles.demoOtpHint}>Mock OTP: 2026</Text>
                </View>
                <TextInput
                  style={styles.otpInput}
                  placeholder="• • • •"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={4}
                  value={otp}
                  onChangeText={setOtp}
                />
              </View>
            )}

            {/* Action Button */}
            {!otpSent ? (
              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleSendOtp}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryBtnText}>{loading ? 'SENDING OTP…' : 'CONTINUE WITH OTP'}</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.darkSurfaceDeep} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={() => handleVerifyLogin()}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryBtnText}>{loading ? 'VERIFYING…' : 'VERIFY & CONTINUE'}</Text>
                <Ionicons name="checkmark-circle" size={18} color={Colors.darkSurfaceDeep} />
              </TouchableOpacity>
            )}

            {/* Quick Demo Login Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>QUICK DEMO ACCOUNTS</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* 1-Tap Demo Profiles */}
            <View style={styles.demoList}>
              {MOCK_CUSTOMERS.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.demoCard}
                  onPress={() => handleDemoSelect(c)}
                  activeOpacity={0.7}
                >
                  <View style={styles.demoAvatar}>
                    <Text style={styles.demoAvatarText}>{c.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.demoInfo}>
                    <Text style={styles.demoName}>{c.name}</Text>
                    <Text style={styles.demoAddress} numberOfLines={1}>{c.address}</Text>
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
  otpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoOtpHint: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.accentPrimaryDark,
    fontWeight: Typography.fontWeight.bold,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 16,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 16,
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
