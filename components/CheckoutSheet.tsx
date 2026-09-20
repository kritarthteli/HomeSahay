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

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: 'phone-portrait-outline', color: '#6366F1' },
  { id: 'card', label: 'Card', icon: 'card-outline', color: '#3c20a1ff' },
  { id: 'cash', label: 'Cash', icon: 'cash-outline', color: '#3c20a1ff' },
];

export default function CheckoutSheet({ checkoutData, worker, onPaymentSuccess, onClose }) {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

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
    } catch (e) {
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
          <Ionicons name="close" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Worker summary */}
        <View style={styles.workerCard}>
          <Image source={{ uri: worker.avatar }} style={styles.avatar} />
          <View style={styles.workerInfo}>
            <Text style={styles.workerName}>{worker.name}</Text>
            <View style={styles.workerMeta}>
              <Ionicons name="star" size={13} color="#3c20a1ff" />
              <Text style={styles.workerMetaText}>{worker.rating}</Text>
              <View style={styles.dot} />
              <Ionicons name="shield-checkmark" size={13} color="#3c20a1ff" />
              <Text style={styles.workerMetaText}>Verified Partner</Text>
              <View style={styles.dot} />
              <Ionicons name="time-outline" size={13} color="#6366F1" />
              <Text style={styles.workerMetaText}>ETA ~{worker.estimatedEta ?? worker.etaMinutes} min</Text>
            </View>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.breakdownCard}>
            {pricing.breakdown.map((item, i) => (
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
            <Ionicons name="shield-checkmark" size={16} color="#059669" />
            <Text style={styles.cooperativeNoteText}>
              100% of the service fee goes directly to {worker.name.split(' ')[0]}. Zero surge fees.
            </Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          <View style={styles.methodRow}>
            {PAYMENT_METHODS.map((m) => {
              const isSelected = selectedMethod === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.methodCard,
                    isSelected && { borderColor: m.color, backgroundColor: m.color + '12' },
                  ]}
                  onPress={() => setSelectedMethod(m.id)}
                >
                  <Ionicons name={m.icon} size={22} color={isSelected ? m.color : '#6B7280'} />
                  <Text style={[styles.methodLabel, isSelected && { color: m.color, fontWeight: '700' }]}>
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
            <Ionicons name="alert-circle" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.payBtn, (loading || success) && styles.payBtnDisabled]}
          onPress={handlePay}
          disabled={loading || success}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : success ? (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.payBtnText}>Payment Confirmed!</Text>
            </>
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color="#fff" />
              <Text style={styles.payBtnText}>Pay ₹{pricing.totalAmount} & Confirm</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['3xl'],
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.base,
  },
  title: {
    color: '#111827',
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  workerInfo: { flex: 1 },
  workerName: {
    color: '#111827',
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
  },
  workerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  workerMetaText: {
    color: '#4B5563',
    fontSize: Typography.fontSize.xs,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D1D5DB',
  },
  section: {
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  breakdownCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  priceLabel: {
    color: '#4B5563',
    fontSize: Typography.fontSize.sm,
  },
  priceValue: {
    color: '#111827',
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: Spacing.sm,
  },
  totalLabel: {
    color: '#111827',
    fontSize: Typography.fontSize.base,
    fontWeight: '800',
  },
  totalValue: {
    color: '#059669',
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
  },
  cooperativeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
    backgroundColor: '#ECFDF5',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  cooperativeNoteText: {
    color: '#065F46',
    fontSize: Typography.fontSize.xs,
    flex: 1,
    lineHeight: 16,
  },
  methodRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  methodCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  methodLabel: {
    color: '#6B7280',
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    color: '#DC2626',
    fontSize: Typography.fontSize.xs,
    flex: 1,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#6366F1',
    borderRadius: Radius.lg,
    paddingVertical: 16,
    marginTop: Spacing.sm,
    shadowColor: '#6366F1',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  payBtnDisabled: {
    opacity: 0.7,
  },
  payBtnText: {
    color: '#fff',
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
  },
});
