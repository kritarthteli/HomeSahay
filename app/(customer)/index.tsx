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
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.resultsTitle}>
          {parsedIntent?.service_category ? `${parsedIntent.service_category} nearby` : 'Search Results'}
        </Text>
      </View>

      <View style={styles.viewToggle}>
        <TouchableOpacity style={[styles.toggleBtn, showMap && styles.toggleBtnActive]} onPress={() => setShowMap(true)}>
          <Ionicons name="map-outline" size={16} color={showMap ? Colors.textInverse : Colors.textSecondary} />
          <Text style={[styles.toggleText, showMap && styles.toggleTextActive]}>MAP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleBtn, !showMap && styles.toggleBtnActive]} onPress={() => setShowMap(false)}>
          <Ionicons name="list-outline" size={16} color={!showMap ? Colors.textInverse : Colors.textSecondary} />
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
            {searchLoading && (
              <View style={styles.loadingCard}>
                <Ionicons name="sparkles" size={24} color={Colors.accentPrimary} />
                <Text style={styles.loadingText}>Curating experts...</Text>
              </View>
            )}
            {!searchLoading && searchResults.length === 0 && (
              <View style={styles.emptyCard}>
                <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyText}>No specialists found right now.</Text>
              </View>
            )}
            {searchResults.map((w: any) => (
              <View key={w.id}>
                <WorkerCard worker={w} selected={selectedWorker?.id === w.id} onSelect={setSelectedWorker} />
                {selectedWorker?.id === w.id && (
                  <TouchableOpacity style={styles.bookBtn} onPress={() => handleBook(w)} disabled={bookingLoading} activeOpacity={0.8}>
                    <Text style={styles.bookBtnText}>{bookingLoading ? 'CONFIRMING...' : `HIRE ${w.name.split(' ')[0]} • ₹${w.pricePerHour}/HR`}</Text>
                    <Ionicons name="arrow-forward" size={18} color={Colors.textOnPrimary} />
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
  const SERVICE_CARD_SIZE = (width - Spacing.base * 2 - CARD_GAP) / 2;

  const renderHomeFeed = () => (
    <ScrollView style={styles.feedScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.feedContent} bounces={false}>
      
      {/* Editorial Hero Area - Dark Section */}
      <View style={styles.darkHeaderBlock}>
        <SafeAreaView edges={['top']} />
        
        {/* Top Nav */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <Text style={styles.brandLogoText}>HomeSahay</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.locationHeader}>
              <Ionicons name="location-sharp" size={12} color={Colors.textInverseMuted} />
              <Text style={styles.locationLabel}>JP Nagar, BLR</Text>
            </View>
            <TouchableOpacity style={styles.cashBadge} activeOpacity={0.8}>
              <Text style={{ fontSize: 12 }}>🪙</Text>
              <Text style={styles.cashAmount}>₹{customer?.sahayCash ?? 200}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileBtn} activeOpacity={0.8} onPress={() => router.push('/(customer)/profile')}>
              <Ionicons name="person" size={14} color={Colors.textOnPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Title */}
        <View style={styles.editorialHero}>
          <Text style={styles.editorialTitle}>Trusted help,{'\n'}right around{'\n'}you.</Text>
          
          {/* AI Search Pill */}
          <TouchableOpacity style={styles.searchBar} onPress={() => setIsSearchVisible(true)} activeOpacity={0.9}>
            <View style={styles.searchMic}>
              <Ionicons name="sparkles" size={18} color={Colors.textOnPrimary} />
            </View>
            <Text style={styles.searchPlaceholder}>What needs fixing? (e.g. AC repair)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions overlap the dark header slightly */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
          <View style={styles.actionIconWrap}>
            <Ionicons name="calendar" size={20} color={Colors.textPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Schedule</Text>
            <Text style={styles.actionSub}>Pick any time</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionCard, styles.actionCardSOS]} activeOpacity={0.8} onPress={() => setIsSearchVisible(true)}>
          <View style={[styles.actionIconWrap, { backgroundColor: Colors.dangerTint }]}>
            <Ionicons name="flash" size={20} color={Colors.danger} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.actionTitle, { color: Colors.danger }]}>SOS</Text>
              <View style={styles.instantBadge}>
                <Text style={styles.instantBadgeText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.actionSub}>Under 15 mins</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Promotions Carousel */}
      <View style={styles.carouselSection}>
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
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        />
        <View style={styles.dotsRow}>
          {CAROUSEL_SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeSlide && styles.dotActive]} />
          ))}
        </View>
      </View>

      {/* Image-Led Categories */}
      <View style={styles.categoryHeader}>
        <Text style={styles.sectionTitle}>Curated Categories</Text>
        <Text style={styles.sectionMono}>BROWSE THE COLLECTIVE</Text>
      </View>
      <View style={styles.serviceGrid}>
        {HOME_CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat.id} style={[styles.categoryCard, { width: SERVICE_CARD_SIZE }]} activeOpacity={0.75} onPress={() => handleCategoryPress(cat.id)}>
            <Image source={cat.image} style={styles.categoryImage} resizeMode="cover" />
            <View style={styles.categoryLabelBox}>
              <Text style={styles.serviceLabel}>{cat.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Trust Section - Obsidian Hero Card */}
      <View style={styles.trustSection}>
        <View style={styles.trustHeader}>
          <Ionicons name="shield-checkmark" size={24} color={Colors.accentPrimary} />
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
                <Ionicons name={p.icon as any} size={20} color={Colors.accentPrimary} />
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
            <Ionicons name="copy-outline" size={14} color={Colors.textOnPrimary} />
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

      {showMap || searchResults.length > 0 ? renderSearchResults() : renderHomeFeed()}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: Colors.canvasLight },
  feedScroll: { flex: 1, backgroundColor: Colors.canvasLight },
  feedContent: { paddingBottom: 32 },
  
  // DARK HEADER SECTION
  darkHeaderBlock: { backgroundColor: Colors.canvasDark, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingTop: Spacing.xs },
  brandContainer: { flexDirection: 'row', alignItems: 'center' },
  brandLogoText: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textInverse, letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  locationHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceInteractive, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, gap: 4 },
  locationLabel: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textInverse, textTransform: 'uppercase' },
  cashBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceInteractive, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 6, gap: 4 },
  cashAmount: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textInverse },
  profileBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.accentPrimary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.surfaceDark },
  
  editorialHero: { paddingHorizontal: Spacing.base, paddingTop: Spacing.xl, paddingBottom: Spacing.xl },
  editorialTitle: { fontSize: 44, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textInverse, lineHeight: 46, letterSpacing: -1.5, marginBottom: Spacing.xl },
  
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceLight, borderRadius: Radius.full, paddingLeft: Spacing.sm, paddingRight: Spacing.base, paddingVertical: Spacing.xs, gap: Spacing.sm, ...Shadow.lg },
  searchMic: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.canvasDark, justifyContent: 'center', alignItems: 'center' },
  searchPlaceholder: { color: Colors.textMuted, fontSize: Typography.fontSize.md, flex: 1, fontWeight: Typography.fontWeight.medium },

  // QUICK ACTIONS
  actionRow: { flexDirection: 'row', paddingHorizontal: Spacing.base, gap: Spacing.sm, marginTop: -20, zIndex: 10 },
  actionCard: { flex: 1, backgroundColor: Colors.surfaceLight, borderRadius: Radius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12, ...Shadow.md },
  actionCardSOS: { backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: Colors.dangerTint },
  actionIconWrap: { width: 48, height: 48, borderRadius: Radius.full, backgroundColor: Colors.canvasCream, justifyContent: 'center', alignItems: 'center' },
  actionTitle: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary },
  actionSub: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  instantBadge: { backgroundColor: Colors.danger, flexDirection: 'row', alignItems: 'center', borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 2 },
  instantBadgeText: { color: Colors.textOnDark, fontSize: 9, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold },

  // CAROUSEL
  carouselSection: { marginTop: Spacing.xl },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: Spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.borderLight },
  dotActive: { width: 20, backgroundColor: Colors.surfaceDark },

  // CATEGORIES
  categoryHeader: { paddingHorizontal: Spacing.base, marginTop: Spacing.xl, marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.fontSize['2xl'], fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, letterSpacing: -1 },
  sectionMono: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textMuted, letterSpacing: 1, marginTop: 4 },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.base, gap: 16, marginBottom: Spacing.xl },
  categoryCard: { backgroundColor: Colors.surfaceLight, borderRadius: Radius.lg, overflow: 'hidden', ...Shadow.sm, height: 140, borderWidth: 1, borderColor: Colors.borderLight },
  categoryImage: { width: '100%', height: '70%', backgroundColor: Colors.canvasCream },
  categoryLabelBox: { height: '30%', justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surfaceLight },
  serviceLabel: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary },

  // TRUST SECTION
  trustSection: { marginHorizontal: Spacing.base, backgroundColor: Colors.canvasDark, borderRadius: Radius['2xl'], padding: Spacing.xl, marginBottom: Spacing.xl, ...Shadow.md },
  trustHeader: { marginBottom: Spacing.md },
  trustTitle: { fontSize: Typography.fontSize['2xl'], fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textInverse, letterSpacing: -1, marginBottom: Spacing.sm },
  trustSub: { fontSize: Typography.fontSize.sm, color: Colors.textInverseMuted, lineHeight: 22, marginBottom: Spacing.xl },
  trustPillars: { gap: Spacing.md },
  trustPillar: { backgroundColor: Colors.surfaceInteractive, borderRadius: Radius.lg, padding: Spacing.md },
  trustIconRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  trustPillarText: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.textInverse },
  trustPillarSub: { fontSize: Typography.fontSize.xs, color: Colors.textInverseMuted, marginLeft: 30 },

  // REFERRAL
  referBanner: { marginHorizontal: Spacing.base, backgroundColor: Colors.accentPrimary, borderRadius: Radius['2xl'], padding: Spacing.xl, marginBottom: Spacing.xl, ...Shadow.glow },
  referHeader: { marginBottom: Spacing.sm },
  referMono: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textOnPrimary, letterSpacing: 1 },
  referTitle: { fontSize: Typography.fontSize['3xl'], fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textOnPrimary, lineHeight: 40, letterSpacing: -1.5, marginBottom: Spacing.xs },
  referSub: { fontSize: Typography.fontSize.sm, color: Colors.textOnPrimary, opacity: 0.8, marginBottom: Spacing.lg },
  referCodeBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surfaceLight, borderRadius: Radius.full, paddingLeft: Spacing.md, paddingRight: 6, paddingVertical: 6 },
  referCodeMono: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary },
  referBtn: { backgroundColor: Colors.canvasDark, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 10 },
  referBtnText: { color: Colors.textOnDark, fontWeight: Typography.fontWeight.bold, fontSize: 12, fontFamily: Typography.fontFamily.mono },

  // MODAL / SEARCH
  modalContainer: { flex: 1, backgroundColor: Colors.canvasLight },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm },
  modalBack: { padding: Spacing.xs, marginRight: Spacing.sm },
  modalTitle: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary },
  modalContent: { flex: 1 },
  modalInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceLight, borderRadius: Radius.full, marginHorizontal: Spacing.base, marginTop: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.sm },
  modalInput: { flex: 1, paddingVertical: 16, paddingHorizontal: Spacing.sm, fontSize: Typography.fontSize.md, color: Colors.textPrimary, outlineStyle: 'none' },
  modalSectionTitle: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary, paddingHorizontal: Spacing.base, marginTop: Spacing.xl, marginBottom: Spacing.sm },
  trendingWrap: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.base, gap: Spacing.sm },
  trendingPill: { backgroundColor: Colors.surfaceLight, paddingHorizontal: Spacing.md, paddingVertical: 12, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderLight },
  trendingText: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary },
  aiSection: { marginTop: Spacing.xl, backgroundColor: Colors.canvasDark, padding: Spacing.xl, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, flex: 1 },
  aiSectionTitle: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.accentPrimary, textTransform: 'uppercase' },
  aiPromptsList: { gap: Spacing.sm },
  aiPromptItem: { backgroundColor: Colors.surfaceInteractive, padding: Spacing.md, borderRadius: Radius.lg },
  aiPromptText: { fontSize: Typography.fontSize.sm, color: Colors.textInverse, fontStyle: 'italic' },
  
  // MAP RESULTS
  resultsContainer: { flex: 1, backgroundColor: Colors.canvasLight },
  resultsHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: Spacing.md, paddingHorizontal: Spacing.base, backgroundColor: Colors.canvasLight },
  backBtn: { marginRight: Spacing.md, width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceLight, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight },
  resultsTitle: { fontSize: Typography.fontSize['2xl'], fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, letterSpacing: -1 },
  viewToggle: { flexDirection: 'row', backgroundColor: Colors.surfaceLight, padding: 4, marginHorizontal: Spacing.base, marginTop: Spacing.xs, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderLight },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 6, borderRadius: Radius.full },
  toggleBtnActive: { backgroundColor: Colors.canvasDark },
  toggleText: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textSecondary, textTransform: 'uppercase' },
  toggleTextActive: { color: Colors.textInverse },
  mapContainer: { flex: 1, marginTop: Spacing.sm },
  map: { flex: 1, borderRadius: Radius.xl, marginHorizontal: Spacing.base, marginBottom: Spacing.base, overflow: 'hidden' },
  sosWrapper: { position: 'absolute', bottom: Spacing.xl, right: Spacing.xl, alignItems: 'center' },
  list: { flex: 1, padding: Spacing.base },
  loadingCard: { backgroundColor: Colors.surfaceLight, padding: Spacing['2xl'], borderRadius: Radius.xl, alignItems: 'center', gap: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight },
  loadingText: { color: Colors.textPrimary, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.bold, fontSize: Typography.fontSize.lg },
  emptyCard: { backgroundColor: Colors.canvasCream, padding: Spacing['2xl'], borderRadius: Radius.xl, alignItems: 'center', gap: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight },
  emptyText: { color: Colors.textSecondary, fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.mono },
  bookBtn: { backgroundColor: Colors.accentPrimary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: 20, borderRadius: Radius.full, marginTop: -Spacing.lg, marginBottom: Spacing.xl, ...Shadow.glow },
  bookBtnText: { color: Colors.textOnPrimary, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, fontSize: Typography.fontSize.xl, letterSpacing: -0.5 },
});
