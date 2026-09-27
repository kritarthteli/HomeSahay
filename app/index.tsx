import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/appStore';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';

const ROLES = [
  {
    id: 'customer',
    label: 'Customer',
    tagline: 'Book verified local gig workers on demand',
    icon: 'person-outline' as const,
    accent: '#3c20a1ff',
    accentBg: 'rgba(60, 32, 161, 0.12)',
    accentBorder: 'rgba(60, 32, 161, 0.3)',
    route: '/(customer)',
    features: ['AI Request Parsing', 'Real-time Live Tracking', 'SOS Dispatch'],
  },
  {
    id: 'worker',
    label: 'Worker Partner',
    tagline: 'Get fair dispatch jobs and transparent earnings',
    icon: 'briefcase-outline' as const,
    accent: '#3c20a1ff',
    accentBg: 'rgba(60, 32, 161, 0.12)',
    accentBorder: 'rgba(60, 32, 161, 0.3)',
    route: '/(worker)',
    features: ['Instant Job Alerts', 'Daily Earnings Tracker', 'Shift & Status Controls'],
  },
  {
    id: 'admin',
    label: 'Cooperative Admin',
    tagline: 'Oversee ecosystem health, KYC verification & governance',
    icon: 'shield-checkmark-outline' as const,
    accent: '#3c20a1ff',
    accentBg: 'rgba(60, 32, 161, 0.12)',
    accentBorder: 'rgba(60, 32, 161, 0.3)',
    route: '/(admin)',
    features: ['Real-time Analytics', 'Worker KYC Verification', 'Fair Ranking Engine'],
  },
];

export default function SplashScreen() {
  const { setRole } = useAppStore();
  const router = useRouter();
  const envRole = process.env.EXPO_PUBLIC_APP_ROLE;

  // Auto-redirect if an environment role is explicitly set
  if (envRole === 'customer') return <Redirect href="/(customer)" />;
  if (envRole === 'worker') return <Redirect href="/(worker)" />;
  if (envRole === 'admin') return <Redirect href="/(admin)" />;

  const handleSelect = (r: typeof ROLES[0]) => {
    setRole(r.id);
    router.push(r.route as any);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRing}>
              <LinearGradient
                colors={['#6366F1', '#4F46E5']}
                style={styles.logoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="home" size={26} color="#FFFFFF" />
              </LinearGradient>
            </View>

            <Text style={styles.appName}>HomeSahay</Text>
            <Text style={styles.appTagline}>
              Fair, Community-Powered Cooperative Gig Platform
            </Text>
          </View>

          {/* Role selection section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select Portal</Text>
            <Text style={styles.sectionDesc}>Choose your interface to continue</Text>
          </View>

          <View style={styles.cards}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={styles.card}
                onPress={() => handleSelect(r)}
                activeOpacity={0.85}
              >
                {/* Subtle top border glow highlight */}
                <LinearGradient
                  colors={[r.accent + '55', 'transparent']}
                  style={styles.cardHighlight}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />

                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconWrapper,
                      {
                        backgroundColor: r.accentBg,
                        borderColor: r.accentBorder,
                      },
                    ]}
                  >
                    <Ionicons name={r.icon} size={22} color={r.accent} />
                  </View>

                  <View style={styles.cardTitles}>
                    <Text style={styles.cardLabel}>{r.label}</Text>
                    <Text style={styles.cardTagline}>{r.tagline}</Text>
                  </View>

                  <View
                    style={[
                      styles.arrowButton,
                      { backgroundColor: r.accentBg, borderColor: r.accentBorder },
                    ]}
                  >
                    <Ionicons name="arrow-forward" size={16} color={r.accent} />
                  </View>
                </View>

                {/* Features pill list */}
                <View style={styles.features}>
                  {r.features.map((f) => (
                    <View key={f} style={styles.featureChip}>
                      <View style={[styles.featureDot, { backgroundColor: r.accent }]} />
                      <Text style={styles.featureText}>{f}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Minimal aesthetic footer */}
          <View style={styles.footerContainer}>
            <View style={styles.footerDivider} />
            <Text style={styles.footer}>
              HomeSahay • Cooperative Gig Platform • Transparent & Fair
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoRing: {
    width: 68,
    height: 68,
    borderRadius: 24,
    padding: 2,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.25)',
      },
    }),
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  appTagline: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  sectionHeader: {
    marginBottom: Spacing.base,
    paddingHorizontal: Spacing.xs,
  },
  sectionTitle: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  sectionDesc: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 2,
  },
  cards: {
    gap: Spacing.md,
  },
  card: {
    position: 'relative',
    backgroundColor: 'rgba(17, 24, 39, 0.75)',
    borderRadius: 18,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.2s ease',
      },
    }),
  },
  cardHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitles: {
    flex: 1,
  },
  cardLabel: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  cardTagline: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  featureDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  featureText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '500',
  },
  footerContainer: {
    marginTop: Spacing['2xl'],
    alignItems: 'center',
  },
  footerDivider: {
    width: 60,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: Spacing.md,
  },
  footer: {
    color: '#475569',
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
