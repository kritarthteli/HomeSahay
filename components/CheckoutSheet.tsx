import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadow, Typography } from '../constants/theme';
import { processPayment } from '../services/mockApi';

export default function CheckoutSheet({ checkoutData, worker, onPaymentSuccess, onClose }: any) {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const PAYMENT_METHODS = [
    { id: 'upi', label: 'UPI', icon: 'phone-portrait-outline', color: Colors.textPrimary },
    { id: 'card', label: 'Card', icon: 'card-outline', color: Colors.textSecondary },
    { id: 'cash', label: 'Cash', icon: 'cash-outline', color: Colors.textSecondary },
  ];

  if (!checkoutData || !worker) return null;
  const { pricing, jobId } = checkoutData;

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await processPayment({
        amount: pricing.totalAmount,
        method: selectedMethod,
        jobId,
      });
      setSuccess(true);
      setTimeout(() => onPaymentSuccess?.(result), 1200);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.sheet}>
      {/* Handle */}
      <View style={styles.handle} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Review & Pay</Text>
          <Text style={styles.subtitle}>Direct booking with transparent cooperative pricing</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Worker summary */}
        <View style={styles.workerCard}>
          <Image source={{ uri: worker.avatar }} style={styles.avatar} />
          <View style={styles.workerInfo}>
            <Text style={styles.workerName}>{worker.name}</Text>
            <View style={styles.workerMeta}>
              <Ionicons name="star" size={12} color={Colors.textPrimary} />
              <Text style={styles.workerMetaText}>{worker.rating}</Text>
              <View style={styles.dot} />
              <Ionicons name="shield-checkmark" size={12} color={Colors.textPrimary} />
              <Text style={styles.workerMetaText}>Verified Partner</Text>
              <View style={styles.dot} />
              <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
              <Text style={styles.workerMetaText}>ETA ~{worker.estimatedEta ?? worker.etaMinutes} min</Text>
            </View>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRICE BREAKDOWN</Text>
          <View style={styles.breakdownCard}>
            {pricing.breakdown.map((item: any, i: number) => (
              <View key={i} style={styles.priceRow}>
                <Text style={styles.priceLabel}>{item.label}</Text>
                <Text style={styles.priceValue}>₹{item.amount}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalValue}>₹{pricing.totalAmount}</Text>
            </View>
          </View>

          <View style={styles.cooperativeNote}>
            <Ionicons name="shield-checkmark" size={16} color={Colors.textOnPrimary} />
            <Text style={styles.cooperativeNoteText}>
              100% of the service fee goes directly to {worker.name.split(' ')[0]}. Zero surge fees.
            </Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SELECT PAYMENT METHOD</Text>
          <View style={styles.methodRow}>
            {PAYMENT_METHODS.map((m) => {
              const isSelected = selectedMethod === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.methodCard,
                    isSelected && { borderColor: Colors.textPrimary, backgroundColor: Colors.borderLight },
                  ]}
                  onPress={() => setSelectedMethod(m.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={m.icon as any} size={20} color={isSelected ? Colors.textPrimary : Colors.textMuted} />
                  <Text style={[styles.methodLabel, isSelected && { color: Colors.textPrimary, fontWeight: Typography.fontWeight.bold }]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={16} color={Colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.payBtn, (loading || success) && styles.payBtnDisabled]}
          onPress={handlePay}
          disabled={loading || success}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={Colors.darkSurfaceDeep} size="small" />
          ) : success ? (
            <>
              <Ionicons name="checkmark-circle" size={20} color={Colors.darkSurfaceDeep} />
              <Text style={styles.payBtnText}>PAYMENT CONFIRMED!</Text>
            </>
          ) : (
            <>
              <Ionicons name="lock-closed" size={16} color={Colors.darkSurfaceDeep} />
              <Text style={styles.payBtnText}>PAY ₹{pricing.totalAmount} & CONFIRM</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: Colors.canvasLight,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['3xl'],
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginBottom: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    marginTop: 4,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    backgroundColor: Colors.canvasCream,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  workerInfo: { flex: 1 },
  workerName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.bold,
  },
  workerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  workerMetaText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderLight,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  breakdownCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  priceLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.semibold,
  },
  priceValue: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  totalLabel: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
  },
  totalValue: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
  },
  cooperativeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.sm,
    backgroundColor: Colors.accentPrimary,
    borderRadius: Radius.full,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  cooperativeNoteText: {
    color: Colors.textOnPrimary,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    flex: 1,
    letterSpacing: 0.5,
  },
  methodRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  methodCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 8,
  },
  methodLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dangerContainer,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    flex: 1,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accentPrimary,
    borderRadius: Radius.full,
    paddingVertical: 18,
    marginTop: Spacing.sm,
    ...Shadow.glow,
  },
  payBtnDisabled: {
    opacity: 0.7,
    shadowOpacity: 0,
  },
  payBtnText: {
    color: Colors.darkSurfaceDeep,
    fontSize: 14,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 1,
  },
});
