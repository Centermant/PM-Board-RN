import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { ArrowLeft, Calendar, DollarSign, Users, Trash2, Edit, Plus, Clock, X } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../app/store';
import { format, parseISO, isBefore } from 'date-fns';
import { ru } from 'date-fns/locale';
import { COLUMNS } from '../Kanban/types';

interface ProjectDetailsScreenProps {
  projectId: string;
  onBack: () => void;
}

export default function ProjectDetailsScreen({ projectId, onBack }: ProjectDetailsScreenProps) {
  const { colors } = useTheme();
  const { projects, tasks, users, updateProject, deleteProject, createTask, updateTask } = useAppStore();
  const [activeTab, setActiveTab] = useState<'tasks' | 'team' | 'info'>('tasks');
  
  // Модальные окна
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  // Данные для редактирования проекта
  const [editProjectData, setEditProjectData] = useState<any>(null);
  
  // Данные для создания задачи
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'planned',
    projectId: '',
    assigneeId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    tags: [] as string[],
    durationDays: 1,
    estimatedHours: 0,
    actualHours: 0,
  });

  const project = projects.find(p => p.id === projectId);
  const projectTasks = tasks.filter(t => t.projectId === projectId);
  const teamMembers = users.filter(u => project?.teamIds.includes(u.id));

  React.useEffect(() => {
    if (project && showEditModal) {
      setEditProjectData({
        ...project,
        budget: project.budget.toString(),
        progress: project.progress.toString(),
        teamIds: [...project.teamIds],
      });
    }
  }, [project, showEditModal]);

  if (!project) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <Text style={[styles.text, { color: colors.text }]}>Проект не найден</Text>
          <TouchableOpacity style={[styles.backButtonLarge, { backgroundColor: colors.primary }]} onPress={onBack}>
            <Text style={styles.backButtonText}>Вернуться назад</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Удаление проекта
  const handleDelete = () => {
    if (Platform.OS === 'web') {
      setShowDeleteConfirmModal(true);
    } else {
      Alert.alert(
        'Удаление проекта',
        `Удалить проект "${project.name}"? Все связанные задачи также будут удалены.`,
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
    deleteProject(projectId);
    setShowDeleteConfirmModal(false);
    onBack();
  };

  // Сохранение изменений проекта
  const handleSaveProject = () => {
    if (!editProjectData?.name) {
      Alert.alert('Ошибка', 'Название проекта обязательно');
      return;
    }
    updateProject(projectId, {
      ...editProjectData,
      budget: Number(editProjectData.budget),
      progress: Number(editProjectData.progress),
    });
    setShowEditModal(false);
  };

  // Добавление/удаление участника проекта
  const toggleTeamMember = (userId: string) => {
    setEditProjectData((prev: any) => ({
      ...prev,
      teamIds: prev.teamIds.includes(userId)
        ? prev.teamIds.filter((id: string) => id !== userId)
        : [...prev.teamIds, userId],
    }));
  };

  // Создание задачи
  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.assigneeId) {
      Alert.alert('Ошибка', 'Заполните название задачи и исполнителя');
      return;
    }
    const durationDays = Math.ceil(
      (new Date(newTask.endDate).getTime() - new Date(newTask.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    await createTask({
      ...newTask,
      projectId,
      durationDays: durationDays > 0 ? durationDays : 1,
    });
    setNewTask({
      title: '',
      description: '',
      status: 'planned',
      projectId: '',
      assigneeId: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      tags: [],
      durationDays: 1,
      estimatedHours: 0,
      actualHours: 0,
    });
    setShowCreateTaskModal(false);
  };

  // Просмотр деталей задачи
  const handleViewTaskDetails = (task: any) => {
    setSelectedTask({ ...task });
    setShowTaskDetailsModal(true);
  };

  // Сохранение изменений задачи
  const handleSaveTaskDetails = () => {
    if (selectedTask) {
      updateTask(selectedTask.id, selectedTask);
      setShowTaskDetailsModal(false);
      setSelectedTask(null);
    }
  };

  const isTaskOverdue = (task: any) => {
    if (task.status === 'done') return false;
    return isBefore(parseISO(task.endDate), new Date());
  };

  const getStatusColor = (status: string) => {
    const colorsMap: Record<string, string> = {
      planned: '#94a3b8',
      inProgress: '#3b82f6',
      testing: '#f59e0b',
      done: '#10b981',
    };
    return colorsMap[status] || '#6b7280';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      planned: 'Запланировано',
      inProgress: 'В работе',
      testing: 'Тестирование',
      done: 'Готово',
    };
    return texts[status] || status;
  };

  const getProjectStatusColor = (status: string) => {
    const colorsMap: Record<string, string> = {
      active: '#10b981',
      completed: '#3b82f6',
      archived: '#6b7280',
    };
    return colorsMap[status] || '#6b7280';
  };

  const getProjectStatusText = (status: string) => {
    const texts: Record<string, string> = {
      active: 'Активный',
      completed: 'Завершён',
      archived: 'Архив',
    };
    return texts[status] || status;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.projectTitle, { color: colors.text }]}>{project.name}</Text>
            <Text style={[styles.projectDescription, { color: colors.textSecondary }]} numberOfLines={1}>
              {project.description}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={() => setShowEditModal(true)}
          >
            <Edit color={colors.text} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.danger + '20' }]}
            onPress={handleDelete}
          >
            <Trash2 color={colors.danger} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Info Cards */}
        <View style={styles.infoCards}>
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Calendar color={colors.primary} size={24} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Сроки</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {format(parseISO(project.startDate), 'd MMM')} – {format(parseISO(project.endDate), 'd MMM yyyy', { locale: ru })}
            </Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <DollarSign color={colors.success} size={24} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Бюджет</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {project.budget.toLocaleString('ru-RU')} ₽
            </Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Users color={colors.purple} size={24} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Команда</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {teamMembers.length} чел.
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.text }]}>Прогресс проекта</Text>
            <Text style={[styles.progressValue, { color: colors.primary }]}>{project.progress}%</Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={[styles.progressFill, { width: `${project.progress}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tasks' && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('tasks')}
          >
            <Text style={[styles.tabText, activeTab === 'tasks' && { color: '#ffffff' }]}>Задачи</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'team' && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('team')}
          >
            <Text style={[styles.tabText, activeTab === 'team' && { color: '#ffffff' }]}>Команда</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'info' && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab('info')}
          >
            <Text style={[styles.tabText, activeTab === 'info' && { color: '#ffffff' }]}>Инфо</Text>
          </TouchableOpacity>
        </View>

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <View style={styles.tabContent}>
            <View style={styles.tabHeader}>
              <Text style={[styles.tabContentTitle, { color: colors.text }]}>Задачи проекта</Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowCreateTaskModal(true)}
              >
                <Plus color="#ffffff" size={20} />
                <Text style={styles.addButtonText}>Добавить</Text>
              </TouchableOpacity>
            </View>
            {projectTasks.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>Нет задач в проекте</Text>
              </View>
            ) : (
              projectTasks.map(task => {
                const assignee = users.find(u => u.id === task.assigneeId);
                const overdue = isTaskOverdue(task);
                return (
                  <TouchableOpacity
                    key={task.id}
                    style={[
                      styles.taskRow,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      overdue && { borderLeftColor: colors.danger, borderLeftWidth: 3 }
                    ]}
                    onPress={() => handleViewTaskDetails(task)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.taskCell, { flex: 2 }]}>
                      <Text style={[styles.taskTitle, { color: colors.text }]} numberOfLines={1}>{task.title}</Text>
                      {overdue && (
                        <View style={[styles.overdueBadge, { backgroundColor: colors.danger + '20' }]}>
                          <Clock color={colors.danger} size={12} />
                          <Text style={[styles.overdueText, { color: colors.danger }]}>Просрочено</Text>
                        </View>
                      )}
                    </View>
                    <View style={[styles.taskCell, { flex: 1 }]}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
                          {getStatusText(task.status)}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.taskCell, { flex: 1 }]}>
                      {assignee && (
                        <View style={styles.assigneeInfo}>
                          <View style={[styles.avatar, { backgroundColor: assignee.color }]}>
                            <Text style={styles.avatarText}>{assignee.avatarInitials.charAt(0)}</Text>
                          </View>
                          <Text style={[styles.assigneeName, { color: colors.text }]} numberOfLines={1}>
                            {assignee.name.split(' ')[0]}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={[styles.taskCell, { flex: 1 }]}>
                      <View style={styles.dateInfo}>
                        <Clock color={overdue ? colors.danger : colors.textMuted} size={12} />
                        <Text style={[styles.dateText, { color: overdue ? colors.danger : colors.textSecondary }]}>
                          {format(parseISO(task.endDate), 'd MMM', { locale: ru })}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <View style={styles.tabContent}>
            <Text style={[styles.tabContentTitle, { color: colors.text }]}>Участники команды</Text>
            {teamMembers.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>Нет участников</Text>
              </View>
            ) : (
              teamMembers.map(member => (
                <View key={member.id} style={[styles.teamMember, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={[styles.memberAvatar, { backgroundColor: member.color }]}>
                    <Text style={styles.memberAvatarText}>{member.avatarInitials}</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
                    <Text style={[styles.memberRole, { color: colors.textSecondary }]}>{member.role}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Info Tab */}
        {activeTab === 'info' && (
          <View style={styles.tabContent}>
            <View style={[styles.infoSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Описание</Text>
              <Text style={[styles.sectionText, { color: colors.textSecondary }]}>{project.description || 'Нет описания'}</Text>
            </View>
            
            <View style={[styles.infoSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Статус</Text>
              <View style={[styles.statusBadge, { backgroundColor: getProjectStatusColor(project.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getProjectStatusColor(project.status) }]}>
                  {getProjectStatusText(project.status)}
                </Text>
              </View>
            </View>

            <View style={[styles.infoSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Участники проекта</Text>
              {teamMembers.length === 0 ? (
                <Text style={[styles.sectionText, { color: colors.textMuted }]}>Нет участников</Text>
              ) : (
                <View style={styles.teamList}>
                  {teamMembers.map(member => (
                    <View key={member.id} style={styles.teamListItem}>
                      <View style={[styles.teamListItemAvatar, { backgroundColor: member.color }]}>
                        <Text style={styles.teamListItemAvatarText}>{member.avatarInitials.charAt(0)}</Text>
                      </View>
                      <View style={styles.teamListItemInfo}>
                        <Text style={[styles.teamListItemName, { color: colors.text }]}>{member.name}</Text>
                        <Text style={[styles.teamListItemRole, { color: colors.textSecondary }]}>{member.role}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={[styles.infoSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Сроки</Text>
              <View style={styles.dateRange}>
                <View style={styles.dateItem}>
                  <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>Начало:</Text>
                  <Text style={[styles.dateValue, { color: colors.text }]}>{format(parseISO(project.startDate), 'd MMMM yyyy', { locale: ru })}</Text>
                </View>
                <View style={styles.dateItem}>
                  <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>Окончание:</Text>
                  <Text style={[styles.dateValue, { color: colors.text }]}>{format(parseISO(project.endDate), 'd MMMM yyyy', { locale: ru })}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.infoSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Бюджет</Text>
              <Text style={[styles.sectionValue, { color: colors.text }]}>{project.budget.toLocaleString('ru-RU')} ₽</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Edit Project Modal */}
      <Modal visible={showEditModal} transparent animationType="fade" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Редактировать проект</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Название *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={editProjectData?.name || ''}
                onChangeText={(text) => setEditProjectData({ ...editProjectData, name: text })}
                placeholder="Название проекта"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={[styles.inputLabel, { color: colors.text }]}>Описание</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={editProjectData?.description || ''}
                onChangeText={(text) => setEditProjectData({ ...editProjectData, description: text })}
                placeholder="Описание"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
              />
              
              <View style={styles.modalRow}>
                <View style={styles.modalHalf}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Дата начала *</Text>
                  <View style={[styles.dateInputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                    <Calendar color={colors.textMuted} size={18} />
                    <TextInput
                      style={[styles.dateInput, { color: colors.text }]}
                      value={editProjectData?.startDate || ''}
                      onChangeText={(text) => setEditProjectData({ ...editProjectData, startDate: text })}
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
                      value={editProjectData?.endDate || ''}
                      onChangeText={(text) => setEditProjectData({ ...editProjectData, endDate: text })}
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
                    value={editProjectData?.budget || '0'}
                    onChangeText={(text) => setEditProjectData({ ...editProjectData, budget: text })}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={styles.modalHalf}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Прогресс (%)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                    value={editProjectData?.progress || '0'}
                    onChangeText={(text) => setEditProjectData({ ...editProjectData, progress: text })}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Статус проекта</Text>
              <View style={styles.statusOptions}>
                {[
                  { value: 'active', label: 'Активный', color: '#10b981' },
                  { value: 'completed', label: 'Завершён', color: '#3b82f6' },
                  { value: 'archived', label: 'Архив', color: '#6b7280' }
                ].map(s => (
                  <TouchableOpacity
                    key={s.value}
                    style={[
                      styles.statusOption,
                      { borderColor: colors.border },
                      editProjectData?.status === s.value && { backgroundColor: s.color, borderColor: s.color }
                    ]}
                    onPress={() => setEditProjectData({ ...editProjectData, status: s.value })}
                  >
                    <Text style={[styles.statusOptionText, editProjectData?.status === s.value && { color: '#ffffff' }]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: colors.text }]}>Команда проекта</Text>
              <ScrollView style={[styles.teamScroll, { borderColor: colors.border }]}>
                {users.map(u => (
                  <TouchableOpacity
                    key={u.id}
                    style={[styles.teamOption, editProjectData?.teamIds.includes(u.id) && { backgroundColor: colors.primaryLight }]}
                    onPress={() => toggleTeamMember(u.id)}
                  >
                    <View style={[styles.teamAvatar, { backgroundColor: u.color }]}>
                      <Text style={styles.teamAvatarText}>{u.avatarInitials.charAt(0)}</Text>
                    </View>
                    <Text style={[styles.teamName, { color: colors.text }]}>{u.name}</Text>
                    {editProjectData?.teamIds.includes(u.id) && (
                      <Text style={[styles.checkmark, { color: colors.success }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
                onPress={handleSaveProject}
              >
                <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Task Modal */}
      <Modal visible={showCreateTaskModal} transparent animationType="fade" onRequestClose={() => setShowCreateTaskModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Добавить задачу</Text>
              <TouchableOpacity onPress={() => setShowCreateTaskModal(false)}>
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Название *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={newTask.title}
                onChangeText={(text) => setNewTask({ ...newTask, title: text })}
                placeholder="Название задачи"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={[styles.inputLabel, { color: colors.text }]}>Описание</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                value={newTask.description}
                onChangeText={(text) => setNewTask({ ...newTask, description: text })}
                placeholder="Описание"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
              />
              <Text style={[styles.inputLabel, { color: colors.text }]}>Исполнитель *</Text>
              <ScrollView style={[styles.scroll, { borderColor: colors.border }]}>
                {users.map((u: any) => (
                  <TouchableOpacity
                    key={u.id}
                    style={[styles.option, newTask.assigneeId === u.id && { backgroundColor: colors.primaryLight }]}
                    onPress={() => setNewTask({ ...newTask, assigneeId: u.id })}
                  >
                    <View style={[styles.userAvatar, { backgroundColor: u.color }]}>
                      <Text style={styles.userAvatarText}>{u.avatarInitials.charAt(0)}</Text>
                    </View>
                    <Text style={[styles.optionText, { color: colors.text }]}>{u.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.modalRow}>
                <View style={styles.modalHalf}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Дата начала</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                    value={newTask.startDate}
                    onChangeText={(text) => setNewTask({ ...newTask, startDate: text })}
                    placeholder="ГГГГ-ММ-ДД"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={styles.modalHalf}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Дедлайн *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                    value={newTask.endDate}
                    onChangeText={(text) => setNewTask({ ...newTask, endDate: text })}
                    placeholder="ГГГГ-ММ-ДД"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Приоритет</Text>
              <View style={styles.priorityOptions}>
                {[
                  { value: 'low', label: 'Низкий', color: '#10b981' },
                  { value: 'medium', label: 'Средний', color: '#f59e0b' },
                  { value: 'high', label: 'Высокий', color: '#ef4444' }
                ].map(p => (
                  <TouchableOpacity
                    key={p.value}
                    style={[
                      styles.priorityOption,
                      { borderColor: colors.border },
                      newTask.priority === p.value && { backgroundColor: p.color, borderColor: p.color }
                    ]}
                    onPress={() => setNewTask({ ...newTask, priority: p.value })}
                  >
                    <Text style={[styles.priorityText, newTask.priority === p.value && { color: '#ffffff' }]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => setShowCreateTaskModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleCreateTask}
              >
                <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>Создать</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Task Details Modal */}
      <Modal visible={showTaskDetailsModal} transparent animationType="fade" onRequestClose={() => { setShowTaskDetailsModal(false); setSelectedTask(null); }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Задача</Text>
              <TouchableOpacity onPress={() => { setShowTaskDetailsModal(false); setSelectedTask(null); }}>
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>
            {selectedTask && (
              <>
                <ScrollView style={styles.modalBody}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Название</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                    value={selectedTask.title}
                    onChangeText={(text) => setSelectedTask({ ...selectedTask, title: text })}
                  />
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Описание</Text>
                  <TextInput
                    style={[styles.input, styles.textArea, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                    value={selectedTask.description || ''}
                    onChangeText={(text) => setSelectedTask({ ...selectedTask, description: text })}
                    multiline
                    numberOfLines={4}
                  />
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Статус</Text>
                  <View style={styles.statusOptions}>
                    {COLUMNS.map(c => (
                      <TouchableOpacity
                        key={c.status}
                        style={[
                          styles.statusOption,
                          { backgroundColor: colors.surfaceSecondary },
                          selectedTask.status === c.status && { backgroundColor: c.color }
                        ]}
                        onPress={() => setSelectedTask({ ...selectedTask, status: c.status })}
                      >
                        <Text style={[styles.statusOptionText, selectedTask.status === c.status && { color: '#ffffff' }]}>
                          {c.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.modalRow}>
                    <View style={styles.modalHalf}>
                      <Text style={[styles.inputLabel, { color: colors.text }]}>Приоритет</Text>
                      <View style={styles.priorityOptionsSmall}>
                        {[
                          { value: 'low', label: 'Низкий', color: '#10b981' },
                          { value: 'medium', label: 'Средний', color: '#f59e0b' },
                          { value: 'high', label: 'Высокий', color: '#ef4444' }
                        ].map(p => (
                          <TouchableOpacity
                            key={p.value}
                            style={[
                              styles.priorityOptionSmall,
                              { borderColor: colors.border },
                              selectedTask.priority === p.value && { backgroundColor: p.color, borderColor: p.color }
                            ]}
                            onPress={() => setSelectedTask({ ...selectedTask, priority: p.value })}
                          >
                            <Text style={[styles.priorityTextSmall, selectedTask.priority === p.value && { color: '#ffffff' }]}>
                              {p.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    <View style={styles.modalHalf}>
                      <Text style={[styles.inputLabel, { color: colors.text }]}>Дедлайн</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                        value={selectedTask.endDate}
                        onChangeText={(text) => setSelectedTask({ ...selectedTask, endDate: text })}
                        placeholder="ГГГГ-ММ-ДД"
                        placeholderTextColor={colors.textMuted}
                      />
                    </View>
                  </View>
                </ScrollView>
                <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.surfaceSecondary }]}
                    onPress={() => { setShowTaskDetailsModal(false); setSelectedTask(null); }}
                  >
                    <Text style={[styles.modalButtonText, { color: colors.text }]}>Закрыть</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.primary }]}
                    onPress={handleSaveTaskDetails}
                  >
                    <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>Сохранить</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showDeleteConfirmModal} transparent animationType="fade" onRequestClose={() => setShowDeleteConfirmModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Удаление проекта</Text>
              <TouchableOpacity onPress={() => setShowDeleteConfirmModal(false)}>
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={[styles.deleteWarning, { color: colors.text }]}>
                Удалить проект "{project.name}"?
              </Text>
              <Text style={[styles.deleteSubtext, { color: colors.textSecondary }]}>
                Все связанные задачи также будут удалены. Это действие нельзя отменить.
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
  text: { fontSize: 16, padding: 20, textAlign: 'center' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButtonLarge: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 16 },
  backButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  backButton: { padding: 4 },
  projectTitle: { fontSize: 18, fontWeight: '700' },
  projectDescription: { fontSize: 13, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  actionButton: { padding: 8, borderRadius: 8 },
  content: { flex: 1, padding: 16 },
  infoCards: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  infoCard: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  infoLabel: { fontSize: 11, marginTop: 8, textAlign: 'center' },
  infoValue: { fontSize: 14, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  progressCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTitle: { fontSize: 14, fontWeight: '600' },
  progressValue: { fontSize: 18, fontWeight: '700' },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '600' },
  tabContent: { marginBottom: 16 },
  tabHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tabContentTitle: { fontSize: 16, fontWeight: '600' },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  emptyState: { padding: 40, borderRadius: 12, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  taskRow: { flexDirection: 'row', padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
  taskCell: { padding: 4 },
  taskTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  overdueBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  overdueText: { fontSize: 10, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontWeight: '500' },
  assigneeInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  avatar: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 10, fontWeight: '600', color: '#ffffff' },
  assigneeName: { fontSize: 12 },
  dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 11 },
  teamMember: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  memberAvatarText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
  memberInfo: { flex: 1, marginLeft: 12 },
  memberName: { fontSize: 14, fontWeight: '600' },
  memberRole: { fontSize: 12, marginTop: 2 },
  infoSection: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  sectionText: { fontSize: 13, lineHeight: 20 },
  sectionValue: { fontSize: 16, fontWeight: '600' },
  
  teamList: { marginTop: 8 },
  teamListItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  teamListItemAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  teamListItemAvatarText: { fontSize: 13, fontWeight: '600', color: '#ffffff' },
  teamListItemInfo: { flex: 1 },
  teamListItemName: { fontSize: 14, fontWeight: '500' },
  teamListItemRole: { fontSize: 12, marginTop: 2 },
  
  dateRange: { marginTop: 8 },
  dateItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  dateLabel: { fontSize: 13 },
  dateValue: { fontSize: 13, fontWeight: '500' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 16, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  modalBody: { padding: 20, maxHeight: 400 },
  inputLabel: { fontSize: 14, fontWeight: '500', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  
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
  
  modalRow: { flexDirection: 'row', gap: 12 },
  modalHalf: { flex: 1 },
  scroll: { maxHeight: 100, borderWidth: 1, borderRadius: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  optionText: { fontSize: 14 },
  userAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  userAvatarText: { fontSize: 12, fontWeight: '600', color: '#ffffff' },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusOption: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 2 },
  statusOptionText: { fontSize: 13, fontWeight: '500' },
  priorityOptions: { flexDirection: 'row', gap: 8 },
  priorityOption: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 2, alignItems: 'center' },
  priorityText: { fontSize: 13, fontWeight: '500' },
  priorityOptionsSmall: { flexDirection: 'row', gap: 6 },
  priorityOptionSmall: { flex: 1, paddingVertical: 8, borderRadius: 6, borderWidth: 2, alignItems: 'center' },
  priorityTextSmall: { fontSize: 11, fontWeight: '500' },
  
  teamScroll: { maxHeight: 150, borderWidth: 1, borderRadius: 8 },
  teamOption: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  teamAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  teamAvatarText: { fontSize: 12, fontWeight: '600', color: '#ffffff' },
  teamName: { flex: 1, fontSize: 14 },
  checkmark: { fontSize: 18, fontWeight: '700' },
  
  modalFooter: { flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1 },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  modalButtonText: { fontSize: 15, fontWeight: '600' },
  
  deleteWarning: { fontSize: 16, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  deleteSubtext: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});