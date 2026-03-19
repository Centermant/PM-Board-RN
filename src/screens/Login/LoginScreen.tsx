import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../app/store';
import { Lock, Mail } from 'lucide-react-native';
import Button from '../../components/ui/Button';

export default function LoginScreen() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore(state => state.login);
  const navigation = useNavigation();

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    
    const success = await login(email, password);
    setLoading(false);
    
    if (!success) {
      setError('Неверный email или пароль');
      Alert.alert('Ошибка входа', 'Неверный email или пароль');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Lock color="#ffffff" size={32} />
          </View>
          <Text style={styles.title}>PM-доска</Text>
          <Text style={styles.subtitle}>Управление проектами</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Mail color="#9ca3af" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="admin@example.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Пароль</Text>
            <View style={styles.inputWrapper}>
              <Lock color="#9ca3af" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry
              />
            </View>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Button
            title={loading ? 'Вход...' : 'Войти'}
            onPress={handleSubmit}
            loading={loading}
            style={{ marginTop: 8 }}
          />

          <View style={styles.testDataContainer}>
            <Text style={styles.testDataText}>
              <Text style={styles.testDataBold}>Тестовые данные:</Text>{'\n'}
              Email: admin@example.com{'\n'}
              Пароль: admin123
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#3b82f6',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#1f2937' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 8 },
  form: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#d1d5db',
    borderRadius: 10, backgroundColor: '#ffffff',
  },
  inputIcon: { marginLeft: 12 },
  input: { flex: 1, paddingVertical: 14, paddingHorizontal: 12, fontSize: 16, color: '#1f2937' },
  errorContainer: {
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
    borderRadius: 10, padding: 12, marginBottom: 20,
  },
  errorText: { fontSize: 14, color: '#dc2626' },
  testDataContainer: {
    marginTop: 24, backgroundColor: '#eff6ff',
    borderRadius: 10, padding: 16,
  },
  testDataText: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
  testDataBold: { fontWeight: '600' },
});