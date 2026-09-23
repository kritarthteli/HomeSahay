import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadow, Typography } from '../constants/theme';

export default function WorkerCard({ worker, onSelect, selected = false, showScore = true }: { worker: any, onSelect?: any, selected?: boolean, showScore?: boolean }) {
  const scoreColor =
    worker.score >= 80
      ? Colors.success
      : worker.score >= 60
      ? Colors.warning
      : Colors.textSecondary;

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={() => onSelect?.(worker)}
      activeOpacity={0.85}
    >
      {/* Avatar + Status */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: worker.avatar }} style={styles.avatar} />
        <View style={[styles.statusDot, { backgroundColor: worker.isOnline ? Colors.success : Colors.bg4 }]} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{worker.name}</Text>
          {worker.isVerified && (
            <Ionicons name="shield-checkmark" size={14} color={Colors.success} style={{ marginLeft: 4 }} />
          )}
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="briefcase-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.metaText}>
            {worker.category.charAt(0).toUpperCase() + worker.category.slice(1)}
          </Text>
          <View style={styles.dot} />
          <Ionicons name="star" size={12} color={Colors.warning} />
          <Text style={styles.metaText}>{worker.rating}</Text>
          <View style={styles.dot} />
          <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.metaText}>{(worker.computedDistanceKm ?? worker.distanceKm).toFixed(1)} km</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={12} color={Colors.primary} />
          <Text style={[styles.metaText, { color: Colors.primary }]}>
            ETA ~{worker.estimatedEta ?? worker.etaMinutes} min
          </Text>
          <View style={styles.dot} />
          <Text style={styles.price}>₹{worker.pricePerHour}/hr</Text>
        </View>

        {/* Today's job load (fairness indicator) */}
        <View style={styles.fairnessRow}>
          <Text style={styles.fairnessLabel}>Today's load:</Text>
          <View style={styles.jobDots}>
            {Array.from({ length: Math.min(worker.todayJobs, 8) }).map((_, i) => (
              <View key={i} style={styles.jobDot} />
            ))}
            {Array.from({ length: Math.max(0, 8 - worker.todayJobs) }).map((_, i) => (
              <View key={`e${i}`} style={[styles.jobDot, styles.jobDotEmpty]} />
            ))}
          </View>
          <Text style={styles.jobCount}>{worker.todayJobs} jobs</Text>
        </View>
      </View>

      {/* Score badge */}
      {showScore && worker.score !== undefined && (
        <View style={[styles.scoreBadge, { borderColor: scoreColor }]}>
          <Text style={[styles.scoreText, { color: scoreColor }]}>{worker.score}</Text>
          <Text style={styles.scoreLabel}>score</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg2,
    borderRadius: Radius.xl, // rounded cards
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.bg1,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.bg2,
  },
  info: { flex: 1, gap: 4 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.extrabold,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  metaText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.mono,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  price: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.mono,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.bg3,
  },
  fairnessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  fairnessLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    textTransform: 'uppercase',
  },
  jobDots: {
    flexDirection: 'row',
    gap: 3,
  },
  jobDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textPrimary,
  },
  jobDotEmpty: {
    backgroundColor: Colors.bg3,
  },
  jobCount: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
  },
  scoreBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg0,
  },
  scoreText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.black,
    lineHeight: 18,
  },
  scoreLabel: {
    color: Colors.textMuted,
    fontSize: 8,
    fontFamily: Typography.fontFamily.mono,
    textTransform: 'uppercase',
  },
});
