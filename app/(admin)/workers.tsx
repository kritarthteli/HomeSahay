import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/appStore';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  plumber:     { color: Colors.accentPrimaryDark, bg: Colors.canvasCream },
  electrician: { color: Colors.warningDark, bg: Colors.warningContainer },
  cleaner:     { color: Colors.success, bg: Colors.surfaceInteractive },
  cook:        { color: Colors.danger, bg: Colors.dangerContainer },
  carpenter:   { color: Colors.accentPrimary, bg: Colors.darkSurfaceDeep },
};

const DOC_LABELS: Record<string, string> = {
  aadhar: 'Aadhaar Card',
  skill_cert: 'Skill Certificate',
  address_proof: 'Address Proof',
  photo: 'Photograph',
};

// Mock documents for approved workers
const MOCK_WORKER_DOCS: Record<string, Record<string, { uploaded: boolean; verified: boolean }>> = {
  w001: {
    aadhar:       { uploaded: true, verified: true },
    skill_cert:   { uploaded: true, verified: true },
    address_proof:{ uploaded: true, verified: true },
    photo:        { uploaded: true, verified: true },
  },
  w002: {
    aadhar:       { uploaded: true, verified: true },
    skill_cert:   { uploaded: true, verified: true },
    address_proof:{ uploaded: true, verified: true },
    photo:        { uploaded: true, verified: true },
  },
  w003: {
    aadhar:       { uploaded: true, verified: true },
    skill_cert:   { uploaded: true, verified: false },
    address_proof:{ uploaded: true, verified: true },
    photo:        { uploaded: true, verified: true },
  },
  w004: {
    aadhar:       { uploaded: true, verified: true },
    skill_cert:   { uploaded: true, verified: true },
    address_proof:{ uploaded: false, verified: false },
    photo:        { uploaded: true, verified: true },
  },
  w005: {
    aadhar:       { uploaded: true, verified: false },
    skill_cert:   { uploaded: true, verified: false },
    address_proof:{ uploaded: true, verified: false },
    photo:        { uploaded: true, verified: false },
  },
};

