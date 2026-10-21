import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Switch, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePatientsControllerGetProfile } from '@/src/api/generated/api';
import { useAuth } from '@/src/contexts/AuthContext';
import { COLORS, SPACING, RADIUS } from '@/src/constants/theme';
import { LoadingScreen } from '@/src/components/LoadingScreen';

export default function ProfileScreen() {
  const { logout, user } = useAuth();
  const insets = useSafeAreaInsets();
  const { data: profile, isLoading } = usePatientsControllerGetProfile();
  const [medReminder, setMedReminder] = useState(true);
  const [aptReminder, setAptReminder] = useState(true);
  const [dietReminder, setDietReminder] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const prefs = await AsyncStorage.getItem('notification_prefs');
        if (prefs) {
          const p = JSON.parse(prefs);
          setMedReminder(p?.medReminder ?? true);
          setAptReminder(p?.aptReminder ?? true);
          setDietReminder(p?.dietReminder ?? false);
        }
      } catch {}
    })();
  }, []);

  const savePrefs = async (key: string, value: boolean) => {
    const newPrefs = { medReminder, aptReminder, dietReminder, [key]: value };
    await AsyncStorage.setItem('notification_prefs', JSON.stringify(newPrefs));
  };

  if (isLoading) return <LoadingScreen />;

  const initials = profile?.avatarInitials ?? '?';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top + SPACING.lg, paddingBottom: insets.bottom + SPACING.xl }}>
      <View style={styles.headerSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{profile?.fullName ?? ''}</Text>
        <Text style={styles.email}>{user?.email ?? ''}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Mis Datos</Text>
        <InfoRow label="Nombre" value={profile?.fullName ?? ''} />
        <InfoRow label="Email" value={user?.email ?? ''} />
        <InfoRow label="Modalidad" value={profile?.modality ?? ''} />
        <InfoRow label="Nº Historia" value={profile?.medicalRecordNumber ?? ''} />
        <InfoRow label="Grupo Sanguíneo" value={profile?.bloodType ?? ''} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        <ToggleRow label="Recordatorio de medicación" value={medReminder} onToggle={(v) => { setMedReminder(v); savePrefs('medReminder', v); }} />
        <ToggleRow label="Recordatorio de citas" value={aptReminder} onToggle={(v) => { setAptReminder(v); savePrefs('aptReminder', v); }} />
        <ToggleRow label="Consejos de dieta" value={dietReminder} onToggle={(v) => { setDietReminder(v); savePrefs('dietReminder', v); }} />
        <Text style={styles.caption}>Los recordatorios son simulados en esta versión demo</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Información</Text>
        <InfoRow label="Versión" value="RENAL-CARE Demo v1.0" />
        <InfoRow label="Hospital" value="H.U. San Pedro de Logroño" />
      </View>

      <Pressable style={({ pressed }) => [styles.logoutButton, pressed && { opacity: 0.8 }]} onPress={logout}>
        <MaterialCommunityIcons name="logout" size={20} color={COLORS.error} />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </Pressable>
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

function ToggleRow({ label, value, onToggle }: { label: string; value: boolean; onToggle: (v: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }} thumbColor={value ? COLORS.primary : '#f4f3f4'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerSection: { alignItems: 'center', marginBottom: SPACING.lg },
  avatarCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#FFF' },
  name: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  email: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  card: { backgroundColor: COLORS.surface, marginHorizontal: SPACING.md, marginBottom: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.md, shadowColor: COLORS.cardShadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, maxWidth: '60%', textAlign: 'right' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm },
  toggleLabel: { fontSize: 14, color: COLORS.textPrimary, flex: 1 },
  caption: { fontSize: 12, color: COLORS.textMuted, marginTop: SPACING.xs, fontStyle: 'italic' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: SPACING.md, marginTop: SPACING.sm, paddingVertical: SPACING.sm + 4, borderWidth: 1.5, borderColor: COLORS.error, borderRadius: RADIUS.md, backgroundColor: COLORS.surface },
  logoutText: { color: COLORS.error, fontSize: 16, fontWeight: '600', marginLeft: SPACING.sm },
});
