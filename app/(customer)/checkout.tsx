import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import CheckoutSheet from '../../components/CheckoutSheet';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function CheckoutScreen() {
  const router = useRouter();
  const { checkoutData, workers, addJob, getActiveCustomer, incrementWorkerJobs } = useAppStore();

  const customer = getActiveCustomer();
  const worker = workers.find((w) => w.id === checkoutData?.workerId);

  const handlePaymentSuccess = (result) => {
    if (checkoutData) {
      addJob({
        id: checkoutData.jobId,
        workerId: checkoutData.workerId,
        customerId: customer?.id,
        category: 'service',
        amount: checkoutData.pricing.totalAmount,
        status: 'paid',
        date: new Date().toISOString().split('T')[0],
        transactionId: result.transactionId,
        paymentMethod: result.method,
      });
      incrementWorkerJobs(checkoutData.workerId, checkoutData.pricing.totalAmount);
    }
    router.push('/tracking');
  };

  if (!checkoutData || !worker) {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <SafeAreaView edges={['top']} />
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={20} color={Colors.textInverse} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Checkout</Text>
          </View>
        </View>

        <View style={styles.emptySheet}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="cart-outline" size={48} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>No Active Checkout</Text>
          <Text style={styles.emptyText}>Select a verified worker from the home screen to proceed.</Text>
          <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push('/(customer)')}>
            <Text style={styles.exploreBtnText}>Find Workers Nearby</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']} />
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={Colors.textInverse} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Confirm Booking</Text>
            <Text style={styles.headerSub}>Cooperative Guaranteed Service</Text>
          </View>
        </View>
      </View>

      <View style={styles.sheetContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <CheckoutSheet
            checkoutData={checkoutData}
            worker={worker}
            onPaymentSuccess={handlePaymentSuccess}
            onClose={() => router.back()}
          />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.canvasDark,
  },
  header: {
    backgroundColor: Colors.canvasDark,
    paddingBottom: Spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    gap: Spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceInteractive,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  headerTitle: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: -0.5,
  },
  headerSub: {
    color: Colors.textInverseMuted,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: Colors.canvasLight,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    overflow: 'hidden',
  },
  emptySheet: {
    flex: 1,
    backgroundColor: Colors.canvasLight,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.canvasCream,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    maxWidth: 260,
  },
  exploreBtn: {
    backgroundColor: Colors.accentPrimary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    borderRadius: Radius.full,
    ...Shadow.glow,
  },
  exploreBtnText: {
    color: Colors.textOnPrimary,
    fontSize: 12,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
