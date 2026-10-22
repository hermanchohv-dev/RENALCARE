import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IS_DEMO } from '@/src/api/customFetch';
import { useAuth } from '@/src/contexts/AuthContext';
import { COLORS, SPACING, RADIUS, GRADIENT_PRIMARY } from '@/src/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const DEMO_ACCOUNTS = [
  { label: 'Herman (Hemodiálisis)', email: 'herman@demo.com', password: 'demo123', color: COLORS.modalityHD },
  { label: 'María (Diálisis Peritoneal)', email: 'maria@demo.com', password: 'demo123', color: COLORS.modalityDP },
  { label: 'Carlos (Trasplante Renal)', email: 'carlos@demo.com', password: 'demo123', color: COLORS.modalityTX },
];

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: string, p?: string) => {
    const loginEmail = e ?? email;
    const loginPassword = p ?? password;
    if (!loginEmail || !loginPassword) {
      setError('Por favor, completa todos los campos');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40 }]} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={styles.topBackButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
        </Pressable>

        <View style={styles.logoSection}>
          <MaterialCommunityIcons name="heart-pulse" size={48} color={COLORS.primary} />
          <Text style={styles.logoText}>RENAL-CARE</Text>
        </View>

        <Text style={styles.heading}>{IS_DEMO ? 'Seleccionar perfil ficticio' : 'Iniciar Sesión'}</Text>

        <View style={styles.card}>
          {!!error && (
            <View style={styles.errorBanner}>
              <MaterialCommunityIcons name="alert-circle" size={18} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="email-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.textMuted} />
            </Pressable>
          </View>

          <Pressable onPress={() => handleLogin()} disabled={loading} style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}>
            <LinearGradient colors={GRADIENT_PRIMARY} style={styles.gradientButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.loginButtonText}>{IS_DEMO ? 'Seleccionar perfil ficticio' : 'Iniciar Sesión'}</Text>}
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.demoSection}>
          <View style={styles.demoBadge}>
            <Text style={styles.demoBadgeText}>{IS_DEMO ? 'Demo sin conexión · Datos ficticios' : 'Versión Demo'}</Text>
          </View>
          <Text style={styles.demoLabel}>Acceso rápido:</Text>
          {DEMO_ACCOUNTS.map((acc) => (
            <Pressable
              key={acc.email}
              style={({ pressed }) => [styles.demoButton, { borderColor: acc.color }, pressed && { opacity: 0.7 }]}
              onPress={() => handleLogin(acc.email, acc.password)}
              disabled={loading}
            >
              <Text style={[styles.demoButtonText, { color: acc.color }]}>Acceder como {acc.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.footer}>Hospital Universitario San Pedro de Logroño</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, padding: SPACING.lg, alignItems: 'center' },
  topBackButton: { alignSelf: 'flex-start', padding: SPACING.xs, marginBottom: SPACING.md },
  logoSection: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  logoText: { fontSize: 24, fontWeight: '800', color: COLORS.primary, marginLeft: SPACING.sm, letterSpacing: 1 },
  heading: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.lg },
  card: { width: '100%', maxWidth: 400, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, shadowColor: COLORS.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: RADIUS.sm, padding: SPACING.sm, marginBottom: SPACING.md },
  errorText: { color: COLORS.error, fontSize: 14, marginLeft: SPACING.xs, flex: 1 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, marginBottom: SPACING.md, paddingHorizontal: SPACING.sm },
  inputIcon: { marginRight: SPACING.xs },
  input: { flex: 1, height: 48, fontSize: 16, color: COLORS.textPrimary },
  eyeButton: { padding: SPACING.xs },
  loginButton: { marginTop: SPACING.sm, borderRadius: RADIUS.md, overflow: 'hidden' },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  gradientButton: { height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: RADIUS.md },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  demoSection: { width: '100%', maxWidth: 400, marginTop: SPACING.xl, alignItems: 'center' },
  demoBadge: { backgroundColor: COLORS.accent, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, marginBottom: SPACING.md },
  demoBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  demoLabel: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  demoButton: { width: '100%', borderWidth: 1.5, borderRadius: RADIUS.md, paddingVertical: SPACING.sm + 4, paddingHorizontal: SPACING.md, marginBottom: SPACING.sm, alignItems: 'center', backgroundColor: COLORS.surface },
  demoButtonText: { fontSize: 14, fontWeight: '600' },
  footer: { marginTop: SPACING.xl, fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
});
