import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform, Modal, ActivityIndicator } from 'react-native';
import { AppIcon as MaterialCommunityIcons } from '@/src/components/AppIcon';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useContactControllerCreate, useContactControllerList } from '@/src/api/generated/api';
import { COLORS, SPACING, RADIUS, GRADIENT_PRIMARY } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { IS_DEMO } from '@/src/api/customFetch';
import { LoadingScreen } from '@/src/components/LoadingScreen';

export default function ContactoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: messagesData, isLoading: loadingMessages, refetch } = useContactControllerList();
  const createMutation = useContactControllerCreate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!subject?.trim()) { setError('El asunto es obligatorio'); return; }
    if ((message?.trim()?.length ?? 0) < 10) { setError('El mensaje debe tener al menos 10 caracteres'); return; }
    setError('');
    createMutation.mutate(
      { data: { subject: subject.trim(), message: message.trim() } },
      {
        onSuccess: () => {
          setShowSuccess(true);
          setSubject('');
          setMessage('');
          refetch();
        },
        onError: () => setError('Error al enviar. Inténtalo de nuevo.'),
      },
    );
  };

  if (loadingMessages) return <LoadingScreen />;

  const messages = messagesData?.items ?? [];

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + SPACING.xl }} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>{IS_DEMO ? 'Contacto · Simulación' : 'Contacto Médico'}</Text>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="hospital-building" size={24} color={COLORS.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Servicio de Nefrología</Text>
              <Text style={styles.infoSubtitle}>Hospital Universitario San Pedro</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="email-outline" size={20} color={COLORS.secondary} />
            <Text style={styles.infoEmail}>{IS_DEMO ? 'Sin destinatario real' : 'contactonefrologia@riojasalud.es'}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.accent} />
            <Text style={styles.infoSchedule}>{IS_DEMO ? 'Las consultas no se envían ni reciben respuesta' : 'Respuestas en horario de 08:00 a 15:00h'}</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.formTitle}>{IS_DEMO ? 'Consulta ficticia · No escribas datos reales' : 'Nueva Consulta'}</Text>

          {!!error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder="Asunto"
            placeholderTextColor={COLORS.textMuted}
            value={subject}
            onChangeText={setSubject}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Escribe tu consulta médica..."
            placeholderTextColor={COLORS.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          <Pressable onPress={handleSend} disabled={createMutation.isPending} style={({ pressed }) => [styles.sendButton, pressed && { opacity: 0.85 }]}>
            <LinearGradient colors={GRADIENT_PRIMARY} style={styles.gradientButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {createMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="send" size={20} color="#FFF" />
                  <Text style={styles.sendButtonText}>{IS_DEMO ? 'Guardar simulación' : 'Enviar Consulta'}</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        {/* Previous Messages */}
        {messages.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.formTitle}>Consultas Anteriores</Text>
            {messages.map((msg) => (
              <View key={msg?.id ?? Math.random().toString()} style={styles.msgRow}>
                <View style={styles.msgHeader}>
                  <Text style={styles.msgSubject}>{msg?.subject ?? ''}</Text>
                  <Text style={styles.msgStatus}>{msg?.status ?? ''}</Text>
                </View>
                <Text style={styles.msgBody} numberOfLines={2}>{msg?.message ?? ''}</Text>
                <Text style={styles.msgDate}>{msg?.createdAt ? new Date(msg.createdAt).toLocaleString('es-ES') : ''}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name="check-circle" size={64} color={COLORS.success} />
            <Text style={styles.modalTitle}>{IS_DEMO ? 'Simulación guardada' : 'Consulta Enviada'}</Text>
            <Text style={styles.modalText}>{IS_DEMO ? 'Guardada solo en este dispositivo. No se ha enviado a ningún profesional ni al hospital.' : 'Tu consulta ha sido enviada correctamente. Recibirás respuesta en horario de 08:00 a 15:00h.'}</Text>
            <Pressable style={styles.modalButton} onPress={() => setShowSuccess(false)}>
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.background },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  backButton: { padding: SPACING.xs, marginRight: SPACING.sm },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  card: { backgroundColor: COLORS.surface, marginHorizontal: SPACING.md, marginBottom: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.md, shadowColor: COLORS.cardShadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.xs + 2 },
  infoTextContainer: { marginLeft: SPACING.sm },
  infoTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  infoSubtitle: { fontSize: 13, color: COLORS.textSecondary },
  infoEmail: { fontSize: 14, color: COLORS.secondary, marginLeft: SPACING.sm, fontWeight: '600' },
  infoSchedule: { fontSize: 14, color: COLORS.textSecondary, marginLeft: SPACING.sm },
  formTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  errorBanner: { backgroundColor: '#FEF2F2', borderRadius: RADIUS.sm, padding: SPACING.sm, marginBottom: SPACING.sm },
  errorText: { color: COLORS.error, fontSize: 13 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm, fontSize: 15, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  sendButton: { borderRadius: RADIUS.md, overflow: 'hidden' },
  gradientButton: { flexDirection: 'row', height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: RADIUS.md },
  sendButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginLeft: SPACING.sm },
  msgRow: { paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  msgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  msgSubject: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, flex: 1 },
  msgStatus: { fontSize: 12, color: COLORS.primary, fontWeight: '600', textTransform: 'capitalize' },
  msgBody: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  msgDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  modalContent: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', maxWidth: 340, width: '100%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginTop: SPACING.md },
  modalText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm, lineHeight: 20 },
  modalButton: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm + 2, borderRadius: RADIUS.md, marginTop: SPACING.lg },
  modalButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
