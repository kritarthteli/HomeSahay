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
            [Colors.accentPrimaryDark, Colors.textPrimary, Colors.textSecondary, Colors.warningDark, Colors.danger][i % 5]
        ),
      },
    ],
  };

  const chartConfig = {
    backgroundColor: Colors.surfaceLight,
    backgroundGradientFrom: Colors.surfaceLight,
    backgroundGradientTo: Colors.canvasCream,
    decimalPlaces: 0,
    color: (opacity = 1) => Colors.textPrimary,
    labelColor: (opacity = 1) => Colors.textSecondary,
    barPercentage: 0.7,
    style: { borderRadius: Radius.lg },
    propsForDots: { r: '4', strokeWidth: '2', stroke: Colors.textPrimary },
    propsForBackgroundLines: { stroke: Colors.borderLight, strokeDasharray: '4' },
    fillShadowGradient: Colors.textPrimary,
    fillShadowGradientOpacity: 0.6,
  };

  const fairnessColor =
    fairnessIndex >= 0.75 ? Colors.accentPrimaryDark : fairnessIndex >= 0.5 ? Colors.warningDark : Colors.danger;

  return (
    <View style={styles.container}>
      {/* Fairness metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>FAIRNESS INDEX</Text>
          <Text style={[styles.metricValue, { color: fairnessColor }]}>
            {(fairnessIndex * 100).toFixed(0)}%
          </Text>
          <View style={styles.metricBar}>
            <View style={[styles.metricFill, { width: `${fairnessIndex * 100}%`, backgroundColor: fairnessColor }]} />
          </View>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>GINI COEFFICIENT</Text>
          <Text style={[styles.metricValue, { color: giniCoefficient < 0.3 ? Colors.accentPrimaryDark : Colors.warningDark }]}>
            {giniCoefficient.toFixed(3)}
          </Text>
          <Text style={[styles.metricSub, { color: giniCoefficient < 0.3 ? Colors.accentPrimaryDark : Colors.warningDark }]}>{giniCoefficient < 0.3 ? 'EQUITABLE ALLOCATION ✓' : 'MODERATE SPREAD'}</Text>
        </View>
      </View>

      {/* Bar chart */}
      <View style={styles.chartWrapper}>
        <Text style={styles.chartTitle}>JOBS ASSIGNED TODAY (PER WORKER)</Text>
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
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 4,
  },
  metricLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
  },
  metricValue: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: -1,
  },
  metricBar: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginTop: 4,
  },
  metricFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  metricSub: {
    fontSize: 9,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
  },
  chartWrapper: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  chartTitle: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
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
    backgroundColor: Colors.canvasCream,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.textPrimary,
  },
  legendText: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    flex: 1,
    lineHeight: 16,
  },
});
