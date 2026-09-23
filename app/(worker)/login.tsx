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
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';

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

  const handleDemoSelect = (worker) => {
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
                <Ionicons name="construct" size={20} color="#fff" />
              </View>
              <Text style={styles.brandTitle}>HomeSahay</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>Partner</Text>
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
                <Ionicons name="cash-outline" size={14} color="#3c20a1ff" />
                <Text style={styles.featureBadgeText}>Daily Payout</Text>
              </View>
              <View style={styles.featureBadge}>
                <Ionicons name="shield-outline" size={14} color="#818CF8" />
                <Text style={styles.featureBadgeText}>Coop Member</Text>
              </View>
              <View style={styles.featureBadge}>
                <Ionicons name="heart-outline" size={14} color="#F87171" />
                <Text style={styles.featureBadgeText}>Health Cover</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Clean White Sheet Card */}
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Partner Sign In</Text>
            <Text style={styles.sheetSubtitle}>Access your dispatch jobs and daily earnings</Text>

            {/* Cooperative Society Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Registered Cooperative</Text>
              <View style={styles.coopSelectorWrap}>
                {COOPERATIVES.map((coop) => (
                  <TouchableOpacity
                    key={coop}
                    style={[styles.coopPill, selectedCoop === coop && styles.coopPillActive]}
                    onPress={() => setSelectedCoop(coop)}
                  >
                    <Ionicons
                      name={selectedCoop === coop ? 'checkmark-circle' : 'ellipse-outline'}
                      size={14}
                      color={selectedCoop === coop ? '#059669' : '#9CA3AF'}
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
              <Text style={styles.inputLabel}>Partner ID / Mobile</Text>
              <View style={styles.inputFieldBox}>
                <Ionicons name="person-outline" size={18} color="#9CA3AF" />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. W001 or 98765 43210"
                  placeholderTextColor="#9CA3AF"
                  value={partnerId}
                  onChangeText={setPartnerId}
                />
              </View>
            </View>

            {/* 4-digit Passcode */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Security PIN</Text>
                <Text style={styles.demoPinHint}>Default PIN: 1234</Text>
              </View>
              <View style={styles.inputFieldBox}>
                <Ionicons name="key-outline" size={18} color="#9CA3AF" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter 4-digit PIN"
                  placeholderTextColor="#9CA3AF"
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
            >
              <Text style={styles.primaryBtnText}>{loading ? 'Authenticating…' : 'Enter Partner Workspace'}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>

            {/* Beginner Training CTA */}
            <TouchableOpacity
              style={styles.trainingBtn}
              onPress={() => router.push('/(worker)/training')}
            >
              <Ionicons name="school-outline" size={18} color="#059669" />
              <Text style={styles.trainingBtnText}>Beginner? Join Training Program</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.trainingBtn} onPress={() => router.push('/(worker)/register')}>
              <Ionicons name="person-add-outline" size={18} color="#059669" />
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
                >
                  <View style={styles.demoAvatar}>
                    <Text style={styles.demoAvatarText}>{w.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.demoInfo}>
                    <View style={styles.workerNameRow}>
                      <Text style={styles.demoName}>{w.name}</Text>
                      <View style={styles.verifiedTag}>
                        <Ionicons name="checkmark-circle" size={12} color="#3c20a1ff" />
                        <Text style={styles.verifiedTagText}>Verified</Text>
                      </View>
                    </View>
                    <Text style={styles.demoCategory}>
                      {w.category.toUpperCase()} · ₹{w.pricePerHour}/hr · {w.rating} ★
                    </Text>
                  </View>
                  <View style={styles.demoLoginBtn}>
                    <Text style={styles.demoLoginBtnText}>Enter</Text>
                    <Ionicons name="chevron-forward" size={14} color="#059669" />
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
    backgroundColor: '#3c20a1ff',
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
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  roleTagText: {
    color: '#6EE7B7',
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
    marginBottom: Spacing.lg,
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  demoPinHint: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  coopSelectorWrap: {
    gap: 6,
  },
  coopPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    gap: 8,
  },
  coopPillActive: {
    borderColor: '#3c20a1ff',
    backgroundColor: '#ECFDF5',
  },
  coopPillText: {
    fontSize: Typography.fontSize.xs,
    color: '#4B5563',
    fontWeight: '500',
  },
  coopPillTextActive: {
    color: '#065F46',
    fontWeight: '700',
  },
  inputFieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: Radius.lg,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: Spacing.md,
    gap: 10,
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: Typography.fontSize.base,
    color: '#111827',
    outlineStyle: 'none',
  },
  primaryBtn: {
    backgroundColor: '#3c20a1ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: Radius.lg,
    marginTop: Spacing.xs,
    gap: 8,
    shadowColor: '#3c20a1ff',
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
  trainingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: Radius.lg,
    marginTop: Spacing.sm,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 8,
  },
  trainingBtnText: {
    color: '#059669',
    fontSize: Typography.fontSize.sm,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  demoAvatarText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: '#059669',
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
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: '#111827',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    gap: 2,
  },
  verifiedTagText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  demoCategory: {
    fontSize: Typography.fontSize.xs,
    color: '#6B7280',
    marginTop: 2,
  },
  demoLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    gap: 2,
  },
  demoLoginBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
});
