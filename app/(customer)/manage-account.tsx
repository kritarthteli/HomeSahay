import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';

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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Account</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Actions */}
        <Text style={styles.sectionTitle}>ACTIONS</Text>
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.listItem} onPress={handleLogout} activeOpacity={0.7}>
            <View style={styles.listIconBox}>
              <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
            </View>
            <Text style={styles.listTextDanger}>Log Out</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Policies & Others */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>POLICIES & OTHERS</Text>
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
            <View style={styles.listIconBox}>
              <Ionicons name="document-text-outline" size={18} color={Colors.textPrimary} />
            </View>
            <Text style={styles.listText}>Terms of Use</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
            <View style={styles.listIconBox}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textPrimary} />
            </View>
            <Text style={styles.listText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
            <View style={styles.listIconBox}>
              <Ionicons name="cash-outline" size={18} color={Colors.textPrimary} />
            </View>
            <Text style={styles.listText}>Refund & Cancellation</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
            <View style={styles.listIconBox}>
              <Ionicons name="trash-outline" size={18} color={Colors.textPrimary} />
            </View>
            <Text style={styles.listText}>Manage Data</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.canvasLight },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, letterSpacing: -0.5 },
  scrollContent: { padding: Spacing.xl, paddingBottom: 60 },
  
  sectionTitle: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textMuted, letterSpacing: 1.5, marginBottom: Spacing.sm, paddingHorizontal: 4 },
  listContainer: { backgroundColor: Colors.surfaceLight, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.borderLight, overflow: 'hidden' },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, paddingVertical: 18 },
  listIconBox: { width: 32, height: 32, borderRadius: Radius.full, backgroundColor: Colors.canvasCream, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight },
  listText: { flex: 1, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.body, fontWeight: Typography.fontWeight.semibold, color: Colors.textPrimary },
  listTextDanger: { flex: 1, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.body, fontWeight: Typography.fontWeight.bold, color: Colors.danger },
  listDivider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 64 },
});
