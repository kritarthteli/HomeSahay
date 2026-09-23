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
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';
import { BENGALURU_CENTER } from '../../data/seedData';

const { width } = Dimensions.get('window');

const CAROUSEL_SLIDES = [
  { id: '1', title: 'Home Upgrade Sale', subtitle: 'Top-rated experts, guaranteed quality', tag: '40% OFF', bgColor: Colors.surfaceDark, accentColor: Colors.accentPrimary, emoji: '🏠' },
  { id: '2', title: 'Starter Pack', subtitle: 'Get 3 visits at', price: '₹66 each', originalPrice: '₹199', tag: '⏰ Expiring soon', bgColor: Colors.canvasDark, accentColor: Colors.accentLight, emoji: '⚡' },
  { id: '3', title: 'Refer & Earn', subtitle: 'You get ₹100, your friend gets ₹50', tag: 'Share now', bgColor: Colors.surfaceInteractive, accentColor: Colors.accentPrimaryDim, emoji: '🎁' },
];

const HOME_CATEGORIES = [
  { id: 'plumber', label: 'Plumbing', image: require('../../assets/images/categories/plumber.jpg'), bg: Colors.canvasCream },
  { id: 'electrician', label: 'Electrical', image: require('../../assets/images/categories/electrician.jpg'), bg: Colors.canvasCream },
  { id: 'cleaner', label: 'Cleaning', image: require('../../assets/images/categories/cleaner.jpg'), bg: Colors.canvasCream },
  { id: 'carpenter', label: 'Carpentry', image: require('../../assets/images/categories/carpenter.jpg'), bg: Colors.canvasCream },
  { id: 'appliance', label: 'Appliance', image: require('../../assets/images/categories/appliance.jpg'), bg: Colors.canvasCream },
  { id: 'pest', label: 'Pest Control', image: require('../../assets/images/categories/pest.jpg'), bg: Colors.canvasCream },
  { id: 'painting', label: 'Painting', image: require('../../assets/images/categories/painting.jpg'), bg: Colors.canvasCream },
  { id: 'cook', label: 'Cooking', image: require('../../assets/images/categories/cook.jpg'), bg: Colors.canvasCream },
  { id: 'more', label: 'More', image: require('../../assets/images/categories/more.jpg'), bg: Colors.borderLight },
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

function CarouselSlide({ item }: any) {
  return (
    <View style={{ width, paddingHorizontal: 16 }}>
      <View style={[cStyles.slideInner, { backgroundColor: item.bgColor }]}>
        <View style={[cStyles.deco1, { backgroundColor: item.accentColor + '10' }]} />
        <View style={[cStyles.deco2, { backgroundColor: item.accentColor + '05' }]} />
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
  slideInner: { borderRadius: Radius.lg, height: 180, overflow: 'hidden', position: 'relative', padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderDark },
  deco1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, top: -40, right: -30 },
  deco2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, bottom: -20, left: 60 },
  slideContent: { flexDirection: 'row', alignItems: 'center', flex: 1, zIndex: 1 },
  tagPill: { alignSelf: 'flex-start', borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 8 },
  tagText: { color: Colors.textOnPrimary, fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, textTransform: 'uppercase' },
  slideTitle: { color: Colors.textInverse, fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, lineHeight: 28, marginBottom: 4, letterSpacing: -0.5 },
  slideSub: { color: Colors.textInverseMuted, fontSize: Typography.fontSize.sm, lineHeight: 18 },
  priceText: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold },
  strikePrice: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.mono, color: Colors.textInverseMuted, textDecorationLine: 'line-through' },
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
  const carouselRef = useRef<FlatList>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (activeSlide + 1) % CAROUSEL_SLIDES.length;
      if (carouselRef.current) {
        carouselRef.current.scrollToIndex({ index: next, animated: true });
      }
      setActiveSlide(next);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeSlide]);

  const executeSearch = useCallback(async (text: string) => {
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
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSearchLoading(false);
    }
  }, [customer, rankingWeights]);

  const handleCategoryPress = useCallback(async (catId: string) => {
    if (catId === 'more') { setIsSearchVisible(true); return; }
    setSearchLoading(true);
    setParsedIntent({ service_category: catId, urgency: 'normal', confidence: 1.0, radius_km: 15 });
    setSearchResults([]);
    try {
      const workers = await fetchNearbyWorkers(catId, customer?.location ?? BENGALURU_CENTER, 15, rankingWeights);
      setSearchResults(workers);
      setShowMap(true);
    } catch (e: any) {
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
    } catch (e: any) {
      Alert.alert('SOS Failed', e.message);
    } finally {
      setSosLoading(false);
    }
  };

  const handleBook = async (worker: any) => {
    setBookingLoading(true);
    try {
      const jobData = await submitJobRequest({ customerId: customer?.id, workerId: worker.id, category: parsedIntent?.service_category ?? worker.category, userLocation: customer?.location ?? BENGALURU_CENTER, urgency: parsedIntent?.urgency ?? 'normal' });
      setCheckoutData({ ...jobData, workerId: worker.id });
      router.push('/checkout');
    } catch (e: any) {
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
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.resultsTitle}>
          {parsedIntent?.service_category ? `${parsedIntent.service_category} nearby` : 'Search Results'}
        </Text>
      </View>
      <View style={styles.viewToggle}>
        <TouchableOpacity style={[styles.toggleBtn, showMap && styles.toggleBtnActive]} onPress={() => setShowMap(true)}>
          <Ionicons name="map-outline" size={14} color={showMap ? Colors.textOnPrimary : Colors.textMuted} />
          <Text style={[styles.toggleText, showMap && styles.toggleTextActive]}>MAP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleBtn, !showMap && styles.toggleBtnActive]} onPress={() => setShowMap(false)}>
          <Ionicons name="list-outline" size={14} color={!showMap ? Colors.textOnPrimary : Colors.textMuted} />
          <Text style={[styles.toggleText, !showMap && styles.toggleTextActive]}>
            LIST {searchResults.length > 0 ? `(${searchResults.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        {showMap ? (
          <View style={styles.mapContainer}>
            <MapViewComponent workers={searchResults.length > 0 ? searchResults : []} customerLocation={customer?.location ?? BENGALURU_CENTER} radiusKm={parsedIntent?.radius_km ?? 10} style={styles.map} />
            <View style={styles.sosWrapper}>
              <SOSButton onPress={handleSOS} disabled={sosLoading} />
            </View>
          </View>
        ) : (
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {searchLoading && (<View style={styles.loadingCard}><Text style={styles.loadingText}>🤖 AI is finding the best workers for you…</Text></View>)}
            {!searchLoading && searchResults.length === 0 && (<View style={styles.emptyCard}><Ionicons name="search-circle-outline" size={48} color={Colors.textMuted} /><Text style={styles.emptyText}>No workers found for your request.</Text></View>)}
            {searchResults.map((w: any) => (
              <View key={w.id}>
                <WorkerCard worker={w} selected={selectedWorker?.id === w.id} onSelect={setSelectedWorker} />
                {selectedWorker?.id === w.id && (
                  <TouchableOpacity style={styles.bookBtn} onPress={() => handleBook(w)} disabled={bookingLoading} activeOpacity={0.8}>
                    <Ionicons name="calendar-outline" size={16} color={Colors.textOnPrimary} />
                    <Text style={styles.bookBtnText}>{bookingLoading ? 'BOOKING…' : `BOOK ${w.name.split(' ')[0]} — ₹${w.pricePerHour}/HR`}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );

  const CARD_GAP = 16;
  const SERVICE_CARD_SIZE = (width - Spacing.base * 2 - CARD_GAP * 2) / 3;

  const renderHomeFeed = () => (
    <ScrollView style={styles.feedScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.feedContent}>
      
      {/* Editorial Hero Area */}
      <View style={styles.editorialHero}>
        <Text style={styles.editorialTitle}>Trusted help,{'\n'}right around{'\n'}you.</Text>
        <Text style={styles.editorialSub}>Vetted home professionals owned by the collective. Direct bookings, zero middleman commission.</Text>
      </View>

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
        style={{ marginBottom: Spacing.sm }}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
      />
      <View style={styles.dotsRow}>
        {CAROUSEL_SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeSlide && styles.dotActive]} />
        ))}
      </View>

      {/* Action Pills */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
          <View style={styles.actionIconWrap}>
            <Ionicons name="calendar-outline" size={20} color={Colors.textPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Schedule <Text style={styles.actionArrow}>›</Text></Text>
            <Text style={styles.actionSub}>Pick any time</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionCard, styles.actionCardInstant]} activeOpacity={0.8} onPress={() => setIsSearchVisible(true)}>
          <View style={{ flex: 1 }}>
            <View style={styles.instantBadge}>
              <Ionicons name="flash" size={10} color={Colors.textOnPrimary} />
              <Text style={styles.instantBadgeText}>LIVE</Text>
            </View>
            <Text style={styles.actionTitle}>SOS Urgent <Text style={styles.actionArrow}>›</Text></Text>
            <Text style={styles.actionSub}>Under 15 mins</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categoryHeader}>
        <Text style={styles.sectionMono}>SERVICE COLLECTIVE</Text>
        <Text style={styles.sectionTitle}>Curated Categories</Text>
      </View>
      <View style={styles.serviceGrid}>
        {HOME_CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat.id} style={{ width: SERVICE_CARD_SIZE, alignItems: 'center' }} activeOpacity={0.75} onPress={() => handleCategoryPress(cat.id)}>
            <View style={[styles.serviceIconBox, { width: SERVICE_CARD_SIZE, height: SERVICE_CARD_SIZE }]}>
              <Image source={cat.image} style={{ width: '100%', height: '100%', borderRadius: Radius.md }} resizeMode="cover" />
            </View>
            <Text style={styles.serviceLabel} numberOfLines={2}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Trust Section - Obsidian Hero Card */}
      <View style={styles.trustSection}>
        <View style={styles.trustHeader}>
          <Ionicons name="shield-checkmark" size={18} color={Colors.accentPrimary} />
          <Text style={styles.trustHeaderMono}>THE CO-OP MODEL</Text>
        </View>
        <Text style={styles.trustTitle}>People you can trust.</Text>
        <Text style={styles.trustSub}>Unlike corporate gig apps, HomeSahay is a worker-owned cooperative where technicians earn fair livelihoods and deliver genuine care.</Text>
        <View style={styles.trustPillars}>
          {[
            { icon: 'checkmark-circle-outline', label: 'Verified Pros', sub: 'Aadhaar verified' },
            { icon: 'wallet-outline', label: 'Zero-Commission', sub: 'Goes directly to worker' },
            { icon: 'document-text-outline', label: 'Transparent Bill', sub: 'Standardized rates' },
            { icon: 'shield-half-outline', label: 'Fair Warranty', sub: 'Co-op protection' }
          ].map((p, i) => (
            <View key={i} style={styles.trustPillar}>
              <View style={styles.trustIconRow}>
                <Ionicons name={p.icon as any} size={16} color={Colors.textInverse} />
                <Text style={styles.trustPillarText}>{p.label}</Text>
              </View>
              <Text style={styles.trustPillarSub}>{p.sub}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Refer Banner */}
      <View style={styles.referBanner}>
        <View style={styles.referHeader}>
          <Text style={styles.referMono}>GROW SOCIETY</Text>
        </View>
        <Text style={styles.referTitle}>Good help is{'\n'}worth sharing.</Text>
        <Text style={styles.referSub}>Give ₹100, get ₹100 in Sahay Cash for your neighborhood.</Text>
        <View style={styles.referCodeBox}>
          <Text style={styles.referCodeMono}>CODE: SAHAY100</Text>
          <TouchableOpacity style={styles.referBtn} activeOpacity={0.85}>
            <Ionicons name="copy-outline" size={14} color={Colors.textInverse} />
            <Text style={styles.referBtnText}>COPY CODE</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  return (
    <View style={styles.mainContainer}>
      <Modal visible={isSearchVisible} animationType="slide" onRequestClose={() => setIsSearchVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsSearchVisible(false)} style={styles.modalBack}>
              <Ionicons name="close" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Search Services</Text>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalInputWrapper}>
              <Ionicons name="search" size={20} color={Colors.textMuted} style={{ marginLeft: Spacing.sm }} />
              <TextInput style={styles.modalInput} placeholder="Describe what needs fixing..." placeholderTextColor={Colors.textMuted} autoFocus value={searchText} onChangeText={setSearchText} onSubmitEditing={() => executeSearch(searchText)} returnKeyType="search" />
            </View>

            <Text style={styles.modalSectionTitle}>Trending</Text>
            <View style={styles.trendingWrap}>
              {TRENDING_SEARCHES.map((term, i) => (
                <TouchableOpacity key={i} style={styles.trendingPill} onPress={() => executeSearch(term)}>
                  <Text style={styles.trendingText}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.aiSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.md }}>
                <Ionicons name="sparkles" size={16} color={Colors.accentPrimary} />
                <Text style={styles.aiSectionTitle}>Ask AI</Text>
              </View>
              <View style={styles.aiPromptsList}>
                {AI_PROMPTS.map((prompt, idx) => (
                  <TouchableOpacity key={idx} style={styles.aiPromptItem} onPress={() => executeSearch(prompt)}>
                    <Text style={styles.aiPromptText}>"{prompt}"</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {showMap || searchResults.length > 0 ? (
        renderSearchResults()
      ) : (
        <>
          <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.canvasLight }}>
            <View style={styles.header}>
              <View style={styles.brandContainer}>
                <Ionicons name="home" size={20} color={Colors.textPrimary} />
                <Text style={styles.brandLogoText}>HomeSahay</Text>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity style={styles.cashBadge} activeOpacity={0.8}>
                  <Text style={{ fontSize: 13 }}>🪙</Text>
                  <Text style={styles.cashAmount}>₹{customer?.sahayCash ?? 200}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.profileBtn} activeOpacity={0.8} onPress={() => router.push('/(customer)/profile')}>
                  <Ionicons name="person" size={16} color={Colors.textInverse} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.locationHeader}>
              <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.locationLabel}>4th Block, JP Nagar</Text>
              <Ionicons name="chevron-down" size={12} color={Colors.textMuted} />
            </View>
            <View style={{ paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm }}>
              <TouchableOpacity style={styles.searchBar} onPress={() => setIsSearchVisible(true)} activeOpacity={0.9}>
                <Ionicons name="sparkles" size={18} color={Colors.accentPrimary} />
                <Text style={styles.searchPlaceholder}>What needs fixing? (e.g. AC repair)</Text>
                <View style={styles.searchMic}>
                  <Ionicons name="mic" size={16} color={Colors.textInverse} />
                </View>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
          {renderHomeFeed()}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: Colors.canvasLight },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingTop: Spacing.xs, backgroundColor: Colors.canvasLight },
  brandContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandLogoText: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, letterSpacing: -0.5 },
  locationHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, gap: 4 },
  locationLabel: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary, textTransform: 'uppercase' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cashBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceLight, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 6, gap: 4, borderWidth: 1, borderColor: Colors.borderLight },
  cashAmount: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary },
  profileBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.surfaceDark, justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceDark, borderRadius: Radius.full, paddingLeft: Spacing.md, paddingRight: 6, paddingVertical: 6, gap: Spacing.sm, ...Shadow.sm },
  searchPlaceholder: { color: Colors.textInverseMuted, fontSize: Typography.fontSize.sm, flex: 1 },
  searchMic: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accentPrimary, justifyContent: 'center', alignItems: 'center' },
  feedScroll: { flex: 1, backgroundColor: Colors.canvasLight },
  feedContent: { paddingBottom: 32 },
  editorialHero: { paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  editorialTitle: { fontSize: Typography.fontSize.displayMobile, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, lineHeight: 44, letterSpacing: -1.5, marginBottom: Spacing.sm },
  editorialSub: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, lineHeight: 20, maxWidth: '85%' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: Spacing.lg },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.borderLight },
  dotActive: { width: 20, backgroundColor: Colors.surfaceDark },
  actionRow: { flexDirection: 'row', paddingHorizontal: Spacing.base, gap: Spacing.sm, marginBottom: Spacing.xl },
  actionCard: { flex: 1, backgroundColor: Colors.surfaceLight, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight, gap: 10 },
  actionCardInstant: { backgroundColor: Colors.surfaceDark, borderColor: Colors.borderDark },
  actionIconWrap: { width: 36, height: 36, borderRadius: Radius.full, backgroundColor: Colors.canvasCream, justifyContent: 'center', alignItems: 'center' },
  actionTitle: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary },
  actionArrow: { color: Colors.textMuted },
  actionSub: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  instantBadge: { backgroundColor: Colors.accentPrimary, flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 4 },
  instantBadgeText: { color: Colors.textOnPrimary, fontSize: 9, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold },
  
  categoryHeader: { paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  sectionMono: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textMuted, letterSpacing: 1, marginBottom: 4 },
  sectionTitle: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, letterSpacing: -0.5 },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.base, gap: 16, marginBottom: Spacing.xl },
  serviceIconBox: { backgroundColor: Colors.canvasCream, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center', marginBottom: 8, overflow: 'hidden', borderWidth: 1, borderColor: Colors.borderLight },
  serviceLabel: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.body, fontWeight: Typography.fontWeight.semibold, color: Colors.textPrimary, textAlign: 'center' },
  
  referBanner: { marginHorizontal: Spacing.base, backgroundColor: Colors.canvasCream, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.borderLight },
  referHeader: { marginBottom: Spacing.sm },
  referMono: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textSecondary, letterSpacing: 1 },
  referTitle: { fontSize: Typography.fontSize['2xl'], fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, lineHeight: 34, letterSpacing: -1, marginBottom: Spacing.xs },
  referSub: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.lg },
  referCodeBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surfaceLight, borderRadius: Radius.full, paddingLeft: Spacing.md, paddingRight: 6, paddingVertical: 6, borderWidth: 1, borderColor: Colors.borderLight },
  referCodeMono: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary },
  referBtn: { backgroundColor: Colors.surfaceDark, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 8 },
  referBtnText: { color: Colors.textInverse, fontWeight: Typography.fontWeight.bold, fontSize: 10, fontFamily: Typography.fontFamily.mono },
  
  trustSection: { marginHorizontal: Spacing.base, backgroundColor: Colors.canvasDark, borderRadius: Radius.lg, padding: Spacing.xl, marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.borderDark },
  trustHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.md },
  trustHeaderMono: { color: Colors.accentPrimary, fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, letterSpacing: 1 },
  trustTitle: { fontSize: Typography.fontSize['2xl'], fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textInverse, letterSpacing: -1, marginBottom: Spacing.sm },
  trustSub: { fontSize: Typography.fontSize.sm, color: Colors.textInverseMuted, lineHeight: 22, marginBottom: Spacing.xl },
  trustPillars: { gap: Spacing.md },
  trustPillar: { backgroundColor: Colors.surfaceInteractive, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderDark },
  trustIconRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  trustPillarText: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.bold, color: Colors.textInverse },
  trustPillarSub: { fontSize: Typography.fontSize.xs, color: Colors.textInverseMuted, marginLeft: 24 },

  modalContainer: { flex: 1, backgroundColor: Colors.canvasLight },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm },
  modalBack: { padding: Spacing.xs, marginRight: Spacing.sm },
  modalTitle: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary },
  modalContent: { flex: 1 },
  modalInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceLight, borderRadius: Radius.full, marginHorizontal: Spacing.base, marginTop: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight },
  modalInput: { flex: 1, paddingVertical: 14, paddingHorizontal: Spacing.sm, fontSize: Typography.fontSize.md, color: Colors.textPrimary, outlineStyle: 'none' },
  modalSectionTitle: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary, paddingHorizontal: Spacing.base, marginTop: Spacing.xl, marginBottom: Spacing.sm },
  trendingWrap: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.base, gap: Spacing.sm },
  trendingPill: { backgroundColor: Colors.surfaceLight, paddingHorizontal: Spacing.md, paddingVertical: 10, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderLight },
  trendingText: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.semibold, color: Colors.textSecondary },
  aiSection: { marginTop: Spacing.xl, backgroundColor: Colors.canvasCream, padding: Spacing.base, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  aiSectionTitle: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary, textTransform: 'uppercase' },
  aiPromptsList: { gap: Spacing.sm },
  aiPromptItem: { backgroundColor: Colors.surfaceLight, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderLight },
  aiPromptText: { fontSize: Typography.fontSize.sm, color: Colors.textPrimary, fontStyle: 'italic' },
  
  resultsContainer: { flex: 1, backgroundColor: Colors.canvasLight },
  resultsHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: Spacing.md, paddingHorizontal: Spacing.base, backgroundColor: Colors.canvasLight, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  backBtn: { marginRight: Spacing.sm },
  resultsTitle: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, letterSpacing: -0.5 },
  viewToggle: { flexDirection: 'row', backgroundColor: Colors.surfaceLight, padding: 4, marginHorizontal: Spacing.base, marginTop: Spacing.md, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderLight },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 6, borderRadius: Radius.full },
  toggleBtnActive: { backgroundColor: Colors.accentPrimary },
  toggleText: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textSecondary, textTransform: 'uppercase' },
  toggleTextActive: { color: Colors.textOnPrimary },
  mapContainer: { flex: 1, marginTop: Spacing.sm },
  map: { flex: 1 },
  sosWrapper: { position: 'absolute', bottom: Spacing.xl, right: Spacing.xl, alignItems: 'center' },
  list: { flex: 1, padding: Spacing.base },
  loadingCard: { backgroundColor: Colors.surfaceLight, padding: Spacing.xl, borderRadius: Radius.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight },
  loadingText: { color: Colors.textSecondary, fontWeight: Typography.fontWeight.semibold },
  emptyCard: { backgroundColor: Colors.surfaceLight, padding: Spacing.xl, borderRadius: Radius.lg, alignItems: 'center', gap: Spacing.sm, borderWidth: 1, borderColor: Colors.borderLight },
  emptyText: { color: Colors.textMuted, fontSize: Typography.fontSize.sm },
  bookBtn: { backgroundColor: Colors.accentPrimary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.md, borderRadius: Radius.full, marginTop: -Spacing.sm, marginBottom: Spacing.base, gap: Spacing.sm, ...Shadow.glow },
  bookBtnText: { color: Colors.textOnPrimary, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.black, fontSize: Typography.fontSize.sm, textTransform: 'uppercase', letterSpacing: 1 },
});
