import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions, Platform } from 'react-native';
import { usePatientsControllerGetClinicalHistory } from '@/src/api/generated/api';
import { COLORS, SPACING, RADIUS } from '@/src/constants/theme';
import { LoadingScreen } from '@/src/components/LoadingScreen';
import type { LatestLabsDto, LabValueDto } from '@/src/api/generated/schemas';

const screenWidth = Dimensions.get('window').width;

function getStatusColor(status?: string): string {
  if (status === 'normal') return COLORS.labNormal;
  if (status === 'alert') return COLORS.labAlert;
  if (status === 'critical') return COLORS.labCritical;
  return COLORS.textMuted;
}

function getStatusLabel(status?: string): string {
  if (status === 'demo') return 'Ejemplo';
  if (status === 'normal') return 'Normal';
  if (status === 'alert') return 'Atención';
  if (status === 'critical') return 'Crítico';
  return '';
}

type ChartKey = 'creatinine' | 'urea' | 'potassium';
const CHART_LABELS: Record<ChartKey, string> = { creatinine: 'Creatinina', urea: 'Urea', potassium: 'Potasio' };

export default function HistoriaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isLoading } = usePatientsControllerGetClinicalHistory();
  const [selectedChart, setSelectedChart] = useState<ChartKey>('creatinine');

  if (isLoading) return <LoadingScreen />;

  const latestLabs = data?.latestLabs as LatestLabsDto | null | undefined;
  const labEvo = data?.labEvolution;
  const chartData = (labEvo as any)?.[selectedChart] as { month: string; value: number }[] | undefined;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + SPACING.xl }}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Mi Historia Clínica</Text>
      </View>

      {/* General Data */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Datos Generales</Text>
        <InfoItem icon="stethoscope" label="Diagnóstico" value={data?.primaryDiagnosis ?? ''} />
        <InfoItem icon="calendar" label="Inicio tratamiento" value={data?.treatmentStartDate ? new Date(data.treatmentStartDate).toLocaleDateString('es-ES') : ''} />
        <InfoItem icon="water" label="Grupo sanguíneo" value={data?.bloodType ?? ''} />
        <InfoItem icon="doctor" label="Médico" value={data?.attendingDoctor ?? ''} />
      </View>

      {/* Latest Labs */}
      {latestLabs && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Última Analítica</Text>
          <Text style={styles.labDate}>{new Date(latestLabs.date).toLocaleDateString('es-ES')}</Text>
          <LabRow label="Creatinina" lab={latestLabs.creatinine} />
          <LabRow label="Urea" lab={latestLabs.urea} />
          <LabRow label="Potasio" lab={latestLabs.potassium} />
          <LabRow label="Fósforo" lab={latestLabs.phosphorus} />
          <LabRow label="Hemoglobina" lab={latestLabs.hemoglobin} />
        </View>
      )}

      {/* Chart */}
      {chartData && (chartData?.length ?? 0) > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Evolución</Text>
          <View style={styles.chartTabs}>
            {(Object.keys(CHART_LABELS) as ChartKey[]).map((key) => (
              <Pressable
                key={key}
                style={[styles.chartTab, selectedChart === key && styles.chartTabActive]}
                onPress={() => setSelectedChart(key)}
              >
                <Text style={[styles.chartTabText, selectedChart === key && styles.chartTabTextActive]}>
                  {CHART_LABELS[key]}
                </Text>
              </Pressable>
            ))}
          </View>
          <LineChart
            data={{
              labels: chartData.map((p) => p?.month ?? ''),
              datasets: [{ data: chartData.map((p) => p?.value ?? 0) }],
            }}
            width={screenWidth - SPACING.md * 4 - SPACING.md * 2}
            height={200}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: COLORS.surface,
              backgroundGradientFrom: COLORS.surface,
              backgroundGradientTo: COLORS.surface,
              decimalPlaces: 1,
              color: () => COLORS.primary,
              labelColor: () => COLORS.textSecondary,
              propsForDots: { r: '5', strokeWidth: '2', stroke: COLORS.primary },
            }}
            bezier
            style={{ borderRadius: RADIUS.sm, marginTop: SPACING.sm }}
          />
        </View>
      )}

      {/* Appointments */}
      {(data?.appointments?.length ?? 0) > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Próximas Citas</Text>
          {(data?.appointments ?? []).map((apt) => (
            <View key={apt?.id ?? Math.random().toString()} style={styles.appointmentRow}>
              <View style={styles.aptDateContainer}>
                <MaterialCommunityIcons name="calendar-clock" size={20} color={COLORS.secondary} />
                <Text style={styles.aptDate}>{apt?.date ? new Date(apt.date).toLocaleDateString('es-ES') : ''}</Text>
                <Text style={styles.aptTime}>{apt?.time ?? ''}</Text>
              </View>
              <Text style={styles.aptType}>{apt?.type ?? ''}</Text>
              <Text style={styles.aptDoctor}>{apt?.doctor ?? ''}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <MaterialCommunityIcons name={icon as any} size={18} color={COLORS.primary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function LabRow({ label, lab }: { label: string; lab?: LabValueDto }) {
  const color = getStatusColor(lab?.status);
  return (
    <View style={styles.labRow}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={styles.labLabel}>{label}</Text>
      <Text style={[styles.labValue, { color }]}>{lab?.value?.toFixed?.(1) ?? '-'} {lab?.unit ?? ''}</Text>
      <Text style={[styles.labStatus, { color }]}>{getStatusLabel(lab?.status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  backButton: { padding: SPACING.xs, marginRight: SPACING.sm },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  card: { backgroundColor: COLORS.surface, marginHorizontal: SPACING.md, marginBottom: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.md, shadowColor: COLORS.cardShadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  infoItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.xs + 2, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel: { fontSize: 13, color: COLORS.textSecondary, marginLeft: SPACING.sm, flex: 1 },
  infoValue: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, maxWidth: '55%', textAlign: 'right' },
  labDate: { fontSize: 13, color: COLORS.textMuted, marginBottom: SPACING.sm },
  labRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.xs + 2, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: SPACING.sm },
  labLabel: { fontSize: 14, color: COLORS.textPrimary, flex: 1 },
  labValue: { fontSize: 14, fontWeight: '600', marginRight: SPACING.sm },
  labStatus: { fontSize: 12, fontWeight: '600', width: 60, textAlign: 'right' },
  chartTabs: { flexDirection: 'row', marginBottom: SPACING.xs },
  chartTab: { paddingHorizontal: SPACING.sm + 2, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, marginRight: SPACING.xs, backgroundColor: COLORS.border },
  chartTabActive: { backgroundColor: COLORS.primary },
  chartTabText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  chartTabTextActive: { color: '#FFF' },
  appointmentRow: { paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  aptDateContainer: { flexDirection: 'row', alignItems: 'center' },
  aptDate: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginLeft: SPACING.xs },
  aptTime: { fontSize: 13, color: COLORS.secondary, marginLeft: SPACING.sm },
  aptType: { fontSize: 14, color: COLORS.textPrimary, marginTop: 2, marginLeft: SPACING.lg + SPACING.xs },
  aptDoctor: { fontSize: 13, color: COLORS.textMuted, marginLeft: SPACING.lg + SPACING.xs },
});
