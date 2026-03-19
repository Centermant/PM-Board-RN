import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../app/store';
import { ZoomIn, ZoomOut, X } from 'lucide-react-native';
import { format, parseISO, differenceInDays, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { ru } from 'date-fns/locale';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TASK_LIST_WIDTH = 240;
const TASK_ROW_HEIGHT = 64;

export default function GanttScreen() {
  const { colors } = useTheme();
  const { tasks, users, projects, initialized, initializeData } = useAppStore();
  
  const [scale, setScale] = useState(200);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  const mainScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!initialized) initializeData();
  }, [initialized, initializeData]);

  const filteredTasks = selectedProjectId
    ? tasks.filter(t => t.projectId === selectedProjectId)
    : tasks;

  const allDates = filteredTasks.flatMap(t => [parseISO(t.startDate), parseISO(t.endDate)]);
  const minDate = allDates.length > 0 
    ? new Date(Math.min(...allDates.map(d => d.getTime()))) 
    : new Date();
  const maxDate = allDates.length > 0 
    ? new Date(Math.max(...allDates.map(d => d.getTime()))) 
    : new Date();

  const months = eachMonthOfInterval({
    start: startOfMonth(minDate),
    end: endOfMonth(maxDate),
  });

  const today = new Date();
  const todayOffset = differenceInDays(today, startOfMonth(minDate)) * (scale / 30);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return '#94a3b8';
      case 'inProgress': return '#3b82f6';
      case 'testing': return '#f59e0b';
      case 'done': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned': return 'Заплан.';
      case 'inProgress': return 'В работе';
      case 'testing': return 'Тестир.';
      case 'done': return 'Готово';
      default: return status;
    }
  };

  const calculateBarPosition = (task: any) => {
    const start = parseISO(task.startDate);
    const end = parseISO(task.endDate);
    const left = differenceInDays(start, startOfMonth(minDate)) * (scale / 30);
    const width = Math.max(differenceInDays(end, start) * (scale / 30), 40);
    return { left, width };
  };

  const handleTaskPress = (task: any) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Диаграмма Ганта</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{filteredTasks.length} задач</Text>
        </View>
        
        {/* Zoom кнопки */}
        <View style={styles.zoomButtons}>
          <TouchableOpacity
            style={[styles.zoomButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={() => setScale(prev => Math.max(prev - 50, 100))}
          >
            <ZoomOut color={colors.textSecondary} size={20} />
          </TouchableOpacity>
          <View style={[styles.zoomLevel, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.zoomLevelText, { color: colors.text }]}>{scale}%</Text>
          </View>
          <TouchableOpacity
            style={[styles.zoomButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={() => setScale(prev => Math.min(prev + 50, 400))}
          >
            <ZoomIn color={colors.textSecondary} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Выбор проекта */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={[styles.projectSelector, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
        contentContainerStyle={styles.projectSelectorContent}
      >
        <TouchableOpacity
          style={[
            styles.projectChip,
            { 
              backgroundColor: !selectedProjectId ? colors.primary : colors.surfaceSecondary,
              borderColor: colors.border,
            }
          ]}
          onPress={() => setSelectedProjectId(null)}
        >
          <Text 
            style={[
              styles.projectChipText, 
              { color: !selectedProjectId ? '#ffffff' : colors.text }
            ]}
          >
            Все проекты
          </Text>
        </TouchableOpacity>

        {projects.map(project => (
          <TouchableOpacity
            key={project.id}
            style={[
              styles.projectChip,
              { 
                backgroundColor: selectedProjectId === project.id ? colors.primary : colors.surfaceSecondary,
                borderColor: colors.border,
              }
            ]}
            onPress={() => setSelectedProjectId(project.id)}
          >
            <Text 
              style={[
                styles.projectChipText, 
                { color: selectedProjectId === project.id ? '#ffffff' : colors.text }
              ]}
              numberOfLines={1}
            >
              {project.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/*  Gantt Chart */}
      <ScrollView
        ref={mainScrollRef}
        horizontal
        showsHorizontalScrollIndicator={true}
        style={styles.chartWrapper}
      >
        <View style={styles.chartContent}>
          <View style={styles.timelineHeaderRow}>
            <View style={[styles.taskListHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.taskListHeaderText, { color: colors.text }]}>Задачи</Text>
            </View>
            
            {/* Месяцы */}
            <View style={[styles.timelineHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
              {months.map((month, idx) => (
                <View 
                  key={idx} 
                  style={[styles.monthCell, { width: scale, borderColor: colors.border }]}
                >
                  <Text style={[styles.monthText, { color: colors.text }]}>
                    {format(month, 'LLL yyyy', { locale: ru })}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.tasksContainer}>
            <View style={[styles.gridContainer, { height: filteredTasks.length * TASK_ROW_HEIGHT }]}>
              {months.map((_, idx) => (
                <View 
                  key={idx} 
                  style={[styles.gridColumn, { width: scale, borderColor: colors.border }]} 
                />
              ))}
            </View>

            {/* Today Line */}
            <View 
              style={[styles.todayLine, { left: TASK_LIST_WIDTH + todayOffset, backgroundColor: colors.danger }]}
            >
              <View style={[styles.todayLabel, { backgroundColor: colors.danger }]}>
                <Text style={styles.todayLabelText}>Сегодня</Text>
              </View>
            </View>
            
            {/* Task Rows */}
            {filteredTasks.map(task => {
              const { left, width } = calculateBarPosition(task);
              const statusColor = getStatusColor(task.status);
              const assignee = users.find(u => u.id === task.assigneeId);
              
              return (
                <TouchableOpacity
                  key={task.id}
                  style={[styles.taskRow, { borderBottomColor: colors.border }]}
                  onPress={() => handleTaskPress(task)}
                  activeOpacity={0.7}
                >
                  {/* Task Info (Left Panel) */}
                  <View style={[styles.taskInfo, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                    <Text style={[styles.taskTitle, { color: colors.text }]} numberOfLines={2}>
                      {task.title}
                    </Text>
                    {assignee && (
                      <View style={styles.assigneeContainer}>
                        <View style={[styles.assigneeAvatar, { backgroundColor: assignee.color }]}>
                          <Text style={styles.assigneeAvatarText}>
                            {assignee.avatarInitials.charAt(0)}
                          </Text>
                        </View>
                        <Text style={[styles.assigneeText, { color: colors.textMuted }]} numberOfLines={1}>
                          {assignee.name.split(' ')[0]}
                        </Text>
                      </View>
                    )}
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                      <Text style={styles.statusText}>{getStatusText(task.status)}</Text>
                    </View>
                  </View>

                  {/* Task Bar (Timeline) */}
                  <View style={styles.taskBarContainer}>
                    <View
                      style={[
                        styles.taskBar,
                        { 
                          left, 
                          width, 
                          backgroundColor: statusColor 
                        }
                      ]}
                    >
                      <Text style={styles.taskBarText} numberOfLines={1}>
                        {format(parseISO(task.startDate), 'd MMM')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={[styles.legend, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Text style={[styles.legendTitle, { color: colors.text }]}>Статусы:</Text>
        <View style={styles.legendItems}>
          {[
            { color: '#94a3b8', label: 'Запланировано' },
            { color: '#3b82f6', label: 'В работе' },
            { color: '#f59e0b', label: 'Тестирование' },
            { color: '#10b981', label: 'Готово' }
          ].map((item, idx) => (
            <View key={idx} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Task Details Modal */}
      <Modal 
        visible={showTaskModal} 
        transparent 
        animationType="fade" 
        onRequestClose={() => { setShowTaskModal(false); setSelectedTask(null); }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Задача</Text>
              <TouchableOpacity onPress={() => { setShowTaskModal(false); setSelectedTask(null); }}>
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>
            
            {selectedTask && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Название:</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{selectedTask.title}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Статус:</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{getStatusText(selectedTask.status)}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Период:</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {selectedTask.startDate} — {selectedTask.endDate}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Описание:</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {selectedTask.description || '—'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Проект:</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {projects.find(p => p.id === selectedTask.projectId)?.name || '—'}
                  </Text>
                </View>
              </ScrollView>
            )}

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => { setShowTaskModal(false); setSelectedTask(null); }}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Закрыть</Text>
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
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    borderBottomWidth: 1 
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSubtitle: { fontSize: 13, marginTop: 4 },
  zoomButtons: { flexDirection: 'row', gap: 8 },
  zoomButton: { padding: 10, borderRadius: 8 },
  zoomLevel: { 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    borderRadius: 8, 
    minWidth: 60, 
    alignItems: 'center' 
  },
  zoomLevelText: { fontSize: 13, fontWeight: '600' },
  
  // Project Selector
  projectSelector: { 
    maxHeight: 50,
    borderBottomWidth: 1,
  },
  projectSelectorContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  projectChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    minHeight: 40,
  },
  projectChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Chart Wrapper
  chartWrapper: {
    flex: 1,
  },
  chartContent: {
    flexDirection: 'column',
  },
  
  // Timeline Header Row
  timelineHeaderRow: {
    flexDirection: 'row',
  },
  taskListHeader: {
    width: TASK_LIST_WIDTH,
    padding: 12,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  taskListHeaderText: {
    fontSize: 13,
    fontWeight: '600',
  },
  timelineHeader: { 
    flexDirection: 'row', 
    borderBottomWidth: 1,
    height: 48,
  },
  monthCell: { 
    height: 48, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRightWidth: 1,
  },
  monthText: { 
    fontSize: 12, 
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Tasks Container
  tasksContainer: {
    position: 'relative',
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: TASK_LIST_WIDTH,
    right: 0,
    flexDirection: 'row',
  },
  gridColumn: {
    borderRightWidth: 1,
  },
  todayLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    zIndex: 10,
  },
  todayLabel: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    position: 'absolute',
    top: 0,
  },
  todayLabelText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  
  // Task Row
  taskRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    height: TASK_ROW_HEIGHT,
  },
  taskInfo: { 
    width: TASK_LIST_WIDTH, 
    padding: 12, 
    borderRightWidth: 1,
    justifyContent: 'center',
    gap: 4,
  },
  taskTitle: { 
    fontSize: 13, 
    fontWeight: '600',
  },
  assigneeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6,
  },
  assigneeAvatar: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  assigneeAvatarText: { 
    fontSize: 10, 
    fontWeight: '600', 
    color: '#ffffff',
  },
  assigneeText: { 
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  taskBarContainer: { 
    flex: 1, 
    position: 'relative',
    height: TASK_ROW_HEIGHT,
  },
  taskBar: { 
    position: 'absolute', 
    top: 16, 
    height: 32, 
    borderRadius: 6, 
    justifyContent: 'center', 
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskBarText: { 
    fontSize: 11, 
    color: '#ffffff', 
    fontWeight: '500',
  },
  
  // Legend
  legend: { padding: 16, borderTopWidth: 1 },
  legendTitle: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  legendItems: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12 },
  
  // Modal
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'center', 
    padding: 20 
  },
  modalContent: { borderRadius: 16, maxHeight: '80%' },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 1 
  },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  modalBody: { padding: 20, maxHeight: 400 },
  infoRow: { marginBottom: 16 },
  infoLabel: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  infoValue: { fontSize: 14 },
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
  modalButtonText: { fontSize: 15, fontWeight: '600' },
});