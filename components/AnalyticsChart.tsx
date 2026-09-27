import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';

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

      {/* Custom Bar chart */}
      <View style={styles.chartWrapper}>
        <Text style={styles.chartTitle}>JOBS ASSIGNED TODAY (PER WORKER)</Text>
        <View style={styles.weekBars}>
          {data.map((worker, i) => {
            const count = worker.todayJobs ?? 0;
            const maxCount = Math.max(...data.map(d => d.todayJobs || 0), 1);
            // Calculate height relative to the max count, with a min of 12 and max of 120
            const height = Math.max(12, (count / maxCount) * 120);
            return (
              <View key={i} style={styles.weekBarWrapper}>
                <Text style={styles.weekBarCount}>{count}</Text>
                <View style={[styles.weekBar, { height }]} />
                <Text style={styles.weekDay}>{worker.name.split(' ')[0]}</Text>
              </View>
            );
          })}
        </View>
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
    marginBottom: Spacing.xl,
  },
  weekBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 140,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  weekBarWrapper: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 8,
  },
  weekBarCount: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
  },
  weekBar: {
    width: 20,
    backgroundColor: Colors.textSecondary,
    borderRadius: Radius.full,
    minHeight: 12,
  },
  weekDay: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.semibold,
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
