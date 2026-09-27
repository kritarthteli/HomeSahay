import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';

export default function CustomerProfile() {
  const router = useRouter();
  const { getActiveCustomer, updateCustomerProfile, logoutCustomer, addCustomerAddress, deleteCustomerAddress } = useAppStore();
  const customer = getActiveCustomer();

  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [savedAddressVisible, setSavedAddressVisible] = useState(false);

  // Add Address Form State
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddressText, setNewAddressText] = useState('');
  const [newAddressLabel, setNewAddressLabel] = useState('home');
  const [newAddressIsDefault, setNewAddressIsDefault] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    gender: customer?.gender || 'Male',
  });

  // Always keep editForm synchronized with active customer
  useEffect(() => {
    if (customer) {
      setEditForm({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        gender: customer.gender || 'Male',
      });
    }
  }, [customer?.id, customer?.name, customer?.email, customer?.phone, customer?.gender]);

  const openEditProfile = () => {
    if (customer) {
      setEditForm({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        gender: customer.gender || 'Male',
      });
    }
    setEditProfileVisible(true);
  };

  const handleUpdateProfile = () => {
    if (customer) {
      updateCustomerProfile(customer.id, editForm);
    }
    setEditProfileVisible(false);
  };

  const handleAddAddress = async () => {
    if (!newAddressText.trim()) {
      setAddressError('Please enter an address.');
      return;
    }
    setAddressError('');
    setAddressLoading(true);
    try {
      await addCustomerAddress(customer.id, {
        label: newAddressLabel,
        address: newAddressText.trim(),
        isDefault: newAddressIsDefault,
      });
      setNewAddressText('');
      setNewAddressLabel('home');
      setNewAddressIsDefault(false);
      setShowAddAddressForm(false);
    } catch (err: any) {
      setAddressError(err.message || 'Failed to add address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!customer) return;
    setAddressError('');
    setAddressLoading(true);
    try {
      await deleteCustomerAddress(customer.id, addressId);
    } catch (err: any) {
      setAddressError(err.message || 'Failed to delete address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutCustomer();
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
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.8} accessibilityLabel="Log out">
            <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sheetContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={48} color={Colors.textMuted} />
          </View>
          <TouchableOpacity style={styles.nameRow} onPress={openEditProfile} activeOpacity={0.7}>
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

          <View style={styles.listDivider} />

          <TouchableOpacity style={styles.listItem} onPress={handleLogout} activeOpacity={0.7}>
            <View style={[styles.listIconBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
              <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
            </View>
            <Text style={[styles.listText, { color: Colors.danger }]}>Sign Out</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.danger} />
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
          <TouchableOpacity style={{ flex: 1 }} onPress={() => { setSavedAddressVisible(false); setShowAddAddressForm(false); }} activeOpacity={1} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetTitle}>Saved Addresses</Text>
              <TouchableOpacity
                style={[styles.addAddressBtn, showAddAddressForm && { backgroundColor: Colors.dangerContainer, borderColor: Colors.danger }]}
                onPress={() => {
                  setShowAddAddressForm(!showAddAddressForm);
                  setAddressError('');
                }}
                activeOpacity={0.7}
              >
                <Ionicons name={showAddAddressForm ? 'close' : 'add'} size={18} color={showAddAddressForm ? Colors.danger : Colors.textInverse} />
                <Text style={[styles.addAddressText, showAddAddressForm && { color: Colors.danger }]}>
                  {showAddAddressForm ? 'CANCEL' : 'NEW'}
                </Text>
              </TouchableOpacity>
            </View>

            {addressError ? (
              <View style={styles.addressErrorBox}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.addressErrorText}>{addressError}</Text>
              </View>
            ) : null}

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {/* Add New Address Form */}
              {showAddAddressForm && (
                <View style={styles.newAddressCard}>
                  <Text style={styles.newAddressHeading}>ADD NEW ADDRESS</Text>

                  {/* Label selection */}
                  <View style={styles.labelRow}>
                    {['home', 'work', 'other'].map((lbl) => (
                      <TouchableOpacity
                        key={lbl}
                        style={[styles.labelBtn, newAddressLabel === lbl && styles.labelBtnActive]}
                        onPress={() => setNewAddressLabel(lbl)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={lbl === 'home' ? 'home' : lbl === 'work' ? 'briefcase' : 'location'}
                          size={14}
                          color={newAddressLabel === lbl ? Colors.darkSurfaceDeep : Colors.textSecondary}
                        />
                        <Text style={[styles.labelText, newAddressLabel === lbl && styles.labelTextActive]}>
                          {lbl.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TextInput
                    style={styles.addressInput}
                    placeholder="Enter complete address, landmark, area"
                    placeholderTextColor={Colors.textMuted}
                    value={newAddressText}
                    onChangeText={(t) => { setNewAddressText(t); setAddressError(''); }}
                    multiline
                    numberOfLines={3}
                  />

                  <TouchableOpacity
                    style={styles.defaultCheckboxRow}
                    onPress={() => setNewAddressIsDefault(!newAddressIsDefault)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={newAddressIsDefault ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={newAddressIsDefault ? Colors.accentPrimary : Colors.textMuted}
                    />
                    <Text style={styles.defaultCheckboxText}>Set as default delivery address</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.saveAddressBtn, addressLoading && { opacity: 0.6 }]}
                    onPress={handleAddAddress}
                    disabled={addressLoading}
                    activeOpacity={0.8}
                  >
                    {addressLoading ? (
                      <ActivityIndicator size="small" color={Colors.darkSurfaceDeep} />
                    ) : (
                      <Text style={styles.saveAddressBtnText}>SAVE ADDRESS</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* Saved Address List */}
              <View style={styles.addressList}>
                {(!customer.savedAddresses || customer.savedAddresses.length === 0) ? (
                  <View style={styles.emptyAddressBox}>
                    <Ionicons name="location-outline" size={36} color={Colors.textMuted} />
                    <Text style={styles.emptyAddressText}>No saved addresses yet.</Text>
                  </View>
                ) : (
                  customer.savedAddresses.map((addr) => (
                    <View key={addr.id} style={styles.addressItem}>
                      <View style={styles.addressIconBox}>
                        <Ionicons
                          name={addr.label === 'work' ? 'briefcase' : addr.label === 'home' ? 'home' : 'location'}
                          size={20}
                          color={Colors.textInverse}
                        />
                      </View>
                      <View style={styles.addressInfo}>
                        <View style={styles.addressTitleRow}>
                          <Text style={styles.addressLabel}>{addr.label?.toUpperCase()}</Text>
                          {addr.isDefault && (
                            <View style={styles.defaultBadge}>
                              <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.addressText}>{addr.address}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteAddressBtn}
                        onPress={() => handleDeleteAddress(addr.id)}
                        disabled={addressLoading}
                        activeOpacity={0.7}
                        accessibilityLabel="Delete address"
                      >
                        <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
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
  deleteAddressBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  addressErrorText: {
    color: '#DC2626',
    fontSize: 12,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
  },
  newAddressCard: {
    backgroundColor: Colors.canvasCream,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  newAddressHeading: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 1,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  labelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surfaceLight,
  },
  labelBtnActive: {
    backgroundColor: Colors.accentPrimary,
    borderColor: Colors.accentPrimary,
  },
  labelText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
  },
  labelTextActive: {
    color: Colors.darkSurfaceDeep,
  },
  addressInput: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    fontSize: 13,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.textPrimary,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: Spacing.md,
  },
  defaultCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  defaultCheckboxText: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.textSecondary,
  },
  saveAddressBtn: {
    backgroundColor: Colors.accentPrimary,
    paddingVertical: 14,
    borderRadius: Radius.full,
    alignItems: 'center',
    ...Shadow.sm,
  },
  saveAddressBtnText: {
    color: Colors.darkSurfaceDeep,
    fontSize: 12,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 1,
  },
  emptyAddressBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
    gap: Spacing.sm,
  },
  emptyAddressText: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.textMuted,
  },
});
