import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Redirect } from 'expo-router';
import { fetchAnalytics } from '../../services/mockApi';
import AnalyticsChart from '../../components/AnalyticsChart';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';
import { useAppStore } from '../../store/appStore';

export default function AdminAnalytics() {
  const router = useRouter();
  const { auth, workers, jobs } = useAppStore();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics().then((data) => {
      setAnalytics(data);
      setLoading(false);
    });
  }, []);

  if (!auth.admin) return <Redirect href="/(admin)/login" />;

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={Colors.accentPrimary} />
        <Text style={styles.loadingText}>Loading cooperative analytics…</Text>
      </View>
    );
  }

  const { summary, jobsByWorker } = analytics;

  const summaryCards = [
    {
      label: 'TOTAL JOBS TODAY',
      value: summary.totalJobs,
      icon: 'briefcase-outline' as const,
      color: Colors.textPrimary,
      bg: Colors.canvasCream,
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'ACTIVE WORKERS',
      value: summary.activeWorkers,
      icon: 'people-outline' as const,
      color: Colors.textPrimary,
      bg: Colors.canvasCream,
      trend: '+3',
      trendUp: true,
    },
    {
      label: 'REVENUE TODAY',
      value: `₹${summary.totalRevenue.toLocaleString('en-IN')}`,
      icon: 'cash-outline' as const,
      color: Colors.textPrimary,
      bg: Colors.canvasCream,
      trend: '+8%',
      trendUp: true,
    },
    {
      label: 'FAIRNESS INDEX',
      value: `${(summary.fairnessIndex * 100).toFixed(0)}%`,
      icon: 'scale-outline' as const,
      color: summary.fairnessIndex >= 0.75 ? Colors.accentPrimaryDark : Colors.warningDark,
      bg: summary.fairnessIndex >= 0.75 ? Colors.accentPrimaryDim : Colors.warningContainer,
      trend: summary.fairnessIndex >= 0.75 ? 'Excellent' : 'Moderate',
      trendUp: summary.fairnessIndex >= 0.75,
    },
  ];

  const workerColors = [Colors.accentPrimaryDark, Colors.textPrimary, Colors.textSecondary, Colors.warningDark, Colors.danger];

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
      {/* Page Header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Governance & Analytics</Text>
          <Text style={styles.pageSubtitle}>JP Nagar Workers Cooperative · Live Monitoring</Text>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.giniPill}>
            <Text style={styles.giniPillText}>GINI: {summary.giniCoefficient} · EQUITABLE</Text>
          </View>
        </View>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiRow}>
        {summaryCards.map((card) => (
          <View key={card.label} style={styles.kpiCard}>
            <View style={styles.kpiCardTop}>
              <View style={[styles.kpiIconBox, { backgroundColor: card.bg }]}>
                <Ionicons name={card.icon} size={20} color={card.color} />
              </View>
              <View style={[styles.trendBadge, { backgroundColor: card.trendUp ? Colors.accentPrimary : Colors.warning }]}>
                <Ionicons
                  name={card.trendUp ? 'trending-up-outline' : 'remove-outline'}
                  size={12}
                  color={Colors.darkSurfaceDeep}
                />
                <Text style={styles.trendText}>
                  {card.trend}
                </Text>
              </View>
            </View>
            <Text style={styles.kpiValue}>{card.value}</Text>
            <Text style={styles.kpiLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      {/* Bottom two-column layout */}
      <View style={styles.twoCol}>
        {/* Chart */}
        <View style={[styles.panel, { flex: 1.4 }]}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Anti-Monopoly Job Distribution</Text>
            <Text style={styles.panelSub}>Per-worker dispatch volume today</Text>
          </View>
          <AnalyticsChart
            data={jobsByWorker}
            fairnessIndex={summary.fairnessIndex}
            giniCoefficient={summary.giniCoefficient}
          />
        </View>

        {/* Worker Table */}
        <View style={[styles.panel, { flex: 1 }]}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Worker Performance</Text>
            <Text style={styles.panelSub}>Today's dispatch summary</Text>
          </View>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHead]}>
              <Text style={[styles.tableCell, styles.tableHeadCell, { flex: 2 }]}>WORKER</Text>
              <Text style={[styles.tableCell, styles.tableHeadCell]}>JOBS</Text>
              <Text style={[styles.tableCell, styles.tableHeadCell]}>EARNINGS</Text>
              <Text style={[styles.tableCell, styles.tableHeadCell]}>RATING</Text>
            </View>
            {jobsByWorker.map((w: any, i: number) => (
              <View key={w.workerId} style={[styles.tableRow, i % 2 === 0 && styles.tableRowEven]}>
                <View style={[styles.tableCell, { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                  <View style={[styles.workerDot, { backgroundColor: workerColors[i % 5] }]} />
                  <Text style={styles.workerName} numberOfLines={1}>{w.name}</Text>
                </View>
                <Text style={styles.tableValueCell}>{w.todayJobs}</Text>
                <Text style={[styles.tableValueCell, { color: Colors.textPrimary, fontWeight: Typography.fontWeight.bold }]}>
                  ₹{w.todayEarnings}
                </Text>
                <Text style={styles.tableValueCell}>{w.rating} ★</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={18} color={Colors.textPrimary} />
        <Text style={styles.infoBannerText}>
          The Fairness Engine automatically prioritizes workers with fewer daily jobs to prevent monopolization of gig income. Current Fairness Score exceeds target (75%+).
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.canvasLight },
  pageContent: { padding: Spacing['4xl'], paddingBottom: Spacing['4xl'], gap: Spacing['2xl'] },

  loadingScreen: {
    flex: 1,
    backgroundColor: Colors.canvasLight,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: { color: Colors.textSecondary, fontFamily: Typography.fontFamily.mono, fontSize: 12 },

  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pageTitle: { fontSize: Typography.fontSize['3xl'], fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, letterSpacing: -1 },
  pageSubtitle: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  headerActions: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  giniPill: {
    backgroundColor: Colors.darkSurfaceDeep,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    ...Shadow.glow,
  },
  giniPillText: { color: Colors.accentPrimary, fontFamily: Typography.fontFamily.mono, fontSize: 10, fontWeight: Typography.fontWeight.bold, letterSpacing: 1 },

  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
    ...Shadow.soft,
  },
  kpiCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kpiIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  trendText: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.darkSurfaceDeep },
  kpiValue: { fontSize: Typography.fontSize['3xl'], fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, letterSpacing: -1 },
  kpiLabel: { fontSize: 10, fontFamily: Typography.fontFamily.mono, color: Colors.textSecondary, fontWeight: Typography.fontWeight.bold, letterSpacing: 1 },

  twoCol: { flexDirection: 'row', gap: Spacing.xl },
  panel: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.soft,
  },
  panelHeader: { marginBottom: Spacing.xl, gap: Spacing.xs },
  panelTitle: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, letterSpacing: -0.5 },
  panelSub: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },

  table: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tableHead: { backgroundColor: Colors.canvasCream },
  tableHeadCell: { fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textSecondary, fontSize: 10, letterSpacing: 1 },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tableRowEven: { backgroundColor: Colors.canvasLight },
  tableCell: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.body,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  tableValueCell: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  workerDot: { width: 10, height: 10, borderRadius: Radius.full },
  workerName: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.body, fontWeight: Typography.fontWeight.semibold, color: Colors.textPrimary, flex: 1 },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Colors.canvasCream,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  infoBannerText: { flex: 1, fontSize: 12, fontFamily: Typography.fontFamily.mono, color: Colors.textPrimary, lineHeight: 20 },
});
