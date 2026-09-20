import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { useAppStore } from '../store/appStore';

const WEIGHT_CONFIGS = [
  {
    key: 'skillMatch',
    label: 'Skill Match',
    icon: '🎯',
    description: 'Priority given to exact skill category match',
    color: '#6366F1',
  },
  {
    key: 'distance',
    label: 'Distance',
    icon: '📍',
    description: 'Closer workers ranked higher',
    color: '#3c20a1ff',
  },
  {
    key: 'rating',
    label: 'Customer Rating',
    icon: '⭐',
    description: 'Historical performance score weight',
    color: '#3c20a1ff',
  },
  {
    key: 'fairnessPenalty',
    label: 'Fairness Penalty',
    icon: '⚖️',
    description: 'Anti-monopoly: penalizes overloaded workers',
    color: '#EC4899',
  },
];

export default function RankingSliders({ rankedWorkers = [] }: { rankedWorkers?: any[] }) {
  const { rankingWeights, updateRankingWeight, resetRankingWeights } = useAppStore();

  const totalWeight = (Object.values(rankingWeights) as number[]).reduce((a: number, b: number) => a + b, 0);
  const isBalanced = Math.abs(totalWeight - 1.0) < 0.001;

  return (
    <View style={styles.container}>
      {/* Balance Indicator */}
      <View style={[styles.balanceBar, { borderColor: isBalanced ? '#3c20a1ff' : '#3c20a1ff' }]}>
        <Text style={[styles.balanceText, { color: isBalanced ? '#065F46' : '#92400E' }]}>
          {isBalanced ? '✓ Weights balanced (Σ = 1.0)' : `⚠ Weights sum to ${totalWeight.toFixed(2)} — adjust to 1.0`}
        </Text>
      </View>

      {/* Sliders */}
      {WEIGHT_CONFIGS.map((cfg) => {
        const value = rankingWeights[cfg.key];
        return (
          <View key={cfg.key} style={styles.sliderCard}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderEmoji}>{cfg.icon}</Text>
              <View style={styles.sliderInfo}>
                <Text style={styles.sliderLabel}>{cfg.label}</Text>
                <Text style={styles.sliderDesc}>{cfg.description}</Text>
              </View>
              <View style={[styles.valuePill, { backgroundColor: cfg.color + '18' }]}>
                <Text style={[styles.valueText, { color: cfg.color }]}>
                  {(value * 100).toFixed(0)}%
                </Text>
              </View>
            </View>

            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={0.05}
              value={value}
              onValueChange={(val) => updateRankingWeight(cfg.key, Math.round(val * 100) / 100)}
              minimumTrackTintColor={cfg.color}
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor={cfg.color}
            />
          </View>
        );
      })}

      {/* Live Preview of Top 3 */}
      {rankedWorkers.length > 0 && (
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Live Top 3 Workers (Instant Recalculation)</Text>
          {rankedWorkers.slice(0, 3).map((w, i) => (
            <View key={w.id} style={styles.previewRow}>
              <Text style={styles.previewRank}>#{i + 1}</Text>
              <Text style={styles.previewName}>{w.name}</Text>
              <Text style={styles.previewScore}>
                {w.matchScore ? `${(w.matchScore * 100).toFixed(0)} pts` : '—'}
              </Text>
              <Text style={styles.previewJobs}>{w.todayJobs} jobs today</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity onPress={resetRankingWeights} style={styles.resetBtn}>
        <Text style={styles.resetLink}>Reset weights to default formula</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  balanceBar: {
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  balanceText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
  },
  sliderCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: Spacing.sm,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sliderEmoji: { fontSize: 22 },
  sliderInfo: { flex: 1 },
  sliderLabel: {
    color: '#111827',
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
  },
  sliderDesc: {
    color: '#6B7280',
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  valuePill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    minWidth: 48,
    alignItems: 'center',
  },
  valueText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
  },
  slider: { width: '100%', height: 32 },
  preview: {
    backgroundColor: '#EEF2FF',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  previewTitle: {
    color: '#4338CA',
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    marginBottom: 4,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  previewRank: {
    color: '#6B7280',
    fontSize: Typography.fontSize.sm,
    width: 26,
    fontWeight: '800',
  },
  previewName: {
    color: '#111827',
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    flex: 1,
  },
  previewScore: {
    color: '#4F46E5',
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    width: 54,
    textAlign: 'right',
  },
  previewJobs: {
    color: '#6B7280',
    fontSize: Typography.fontSize.xs,
    width: 80,
    textAlign: 'right',
  },
  resetBtn: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  resetLink: {
    color: '#6B7280',
    fontSize: Typography.fontSize.xs,
    textDecorationLine: 'underline',
  },
});
