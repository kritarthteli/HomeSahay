import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../store/appStore';
import { Colors, Spacing, Radius, Shadow, Typography } from '../constants/theme';

const ROLES = [
  {
    id: 'customer',
    label: 'Customer',
    subtitle: 'Book services',
    icon: 'person-circle-outline' as const,
    color: Colors.accentPrimaryDark,
    route: '/(customer)',
  },
  {
    id: 'worker',
    label: 'Worker',
    subtitle: 'Find jobs',
    icon: 'hammer-outline' as const,
    color: Colors.accentPrimary,
    route: '/(worker)',
  },
  {
    id: 'admin',
    label: 'Admin',
    subtitle: 'Cooperative hub',
    icon: 'shield-checkmark-outline' as const,
    color: Colors.textInverse,
    route: '/(admin)',
  },
];

export default function RoleSwitcher() {
  const [open, setOpen] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { role, setRole } = useAppStore();
  const router = useRouter();

  const currentRole = ROLES.find((r) => r.id === role) ?? ROLES[0];

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    setOpen(true);
  };

  const handleRoleSelect = (r: any) => {
    setRole(r.id);
    setOpen(false);
    router.replace(r.route);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Animated.View style={[styles.fab, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity onPress={handlePress} style={styles.fabInner} activeOpacity={0.85}>
          <View style={[styles.fabIcon, { backgroundColor: currentRole.color }]}>
            <Ionicons name={currentRole.icon} size={16} color={currentRole.id === 'worker' ? Colors.darkSurfaceDeep : Colors.canvasLight} />
          </View>
          <Text style={styles.fabLabel}>{currentRole.label}</Text>
          <Ionicons name="chevron-down" size={14} color={Colors.textInverseMuted} style={{ marginLeft: 2 }} />
        </TouchableOpacity>
      </Animated.View>

      {/* Role Picker Modal */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Switch Interface</Text>
            <Text style={styles.sheetSubtitle}>
              Instantly switch between roles to explore all platform interfaces
            </Text>

            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[styles.roleCard, role === r.id && styles.roleCardActive, { borderColor: role === r.id ? Colors.textPrimary : Colors.borderLight }]}
                onPress={() => handleRoleSelect(r)}
                activeOpacity={0.8}
              >
                <View style={[styles.roleIcon, { backgroundColor: role === r.id ? Colors.darkSurfaceDeep : Colors.canvasCream }]}>
                  <Ionicons name={r.icon} size={24} color={role === r.id ? Colors.accentPrimary : Colors.textSecondary} />
                </View>
                <View style={styles.roleText}>
                  <Text style={styles.roleName}>{r.label.toUpperCase()}</Text>
                  <Text style={styles.roleSubtitle}>{r.subtitle.toUpperCase()}</Text>
                </View>
                {role === r.id && (
                  <View style={[styles.activeBadge, { backgroundColor: Colors.accentPrimary }]}>
                    <Ionicons name="checkmark" size={14} color={Colors.darkSurfaceDeep} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 44,
    right: Spacing.md,
    zIndex: 999,
    ...Shadow.glow,
  },
  fabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkSurfaceDeep,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    gap: Spacing.sm,
  },
  fabIcon: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabLabel: {
    color: Colors.textInverse,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.canvasLight,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['4xl'],
    borderTopWidth: 1,
    borderColor: Colors.borderLight,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  sheetTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  sheetSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.body,
    marginBottom: Spacing['2xl'],
    lineHeight: 20,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.lg,
    ...Shadow.soft,
  },
  roleCardActive: {
    backgroundColor: Colors.canvasCream,
  },
  roleIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleText: { flex: 1 },
  roleName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
  },
  roleSubtitle: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    marginTop: 4,
  },
  activeBadge: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
