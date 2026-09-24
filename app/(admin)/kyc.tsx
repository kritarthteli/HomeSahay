import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/appStore';
import { processKYC } from '../../services/mockApi';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';

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
          { backgroundColor: kycQueue.length > 0 ? Colors.warningContainer : Colors.canvasCream },
        ]}>
          <Ionicons
            name={kycQueue.length > 0 ? 'time-outline' : 'checkmark-circle-outline'}
            size={18}
            color={kycQueue.length > 0 ? Colors.warningDark : Colors.textPrimary}
          />
          <Text style={[styles.countText, { color: kycQueue.length > 0 ? Colors.warningDark : Colors.textPrimary }]}>
            {kycQueue.length} PENDING
          </Text>
        </View>
      </View>

      {/* Empty State */}
      {kycQueue.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={64} color={Colors.textMuted} />
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
                  { backgroundColor: allUploaded ? Colors.canvasCream : Colors.warningContainer },
                ]}>
                  <Text style={[styles.docBadgeText, { color: allUploaded ? Colors.textPrimary : Colors.warningDark }]}>
                    {uploadedCount}/{totalDocs} DOCS
                  </Text>
                </View>
              </View>

              {/* Notes */}
              {kyc.notes && (
                <View style={styles.notesBox}>
                  <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.notesText}>{kyc.notes}</Text>
                </View>
              )}

              {/* Documents Checklist */}
              <View style={styles.docsRow}>
                {Object.entries(kyc.documents as any).map(([key, doc]: [string, any]) => (
                  <View key={key} style={[styles.docChip, !doc.uploaded && styles.docChipMissing]}>
                    <Ionicons
                      name={doc.uploaded ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={doc.uploaded ? Colors.textPrimary : Colors.danger}
                    />
                    <Text style={[styles.docChipLabel, !doc.uploaded && { color: Colors.danger }]}>
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
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cancelBtnText}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.confirmRejectBtn}
                      onPress={() => handleRejectConfirm(kyc)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="close" size={16} color={Colors.darkSurfaceDeep} />
                      <Text style={styles.confirmRejectBtnText}>CONFIRM REJECT</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => setConfirmReject(kyc.id)}
                    disabled={!!processing[kyc.id]}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close" size={16} color={Colors.danger} />
                    <Text style={styles.rejectBtnText}>REJECT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.approveBtn, !allUploaded && styles.approveBtnWarning]}
                    onPress={() => handleApprove(kyc)}
                    disabled={!!processing[kyc.id]}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark" size={16} color={Colors.darkSurfaceDeep} />
                    <Text style={styles.approveBtnText}>
                      {processing[kyc.id] === 'approving' ? 'VERIFYING…' : 'APPROVE WORKER'}
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
  page: { flex: 1, backgroundColor: Colors.canvasCream },
  pageContent: { 
    padding: 48, 
    paddingBottom: 64, 
    gap: 40, 
    maxWidth: 1400, 
    alignSelf: 'center', 
    width: '100%' 
  },

  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pageTitle: { fontSize: Typography.fontSize['3xl'], fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, letterSpacing: -1 },
  pageSubtitle: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: Radius.full,
  },
  countText: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, letterSpacing: 1 },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: Spacing.md,
  },
  emptyTitle: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, letterSpacing: -0.5 },
  emptyText: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.body, color: Colors.textSecondary, textAlign: 'center' },

  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xl,
  },
  card: {
    width: '47%' as any,
    minWidth: 360,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.xl,
    ...Shadow.lg,
  },
  applicantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  applicantInfo: { flex: 1 },
  applicantName: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, letterSpacing: -0.5 },
  applicantMeta: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textSecondary, marginTop: 4, letterSpacing: 1 },
  applicantPhone: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.mono, color: Colors.textMuted, marginTop: 2 },
  docBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  docBadgeText: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, letterSpacing: 1 },

  notesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.canvasCream,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  notesText: { flex: 1, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.body, color: Colors.textPrimary },

  docsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  docChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.canvasCream,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  docChipMissing: { backgroundColor: Colors.dangerContainer, borderColor: Colors.dangerContainer },
  docChipLabel: { fontSize: 10, fontFamily: Typography.fontFamily.mono, color: Colors.textPrimary, fontWeight: Typography.fontWeight.bold, letterSpacing: 0.5 },

  cardActions: { flexDirection: 'row', gap: Spacing.md },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.dangerContainer,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  rejectBtnText: { color: Colors.danger, fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.black, letterSpacing: 1 },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.accentPrimary,
    paddingVertical: 14,
    borderRadius: Radius.full,
    ...Shadow.glow,
  },
  approveBtnWarning: { backgroundColor: Colors.warningDark },
  approveBtnText: { color: Colors.darkSurfaceDeep, fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.black, letterSpacing: 1 },

  confirmRejectBox: {
    backgroundColor: Colors.dangerContainer,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  confirmText: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.body, color: Colors.danger, lineHeight: 20 },
  confirmActions: { flexDirection: 'row', gap: Spacing.md },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cancelBtnText: { color: Colors.textPrimary, fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, letterSpacing: 1 },
  confirmRejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.danger,
  },
  confirmRejectBtnText: { color: Colors.darkSurfaceDeep, fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, letterSpacing: 1 },
});
