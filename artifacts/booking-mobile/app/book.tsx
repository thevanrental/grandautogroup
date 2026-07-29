import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import {
  useListServices,
  useCreateAppointment,
} from '@workspace/api-client-react';
import type { Service } from '@workspace/api-client-react';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import * as Haptics from 'expo-haptics';

const IS_WEB = Platform.OS === 'web';

const STEPS = ['Service', 'Vehicle', 'Date & Time', 'Contact'];

// Generate time slots 8 AM – 5 PM
const TIME_SLOTS = Array.from({ length: 10 }, (_, i) => {
  const hour = 8 + i;
  const label = hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`;
  const value = `${String(hour).padStart(2, '0')}:00`;
  return { label, value };
});

/** Format a local Date to YYYY-MM-DD without UTC conversion. */
function toLocalDateString(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Generate next 30 days
function generateDates() {
  const dates: { label: string; short: string; value: string; dayOfWeek: string }[] = [];
  const today = new Date();
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const value = toLocalDateString(d);
    const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short' });
    const short = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    dates.push({ label, short, value, dayOfWeek });
  }
  return dates;
}

const DATES = generateDates();

const COMMON_MAKES = ['Audi', 'BMW', 'Ford', 'Honda', 'Hyundai', 'Kia', 'Mercedes', 'Nissan', 'Toyota', 'Volkswagen'];

interface FormData {
  serviceId: number | null;
  serviceName: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  appointmentDate: string;
  appointmentTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
}

export default function BookScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = makeStyles(colors, insets);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    serviceId: null,
    serviceName: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    appointmentDate: '',
    appointmentTime: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: services, isLoading: servicesLoading } = useListServices();
  const { mutate: createAppointment, isPending: isSubmitting } = useCreateAppointment();

  const update = (key: keyof FormData, value: string | number) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const next = { ...prev }; delete next[key as string]; return next; });
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!form.serviceId) newErrors.serviceId = 'Please select a service';
    } else if (step === 1) {
      if (!form.vehicleMake.trim()) newErrors.vehicleMake = 'Required';
      if (!form.vehicleModel.trim()) newErrors.vehicleModel = 'Required';
      if (!form.vehicleYear.trim()) newErrors.vehicleYear = 'Required';
      else if (!/^\d{4}$/.test(form.vehicleYear)) newErrors.vehicleYear = 'Enter a 4-digit year';
    } else if (step === 2) {
      if (!form.appointmentDate) newErrors.appointmentDate = 'Please select a date';
      if (!form.appointmentTime) newErrors.appointmentTime = 'Please select a time';
    } else if (step === 3) {
      if (!form.customerName.trim()) newErrors.customerName = 'Required';
      if (!form.customerEmail.trim()) newErrors.customerEmail = 'Required';
      else if (!/^\S+@\S+\.\S+$/.test(form.customerEmail)) newErrors.customerEmail = 'Invalid email';
      if (!form.customerPhone.trim()) newErrors.customerPhone = 'Required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    Keyboard.dismiss();
    if (!validateStep()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 0) router.back();
    else setStep(s => s - 1);
  };

  const handleSubmit = () => {
    if (!form.serviceId) return;
    createAppointment(
      {
        data: {
          serviceId: form.serviceId,
          vehicleMake: form.vehicleMake,
          vehicleModel: form.vehicleModel,
          vehicleYear: Number(form.vehicleYear),
          appointmentDate: form.appointmentDate,
          appointmentTime: form.appointmentTime,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          notes: form.notes || undefined,
        },
      },
      {
        onSuccess: (appointment) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace({
            pathname: '/confirmation',
            params: {
              id: String(appointment.id),
              service: appointment.serviceName,
              date: appointment.appointmentDate,
              time: appointment.appointmentTime,
              name: appointment.customerName,
              vehicle: `${appointment.vehicleYear} ${appointment.vehicleMake} ${appointment.vehicleModel}`,
            },
          });
        },
        onError: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert('Booking Failed', 'Something went wrong. Please try again.');
        },
      }
    );
  };

  const topPad = IS_WEB ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} testID="back-btn">
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>BOOK A SERVICE</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepBar}>
        {STEPS.map((label, i) => (
          <React.Fragment key={i}>
            <View style={styles.stepItemWrap}>
              <View style={[styles.stepDot, i <= step ? styles.stepDotActive : {}]}>
                {i < step ? (
                  <Feather name="check" size={12} color={colors.primaryForeground} />
                ) : (
                  <Text style={[styles.stepNum, i === step ? styles.stepNumActive : {}]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, i === step ? styles.stepLabelActive : {}]}>{label}</Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepLine, i < step ? styles.stepLineActive : {}]} />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Step content */}
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bottomOffset={80}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 && (
          <StepService
            services={services}
            isLoading={servicesLoading}
            selectedId={form.serviceId}
            onSelect={(svc) => { update('serviceId', svc.id); update('serviceName', svc.name); }}
            error={errors.serviceId}
            colors={colors}
            styles={styles}
          />
        )}
        {step === 1 && (
          <StepVehicle
            form={form}
            update={update}
            errors={errors}
            colors={colors}
            styles={styles}
          />
        )}
        {step === 2 && (
          <StepDateTime
            form={form}
            update={update}
            errors={errors}
            colors={colors}
            styles={styles}
          />
        )}
        {step === 3 && (
          <StepContact
            form={form}
            update={update}
            errors={errors}
            colors={colors}
            styles={styles}
          />
        )}
      </KeyboardAwareScrollViewCompat>

      {/* Bottom action bar */}
      <View style={[styles.bottomBar, { paddingBottom: IS_WEB ? 34 : insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.nextBtn, isSubmitting && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={isSubmitting}
          testID="next-btn"
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <>
              <Text style={styles.nextBtnText}>
                {step < STEPS.length - 1 ? 'CONTINUE' : 'CONFIRM BOOKING'}
              </Text>
              <Feather name={step < STEPS.length - 1 ? 'arrow-right' : 'check'} size={18} color={colors.primaryForeground} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Step: Service ───────────────────────────────────────────────────────────

interface StepServiceProps {
  services?: Service[];
  isLoading: boolean;
  selectedId: number | null;
  onSelect: (svc: Service) => void;
  error?: string;
  colors: ReturnType<typeof useColors>;
  styles: ReturnType<typeof makeStyles>;
}

function StepService({ services, isLoading, selectedId, onSelect, error, colors, styles }: StepServiceProps) {
  if (isLoading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading services…</Text>
      </View>
    );
  }

  const SERVICE_ICONS: Record<string, string> = {
    default: 'car-wrench',
  };

  return (
    <View>
      <Text style={styles.stepHeading}>CHOOSE A SERVICE</Text>
      <Text style={styles.stepSubheading}>What can we help you with today?</Text>
      {error && <Text style={styles.errorBanner}>{error}</Text>}
      <View style={{ gap: 12 }}>
        {(services ?? []).map((svc) => {
          const isSelected = svc.id === selectedId;
          return (
            <TouchableOpacity
              key={svc.id}
              style={[styles.serviceListCard, isSelected && styles.serviceListCardSelected]}
              onPress={() => {
                Haptics.selectionAsync();
                onSelect(svc);
              }}
              activeOpacity={0.7}
              testID={`service-${svc.id}`}
            >
              <View style={[styles.serviceListIcon, isSelected && styles.serviceListIconSelected]}>
                <MaterialCommunityIcons
                  name="car-wrench"
                  size={24}
                  color={isSelected ? colors.primaryForeground : colors.primary}
                />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={[styles.serviceListName, isSelected && styles.serviceListNameSelected]}>
                  {svc.name}
                </Text>
                <Text style={styles.serviceListDesc} numberOfLines={2}>{svc.description}</Text>
                <View style={styles.serviceListMeta}>
                  <Feather name="clock" size={12} color={colors.mutedForeground} />
                  <Text style={styles.serviceListMetaText}>{svc.durationMinutes} min</Text>
                  <Text style={styles.serviceListMetaDot}>·</Text>
                  <Text style={[styles.serviceListMetaText, { color: colors.primary }]}>{svc.price}</Text>
                </View>
              </View>
              {isSelected && (
                <View style={styles.selectedCheck}>
                  <Feather name="check-circle" size={22} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Step: Vehicle ────────────────────────────────────────────────────────────

interface StepVehicleProps {
  form: FormData;
  update: (k: keyof FormData, v: string) => void;
  errors: Record<string, string>;
  colors: ReturnType<typeof useColors>;
  styles: ReturnType<typeof makeStyles>;
}

function StepVehicle({ form, update, errors, colors, styles }: StepVehicleProps) {
  return (
    <View>
      <Text style={styles.stepHeading}>VEHICLE DETAILS</Text>
      <Text style={styles.stepSubheading}>Tell us about your vehicle.</Text>

      <Text style={styles.fieldLabel}>MAKE</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
        <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 8 }}>
          {COMMON_MAKES.map(make => (
            <TouchableOpacity
              key={make}
              style={[styles.makeChip, form.vehicleMake === make && styles.makeChipSelected]}
              onPress={() => { Haptics.selectionAsync(); update('vehicleMake', make); }}
            >
              <Text style={[styles.makeChipText, form.vehicleMake === make && styles.makeChipTextSelected]}>
                {make}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <FormInput
        value={form.vehicleMake}
        onChange={v => update('vehicleMake', v)}
        placeholder="Or type your make…"
        error={errors.vehicleMake}
        colors={colors}
        styles={styles}
        testID="input-make"
      />

      <Text style={styles.fieldLabel}>MODEL</Text>
      <FormInput
        value={form.vehicleModel}
        onChange={v => update('vehicleModel', v)}
        placeholder="e.g. Corolla, Civic, 3 Series"
        error={errors.vehicleModel}
        colors={colors}
        styles={styles}
        testID="input-model"
      />

      <Text style={styles.fieldLabel}>YEAR</Text>
      <FormInput
        value={form.vehicleYear}
        onChange={v => update('vehicleYear', v)}
        placeholder="e.g. 2022"
        keyboardType="number-pad"
        maxLength={4}
        error={errors.vehicleYear}
        colors={colors}
        styles={styles}
        testID="input-year"
      />
    </View>
  );
}

// ─── Step: Date & Time ────────────────────────────────────────────────────────

interface StepDateTimeProps {
  form: FormData;
  update: (k: keyof FormData, v: string) => void;
  errors: Record<string, string>;
  colors: ReturnType<typeof useColors>;
  styles: ReturnType<typeof makeStyles>;
}

function StepDateTime({ form, update, errors, colors, styles }: StepDateTimeProps) {
  return (
    <View>
      <Text style={styles.stepHeading}>DATE & TIME</Text>
      <Text style={styles.stepSubheading}>Pick a date and time that works for you.</Text>

      <Text style={styles.fieldLabel}>SELECT DATE</Text>
      {errors.appointmentDate && <Text style={styles.fieldError}>{errors.appointmentDate}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', gap: 10, paddingBottom: 4 }}>
          {DATES.map(d => {
            const isSelected = form.appointmentDate === d.value;
            return (
              <TouchableOpacity
                key={d.value}
                style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                onPress={() => { Haptics.selectionAsync(); update('appointmentDate', d.value); }}
                testID={`date-${d.value}`}
              >
                <Text style={[styles.dateDow, isSelected && styles.dateDowSelected]}>{d.dayOfWeek}</Text>
                <Text style={[styles.dateNum, isSelected && styles.dateNumSelected]}>{d.short}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <Text style={styles.fieldLabel}>SELECT TIME</Text>
      {errors.appointmentTime && <Text style={styles.fieldError}>{errors.appointmentTime}</Text>}
      <View style={styles.timeGrid}>
        {TIME_SLOTS.map(slot => {
          const isSelected = form.appointmentTime === slot.value;
          return (
            <TouchableOpacity
              key={slot.value}
              style={[styles.timeChip, isSelected && styles.timeChipSelected]}
              onPress={() => { Haptics.selectionAsync(); update('appointmentTime', slot.value); }}
              testID={`time-${slot.value}`}
            >
              <Text style={[styles.timeChipText, isSelected && styles.timeChipTextSelected]}>
                {slot.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Step: Contact ────────────────────────────────────────────────────────────

interface StepContactProps {
  form: FormData;
  update: (k: keyof FormData, v: string) => void;
  errors: Record<string, string>;
  colors: ReturnType<typeof useColors>;
  styles: ReturnType<typeof makeStyles>;
}

function StepContact({ form, update, errors, colors, styles }: StepContactProps) {
  return (
    <View>
      <Text style={styles.stepHeading}>YOUR DETAILS</Text>
      <Text style={styles.stepSubheading}>How can we reach you?</Text>

      <Text style={styles.fieldLabel}>FULL NAME</Text>
      <FormInput
        value={form.customerName}
        onChange={v => update('customerName', v)}
        placeholder="e.g. Alex Johnson"
        autoComplete="name"
        error={errors.customerName}
        colors={colors}
        styles={styles}
        testID="input-name"
      />

      <Text style={styles.fieldLabel}>EMAIL</Text>
      <FormInput
        value={form.customerEmail}
        onChange={v => update('customerEmail', v)}
        placeholder="your@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={errors.customerEmail}
        colors={colors}
        styles={styles}
        testID="input-email"
      />

      <Text style={styles.fieldLabel}>PHONE</Text>
      <FormInput
        value={form.customerPhone}
        onChange={v => update('customerPhone', v)}
        placeholder="+1 (555) 000-0000"
        keyboardType="phone-pad"
        autoComplete="tel"
        error={errors.customerPhone}
        colors={colors}
        styles={styles}
        testID="input-phone"
      />

      <Text style={styles.fieldLabel}>NOTES (OPTIONAL)</Text>
      <FormInput
        value={form.notes}
        onChange={v => update('notes', v)}
        placeholder="Any special requests or info for our technicians…"
        multiline
        numberOfLines={3}
        colors={colors}
        styles={styles}
        testID="input-notes"
      />
    </View>
  );
}

// ─── Shared: FormInput ────────────────────────────────────────────────────────

interface FormInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'name' | 'email' | 'tel' | 'off';
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  colors: ReturnType<typeof useColors>;
  styles: ReturnType<typeof makeStyles>;
  testID?: string;
}

function FormInput({ value, onChange, placeholder, keyboardType, autoCapitalize, autoComplete, maxLength, multiline, numberOfLines, error, colors, styles, testID }: FormInputProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <TextInput
        style={[
          styles.textInput,
          multiline && styles.textInputMultiline,
          error ? styles.textInputError : {},
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'words'}
        autoComplete={autoComplete}
        maxLength={maxLength}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? 'top' : 'center'}
        testID={testID}
      />
      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(colors: ReturnType<typeof useColors>, insets: ReturnType<typeof useSafeAreaInsets>) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    topTitle: {
      flex: 1,
      textAlign: 'center',
      fontFamily: 'BarlowCondensed_700Bold',
      fontSize: 18,
      letterSpacing: 2,
      color: colors.foreground,
    },
    stepBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 0,
    },
    stepItemWrap: { alignItems: 'center', gap: 4 },
    stepDot: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepDotActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    stepNum: {
      fontFamily: 'BarlowCondensed_700Bold',
      fontSize: 13,
      color: colors.mutedForeground,
    },
    stepNumActive: { color: colors.primaryForeground },
    stepLabel: {
      fontFamily: 'Barlow_400Regular',
      fontSize: 10,
      color: colors.mutedForeground,
      letterSpacing: 0.3,
    },
    stepLabelActive: { color: colors.foreground },
    stepLine: { flex: 1, height: 1.5, backgroundColor: colors.border, marginBottom: 14, marginHorizontal: 4 },
    stepLineActive: { backgroundColor: colors.primary },
    scrollView: { flex: 1 },
    scrollContent: { padding: 24, paddingBottom: 100 },
    loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 200 },
    loadingText: { fontFamily: 'Barlow_400Regular', fontSize: 14, color: colors.mutedForeground },
    stepHeading: {
      fontFamily: 'BarlowCondensed_800ExtraBold',
      fontSize: 28,
      color: colors.foreground,
      letterSpacing: 2,
      marginBottom: 4,
    },
    stepSubheading: {
      fontFamily: 'Barlow_400Regular',
      fontSize: 14,
      color: colors.mutedForeground,
      marginBottom: 24,
    },
    errorBanner: {
      fontFamily: 'Barlow_400Regular',
      fontSize: 13,
      color: colors.destructive,
      marginBottom: 12,
    },
    // Service cards
    serviceListCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      padding: 16,
      gap: 14,
    },
    serviceListCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.card,
    },
    serviceListIcon: {
      width: 48,
      height: 48,
      borderRadius: colors.radius,
      backgroundColor: colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    serviceListIconSelected: { backgroundColor: colors.primary },
    serviceListName: {
      fontFamily: 'BarlowCondensed_700Bold',
      fontSize: 17,
      color: colors.foreground,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    serviceListNameSelected: { color: colors.foreground },
    serviceListDesc: {
      fontFamily: 'Barlow_400Regular',
      fontSize: 13,
      color: colors.mutedForeground,
      lineHeight: 18,
    },
    serviceListMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    serviceListMetaText: { fontFamily: 'Barlow_400Regular', fontSize: 12, color: colors.mutedForeground },
    serviceListMetaDot: { fontFamily: 'Barlow_400Regular', fontSize: 12, color: colors.mutedForeground },
    selectedCheck: { marginLeft: 'auto' },
    // Vehicle
    fieldLabel: {
      fontFamily: 'BarlowCondensed_700Bold',
      fontSize: 12,
      color: colors.primary,
      letterSpacing: 1.5,
      marginBottom: 8,
    },
    makeChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
    },
    makeChipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    makeChipText: {
      fontFamily: 'Barlow_500Medium',
      fontSize: 13,
      color: colors.foreground,
    },
    makeChipTextSelected: { color: colors.primaryForeground },
    // Text inputs
    textInput: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontFamily: 'Barlow_400Regular',
      fontSize: 15,
      color: colors.foreground,
    },
    textInputMultiline: {
      minHeight: 90,
      paddingTop: 12,
    },
    textInputError: { borderColor: colors.destructive },
    fieldError: {
      fontFamily: 'Barlow_400Regular',
      fontSize: 12,
      color: colors.destructive,
      marginTop: 4,
    },
    // Date & Time
    dateCard: {
      width: 64,
      height: 72,
      borderRadius: colors.radius,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    dateCardSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    dateDow: {
      fontFamily: 'BarlowCondensed_700Bold',
      fontSize: 12,
      color: colors.mutedForeground,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    dateDowSelected: { color: 'rgba(255,255,255,0.75)' },
    dateNum: {
      fontFamily: 'Barlow_700Bold',
      fontSize: 13,
      color: colors.foreground,
      textAlign: 'center',
    },
    dateNumSelected: { color: colors.primaryForeground },
    timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    timeChip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
    },
    timeChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    timeChipText: {
      fontFamily: 'Barlow_500Medium',
      fontSize: 14,
      color: colors.foreground,
    },
    timeChipTextSelected: { color: colors.primaryForeground },
    // Bottom bar
    bottomBar: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: 24,
      paddingTop: 12,
      backgroundColor: colors.background,
    },
    nextBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    nextBtnDisabled: { opacity: 0.6 },
    nextBtnText: {
      fontFamily: 'BarlowCondensed_700Bold',
      fontSize: 18,
      color: colors.primaryForeground,
      letterSpacing: 2,
    },
  });
}
