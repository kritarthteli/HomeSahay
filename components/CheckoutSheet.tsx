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
  const { pricing, jobId, parsedIntent } = checkoutData;

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

  const getWhenStr = () => {
    if (parsedIntent?.timing === 'scheduled' && parsedIntent?.scheduled_date) {
      return `Scheduled for ${parsedIntent.scheduled_date} at ${parsedIntent.scheduled_time || '10:00 AM'}`;
    }
    return `Instant Arrival (~${worker.estimatedEta ?? worker.etaMinutes} mins)`;
  };

  const getWhereStr = () => {
    return parsedIntent?.location || 'Current Verified Location';
  };

  return (
    <View style={styles.sheet}>
      <View style={styles.handle} />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Review & Pay</Text>
          <Text style={styles.subtitle}>Direct cooperative booking</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Progression Step 1 & 2: When and Where */}
        <View style={styles.progressionRow}>
          <View style={styles.progressionStep}>
            <View style={styles.stepIcon}>
              <Ionicons name="time-outline" size={18} color={Colors.textPrimary} />
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepLabel}>WHEN</Text>
              <Text style={styles.stepValue}>{getWhenStr()}</Text>
            </View>
          </View>
          <View style={styles.progressionDivider} />
          <View style={styles.progressionStep}>
            <View style={styles.stepIcon}>
              <Ionicons name="location-outline" size={18} color={Colors.textPrimary} />
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepLabel}>WHERE</Text>
              <Text style={styles.stepValue} numberOfLines={1}>{getWhereStr()}</Text>
            </View>
          </View>
        </View>

        {/* Progression Step 3: Worker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SELECTED WORKER</Text>
          <View style={styles.workerCard}>
            <Image source={{ uri: worker.avatar }} style={styles.avatar} />
            <View style={styles.workerInfo}>
              <Text style={styles.workerName}>{worker.name}</Text>
              <View style={styles.workerMeta}>
                <Ionicons name="star" size={12} color={Colors.textPrimary} />
                <Text style={styles.workerMetaText}>{worker.rating}</Text>
                <View style={styles.dot} />
                <Ionicons name="shield-checkmark" size={12} color={Colors.accentPrimary} />
                <Text style={[styles.workerMetaText, { color: Colors.accentPrimary }]}>Verified Partner</Text>
              </View>
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
          <Text style={styles.sectionTitle}>PAYMENT METHOD</Text>
          <View style={styles.methodRow}>
            {PAYMENT_METHODS.map((m) => {
              const isSelected = selectedMethod === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.methodCard,
                    isSelected && styles.methodCardSelected,
                  ]}
                  onPress={() => setSelectedMethod(m.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={m.icon as any} size={24} color={isSelected ? Colors.textInverse : Colors.textMuted} />
                  <Text style={[styles.methodLabel, isSelected && { color: Colors.textInverse }]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

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
              <Ionicons name="checkmark-circle" size={24} color={Colors.darkSurfaceDeep} />
              <Text style={styles.payBtnText}>PAYMENT CONFIRMED!</Text>
            </>
          ) : (
            <>
              <Ionicons name="lock-closed" size={20} color={Colors.darkSurfaceDeep} />
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
    width: 48,
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: -1,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.mono,
    marginTop: 4,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  progressionRow: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.xl,
  },
  progressionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.canvasCream,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  stepInfo: { flex: 1 },
  stepLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1.5,
  },
  stepValue: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    marginTop: 2,
  },
  progressionDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.canvasCream,
  },
  workerInfo: { flex: 1 },
  workerName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: -0.5,
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
    fontSize: 12,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderLight,
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
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
  },
  totalValue: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
  },
  cooperativeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.md,
    backgroundColor: Colors.canvasDark,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  cooperativeNoteText: {
    color: Colors.accentPrimary,
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
    gap: 12,
  },
  methodCardSelected: {
    borderColor: Colors.canvasDark,
    backgroundColor: Colors.canvasDark,
    ...Shadow.sm,
  },
  methodLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
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
    marginBottom: Spacing.md,
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
    gap: Spacing.md,
    backgroundColor: Colors.accentPrimary,
    borderRadius: Radius.full,
    paddingVertical: 20,
    marginTop: Spacing.md,
    ...Shadow.glow,
  },
  payBtnDisabled: {
    opacity: 0.7,
    shadowOpacity: 0,
  },
  payBtnText: {
    color: Colors.darkSurfaceDeep,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: -0.5,
  },
});
