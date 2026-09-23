import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadow, Typography } from '../constants/theme';

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
      {/* Pulsing ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            transform: [{ scale: pulseAnim }],
            opacity: disabled ? 0 : 0.35,
          },
        ]}
      />
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.85}
      >
        <Ionicons name="alert-circle" size={22} color="#fff" />
        <Text style={styles.label}>SOS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
    height: 72,
  },
  ring: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.dangerTint,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.dangerTint,
    ...Shadow.md,
    shadowColor: Colors.danger,
  },
  buttonDisabled: {
    backgroundColor: Colors.bg4,
    borderColor: Colors.bg3,
  },
  label: {
    color: '#fff',
    fontSize: 11,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
    marginTop: 1,
  },
});
