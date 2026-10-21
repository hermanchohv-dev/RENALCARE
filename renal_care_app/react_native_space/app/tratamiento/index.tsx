import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePatientsControllerGetTreatment } from '@/src/api/generated/api';
import { COLORS, SPACING, RADIUS } from '@/src/constants/theme';
import { LoadingScreen } from '@/src/components/LoadingScreen';
import type { HemodialysisDto, PeritonealDialysisDto, TransplantDto } from '@/src/api/generated/schemas';

export default function TratamientoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isLoading } = usePatientsControllerGetTreatment();

  if (isLoading) return <LoadingScreen />;

  const modality = data?.modality ?? '';
  const hd = data?.hemodialysis as HemodialysisDto | null | undefined;
  const pd = data?.peritonealDialysis as PeritonealDialysisDto | null | undefined;
  const tx = data?.transplant as TransplantDto | null | undefined;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + SPACING.xl }}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Mi Tratamiento</Text>
      </View>

      <View style={[styles.modalityBadge, { backgroundColor: modality === 'Hemodiálisis' ? COLORS.modalityHD : modality === 'Diálisis Peritoneal' ? COLORS.modalityDP : COLORS.modalityTX }]}>
        <Text style={styles.modalityText}>{modality}</Text>
      </View>

      {/* Hemodiálisis */}
      {hd && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📅 Horario de Sesiones</Text>
            {(hd.schedule ?? []).map((s, i) => (
              <View key={i} style={styles.scheduleRow}>
                <Text style={styles.scheduleDay}>{s?.day ?? ''}</Text>
                <Text style={styles.scheduleTime}>{s?.time ?? ''}</Text>
              </View>
            ))}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⏱️ Duración</Text>
            <Text style={styles.cardValue}>{hd.sessionDuration ?? ''}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🩸 Acceso Vascular</Text>
            <InfoRow label="Tipo" value={hd.vascularAccess?.type ?? ''} />
            <InfoRow label="Localización" value={hd.vascularAccess?.location ?? ''} />
            <InfoRow label="Fecha colocación" value={hd.vascularAccess?.datePlaced ? new Date(hd.vascularAccess.datePlaced).toLocaleDateString('es-ES') : ''} />
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⚖️ Peso Seco Objetivo</Text>
            <Text style={styles.cardValue}>{hd.dryWeight ?? ''}</Text>
          </View>
        </>
      )}

      {/* Diálisis Peritoneal */}
      {pd && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tipo de Diálisis</Text>
            <Text style={styles.cardValue}>{pd.type ?? ''}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Esquema de Intercambios</Text>
            {(pd.exchanges ?? []).map((ex, i) => (
              <View key={i} style={styles.exchangeRow}>
                <Text style={styles.exchangeTime}>{ex?.time ?? ''}</Text>
                <Text style={styles.exchangeDetail}>{ex?.volume ?? ''} • {ex?.dwellTime ?? ''}</Text>
              </View>
            ))}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Soluciones</Text>
            {(pd.solutions ?? []).map((sol, i) => (
              <View key={i} style={styles.solutionRow}>
                <MaterialCommunityIcons name="flask-outline" size={16} color={COLORS.primary} />
                <Text style={styles.solutionText}>{sol ?? ''}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Trasplante */}
      {tx && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Datos del Trasplante</Text>
            <InfoRow label="Fecha" value={tx.transplantDate ? new Date(tx.transplantDate).toLocaleDateString('es-ES') : ''} />
            <InfoRow label="Donante" value={tx.donorType ?? ''} />
            <InfoRow label="Próxima revisión" value={tx.nextReview ? new Date(tx.nextReview).toLocaleDateString('es-ES') : ''} />
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💊 Medicación Inmunosupresora</Text>
            {(tx.medications ?? []).map((med, i) => (
              <View key={i} style={styles.medRow}>
                <Text style={styles.medName}>{med?.name ?? ''}</Text>
                <Text style={styles.medDetail}>{med?.dose ?? ''} • {med?.frequency ?? ''}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  backButton: { padding: SPACING.xs, marginRight: SPACING.sm },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  modalityBadge: { alignSelf: 'flex-start', marginLeft: SPACING.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, marginBottom: SPACING.md },
  modalityText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  card: { backgroundColor: COLORS.surface, marginHorizontal: SPACING.md, marginBottom: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.md, shadowColor: COLORS.cardShadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  cardValue: { fontSize: 18, fontWeight: '600', color: COLORS.primary },
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.xs + 2, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  scheduleDay: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  scheduleTime: { fontSize: 15, color: COLORS.secondary, fontWeight: '600' },
  exchangeRow: { paddingVertical: SPACING.xs + 2, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  exchangeTime: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  exchangeDetail: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  solutionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.xs + 2 },
  solutionText: { fontSize: 14, color: COLORS.textPrimary, marginLeft: SPACING.sm },
  medRow: { paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  medName: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  medDetail: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.xs + 2, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
});
