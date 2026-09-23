import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { useAppStore } from '../store/appStore';

const WEIGHT_CONFIGS = [
  {
    key: 'skillMatch',
    label: 'SKILL MATCH',
    icon: '🎯',
    description: 'Priority given to exact skill category match',
    color: Colors.accentPrimaryDark,
  },
  {
    key: 'distance',
    label: 'DISTANCE',
    icon: '📍',
    description: 'Closer workers ranked higher',
    color: Colors.textPrimary,
  },
  {
    key: 'rating',
    label: 'CUSTOMER RATING',
    icon: '⭐',
    description: 'Historical performance score weight',
    color: Colors.textSecondary,
  },
  {
    key: 'fairnessPenalty',
    label: 'FAIRNESS PENALTY',
    icon: '⚖️',
    description: 'Anti-monopoly: penalizes overloaded workers',
    color: Colors.warningDark,
  },
];

export default function RankingSliders({ rankedWorkers = [] }: { rankedWorkers?: any[] }) {
  const { rankingWeights, updateRankingWeight, resetRankingWeights } = useAppStore();

  const totalWeight = (Object.values(rankingWeights) as number[]).reduce((a: number, b: number) => a + b, 0);
  const isBalanced = Math.abs(totalWeight - 1.0) < 0.001;

  return (
    <View style={styles.container}>
      {/* Balance Indicator */}
      <View style={[styles.balanceBar, { borderColor: isBalanced ? Colors.textPrimary : Colors.danger }]}>
        <Text style={[styles.balanceText, { color: isBalanced ? Colors.textPrimary : Colors.danger }]}>
          {isBalanced ? '✓ WEIGHTS BALANCED (Σ = 1.0)' : `⚠ WEIGHTS SUM TO ${totalWeight.toFixed(2)} — ADJUST TO 1.0`}
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
              maximumTrackTintColor={Colors.borderLight}
              thumbTintColor={cfg.color}
            />
          </View>
        );
      })}

      {/* Live Preview of Top 3 */}
      {rankedWorkers.length > 0 && (
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>LIVE TOP 3 PARTNERS (INSTANT RECALCULATION)</Text>
          {rankedWorkers.slice(0, 3).map((w, i) => (
            <View key={w.id} style={styles.previewRow}>
              <Text style={styles.previewRank}>#{i + 1}</Text>
              <Text style={styles.previewName}>{w.name}</Text>
              <Text style={styles.previewScore}>
                {w.matchScore ? `${(w.matchScore * 100).toFixed(0)} PTS` : '—'}
              </Text>
              <Text style={styles.previewJobs}>{w.todayJobs} JOBS TODAY</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity onPress={resetRankingWeights} style={styles.resetBtn} activeOpacity={0.7}>
        <Text style={styles.resetLink}>RESET WEIGHTS TO DEFAULT FORMULA</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  balanceBar: {
    padding: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    backgroundColor: Colors.canvasCream,
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
  },
  sliderCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  sliderEmoji: { fontSize: 24 },
  sliderInfo: { flex: 1 },
  sliderLabel: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
  },
  sliderDesc: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    marginTop: 4,
  },
  valuePill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    minWidth: 48,
    alignItems: 'center',
  },
  valueText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
  },
  slider: { width: '100%', height: 32 },
  preview: {
    backgroundColor: Colors.canvasCream,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  previewTitle: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  previewRank: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    width: 26,
  },
  previewName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.bold,
    flex: 1,
  },
  previewScore: {
    color: Colors.accentPrimaryDark,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    width: 60,
    textAlign: 'right',
  },
  previewJobs: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    width: 90,
    textAlign: 'right',
  },
  resetBtn: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  resetLink: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },
});
