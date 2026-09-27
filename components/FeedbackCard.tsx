import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadow } from '../constants/theme';

export default function FeedbackCard({ title, subject, submitted, onSubmit }: any) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [report, setReport] = useState(false);
  const [done, setDone] = useState(submitted);

  if (done) {
    return (
      <View style={styles.card}>
        <View style={styles.thanks}>
          <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
          <Text style={styles.title}>Thanks for sharing</Text>
          <Text style={styles.copy}>Your feedback for {subject} has been recorded.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>RATE YOUR EXPERIENCE</Text>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => setRating(n)} activeOpacity={0.7}>
            <Ionicons name={rating >= n ? 'star' : 'star-outline'} size={36} color={Colors.accentPrimary} />
          </TouchableOpacity>
        ))}
      </View>
      <TextInput 
        value={comment} 
        onChangeText={setComment} 
        placeholder="Share a few details (optional)" 
        placeholderTextColor={Colors.textMuted} 
        multiline 
        style={styles.input}
      />
      <TouchableOpacity style={styles.report} onPress={() => setReport(!report)} activeOpacity={0.8}>
        <Ionicons name={report ? 'checkbox' : 'square-outline'} size={20} color={report ? Colors.danger : Colors.textMuted} />
        <Text style={styles.reportText}>Report a problem or dispute</Text>
      </TouchableOpacity>
      {report && (
        <TextInput 
          placeholder="Tell us what happened (optional)" 
          value={comment} 
          onChangeText={setComment} 
          multiline 
          style={[styles.input, { borderColor: Colors.dangerTint, backgroundColor: Colors.surfaceLight }]} 
        />
      )}
      <TouchableOpacity 
        style={[styles.button, rating === 0 && styles.disabled]} 
        disabled={rating === 0}
        onPress={() => { setDone(true); onSubmit?.({ rating, comment, report }); }}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>SUBMIT FEEDBACK</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.canvasLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginTop: Spacing.md,
    ...Shadow.sm,
  },
  eyebrow: {
    color: Colors.accentPrimaryDark,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1.5,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    marginTop: 6,
    letterSpacing: -0.5,
  },
  copy: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.mono,
    lineHeight: 20,
    marginTop: 6,
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: Spacing.lg,
  },
  input: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.mono,
    textAlignVertical: 'top',
    fontSize: Typography.fontSize.sm,
  },
  report: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: Spacing.md,
  },
  reportText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.body,
    fontWeight: Typography.fontWeight.semibold,
  },
  button: {
    backgroundColor: Colors.canvasDark,
    borderRadius: Radius.full,
    padding: 18,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.textInverse,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
  },
  thanks: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
});
