import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';

const CATEGORIES = ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Cleaner', 'Caregiver', 'Driver', 'Gardener', 'Technician', 'Cook'];
const COOPS = ['JP Nagar Workers Cooperative', 'South Bangalore Women Cooperative', 'Jayanagar Artisans Guild'];
type FormData = { name: string; phone: string; email: string; skills: string[]; yearsExperience: string; certifications: string; serviceArea: string; availability: string; cooperative: string };
const blank: FormData = { name: '', phone: '', email: '', skills: [], yearsExperience: '', certifications: '', serviceArea: '', availability: 'Flexible', cooperative: COOPS[0] };

export default function WorkerRegister() {
  const router = useRouter();
  const registerWorker = useAppStore((s) => s.registerWorker);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const steps = ['About you', 'Services', 'Experience', 'Work area', 'Verification'];
  const progress = useMemo(() => `${step + 1} of ${steps.length}`, [step]);
  const change = (key: keyof FormData, value: string | string[]) => setForm((current) => ({ ...current, [key]: value }));

  const next = () => {
    if (step === 0 && (!form.name.trim() || form.phone.trim().length < 8)) return Alert.alert('Add your details', 'Enter your full name and a valid contact number to continue.');
    if (step === 1 && !form.skills.length) return Alert.alert('Choose a service', 'Select at least one service category.');
    if (step < steps.length - 1) return setStep(step + 1);
    setSaving(true);
    const workerId = registerWorker({ ...form, certifications: form.certifications.split(',').map((s) => s.trim()).filter(Boolean) });
    useAppStore.getState().login('worker', workerId);
    setSaving(false);
    Alert.alert('Application received', 'Your profile is saved in this demo session. Identity verification is pending cooperative review.', [{ text: 'Continue', onPress: () => router.replace('/(worker)') }]);
  };

  const field = (label: string, key: Exclude<keyof FormData, 'skills'>, placeholder: string, props: object = {}) => (
    <View style={styles.group} key={key}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <TextInput 
        value={form[key] as string} 
        onChangeText={(v) => change(key, v)} 
        placeholder={placeholder} 
        placeholderTextColor={Colors.textMuted} 
        style={styles.input} 
        {...props} 
      />
    </View>
  );
  
  const toggleSkill = (label: string) => {
    const value = label.toLowerCase();
    change('skills', form.skills.includes(value) ? form.skills.filter((s) => s !== value) : [...form.skills, value]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step ? setStep(step - 1) : router.back()} activeOpacity={0.7} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partner Registration</Text>
        <Text style={styles.counter}>{progress}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${((step + 1) / steps.length) * 100}%` }]} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>STEP {step + 1} · {steps[step].toUpperCase()}</Text>
        <Text style={styles.title}>{['Let’s get to know you', 'What work do you do?', 'Share your experience', 'Where can you work?', 'Verification & membership'][step]}</Text>
        <Text style={styles.subtitle}>{['Basic contact details for your partner profile.', 'Choose every service you are qualified to provide.', 'Add relevant experience and qualifications.', 'Set your service area and availability.', 'Your application stays pending until documents are reviewed.'][step]}</Text>
        
        {step === 0 && <>
          {field('Full name', 'name', 'e.g. Asha Kumar', { autoCapitalize: 'words' })}
          {field('Mobile number', 'phone', '+91 98765 43210', { keyboardType: 'phone-pad' })}
          {field('Email (optional)', 'email', 'you@example.com', { keyboardType: 'email-address', autoCapitalize: 'none' })}
        </>}
        
        {step === 1 && (
          <View style={styles.chips}>
            {CATEGORIES.map((item) => { 
              const active = form.skills.includes(item.toLowerCase()); 
              return (
                <TouchableOpacity key={item} style={[styles.chip, active && styles.chipOn]} onPress={() => toggleSkill(item)} activeOpacity={0.8}>
                  <Text style={[styles.chipText, active && styles.chipTextOn]}>{item}</Text>
                  {active && <Ionicons name="checkmark-circle" size={14} color={Colors.darkSurfaceDeep} />}
                </TouchableOpacity>
              ); 
            })}
          </View>
        )}
        
        {step === 2 && <>
          {field('Years of experience', 'yearsExperience', 'e.g. 4', { keyboardType: 'number-pad' })}
          {field('Certifications / qualifications', 'certifications', 'Separate items with commas', { multiline: true, style: [styles.input, styles.multiline] })}
          <Text style={styles.note}>Add only qualifications you hold. Document upload can be connected when a verification service is available.</Text>
        </>}
        
        {step === 3 && <>
          {field('Service area / locality', 'serviceArea', 'e.g. JP Nagar, Bengaluru') }
          <Text style={styles.label}>AVAILABILITY</Text>
          <View style={styles.chips}>
            {['Weekdays', 'Weekends', 'Flexible'].map((v) => (
              <TouchableOpacity key={v} onPress={() => change('availability', v)} style={[styles.chip, form.availability === v && styles.chipOn]} activeOpacity={0.8}>
                <Text style={[styles.chipText, form.availability === v && styles.chipTextOn]}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>}
        
        {step === 4 && <>
          <Text style={styles.label}>COOPERATIVE MEMBERSHIP</Text>
          <View style={styles.optionList}>
            {COOPS.map((v) => (
              <TouchableOpacity key={v} onPress={() => change('cooperative', v)} style={styles.option} activeOpacity={0.8}>
                <Ionicons name={form.cooperative === v ? 'radio-button-on' : 'radio-button-off'} size={18} color={form.cooperative === v ? Colors.textPrimary : Colors.textMuted} />
                <Text style={styles.optionText}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.verifyCard}>
            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.accentPrimaryDark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.verifyTitle}>IDENTITY VERIFICATION</Text>
              <Text style={styles.note}>Document upload and approval are handled by the cooperative. Your profile will remain unverified until reviewed.</Text>
            </View>
          </View>
          <Text style={styles.noteBottom}>Registration information is held in local demo state; no backend persistence or document upload is configured.</Text>
        </>}
        
        <TouchableOpacity disabled={saving} onPress={next} style={styles.primary} activeOpacity={0.8}>
          <Text style={styles.primaryText}>{saving ? 'SUBMITTING…' : step === steps.length - 1 ? 'SUBMIT APPLICATION' : 'CONTINUE'}</Text>
          <Ionicons name={step === steps.length - 1 ? 'checkmark' : 'arrow-forward'} size={16} color={Colors.darkSurfaceDeep} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.replace('/(worker)/login')} style={styles.signin} activeOpacity={0.7}>
          <Text style={styles.signinText}>Already a partner? Sign in</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ 
  root: { flex: 1, backgroundColor: Colors.canvasLight }, 
  header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.xl, gap: Spacing.md }, 
  backBtn: { width: 32, height: 32, borderRadius: Radius.full, backgroundColor: Colors.canvasCream, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight },
  headerTitle: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, flex: 1, letterSpacing: -0.5 }, 
  counter: { color: Colors.textSecondary, fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold }, 
  progressTrack: { height: 4, backgroundColor: Colors.borderLight }, 
  progressFill: { height: 4, backgroundColor: Colors.accentPrimary, ...Shadow.glow }, 
  content: { padding: Spacing.xl, paddingBottom: Spacing['4xl'] }, 
  eyebrow: { fontSize: 10, fontFamily: Typography.fontFamily.mono, letterSpacing: 1.5, color: Colors.accentPrimaryDark, fontWeight: Typography.fontWeight.bold, marginTop: Spacing.sm }, 
  title: { fontSize: Typography.fontSize['2xl'], fontFamily: Typography.fontFamily.display, lineHeight: 32, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, marginTop: Spacing.sm, letterSpacing: -1 }, 
  subtitle: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, marginTop: Spacing.sm, marginBottom: Spacing['2xl'] }, 
  group: { marginBottom: Spacing.xl }, 
  label: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary, letterSpacing: 1, marginBottom: 8 }, 
  input: { borderWidth: 1, borderColor: Colors.borderLight, backgroundColor: Colors.surfaceLight, borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: 16, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.mono, color: Colors.textPrimary, outlineStyle: 'none' }, 
  multiline: { minHeight: 90, borderRadius: Radius.xl, textAlignVertical: 'top' }, 
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: Spacing.xs, marginBottom: Spacing.xl }, 
  chip: { borderWidth: 1, borderColor: Colors.borderLight, backgroundColor: Colors.surfaceLight, paddingHorizontal: 16, paddingVertical: 12, borderRadius: Radius.full, flexDirection: 'row', gap: 6, alignItems: 'center' }, 
  chipOn: { backgroundColor: Colors.accentPrimary, borderColor: Colors.accentPrimary }, 
  chipText: { color: Colors.textSecondary, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, fontSize: 11 }, 
  chipTextOn: { color: Colors.darkSurfaceDeep }, 
  note: { color: Colors.textSecondary, fontSize: 11, lineHeight: 16, marginTop: Spacing.sm }, 
  noteBottom: { color: Colors.textMuted, fontSize: 10, fontFamily: Typography.fontFamily.mono, marginTop: Spacing.xl },
  optionList: { borderWidth: 1, borderColor: Colors.borderLight, borderRadius: Radius.lg, backgroundColor: Colors.surfaceLight, paddingHorizontal: Spacing.md, marginBottom: Spacing.lg }, 
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 }, 
  optionText: { color: Colors.textPrimary, fontFamily: Typography.fontFamily.body, fontWeight: Typography.fontWeight.semibold, fontSize: Typography.fontSize.sm, flex: 1 }, 
  verifyCard: { flexDirection: 'row', padding: Spacing.lg, gap: Spacing.md, backgroundColor: Colors.canvasCream, borderRadius: Radius.lg, marginTop: Spacing.sm, borderWidth: 1, borderColor: Colors.borderLight }, 
  verifyTitle: { color: Colors.textPrimary, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, fontSize: 10, letterSpacing: 1 }, 
  primary: { backgroundColor: Colors.accentPrimary, borderRadius: Radius.full, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: Spacing['2xl'], ...Shadow.glow }, 
  primaryText: { color: Colors.darkSurfaceDeep, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.black, fontSize: 12, letterSpacing: 1 }, 
  signin: { alignItems: 'center', padding: Spacing.xl }, 
  signinText: { color: Colors.textPrimary, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, fontSize: 11 } 
});
