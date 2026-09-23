import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';

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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={40} color={Colors.textMuted} />
          </View>
          <TouchableOpacity style={styles.nameRow} onPress={() => setEditProfileVisible(true)} activeOpacity={0.7}>
            <Text style={styles.nameText}>{customer.name}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.coopText}>SOUTH BANGALORE COOPERATIVE</Text>
        </View>

        {/* Grid Cards */}
        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8}>
            <View style={styles.iconCircle}>
              <Ionicons name="calendar" size={16} color={Colors.textInverse} />
            </View>
            <Text style={styles.gridCardTitle}>Bookings</Text>
            <View style={styles.gridCardFooter}>
              <Text style={styles.gridCardSub}>View all history</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.textMuted} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8}>
            <View style={styles.iconCircle}>
              <Ionicons name="wallet" size={16} color={Colors.textInverse} />
            </View>
            <Text style={styles.gridCardTitle}>Sahay Cash</Text>
            <View style={styles.gridCardFooter}>
              <Text style={styles.gridCardSubWallet}>₹{customer.sahayCash || 0}</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.textMuted} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} activeOpacity={0.8}>
            <View style={styles.iconCircle}>
              <Ionicons name="help-circle" size={16} color={Colors.textInverse} />
            </View>
            <Text style={styles.gridCardTitle}>Support</Text>
            <View style={styles.gridCardFooter}>
              <Text style={styles.gridCardSub}>Get quick help</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Manage Account Section */}
        <Text style={styles.sectionTitle}>MANAGE ACCOUNT</Text>
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
            <View style={styles.listIconBox}>
              <Ionicons name="people-outline" size={18} color={Colors.textPrimary} />
            </View>
            <Text style={styles.listText}>Your Experts</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.listDivider} />

          <TouchableOpacity style={styles.listItem} onPress={() => setSavedAddressVisible(true)} activeOpacity={0.7}>
            <View style={styles.listIconBox}>
              <Ionicons name="location-outline" size={18} color={Colors.textPrimary} />
            </View>
            <Text style={styles.listText}>Saved Addresses</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.listDivider} />

          <TouchableOpacity style={styles.listItem} onPress={() => router.push('/(customer)/manage-account')} activeOpacity={0.7}>
            <View style={styles.listIconBox}>
              <Ionicons name="settings-outline" size={18} color={Colors.textPrimary} />
            </View>
            <Text style={styles.listText}>Settings & Preferences</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Edit Profile Bottom Sheet */}
      <Modal visible={editProfileVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeaderRow}>
              <View style={{ width: 34 }} />
              <Text style={styles.sheetTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditProfileVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.avatarEditContainer}>
                <View style={styles.avatarEditCircle}>
                  <Ionicons name="person" size={40} color={Colors.textMuted} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>FULL NAME</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>E-MAIL (OPTIONAL)</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.email}
                  placeholder="name@example.com"
                  onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PHONE NUMBER</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>GENDER</Text>
                <View style={styles.genderRow}>
                  {['Male', 'Female', 'Other'].map(g => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.genderBtn, editForm.gender === g && styles.genderBtnActive]}
                      onPress={() => setEditForm({ ...editForm, gender: g })}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.genderText, editForm.gender === g && styles.genderTextActive]}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.updateBtn} onPress={handleUpdateProfile} activeOpacity={0.8}>
                <Text style={styles.updateBtnText}>SAVE CHANGES</Text>
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
              <Text style={styles.sheetTitle}>Saved Addresses</Text>
              <TouchableOpacity style={styles.addAddressBtn} activeOpacity={0.7}>
                <Ionicons name="add" size={16} color={Colors.textInverse} />
                <Text style={styles.addAddressText}>ADD</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.addressList}>
              {customer.savedAddresses?.map(addr => (
                <View key={addr.id} style={styles.addressItem}>
                  <View style={styles.addressIconBox}>
                    <Ionicons name="location" size={20} color={Colors.textInverse} />
                  </View>
                  <View style={styles.addressInfo}>
                    <View style={styles.addressTitleRow}>
                      <Text style={styles.addressLabel}>{addr.label}</Text>
                      {addr.isDefault && (
                         <View style={styles.defaultBadge}>
                           <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                         </View>
                      )}
                    </View>
                    <Text style={styles.addressText}>{addr.address}</Text>
                  </View>
                  <TouchableOpacity style={styles.moreBtn}>
                    <Ionicons name="ellipsis-horizontal" size={16} color={Colors.textPrimary} />
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
  container: { flex: 1, backgroundColor: Colors.canvasLight },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, letterSpacing: -0.5 },
  scrollContent: { padding: Spacing.xl, paddingBottom: 60 },

  avatarSection: { alignItems: 'center', marginBottom: Spacing['2xl'], marginTop: Spacing.sm },
  avatarCircle: { width: 90, height: 90, borderRadius: Radius.full, backgroundColor: Colors.canvasCream, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  nameText: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary },
  coopText: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.accentPrimaryDark, letterSpacing: 1 },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: Spacing['2xl'] },
  gridCard: { width: '48%', flexGrow: 1, backgroundColor: Colors.surfaceLight, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight },
  iconCircle: { width: 36, height: 36, borderRadius: Radius.full, backgroundColor: Colors.surfaceDark, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  gridCardTitle: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary, marginBottom: 6 },
  gridCardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gridCardSub: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary },
  gridCardSubWallet: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.accentPrimaryDark },

  sectionTitle: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textMuted, letterSpacing: 1.5, marginBottom: Spacing.sm, paddingHorizontal: 4 },
  listContainer: { backgroundColor: Colors.surfaceLight, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.borderLight, overflow: 'hidden' },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, paddingVertical: 18 },
  listIconBox: { width: 32, height: 32, borderRadius: Radius.full, backgroundColor: Colors.canvasCream, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight },
  listText: { flex: 1, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.body, fontWeight: Typography.fontWeight.semibold, color: Colors.textPrimary },
  listDivider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 64 },

  modalOverlay: { flex: 1, backgroundColor: Colors.glassDark, justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: Colors.canvasLight, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.xl, maxHeight: '90%' },
  sheetHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl },
  sheetTitle: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, letterSpacing: -0.5 },
  closeBtn: { width: 34, height: 34, borderRadius: Radius.full, backgroundColor: Colors.canvasCream, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight },

  avatarEditContainer: { alignItems: 'center', marginBottom: Spacing.xl },
  avatarEditCircle: { width: 90, height: 90, borderRadius: Radius.full, backgroundColor: Colors.canvasCream, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight },
  
  inputGroup: { marginBottom: Spacing.lg },
  inputLabel: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary, letterSpacing: 1, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: Colors.borderLight, borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: 16, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.mono, color: Colors.textPrimary, backgroundColor: Colors.surfaceLight, outlineStyle: 'none' },

  genderRow: { flexDirection: 'row', gap: Spacing.sm },
  genderBtn: { flex: 1, borderWidth: 1, borderColor: Colors.borderLight, borderRadius: Radius.full, paddingVertical: 14, alignItems: 'center', backgroundColor: Colors.surfaceLight },
  genderBtnActive: { borderColor: Colors.accentPrimary, backgroundColor: Colors.borderLight },
  genderText: { fontSize: 12, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textSecondary },
  genderTextActive: { color: Colors.textPrimary },

  updateBtn: { backgroundColor: Colors.accentPrimary, borderRadius: Radius.full, paddingVertical: 18, alignItems: 'center', marginTop: Spacing.sm, marginBottom: Spacing.xl, ...Shadow.glow },
  updateBtnText: { color: Colors.darkSurfaceDeep, fontSize: 12, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.black, letterSpacing: 1 },

  addAddressBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceDark, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 8, gap: 4, borderWidth: 1, borderColor: Colors.borderDark },
  addAddressText: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textInverse, letterSpacing: 0.5 },
  addressList: { gap: Spacing.md, marginBottom: Spacing.xl },
  addressItem: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center', backgroundColor: Colors.surfaceLight, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.borderLight },
  addressIconBox: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: Colors.surfaceDark, justifyContent: 'center', alignItems: 'center' },
  addressInfo: { flex: 1 },
  addressTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  addressLabel: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary },
  defaultBadge: { backgroundColor: Colors.accentPrimary, paddingHorizontal: 6, paddingVertical: 3, borderRadius: Radius.full },
  defaultBadgeText: { fontSize: 9, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.darkSurfaceDeep },
  addressText: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
  moreBtn: { width: 34, height: 34, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderLight, backgroundColor: Colors.canvasCream, justifyContent: 'center', alignItems: 'center' },

  homeIndicatorWrapper: { alignItems: 'center', marginTop: Spacing.sm },
  homeIndicator: { width: 40, height: 4, borderRadius: Radius.full, backgroundColor: Colors.borderLight }
});
