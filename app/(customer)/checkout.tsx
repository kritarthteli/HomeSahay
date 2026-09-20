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
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
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
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
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
    backgroundColor: '#121212',
  },
  header: {
    backgroundColor: '#121212',
    paddingBottom: Spacing.lg,
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
    borderRadius: 18,
    backgroundColor: '#1E1E22',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D35',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
  },
  headerSub: {
    color: '#9CA3AF',
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  emptySheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    maxWidth: 260,
  },
  exploreBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    borderRadius: Radius.lg,
  },
  exploreBtnText: {
    color: '#fff',
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },
});
