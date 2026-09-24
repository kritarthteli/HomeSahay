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

  const SAVED_ADDRESSES = [
    { id: '1', type: 'Home', address: 'JP Nagar, BLR' },
    { id: '2', type: 'Work', address: 'Indiranagar, BLR' },
    { id: '3', type: 'Parents', address: 'Koramangala, BLR' },
  ];
  const [selectedAddress, setSelectedAddress] = useState(SAVED_ADDRESSES[0]);
  const [isAddressPopupVisible, setIsAddressPopupVisible] = useState(false);

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
    <ScrollView style={styles.feedScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.feedContent} bounces={false} keyboardShouldPersistTaps="handled">
      
      {/* Editorial Hero Area - Dark Section */}
      <View style={[styles.darkHeaderBlock, isSearchVisible && { zIndex: 100 }]}>
        <SafeAreaView edges={['top']} />
        {isSearchVisible && (
          <TouchableOpacity style={styles.fullScreenOverlay} activeOpacity={1} onPress={() => setIsSearchVisible(false)} />
        )}
        
        {/* Top Row: Logo, Profile and Wallet */}
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.accentPrimary, justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
              <Ionicons name="home" size={14} color={Colors.textOnPrimary} />
            </View>
            <Text style={styles.brandLogoTextTop}>HomeSahay</Text>
          </View>
          <TouchableOpacity style={styles.cashBadge} activeOpacity={0.8}>
            <Text style={{ fontSize: 12 }}>🪙</Text>
            <Text style={styles.cashAmount}>₹{customer?.sahayCash ?? 200}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn} activeOpacity={0.8} onPress={() => router.push('/(customer)/profile')}>
            <Ionicons name="person" size={14} color={Colors.textOnPrimary} />
          </TouchableOpacity>
        </View>

        {/* Address */}
        <View style={styles.brandSection}>
          <TouchableOpacity style={styles.addressDropdown} activeOpacity={0.8} onPress={() => setIsAddressPopupVisible(true)}>
            <Ionicons name="navigate" size={12} color={Colors.textInverseMuted} />
            <Text style={styles.locationLabel}>{selectedAddress.address}</Text>
            <Ionicons name="chevron-down" size={12} color={Colors.textInverseMuted} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { zIndex: 101 }]}>
          <View style={styles.searchBar}>
            <Ionicons name="sparkles" size={20} color={Colors.accentPrimary} />
            <TextInput 
              style={styles.searchInput}
              placeholder="What needs fixing? (e.g. AC repair)"
              placeholderTextColor={Colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              onFocus={() => setIsSearchVisible(true)}
              onSubmitEditing={() => executeSearch(searchText)}
              returnKeyType="search"
            />
            {isSearchVisible ? (
              <TouchableOpacity onPress={() => { setIsSearchVisible(false); setSearchText(''); }}>
                <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            ) : (
              <Ionicons name="mic-outline" size={20} color={Colors.textMuted} />
            )}
            <TouchableOpacity style={styles.searchActionBtn} onPress={() => executeSearch(searchText)} activeOpacity={0.8}>
              <Ionicons name="arrow-forward" size={16} color={Colors.textOnPrimary} />
            </TouchableOpacity>
          </View>

          {isSearchVisible && (
            <View style={styles.searchDropdown}>
              <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.dropdownSectionTitle}>Popular Searches</Text>
                <View style={styles.minimalList}>
                  {TRENDING_SEARCHES.map((term, i) => (
                    <TouchableOpacity key={i} style={styles.minimalListItem} onPress={() => executeSearch(term)}>
                      <Ionicons name="trending-up" size={16} color={Colors.textMuted} />
                      <Text style={styles.minimalListText}>{term}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Text style={[styles.dropdownSectionTitle, { marginTop: Spacing.md }]}>Ask AI</Text>
                <View style={styles.minimalList}>
                  {AI_PROMPTS.map((prompt, idx) => (
                    <TouchableOpacity key={idx} style={styles.minimalListItem} onPress={() => executeSearch(prompt)}>
                      <Ionicons name="sparkles" size={16} color={Colors.accentPrimary} />
                      <Text style={styles.minimalListTextAI}>"{prompt}"</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>

        {/* Hero Title */}
        <View style={styles.editorialHero}>
          <Text style={styles.editorialTitle}>Trusted help,{'\n'}right around{'\n'}you.</Text>
        </View>
      </View>

      {/* Quick Actions overlap the dark header slightly */}
      <View style={styles.actionRow}>
        {/* Urgent Help */}
        <TouchableOpacity style={styles.actionCardDark} activeOpacity={0.8} onPress={() => setIsSearchVisible(true)}>
          <View style={styles.actionCardTop}>
            <View style={[styles.actionIconWrap, { backgroundColor: Colors.danger }]}>
              <Ionicons name="flash" size={16} color={Colors.textOnDark} />
            </View>
            <View style={styles.liveBadgeGrey}>
              <Text style={styles.liveBadgeText}>12M</Text>
            </View>
          </View>
          <Text style={styles.actionTitleLight} numberOfLines={1} adjustsFontSizeToFit>Urgent Help</Text>
          <Text style={styles.actionSubMonoLight} numberOfLines={2}>Emergency{'\n'}repairs</Text>
        </TouchableOpacity>
        
        {/* Schedule */}
        <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
          <View style={styles.actionCardTop}>
            <View style={[styles.actionIconWrap, { backgroundColor: Colors.surfaceLight }]}>
              <Ionicons name="calendar" size={16} color={Colors.textPrimary} />
            </View>
            <Text style={styles.slotText}>Slot</Text>
          </View>
          <Text style={styles.actionTitle} numberOfLines={1} adjustsFontSizeToFit>Schedule</Text>
          <Text style={styles.actionSubMono} numberOfLines={2}>Pick day &{'\n'}hour</Text>
        </TouchableOpacity>

        {/* Recurrent */}
        <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
          <View style={styles.actionCardTop}>
            <View style={[styles.actionIconWrap, { backgroundColor: Colors.accentPrimary }]}>
              <Ionicons name="sync" size={16} color={Colors.textOnPrimary} />
            </View>
            <Text style={styles.slotText}>Plan</Text>
          </View>
          <Text style={styles.actionTitle} numberOfLines={1} adjustsFontSizeToFit>Recurrent</Text>
          <Text style={styles.actionSubMono} numberOfLines={2}>Daily, weekly{'\n'}& monthly</Text>
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
          <TouchableOpacity key={cat.id} style={[styles.categoryCard, { width: SERVICE_CARD_SIZE }]} activeOpacity={0.85} onPress={() => handleCategoryPress(cat.id)}>
            <Image source={cat.image} style={styles.categoryImage} resizeMode="cover" />
            <View style={styles.categoryLabelOverlay}>
              <Text style={styles.serviceLabelLight}>{cat.label}</Text>
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
      {showMap || searchResults.length > 0 ? renderSearchResults() : renderHomeFeed()}

      {/* Address Selection Popup */}
      <Modal visible={isAddressPopupVisible} transparent={true} animationType="fade" onRequestClose={() => setIsAddressPopupVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsAddressPopupVisible(false)}>
          <View style={styles.addressPopupBox}>
            <Text style={styles.addressPopupTitle}>Select Address</Text>
            {SAVED_ADDRESSES.map((addr) => (
              <TouchableOpacity 
                key={addr.id} 
                style={[styles.addressItem, selectedAddress.id === addr.id && styles.addressItemActive]} 
                onPress={() => { setSelectedAddress(addr); setIsAddressPopupVisible(false); }}
              >
                <View style={styles.addressItemIcon}>
                  <Ionicons name={addr.type === 'Home' ? 'home' : addr.type === 'Work' ? 'briefcase' : 'people'} size={18} color={selectedAddress.id === addr.id ? Colors.accentPrimary : Colors.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.addressItemType, selectedAddress.id === addr.id && { color: Colors.accentPrimary }]}>{addr.type}</Text>
                  <Text style={styles.addressItemText} numberOfLines={1}>{addr.address}</Text>
                </View>
                {selectedAddress.id === addr.id && <Ionicons name="checkmark" size={20} color={Colors.accentPrimary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: Colors.canvasLight },
  feedScroll: { flex: 1, backgroundColor: Colors.canvasLight },
  feedContent: { paddingBottom: 32 },
  
  // DARK HEADER SECTION
  darkHeaderBlock: { backgroundColor: Colors.canvasDark, paddingBottom: 40, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingTop: Spacing.md, gap: Spacing.sm },
  brandLogoTextTop: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textInverse, letterSpacing: -0.5 },
  profileBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.accentPrimary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.surfaceDark },
  cashBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceInteractive, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 6, gap: 4 },
  cashAmount: { fontSize: 12, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textInverse },
  
  brandSection: { paddingHorizontal: Spacing.base, paddingTop: Spacing.xs, paddingBottom: Spacing.md },
  addressDropdown: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', alignSelf: 'flex-start', paddingVertical: 6, gap: 4, marginTop: 4 },
  locationLabel: { fontSize: 10, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textInverse, textTransform: 'uppercase', letterSpacing: 1 },
  
  searchContainer: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.lg },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceLight, borderRadius: Radius.full, paddingLeft: Spacing.md, paddingRight: 6, paddingVertical: 6, gap: Spacing.sm, ...Shadow.lg },
  searchActionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accentPrimary, justifyContent: 'center', alignItems: 'center' },
  searchPlaceholder: { color: Colors.textMuted, fontSize: Typography.fontSize.sm, flex: 1, fontWeight: Typography.fontWeight.medium },

  editorialHero: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },
  editorialTitle: { fontSize: 44, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textInverse, lineHeight: 46, letterSpacing: -1.5 },
  
  // QUICK ACTIONS
  actionRow: { flexDirection: 'row', paddingHorizontal: Spacing.base, gap: Spacing.sm, marginTop: Spacing.md, zIndex: 10 },
  actionCard: { flex: 1, backgroundColor: Colors.canvasCream, borderRadius: Radius.xl, padding: Spacing.sm, paddingBottom: Spacing.md, ...Shadow.md, borderWidth: 1, borderColor: Colors.borderLight },
  actionCardDark: { flex: 1, backgroundColor: Colors.surfaceDark, borderRadius: Radius.xl, padding: Spacing.sm, paddingBottom: Spacing.md, ...Shadow.md, borderWidth: 1, borderColor: Colors.borderDark },
  actionCardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.sm },
  actionIconWrap: { width: 32, height: 32, borderRadius: Radius.full, justifyContent: 'center', alignItems: 'center' },
  actionTitle: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textPrimary, marginBottom: 2 },
  actionTitleLight: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.black, color: Colors.textInverse, marginBottom: 2 },
  actionSubMono: { fontSize: 9, fontFamily: Typography.fontFamily.mono, color: Colors.textSecondary, lineHeight: 12 },
  actionSubMonoLight: { fontSize: 9, fontFamily: Typography.fontFamily.mono, color: Colors.textInverseMuted, lineHeight: 12 },
  instantBadgeDark: { backgroundColor: Colors.canvasDark, borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 2 },
  instantBadgeTextLight: { color: Colors.textInverse, fontSize: 8, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold },
  liveBadgeGrey: { backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 2 },
  liveBadgeText: { color: Colors.textInverse, fontSize: 8, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold },
  slotText: { color: Colors.textSecondary, fontSize: 9, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, paddingTop: 4 },

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
  categoryCard: { 
    backgroundColor: Colors.canvasDark, 
    borderRadius: Radius.lg, 
    overflow: 'hidden', 
    ...Shadow.sm, 
    height: 200, 
    borderWidth: 1, 
    borderColor: Colors.borderLight 
  },
  categoryImage: { 
    width: '100%', 
    height: '100%',
    opacity: 0.85
  },
  categoryLabelOverlay: { 
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(10,10,10,0.85)',
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  serviceLabelLight: { 
    fontSize: Typography.fontSize.sm, 
    fontFamily: Typography.fontFamily.display, 
    fontWeight: Typography.fontWeight.bold, 
    color: Colors.textInverse,
    letterSpacing: 0.5
  },

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

  // INLINE SEARCH / DROPDOWN
  fullScreenOverlay: { position: 'absolute', top: -1000, bottom: -1000, left: -1000, right: -1000, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 90 },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium, outlineStyle: 'none' },
  searchDropdown: { position: 'absolute', top: 60, left: Spacing.base, right: Spacing.base, backgroundColor: Colors.canvasLight, borderRadius: Radius.xl, padding: Spacing.base, paddingTop: Spacing.sm, borderWidth: 1, borderColor: Colors.borderLight, ...Shadow.lg, zIndex: 102 },
  dropdownSectionTitle: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.mono, fontWeight: Typography.fontWeight.bold, color: Colors.textMuted, marginBottom: Spacing.xs, marginTop: Spacing.xs, textTransform: 'uppercase', letterSpacing: 1 },
  minimalList: { gap: 4 },
  minimalListItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 10, paddingHorizontal: 4 },
  minimalListText: { fontSize: Typography.fontSize.sm, color: Colors.textPrimary },
  minimalListTextAI: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, fontStyle: 'italic' },
  
  
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
  
  // ADDRESS POPUP
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  addressPopupBox: { width: '85%', backgroundColor: Colors.surfaceLight, borderRadius: Radius.xl, padding: Spacing.lg, ...Shadow.lg },
  addressPopupTitle: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily.display, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  addressItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, gap: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  addressItemActive: { backgroundColor: Colors.canvasCream, borderRadius: Radius.md, paddingHorizontal: Spacing.xs, borderBottomWidth: 0 },
  addressItemIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.canvasLight, justifyContent: 'center', alignItems: 'center' },
  addressItemType: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary },
  addressItemText: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary, marginTop: 2 },
});
