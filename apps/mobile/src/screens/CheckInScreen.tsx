import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/theme/colors';
import { checkInByFace, markAbsences, registerFaceTemplate, triggerCheckIn } from '@/services/api';

export function CheckInScreen() {
  const [studentId, setStudentId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRegisteringFace, setIsRegisteringFace] = useState(false);
  const [isFaceCheckIn, setIsFaceCheckIn] = useState(false);

  const captureFaceImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted && Platform.OS !== 'web') {
      Alert.alert('Permissão necessária', 'Autorize o uso da câmera para continuar.');
      return null;
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.5,
    };

    const pickerResult =
      Platform.OS === 'web'
        ? await ImagePicker.launchImageLibraryAsync(options)
        : await ImagePicker.launchCameraAsync(options);

    if (pickerResult.canceled || !pickerResult.assets?.[0]?.base64) {
      return null;
    }

    const asset = pickerResult.assets[0];
    const mimeType = (asset as ImagePicker.ImagePickerAsset & { mimeType?: string }).mimeType ?? 'image/jpeg';
    return `data:${mimeType};base64,${asset.base64}`;
  };

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

  const handleRegisterFace = async () => {
    if (!studentId.trim()) {
      Alert.alert('Informe o ID', 'Digite o ID do estudante antes de salvar o rosto.');
      return;
    }

    try {
      setIsRegisteringFace(true);
      const imageBase64 = await captureFaceImage();
      if (!imageBase64) {
        return;
      }
      const enrollment = await registerFaceTemplate(studentId.trim(), imageBase64);
      Alert.alert(
        'Rosto salvo',
        `O rosto foi associado a ${enrollment.student.name}. Agora já é possível usar o check-in facial.`
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o rosto.');
    } finally {
      setIsRegisteringFace(false);
    }
  };

  const handleFaceCheckIn = async () => {
    try {
      setIsFaceCheckIn(true);
      const imageBase64 = await captureFaceImage();
      if (!imageBase64) {
        return;
      }
      const record = await checkInByFace(imageBase64);
      Alert.alert('Presença confirmada', `${record.student.name} foi reconhecido automaticamente.`);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível identificar o estudante.');
    } finally {
      setIsFaceCheckIn(false);
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
      <View style={styles.divider} />
      <Text style={styles.subtitle}>Reconhecimento facial</Text>
      <Pressable
        accessibilityLabel="Salvar rosto do estudante"
        onPress={handleRegisterFace}
        disabled={isRegisteringFace}
        style={({ pressed }) => [
          styles.secondaryButton,
          styles.faceButton,
          { opacity: pressed || isRegisteringFace ? 0.7 : 1 },
        ]}
      >
        <Text style={styles.faceButtonText}>Salvar rosto do estudante</Text>
      </Pressable>
      <Pressable
        accessibilityLabel="Check-in com reconhecimento facial"
        onPress={handleFaceCheckIn}
        disabled={isFaceCheckIn}
        style={({ pressed }) => [
          styles.button,
          styles.faceButton,
          { opacity: pressed || isFaceCheckIn ? 0.7 : 1 },
        ]}
      >
        <Text style={styles.buttonText}>Check-in com rosto</Text>
      </Pressable>
      <Text style={styles.helper}>
        Dica: no modo web, você pode selecionar uma foto existente caso a câmera não esteja disponível.
      </Text>
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
  divider: {
    marginVertical: 16,
    borderBottomColor: colors.muted,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  faceButton: {
    marginTop: 8,
  },
  faceButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  helper: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 12,
  },
});
