import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Platform, Linking, useWindowDimensions, Easing } from 'react-native';
import { AppIcon as MaterialCommunityIcons } from '@/src/components/AppIcon';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePatientsControllerGetAmbulance } from '@/src/api/generated/api';
import { COLORS, SPACING, RADIUS } from '@/src/constants/theme';
import { IS_DEMO } from '@/src/api/customFetch';
import { LoadingScreen } from '@/src/components/LoadingScreen';

// Todas las transformaciones del marcador deben compartir el mismo motor.
const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const CENTRO_LOGRONO = { lat: 42.4627, lng: -2.4450 };
const RANGO_MAPA = { lat: 0.015, lng: 0.025 };

function getStatusLabel(status?: string): string {
  if (status === 'en_camino') return 'En camino';
  if (status === 'llegando') return 'Llegando';
  if (status === 'en_hospital') return 'En el hospital';
  return 'No disponible';
}

function getStatusColor(status?: string): string {
  if (status === 'en_camino') return COLORS.accent;
  if (status === 'llegando') return COLORS.warning;
  if (status === 'en_hospital') return COLORS.success;
  return COLORS.textMuted;
}

export default function AmbulanciaScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/tabs');
  };
  const insets = useSafeAreaInsets();
  const { data, isLoading } = usePatientsControllerGetAmbulance();
  const [simulating, setSimulating] = useState(false);
  const [simulationRun, setSimulationRun] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [eta, setEta] = useState(15);
  const [currentStatus, setCurrentStatus] = useState('en_camino');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ambulanceAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const waypoints = useMemo(() => (data?.waypoints ?? []).filter(
    point => Number.isFinite(point.lat) && Number.isFinite(point.lng)
  ), [data?.waypoints]);
  const hospitalLoc = data?.hospitalLocation;

  const mapWidth = screenWidth - SPACING.md * 2;
  const mapHeight = 280;

  const normalizeCoord = useCallback((lat: number, lng: number) => {
    const minLat = CENTRO_LOGRONO.lat - RANGO_MAPA.lat / 2;
    const maxLat = CENTRO_LOGRONO.lat + RANGO_MAPA.lat / 2;
    const minLng = CENTRO_LOGRONO.lng - RANGO_MAPA.lng / 2;
    const maxLng = CENTRO_LOGRONO.lng + RANGO_MAPA.lng / 2;

    const safeLat = Math.min(maxLat, Math.max(minLat, lat));
    const safeLng = Math.min(maxLng, Math.max(minLng, lng));

    return {
      x: ((safeLng - minLng) / (maxLng - minLng)) * (mapWidth - 40) + 20,
      y: ((maxLat - safeLat) / (maxLat - minLat)) * (mapHeight - 40) + 20,
    };
  }, [mapWidth]);

  useEffect(() => {
    if (!data?.available) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: USE_NATIVE_DRIVER }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim, data?.available]);

  useEffect(() => {
    const startCoord = waypoints[0] ?? data?.ambulanceLocation ?? CENTRO_LOGRONO;
    const startPos = normalizeCoord(startCoord?.lat ?? CENTRO_LOGRONO.lat, startCoord?.lng ?? CENTRO_LOGRONO.lng);
    ambulanceAnim.setValue({ x: startPos.x - 16, y: startPos.y - 16 });
  }, [data?.ambulanceLocation, waypoints, normalizeCoord, ambulanceAnim]);

  useEffect(() => {
    if (simulationRun === 0 || !data?.available || waypoints.length < 2) return;
    const startPos = normalizeCoord(waypoints[0].lat, waypoints[0].lng);
    ambulanceAnim.setValue({ x: startPos.x - 16, y: startPos.y - 16 });
    setCurrentStep(0);
    setEta((waypoints.length - 1) * 3);
    setSimulating(true);

    let isCancelled = false;

    const animateToNextPoint = (stepIndex: number) => {
      if (isCancelled) return;

      if (stepIndex >= waypoints.length - 1) {
        setCurrentStatus('en_hospital');
        setEta(0);
        setSimulating(false);
        return;
      }

      const nextPoint = waypoints[stepIndex + 1];
      const nextPos = normalizeCoord(nextPoint?.lat ?? CENTRO_LOGRONO.lat, nextPoint?.lng ?? CENTRO_LOGRONO.lng);

      Animated.parallel([
        Animated.timing(ambulanceAnim.x, {
          toValue: nextPos.x - 16,
          duration: 1800,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(ambulanceAnim.y, {
          toValue: nextPos.y - 16,
          duration: 1800,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start(({ finished }) => {
        if (!finished || isCancelled) return;

        const nextStep = stepIndex + 1;
        setCurrentStep(nextStep);

        const remaining = waypoints.length - 1 - nextStep;
        setEta(Math.max(0, remaining * 3));

        if (remaining <= 1 && remaining > 0) {
          setCurrentStatus('llegando');
        }

        if (nextStep >= waypoints.length - 1) {
          setCurrentStatus('en_hospital');
          setEta(0);
          setSimulating(false);
          return;
        }

        animateToNextPoint(nextStep);
      });
    };

    setCurrentStatus('en_camino');
    animateToNextPoint(0);

    return () => {
      isCancelled = true;
      ambulanceAnim.stopAnimation();
    };
  }, [simulationRun, data?.available, waypoints, normalizeCoord, ambulanceAnim]);

  if (isLoading) return <LoadingScreen />;

  if (!data?.available) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}> 
        <View style={styles.headerRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={goBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>{IS_DEMO ? 'Ambulancia · Simulación' : 'Mi Ambulancia'}</Text>
        </View>
        <View style={styles.unavailableContainer}>
          <MaterialCommunityIcons name="ambulance" size={64} color={COLORS.textMuted} />
          <Text style={styles.unavailableText}>Este servicio solo está disponible para pacientes en Hemodiálisis</Text>
          <Pressable style={styles.backBtn} onPress={goBack}>
            <Text style={styles.backBtnText}>Volver</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const startSimulation = () => {
    // Un identificador nuevo cancela el recorrido anterior antes de reiniciarlo.
    // No dejar callbacks requestAnimationFrame pendientes al salir de la pantalla.
    setSimulationRun(run => run + 1);
  };

  const openMaps = () => {
    const lat = hospitalLoc?.lat ?? CENTRO_LOGRONO.lat;
    const lng = hospitalLoc?.lng ?? CENTRO_LOGRONO.lng;
    const url = Platform.select({
      ios: `maps:0,0?q=Hospital+San+Pedro@${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(Hospital+San+Pedro+Logroño)`,
      default: `https://www.google.com/maps?q=${lat},${lng}`,
    }) ?? `https://www.google.com/maps?q=${lat},${lng}`;
    Linking.openURL(url);
  };

  const statusColor = getStatusColor(currentStatus);
  const hospitalPos = normalizeCoord(hospitalLoc?.lat ?? CENTRO_LOGRONO.lat, hospitalLoc?.lng ?? CENTRO_LOGRONO.lng);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + SPACING.xl }}>
      <View style={styles.headerRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={goBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{IS_DEMO ? 'Ambulancia · Simulación' : 'Mi Ambulancia'}</Text>
      </View>

      {/* Visualización de ruta centrada en Logroño */}
      <View style={[styles.mapContainer, { width: mapWidth, height: mapHeight }]}> 
        <View style={[styles.mapBg, { width: mapWidth, height: mapHeight }]}> 
          {/* Puntos de la ruta */}
          {waypoints.map((wp, i) => {
            const pos = normalizeCoord(wp?.lat ?? 0, wp?.lng ?? 0);
            return (
              <View
                key={i}
                style={[styles.routeDot, { left: pos.x - 3, top: pos.y - 3, backgroundColor: i <= currentStep ? COLORS.primary : COLORS.border }]}
              />
            );
          })}

          {/* Líneas de la ruta */}
          {waypoints.map((wp, i) => {
            if (i === 0) return null;
            const prev = normalizeCoord(waypoints[i - 1]?.lat ?? 0, waypoints[i - 1]?.lng ?? 0);
            const curr = normalizeCoord(wp?.lat ?? 0, wp?.lng ?? 0);
            const dx = curr.x - prev.x;
            const dy = curr.y - prev.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
              <View
                key={`line${i}`}
                style={[
                  styles.routeLine,
                  {
                    left: prev.x,
                    top: prev.y - 1,
                    width: len,
                    transform: [{ rotate: `${angle}deg` }],
                    transformOrigin: 'left center',
                    backgroundColor: i <= currentStep ? COLORS.primary : COLORS.border,
                  },
                ]}
              />
            );
          })}

          {/* Marcador del hospital */}
          <View style={[styles.hospitalMarker, { left: hospitalPos.x - 16, top: hospitalPos.y - 16 }]}> 
            <MaterialCommunityIcons name="hospital-marker" size={32} color={COLORS.error} />
          </View>

          {/* Pulso y desplazamiento usan el mismo motor en cada plataforma. */}
          <Animated.View
            testID="ambulance-marker"
            style={[
              styles.ambulanceMarker,
              {
                transform: [{ translateX: ambulanceAnim.x }, { translateY: ambulanceAnim.y }, { scale: pulseAnim }],
              },
            ]}
          >
            <MaterialCommunityIcons name="ambulance" size={32} color={COLORS.primary} />
          </Animated.View>

          {/* Leyenda */}
          <View style={styles.mapLegend}>
            <Text style={styles.legendText}>🏥 H.U. San Pedro · Logroño</Text>
          </View>
        </View>
      </View>

      {/* Panel de información */}
      <View style={styles.infoPanel}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{getStatusLabel(currentStatus)}</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="clock-outline" size={24} color={COLORS.primary} />
            <Text style={styles.infoValue}>{eta} min</Text>
            <Text style={styles.infoLabel}>Tiempo estimado</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="map-marker-distance" size={24} color={COLORS.primary} />
            <Text style={styles.infoValue}>{data?.distanceKm?.toFixed?.(1) ?? '0'} km</Text>
            <Text style={styles.infoLabel}>Distancia</Text>
          </View>
        </View>

        {waypoints.length >= 2 && (
          <Pressable style={({ pressed }) => [styles.simulateButton, pressed && { opacity: 0.8 }]} onPress={startSimulation}>
            <MaterialCommunityIcons name="play-circle" size={20} color="#FFF" />
            <Text style={styles.simulateButtonText}>{simulating ? 'Reiniciar recorrido' : currentStatus === 'en_hospital' ? 'Repetir simulación' : 'Simular recorrido'}</Text>
          </Pressable>
        )}

        {waypoints.length < 2 && <Text style={styles.unavailableText}>Ruta no disponible para la simulación.</Text>}

        {currentStatus === 'en_hospital' && (
          <View style={styles.arrivedBanner}>
            <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.success} />
            <Text style={styles.arrivedText}>¡La ambulancia ha llegado!</Text>
          </View>
        )}

        {!IS_DEMO && <Pressable style={styles.mapsLink} onPress={openMaps}>
          <MaterialCommunityIcons name="google-maps" size={20} color={COLORS.secondary} />
          <Text style={styles.mapsLinkText}>Abrir en Google Maps</Text>
        </Pressable>}

        <Text style={styles.addressText}>Simulación ilustrativa. No representa un transporte real.</Text>
        <Text style={styles.addressText}>Calle Piqueras 98, 26006 Logroño, La Rioja</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  backButton: { padding: SPACING.xs, marginRight: SPACING.sm },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  unavailableContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  unavailableText: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.md, lineHeight: 22 },
  backBtn: { marginTop: SPACING.lg, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.md },
  backBtnText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
  mapContainer: { marginHorizontal: SPACING.md, borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.md },
  mapBg: { backgroundColor: '#E8F4FD', borderRadius: RADIUS.lg, position: 'relative' },
  routeDot: { position: 'absolute', width: 6, height: 6, borderRadius: 3 },
  routeLine: { position: 'absolute', height: 2 },
  hospitalMarker: { position: 'absolute' },
  ambulanceMarker: { position: 'absolute' },
  mapLegend: { position: 'absolute', bottom: SPACING.sm, right: SPACING.sm, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: RADIUS.sm },
  legendText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  infoPanel: { backgroundColor: COLORS.surface, marginHorizontal: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.lg, shadowColor: COLORS.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: SPACING.sm },
  statusText: { fontSize: 18, fontWeight: '700' },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.lg },
  infoItem: { alignItems: 'center' },
  infoValue: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginTop: SPACING.xs },
  infoLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  simulateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: SPACING.sm + 4, borderRadius: RADIUS.md, marginBottom: SPACING.md },
  simulateButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600', marginLeft: SPACING.sm },
  arrivedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F5E9', paddingVertical: SPACING.sm, borderRadius: RADIUS.md, marginBottom: SPACING.md },
  arrivedText: { fontSize: 16, fontWeight: '600', color: COLORS.success, marginLeft: SPACING.sm },
  mapsLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.sm },
  mapsLinkText: { color: COLORS.secondary, fontSize: 14, fontWeight: '600', marginLeft: SPACING.xs },
  addressText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xs },
});