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
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']} />
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.push('/(customer)')} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <View style={styles.sheetContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={48} color={Colors.textMuted} />
          </View>
          <TouchableOpacity style={styles.nameRow} onPress={() => setEditProfileVisible(true)} activeOpacity={0.7}>
            <Text style={styles.nameText}>{customer.name}</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Wallet Minimal */}
        <TouchableOpacity style={styles.walletContainer} activeOpacity={0.8}>
          <View style={styles.walletLeft}>
            <View style={styles.walletIconBox}>
              <Ionicons name="wallet" size={16} color={Colors.accentPrimary} />
            </View>
            <Text style={styles.walletTitle}>Sahay Cash</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        {/* Manage Account Section */}
        <Text style={styles.sectionTitle}>MANAGE ACCOUNT</Text>
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
            <View style={styles.listIconBox}>
              <Ionicons name="calendar-outline" size={20} color={Colors.textPrimary} />
            </View>
            <Text style={styles.listText}>Bookings History</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.listDivider} />

          <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
            <View style={styles.listIconBox}>
              <Ionicons name="help-circle-outline" size={20} color={Colors.textPrimary} />
            </View>
            <Text style={styles.listText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
            <View style={styles.listIconBox}>
              <Ionicons name="people-outline" size={20} color={Colors.textPrimary} />
            </View>
            <Text style={styles.listText}>Your Experts</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.listDivider} />

          <TouchableOpacity style={styles.listItem} onPress={() => setSavedAddressVisible(true)} activeOpacity={0.7}>
            <View style={styles.listIconBox}>
              <Ionicons name="location-outline" size={20} color={Colors.textPrimary} />
            </View>
            <Text style={styles.listText}>Saved Addresses</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.listDivider} />

          <TouchableOpacity style={styles.listItem} onPress={() => router.push('/(customer)/manage-account')} activeOpacity={0.7}>
            <View style={styles.listIconBox}>
              <Ionicons name="settings-outline" size={20} color={Colors.textPrimary} />
            </View>
            <Text style={styles.listText}>Settings & Preferences</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        </ScrollView>
      </View>

      {/* Edit Profile Bottom Sheet */}
      <Modal visible={editProfileVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeaderRow}>
              <View style={{ width: 40 }} />
              <Text style={styles.sheetTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditProfileVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.avatarEditContainer}>
                <View style={styles.avatarEditCircle}>
                  <Ionicons name="person" size={48} color={Colors.textMuted} />
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
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setSavedAddressVisible(false)} activeOpacity={1} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetTitle}>Saved Addresses</Text>
              <TouchableOpacity style={styles.addAddressBtn} activeOpacity={0.7}>
                <Ionicons name="add" size={18} color={Colors.textInverse} />
                <Text style={styles.addAddressText}>NEW</Text>
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
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: Colors.canvasDark },
  header: {
    backgroundColor: Colors.canvasDark,
    paddingBottom: Spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
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
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.dangerContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    color: Colors.textInverse,
    letterSpacing: -0.5,
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: Colors.canvasLight,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    marginTop: -Spacing.md,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 100,
  },

  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.canvasCream,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    ...Shadow.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  nameText: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },

  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceLight,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.xl,
    ...Shadow.sm,
  },
  walletLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  walletIconBox: { width: 32, height: 32, borderRadius: Radius.full, backgroundColor: Colors.canvasDark, justifyContent: 'center', alignItems: 'center' },
  walletTitle: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary },
  walletAmount: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.black, color: Colors.accentPrimary },

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
  listText: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  listDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 72,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.glassDark,
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: Colors.canvasLight,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    padding: Spacing.xl,
    paddingTop: Spacing['2xl'],
    maxHeight: '90%',
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing['2xl'],
  },
  sheetTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.canvasCream,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },

  avatarEditContainer: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  avatarEditCircle: {
    width: 100,
    height: 100,
    borderRadius: Radius.full,
    backgroundColor: Colors.canvasCream,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.borderDark,
  },
  
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 18,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.textPrimary,
    backgroundColor: Colors.surfaceLight,
    outlineStyle: 'none',
  },

  genderRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  genderBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
  },
  genderBtnActive: {
    borderColor: Colors.canvasDark,
    backgroundColor: Colors.canvasDark,
    ...Shadow.sm,
  },
  genderText: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  genderTextActive: {
    color: Colors.textInverse,
  },

  updateBtn: {
    backgroundColor: Colors.accentPrimary,
    borderRadius: Radius.full,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing['3xl'],
    ...Shadow.glow,
  },
  updateBtnText: {
    color: Colors.darkSurfaceDeep,
    fontSize: 14,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: -0.5,
  },

  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvasDark,
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    ...Shadow.glow,
  },
  addAddressText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
    letterSpacing: 1,
  },
  addressList: {
    gap: Spacing.md,
    marginBottom: Spacing['4xl'],
  },
  addressItem: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  addressIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressInfo: {
    flex: 1,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 6,
  },
  addressLabel: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    color: Colors.textPrimary,
  },
  defaultBadge: {
    backgroundColor: Colors.accentPrimary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  defaultBadgeText: {
    fontSize: 9,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkSurfaceDeep,
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  moreBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.canvasCream,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
