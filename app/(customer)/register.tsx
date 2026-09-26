import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';

export default function CustomerRegister() {
  const router = useRouter();
  const registerWithPassword = useAppStore((s) => s.registerWithPassword);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!phone.trim() || phone.trim().replace(/[^0-9]/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Please enter your service address.');
      return;
    }

    setLoading(true);
    try {
      const customer = await registerWithPassword({
        name: name.trim(),
        phone: phone.trim().startsWith('+91') ? phone.trim() : `+91 ${phone.trim()}`,
        password,
        email: email.trim(),
        address: address.trim(),
        gender,
      });

      // Auth state change triggers auto-redirect via _layout.tsx
      // No manual navigation needed — the layout effect will handle it
    } catch (err) {
      setErrorMsg(err.message || 'Could not complete registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={styles.securityBadge}>
            <Ionicons name="lock-closed" size={12} color="#059669" />
            <Text style={styles.securityText}>ENCRYPTED</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introCard}>
            <View style={styles.introIconBadge}>
              <Ionicons name="sparkles" size={20} color={Colors.accentPrimaryDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.introHeading}>Join the Cooperative</Text>
              <Text style={styles.introSub}>
                Fair rates, verified professionals, and zero commission surges. Get ₹100 welcome bonus!
              </Text>
            </View>
          </View>

          {/* Error Message */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Form Fields */}
          <View style={styles.group}>
            <Text style={styles.label}>FULL NAME *</Text>
            <TextInput
              value={name}
              onChangeText={(t) => { setName(t); setErrorMsg(''); }}
              placeholder="e.g. Ramesh Chandra"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
            />
          </View>

          <View style={styles.group}>
            <Text style={styles.label}>MOBILE NUMBER *</Text>
            <TextInput
              value={phone}
              onChangeText={(t) => { setPhone(t); setErrorMsg(''); }}
              placeholder="10-digit mobile number"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              maxLength={10}
              style={styles.input}
            />
          </View>

          <View style={styles.group}>
            <Text style={styles.label}>CREATE PASSWORD *</Text>
            <View style={styles.passwordRow}>
              <TextInput
                value={password}
                onChangeText={(t) => { setPassword(t); setErrorMsg(''); }}
                placeholder="Min 4 characters"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={styles.passwordInput}
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

          <View style={styles.group}>
            <Text style={styles.label}>CONFIRM PASSWORD *</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setErrorMsg(''); }}
              placeholder="Re-enter your password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <View style={styles.group}>
            <Text style={styles.label}>EMAIL ADDRESS (OPTIONAL)</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <View style={styles.group}>
            <Text style={styles.label}>PRIMARY SERVICE ADDRESS *</Text>
            <TextInput
              value={address}
              onChangeText={(t) => { setAddress(t); setErrorMsg(''); }}
              placeholder="House/Flat No., Street, Area (e.g. JP Nagar 2nd Phase)"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={2}
              style={[styles.input, styles.multilineInput]}
            />
          </View>

          <View style={styles.group}>
            <Text style={styles.label}>GENDER</Text>
            <View style={styles.genderRow}>
              {(['Female', 'Male', 'Other'] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                  onPress={() => setGender(g)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.genderBtnText, gender === g && styles.genderBtnTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.darkSurfaceDeep} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={Colors.darkSurfaceDeep} />
                <Text style={styles.submitBtnText}>CREATE ACCOUNT & GET ₹100 BONUS</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.footerNote}>
            <Ionicons name="shield-checkmark-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.footerNoteText}>
              Password is encrypted with bcrypt. Stored securely in PostgreSQL.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surfaceBg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.white,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  securityText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.5,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl * 2,
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.accentPrimaryLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.accentPrimary,
  },
  introIconBadge: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introHeading: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  introSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
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
  group: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    ...Shadow.card,
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.md,
    overflow: 'hidden',
    ...Shadow.card,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
  },
  eyeBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: Colors.darkSurfaceDeep,
    borderColor: Colors.darkSurfaceDeep,
  },
  genderBtnText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  genderBtnTextActive: {
    color: Colors.accentPrimary,
    fontWeight: Typography.fontWeight.bold,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accentPrimary,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    marginTop: Spacing.md,
    ...Shadow.glow,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: Colors.darkSurfaceDeep,
    fontWeight: Typography.fontWeight.black,
    fontSize: Typography.fontSize.sm,
    letterSpacing: 0.5,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.xl,
  },
  footerNoteText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
});
