import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native';
import { X, Calendar } from 'lucide-react-native';

interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
  users: any[];
  colors: any;
}

export default function CreateProjectModal({ visible, onClose, onCreate, users, colors }: CreateProjectModalProps) {
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'active',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    budget: '0',
    progress: '0',
    teamIds: [] as string[],
  });

  const handleCreate = () => {
    if (!newProject.name) return;
    onCreate({
      ...newProject,
      budget: Number(newProject.budget),
      progress: Number(newProject.progress),
    });
  };

  const toggleTeamMember = (userId: string) => {
    setNewProject(prev => ({
      ...prev,
      teamIds: prev.teamIds.includes(userId)
        ? prev.teamIds.filter(id => id !== userId)
        : [...prev.teamIds, userId],
    }));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Создать проект</Text>
            <TouchableOpacity onPress={onClose}>
              <X color={colors.textSecondary} size={24} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Название *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
              value={newProject.name}
              onChangeText={(text) => setNewProject({ ...newProject, name: text })}
              placeholder="Название проекта"
              placeholderTextColor={colors.textMuted}
            />
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>Описание</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
              value={newProject.description}
              onChangeText={(text) => setNewProject({ ...newProject, description: text })}
              placeholder="Описание"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
            />

            {/* ✅ ПОЛЯ ДЛЯ ВВОДА СРОКОВ ПРОЕКТА */}
            <View style={styles.modalRow}>
              <View style={styles.modalHalf}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Дата начала *</Text>
                <View style={[styles.dateInputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                  <Calendar color={colors.textMuted} size={18} />
                  <TextInput
                    style={[styles.dateInput, { color: colors.text }]}
                    value={newProject.startDate}
                    onChangeText={(text) => setNewProject({ ...newProject, startDate: text })}
                    placeholder="ГГГГ-ММ-ДД"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
              <View style={styles.modalHalf}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Дата окончания *</Text>
                <View style={[styles.dateInputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                  <Calendar color={colors.textMuted} size={18} />
                  <TextInput
                    style={[styles.dateInput, { color: colors.text }]}
                    value={newProject.endDate}
                    onChangeText={(text) => setNewProject({ ...newProject, endDate: text })}
                    placeholder="ГГГГ-ММ-ДД"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
            </View>

            <View style={styles.modalRow}>
              <View style={styles.modalHalf}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Бюджет (₽)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                  value={newProject.budget}
                  onChangeText={(text) => setNewProject({ ...newProject, budget: text })}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={styles.modalHalf}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Прогресс (%)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                  value={newProject.progress}
                  onChangeText={(text) => setNewProject({ ...newProject, progress: text })}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Команда</Text>
            <ScrollView style={[styles.teamScroll, { borderColor: colors.border }]}>
              {users.map(u => (
                <TouchableOpacity
                  key={u.id}
                  style={[styles.teamOption, newProject.teamIds.includes(u.id) && { backgroundColor: colors.primaryLight }]}
                  onPress={() => toggleTeamMember(u.id)}
                >
                  <View style={[styles.teamAvatar, { backgroundColor: u.color }]}>
                    <Text style={styles.teamAvatarText}>{u.avatarInitials.charAt(0)}</Text>
                  </View>
                  <Text style={[styles.teamName, { color: colors.text }]}>{u.name}</Text>
                  {newProject.teamIds.includes(u.id) && (
                    <Text style={[styles.checkmark, { color: colors.success }]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ScrollView>
          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.surfaceSecondary }]}
              onPress={onClose}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleCreate}
            >
              <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>Создать</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'center', 
    padding: 20 
  },
  modalContent: { 
    borderRadius: 16, 
    maxHeight: '90%' 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 1 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '600' 
  },
  modalBody: { 
    padding: 20, 
    maxHeight: 400 
  },
  inputLabel: { 
    fontSize: 14, 
    fontWeight: '500', 
    marginBottom: 8, 
    marginTop: 12 
  },
  input: { 
    borderWidth: 1, 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 12, 
    fontSize: 15 
  },
  textArea: { 
    minHeight: 80, 
    textAlignVertical: 'top' 
  },
  // ✅ Стили для полей даты
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  dateInput: {
    flex: 1,
    fontSize: 15,
  },
  modalRow: { 
    flexDirection: 'row', 
    gap: 12 
  },
  modalHalf: { 
    flex: 1 
  },
  teamScroll: { 
    maxHeight: 150, 
    borderWidth: 1, 
    borderRadius: 8 
  },
  teamOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(0,0,0,0.05)' 
  },
  teamAvatar: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 10 
  },
  teamAvatarText: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#ffffff' 
  },
  teamName: { 
    flex: 1, 
    fontSize: 14 
  },
  checkmark: { 
    fontSize: 18, 
    fontWeight: '700' 
  },
  modalFooter: { 
    flexDirection: 'row', 
    gap: 12, 
    padding: 20, 
    borderTopWidth: 1 
  },
  modalButton: { 
    flex: 1, 
    paddingVertical: 14, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  modalButtonText: { 
    fontSize: 15, 
    fontWeight: '600' 
  },
});