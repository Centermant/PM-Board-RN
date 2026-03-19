import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore, useAuthStore } from '../../app/store';
import { Folder, ListTodo, CheckCircle, Clock } from 'lucide-react-native';
import { format, parseISO, isBefore } from 'date-fns';
import { ru } from 'date-fns/locale';

function StatCard({ icon: Icon, value, label, color, onPress, colors }: any) {
  return (
    <TouchableOpacity 
      style={[styles.statCard, { 
        backgroundColor: colors.surface, 
        borderLeftColor: color,
        borderColor: colors.border 
      }]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Icon color={color} size={24} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { isDark, colors } = useTheme();
  const { tasks, projects, users, initialized, initializeData } = useAppStore();
  const currentUser = useAuthStore(state => state.currentUser);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!initialized) initializeData();
  }, [initialized, initializeData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeData();
    setRefreshing(false);
  };

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const myTasks = tasks.filter(t => t.assigneeId === currentUser?.id).length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'done') return false;
    return isBefore(parseISO(t.endDate), new Date());
  }).length;

  const myActiveTasks = tasks
    .filter(t => t.assigneeId === currentUser?.id && t.status !== 'done')
    .slice(0, 4);

  const taskDistribution = [
    { name: 'Запланировано', value: tasks.filter(t => t.status === 'planned').length, color: '#94a3b8' },
    { name: 'В работе', value: tasks.filter(t => t.status === 'inProgress').length, color: '#3b82f6' },
    { name: 'Тестирование', value: tasks.filter(t => t.status === 'testing').length, color: '#f59e0b' },
    { name: 'Готово', value: tasks.filter(t => t.status === 'done').length, color: '#10b981' }
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Дашборд</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Добро пожаловать, {currentUser?.name}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard icon={Folder} value={activeProjects} label="Проекты" color="#3b82f6" onPress={() => navigation.navigate('Projects' as never)} colors={colors} />
        <StatCard icon={ListTodo} value={myTasks} label="Мои задачи" color="#8b5cf6" onPress={() => navigation.navigate('Kanban' as never)} colors={colors} />
        <StatCard icon={CheckCircle} value={completedTasks} label="Завершено" color="#10b981" colors={colors} />
        <StatCard icon={Clock} value={overdueTasks} label="Просрочено" color="#ef4444" colors={colors} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Распределение задач</Text>
        {taskDistribution.map((item, idx) => (
          <View key={idx} style={[styles.distributionItem, { borderBottomColor: colors.border }]}>
            <View style={styles.distributionLeft}>
              <View style={[styles.distributionDot, { backgroundColor: item.color }]} />
              <Text style={[styles.distributionLabel, { color: colors.text }]}>{item.name}</Text>
            </View>
            <Text style={[styles.distributionValue, { color: colors.text }]}>{item.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Мои активные задачи</Text>
        {myActiveTasks.length === 0 ? (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Нет активных задач</Text>
          </View>
        ) : (
          myActiveTasks.map(task => {
            const assignee = users.find(u => u.id === task.assigneeId);
            return (
              <View key={task.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.taskTitle, { color: colors.text }]} numberOfLines={2}>{task.title}</Text>
                <View style={styles.taskFooter}>
                  {assignee && (
                    <View style={styles.assigneeContainer}>
                      <View style={[styles.avatar, { backgroundColor: assignee.color }]}>
                        <Text style={styles.avatarText}>{assignee.avatarInitials.charAt(0)}</Text>
                      </View>
                      <Text style={[styles.assigneeName, { color: colors.textSecondary }]}>{assignee.name}</Text>
                    </View>
                  )}
                  <Text style={[styles.taskDate, { color: colors.textMuted }]}>
                    до {format(parseISO(task.endDate), 'd MMM', { locale: ru })}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 80 },
  header: { marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  headerSubtitle: { fontSize: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  statCard: { width: '48%', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderWidth: 1 },
  statIconContainer: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 13 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  card: { borderRadius: 12, padding: 16, borderWidth: 1, marginBottom: 12 },
  emptyText: { fontSize: 14, textAlign: 'center', padding: 20 },
  taskTitle: { fontSize: 15, fontWeight: '500', marginBottom: 12 },
  taskFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  assigneeContainer: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  avatarText: { fontSize: 10, fontWeight: '600', color: '#ffffff' },
  assigneeName: { fontSize: 13 },
  taskDate: { fontSize: 12 },
  distributionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  distributionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  distributionDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  distributionLabel: { fontSize: 14, flex: 1 },
  distributionValue: { fontSize: 14, fontWeight: '600' },
});