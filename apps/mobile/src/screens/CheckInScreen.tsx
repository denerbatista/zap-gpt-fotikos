import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '@/theme/colors';
import { markAbsences, triggerCheckIn } from '@/services/api';

export function CheckInScreen() {
  const [studentId, setStudentId] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleCheckIn = async () => {
    try {
      setIsSending(true);
      await triggerCheckIn(studentId.trim());
      Alert.alert('Registro enviado', 'O estudante foi marcado como presente.');
      setStudentId('');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível registrar a presença.');
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkAbsences = async () => {
    try {
      setIsSending(true);
      await markAbsences();
      Alert.alert('Ausências registradas', 'Responsáveis serão notificados.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível concluir a operação.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrada rápida</Text>
      <Text style={styles.subtitle}>Leia um QR Code/RFID ou digite o ID manualmente.</Text>
      <TextInput
        placeholder="ID do estudante"
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={studentId}
        onChangeText={setStudentId}
      />
      <Pressable
        accessibilityLabel="Registrar presença"
        onPress={handleCheckIn}
        disabled={!studentId || isSending}
        style={({ pressed }) => [
          styles.button,
          { opacity: pressed || isSending ? 0.7 : 1 },
          !studentId ? styles.buttonDisabled : null,
        ]}
      >
        <Text style={styles.buttonText}>Registrar</Text>
      </Pressable>
      <Pressable
        accessibilityLabel="Marcar ausentes"
        onPress={handleMarkAbsences}
        disabled={isSending}
        style={({ pressed }) => [
          styles.secondaryButton,
          { opacity: pressed || isSending ? 0.7 : 1 },
        ]}
      >
        <Text style={styles.secondaryButtonText}>Fechar chamada</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: colors.text,
  },
  subtitle: {
    color: colors.muted,
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    borderColor: colors.text,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
});
