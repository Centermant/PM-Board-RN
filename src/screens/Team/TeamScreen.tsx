import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore, useAuthStore } from '../../app/store';
import { Plus, ListTodo, X, Mail, Briefcase, Calendar, Trash2, Edit, CheckCircle } from 'lucide-react-native';

export default function TeamScreen() {
  const { colors } = useTheme();
  const { users, tasks, createUser, updateUser, deleteUser, initialized, initializeData } = useAppStore();
  const currentUser = useAuthStore(state => state.currentUser);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editUserData, setEditUserData] = useState<any>(null);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    position: '',
    color: '#3b82f6',
    avatarInitials: '',
    loadPercent: 0,
    activeTasks: 0,
  });

  useEffect(() => {
    if (!initialized) initializeData();
  }, [initialized, initializeData]);

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      Alert.alert('Ошибка', 'Заполните обязательные поля');
      return;
    }
    const initials = newUser.avatarInitials ||
      newUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    await createUser({ ...newUser, avatarInitials: initials });
    setNewUser({ name: '', email: '', password: '', role: 'employee', department: '', position: '', color: '#3b82f6', avatarInitials: '', loadPercent: 0, activeTasks: 0 });
    setShowCreateModal(false);
  };

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleEdit = () => {
    setEditUserData({ ...selectedUser });
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editUserData?.name || !editUserData?.email) {
      Alert.alert('Ошибка', 'Заполните обязательные поля');
      return;
    }
    await updateUser(selectedUser.id, editUserData);
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      setShowDeleteConfirmModal(true);
    } else {
      Alert.alert(
        'Удаление сотрудника',
        `Удалить сотрудника "${selectedUser.name}"? Все назначенные задачи останутся без исполнителя.`,
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Удалить',
            style: 'destructive',
            onPress: () => executeDelete()
          }
        ]
      );
    }
  };

  const executeDelete = () => {
    deleteUser(selectedUser.id);
    setShowDeleteConfirmModal(false);
    setShowDetailsModal(false);
    setSelectedUser(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#3b82f6';
      case 'developer': return '#10b981';
      case 'qa': return '#f59e0b';
      case 'employee': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'developer': return 'Разработчик';
      case 'qa': return 'QA Инженер';
      case 'employee': return 'Сотрудник';
      default: return role;
    }
  };

  const getUserTasks = (userId: string) => {
    return tasks.filter(t => t.assigneeId === userId);
  };

  const getCompletedTasks = (userId: string) => {
    return tasks.filter(t => t.assigneeId === userId && t.status === 'done').length;
  };

  const getActiveTasks = (userId: string) => {
    return tasks.filter(t => t.assigneeId === userId && t.status !== 'done').length;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Команда</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{users.length} сотрудников</Text>
        </View>
        {currentUser?.role === 'admin' && (
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus color="#ffffff" size={20} />
            <Text style={styles.createButtonText}>Добавить</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Team Grid */}
      <ScrollView style={styles.content}>
        <View style={styles.grid}>
          {users.map(member => {
            const memberTasks = tasks.filter(t => t.assigneeId === member.id && t.status !== 'done');
            const roleColor = getRoleColor(member.role);
            return (
              <TouchableOpacity
                key={member.id}
                style={[styles.memberCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => handleViewDetails(member)}
                activeOpacity={0.7}
              >
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: roleColor }]}>
                  <Text style={styles.avatarText}>{member.avatarInitials}</Text>
                </View>
                {/* Name */}
                <Text style={[styles.memberName, { color: colors.text }]} numberOfLines={1}>
                  {member.name}
                </Text>
                {/* Role */}
                <Text style={[styles.memberRole, { color: colors.textSecondary }]} numberOfLines={1}>
                  {getRoleText(member.role)}
                </Text>
                {/* Load Progress */}
                <View style={styles.loadContainer}>
                  <View style={[styles.loadBar, { backgroundColor: colors.surfaceSecondary }]}>
                    <View
                      style={[styles.loadFill, { width: `${member.loadPercent}%`, backgroundColor: roleColor }]}
                    />
                  </View>
                  <Text style={[styles.loadText, { color: colors.textMuted }]}>
                    Загрузка: {member.loadPercent}%
                  </Text>
                </View>
                {/* Active Tasks */}
                <View style={styles.tasksContainer}>
                  <ListTodo color={colors.textMuted} size={16} />
                  <Text style={[styles.tasksText, { color: colors.textSecondary }]}>
                    {memberTasks.length} задач
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Create User Modal */}
      <Modal visible={showCreateModal} transparent animationType="fade" onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Добавить сотрудника</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>ФИО *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={newUser.name}
                onChangeText={(text) => setNewUser({ ...newUser, name: text })}
                placeholder="Иван Иванов"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={[styles.inputLabel, { color: colors.text }]}>Email *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={newUser.email}
                onChangeText={(text) => setNewUser({ ...newUser, email: text })}
                placeholder="ivan@example.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={[styles.inputLabel, { color: colors.text }]}>Пароль *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={newUser.password}
                onChangeText={(text) => setNewUser({ ...newUser, password: text })}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
              />
              <Text style={[styles.inputLabel, { color: colors.text }]}>Роль</Text>
              <View style={styles.roleOptions}>
                {[
                  { value: 'admin', label: 'Администратор', color: '#3b82f6' },
                  { value: 'developer', label: 'Разработчик', color: '#10b981' },
                  { value: 'qa', label: 'QA', color: '#f59e0b' },
                  { value: 'employee', label: 'Сотрудник', color: '#6b7280' }
                ].map(role => (
                  <TouchableOpacity
                    key={role.value}
                    style={[
                      styles.roleOption,
                      { borderColor: colors.border },
                      newUser.role === role.value && { backgroundColor: role.color, borderColor: role.color }
                    ]}
                    onPress={() => setNewUser({ ...newUser, role: role.value as any })}
                  >
                    <Text style={[styles.roleText, { color: newUser.role === role.value ? '#ffffff' : colors.text }]}>
                      {role.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalRow}>
                <View style={styles.modalHalf}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Отдел</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                    value={newUser.department}
                    onChangeText={(text) => setNewUser({ ...newUser, department: text })}
                    placeholder="Разработка"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={styles.modalHalf}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Должность</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                    value={newUser.position}
                    onChangeText={(text) => setNewUser({ ...newUser, position: text })}
                    placeholder="Developer"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
            </ScrollView>
            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleCreateUser}
              >
                <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>Добавить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* User Details Modal */}
      <Modal visible={showDetailsModal} transparent animationType="fade" onRequestClose={() => { setShowDetailsModal(false); setSelectedUser(null); }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Сотрудник</Text>
              <TouchableOpacity onPress={() => { setShowDetailsModal(false); setSelectedUser(null); }}>
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>
            {selectedUser && (
              <ScrollView style={styles.modalBody}>
                {/* Avatar & Name */}
                <View style={styles.detailsHeader}>
                  <View style={[styles.detailsAvatar, { backgroundColor: getRoleColor(selectedUser.role) }]}>
                    <Text style={styles.detailsAvatarText}>{selectedUser.avatarInitials}</Text>
                  </View>
                  <View style={styles.detailsInfo}>
                    <Text style={[styles.detailsName, { color: colors.text }]}>{selectedUser.name}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: getRoleColor(selectedUser.role) + '20' }]}>
                      <Text style={[styles.roleBadgeText, { color: getRoleColor(selectedUser.role) }]}>
                        {getRoleText(selectedUser.role)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Contact Info */}
                <View style={styles.detailsSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Контактная информация</Text>
                  <View style={styles.detailRow}>
                    <Mail color={colors.textMuted} size={18} />
                    <Text style={[styles.detailText, { color: colors.text }]}>{selectedUser.email}</Text>
                  </View>
                  {selectedUser.department && (
                    <View style={styles.detailRow}>
                      <Briefcase color={colors.textMuted} size={18} />
                      <Text style={[styles.detailText, { color: colors.text }]}>{selectedUser.department}</Text>
                    </View>
                  )}
                  {selectedUser.position && (
                    <View style={styles.detailRow}>
                      <Calendar color={colors.textMuted} size={18} />
                      <Text style={[styles.detailText, { color: colors.text }]}>{selectedUser.position}</Text>
                    </View>
                  )}
                </View>

                {/* Statistics */}
                <View style={styles.detailsSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Статистика</Text>
                  <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: colors.surfaceSecondary }]}>
                      <Text style={[styles.statValue, { color: colors.primary }]}>{getUserTasks(selectedUser.id).length}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Всего задач</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.surfaceSecondary }]}>
                      <Text style={[styles.statValue, { color: colors.success }]}>{getCompletedTasks(selectedUser.id)}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Завершено</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.surfaceSecondary }]}>
                      <Text style={[styles.statValue, { color: colors.warning }]}>{getActiveTasks(selectedUser.id)}</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>В работе</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.surfaceSecondary }]}>
                      <Text style={[styles.statValue, { color: colors.text }]}>{selectedUser.loadPercent}%</Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Загрузка</Text>
                    </View>
                  </View>
                </View>

                {/* Load Progress */}
                <View style={styles.detailsSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Загрузка</Text>
                  <View style={styles.loadContainer}>
                    <View style={[styles.loadBar, { backgroundColor: colors.surfaceSecondary }]}>
                      <View
                        style={[styles.loadFill, { width: `${selectedUser.loadPercent}%`, backgroundColor: getRoleColor(selectedUser.role) }]}
                      />
                    </View>
                    <Text style={[styles.loadText, { color: colors.textMuted }]}>
                      {selectedUser.loadPercent}% от максимальной нагрузки
                    </Text>
                  </View>
                </View>

                {/* Active Tasks List */}
                <View style={styles.detailsSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Активные задачи</Text>
                  {getActiveTasks(selectedUser.id) === 0 ? (
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>Нет активных задач</Text>
                  ) : (
                    tasks.filter(t => t.assigneeId === selectedUser.id && t.status !== 'done').slice(0, 5).map(task => (
                      <View key={task.id} style={[styles.taskItem, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                        <Text style={[styles.taskTitle, { color: colors.text }]} numberOfLines={1}>{task.title}</Text>
                        <View style={[styles.taskStatus, { backgroundColor: getRoleColor(task.status) + '20' }]}>
                          <Text style={[styles.taskStatusText, { color: getRoleColor(task.status) }]}>
                            {task.status === 'inProgress' ? 'В работе' : task.status === 'planned' ? 'Запланировано' : 'Тестирование'}
                          </Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
            )}
            {/* Action Buttons */}
            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              {currentUser?.role === 'admin' && (
                <>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.danger }]}
                    onPress={handleDelete}
                  >
                    <Trash2 color="#ffffff" size={18} />
                    <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>Удалить</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.primary }]}
                    onPress={handleEdit}
                  >
                    <Edit color="#ffffff" size={18} />
                    <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>Редактировать</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.surfaceSecondary, flex: currentUser?.role === 'admin' ? 1 : 2 }]}
                onPress={() => { setShowDetailsModal(false); setSelectedUser(null); }}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showEditModal} transparent animationType="fade" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Редактировать сотрудника</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>ФИО *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={editUserData?.name || ''}
                onChangeText={(text) => setEditUserData({ ...editUserData, name: text })}
                placeholder="Иван Иванов"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={[styles.inputLabel, { color: colors.text }]}>Email *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={editUserData?.email || ''}
                onChangeText={(text) => setEditUserData({ ...editUserData, email: text })}
                placeholder="ivan@example.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={[styles.inputLabel, { color: colors.text }]}>Роль</Text>
              <View style={styles.roleOptions}>
                {[
                  { value: 'admin', label: 'Администратор', color: '#3b82f6' },
                  { value: 'developer', label: 'Разработчик', color: '#10b981' },
                  { value: 'qa', label: 'QA', color: '#f59e0b' },
                  { value: 'employee', label: 'Сотрудник', color: '#6b7280' }
                ].map(role => (
                  <TouchableOpacity
                    key={role.value}
                    style={[
                      styles.roleOption,
                      { borderColor: colors.border },
                      editUserData?.role === role.value && { backgroundColor: role.color, borderColor: role.color }
                    ]}
                    onPress={() => setEditUserData({ ...editUserData, role: role.value })}
                  >
                    <Text style={[styles.roleText, { color: editUserData?.role === role.value ? '#ffffff' : colors.text }]}>
                      {role.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalRow}>
                <View style={styles.modalHalf}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Отдел</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                    value={editUserData?.department || ''}
                    onChangeText={(text) => setEditUserData({ ...editUserData, department: text })}
                    placeholder="Разработка"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={styles.modalHalf}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Должность</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                    value={editUserData?.position || ''}
                    onChangeText={(text) => setEditUserData({ ...editUserData, position: text })}
                    placeholder="Developer"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Загрузка (%)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={editUserData?.loadPercent?.toString() || '0'}
                onChangeText={(text) => setEditUserData({ ...editUserData, loadPercent: Number(text) })}
                keyboardType="numeric"
                placeholderTextColor={colors.textMuted}
              />
            </ScrollView>
            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveEdit}
              >
                <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showDeleteConfirmModal} transparent animationType="fade" onRequestClose={() => setShowDeleteConfirmModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Удаление сотрудника</Text>
              <TouchableOpacity onPress={() => setShowDeleteConfirmModal(false)}>
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={[styles.deleteWarning, { color: colors.text }]}>
                Удалить сотрудника "{selectedUser?.name}"?
              </Text>
              <Text style={[styles.deleteSubtext, { color: colors.textSecondary }]}>
                Все назначенные задачи останутся без исполнителя. Это действие нельзя отменить.
              </Text>
            </View>
            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => setShowDeleteConfirmModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.danger }]}
                onPress={executeDelete}
              >
                <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>Удалить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSubtitle: { fontSize: 13, marginTop: 4 },
  createButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  createButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  content: { flex: 1, padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  memberCard: { width: '48%', borderRadius: 12, padding: 20, borderWidth: 1, marginBottom: 12, alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  memberName: { fontSize: 15, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  memberRole: { fontSize: 13, textAlign: 'center', marginBottom: 12, textTransform: 'capitalize' },
  loadContainer: { width: '100%', marginBottom: 10 },
  loadBar: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  loadFill: { height: '100%', borderRadius: 3 },
  loadText: { fontSize: 11, textAlign: 'center' },
  tasksContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tasksText: { fontSize: 13 },
  
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 16, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  modalBody: { padding: 20, maxHeight: 500 },
  inputLabel: { fontSize: 14, fontWeight: '500', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15 },
  roleOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleOption: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 2 },
  roleText: { fontSize: 13, fontWeight: '500' },
  modalRow: { flexDirection: 'row', gap: 12 },
  modalHalf: { flex: 1 },
  modalFooter: { flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1 },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  modalButtonText: { fontSize: 15, fontWeight: '600' },
  
  // Details Modal styles
  detailsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  detailsAvatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  detailsAvatarText: { fontSize: 28, fontWeight: '700', color: '#ffffff' },
  detailsInfo: { flex: 1 },
  detailsName: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, alignSelf: 'flex-start' },
  roleBadgeText: { fontSize: 12, fontWeight: '600' },
  detailsSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  detailText: { fontSize: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '48%', padding: 14, borderRadius: 10, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 12 },
  taskItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
  taskTitle: { fontSize: 13, fontWeight: '500', flex: 1 },
  taskStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  taskStatusText: { fontSize: 11, fontWeight: '600' },
  emptyText: { fontSize: 13, fontStyle: 'italic' },
  
  deleteWarning: { fontSize: 16, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  deleteSubtext: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});