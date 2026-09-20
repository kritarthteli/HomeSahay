import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';

const SCREEN_W = Dimensions.get('window').width;

export default function AnalyticsChart({
  data,
  fairnessIndex,
  giniCoefficient,
}: {
  data: any[];
  fairnessIndex: number;
  giniCoefficient: number;
}) {
  if (!data || data.length === 0) return null;

  const chartData = {
    labels: data.map((d) => d.name.split(' ')[0]),
    datasets: [
      {
        data: data.map((d) => d.todayJobs),
        colors: data.map((d, i) =>
          (opacity = 1) =>
            ['#3c20a1ff', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF'][i % 5]
        ),
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#F8FAFC',
    backgroundGradientFrom: '#F8FAFC',
    backgroundGradientTo: '#EEF2FF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(60, 32, 161, ${opacity})`, // #3c20a1ff theme
    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    barPercentage: 0.7,
    style: { borderRadius: Radius.lg },
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#3c20a1ff' },
    propsForBackgroundLines: { stroke: '#E5E7EB', strokeDasharray: '4' },
    fillShadowGradient: '#3c20a1ff',
    fillShadowGradientOpacity: 0.6,
  };

  const fairnessColor =
    fairnessIndex >= 0.75 ? '#059669' : fairnessIndex >= 0.5 ? '#D97706' : '#DC2626';

  return (
    <View style={styles.container}>
      {/* Fairness metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Fairness Index</Text>
          <Text style={[styles.metricValue, { color: fairnessColor }]}>
            {(fairnessIndex * 100).toFixed(0)}%
          </Text>
          <View style={styles.metricBar}>
            <View style={[styles.metricFill, { width: `${fairnessIndex * 100}%`, backgroundColor: fairnessColor }]} />
          </View>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Gini Coefficient</Text>
          <Text style={[styles.metricValue, { color: giniCoefficient < 0.3 ? '#059669' : '#D97706' }]}>
            {giniCoefficient.toFixed(3)}
          </Text>
          <Text style={styles.metricSub}>{giniCoefficient < 0.3 ? 'Equitable allocation ✓' : 'Moderate spread'}</Text>
        </View>
      </View>

      {/* Bar chart */}
      <View style={styles.chartWrapper}>
        <Text style={styles.chartTitle}>Jobs Assigned Today (per Worker)</Text>
        <BarChart
          data={chartData}
          width={Math.min(SCREEN_W - Spacing.base * 2, 540)}
          height={200}
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars
          fromZero
        />
      </View>

      {/* Legend / explanation */}
      <View style={styles.legend}>
        <View style={styles.legendDot} />
        <Text style={styles.legendText}>
          Cooperative dispatch throttles workers with high daily volumes to maintain fairness & worker well-being.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  metricLabel: {
    color: '#6B7280',
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '800',
  },
  metricBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  metricFill: {
    height: '100%',
    borderRadius: 2,
  },
  metricSub: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '600',
  },
  chartWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  chartTitle: {
    color: '#111827',
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  chart: {
    borderRadius: Radius.md,
    marginLeft: -Spacing.md,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#EEF2FF',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
  },
  legendText: {
    color: '#4338CA',
    fontSize: Typography.fontSize.xs,
    flex: 1,
    lineHeight: 16,
  },
});
