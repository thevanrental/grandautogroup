import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import * as Haptics from 'expo-haptics';

const IS_WEB = Platform.OS === 'web';

export default function ConfirmationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const params = useLocalSearchParams<{
    id: string;
    service: string;
    date: string;
    time: string;
    name: string;
    vehicle: string;
  }>();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h < 12 ? 'AM' : 'PM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const topPad = IS_WEB ? 67 : insets.top;
  const botPad = IS_WEB ? 34 : insets.bottom;
  const styles = makeStyles(colors);

  return (
    <View style={[styles.root, { paddingTop: topPad + 24, paddingBottom: botPad + 24 }]}>
      {/* Success icon */}
      <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconOuter}>
          <View style={styles.iconInner}>
            <Feather name="check" size={40} color={colors.primaryForeground} />
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.title}>BOOKING{'\n'}CONFIRMED</Text>
        <View style={styles.accentLine} />
        <Text style={styles.subtitle}>
          We'll see you soon, {params.name?.split(' ')[0] ?? 'there'}!
        </Text>

        {/* Booking card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="car-wrench" size={18} color={colors.primary} />
            <Text style={styles.cardHeaderText}>APPOINTMENT #{params.id}</Text>
          </View>

          {[
            { icon: 'tool', label: 'Service', value: params.service },
            { icon: 'truck', label: 'Vehicle', value: params.vehicle },
            { icon: 'calendar', label: 'Date', value: formatDate(params.date ?? '') },
            { icon: 'clock', label: 'Time', value: formatTime(params.time ?? '') },
          ].map((item, i) => (
            <View key={i} style={[styles.detailRow, i < 3 && styles.detailRowBorder]}>
              <Feather name={item.icon as any} size={14} color={colors.primary} style={styles.detailIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.note}>
          A confirmation has been added to our system. Our team will be in touch if anything changes.
        </Text>
      </Animated.View>

      {/* Done button */}
      <Animated.View style={[styles.doneWrap, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.replace('/');
          }}
          activeOpacity={0.85}
          testID="done-btn"
        >
          <Text style={styles.doneBtnText}>BACK TO HOME</Text>
          <Feather name="home" size={18} color={colors.primaryForeground} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bookAgainBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.replace('/book');
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.bookAgainText}>Book Another Service</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    iconWrap: {
      marginBottom: 28,
    },
    iconOuter: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: `${colors.primary}20`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconInner: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      width: '100%',
      alignItems: 'center',
    },
    title: {
      fontFamily: 'BarlowCondensed_800ExtraBold',
      fontSize: 42,
      color: colors.foreground,
      letterSpacing: 4,
      textAlign: 'center',
      lineHeight: 46,
    },
    accentLine: {
      width: 48,
      height: 3,
      backgroundColor: colors.primary,
      marginVertical: 14,
    },
    subtitle: {
      fontFamily: 'Barlow_400Regular',
      fontSize: 15,
      color: colors.mutedForeground,
      textAlign: 'center',
      marginBottom: 24,
    },
    card: {
      width: '100%',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      overflow: 'hidden',
      marginBottom: 20,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.secondary,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    cardHeaderText: {
      fontFamily: 'BarlowCondensed_700Bold',
      fontSize: 14,
      color: colors.primary,
      letterSpacing: 1.5,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    detailRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    detailIcon: {
      marginTop: 2,
    },
    detailLabel: {
      fontFamily: 'BarlowCondensed_700Bold',
      fontSize: 11,
      color: colors.mutedForeground,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    detailValue: {
      fontFamily: 'Barlow_500Medium',
      fontSize: 15,
      color: colors.foreground,
    },
    note: {
      fontFamily: 'Barlow_400Regular',
      fontSize: 13,
      color: colors.mutedForeground,
      textAlign: 'center',
      lineHeight: 19,
      marginBottom: 32,
    },
    doneWrap: {
      width: '100%',
      marginTop: 'auto',
      gap: 12,
    },
    doneBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    doneBtnText: {
      fontFamily: 'BarlowCondensed_700Bold',
      fontSize: 18,
      color: colors.primaryForeground,
      letterSpacing: 2,
    },
    bookAgainBtn: {
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bookAgainText: {
      fontFamily: 'Barlow_400Regular',
      fontSize: 14,
      color: colors.mutedForeground,
      textDecorationLine: 'underline',
    },
  });
}
