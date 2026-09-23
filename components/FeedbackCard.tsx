import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type FeedbackEntry = { rating: number; comment: string; report: boolean };
type FeedbackCardProps = { title: string; subject: string; submitted: boolean; onSubmit: (entry: FeedbackEntry) => void };

export default function FeedbackCard({ title, subject, submitted, onSubmit }: FeedbackCardProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [report, setReport] = useState(false);
  const [done, setDone] = useState(submitted);
  const submit = () => {
    if (!rating) return;
    onSubmit({ rating, comment: comment.trim(), report });
    setDone(true);
  };
  return <View style={styles.card}>
    {done ? <View style={styles.thanks}><Ionicons name="checkmark-circle" size={22} color="#059669"/><Text style={styles.title}>Thanks for sharing</Text><Text style={styles.copy}>Your feedback for {subject} has been recorded.</Text></View> : <>
      <Text style={styles.eyebrow}>JOB COMPLETE</Text><Text style={styles.title}>{title}</Text><Text style={styles.copy}>How was your experience with {subject}?</Text>
      <View style={styles.stars}>{[1,2,3,4,5].map((n) => <TouchableOpacity key={n} accessibilityLabel={`${n} stars`} onPress={() => setRating(n)}><Ionicons name={rating >= n ? 'star' : 'star-outline'} size={32} color="#F59E0B" /></TouchableOpacity>)}</View>
      <TextInput value={comment} onChangeText={setComment} placeholder="Share a few details (optional)" placeholderTextColor="#9CA3AF" multiline style={styles.input}/>
      <TouchableOpacity style={styles.report} onPress={() => setReport(!report)}><Ionicons name={report ? 'checkbox' : 'square-outline'} size={18} color={report ? '#B91C1C' : '#6B7280'}/><Text style={styles.reportText}>Report a problem or dispute</Text></TouchableOpacity>
      {report && <TextInput placeholder="Tell us what happened (optional)" value={comment} onChangeText={setComment} multiline style={[styles.input, { borderColor: '#FECACA' }]} />}
      <TouchableOpacity disabled={!rating} onPress={submit} style={[styles.button, !rating && styles.disabled]}><Text style={styles.buttonText}>Submit feedback</Text></TouchableOpacity>
    </>}</View>;
}
const styles = StyleSheet.create({ card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 18, marginTop: 16 }, eyebrow: { color: '#059669', fontSize: 10, fontWeight: '800', letterSpacing: 1 }, title: { color: '#111827', fontSize: 18, fontWeight: '800', marginTop: 5 }, copy: { color: '#6B7280', fontSize: 13, lineHeight: 19, marginTop: 5 }, stars: { flexDirection: 'row', gap: 8, marginVertical: 14 }, input: { minHeight: 72, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 11, color: '#111827', textAlignVertical: 'top', fontSize: 13 }, report: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 12 }, reportText: { color: '#4B5563', fontSize: 13 }, button: { backgroundColor: '#3c20a1', borderRadius: 10, padding: 13, alignItems: 'center' }, disabled: { opacity: 0.45 }, buttonText: { color: '#fff', fontWeight: '800' }, thanks: { alignItems: 'center', padding: 8 }, });
