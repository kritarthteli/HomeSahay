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
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { BENGALURU_CENTER } from '../../data/seedData';
import { Ionicons } from '@expo/vector-icons';

export default function RankingTuner() {
  const { rankingWeights, workers } = useAppStore();
  const [rankedWorkers, setRankedWorkers] = useState([]);
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

      {/* Clean White Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* How it works note */}
          <View style={styles.explainer}>
            <Ionicons name="bulb-outline" size={18} color="#D97706" />
            <Text style={styles.explainerText}>
              <Text style={{ fontWeight: '700', color: '#92400E' }}>Scoring Formula: </Text>
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
              Simulated Priority Queue (Category: "Plumber")
            </Text>
            {loading ? (
              <ActivityIndicator color="#3c20a1ff" />
            ) : (
              rankedWorkers.map((w, i) => (
                <View key={w.id} style={styles.rankRow}>
                  <View style={[styles.rankBadge, { backgroundColor: i === 0 ? '#3c20a1ff' : '#F3F4F6' }]}>
                    <Text style={[styles.rankNum, { color: i === 0 ? '#fff' : '#6B7280' }]}>
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
                      {w.matchScore ? `${(w.matchScore * 100).toFixed(0)} pts` : '—'}
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
    backgroundColor: '#121212',
  },
  headerBackground: {
    backgroundColor: '#121212',
    paddingBottom: Spacing.xl,
  },
  headerContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
  },
  title: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },

  // Bottom Sheet
  bottomSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  explainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: Spacing.xl,
  },
  explainerText: {
    fontSize: Typography.fontSize.xs,
    color: '#92400E',
    flex: 1,
    lineHeight: 18,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: Spacing.md,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNum: {
    fontSize: 12,
    fontWeight: '800',
  },
  rankInfo: { flex: 1 },
  rankName: {
    color: '#111827',
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },
  rankMeta: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 2,
  },
  scorePill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  scoreText: {
    color: '#4F46E5',
    fontSize: 11,
    fontWeight: '700',
  },
});
