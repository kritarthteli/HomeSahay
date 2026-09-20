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
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';

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

  const handleDemoSelect = (customer) => {
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
                <Ionicons name="home" size={22} color="#fff" />
              </View>
              <Text style={styles.brandTitle}>HomeSahay</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>Customer</Text>
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
                <Ionicons name="shield-checkmark" size={14} color="#34D399" />
                <Text style={styles.featureBadgeText}>Verified Pros</Text>
              </View>
              <View style={styles.featureBadge}>
                <Ionicons name="flash" size={14} color="#FBBF24" />
                <Text style={styles.featureBadgeText}>SOS Dispatch</Text>
              </View>
              <View style={styles.featureBadge}>
                <Ionicons name="sparkles" size={14} color="#818CF8" />
                <Text style={styles.featureBadgeText}>AI Assistant</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Clean White Sheet Card */}
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
                  placeholderTextColor="#9CA3AF"
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
                  placeholderTextColor="#9CA3AF"
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
              >
                <Text style={styles.primaryBtnText}>{loading ? 'Sending OTP…' : 'Continue with OTP'}</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={() => handleVerifyLogin()}
                disabled={loading}
              >
                <Text style={styles.primaryBtnText}>{loading ? 'Verifying…' : 'Verify & Continue'}</Text>
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
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
                >
                  <View style={styles.demoAvatar}>
                    <Text style={styles.demoAvatarText}>{c.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.demoInfo}>
                    <Text style={styles.demoName}>{c.name}</Text>
                    <Text style={styles.demoAddress} numberOfLines={1}>{c.address}</Text>
                  </View>
                  <View style={styles.demoLoginBtn}>
                    <Text style={styles.demoLoginBtnText}>Login</Text>
                    <Ionicons name="chevron-forward" size={14} color="#6366F1" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Cooperative Note */}
            <View style={styles.coopFooter}>
              <Ionicons name="people-outline" size={16} color="#6B7280" />
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
  root: { flex: 1, backgroundColor: '#121212' },
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    backgroundColor: '#121212',
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
    marginBottom: Spacing.md,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  roleTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  roleTagText: {
    color: '#A5B4FC',
    fontSize: 11,
    fontWeight: '600',
  },
  heroHeadline: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 32,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: Typography.fontSize.sm,
    color: '#9CA3AF',
    marginBottom: Spacing.md,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E22',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    gap: 5,
    borderWidth: 1,
    borderColor: '#2D2D35',
  },
  featureBadgeText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '500',
  },

  // Sheet
  sheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  sheetContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: '#6B7280',
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.base,
  },
  inputLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: Radius.lg,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  countryCodeBox: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  countryCodeText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: '#111827',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: Typography.fontSize.base,
    color: '#111827',
    outlineStyle: 'none',
  },
  otpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  demoOtpHint: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
  },
  otpInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: Radius.lg,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: Typography.fontSize.lg,
    color: '#111827',
    textAlign: 'center',
    letterSpacing: 8,
    outlineStyle: 'none',
  },
  primaryBtn: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: Radius.lg,
    marginTop: Spacing.sm,
    gap: 8,
    shadowColor: '#6366F1',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
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
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.8,
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
    borderColor: '#F3F4F6',
    borderRadius: Radius.lg,
    backgroundColor: '#F9FAFB',
  },
  demoAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  demoAvatarText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: '#6366F1',
  },
  demoInfo: {
    flex: 1,
  },
  demoName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: '#111827',
  },
  demoAddress: {
    fontSize: Typography.fontSize.xs,
    color: '#6B7280',
    marginTop: 1,
  },
  demoLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    gap: 2,
  },
  demoLoginBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
  },

  coopFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  coopFooterText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});
