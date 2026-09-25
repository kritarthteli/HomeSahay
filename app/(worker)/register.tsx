import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState<'services' | 'availability' | 'cooperative' | null>(null);
  const change = (key: keyof FormData, value: string | string[]) => setForm((current) => ({ ...current, [key]: value }));
  const submit = () => {
    if (!form.name.trim() || form.phone.trim().length < 8) return Alert.alert('Add your details', 'Enter your full name and a valid contact number.');
    if (!form.skills.length) return Alert.alert('Choose a service', 'Select at least one service category.');
    setSaving(true);
    const workerId = registerWorker({ ...form, certifications: form.certifications.split(',').map((s) => s.trim()).filter(Boolean) });
    useAppStore.getState().login('worker', workerId);
    setSaving(false);
    Alert.alert('Application received', 'Your profile is saved in this demo session. Identity verification is pending cooperative review.', [{ text: 'Continue', onPress: () => router.replace('/(worker)') }]);
  };
  const field = (label: string, key: Exclude<keyof FormData, 'skills'>, placeholder: string, props: object = {}) => (
    <View style={styles.group} key={key}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <TextInput value={form[key] as string} onChangeText={(v) => change(key, v)} placeholder={placeholder} placeholderTextColor={Colors.textMuted} style={styles.input} {...props} />
    </View>
  );
  const dropdown = (label: string, value: string, type: 'services' | 'availability' | 'cooperative', hint?: string) => (
    <View style={styles.group}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <Pressable style={({ pressed }) => [styles.dropdown, pressed && styles.pressed]} onPress={() => setPicker(type)}>
        <Text style={[styles.dropdownText, !value && styles.placeholder]} numberOfLines={2}>{value || hint}</Text>
        <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
      </Pressable>
    </View>
  );
  const options = picker === 'services' ? CATEGORIES : picker === 'availability' ? ['Weekdays', 'Weekends', 'Flexible'] : COOPS;
  const selected = (v: string) => picker === 'services' ? form.skills.includes(v.toLowerCase()) : picker === 'availability' ? form.availability === v : form.cooperative === v;
  const select = (v: string) => {
    if (picker === 'services') {
      const value = v.toLowerCase();
      change('skills', selected(v) ? form.skills.filter((s) => s !== value) : [...form.skills, value]);
    } else if (picker === 'availability') change('availability', v);
    else change('cooperative', v);
    if (picker !== 'services') setPicker(null);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.65} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color={Colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Partner Registration</Text>
        <View style={styles.headerIcon}><Ionicons name="person-add-outline" size={18} color={Colors.accentPrimaryDark} /></View>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>WORKER APPLICATION · ABOUT 2 MIN</Text>
        <Text style={styles.title}>Let’s get to know you</Text>
        <Text style={styles.subtitle}>Add your details below. You can review everything before submitting.</Text>

        <View style={styles.section}><Text style={styles.sectionTitle}>01  About you</Text>
          {field('Full name', 'name', 'e.g. Asha Kumar', { autoCapitalize: 'words' })}
          {field('Mobile number', 'phone', '+91 98765 43210', { keyboardType: 'phone-pad' })}
          {field('Email (optional)', 'email', 'you@example.com', { keyboardType: 'email-address', autoCapitalize: 'none' })}
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>02  Services</Text>
          {dropdown('What work do you do?', form.skills.length ? form.skills.map((s) => CATEGORIES.find((v) => v.toLowerCase() === s) || s).join(', ') : '', 'services', 'Choose all services you offer')}
          <Text style={styles.helper}>Select every service you are qualified to provide.</Text>
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>03  Experience</Text>
          {field('Years of experience', 'yearsExperience', 'e.g. 4', { keyboardType: 'number-pad' })}
          {field('Certifications / qualifications', 'certifications', 'Separate items with commas', { multiline: true, style: [styles.input, styles.multiline] })}
          <Text style={styles.helper}>Add only qualifications you hold. Documents can be reviewed later by your cooperative.</Text>
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>04  Work area</Text>
          {field('Service area / locality', 'serviceArea', 'e.g. JP Nagar, Bengaluru')}
          {dropdown('Availability', form.availability, 'availability')}
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>05  Membership & verification</Text>
          {dropdown('Cooperative membership', form.cooperative, 'cooperative')}
          <View style={styles.verifyCard}><Ionicons name="shield-checkmark-outline" size={21} color={Colors.accentPrimaryDark} /><View style={{ flex: 1 }}><Text style={styles.verifyTitle}>IDENTITY VERIFICATION</Text><Text style={styles.helper}>Your application stays pending until the cooperative reviews your documents.</Text></View></View>
        </View>
        <Pressable disabled={saving} onPress={submit} style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed, saving && styles.disabled]}>
          <Text style={styles.primaryText}>{saving ? 'SUBMITTING…' : 'SUBMIT APPLICATION'}</Text><Ionicons name="arrow-forward" size={18} color={Colors.darkSurfaceDeep} />
        </Pressable>
        <TouchableOpacity onPress={() => router.replace('/(worker)/login')} style={styles.signin} activeOpacity={0.65}><Text style={styles.signinText}>Already a partner? Sign in</Text></TouchableOpacity>
      </ScrollView>
      <Modal visible={picker !== null} transparent animationType="fade" onRequestClose={() => setPicker(null)}>
        <TouchableOpacity style={styles.scrim} activeOpacity={1} onPress={() => setPicker(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.sheetHeading}><Text style={styles.sheetTitle}>{picker === 'services' ? 'Choose your services' : picker === 'availability' ? 'Choose availability' : 'Choose cooperative'}</Text><TouchableOpacity onPress={() => setPicker(null)}><Ionicons name="close" size={22} color={Colors.textPrimary} /></TouchableOpacity></View>
            <Text style={styles.sheetHint}>{picker === 'services' ? 'You can select more than one.' : 'Tap an option to select it.'}</Text>
            <ScrollView style={styles.optionScroll} keyboardShouldPersistTaps="handled">
              {options.map((v) => <Pressable key={v} style={({ pressed }) => [styles.option, pressed && styles.optionPressed]} onPress={() => select(v)}>
                <Text style={styles.optionText}>{v}</Text><Ionicons name={selected(v) ? 'checkbox' : 'square-outline'} size={21} color={selected(v) ? Colors.accentPrimaryDark : Colors.textMuted} />
              </Pressable>)}
            </ScrollView>
            {picker === 'services' && <Pressable style={({ pressed }) => [styles.doneButton, pressed && styles.primaryPressed]} onPress={() => setPicker(null)}><Text style={styles.doneText}>DONE</Text></Pressable>}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.canvasLight },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, gap: Spacing.md },
  backBtn: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: Colors.canvasCream, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight },
  headerTitle: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, flex: 1 },
  headerIcon: { width: 38, height: 38, borderRadius: Radius.full, backgroundColor: Colors.accentPrimary, justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['4xl'] },
  eyebrow: { fontSize: 10, fontFamily: Typography.fontFamily.mono, letterSpacing: 1.2, color: Colors.accentPrimaryDark, fontWeight: Typography.fontWeight.bold, marginTop: Spacing.lg },
  title: { fontSize: 30, fontFamily: Typography.fontFamily.display, lineHeight: 36, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, marginTop: Spacing.sm, letterSpacing: -1 },
  subtitle: { fontSize: Typography.fontSize.sm, lineHeight: 19, color: Colors.textSecondary, marginTop: Spacing.xs, marginBottom: Spacing.lg },
  section: { backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: Colors.borderLight, borderRadius: Radius.xl, padding: Spacing.lg, marginTop: Spacing.md, ...Shadow.soft },
  sectionTitle: { color: Colors.textPrimary, fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.bold, marginBottom: Spacing.lg },
  group: { marginBottom: Spacing.lg },
  label: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary, letterSpacing: 1, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: Colors.borderLight, backgroundColor: Colors.canvasLight, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 15, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.body, color: Colors.textPrimary },
  multiline: { minHeight: 90, borderRadius: Radius.md, textAlignVertical: 'top' },
  dropdown: { minHeight: 54, borderWidth: 1, borderColor: Colors.borderLight, backgroundColor: Colors.canvasLight, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm },
  pressed: { backgroundColor: Colors.canvasCream, borderColor: Colors.accentPrimaryDark, transform: [{ scale: 0.99 }] },
  dropdownText: { flex: 1, color: Colors.textPrimary, fontSize: Typography.fontSize.sm, lineHeight: 20 },
  placeholder: { color: Colors.textMuted },
  helper: { color: Colors.textSecondary, fontSize: 11, lineHeight: 17, marginTop: -Spacing.xs },
  verifyCard: { flexDirection: 'row', padding: Spacing.md, gap: Spacing.md, backgroundColor: Colors.canvasCream, borderRadius: Radius.md, marginTop: Spacing.xs, borderWidth: 1, borderColor: Colors.borderLight },
  verifyTitle: { color: Colors.textPrimary, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, fontSize: 10, letterSpacing: 1, marginBottom: 6 },
  primary: { backgroundColor: Colors.accentPrimary, borderRadius: Radius.full, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: Spacing.xl, ...Shadow.glow },
  primaryPressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.6 },
  primaryText: { color: Colors.darkSurfaceDeep, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.black, fontSize: 12, letterSpacing: 1 },
  signin: { alignItems: 'center', padding: Spacing.xl },
  signinText: { color: Colors.textPrimary, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, fontSize: 11 },
  scrim: { flex: 1, backgroundColor: 'rgba(10,10,10,0.48)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.surfaceLight, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.xl, maxHeight: '78%' },
  sheetHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { color: Colors.textPrimary, fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black },
  sheetHint: { color: Colors.textSecondary, fontSize: Typography.fontSize.sm, marginTop: Spacing.xs, marginBottom: Spacing.md },
  optionScroll: { flexGrow: 0 },
  option: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: Colors.borderLight, paddingVertical: Spacing.sm },
  optionPressed: { backgroundColor: Colors.canvasCream, paddingHorizontal: Spacing.sm },
  optionText: { color: Colors.textPrimary, fontSize: Typography.fontSize.sm, flex: 1, paddingRight: Spacing.md },
  doneButton: { backgroundColor: Colors.accentPrimary, alignItems: 'center', padding: Spacing.md, borderRadius: Radius.full, marginTop: Spacing.lg },
  doneText: { color: Colors.darkSurfaceDeep, fontSize: 12, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.black, letterSpacing: 1 },
});
