import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/appStore';
import { processKYC } from '../../services/mockApi';
import { Spacing, Radius, Typography } from '../../constants/theme';

const DOC_LABELS: Record<string, string> = {
  aadhar: 'Aadhaar Card',
  skill_cert: 'Skill Certificate',
  address_proof: 'Address Proof',
  photo: 'Photograph',
};

export default function KYCQueue() {
  const { kycQueue, approveKYC, rejectKYC, addNotification } = useAppStore();
  const [processing, setProcessing] = useState<Record<string, string | null>>({});
  const [confirmReject, setConfirmReject] = useState<string | null>(null);

  const handleApprove = async (kyc: any) => {
    setProcessing((p) => ({ ...p, [kyc.id]: 'approving' }));
    await processKYC(kyc.id, 'approved');
    approveKYC(kyc.id);
    addNotification({ type: 'success', title: 'KYC Approved', message: `${kyc.name} is now a verified worker.` });
    setProcessing((p) => ({ ...p, [kyc.id]: null }));
  };

  const handleRejectConfirm = async (kyc: any) => {
    setProcessing((p) => ({ ...p, [kyc.id]: 'rejecting' }));
    setConfirmReject(null);
    await processKYC(kyc.id, 'rejected', 'Documents incomplete');
    rejectKYC(kyc.id);
    addNotification({ type: 'info', title: 'KYC Rejected', message: `${kyc.name}'s application was rejected.` });
    setProcessing((p) => ({ ...p, [kyc.id]: null }));
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
      {/* Page Header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>KYC Verification Queue</Text>
          <Text style={styles.pageSubtitle}>Audit & authenticate gig worker credentials</Text>
        </View>
        <View style={[
          styles.countBadge,
          { backgroundColor: kycQueue.length > 0 ? '#FEF3C7' : '#ECFDF5' },
        ]}>
          <Ionicons
            name={kycQueue.length > 0 ? 'time-outline' : 'checkmark-circle-outline'}
            size={15}
            color={kycQueue.length > 0 ? '#D97706' : '#059669'}
          />
          <Text style={[styles.countText, { color: kycQueue.length > 0 ? '#D97706' : '#059669' }]}>
            {kycQueue.length} pending
          </Text>
        </View>
      </View>

      {/* Empty State */}
      {kycQueue.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={64} color="#3c20a1" />
          <Text style={styles.emptyTitle}>Queue is all clear!</Text>
          <Text style={styles.emptyText}>All partner applications have been processed and verified.</Text>
        </View>
      )}

      {/* KYC Cards Grid */}
      <View style={styles.cardsGrid}>
        {kycQueue.map((kyc: any) => {
          const allUploaded = Object.values(kyc.documents as any).every((d: any) => d.uploaded);
          const uploadedCount = Object.values(kyc.documents as any).filter((d: any) => d.uploaded).length;
          const totalDocs = Object.keys(kyc.documents as any).length;
          const isConfirmingReject = confirmReject === kyc.id;

          return (
            <View key={kyc.id} style={styles.card}>
              {/* Applicant Row */}
              <View style={styles.applicantRow}>
                <Image source={{ uri: kyc.avatar }} style={styles.avatar} />
                <View style={styles.applicantInfo}>
                  <Text style={styles.applicantName}>{kyc.name}</Text>
                  <Text style={styles.applicantMeta}>
                    {kyc.category.toUpperCase()} · {kyc.cooperative}
                  </Text>
                  <Text style={styles.applicantPhone}>{kyc.phone}</Text>
                </View>
                <View style={[
                  styles.docBadge,
                  { backgroundColor: allUploaded ? '#ECFDF5' : '#FEF3C7' },
                ]}>
                  <Text style={[styles.docBadgeText, { color: allUploaded ? '#059669' : '#D97706' }]}>
                    {uploadedCount}/{totalDocs} docs
                  </Text>
                </View>
              </View>

              {/* Notes */}
              {kyc.notes && (
                <View style={styles.notesBox}>
                  <Ionicons name="information-circle-outline" size={14} color="#6B7280" />
                  <Text style={styles.notesText}>{kyc.notes}</Text>
                </View>
              )}

              {/* Documents Checklist */}
              <View style={styles.docsRow}>
                {Object.entries(kyc.documents as any).map(([key, doc]: [string, any]) => (
                  <View key={key} style={[styles.docChip, !doc.uploaded && styles.docChipMissing]}>
                    <Ionicons
                      name={doc.uploaded ? 'checkmark-circle' : 'close-circle'}
                      size={13}
                      color={doc.uploaded ? '#059669' : '#EF4444'}
                    />
                    <Text style={[styles.docChipLabel, !doc.uploaded && { color: '#991B1B' }]}>
                      {DOC_LABELS[key]}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Action Buttons / Confirm Reject */}
              {isConfirmingReject ? (
                <View style={styles.confirmRejectBox}>
                  <Text style={styles.confirmText}>
                    Are you sure you want to reject {kyc.name}'s application?
                  </Text>
                  <View style={styles.confirmActions}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => setConfirmReject(null)}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.confirmRejectBtn}
                      onPress={() => handleRejectConfirm(kyc)}
                    >
                      <Ionicons name="close" size={14} color="#fff" />
                      <Text style={styles.confirmRejectBtnText}>Confirm Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => setConfirmReject(kyc.id)}
                    disabled={!!processing[kyc.id]}
                  >
                    <Ionicons name="close" size={15} color="#DC2626" />
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.approveBtn, !allUploaded && styles.approveBtnWarning]}
                    onPress={() => handleApprove(kyc)}
                    disabled={!!processing[kyc.id]}
                  >
                    <Ionicons name="checkmark" size={15} color="#fff" />
                    <Text style={styles.approveBtnText}>
                      {processing[kyc.id] === 'approving' ? 'Verifying…' : 'Approve Worker'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F4F6FA' },
  pageContent: { padding: 32, paddingBottom: 48, gap: 24 },

  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#111827' },
  pageSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  countText: { fontSize: 13, fontWeight: '700' },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },

  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  card: {
    width: '47%' as any,
    minWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  applicantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  applicantInfo: { flex: 1 },
  applicantName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  applicantMeta: { fontSize: 12, color: '#4B5563', marginTop: 2 },
  applicantPhone: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  docBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  docBadgeText: { fontSize: 12, fontWeight: '700' },

  notesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notesText: { flex: 1, fontSize: 12, color: '#4B5563' },

  docsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  docChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  docChipMissing: { backgroundColor: '#FEE2E2' },
  docChipLabel: { fontSize: 11, color: '#065F46', fontWeight: '600' },

  cardActions: { flexDirection: 'row', gap: 10 },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectBtnText: { color: '#DC2626', fontSize: 13, fontWeight: '700' },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#3c20a1',
    paddingVertical: 10,
    borderRadius: 9,
  },
  approveBtnWarning: { backgroundColor: '#D97706' },
  approveBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  confirmRejectBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  confirmText: { fontSize: 13, color: '#7F1D1D', lineHeight: 20 },
  confirmActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelBtnText: { color: '#374151', fontSize: 13, fontWeight: '600' },
  confirmRejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#DC2626',
  },
  confirmRejectBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
