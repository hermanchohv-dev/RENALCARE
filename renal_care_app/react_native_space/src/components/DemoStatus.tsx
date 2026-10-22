import React, { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View, StyleSheet } from 'react-native';
import { IS_DEMO } from '../api/customFetch';

export function DemoStatus() {
  const [status, setStatus] = useState('Preparando uso sin conexión…');
  const [help, setHelp] = useState(false);
  useEffect(() => {
    if (!IS_DEMO || Platform.OS !== 'web') return;
    if (!('serviceWorker' in navigator) || !window.isSecureContext) {
      setStatus('Instalación sin conexión requiere HTTPS');
      return;
    }
    let disposed = false;
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then(() => navigator.serviceWorker.ready)
      .then(() => { if (!disposed) setStatus('Disponible sin conexión'); })
      .catch(() => { if (!disposed) setStatus('No se pudo preparar: conecta y vuelve a abrir'); });
    return () => { disposed = true; };
  }, []);
  if (!IS_DEMO) return null;
  return <View style={styles.banner}>
    <Pressable onPress={() => setHelp(v => !v)} accessibilityRole="button" accessibilityLabel="Instrucciones de instalación de la demo">
      <Text style={styles.title}>DEMO · Datos ficticios · Sin atención médica</Text>
      <Text style={styles.subtitle}>{Platform.OS === 'web' ? status + ' · Cómo instalar' : 'Datos locales de demostración'}</Text>
    </Pressable>
    {help && <Text style={styles.help}>
      En Safari: Compartir → Añadir a pantalla de inicio. Abre el icono una vez con internet y espera «Disponible sin conexión».
      Después puedes usar modo avión. No introduzcas datos personales ni consultas reales. Los avisos y la ambulancia son simulados.
      iOS puede borrar el almacenamiento; si ocurre, abre de nuevo con internet.
    </Text>}
  </View>;
}
const styles = StyleSheet.create({
  banner: { backgroundColor: '#e4f5ef', padding: 10, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: '#8bbbad' },
  title: { color: '#154c40', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: '#154c40', fontSize: 12, marginTop: 3, textAlign: 'center' },
  help: { color: '#154c40', fontSize: 13, paddingTop: 8, lineHeight: 19 },
});
