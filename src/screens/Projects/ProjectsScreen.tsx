import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore, useAuthStore } from '../../app/store';
import { Plus, Calendar, DollarSign, Users as UsersIcon } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import CreateProjectModal from './components/CreateProjectModal';

interface ProjectsScreenProps {
  onProjectSelect?: (projectId: string) => void;
}

export default function ProjectsScreen({ onProjectSelect }: ProjectsScreenProps) {
  const { colors } = useTheme();
  const { projects, tasks, users, createProject, initialized, initializeData } = useAppStore();
  const currentUser = useAuthStore(state => state.currentUser);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!initialized) initializeData();
  }, [initialized, initializeData]);

  const handleCreateProject = async (projectData: any) => {
    await createProject({
      ...projectData,
      startDate: projectData.startDate || new Date().toISOString().split('T')[0],
      endDate: projectData.endDate || new Date().toISOString().split('T')[0],
    });
    setShowCreateModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'completed': return '#3b82f6';
      case 'archived': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активный';
      case 'completed': return 'Завершён';
      case 'archived': return 'Архив';
      default: return status;
    }
  };

  const handleProjectPress = (projectId: string) => {
    if (onProjectSelect) {
      onProjectSelect(projectId);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Проекты</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{projects.length} проектов</Text>
        </View>
        {currentUser?.role === 'admin' && (
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus color="#ffffff" size={20} />
            <Text style={styles.createButtonText}>Создать</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Projects List */}
      <ScrollView style={styles.content}>
        {projects.map(project => {
          const projectTasks = tasks.filter(t => t.projectId === project.id);
          const teamMembers = users.filter(u => project.teamIds.includes(u.id));
          return (
            <TouchableOpacity
              key={project.id}
              style={[styles.projectCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleProjectPress(project.id)}
              activeOpacity={0.7}
            >
              {/* Header */}
              <View style={styles.projectHeader}>
                <View style={styles.projectInfo}>
                  <Text style={[styles.projectName, { color: colors.text }]}>{project.name}</Text>
                  <Text style={[styles.projectDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                    {project.description}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>
                    {getStatusText(project.status)}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Прогресс</Text>
                  <Text style={[styles.progressValue, { color: colors.text }]}>{project.progress}%</Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: colors.surfaceSecondary }]}>
                  <View style={[styles.progressFill, { width: `${project.progress}%`, backgroundColor: colors.primary }]} />
                </View>
              </View>

              {/* Metadata */}
              <View style={styles.metadata}>
                <View style={styles.metadataItem}>
                  <DollarSign color={colors.textMuted} size={16} />
                  <Text style={[styles.metadataText, { color: colors.textSecondary }]}>
                    {project.budget.toLocaleString('ru-RU')} ₽
                  </Text>
                </View>
                <View style={styles.metadataItem}>
                  <Calendar color={colors.textMuted} size={16} />
                  <Text style={[styles.metadataText, { color: colors.textSecondary }]}>
                    {format(parseISO(project.startDate), 'd MMM')}
                  </Text>
                </View>
                <View style={styles.metadataItem}>
                  <UsersIcon color={colors.textMuted} size={16} />
                  <View style={styles.teamAvatars}>
                    {teamMembers.slice(0, 3).map(member => (
                      <View
                        key={member.id}
                        style={[styles.teamAvatar, { backgroundColor: member.color, borderColor: colors.surface }]}
                      >
                        <Text style={styles.teamAvatarText}>{member.avatarInitials.charAt(0)}</Text>
                      </View>
                    ))}
                    {teamMembers.length > 3 && (
                      <View style={[styles.teamAvatarMore, { backgroundColor: colors.surfaceSecondary, borderColor: colors.surface }]}>
                        <Text style={[styles.teamAvatarMoreText, { color: colors.textMuted }]}>+{teamMembers.length - 3}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Tasks Summary */}
              <View style={[styles.tasksSummary, { borderTopColor: colors.borderLight }]}>
                <Text style={[styles.tasksText, { color: colors.textSecondary }]}>
                  Задач: {projectTasks.length}
                </Text>
                <View style={styles.tasksStats}>
                  <Text style={[styles.tasksDone, { color: colors.success }]}>
                    ✓ {projectTasks.filter(t => t.status === 'done').length} готово
                  </Text>
                  <Text style={[styles.tasksInProgress, { color: colors.primary }]}>
                    → {projectTasks.filter(t => t.status === 'inProgress').length} в работе
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <CreateProjectModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateProject}
        users={users}
        colors={colors}
      />
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
  projectCard: { borderRadius: 12, padding: 20, borderWidth: 1, marginBottom: 16 },
  projectHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  projectInfo: { flex: 1 },
  projectName: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  projectDescription: { fontSize: 14, lineHeight: 20 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  statusText: { fontSize: 12, fontWeight: '600' },
  progressContainer: { marginBottom: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13 },
  progressValue: { fontSize: 14, fontWeight: '700' },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  metadata: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  metadataItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metadataText: { fontSize: 13 },
  teamAvatars: { flexDirection: 'row' },
  teamAvatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, marginLeft: -8 },
  teamAvatarText: { fontSize: 10, fontWeight: '600', color: '#ffffff' },
  teamAvatarMore: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, marginLeft: -8 },
  teamAvatarMoreText: { fontSize: 9, fontWeight: '600' },
  tasksSummary: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1 },
  tasksText: { fontSize: 13 },
  tasksStats: { flexDirection: 'row', gap: 12 },
  tasksDone: { fontSize: 13, fontWeight: '500' },
  tasksInProgress: { fontSize: 13, fontWeight: '500' },
});