import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePatientsControllerGetDiet } from '@/src/api/generated/api';
import { COLORS, SPACING, RADIUS } from '@/src/constants/theme';
import { LoadingScreen } from '@/src/components/LoadingScreen';

export default function DietaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isLoading } = usePatientsControllerGetDiet();
  const [expandedMineral, setExpandedMineral] = useState<string | null>(null);

  if (isLoading) return <LoadingScreen />;

  const toggleMineral = (key: string) => {
    setExpandedMineral(expandedMineral === key ? null : key);
  };

  const mineralSections = [
    { key: 'potassium', label: 'Potasio', icon: '⚡', data: data?.minerals?.potassium },
    { key: 'phosphorus', label: 'Fósforo', icon: '🧪', data: data?.minerals?.phosphorus },
    { key: 'sodium', label: 'Sodio', icon: '🧂', data: data?.minerals?.sodium },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + SPACING.xl }}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Mi Dieta</Text>
      </View>

      {/* Headline */}
      <View style={styles.card}>
        <Text style={styles.headlineTitle}>Recomendaciones para {data?.modality ?? ''}</Text>
        <Text style={styles.headlineText}>{data?.headline ?? ''}</Text>
      </View>

      {/* Fluid */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💧 Restricción de Líquidos</Text>
        <Text style={styles.limitText}>Límite diario: {data?.fluidRestriction?.dailyLimit ?? ''}</Text>
        {(data?.fluidRestriction?.tips ?? []).map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <MaterialCommunityIcons name="lightbulb-outline" size={16} color={COLORS.accent} />
            <Text style={styles.tipText}>{tip ?? ''}</Text>
          </View>
        ))}
      </View>

      {/* Recommended Foods */}
      <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: COLORS.success }]}>
        <Text style={styles.cardTitle}>✅ Alimentos Recomendados</Text>
        {(data?.recommendedFoods ?? []).map((food, i) => (
          <View key={i} style={styles.foodRow}>
            <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.success} />
            <Text style={styles.foodText}>{food ?? ''}</Text>
          </View>
        ))}
      </View>

      {/* Foods to Avoid */}
      <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: COLORS.error }]}>
        <Text style={styles.cardTitle}>❌ Alimentos a Evitar</Text>
        {(data?.foodsToAvoid ?? []).map((food, i) => (
          <View key={i} style={styles.foodRow}>
            <MaterialCommunityIcons name="close-circle" size={16} color={COLORS.error} />
            <Text style={styles.foodText}>{food ?? ''}</Text>
          </View>
        ))}
      </View>

      {/* Mineral Sections */}
      {mineralSections.map((section) => (
        <View key={section.key} style={styles.card}>
          <Pressable style={styles.mineralHeader} onPress={() => toggleMineral(section.key)}>
            <Text style={styles.cardTitle}>{section.icon} {section.label}</Text>
            <MaterialCommunityIcons
              name={expandedMineral === section.key ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={COLORS.textMuted}
            />
          </Pressable>
          {section.data && <Text style={styles.limitText}>Límite: {section.data.limit ?? ''}</Text>}
          {expandedMineral === section.key && section.data && (
            <>
              {(section.data.tips ?? []).map((tip, i) => (
                <View key={`t${i}`} style={styles.tipRow}>
                  <MaterialCommunityIcons name="information-outline" size={14} color={COLORS.secondary} />
                  <Text style={styles.tipText}>{tip ?? ''}</Text>
                </View>
              ))}
              {(section.data.foodExamples?.length ?? 0) > 0 && (
                <View style={styles.examplesContainer}>
                  <Text style={styles.examplesTitle}>Alimentos a controlar:</Text>
                  {(section.data.foodExamples ?? []).map((ex, i) => (
                    <Text key={i} style={styles.exampleItem}>• {ex ?? ''}</Text>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      ))}

      {/* Practical Tips */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💡 Consejos Prácticos</Text>
        {(data?.practicalTips ?? []).map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <Text style={styles.tipNumber}>{i + 1}</Text>
            <Text style={styles.tipText}>{tip ?? ''}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  backButton: { padding: SPACING.xs, marginRight: SPACING.sm },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  card: { backgroundColor: COLORS.surface, marginHorizontal: SPACING.md, marginBottom: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.md, shadowColor: COLORS.cardShadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  headlineTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginBottom: SPACING.xs },
  headlineText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  limitText: { fontSize: 14, fontWeight: '600', color: COLORS.secondary, marginBottom: SPACING.sm },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: SPACING.xs },
  tipText: { fontSize: 14, color: COLORS.textPrimary, marginLeft: SPACING.sm, flex: 1, lineHeight: 20 },
  tipNumber: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.primary, color: '#FFF', textAlign: 'center', lineHeight: 20, fontSize: 12, fontWeight: '700', overflow: 'hidden' },
  foodRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: SPACING.xs },
  foodText: { fontSize: 14, color: COLORS.textPrimary, marginLeft: SPACING.sm, flex: 1, lineHeight: 20 },
  mineralHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  examplesContainer: { marginTop: SPACING.sm, paddingLeft: SPACING.sm },
  examplesTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.xs },
  exampleItem: { fontSize: 13, color: COLORS.textPrimary, lineHeight: 20 },
});
