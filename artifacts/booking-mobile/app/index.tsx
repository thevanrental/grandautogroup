import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useListServices } from '@workspace/api-client-react';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const IS_WEB = Platform.OS === 'web';

const SERVICES_PREVIEW = [
  { icon: 'oil', label: 'Oil Change' },
  { icon: 'car-wrench', label: 'Full Service' },
  { icon: 'tire', label: 'Tyre Check' },
  { icon: 'car-battery', label: 'Battery' },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { data: services } = useListServices();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBook = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/book');
  };

  const styles = makeStyles(colors, insets);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.logoRow}>
            <View style={styles.redBar} />
            <Text style={styles.brandName}>GRAND AUTO</Text>
          </View>
          <Text style={styles.brandSub}>GROUP</Text>
          <Text style={styles.tagline}>
            Book your next service in minutes.
          </Text>
        </Animated.View>

        {/* Hero accent */}
        <Animated.View
          style={[styles.heroAccent, { opacity: fadeAnim }]}
        >
          <View style={styles.redDiag} />
          <MaterialCommunityIcons
            name="car-wrench"
            size={72}
            color={colors.primary}
            style={styles.heroIcon}
          />
        </Animated.View>

        {/* Services grid */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.sectionTitle}>OUR SERVICES</Text>
          <View style={styles.servicesGrid}>
            {(services ?? SERVICES_PREVIEW.map((s, i) => ({
              id: i,
              name: s.label,
              description: '',
              durationMinutes: 60,
              price: '',
              _preview: true,
              icon: s.icon,
            }))).slice(0, 4).map((svc, idx) => (
              <TouchableOpacity
                key={svc.id ?? idx}
                style={styles.serviceCard}
                onPress={handleBook}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={SERVICES_PREVIEW[idx % SERVICES_PREVIEW.length].icon as any}
                  size={28}
                  color={colors.primary}
                />
                <Text style={styles.serviceCardName} numberOfLines={2}>
                  {svc.name}
                </Text>
                {(svc as any).price ? (
                  <Text style={styles.serviceCardPrice}>{(svc as any).price}</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Why us */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim },
          ]}
        >
          <Text style={styles.sectionTitle}>WHY CHOOSE US</Text>
          {[
            { icon: 'clock-outline', text: 'Fast, same-day bookings available' },
            { icon: 'shield-check-outline', text: 'Certified technicians, quality guaranteed' },
            { icon: 'map-marker-outline', text: 'Multiple locations across the region' },
          ].map((item, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIconBox}>
                <MaterialCommunityIcons name={item.icon as any} size={20} color={colors.primary} />
              </View>
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          ))}
        </Animated.View>

        <View style={styles.ctaSpacerBottom} />
      </ScrollView>

      {/* Sticky Book Button */}
      <View style={[styles.stickyBar, { paddingBottom: IS_WEB ? 34 : insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.bookBtn} onPress={handleBook} activeOpacity={0.85}>
          <Feather name="calendar" size={18} color={colors.primaryForeground} />
          <Text style={styles.bookBtnText}>BOOK A SERVICE</Text>
          <Feather name="arrow-right" size={18} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>, insets: ReturnType<typeof useSafeAreaInsets>) {
  const topPad = IS_WEB ? 67 : insets.top;
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingTop: topPad + 24,
      paddingBottom: 120,
    },
    header: {
      paddingHorizontal: 24,
      marginBottom: 8,
    },
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 0,
    },
    redBar: {
      width: 4,
      height: 36,
      backgroundColor: colors.primary,
    },
    brandName: {
      fontFamily: 'BarlowCondensed_800ExtraBold',
      fontSize: 48,
      color: colors.foreground,
      letterSpacing: 4,
      lineHeight: 48,
    },
    brandSub: {
      fontFamily: 'BarlowCondensed_800ExtraBold',
      fontSize: 48,
      color: colors.primary,
      letterSpacing: 4,
      lineHeight: 44,
      paddingLeft: 14,
      marginBottom: 12,
    },
    tagline: {
      fontFamily: 'Barlow_400Regular',
      fontSize: 15,
      color: colors.mutedForeground,
      letterSpacing: 0.3,
    },
    heroAccent: {
      height: 160,
      marginVertical: 24,
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    redDiag: {
      position: 'absolute',
      left: -40,
      top: -40,
      width: 200,
      height: 200,
      backgroundColor: colors.primary,
      opacity: 0.08,
      transform: [{ rotate: '35deg' }],
    },
    heroIcon: {
      opacity: 0.9,
    },
    section: {
      paddingHorizontal: 24,
      marginBottom: 32,
    },
    sectionTitle: {
      fontFamily: 'BarlowCondensed_700Bold',
      fontSize: 13,
      color: colors.primary,
      letterSpacing: 2,
      marginBottom: 16,
    },
    servicesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    serviceCard: {
      width: (width - 48 - 12) / 2,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      padding: 16,
      gap: 8,
    },
    serviceCardName: {
      fontFamily: 'BarlowCondensed_700Bold',
      fontSize: 16,
      color: colors.foreground,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    serviceCardPrice: {
      fontFamily: 'Barlow_600SemiBold',
      fontSize: 13,
      color: colors.primary,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 14,
    },
    featureIconBox: {
      width: 36,
      height: 36,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      alignItems: 'center',
      justifyContent: 'center',
    },
    featureText: {
      fontFamily: 'Barlow_400Regular',
      fontSize: 14,
      color: colors.foreground,
      flex: 1,
    },
    ctaSpacerBottom: {
      height: 20,
    },
    stickyBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 24,
      paddingTop: 12,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    bookBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    bookBtnText: {
      fontFamily: 'BarlowCondensed_700Bold',
      fontSize: 18,
      color: colors.primaryForeground,
      letterSpacing: 2,
    },
  });
}
