import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore, useAuthStore } from '../../app/store';
import { Moon, Sun, Bell, Download, Upload, LogOut, Info } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function SettingsScreen() {
  const { isDark, colors } = useTheme();
  const { settings, updateSettings, exportData, importData, initialized, initializeData } = useAppStore();
  const logout = useAuthStore(state => state.logout);
  
  const [notifications, setNotifications] = useState(settings.notificationsEnabled);

  useEffect(() => {
    if (!initialized) initializeData();
  }, [initialized, initializeData]);

  useEffect(() => {
    setNotifications(settings.notificationsEnabled);
  }, [settings.notificationsEnabled]);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    updateSettings({ theme: newTheme });
    Alert.alert(
      'Тема изменена',
      `Тема изменена на ${newTheme === 'light' ? 'светлую' : 'тёмную'}`,
      [{ text: 'OK' }]
    );
  };

  const handleNotificationsToggle = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    updateSettings({ notificationsEnabled: newValue });
  };

  const handleExport = async () => {
    try {
      const data = exportData();
      
      if (Platform.OS === 'web') {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pm-board-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const filename = FileSystem.documentDirectory + `pm-board-backup-${new Date().toISOString().split('T')[0]}.json`;
        await FileSystem.writeAsStringAsync(filename, data);
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(filename, { dialogTitle: 'Экспорт данных', mimeType: 'application/json' });
        }
      }
      Alert.alert('Успех', 'Данные успешно экспортированы');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Ошибка', 'Не удалось экспортировать данные');
    }
  };

  const handleImport = async () => {
    try {
      let content: string | null = null;

      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        const fileSelected = await new Promise<File | null>((resolve) => {
          input.onchange = (e: any) => resolve(e.target.files?.[0] || null);
          input.click();
        });
        if (fileSelected) content = await fileSelected.text();
      } else {
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          content = await FileSystem.readAsStringAsync(result.assets[0].uri);
        }
      }

      if (content) {
        const success = importData(content);
        Alert.alert(success ? 'Успех' : 'Ошибка', success ? 'Данные успешно импортированы' : 'Неверный формат файла');
      }
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Ошибка', 'Не удалось импортировать данные');
    }
  };

  const handleLogout = () => {
    Alert.alert('Выход', 'Вы уверены?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Выйти', style: 'destructive', onPress: () => logout() }
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Theme Settings */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            {isDark ? <Moon color={colors.primary} size={20} /> : <Sun color={colors.primary} size={20} />}
            <Text style={[styles.cardTitle, { color: colors.text }]}>Тема оформления</Text>
          </View>
          <View style={styles.themeButtons}>
            <TouchableOpacity
              style={[
                styles.themeButton,
                { 
                  borderColor: !isDark ? colors.primary : colors.border,
                  backgroundColor: !isDark ? colors.primaryLight : colors.surface,
                }
              ]}
              onPress={() => handleThemeChange('light')}
            >
              <Sun color={!isDark ? colors.primary : colors.textSecondary} size={20} />
              <Text style={[styles.themeButtonText, { color: !isDark ? colors.primary : colors.textSecondary }]}>
                Светлая
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeButton,
                { 
                  borderColor: isDark ? colors.primary : colors.border,
                  backgroundColor: isDark ? colors.primaryLight : colors.surface,
                }
              ]}
              onPress={() => handleThemeChange('dark')}
            >
              <Moon color={isDark ? colors.primary : colors.textSecondary} size={20} />
              <Text style={[styles.themeButtonText, { color: isDark ? colors.primary : colors.textSecondary }]}>
                Тёмная
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Bell color={colors.primary} size={20} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Уведомления</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Получать уведомления о задачах
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: colors.inputBorder, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Info color={colors.primary} size={20} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Управление данными</Text>
          </View>
          <View style={styles.dataButtons}>
            <TouchableOpacity 
              style={[styles.exportButton, { backgroundColor: colors.primary }]} 
              onPress={handleExport}
            >
              <Download color="#ffffff" size={20} />
              <Text style={styles.exportButtonText}>Экспортировать данные</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.importButton, { backgroundColor: colors.surface, borderColor: colors.border }]} 
              onPress={handleImport}
            >
              <Upload color={colors.textSecondary} size={20} />
              <Text style={[styles.importButtonText, { color: colors.textSecondary }]}>Импортировать данные</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.dataHint, { color: colors.textMuted }]}>
            Экспорт и импорт позволяют сохранять и восстанавливать все данные приложения
          </Text>
        </View>

        {/* Logout */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: colors.danger }]} 
          onPress={handleLogout}
        >
          <LogOut color="#ffffff" size={20} />
          <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 80 },
  card: { 
    borderRadius: 12, 
    padding: 24, 
    borderWidth: 1, 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingText: { flex: 1 },
  settingTitle: { fontSize: 15, fontWeight: '600' },
  settingSubtitle: { fontSize: 13, marginTop: 2 },
  themeButtons: { flexDirection: 'row', gap: 12 },
  themeButton: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 12, 
    borderRadius: 8, 
    borderWidth: 2, 
    gap: 8 
  },
  themeButtonText: { fontSize: 14, fontWeight: '500' },
  dataButtons: { gap: 12 },
  exportButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 14, 
    borderRadius: 8, 
    gap: 8 
  },
  exportButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '500' },
  importButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 14, 
    borderRadius: 8, 
    borderWidth: 2, 
    gap: 8 
  },
  importButtonText: { fontSize: 15, fontWeight: '500' },
  dataHint: { fontSize: 12, marginTop: 16, textAlign: 'center', lineHeight: 18 },
  logoutButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 14, 
    borderRadius: 8, 
    gap: 8,
    marginTop: 8,
  },
  logoutButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '500' },
});