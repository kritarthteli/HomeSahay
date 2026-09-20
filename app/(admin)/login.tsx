import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { Radius } from '../../constants/theme';

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
              <Ionicons name="shield-checkmark" size={28} color="#fff" />
            </View>
            <View>
              <Text style={styles.brandName}>HomeSahay</Text>
              <Text style={styles.brandTagline}>Admin Hub</Text>
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
                  <Ionicons name={f.icon} size={18} color="#fff" />
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
            <Text style={styles.fieldLabel}>Cooperative Branch</Text>
            <View style={styles.branchPicker}>
              {BRANCHES.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.branchOption, selectedBranch === b && styles.branchOptionActive]}
                  onPress={() => setSelectedBranch(b)}
                >
                  <Ionicons
                    name={selectedBranch === b ? 'radio-button-on' : 'radio-button-off'}
                    size={16}
                    color={selectedBranch === b ? '#3c20a1' : '#9CA3AF'}
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
            <Text style={styles.fieldLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.signInBtn, loading && styles.signInBtnLoading]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.signInBtnText}>Signing in…</Text>
            ) : (
              <>
                <Text style={styles.signInBtnText}>Sign In to Hub</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {/* Demo note */}
          <View style={styles.demoNote}>
            <Ionicons name="information-circle-outline" size={15} color="#6B7280" />
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
    backgroundColor: '#1E1B4B',
    padding: 48,
    justifyContent: 'space-between',
    minHeight: '100vh' as any,
  },
  brandContent: { flex: 1, justifyContent: 'center', gap: 32 },
  brandLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  logoIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#3c20a1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  brandTagline: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  brandHeadline: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 48,
  },
  brandSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    lineHeight: 24,
  },
  featureList: { gap: 16 },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  featureLabel: { color: '#fff', fontSize: 14, fontWeight: '700' },
  featureDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  brandVersion: { color: 'rgba(255,255,255,0.25)', fontSize: 12 },

  // Right Form
  formSide: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  formContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
    minHeight: '100vh' as any,
  },
  formCard: {
    width: '100%' as any,
    maxWidth: 440,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 36,
    gap: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  formHeader: { gap: 4 },
  formTitle: { fontSize: 26, fontWeight: '800', color: '#111827' },
  formSubtitle: { fontSize: 14, color: '#6B7280' },

  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#374151' },

  branchPicker: { gap: 6 },
  branchOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  branchOptionActive: {
    borderColor: '#3c20a1',
    backgroundColor: '#EDE9FE',
  },
  branchOptionText: { fontSize: 13, color: '#6B7280', flex: 1 },
  branchOptionTextActive: { color: '#3c20a1', fontWeight: '600' },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    height: '100%' as any,
    outlineStyle: 'none' as any,
  },
  eyeBtn: { padding: 4 },

  signInBtn: {
    backgroundColor: '#3c20a1',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 4,
  },
  signInBtnLoading: { opacity: 0.7 },
  signInBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  demoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 12,
  },
  demoNoteText: { flex: 1, fontSize: 12, color: '#6B7280', lineHeight: 18 },
});
