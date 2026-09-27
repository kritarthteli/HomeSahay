import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadow, Typography, Radius } from '../constants/theme';

export default function SOSButton({ onPress, disabled = false }: any) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    if (!disabled) pulse.start();
    else pulse.stop();
    return () => pulse.stop();
  }, [disabled]);

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.ring,
          {
            transform: [{ scale: pulseAnim }],
            opacity: disabled ? 0 : 0.6,
          },
        ]}
      />
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.85}
      >
        <Ionicons name="alert-circle" size={28} color={Colors.surfaceLight} />
        <Text style={styles.label}>SOS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 90,
  },
  ring: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentPrimary, // High-contrast neon warning
  },
  button: {
    width: 76,
    height: 76,
    borderRadius: Radius.full,
    backgroundColor: Colors.danger, // Stark red
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.accentPrimary,
    ...Shadow.lg,
    shadowColor: Colors.danger,
  },
  buttonDisabled: {
    backgroundColor: Colors.surfaceDark,
    borderColor: Colors.borderDark,
  },
  label: {
    color: Colors.surfaceLight,
    fontSize: 12,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 1.5,
    marginTop: 2,
  },
});
