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
import { Spacing, Radius } from '../../constants/theme';

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  plumber:     { color: '#2563EB', bg: '#EFF6FF' },
  electrician: { color: '#D97706', bg: '#FEF3C7' },
  cleaner:     { color: '#059669', bg: '#ECFDF5' },
  cook:        { color: '#DB2777', bg: '#FDF2F8' },
  carpenter:   { color: '#7C3AED', bg: '#EDE9FE' },
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
              <View style={[styles.statDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.statPillText}>{statusCounts.online} Online</Text>
            </View>
            <View style={styles.statPill}>
              <View style={[styles.statDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.statPillText}>{statusCounts.pending} Pending KYC</Text>
            </View>
          </View>
        </View>

        {/* Search + Filters */}
        <View style={styles.filterBar}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search workers by name, skill, or cooperative…"
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
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
              >
                <Text style={[styles.filterChipText, filterStatus === s && styles.filterChipTextActive]}>
                  {s.charAt(0).toUpperCase() + s.slice(1)} ({statusCounts[s]})
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
                    active && style ? { backgroundColor: style.bg, borderColor: style.color } : active && { backgroundColor: '#EDE9FE', borderColor: '#3c20a1' },
                  ]}
                  onPress={() => setFilterCategory(cat)}
                >
                  <Text style={[
                    styles.catChipText,
                    active && style ? { color: style.color } : active && { color: '#3c20a1' },
                  ]}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
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
            <Text style={[styles.thCell, { flex: 2 }]}>Worker</Text>
            <Text style={styles.thCell}>Category</Text>
            <Text style={styles.thCell}>Cooperative</Text>
            <Text style={styles.thCell}>Status</Text>
            <Text style={styles.thCell}>Rating</Text>
            <Text style={styles.thCell}>Jobs Today</Text>
            <Text style={styles.thCell}>KYC</Text>
            <Text style={[styles.thCell, { textAlign: 'center' }]}>Details</Text>
          </View>

          {filtered.length === 0 && (
            <View style={styles.emptyRow}>
              <Ionicons name="search-outline" size={32} color="#D1D5DB" />
              <Text style={styles.emptyText}>No workers match your filters</Text>
            </View>
          )}

          {filtered.map((w: any, i: number) => {
            const catStyle = CATEGORY_COLORS[w.category] || { color: '#6B7280', bg: '#F3F4F6' };
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
                      {w.category}
                    </Text>
                  </View>
                </View>

                {/* Cooperative */}
                <View style={styles.tdCell}>
                  <Text style={styles.coopText} numberOfLines={2}>{w.cooperative}</Text>
                </View>

                {/* Status */}
                <View style={styles.tdCell}>
                  <View style={[styles.statusDot, { backgroundColor: w.isOnline ? '#DCFCE7' : '#F3F4F6' }]}>
                    <View style={[styles.dotInner, { backgroundColor: w.isOnline ? '#10B981' : '#9CA3AF' }]} />
                    <Text style={[styles.statusText, { color: w.isOnline ? '#059669' : '#6B7280' }]}>
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
                      backgroundColor: w.kyc_status === 'approved' ? '#ECFDF5' : '#FEF3C7',
                    },
                  ]}>
                    <Ionicons
                      name={w.kyc_status === 'approved' ? 'checkmark-circle' : 'time-outline'}
                      size={13}
                      color={w.kyc_status === 'approved' ? '#059669' : '#D97706'}
                    />
                    <Text style={[styles.kycText, { color: w.kyc_status === 'approved' ? '#059669' : '#D97706' }]}>
                      {w.kyc_status === 'approved' ? 'Verified' : 'Pending'}
                    </Text>
                  </View>
                </View>

                {/* View button */}
                <View style={[styles.tdCell, { alignItems: 'center' }]}>
                  <TouchableOpacity style={styles.viewBtn} onPress={() => setSelectedWorker(w)}>
                    <Ionicons name="eye-outline" size={15} color="#3c20a1" />
                    <Text style={styles.viewBtnText}>View</Text>
                  </TouchableOpacity>
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
                <Text style={styles.modalTitle}>Worker Profile</Text>
                <TouchableOpacity onPress={() => setSelectedWorker(null)} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color="#6B7280" />
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
                            <Ionicons name="shield-checkmark" size={14} color="#3c20a1" />
                            <Text style={styles.verifiedText}>Verified</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.modalCoop}>{selectedWorker.cooperative}</Text>
                      <View style={styles.identityMeta}>
                        <View style={[styles.catTag, { backgroundColor: CATEGORY_COLORS[selectedWorker.category]?.bg || '#F3F4F6' }]}>
                          <Text style={[styles.catTagText, { color: CATEGORY_COLORS[selectedWorker.category]?.color || '#6B7280' }]}>
                            {selectedWorker.category}
                          </Text>
                        </View>
                        <View style={[styles.statusDot, { backgroundColor: selectedWorker.isOnline ? '#DCFCE7' : '#F3F4F6' }]}>
                          <View style={[styles.dotInner, { backgroundColor: selectedWorker.isOnline ? '#10B981' : '#9CA3AF' }]} />
                          <Text style={[styles.statusText, { color: selectedWorker.isOnline ? '#059669' : '#6B7280' }]}>
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
                    { label: 'Rating', value: `⭐ ${selectedWorker.rating}`, icon: 'star' as const },
                    { label: 'Total Jobs', value: selectedWorker.totalJobs, icon: 'briefcase-outline' as const },
                    { label: 'Today Earnings', value: `₹${selectedWorker.todayEarnings}`, icon: 'cash-outline' as const },
                    { label: 'Experience', value: `${selectedWorker.yearsExperience} yrs`, icon: 'time-outline' as const },
                    { label: 'Rate/Hour', value: `₹${selectedWorker.pricePerHour}`, icon: 'pricetag-outline' as const },
                    { label: 'Jobs Today', value: selectedWorker.todayJobs, icon: 'today-outline' as const },
                  ].map((stat) => (
                    <View key={stat.label} style={styles.statCard}>
                      <Ionicons name={stat.icon} size={18} color="#6B7280" />
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                  ))}
                </View>

                {/* Skills */}
                <View style={styles.modalSection}>
                  <Text style={styles.sectionLabel}>Skills</Text>
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
                  <Text style={styles.sectionLabel}>Languages</Text>
                  <View style={styles.skillsRow}>
                    {selectedWorker.languages.map((l: string) => (
                      <View key={l} style={[styles.skillChip, { backgroundColor: '#EEF2FF' }]}>
                        <Text style={[styles.skillChipText, { color: '#3730A3' }]}>{l}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Documents */}
                <View style={styles.modalSection}>
                  <Text style={styles.sectionLabel}>Documents</Text>
                  <View style={styles.docsGrid}>
                    {Object.entries(MOCK_WORKER_DOCS[selectedWorker.id] || {}).map(([key, doc]) => (
                      <View key={key} style={styles.docCard}>
                        <View style={styles.docCardTop}>
                          <Ionicons
                            name={doc.verified ? 'checkmark-circle' : doc.uploaded ? 'time-outline' : 'close-circle'}
                            size={20}
                            color={doc.verified ? '#059669' : doc.uploaded ? '#D97706' : '#EF4444'}
                          />
                          <Text style={styles.docName}>{DOC_LABELS[key]}</Text>
                        </View>
                        <View style={[
                          styles.docStatus,
                          {
                            backgroundColor: doc.verified ? '#ECFDF5' : doc.uploaded ? '#FEF3C7' : '#FEF2F2',
                          },
                        ]}>
                          <Text style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: doc.verified ? '#059669' : doc.uploaded ? '#D97706' : '#EF4444',
                          }}>
                            {doc.verified ? 'Verified ✓' : doc.uploaded ? 'Pending review' : 'Not uploaded'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Location */}
                <View style={styles.modalSection}>
                  <Text style={styles.sectionLabel}>Location Info</Text>
                  <View style={styles.locationRow}>
                    <View style={styles.locItem}>
                      <Ionicons name="location-outline" size={16} color="#6B7280" />
                      <Text style={styles.locText}>{selectedWorker.distanceKm} km from hub</Text>
                    </View>
                    <View style={styles.locItem}>
                      <Ionicons name="time-outline" size={16} color="#6B7280" />
                      <Text style={styles.locText}>{selectedWorker.etaMinutes} min ETA</Text>
                    </View>
                    <View style={styles.locItem}>
                      <Ionicons name="map-outline" size={16} color="#6B7280" />
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
  page: { flex: 1, backgroundColor: '#F4F6FA' },
  scroll: { flex: 1 },
  pageContent: { padding: 32, paddingBottom: 48, gap: 20 },

  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#111827' },
  pageSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  headerStats: { flexDirection: 'row', gap: 10 },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statDot: { width: 8, height: 8, borderRadius: 4 },
  statPillText: { fontSize: 13, fontWeight: '600', color: '#374151' },

  filterBar: { gap: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    // @ts-ignore
    outlineStyle: 'none',
  },
  statusFilters: { flexDirection: 'row', gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  filterChipActive: { backgroundColor: '#EDE9FE', borderColor: '#3c20a1' },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  filterChipTextActive: { color: '#3c20a1' },

  catScroll: { marginBottom: 4 },
  catFilters: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  catChipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },

  tableCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  thCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableRowEven: { backgroundColor: '#FAFAFA' },
  tdCell: { flex: 1, justifyContent: 'center' },

  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  workerName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  workerExp: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },

  catTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  catTagText: { fontSize: 11, fontWeight: '700' },

  coopText: { fontSize: 12, color: '#4B5563', lineHeight: 18 },

  statusDot: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  dotInner: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },

  ratingText: { fontSize: 13, fontWeight: '700', color: '#111827' },

  jobsText: { fontSize: 13, fontWeight: '700', color: '#111827' },
  earningsText: { fontSize: 11, color: '#059669', fontWeight: '600', marginTop: 1 },

  kycBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  kycText: { fontSize: 11, fontWeight: '700' },

  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewBtnText: { color: '#3c20a1', fontSize: 12, fontWeight: '700' },

  emptyRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: { fontSize: 14, color: '#9CA3AF' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    width: '100%' as any,
    maxWidth: 680,
    maxHeight: '90vh' as any,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalSection: { marginBottom: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 },

  identityRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  modalAvatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: '#E5E7EB' },
  identityInfo: { flex: 1, gap: 6 },
  identityNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  modalName: { fontSize: 22, fontWeight: '800', color: '#111827' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EDE9FE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  verifiedText: { fontSize: 11, fontWeight: '700', color: '#3c20a1' },
  modalCoop: { fontSize: 13, color: '#6B7280' },
  identityMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: 90,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: { fontSize: 16, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 11, color: '#6B7280', textAlign: 'center' },

  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  skillChipText: { fontSize: 12, fontWeight: '600', color: '#374151' },

  docsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  docCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  docCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  docName: { fontSize: 13, fontWeight: '600', color: '#374151', flex: 1 },
  docStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },

  locationRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  locItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locText: { fontSize: 13, color: '#4B5563' },
});
