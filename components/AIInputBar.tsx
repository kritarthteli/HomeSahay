import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadow, Typography } from '../constants/theme';

const EXAMPLE_QUERIES = [
  'Bhaiya bathroom ka pipe leak ho raha hai',
  'Light fan nahi chal raha, bijli ka kaam chahiye',
  'Ghar ki safai karwani hai aaj',
  'Emergency — pipe burst ho gaya!',
  'Cook chahiye lunch ke liye aaj',
];

export default function AIInputBar({ onSubmit, loading = false, parsedIntent = null }) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };
  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.glassBorder, Colors.primary],
  });

  const handleSend = () => {
    if (text.trim() && !loading) {
      onSubmit(text.trim());
    }
  };

  const handleExample = (q) => {
    setText(q);
    onSubmit(q);
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <View style={styles.labelRow}>
        <Ionicons name="sparkles" size={14} color={Colors.primary} />
        <Text style={styles.label}>AI Request Parser</Text>
        <View style={styles.aiPill}>
          <Text style={styles.aiPillText}>Hinglish OK</Text>
        </View>
      </View>

      {/* Input */}
      <Animated.View style={[styles.inputWrapper, { borderColor }]}>
        <Ionicons name="sparkles" size={20} color={Colors.primary} style={styles.sparkleIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search for any service..."
          placeholderTextColor={Colors.textMuted}
          value={text}
          onChangeText={setText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSend}
          returnKeyType="search"
          multiline={false}
          editable={!loading}
        />
        <Ionicons name="mic-outline" size={20} color={Colors.textMuted} style={styles.micIcon} />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || loading) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.darkSurface} />
          ) : (
            <Ionicons name="arrow-up" size={18} color={Colors.darkSurface} />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Parsed intent display */}
      {parsedIntent && !loading && (
        <View style={styles.intentCard}>
          <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
          <Text style={styles.intentText}>
            <Text style={{ color: Colors.success, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, letterSpacing: 0.5 }}>
              {parsedIntent.service_category.charAt(0).toUpperCase() + parsedIntent.service_category.slice(1)}
            </Text>
            {'  ·  '}
            <Text style={{ color: parsedIntent.urgency === 'emergency' ? Colors.sos : Colors.warning }}>
              {parsedIntent.urgency.toUpperCase()}
            </Text>
            {'  ·  '}
            <Text style={{ color: Colors.textMuted }}>
              {Math.round(parsedIntent.confidence * 100)}% confidence
            </Text>
          </Text>
        </View>
      )}

      {/* Example chips */}
      {!parsedIntent && !loading && (
        <View style={styles.chips}>
          <Text style={styles.chipsLabel}>Try:</Text>
          {EXAMPLE_QUERIES.slice(0, 3).map((q, i) => (
            <TouchableOpacity
              key={i}
              style={styles.chip}
              onPress={() => handleExample(q)}
            >
              <Text style={styles.chipText} numberOfLines={1}>{q.length > 30 ? q.slice(0, 28) + '…' : q}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
  },
  aiPill: {
    backgroundColor: Colors.primary + '22',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  aiPillText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: Typography.fontWeight.medium,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkSurface,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  sparkleIcon: {
    opacity: 0.9,
  },
  micIcon: {
    opacity: 0.6,
    marginRight: 4,
  },
  input: {
    flex: 1,
    color: Colors.textInverse,
    fontSize: Typography.fontSize.base,
    paddingVertical: 4,
    outlineStyle: 'none',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.bg3,
  },
  intentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.success + '30',
    gap: 6,
  },
  intentText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
  },
  chips: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chipsLabel: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
  },
  chip: {
    backgroundColor: Colors.bg3,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    maxWidth: 180,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
  },
});
