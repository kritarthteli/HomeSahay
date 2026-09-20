import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { Spacing, Radius } from '../../constants/theme';

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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Account</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Actions */}
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.listItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#6B7280" style={styles.listIcon} />
            <Text style={styles.listText}>Log out</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Policies & Others */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Policies & Others</Text>
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.listItem}>
            <Ionicons name="document-text-outline" size={20} color="#6B7280" style={styles.listIcon} />
            <Text style={styles.listText}>Terms of Use</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem}>
            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.listIcon} />
            <Text style={styles.listText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem}>
            <Ionicons name="cash-outline" size={20} color="#6B7280" style={styles.listIcon} />
            <Text style={styles.listText}>Refund & Cancellation Policy</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem}>
            <Ionicons name="trash-outline" size={20} color="#6B7280" style={styles.listIcon} />
            <Text style={styles.listText}>Manage Data</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  scrollContent: { padding: Spacing.lg, paddingBottom: 40 },
  
  sectionTitle: { fontSize: 14, color: '#111827', fontWeight: '700', marginBottom: Spacing.sm, paddingHorizontal: 4 },
  listContainer: { backgroundColor: '#fff', borderRadius: Radius.lg, borderWidth: 1, borderColor: '#F3F4F6', overflow: 'hidden' },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  listIcon: { marginRight: Spacing.md },
  listText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#374151' },
  listDivider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 48 },
});
