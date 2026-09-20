import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Image,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadow, Typography } from '../constants/theme';

const ACCEPT_TIMEOUT = 30; // seconds

export default function JobModal({ job, worker, onAccept, onReject, visible }) {
  const [timeLeft, setTimeLeft] = useState(ACCEPT_TIMEOUT);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    if (visible && job) {
      setTimeLeft(ACCEPT_TIMEOUT);
      Vibration.vibrate([0, 400, 200, 400]);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 9 }).start();

      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            onReject?.('timeout');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      Animated.timing(slideAnim, { toValue: 300, duration: 250, useNativeDriver: true }).start();
    }
    return () => clearInterval(timerRef.current);
  }, [visible, job]);

  const timerPercent = (timeLeft / ACCEPT_TIMEOUT) * 100;
  const timerColor = timeLeft > 15 ? Colors.success : timeLeft > 8 ? Colors.warning : Colors.error;

  const urgencyColor = job?.urgency === 'emergency' ? Colors.sos : job?.urgency === 'high' ? Colors.warning : Colors.primary;

  if (!job) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.modal, { transform: [{ translateY: slideAnim }] }]}>
          {/* Urgency badge */}
          <View style={[styles.urgencyBanner, { backgroundColor: urgencyColor }]}>
            <Ionicons name={job.urgency === 'emergency' ? 'alert-circle' : 'briefcase'} size={14} color="#fff" />
            <Text style={styles.urgencyText}>
              {job.urgency === 'emergency' ? '🚨 EMERGENCY JOB REQUEST' : 'NEW JOB REQUEST'}
            </Text>
          </View>

          <View style={styles.content}>
            {/* Timer ring */}
            <View style={styles.timerWrapper}>
              <View style={[styles.timerRing, { borderColor: timerColor }]}>
                <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}</Text>
                <Text style={styles.timerSub}>sec</Text>
              </View>
            </View>

            {/* Job details */}
            <View style={styles.details}>
              <View style={styles.detailRow}>
                <Ionicons name="person-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.detailLabel}>Customer</Text>
                <Text style={styles.detailValue}>{job.customerName ?? 'Deepa S.'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="briefcase-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.detailLabel}>Service</Text>
                <Text style={styles.detailValue}>{job.category}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{job.address ?? 'JP Nagar 3rd Phase'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="cash-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.detailLabel}>Earnings</Text>
                <Text style={[styles.detailValue, { color: Colors.success }]}>₹{job.amount ?? 450}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="navigate-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.detailLabel}>Distance</Text>
                <Text style={styles.detailValue}>{job.distance ?? '0.4'} km away</Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: `${timerPercent}%`,
                    backgroundColor: timerColor,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>Auto-rejects in {timeLeft}s</Text>

            {/* Action buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => onReject?.('manual')}
                activeOpacity={0.85}
              >
                <Ionicons name="close" size={20} color={Colors.error} />
                <Text style={styles.rejectText}>Decline</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => onAccept?.(job)}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.acceptText}>Accept Job</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.bg1,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    overflow: 'hidden',
    borderTopWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadow.lg,
  },
  urgencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  urgencyText: {
    color: '#fff',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.base,
  },
  timerWrapper: {
    alignItems: 'center',
  },
  timerRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg2,
  },
  timerText: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.extrabold,
    lineHeight: 30,
  },
  timerSub: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
  },
  details: {
    backgroundColor: Colors.bg2,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailLabel: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.sm,
    width: 70,
  },
  detailValue: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.bg3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabel: {
    color: Colors.textMuted,
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    marginTop: -Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.error + '15',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1.5,
    borderColor: Colors.error + '40',
  },
  rejectText: {
    color: Colors.error,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.success,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    ...Shadow.md,
    shadowColor: Colors.success,
  },
  acceptText: {
    color: '#fff',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
});
