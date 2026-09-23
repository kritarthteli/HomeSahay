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
    icon: 'person-circle-outline',
    color: Colors.customerAccent,
    route: '/(customer)',
  },
  {
    id: 'worker',
    label: 'Worker',
    subtitle: 'Find jobs',
    icon: 'hammer-outline',
    color: Colors.workerAccent,
    route: '/(worker)',
  },
  {
    id: 'admin',
    label: 'Admin',
    subtitle: 'Cooperative hub',
    icon: 'shield-checkmark-outline',
    color: Colors.adminAccent,
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
            <Ionicons name={currentRole.icon} size={20} color="#fff" />
          </View>
          <Text style={styles.fabLabel}>{currentRole.label}</Text>
          <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} style={{ marginLeft: 2 }} />
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
                style={[styles.roleCard, role === r.id && styles.roleCardActive, { borderColor: role === r.id ? r.color : Colors.glassBorder }]}
                onPress={() => handleRoleSelect(r)}
                activeOpacity={0.8}
              >
                <View style={[styles.roleIcon, { backgroundColor: r.color + '22' }]}>
                  <Ionicons name={r.icon} size={26} color={r.color} />
                </View>
                <View style={styles.roleText}>
                  <Text style={styles.roleName}>{r.label}</Text>
                  <Text style={styles.roleSubtitle}>{r.subtitle}</Text>
                </View>
                {role === r.id && (
                  <View style={[styles.activeBadge, { backgroundColor: r.color }]}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
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
    right: Spacing.base,
    zIndex: 999,
    ...Shadow.md,
  },
  fabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  fabIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabLabel: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.bg1,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['2xl'],
    borderTopWidth: 1,
    borderColor: Colors.glassBorder,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.bg4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  sheetTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.xs,
  },
  sheetSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg2,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    gap: Spacing.md,
  },
  roleCardActive: {
    backgroundColor: Colors.bg3,
  },
  roleIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleText: { flex: 1 },
  roleName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.extrabold,
  },
  roleSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  activeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