export default function WorkersList() {
  const { workers } = useAppStore();
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'pending'>('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['all', ...Array.from(new Set(workers.map((w: any) => w.category)))];

  const filtered = workers.filter((w: any) => {
    const matchSearch =
      search === '' ||
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.category.toLowerCase().includes(search.toLowerCase()) ||
      w.cooperative.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'online' && w.isOnline) ||
      (filterStatus === 'offline' && !w.isOnline && w.kyc_status === 'approved') ||
      (filterStatus === 'pending' && w.kyc_status === 'pending');

    const matchCat = filterCategory === 'all' || w.category === filterCategory;

    return matchSearch && matchStatus && matchCat;
  });

  const statusCounts = {
    all: workers.length,
    online: workers.filter((w: any) => w.isOnline).length,
    offline: workers.filter((w: any) => !w.isOnline && w.kyc_status === 'approved').length,
    pending: workers.filter((w: any) => w.kyc_status === 'pending').length,
  };

  return (
    <View style={styles.page}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Workers Registry</Text>
            <Text style={styles.pageSubtitle}>
              {workers.length} registered workers across {new Set(workers.map((w: any) => w.cooperative)).size} cooperatives
            </Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.statPill}>
              <View style={[styles.statDot, { backgroundColor: Colors.accentPrimary }]} />
              <Text style={styles.statPillText}>{statusCounts.online} ONLINE</Text>
            </View>
            <View style={styles.statPill}>
              <View style={[styles.statDot, { backgroundColor: Colors.warningDark }]} />
              <Text style={styles.statPillText}>{statusCounts.pending} PENDING KYC</Text>
            </View>
          </View>
        </View>

        {/* Search + Filters */}
        <View style={styles.filterBar}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search workers by name, skill, or cooperative…"
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Status filters */}
          <View style={styles.statusFilters}>
            {(['all', 'online', 'offline', 'pending'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.filterChip, filterStatus === s && styles.filterChipActive]}
                onPress={() => setFilterStatus(s)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterChipText, filterStatus === s && styles.filterChipTextActive]}>
                  {s.toUpperCase()} ({statusCounts[s]})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          <View style={styles.catFilters}>
            {categories.map((cat) => {
              const style = cat !== 'all' ? CATEGORY_COLORS[cat] : null;
              const active = filterCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catChip,
                    active && style ? { backgroundColor: style.bg, borderColor: style.color } : active && { backgroundColor: Colors.textPrimary, borderColor: Colors.textPrimary },
                  ]}
                  onPress={() => setFilterCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.catChipText,
                    active && style ? { color: style.color } : active && { color: Colors.canvasLight },
                  ]}>
                    {cat.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Workers Table */}
        <View style={styles.tableCard}>
          {/* Table Header */}
          <View style={styles.tableHead}>
            <Text style={[styles.thCell, { flex: 2 }]}>WORKER</Text>
            <Text style={styles.thCell}>CATEGORY</Text>
            <Text style={styles.thCell}>COOPERATIVE</Text>
            <Text style={styles.thCell}>STATUS</Text>
            <Text style={styles.thCell}>RATING</Text>
            <Text style={styles.thCell}>JOBS TODAY</Text>
            <Text style={styles.thCell}>KYC</Text>
            <Text style={[styles.thCell, { textAlign: 'center' }]}>DETAILS</Text>
          </View>

          {filtered.length === 0 && (
            <View style={styles.emptyRow}>
              <Ionicons name="search-outline" size={32} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No workers match your filters</Text>
            </View>
          )}

          {filtered.map((w: any, i: number) => {
            const catStyle = CATEGORY_COLORS[w.category] || { color: Colors.textSecondary, bg: Colors.borderLight };
            return (
              <TouchableOpacity
                key={w.id}
                style={[styles.tableRow, i % 2 === 0 && styles.tableRowEven]}
                onPress={() => setSelectedWorker(w)}
                activeOpacity={0.7}
              >
                {/* Worker */}
                <View style={[styles.tdCell, { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
                  <Image source={{ uri: w.avatar }} style={styles.avatar} />
                  <View>
                    <Text style={styles.workerName}>{w.name}</Text>
                    <Text style={styles.workerExp}>{w.yearsExperience} yrs exp</Text>
                  </View>
                </View>

                {/* Category */}
                <View style={styles.tdCell}>
                  <View style={[styles.catTag, { backgroundColor: catStyle.bg }]}>
                    <Text style={[styles.catTagText, { color: catStyle.color }]}>
                      {w.category.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Cooperative */}
                <View style={styles.tdCell}>
                  <Text style={styles.coopText} numberOfLines={2}>{w.cooperative}</Text>
                </View>

                {/* Status */}
                <View style={styles.tdCell}>
                  <View style={[styles.statusDot, { backgroundColor: w.isOnline ? Colors.accentPrimaryDim : Colors.surfaceInteractive }]}>
                    <View style={[styles.dotInner, { backgroundColor: w.isOnline ? Colors.accentPrimaryDark : Colors.textMuted }]} />
                    <Text style={[styles.statusText, { color: w.isOnline ? Colors.accentPrimaryDark : Colors.textSecondary }]}>
                      {w.isOnline ? 'Online' : 'Offline'}
                    </Text>
                  </View>
                </View>

                {/* Rating */}
                <View style={styles.tdCell}>
                  <Text style={styles.ratingText}>⭐ {w.rating}</Text>
                </View>

                {/* Jobs Today */}
                <View style={styles.tdCell}>
                  <Text style={styles.jobsText}>{w.todayJobs} jobs</Text>
                  <Text style={styles.earningsText}>₹{w.todayEarnings}</Text>
                </View>

                {/* KYC */}
                <View style={styles.tdCell}>
                  <View style={[
                    styles.kycBadge,
                    {
                      backgroundColor: w.kyc_status === 'approved' ? Colors.canvasCream : Colors.warningContainer,
                    },
                  ]}>
                    <Ionicons
                      name={w.kyc_status === 'approved' ? 'checkmark-circle' : 'time-outline'}
                      size={14}
                      color={w.kyc_status === 'approved' ? Colors.textPrimary : Colors.warningDark}
                    />
                    <Text style={[styles.kycText, { color: w.kyc_status === 'approved' ? Colors.textPrimary : Colors.warningDark }]}>
                      {w.kyc_status === 'approved' ? 'VERIFIED' : 'PENDING'}
                    </Text>
                  </View>
                </View>

                {/* View button */}
                <View style={[styles.tdCell, { alignItems: 'center' }]}>
                  <View style={styles.viewBtn}>
                    <Ionicons name="eye-outline" size={16} color={Colors.textPrimary} />
                    <Text style={styles.viewBtnText}>VIEW</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Worker Detail Modal */}
      {selectedWorker && (
        <Modal
          transparent
          animationType="fade"
          visible={!!selectedWorker}
          onRequestClose={() => setSelectedWorker(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Partner Profile</Text>
                <TouchableOpacity onPress={() => setSelectedWorker(null)} style={styles.closeBtn} activeOpacity={0.7}>
                  <Ionicons name="close" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Identity */}
                <View style={styles.modalSection}>
                  <View style={styles.identityRow}>
                    <Image source={{ uri: selectedWorker.avatar }} style={styles.modalAvatar} />
                    <View style={styles.identityInfo}>
                      <View style={styles.identityNameRow}>
                        <Text style={styles.modalName}>{selectedWorker.name}</Text>
                        {selectedWorker.isVerified && (
                          <View style={styles.verifiedBadge}>
                            <Ionicons name="shield-checkmark" size={14} color={Colors.textPrimary} />
                            <Text style={styles.verifiedText}>VERIFIED</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.modalCoop}>{selectedWorker.cooperative}</Text>
                      <View style={styles.identityMeta}>
                        <View style={[styles.catTag, { backgroundColor: CATEGORY_COLORS[selectedWorker.category]?.bg || Colors.borderLight }]}>
                          <Text style={[styles.catTagText, { color: CATEGORY_COLORS[selectedWorker.category]?.color || Colors.textSecondary }]}>
                            {selectedWorker.category.toUpperCase()}
                          </Text>
                        </View>
                        <View style={[styles.statusDot, { backgroundColor: selectedWorker.isOnline ? Colors.accentPrimaryDim : Colors.surfaceInteractive }]}>
                          <View style={[styles.dotInner, { backgroundColor: selectedWorker.isOnline ? Colors.accentPrimaryDark : Colors.textMuted }]} />
                          <Text style={[styles.statusText, { color: selectedWorker.isOnline ? Colors.accentPrimaryDark : Colors.textSecondary }]}>
                            {selectedWorker.isOnline ? 'Online' : 'Offline'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                  {[
                    { label: 'RATING', value: `⭐ ${selectedWorker.rating}`, icon: 'star' as const },
                    { label: 'TOTAL JOBS', value: selectedWorker.totalJobs, icon: 'briefcase-outline' as const },
                    { label: 'TODAY EARNINGS', value: `₹${selectedWorker.todayEarnings}`, icon: 'cash-outline' as const },
                    { label: 'EXPERIENCE', value: `${selectedWorker.yearsExperience} yrs`, icon: 'time-outline' as const },
                    { label: 'RATE/HOUR', value: `₹${selectedWorker.pricePerHour}`, icon: 'pricetag-outline' as const },
                    { label: 'JOBS TODAY', value: selectedWorker.todayJobs, icon: 'today-outline' as const },
                  ].map((stat) => (
                    <View key={stat.label} style={styles.statCard}>
                      <Ionicons name={stat.icon} size={18} color={Colors.textPrimary} />
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                  ))}
                </View>

                {/* Skills */}
                <View style={styles.modalSection}>
                  <Text style={styles.sectionLabel}>SKILLS</Text>
                  <View style={styles.skillsRow}>
                    {selectedWorker.skills.map((s: string) => (
                      <View key={s} style={styles.skillChip}>
                        <Text style={styles.skillChipText}>{s.replace(/_/g, ' ')}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Languages */}
                <View style={styles.modalSection}>
                  <Text style={styles.sectionLabel}>LANGUAGES</Text>
                  <View style={styles.skillsRow}>
                    {selectedWorker.languages.map((l: string) => (
                      <View key={l} style={[styles.skillChip, { backgroundColor: Colors.canvasCream }]}>
                        <Text style={[styles.skillChipText, { color: Colors.textPrimary }]}>{l}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Documents */}
                <View style={styles.modalSection}>
                  <Text style={styles.sectionLabel}>DOCUMENTS</Text>
                  <View style={styles.docsGrid}>
                    {Object.entries(MOCK_WORKER_DOCS[selectedWorker.id] || {}).map(([key, doc]) => (
                      <View key={key} style={styles.docCard}>
                        <View style={styles.docCardTop}>
                          <Ionicons
                            name={doc.verified ? 'checkmark-circle' : doc.uploaded ? 'time-outline' : 'close-circle'}
                            size={20}
                            color={doc.verified ? Colors.textPrimary : doc.uploaded ? Colors.warningDark : Colors.danger}
                          />
                          <Text style={styles.docName}>{DOC_LABELS[key]}</Text>
                        </View>
                        <View style={[
                          styles.docStatus,
                          {
                            backgroundColor: doc.verified ? Colors.canvasCream : doc.uploaded ? Colors.warningContainer : Colors.dangerContainer,
                          },
                        ]}>
                          <Text style={{
                            fontSize: 10,
                            fontFamily: Typography.fontFamily.mono,
                            fontWeight: Typography.fontWeight.bold,
                            color: doc.verified ? Colors.textPrimary : doc.uploaded ? Colors.warningDark : Colors.danger,
                          }}>
                            {doc.verified ? 'VERIFIED' : doc.uploaded ? 'PENDING' : 'NOT UPLOADED'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Location */}
                <View style={styles.modalSection}>
                  <Text style={styles.sectionLabel}>LOCATION INFO</Text>
                  <View style={styles.locationRow}>
                    <View style={styles.locItem}>
                      <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
                      <Text style={styles.locText}>{selectedWorker.distanceKm} km from hub</Text>
                    </View>
                    <View style={styles.locItem}>
                      <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                      <Text style={styles.locText}>{selectedWorker.etaMinutes} min ETA</Text>
                    </View>
                    <View style={styles.locItem}>
                      <Ionicons name="map-outline" size={16} color={Colors.textSecondary} />
                      <Text style={styles.locText}>{selectedWorker.location.latitude.toFixed(4)}°N, {selectedWorker.location.longitude.toFixed(4)}°E</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.canvasLight },
  scroll: { flex: 1 },
  pageContent: { padding: Spacing['4xl'], paddingBottom: Spacing['4xl'], gap: Spacing['2xl'] },

  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pageTitle: { fontSize: Typography.fontSize['3xl'], fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, letterSpacing: -1 },
  pageSubtitle: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  headerStats: { flexDirection: 'row', gap: Spacing.sm },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statDot: { width: 8, height: 8, borderRadius: Radius.full },
  statPillText: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary, letterSpacing: 1 },

  filterBar: { gap: Spacing.lg },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.mono,
    color: Colors.textPrimary,
    outlineStyle: 'none' as any,
  },
  statusFilters: { flexDirection: 'row', gap: Spacing.sm },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surfaceLight,
  },
  filterChipActive: { backgroundColor: Colors.textPrimary, borderColor: Colors.textPrimary },
  filterChipText: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textSecondary, letterSpacing: 1 },
  filterChipTextActive: { color: Colors.canvasLight },

  catScroll: { marginBottom: Spacing.sm },
  catFilters: { flexDirection: 'row', gap: Spacing.sm, paddingBottom: 4 },
  catChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surfaceLight,
  },
  catChipText: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textSecondary, letterSpacing: 1 },

  tableCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    ...Shadow.soft,
  },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.canvasCream,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  thCell: {
    flex: 1,
    fontSize: 10,
    fontFamily: Typography.fontFamily.mono,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tableRowEven: { backgroundColor: Colors.canvasLight },
  tdCell: { flex: 1, justifyContent: 'center' },

  avatar: { width: 44, height: 44, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderLight },
  workerName: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary },
  workerExp: { fontSize: 11, fontFamily: Typography.fontFamily.mono, color: Colors.textSecondary, marginTop: 4 },

  catTag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, alignSelf: 'flex-start' },
  catTagText: { fontSize: 9, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, letterSpacing: 1 },

  coopText: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.body, color: Colors.textPrimary, lineHeight: 18 },

  statusDot: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, alignSelf: 'flex-start' },
  dotInner: { width: 6, height: 6, borderRadius: Radius.full },
  statusText: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold },

  ratingText: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary },

  jobsText: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary },
  earningsText: { fontSize: 11, fontFamily: Typography.fontFamily.mono, color: Colors.accentPrimaryDark, fontWeight: Typography.fontWeight.bold, marginTop: 4 },

  kycBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, alignSelf: 'flex-start' },
  kycText: { fontSize: 9, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, letterSpacing: 1 },

  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.canvasCream,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  viewBtnText: { color: Colors.textPrimary, fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, letterSpacing: 1 },

  emptyRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: Spacing.md,
  },
  emptyText: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.mono, color: Colors.textMuted },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['2xl'],
  },
  modalCard: {
    backgroundColor: Colors.canvasLight,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    width: '100%' as any,
    maxWidth: 720,
    maxHeight: '90vh' as any,
    ...Shadow.soft,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, letterSpacing: -0.5 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },

  modalSection: { marginBottom: Spacing['2xl'] },
  sectionLabel: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: Spacing.sm },

  identityRow: { flexDirection: 'row', gap: Spacing.xl, alignItems: 'flex-start' },
  modalAvatar: { width: 80, height: 80, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderLight },
  identityInfo: { flex: 1, gap: 8 },
  identityNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  modalName: { fontSize: Typography.fontSize['2xl'], fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, letterSpacing: -1 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.canvasCream, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderLight },
  verifiedText: { fontSize: 9, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary, letterSpacing: 1 },
  modalCoop: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, fontFamily: Typography.fontFamily.body },
  identityMeta: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', marginTop: 4 },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statValue: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary },
  statLabel: { fontSize: 10, fontFamily: Typography.fontFamily.mono, color: Colors.textSecondary, textAlign: 'center', letterSpacing: 0.5 },

  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  skillChip: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  skillChipText: { fontSize: 11, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.semibold, color: Colors.textPrimary },

  docsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  docCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
  },
  docCardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  docName: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.body, fontWeight: Typography.fontWeight.semibold, color: Colors.textPrimary, flex: 1 },
  docStatus: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, alignSelf: 'flex-start' },

  locationRow: { flexDirection: 'row', gap: Spacing.xl, flexWrap: 'wrap' },
  locItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locText: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.body, color: Colors.textSecondary },
});
