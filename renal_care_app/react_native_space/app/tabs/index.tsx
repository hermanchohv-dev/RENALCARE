import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, RefreshControl, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePatientsControllerGetProfile } from '@/src/api/generated/api';
import { COLORS, SPACING, RADIUS, GRADIENT_PRIMARY } from '@/src/constants/theme';
import { LoadingScreen } from '@/src/components/LoadingScreen';
import type { StyleProp, ViewStyle } from 'react-native';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface CardItem {
  label: string;
  icon: IconName;
  color: string;
  route: string;
  modalityFilter?: string;
}

const CARDS: CardItem[] = [
  { label: 'Mi Tratamiento', icon: 'medical-bag', color: COLORS.primary, route: '/tratamiento' },
  { label: 'Mi Historia Clínica', icon: 'file-document-outline', color: COLORS.secondary, route: '/historia' },
  { label: 'Dieta', icon: 'food-apple-outline', color: COLORS.accent, route: '/dieta' },
  { label: 'Mi Ambulancia', icon: 'ambulance', color: COLORS.error, route: '/ambulancia', modalityFilter: 'Hemodiálisis' },
  { label: 'Contacto', icon: 'phone-message', color: COLORS.success, route: '/contacto' },
];

function getModalityColor(modality?: string): string {
  if (modality === 'Hemodiálisis') return COLORS.modalityHD;
  if (modality === 'Diálisis Peritoneal') return COLORS.modalityDP;
  if (modality === 'Trasplante Renal') return COLORS.modalityTX;
  return COLORS.primary;
}

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: profile, isLoading, refetch } = usePatientsControllerGetProfile();
  const [refreshing, setRefreshing] = React.useState(false);
  const cardAnims = useRef(CARDS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (profile) {
      const animations = cardAnims.map((anim, i) =>
        Animated.timing(anim, { toValue: 1, duration: 400, delay: i * 100, useNativeDriver: true })
      );
      Animated.stagger(100, animations).start();
    }
  }, [profile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) return <LoadingScreen />;

  const filteredCards = CARDS.filter(
    (c) => !c.modalityFilter || c.modalityFilter === profile?.modality
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <LinearGradient colors={GRADIENT_PRIMARY} style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <View style={styles.headerContent}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{profile?.avatarInitials ?? '?'}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.greeting}>¡Hola, {profile?.fullName?.split(' ')?.[0] ?? 'Paciente'}!</Text>
            <Text style={styles.recordNumber}>Nº Historia: {profile?.medicalRecordNumber ?? ''}</Text>
          </View>
        </View>
        <View style={[styles.modalityBadge, { backgroundColor: getModalityColor(profile?.modality) }]}>
          <Text style={styles.modalityText}>{profile?.modality ?? ''}</Text>
        </View>
        <Text style={styles.ageText}>{profile?.age ?? ''} años</Text>
      </LinearGradient>

      <View style={styles.cardsGrid}>
        {filteredCards.map((card, index) => (
          <Animated.View
            key={card.route}
            style={[
              styles.cardWrapper,
              { opacity: cardAnims[index] ?? 1, transform: [{ translateY: (cardAnims[index] ?? new Animated.Value(1)).interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] },
            ]}
          >
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => router.push(card.route as any)}
            >
              <View style={[styles.cardIconContainer, { backgroundColor: card.color + '15' }]}>
                <MaterialCommunityIcons name={card.icon} size={32} color={card.color} />
              </View>
              <Text style={styles.cardLabel}>{card.label}</Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, borderBottomLeftRadius: RADIUS.xl, borderBottomRightRadius: RADIUS.xl },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  headerInfo: { marginLeft: SPACING.md, flex: 1 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#FFF' },
  recordNumber: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  modalityBadge: { alignSelf: 'flex-start', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, marginTop: SPACING.sm },
  modalityText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  ageText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: SPACING.xs },
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: SPACING.md, justifyContent: 'space-between' },
  cardWrapper: { width: '48%', marginBottom: SPACING.md },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center', shadowColor: COLORS.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, minHeight: 130, justifyContent: 'center' },
  cardPressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },
  cardIconContainer: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  cardLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'center' },
});
