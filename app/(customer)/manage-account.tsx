import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';

export default function ManageAccount() {
  const router = useRouter();
  const { logout } = useAppStore();

  const handleLogout = () => {
    logout('customer');
    router.replace('/(customer)/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(customer)/profile')} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Actions */}
        <Text style={styles.sectionTitle}>ACCOUNT ACTIONS</Text>
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.listItem} onPress={handleLogout} activeOpacity={0.7}>
            <View style={styles.listIconBoxDanger}>
              <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
            </View>
            <Text style={styles.listTextDanger}>Sign Out</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.danger} />
          </TouchableOpacity>
        </View>

        {/* Policies & Others */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing['2xl'] }]}>POLICIES & OTHERS</Text>
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
            <View style={styles.listIconBox}>
              <Ionicons name="document-text-outline" size={20} color={Colors.textPrimary} />
            </View>
            <Text style={styles.listText}>Terms of Use</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
            <View style={styles.listIconBox}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textPrimary} />
            </View>
            <Text style={styles.listText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
            <View style={styles.listIconBox}>
              <Ionicons name="cash-outline" size={20} color={Colors.textPrimary} />
            </View>
            <Text style={styles.listText}>Refund & Cancellation</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
            <View style={styles.listIconBox}>
              <Ionicons name="trash-outline" size={20} color={Colors.textPrimary} />
            </View>
            <Text style={styles.listText}>Manage Data</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvasLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 60,
  },
  
  sectionTitle: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: Spacing.lg,
    paddingHorizontal: 4,
  },
  listContainer: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  listIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.canvasCream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  listIconBoxDanger: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.dangerTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  listText: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  listTextDanger: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    color: Colors.danger,
    letterSpacing: -0.5,
  },
  listDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 72,
  },
});
