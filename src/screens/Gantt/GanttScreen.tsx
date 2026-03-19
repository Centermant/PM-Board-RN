import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../app/store';
import { ZoomIn, ZoomOut } from 'lucide-react-native';
import { format, parseISO, differenceInDays, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { ru } from 'date-fns/locale';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TASK_ROW_HEIGHT = 56;
const HEADER_HEIGHT = 48;
const TASK_LIST_WIDTH = SCREEN_WIDTH < 768 ? 100 : 120;

export default function GanttScreen() {
  const { colors } = useTheme();
  const { tasks, users, initialized, initializeData } = useAppStore();
  
  const [scale, setScale] = useState(200);
  const [verticalScrollEnabled, setVerticalScrollEnabled] = useState(true);

  useEffect(() => {
    if (!initialized) initializeData();
  }, [initialized, initializeData]);

  const allDates = tasks.flatMap(t => [parseISO(t.startDate), parseISO(t.endDate)]);
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

  const calculateBarPosition = (task: any) => {
    const start = parseISO(task.startDate);
    const end = parseISO(task.endDate);
    const left = differenceInDays(start, startOfMonth(minDate)) * (scale / 30);
    const width = Math.max(differenceInDays(end, start) * (scale / 30), 40);
    return { left, width };
  };

  const getLastName = (fullName: string) => {
    const parts = fullName.split(' ');
    return parts[0] || fullName;
  };

  const contentHeight = tasks.length * TASK_ROW_HEIGHT + HEADER_HEIGHT;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Диаграмма Ганта</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{tasks.length} задач</Text>
        </View>
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

      {/* ✅ Gantt Chart - ВЕРТИКАЛЬНЫЙ СКРОЛЛ */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.scrollContent, { minHeight: contentHeight }]}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        <View style={styles.chartContainer}>
          {/* Timeline Header - месяцы */}
          <View style={styles.timelineHeaderRow}>
            <View style={[styles.taskListHeaderCell, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.taskListHeaderText, { color: colors.text }]}>Исп.</Text>
            </View>
            <View style={styles.monthsContainer}>
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

          {/* Task Rows */}
          <View style={styles.tasksContainer}>
            {/* Grid Lines */}
            <View style={[styles.gridContainer, { height: tasks.length * TASK_ROW_HEIGHT }]}>
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
            {tasks.map((task, index) => {
              const { left, width } = calculateBarPosition(task);
              const statusColor = getStatusColor(task.status);
              const assignee = users.find(u => u.id === task.assigneeId);
              const lastName = assignee ? getLastName(assignee.name) : '—';
              
              return (
                <View
                  key={task.id}
                  style={[
                    styles.taskRow,
                    {
                      borderBottomColor: colors.border,
                      height: TASK_ROW_HEIGHT,
                    }
                  ]}
                >
                  {/* Task List Cell (Left) */}
                  <View style={[styles.taskListCell, { width: TASK_LIST_WIDTH, borderColor: colors.border }]}>
                    <Text style={[styles.taskListText, { color: colors.text }]} numberOfLines={1}>
                      {lastName}
                    </Text>
                  </View>
                  
                  {/* Task Bar (Right) */}
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
                </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
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
  
  // ✅ Scroll Container - ВЕРТИКАЛЬНЫЙ СКРОЛЛ
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  chartContainer: {
    minWidth: '100%',
  },
  
  // Timeline Header Row
  timelineHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  taskListHeaderCell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    paddingVertical: 12,
  },
  taskListHeaderText: {
    fontSize: 13,
    fontWeight: '600',
  },
  monthsContainer: {
    flexDirection: 'row',
  },
  monthCell: {
    height: HEADER_HEIGHT,
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
    backgroundColor: 'transparent',
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