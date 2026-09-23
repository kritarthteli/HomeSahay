import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';

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

  const field = (label: string, key: Exclude<keyof FormData, 'skills'>, placeholder: string, props: object = {}) => <View style={styles.group} key={key}><Text style={styles.label}>{label}</Text><TextInput value={form[key] as string} onChangeText={(v) => change(key, v)} placeholder={placeholder} placeholderTextColor="#9CA3AF" style={styles.input} {...props} /></View>;
  const toggleSkill = (label: string) => {
    const value = label.toLowerCase();
    change('skills', form.skills.includes(value) ? form.skills.filter((s) => s !== value) : [...form.skills, value]);
  };

  return <SafeAreaView style={styles.root} edges={['top']}>
    <View style={styles.header}><TouchableOpacity onPress={() => step ? setStep(step - 1) : router.back()}><Ionicons name="arrow-back" size={22} color="#111827" /></TouchableOpacity><Text style={styles.headerTitle}>Partner registration</Text><Text style={styles.counter}>{progress}</Text></View>
    <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${((step + 1) / steps.length) * 100}%` }]} /></View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>STEP {step + 1} · {steps[step].toUpperCase()}</Text>
      <Text style={styles.title}>{['Let’s get to know you', 'What work do you do?', 'Share your experience', 'Where can you work?', 'Verification & membership'][step]}</Text>
      <Text style={styles.subtitle}>{['Basic contact details for your partner profile.', 'Choose every service you are qualified to provide.', 'Add relevant experience and qualifications.', 'Set your service area and availability.', 'Your application stays pending until documents are reviewed.'][step]}</Text>
      {step === 0 && <>{field('Full name', 'name', 'e.g. Asha Kumar', { autoCapitalize: 'words' })}{field('Mobile number', 'phone', '+91 98765 43210', { keyboardType: 'phone-pad' })}{field('Email (optional)', 'email', 'you@example.com', { keyboardType: 'email-address', autoCapitalize: 'none' })}</>}
      {step === 1 && <View style={styles.chips}>{CATEGORIES.map((item) => { const active = form.skills.includes(item.toLowerCase()); return <TouchableOpacity key={item} style={[styles.chip, active && styles.chipOn]} onPress={() => toggleSkill(item)}><Text style={[styles.chipText, active && styles.chipTextOn]}>{item}</Text>{active && <Ionicons name="checkmark-circle" size={16} color="#fff" />}</TouchableOpacity>; })}</View>}
      {step === 2 && <>{field('Years of experience', 'yearsExperience', 'e.g. 4', { keyboardType: 'number-pad' })}{field('Certifications / qualifications', 'certifications', 'Separate items with commas', { multiline: true, style: [styles.input, styles.multiline] })}<Text style={styles.note}>Add only qualifications you hold. Document upload can be connected when a verification service is available.</Text></>}
      {step === 3 && <>{field('Service area / locality', 'serviceArea', 'e.g. JP Nagar, Bengaluru') }<Text style={styles.label}>Availability</Text><View style={styles.chips}>{['Weekdays', 'Weekends', 'Flexible'].map((v) => <TouchableOpacity key={v} onPress={() => change('availability', v)} style={[styles.chip, form.availability === v && styles.chipOn]}><Text style={[styles.chipText, form.availability === v && styles.chipTextOn]}>{v}</Text></TouchableOpacity>)}</View></>}
      {step === 4 && <><Text style={styles.label}>Cooperative membership</Text><View style={styles.optionList}>{COOPS.map((v) => <TouchableOpacity key={v} onPress={() => change('cooperative', v)} style={styles.option}><Ionicons name={form.cooperative === v ? 'radio-button-on' : 'radio-button-off'} size={20} color={form.cooperative === v ? '#3c20a1' : '#9CA3AF'} /><Text style={styles.optionText}>{v}</Text></TouchableOpacity>)}</View><View style={styles.verifyCard}><Ionicons name="shield-checkmark-outline" size={22} color="#3c20a1"/><View style={{ flex: 1 }}><Text style={styles.verifyTitle}>Identity verification</Text><Text style={styles.note}>Document upload and approval are handled by the cooperative. Your profile will remain unverified until reviewed.</Text></View></View><Text style={styles.note}>Registration information is held in local demo state; no backend persistence or document upload is configured.</Text></>}
      <TouchableOpacity disabled={saving} onPress={next} style={styles.primary}><Text style={styles.primaryText}>{saving ? 'Submitting…' : step === steps.length - 1 ? 'Submit application' : 'Continue'}</Text><Ionicons name={step === steps.length - 1 ? 'checkmark' : 'arrow-forward'} size={18} color="#fff" /></TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace('/(worker)/login')} style={styles.signin}><Text style={styles.signinText}>Already a partner? Sign in</Text></TouchableOpacity>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#fff' }, header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 14 }, headerTitle: { fontSize: 17, fontWeight: '800', color: '#111827', flex: 1 }, counter: { color: '#6B7280', fontSize: 12, fontWeight: '700' }, progressTrack: { height: 4, backgroundColor: '#E5E7EB' }, progressFill: { height: 4, backgroundColor: '#3c20a1' }, content: { padding: 24, paddingBottom: 40 }, eyebrow: { fontSize: 11, letterSpacing: 1, color: '#3c20a1', fontWeight: '800', marginTop: 12 }, title: { fontSize: 26, lineHeight: 32, fontWeight: '800', color: '#111827', marginTop: 10 }, subtitle: { fontSize: 14, lineHeight: 21, color: '#6B7280', marginTop: 8, marginBottom: 24 }, group: { marginBottom: 16 }, label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 }, input: { borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: '#111827' }, multiline: { minHeight: 90, textAlignVertical: 'top' }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 10, marginBottom: 24 }, chip: { borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 13, paddingVertical: 10, borderRadius: 24, flexDirection: 'row', gap: 6, alignItems: 'center' }, chipOn: { backgroundColor: '#3c20a1', borderColor: '#3c20a1' }, chipText: { color: '#374151', fontWeight: '600', fontSize: 13 }, chipTextOn: { color: '#fff' }, note: { color: '#6B7280', fontSize: 12, lineHeight: 18, marginTop: 10 }, optionList: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, marginBottom: 18 }, option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 10 }, optionText: { color: '#374151', fontSize: 13, flex: 1 }, verifyCard: { flexDirection: 'row', padding: 15, gap: 12, backgroundColor: '#F5F3FF', borderRadius: 14, marginTop: 8 }, verifyTitle: { color: '#111827', fontWeight: '800', fontSize: 14 }, primary: { backgroundColor: '#3c20a1', borderRadius: 13, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 28 }, primaryText: { color: '#fff', fontWeight: '800', fontSize: 15 }, signin: { alignItems: 'center', padding: 18 }, signinText: { color: '#3c20a1', fontWeight: '700', fontSize: 13 } });
