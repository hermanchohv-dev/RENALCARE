import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon as MaterialCommunityIcons } from '@/src/components/AppIcon';
import { KidneyMark } from '@/src/components/KidneyMark';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { GRADIENT_SPLASH, SPACING } from '@/src/constants/theme';
import { LoadingScreen } from '@/src/components/LoadingScreen';

export default function SplashScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const chevronAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(chevronAnim, { toValue: -10, duration: 600, useNativeDriver: true }),
        Animated.timing(chevronAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (isLoading) return <LoadingScreen />;

  const handleEnter = () => {
    if (isAuthenticated) {
      router.replace('/tabs');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <LinearGradient colors={GRADIENT_SPLASH} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.kidneyIconWrapper}>
          <KidneyMark />
        </View>
        <Text style={styles.title}>RENAL-CARE</Text>
        <Text style={styles.subtitle}>Hospital Universitario{"\n"}San Pedro de Logroño</Text>
        <Image source={require('../assets/riojasalud-logo.png')} style={styles.riojasaludLogo} resizeMode="contain" />
      </Animated.View>

      <Pressable onPress={handleEnter} style={styles.enterButton}>
        <Animated.View style={[styles.chevronContainer, { transform: [{ translateY: chevronAnim }] }]}>
          <MaterialCommunityIcons name="chevron-up" size={32} color="rgba(255,255,255,0.8)" />
        </Animated.View>
        <Text style={styles.enterText}>Entrar</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 60 },
  kidneyIconWrapper: { marginBottom: SPACING.xs },
  title: { fontSize: 36, fontWeight: '800', color: '#FFFFFF', marginTop: SPACING.md, letterSpacing: 2 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.85)', marginTop: SPACING.sm, textAlign: 'center', lineHeight: 22 },
  riojasaludLogo: { width: 180, height: 64, marginTop: SPACING.lg },
  enterButton: { position: 'absolute', bottom: 80, alignItems: 'center' },
  chevronContainer: { marginBottom: SPACING.xs },
  enterText: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600' },
});
