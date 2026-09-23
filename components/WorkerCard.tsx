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
      <View style={styles.headerRow}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: worker.avatar }} style={styles.avatar} />
          {worker.isOnline && <View style={styles.onlineBadge} />}
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{worker.name}</Text>
            {worker.isVerified && (
              <Ionicons name="shield-checkmark" size={16} color={Colors.accentPrimary} style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={styles.category}>
            {worker.category.charAt(0).toUpperCase() + worker.category.slice(1)} • {worker.rating} ⭐
          </Text>
        </View>
        
        {showScore && worker.score !== undefined && (
          <View style={[styles.scoreBadge, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreText, { color: scoreColor }]}>{worker.score}</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.statValue}>~{worker.estimatedEta ?? worker.etaMinutes}m</Text>
          <Text style={styles.statLabel}>ETA</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Ionicons name="location-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.statValue}>{(worker.computedDistanceKm ?? worker.distanceKm).toFixed(1)}km</Text>
          <Text style={styles.statLabel}>AWAY</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: Colors.textPrimary }]}>₹{worker.pricePerHour}</Text>
          <Text style={styles.statLabel}>PER HOUR</Text>
        </View>
      </View>

      {/* Fairness Indicator */}
      <View style={styles.fairnessRow}>
        <Text style={styles.fairnessLabel}>TODAY'S WORKLOAD</Text>
        <View style={styles.jobDots}>
          {Array.from({ length: Math.min(worker.todayJobs, 8) }).map((_, i) => (
            <View key={i} style={styles.jobDotActive} />
          ))}
          {Array.from({ length: Math.max(0, 8 - worker.todayJobs) }).map((_, i) => (
            <View key={`e${i}`} style={styles.jobDotEmpty} />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  cardSelected: {
    borderColor: Colors.accentPrimary,
    backgroundColor: Colors.surfaceInteractive,
    ...Shadow.glow,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.canvasCream,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.surfaceLight,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.display,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: -0.5,
  },
  category: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.mono,
  },
  scoreBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
  },
  scoreText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.black,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.borderLight,
  },
  statValue: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  fairnessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.canvasCream,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
  },
  fairnessLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  jobDots: {
    flexDirection: 'row',
    gap: 4,
  },
  jobDotActive: {
    width: 6,
    height: 12,
    borderRadius: 3,
    backgroundColor: Colors.textSecondary,
  },
  jobDotEmpty: {
    width: 6,
    height: 12,
    borderRadius: 3,
    backgroundColor: Colors.borderLight,
  },
});
