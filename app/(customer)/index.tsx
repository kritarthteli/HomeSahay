import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Redirect } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import {
  parseNaturalLanguage,
  fetchNearbyWorkers,
  submitJobRequest,
  triggerSOSDispatch,
} from '../../services/mockApi';
import WorkerCard from '../../components/WorkerCard';
import SOSButton from '../../components/SOSButton';
import MapViewComponent from '../../components/MapViewComponent';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { BENGALURU_CENTER } from '../../data/seedData';

const { width } = Dimensions.get('window');

const ACCENT = '#3c20a1ff';
const ACCENT_LIGHT = '#fdf2f2ff';

const CAROUSEL_SLIDES = [
  { id: '1', title: 'Home Upgrade Sale', subtitle: 'Top-rated experts, guaranteed quality', tag: '40% OFF', bgColor: '#1a1a2e', accentColor: '#EC4899', emoji: '🏠' },
  { id: '2', title: 'Starter Pack', subtitle: 'Get 3 visits at', price: '₹66 each', originalPrice: '₹199', tag: '⏰ Expiring soon', bgColor: '#0f3460', accentColor: '#F59E0B', emoji: '⚡' },
  { id: '3', title: 'Refer & Earn', subtitle: 'You get ₹100, your friend gets ₹50', tag: 'Share now', bgColor: '#1a0533', accentColor: '#A855F7', emoji: '🎁' },
];

const HOME_CATEGORIES = [
  { id: 'plumber', label: 'Plumbing', image: require('../../assets/images/categories/plumber.jpg'), bg: '#EFF6FF' },
  { id: 'electrician', label: 'Electrical', image: require('../../assets/images/categories/electrician.jpg'), bg: '#FEF3C7' },
  { id: 'cleaner', label: 'Cleaning', image: require('../../assets/images/categories/cleaner.jpg'), bg: '#F0FDF4' },
  { id: 'carpenter', label: 'Carpentry', image: require('../../assets/images/categories/carpenter.jpg'), bg: '#FEF9EF' },
  { id: 'appliance', label: 'Appliance', image: require('../../assets/images/categories/appliance.jpg'), bg: '#EDE9FE' },
  { id: 'pest', label: 'Pest Control', image: require('../../assets/images/categories/pest.jpg'), bg: '#CCFBF1' },
  { id: 'painting', label: 'Painting', image: require('../../assets/images/categories/painting.jpg'), bg: '#FCE7F3' },
  { id: 'cook', label: 'Cooking', image: require('../../assets/images/categories/cook.jpg'), bg: '#FEE2E2' },
  { id: 'more', label: 'More', image: require('../../assets/images/categories/more.jpg'), bg: '#F3F4F6' },
];

const AI_PROMPTS = [
  "I'd like to get a facial and waxing at home",
  "My fridge is not working, need a mechanic",
  "Need someone to clean my 2BHK flat completely",
  "AC servicing required for two split ACs",
];

const TRENDING_SEARCHES = [
  "Insta help", "Professional bathroom cleaning", "Haircut at home", "Massage for men", "RO water purifier repair"
];

function CarouselSlide({ item }) {
  return (
    <View style={{ width, paddingHorizontal: 16 }}>
      <View style={[cStyles.slideInner, { backgroundColor: item.bgColor }]}>
        <View style={[cStyles.deco1, { backgroundColor: item.accentColor + '30' }]} />
        <View style={[cStyles.deco2, { backgroundColor: item.accentColor + '20' }]} />
        <View style={cStyles.slideContent}>
          <View style={{ flex: 1 }}>
            {item.tag ? (
              <View style={[cStyles.tagPill, { backgroundColor: item.accentColor }]}>
                <Text style={cStyles.tagText}>{item.tag}</Text>
              </View>
            ) : null}
            <Text style={cStyles.slideTitle}>{item.title}</Text>
            <Text style={cStyles.slideSub}>{item.subtitle}</Text>
            {item.price ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <Text style={[cStyles.priceText, { color: item.accentColor }]}>{item.price}</Text>
                {item.originalPrice ? <Text style={cStyles.strikePrice}>{item.originalPrice}</Text> : null}
              </View>
            ) : null}
          </View>
          <Text style={cStyles.slideEmoji}>{item.emoji}</Text>
        </View>
      </View>
    </View>
  );
}

