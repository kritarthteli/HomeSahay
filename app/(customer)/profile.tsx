import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';

export default function CustomerProfile() {
  const router = useRouter();
  const { getActiveCustomer, updateCustomerProfile, logout } = useAppStore();
  const customer = getActiveCustomer();

  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [savedAddressVisible, setSavedAddressVisible] = useState(false);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    gender: customer?.gender || 'Male',
  });

  const handleUpdateProfile = () => {
    if (customer) {
      updateCustomerProfile(customer.id, editForm);
    }
    setEditProfileVisible(false);
  };

  const handleLogout = () => {
    logout('customer');
    router.replace('/(customer)/login');
  };

  if (!customer) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={40} color="#6B7280" />
          </View>
          <TouchableOpacity style={styles.nameRow} onPress={() => setEditProfileVisible(true)}>
            <Text style={styles.nameText}>{customer.name}</Text>
            <Ionicons name="chevron-forward" size={16} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Grid Cards */}
        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.gridCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="calendar" size={16} color="#3c20a1ff" />
            </View>
            <Text style={styles.gridCardTitle}>My Bookings</Text>
            <View style={styles.gridCardFooter}>
              <Text style={styles.gridCardSub}>View all bookings</Text>
              <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="wallet" size={16} color="#3c20a1ff" />
            </View>
            <Text style={styles.gridCardTitle}>My Wallet</Text>
            <View style={styles.gridCardFooter}>
              <Text style={styles.gridCardSub}>₹{customer.sahayCash || 0}</Text>
              <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="help-circle" size={16} color="#3c20a1ff" />
            </View>
            <Text style={styles.gridCardTitle}>Help & Support</Text>
            <View style={styles.gridCardFooter}>
              <Text style={styles.gridCardSub}>Get Quick Help</Text>
              <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Manage Account Section */}
        <Text style={styles.sectionTitle}>Manage Account</Text>
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.listItem}>
            <Ionicons name="people-outline" size={20} color="#6B7280" style={styles.listIcon} />
            <Text style={styles.listText}>Your Experts</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.listDivider} />

          <TouchableOpacity style={styles.listItem} onPress={() => setSavedAddressVisible(true)}>
            <Ionicons name="location-outline" size={20} color="#6B7280" style={styles.listIcon} />
            <Text style={styles.listText}>Saved Addresses</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.listDivider} />

          <TouchableOpacity style={styles.listItem} onPress={() => router.push('/(customer)/manage-account')}>
            <Ionicons name="settings-outline" size={20} color="#6B7280" style={styles.listIcon} />
            <Text style={styles.listText}>Manage Account</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Edit Profile Bottom Sheet */}
      <Modal visible={editProfileVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeaderRow}>
              <View style={{ width: 32 }} />
              <Text style={styles.sheetTitle}>Edit profile</Text>
              <TouchableOpacity onPress={() => setEditProfileVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.avatarEditContainer}>
                <View style={[styles.avatarCircle, { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#F3F4F6' }]}>
                  <Ionicons name="person" size={50} color="#4B5563" />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>E-mail (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.email}
                  placeholder="name@example.com"
                  onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone number</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={styles.genderRow}>
                  {['Male', 'Female', 'Other'].map(g => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.genderBtn, editForm.gender === g && styles.genderBtnActive]}
                      onPress={() => setEditForm({ ...editForm, gender: g })}
                    >
                      <Text style={[styles.genderText, editForm.gender === g && styles.genderTextActive]}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.updateBtn} onPress={handleUpdateProfile}>
                <Text style={styles.updateBtnText}>Update</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Saved Addresses Bottom Sheet */}
      <Modal visible={savedAddressVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setSavedAddressVisible(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetTitle}>Saved Address</Text>
              <TouchableOpacity style={styles.addAddressBtn}>
                <Ionicons name="add" size={16} color="#6B7280" />
                <Text style={styles.addAddressText}>Add address</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.addressList}>
              {customer.savedAddresses?.map(addr => (
                <View key={addr.id} style={styles.addressItem}>
                  <View style={styles.addressIconBox}>
                    <Ionicons name="location" size={20} color="#EC4899" />
                  </View>
                  <View style={styles.addressInfo}>
                    <View style={styles.addressTitleRow}>
                      <Text style={styles.addressLabel}>{addr.label}</Text>
                      {addr.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>SELECTED</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.addressText}>{addr.address}</Text>
                  </View>
                  <TouchableOpacity style={styles.moreBtn}>
                    <Ionicons name="ellipsis-horizontal" size={16} color="#374151" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.homeIndicatorWrapper}>
              <View style={styles.homeIndicator} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  scrollContent: { padding: Spacing.lg, paddingBottom: 40 },

  avatarSection: { alignItems: 'center', marginBottom: Spacing.xl, marginTop: Spacing.md },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  nameText: { fontSize: 18, fontWeight: '800', color: '#111827' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: Spacing.xl },
  gridCard: { width: '48%', backgroundColor: '#fff', borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: '#F3F4F6' },
  iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FDF2F8', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  gridCardTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
  gridCardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gridCardSub: { fontSize: 11, color: '#9CA3AF' },

  sectionTitle: { fontSize: 14, color: '#9CA3AF', fontWeight: '600', marginBottom: Spacing.sm, paddingHorizontal: 4 },
  listContainer: { backgroundColor: '#fff', borderRadius: Radius.lg, borderWidth: 1, borderColor: '#F3F4F6', overflow: 'hidden' },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  listIcon: { marginRight: Spacing.md },
  listText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#374151' },
  listDivider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 48 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.xl, maxHeight: '90%' },
  sheetHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },

  avatarEditContainer: { alignItems: 'center', marginBottom: Spacing.lg },
  inputGroup: { marginBottom: Spacing.md },
  inputLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: Radius.md, padding: Spacing.md, fontSize: 14, fontWeight: '600', color: '#111827' },

  genderRow: { flexDirection: 'row', gap: Spacing.sm },
  genderBtn: { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  genderBtnActive: { borderColor: '#EC4899', backgroundColor: '#FDF2F8' },
  genderText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  genderTextActive: { color: '#EC4899' },

  updateBtn: { backgroundColor: '#EC4899', borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.lg, marginBottom: Spacing.xl },
  updateBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  addAddressBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 6, gap: 4 },
  addAddressText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  addressList: { gap: Spacing.md, marginBottom: Spacing.xl },
  addressItem: { flexDirection: 'row', gap: Spacing.md },
  addressIconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#FDF2F8', justifyContent: 'center', alignItems: 'center' },
  addressInfo: { flex: 1 },
  addressTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  addressLabel: { fontSize: 14, fontWeight: '700', color: '#111827' },
  defaultBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  defaultBadgeText: { fontSize: 10, fontWeight: '800', color: '#059669' },
  addressText: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
  moreBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },

  homeIndicatorWrapper: { alignItems: 'center', marginTop: Spacing.sm },
  homeIndicator: { width: 80, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' }
});
