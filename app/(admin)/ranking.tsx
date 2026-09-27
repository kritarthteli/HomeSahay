import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/appStore';
import { fetchNearbyWorkers } from '../../services/mockApi';
import RankingSliders from '../../components/RankingSliders';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';
import { BENGALURU_CENTER } from '../../data/seedData';
import { Ionicons } from '@expo/vector-icons';

export default function RankingTuner() {
  const { rankingWeights, workers } = useAppStore();
  const [rankedWorkers, setRankedWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchNearbyWorkers('plumber', BENGALURU_CENTER, 15, rankingWeights, workers).then((ranked) => {
      if (!cancelled) {
        setRankedWorkers(ranked);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [rankingWeights, workers]);

  return (
    <View style={styles.mainContainer}>
      {/* Dark Header Surface */}
      <View style={styles.headerBackground}>
        <SafeAreaView edges={['top']} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Ranking Engine Tuner</Text>
          <Text style={styles.subtitle}>
            Calibrate algorithmic fairness and dispatch weights
          </Text>
        </View>
      </View>

      {/* Clean Ivory Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* How it works note */}
          <View style={styles.explainer}>
            <Ionicons name="bulb-outline" size={18} color={Colors.warningDark} />
            <Text style={styles.explainerText}>
              <Text style={{ fontWeight: Typography.fontWeight.black }}>SCORING FORMULA: </Text>
              Score = Skill×w₁ + Distance×w₂ + Rating×w₃ + Fairness×w₄. High fairness weights prevent monopoly and distribute opportunities equitably.
            </Text>
          </View>

          {/* Sliders */}
          <View style={styles.section}>
            <RankingSliders rankedWorkers={loading ? [] : rankedWorkers} />
          </View>

          {/* Full Ranked List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              SIMULATED PRIORITY QUEUE (PLUMBER)
            </Text>
            {loading ? (
              <ActivityIndicator color={Colors.accentPrimary} style={{ marginVertical: Spacing.xl }} />
            ) : (
              rankedWorkers.map((w, i) => (
                <View key={w.id} style={styles.rankRow}>
                  <View style={[styles.rankBadge, { backgroundColor: i === 0 ? Colors.darkSurfaceDeep : Colors.canvasCream }]}>
                    <Text style={[styles.rankNum, { color: i === 0 ? Colors.accentPrimary : Colors.textSecondary }]}>
                      #{i + 1}
                    </Text>
                  </View>
                  <View style={styles.rankInfo}>
                    <Text style={styles.rankName}>{w.name}</Text>
                    <Text style={styles.rankMeta}>
                      {w.distanceKm} km · {w.rating} ★ · {w.todayJobs} jobs today
                    </Text>
                  </View>
                  <View style={styles.scorePill}>
                    <Text style={styles.scoreText}>
                      {w.matchScore ? `${(w.matchScore * 100).toFixed(0)} PTS` : '—'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.darkSurfaceDeep,
  },
  headerBackground: {
    backgroundColor: Colors.darkSurfaceDeep,
    paddingBottom: Spacing['3xl'],
  },
  headerContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.xl,
  },
  title: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: -1,
  },
  subtitle: {
    color: Colors.textInverseMuted,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.mono,
    marginTop: Spacing.xs,
  },

  // Bottom Sheet
  bottomSheet: {
    flex: 1,
    backgroundColor: Colors.canvasLight,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    overflow: 'hidden',
    marginTop: -Spacing.xl,
  },
  scrollContent: {
    padding: Spacing['2xl'],
    paddingBottom: Spacing['4xl'],
  },
  explainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.warningContainer,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warningDark,
    marginBottom: Spacing['2xl'],
  },
  explainerText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.warningDark,
    flex: 1,
    lineHeight: 18,
  },
  section: {
    marginBottom: Spacing['2xl'],
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
    marginBottom: Spacing.lg,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
    ...Shadow.soft,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNum: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.black,
  },
  rankInfo: { flex: 1 },
  rankName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.bold,
  },
  rankMeta: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    marginTop: 4,
  },
  scorePill: {
    backgroundColor: Colors.canvasCream,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  scoreText: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
  },
});