const cStyles = StyleSheet.create({
  slideInner: { borderRadius: 20, height: 180, overflow: 'hidden', position: 'relative', padding: 20 },
  deco1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, top: -40, right: -30 },
  deco2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, bottom: -20, left: 60 },
  slideContent: { flexDirection: 'row', alignItems: 'center', flex: 1, zIndex: 1 },
  tagPill: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
  tagText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  slideTitle: { color: '#fff', fontSize: 22, fontWeight: '800', lineHeight: 28, marginBottom: 4 },
  slideSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 18 },
  priceText: { fontSize: 18, fontWeight: '800' },
  strikePrice: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecorationLine: 'line-through' },
  slideEmoji: { fontSize: 52, marginLeft: 8 },
});

export default function CustomerHome() {
  const router = useRouter();
  const {
    auth,
    searchResults, searchLoading, parsedIntent,
    selectedWorker, rankingWeights,
    setSearchResults, setSearchLoading, setParsedIntent,
    setSelectedWorker, setCheckoutData, getActiveCustomer,
  } = useAppStore();

  const customer = getActiveCustomer();
  const [sosLoading, setSosLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (activeSlide + 1) % CAROUSEL_SLIDES.length;
      if (carouselRef.current) {
        carouselRef.current.scrollToIndex({ index: next, animated: true });
      }
      setActiveSlide(next);
    }, 3500);
    return () => clearInterval(interval);
  }, [activeSlide]);

  const executeSearch = useCallback(async (text) => {
    setSearchLoading(true);
    setParsedIntent(null);
    setSearchResults([]);
    setSelectedWorker(null);
    setIsSearchVisible(false);
    try {
      const intent = await parseNaturalLanguage(text);
      setParsedIntent(intent);
      const workers = await fetchNearbyWorkers(intent.service_category, customer?.location ?? BENGALURU_CENTER, intent.radius_km, rankingWeights);
      setSearchResults(workers);
      setShowMap(true);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSearchLoading(false);
    }
  }, [customer, rankingWeights]);

  const handleCategoryPress = useCallback(async (catId) => {
    if (catId === 'more') { setIsSearchVisible(true); return; }
    setSearchLoading(true);
    setParsedIntent({ service_category: catId, urgency: 'normal', confidence: 1.0, radius_km: 15 });
    setSearchResults([]);
    try {
      const workers = await fetchNearbyWorkers(catId, customer?.location ?? BENGALURU_CENTER, 15, rankingWeights);
      setSearchResults(workers);
      setShowMap(true);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSearchLoading(false);
    }
  }, [customer, rankingWeights]);

  const handleSOS = async () => {
    setSosLoading(true);
    try {
      const result = await triggerSOSDispatch({ customerId: customer?.id, category: parsedIntent?.service_category ?? 'general', userLocation: customer?.location ?? BENGALURU_CENTER });
      Alert.alert('🚨 SOS Dispatched', result.message, [{ text: 'OK', onPress: () => router.push('/tracking') }]);
    } catch (e) {
      Alert.alert('SOS Failed', e.message);
    } finally {
      setSosLoading(false);
    }
  };

  const handleBook = async (worker) => {
    setBookingLoading(true);
    try {
      const jobData = await submitJobRequest({ customerId: customer?.id, workerId: worker.id, category: parsedIntent?.service_category ?? worker.category, userLocation: customer?.location ?? BENGALURU_CENTER, urgency: parsedIntent?.urgency ?? 'normal' });
      setCheckoutData({ ...jobData, workerId: worker.id });
      router.push('/checkout');
    } catch (e) {
      Alert.alert('Booking Error', e.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (!auth.customer) {
    return <Redirect href="/(customer)/login" />;
  }

  const renderSearchResults = () => (
    <View style={styles.resultsContainer}>
      <View style={styles.resultsHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => { setShowMap(false); setSearchResults([]); }}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.resultsTitle}>
          {parsedIntent?.service_category ? `${parsedIntent.service_category} nearby` : 'Search Results'}
        </Text>
      </View>
      <View style={styles.viewToggle}>
        <TouchableOpacity style={[styles.toggleBtn, showMap && styles.toggleBtnActive]} onPress={() => setShowMap(true)}>
          <Ionicons name="map-outline" size={14} color={showMap ? ACCENT : Colors.textMuted} />
          <Text style={[styles.toggleText, showMap && styles.toggleTextActive]}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleBtn, !showMap && styles.toggleBtnActive]} onPress={() => setShowMap(false)}>
          <Ionicons name="list-outline" size={14} color={!showMap ? ACCENT : Colors.textMuted} />
          <Text style={[styles.toggleText, !showMap && styles.toggleTextActive]}>
            List {searchResults.length > 0 ? `(${searchResults.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        {showMap ? (
          <View style={styles.mapContainer}>
            <MapViewComponent workers={searchResults.length > 0 ? searchResults : []} customerLocation={customer?.location ?? BENGALURU_CENTER} radiusKm={parsedIntent?.radius_km ?? 10} style={styles.map} />
            <View style={styles.sosWrapper}>
              <SOSButton onPress={handleSOS} disabled={sosLoading} />
              <Text style={styles.sosLabel}>SOS</Text>
            </View>
          </View>
        ) : (
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {searchLoading && (<View style={styles.loadingCard}><Text style={styles.loadingText}>🤖 AI is finding the best workers for you…</Text></View>)}
            {!searchLoading && searchResults.length === 0 && (<View style={styles.emptyCard}><Ionicons name="search-circle-outline" size={48} color={Colors.textMuted} /><Text style={styles.emptyText}>No workers found for your request.</Text></View>)}
            {searchResults.map((w) => (
              <View key={w.id}>
                <WorkerCard worker={w} selected={selectedWorker?.id === w.id} onSelect={setSelectedWorker} />
                {selectedWorker?.id === w.id && (
                  <TouchableOpacity style={styles.bookBtn} onPress={() => handleBook(w)} disabled={bookingLoading}>
                    <Ionicons name="calendar-outline" size={16} color="#fff" />
                    <Text style={styles.bookBtnText}>{bookingLoading ? 'Booking…' : `Book ${w.name.split(' ')[0]} — ₹${w.pricePerHour}/hr`}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );

  const CARD_GAP = 12;
  const SERVICE_CARD_SIZE = (width - 40 - CARD_GAP * 2) / 3;

  const renderHomeFeed = () => (
    <ScrollView style={styles.feedScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.feedContent}>
      <FlatList
        ref={carouselRef}
        data={CAROUSEL_SLIDES}
        renderItem={({ item }) => <CarouselSlide item={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveSlide(idx);
        }}
        style={{ marginBottom: 10 }}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
      />
      <View style={styles.dotsRow}>
        {CAROUSEL_SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeSlide && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
          <View style={styles.actionIconWrap}>
            <Ionicons name="calendar-outline" size={22} color={ACCENT} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Schedule <Text style={styles.actionArrow}>›</Text></Text>
            <Text style={styles.actionSub}>Pick your time</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionCard, styles.actionCardInstant]} activeOpacity={0.8} onPress={() => setIsSearchVisible(true)}>
          <View style={{ flex: 1 }}>
            <View style={styles.instantBadge}>
              <Text style={styles.instantBadgeText}>17 mins ⚡</Text>
            </View>
            <Text style={styles.actionTitle}>Instant <Text style={styles.actionArrow}>›</Text></Text>
            <Text style={styles.actionSub}>Get now</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.offerBanner}>
        <View style={styles.offerLeft}>
          <View style={styles.offerTag}>
            <Ionicons name="time-outline" size={11} color={ACCENT} />
            <Text style={styles.offerTagText}>Expiring tomorrow</Text>
          </View>
          <Text style={styles.offerTitle}>Get 3 visits at</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.offerPrice}>₹66 each</Text>
            <Text style={styles.offerStrike}>₹199</Text>
          </View>
        </View>
        <View style={styles.offerTicketWrap}>
          <View style={styles.ticket}>
            <Text style={styles.ticketTop}>₹79</Text>
            <Text style={styles.ticketLabel}>STARTER{'\n'}PACK</Text>
          </View>
          <View style={[styles.ticket, { marginLeft: -14, marginTop: -8, opacity: 0.8 }]}>
            <Text style={styles.ticketTop}>₹79</Text>
            <Text style={styles.ticketLabel}>STARTER{'\n'}PACK</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Home Essentials</Text>
      <View style={styles.serviceGrid}>
        {HOME_CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat.id} style={{ width: SERVICE_CARD_SIZE, alignItems: 'center' }} activeOpacity={0.75} onPress={() => handleCategoryPress(cat.id)}>
            <View style={[styles.serviceIconBox, { backgroundColor: cat.bg, width: SERVICE_CARD_SIZE, height: SERVICE_CARD_SIZE }]}>
              <Image source={cat.image} style={{ width: '100%', height: '100%', borderRadius: 14 }} resizeMode="cover" />
            </View>
            <Text style={styles.serviceLabel} numberOfLines={2}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.referBanner}>
        <View style={styles.referLeft}>
          <Text style={styles.referTitle}>Refer &amp; Earn</Text>
          <Text style={styles.referSub}>You get ₹100, your friend gets ₹50</Text>
          <TouchableOpacity style={styles.referBtn} activeOpacity={0.85}>
            <Text style={styles.referBtnText}>Refer now</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.referRight}>
          <Text style={{ fontSize: 36 }}>📱</Text>
          <View style={{ alignItems: 'center', marginHorizontal: 2 }}>
            <Text style={{ fontSize: 20 }}>🪙</Text>
            <Text style={{ fontSize: 14 }}>🪙</Text>
          </View>
          <Text style={{ fontSize: 30 }}>📱</Text>
        </View>
      </View>

      <View style={styles.trustSection}>
        <View style={styles.goldSeal}>
          <Text style={styles.goldSealText}>HomeSahay</Text>
          <Text style={styles.goldSealSub}>CERTIFIED</Text>
        </View>
        <Text style={styles.trustTitle}>Experts Vetted for Quality</Text>
        <View style={styles.trustPillars}>
          {[{ icon: '⭐', label: 'Top Rated\nExperts' }, { icon: '🎓', label: 'Professionally\nTrained' }, { icon: '🛡️', label: 'Background\nVerified' }].map((p, i) => (
            <View key={i} style={styles.trustPillar}>
              <View style={styles.trustIcon}>
                <Text style={{ fontSize: 22 }}>{p.icon}</Text>
              </View>
              <Text style={styles.trustPillarText}>{p.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );

  return (
    <View style={styles.mainContainer}>
      <Modal visible={isSearchVisible} animationType="slide" onRequestClose={() => setIsSearchVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsSearchVisible(false)} style={styles.modalBack}>
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <View style={styles.modalInputWrapper}>
              <TextInput style={styles.modalInput} placeholder="Look for services" placeholderTextColor={Colors.textMuted} autoFocus value={searchText} onChangeText={setSearchText} onSubmitEditing={() => executeSearch(searchText)} returnKeyType="search" />
              <Ionicons name="search" size={20} color={Colors.textMuted} />
            </View>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>Trending searches</Text>
            <View style={styles.trendingWrap}>
              {TRENDING_SEARCHES.map((term, i) => (
                <TouchableOpacity key={i} style={styles.trendingPill} onPress={() => executeSearch(term)}>
                  <Ionicons name="trending-up" size={14} color={Colors.textSecondary} />
                  <Text style={styles.trendingText}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.aiSection}>
              <Text style={styles.aiSectionTitle}>Ask anything with AI ✨</Text>
              <View style={styles.aiPromptsList}>
                {AI_PROMPTS.map((prompt, idx) => (
                  <TouchableOpacity key={idx} style={styles.aiPromptItem} onPress={() => executeSearch(prompt)}>
                    <Ionicons name="sparkles" size={16} color={ACCENT} style={{ marginTop: 2 }} />
                    <Text style={styles.aiPromptText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
          <View style={styles.modalFooter}>
            <View style={styles.footerInputBox}>
              <Ionicons name="sparkles-outline" size={20} color={ACCENT} />
              <TextInput style={styles.footerInput} placeholder="Looking for something else? Ask AI ✨" placeholderTextColor={Colors.textMuted} value={searchText} onChangeText={setSearchText} onSubmitEditing={() => executeSearch(searchText)} />
              <TouchableOpacity onPress={() => executeSearch(searchText)}>
                <Ionicons name="send" size={20} color={ACCENT} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {showMap || searchResults.length > 0 ? (
        renderSearchResults()
      ) : (
        <>
          <SafeAreaView edges={['top']} style={{ backgroundColor: '#fff' }}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.locationSelector} activeOpacity={0.7}>
                <Ionicons name="location" size={14} color={ACCENT} />
                <View style={{ marginLeft: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={styles.locationLabel}>Home</Text>
                    <Ionicons name="chevron-down" size={14} color="#374151" />
                  </View>
                  <Text style={styles.locationAddress} numberOfLines={1}>
                    {customer?.address ? customer.address.split(',').slice(0, 2).join(',') : '42, 7th Cross, JP Nagar'}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.headerRight}>
                <TouchableOpacity style={styles.cashBadge} activeOpacity={0.8}>
                  <Text style={{ fontSize: 13 }}>🎁</Text>
                  <Text style={styles.cashAmount}>₹{customer?.sahayCash ?? 200}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.profileBtn} activeOpacity={0.8} onPress={() => router.push('/(customer)/profile')}>
                  <Ionicons name="person" size={18} color="#374151" />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.searchBar} onPress={() => setIsSearchVisible(true)} activeOpacity={0.9}>
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <Text style={styles.searchPlaceholder}>Search for 'AC service'</Text>
            </TouchableOpacity>
          </SafeAreaView>
          {renderHomeFeed()}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, backgroundColor: '#fff' },
  locationSelector: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  locationLabel: { fontSize: 16, fontWeight: '800', color: '#111827' },
  locationAddress: { fontSize: 12, color: '#6B7280', maxWidth: 200 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cashBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: ACCENT_LIGHT, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, gap: 4, borderWidth: 1, borderColor: '#FBCFE8' },
  cashAmount: { fontSize: 13, fontWeight: '700', color: ACCENT },
  profileBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', marginHorizontal: 16, marginBottom: 12, borderRadius: 50, paddingHorizontal: 16, paddingVertical: 12, gap: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  searchPlaceholder: { color: '#9CA3AF', fontSize: 14, flex: 1 },
  feedScroll: { flex: 1, backgroundColor: '#F8F9FA' },
  feedContent: { paddingBottom: 32 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 20 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB' },
  dotActive: { width: 20, backgroundColor: ACCENT },
  actionRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 16 },
  actionCard: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: '#F3F4F6', gap: 10 },
  actionCardInstant: { backgroundColor: '#fff0f6', borderColor: '#FBCFE8' },
  actionIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: ACCENT_LIGHT, justifyContent: 'center', alignItems: 'center' },
  actionTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  actionArrow: { fontSize: 18, color: ACCENT },
  actionSub: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  instantBadge: { backgroundColor: ACCENT, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 6 },
  instantBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  offerBanner: { marginHorizontal: 16, backgroundColor: '#FFF1F7', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#FBCFE8', shadowColor: ACCENT, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  offerLeft: { flex: 1 },
  offerTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  offerTagText: { fontSize: 11, color: ACCENT, fontWeight: '700' },
  offerTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  offerPrice: { fontSize: 22, fontWeight: '900', color: ACCENT },
  offerStrike: { fontSize: 14, color: '#9CA3AF', textDecorationLine: 'line-through' },
  offerTicketWrap: { flexDirection: 'row', alignItems: 'center' },
  ticket: { width: 68, height: 82, backgroundColor: ACCENT, borderRadius: 10, justifyContent: 'center', alignItems: 'center', shadowColor: ACCENT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
  ticketTop: { color: '#fff', fontSize: 15, fontWeight: '900' },
  ticketLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 8, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', paddingHorizontal: 20, marginBottom: 14 },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  serviceIconBox: { borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  serviceEmoji: { fontSize: 34 },
  serviceLabel: { fontSize: 12, fontWeight: '600', color: '#374151', textAlign: 'center', lineHeight: 16 },
  referBanner: { marginHorizontal: 16, backgroundColor: '#FDF2F8', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#FBCFE8' },
  referLeft: { flex: 1 },
  referTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4 },
  referSub: { fontSize: 13, color: '#6B7280', marginBottom: 14, lineHeight: 18 },
  referBtn: { backgroundColor: ACCENT, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10, alignSelf: 'flex-start' },
  referBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  referRight: { flexDirection: 'row', alignItems: 'flex-end', marginLeft: 8, gap: 2 },
  trustSection: { marginHorizontal: 16, backgroundColor: '#FDF8F0', borderRadius: 24, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#F3E8C6' },
  goldSeal: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F59E0B', justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8, borderWidth: 4, borderColor: '#FDE68A' },
  goldSealText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  goldSealSub: { color: 'rgba(255,255,255,0.85)', fontSize: 7, fontWeight: '700', marginTop: 2 },
  trustTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 20, textAlign: 'center' },
  trustPillars: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  trustPillar: { alignItems: 'center', flex: 1 },
  trustIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  trustPillarText: { fontSize: 11, fontWeight: '600', color: '#6B7280', textAlign: 'center', lineHeight: 16 },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalBack: { padding: Spacing.xs, marginRight: Spacing.sm },
  modalInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: Radius.lg, paddingHorizontal: Spacing.sm },
  modalInput: { flex: 1, paddingVertical: 12, fontSize: Typography.fontSize.md, color: '#111827' },
  modalContent: { flex: 1 },
  modalSectionTitle: { fontSize: Typography.fontSize.lg, fontWeight: '700', color: '#111827', paddingHorizontal: Spacing.base, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  trendingWrap: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.base, gap: Spacing.sm },
  trendingPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, gap: 6 },
  trendingText: { fontSize: Typography.fontSize.sm, color: '#4B5563' },
  aiSection: { marginTop: Spacing.xl, backgroundColor: '#F8FAFC', paddingTop: Spacing.lg, paddingBottom: Spacing.xl, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  aiSectionTitle: { fontSize: Typography.fontSize.lg, fontWeight: '700', color: '#111827', paddingHorizontal: Spacing.base, marginBottom: Spacing.md },
  aiPromptsList: { paddingHorizontal: Spacing.base, gap: Spacing.md },
  aiPromptItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  aiPromptText: { flex: 1, fontSize: Typography.fontSize.md, color: '#4B5563', lineHeight: 22 },
  modalFooter: { padding: Spacing.base, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#fff' },
  footerInputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: Radius.full, paddingHorizontal: Spacing.md, borderWidth: 1, borderColor: '#E2E8F0', gap: Spacing.sm },
  footerInput: { flex: 1, paddingVertical: 14, fontSize: Typography.fontSize.md, color: '#111827' },
  resultsContainer: { flex: 1, backgroundColor: Colors.bg0 },
  resultsHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: Spacing.md, paddingHorizontal: Spacing.base, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { marginRight: Spacing.sm },
  resultsTitle: { fontSize: Typography.fontSize.lg, fontWeight: 'bold', color: '#111827' },
  viewToggle: { flexDirection: 'row', backgroundColor: '#fff', padding: Spacing.sm, marginHorizontal: Spacing.base, marginTop: Spacing.md, borderRadius: Radius.full, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.sm, gap: 6, borderRadius: Radius.full },
  toggleBtnActive: { backgroundColor: ACCENT + '15' },
  toggleText: { fontSize: Typography.fontSize.sm, fontWeight: '600', color: Colors.textMuted },
  toggleTextActive: { color: ACCENT },
  mapContainer: { flex: 1, marginTop: Spacing.sm },
  map: { flex: 1 },
  sosWrapper: { position: 'absolute', bottom: Spacing.xl, right: Spacing.xl, alignItems: 'center' },
  sosLabel: { color: Colors.error, fontWeight: 'bold', marginTop: 4 },
  list: { flex: 1, padding: Spacing.base },
  loadingCard: { backgroundColor: '#fff', padding: Spacing.xl, borderRadius: Radius.lg, alignItems: 'center' },
  loadingText: { color: Colors.textSecondary, fontWeight: '600' },
  emptyCard: { backgroundColor: '#fff', padding: Spacing.xl, borderRadius: Radius.lg, alignItems: 'center', gap: Spacing.sm },
  emptyText: { color: Colors.textMuted, fontSize: Typography.fontSize.sm },
  bookBtn: { backgroundColor: ACCENT, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.md, borderRadius: Radius.md, marginTop: -Spacing.sm, marginBottom: Spacing.base, gap: Spacing.sm },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: Typography.fontSize.md },
});
