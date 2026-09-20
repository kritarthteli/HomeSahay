import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Redirect } from 'expo-router';
import { fetchAnalytics } from '../../services/mockApi';
import AnalyticsChart from '../../components/AnalyticsChart';
import { Spacing, Radius, Typography } from '../../constants/theme';
import { useAppStore } from '../../store/appStore';

export default function AdminAnalytics() {
  const router = useRouter();
  const { auth, workers, jobs } = useAppStore();
  const [analytics, setAnalytics] = useState(null);
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
        <ActivityIndicator size="large" color="#3c20a1" />
        <Text style={styles.loadingText}>Loading cooperative analytics…</Text>
      </View>
    );
  }

  const { summary, jobsByWorker } = analytics;

  const summaryCards = [
    {
      label: 'Total Jobs Today',
      value: summary.totalJobs,
      icon: 'briefcase-outline' as const,
      color: '#6366F1',
      bg: '#EEF2FF',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Active Workers',
      value: summary.activeWorkers,
      icon: 'people-outline' as const,
      color: '#3c20a1',
      bg: '#EDE9FE',
      trend: '+3',
      trendUp: true,
    },
    {
      label: 'Revenue Today',
      value: `₹${summary.totalRevenue.toLocaleString('en-IN')}`,
      icon: 'cash-outline' as const,
      color: '#059669',
      bg: '#ECFDF5',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: 'Fairness Index',
      value: `${(summary.fairnessIndex * 100).toFixed(0)}%`,
      icon: 'scale-outline' as const,
      color: summary.fairnessIndex >= 0.75 ? '#059669' : '#D97706',
      bg: '#F0FDF4',
      trend: summary.fairnessIndex >= 0.75 ? 'Excellent' : 'Moderate',
      trendUp: summary.fairnessIndex >= 0.75,
    },
  ];

  const workerColors = ['#6366F1', '#3c20a1', '#8B5CF6', '#A855F7', '#D946EF'];

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
            <Text style={styles.giniPillText}>Gini: {summary.giniCoefficient} · Equitable</Text>
          </View>
        </View>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiRow}>
        {summaryCards.map((card) => (
          <View key={card.label} style={styles.kpiCard}>
            <View style={styles.kpiCardTop}>
              <View style={[styles.kpiIconBox, { backgroundColor: card.bg }]}>
                <Ionicons name={card.icon} size={22} color={card.color} />
              </View>
              <View style={[styles.trendBadge, { backgroundColor: card.trendUp ? '#ECFDF5' : '#FEF3C7' }]}>
                <Ionicons
                  name={card.trendUp ? 'trending-up-outline' : 'remove-outline'}
                  size={12}
                  color={card.trendUp ? '#059669' : '#D97706'}
                />
                <Text style={[styles.trendText, { color: card.trendUp ? '#059669' : '#D97706' }]}>
                  {card.trend}
                </Text>
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: card.color }]}>{card.value}</Text>
            <Text style={styles.kpiLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      {/* Bottom two-column layout */}
      <View style={styles.twoCol}>
        {/* Chart */}
        <View style={[styles.panel, { flex: 1.4 }]}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>⚖️ Anti-Monopoly Job Distribution</Text>
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
            <Text style={styles.panelTitle}>👷 Worker Performance</Text>
            <Text style={styles.panelSub}>Today's dispatch summary</Text>
          </View>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHead]}>
              <Text style={[styles.tableCell, styles.tableHeadCell, { flex: 2 }]}>Worker</Text>
              <Text style={[styles.tableCell, styles.tableHeadCell]}>Jobs</Text>
              <Text style={[styles.tableCell, styles.tableHeadCell]}>Earnings</Text>
              <Text style={[styles.tableCell, styles.tableHeadCell]}>Rating</Text>
            </View>
            {jobsByWorker.map((w, i) => (
              <View key={w.workerId} style={[styles.tableRow, i % 2 === 0 && styles.tableRowEven]}>
                <View style={[styles.tableCell, { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                  <View style={[styles.workerDot, { backgroundColor: workerColors[i % 5] }]} />
                  <Text style={styles.workerName} numberOfLines={1}>{w.name}</Text>
                </View>
                <Text style={styles.tableCell}>{w.todayJobs}</Text>
                <Text style={[styles.tableCell, { color: '#059669', fontWeight: '700' }]}>
                  ₹{w.todayEarnings}
                </Text>
                <Text style={styles.tableCell}>{w.rating} ★</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={18} color="#6366F1" />
        <Text style={styles.infoBannerText}>
          The Fairness Engine automatically prioritizes workers with fewer daily jobs to prevent monopolization of gig income.
          Current Fairness Score exceeds target (75%+).
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F4F6FA' },
  pageContent: { padding: 32, paddingBottom: 48, gap: 24 },

  loadingScreen: {
    flex: 1,
    backgroundColor: '#F4F6FA',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: { color: '#6B7280', fontSize: 15 },

  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#111827' },
  pageSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  headerActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  giniPill: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  giniPillText: { color: '#3c20a1', fontSize: 12, fontWeight: '700' },

  kpiRow: {
    flexDirection: 'row',
    gap: 16,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  kpiCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kpiIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  trendText: { fontSize: 11, fontWeight: '700' },
  kpiValue: { fontSize: 30, fontWeight: '900' },
  kpiLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500' },

  twoCol: { flexDirection: 'row', gap: 20 },
  panel: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  panelHeader: { marginBottom: 16, gap: 2 },
  panelTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  panelSub: { fontSize: 12, color: '#9CA3AF' },

  table: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tableHead: { backgroundColor: '#F3F4F6' },
  tableHeadCell: { fontWeight: '700', color: '#374151', fontSize: 12 },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableRowEven: { backgroundColor: '#FAFAFA' },
  tableCell: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    textAlign: 'center',
  },
  workerDot: { width: 9, height: 9, borderRadius: 5 },
  workerName: { fontSize: 13, fontWeight: '600', color: '#111827', flex: 1 },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  infoBannerText: { flex: 1, fontSize: 13, color: '#3730A3', lineHeight: 20 },
});
