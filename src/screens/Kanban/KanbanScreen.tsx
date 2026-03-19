import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, Dimensions, LayoutChangeEvent } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Plus, X, Clock } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../app/store';
import { COLUMNS, PRIORITY_COLORS } from './types';
import { format, parseISO, isBefore, isToday, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import TaskCard from './components/TaskCard';
import DragOverlay from './components/DragOverlay';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = 320;
const CARD_WIDTH = 280;
const CARD_HEIGHT = 70;
const SIDEBAR_WIDTH = 256; // Ширина sidebar на десктопе

export default function KanbanScreen() {
  const { colors } = useTheme();
  const { tasks, users, projects, updateTask, createTask, initialized, initializeData } = useAppStore();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [draggingTask, setDraggingTask] = useState<any>(null);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  
  // ✅ Ref для отслеживания скролла доски
  const boardScrollRef = useRef<ScrollView>(null);
  const [boardScrollX, setBoardScrollX] = useState(0);
  
  // ✅ Ref для хранения позиции контейнера на экране
  const containerRef = useRef<View>(null);
  const [containerOffset, setContainerOffset] = useState({ x: 0, y: 0 });
  
  // ✅ Определяем, есть ли sidebar (десктоп)
  const hasSidebar = SCREEN_WIDTH >= 768;

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
  });

  // Shared values для DragOverlay
  const overlayX = useSharedValue(0);
  const overlayY = useSharedValue(0);
  const isDraggingValue = useSharedValue(false);

  useEffect(() => {
    if (!initialized) initializeData();
  }, [initialized, initializeData]);

  const getKanbanTasks = () => {
    const today = new Date();
    return tasks.filter(task => {
      const startDate = parseISO(task.startDate);
      const endDate = parseISO(task.endDate);
      if (task.status === 'planned' && !isToday(startDate) && !isBefore(startDate, today)) {
        return false;
      }
      if (task.status === 'done' && isBefore(endDate, addDays(today, -1))) {
        return false;
      }
      return true;
    });
  };

  const isTaskOverdue = (task: any) => {
    if (task.status === 'done') return false;
    return isBefore(parseISO(task.endDate), new Date());
  };

  const kanbanTasks = getKanbanTasks();

  // ✅ Получаем позицию контейнера на экране
  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const { x, y } = event.nativeEvent.layout;
    setContainerOffset({ x, y });
  };

  // ✅ Начало перетаскивания
  const handleDragStart = (task: any, x: number, y: number) => {
    setDraggingTask(task);
    
    // ✅ Корректируем координаты с учётом sidebar и контейнера
    const adjustedX = hasSidebar ? x - SIDEBAR_WIDTH : x;
    
    overlayX.value = adjustedX;
    overlayY.value = y;
    isDraggingValue.value = true;
  };

  // ✅ Движение при перетаскивании
  const handleDragMove = (x: number, y: number) => {
    // ✅ Корректируем координаты с учётом sidebar
    const adjustedX = hasSidebar ? x - SIDEBAR_WIDTH : x;
    
    overlayX.value = adjustedX;
    overlayY.value = y;

    // ✅ Определяем над какой колонкой находится курсор с учётом скролла
    const relativeX = adjustedX - boardScrollX - 12;
    const columnIndex = Math.floor(relativeX / (COLUMN_WIDTH + 16));
    
    if (columnIndex >= 0 && columnIndex < COLUMNS.length) {
      setHoveredColumn(COLUMNS[columnIndex].status);
    } else {
      setHoveredColumn(null);
    }
  };

  const handleDragEnd = () => {
    if (draggingTask && hoveredColumn && draggingTask.status !== hoveredColumn) {
      updateTask(draggingTask.id, { status: hoveredColumn });
    }
    setDraggingTask(null);
    setHoveredColumn(null);
    isDraggingValue.value = false;
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.assigneeId || !newTask.projectId) {
      Alert.alert('Ошибка', 'Заполните название, исполнителя и проект');
      return;
    }
    await createTask({
      ...newTask,
      durationDays: Math.ceil(
        (new Date(newTask.endDate).getTime() - new Date(newTask.startDate).getTime()) / (1000 * 60 * 60 * 24)
      ),
      estimatedHours: 0,
      actualHours: 0,
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
    });
    setShowCreateModal(false);
  };

  const handleSaveTask = async (updatedTask: any) => {
    await updateTask(updatedTask.id, updatedTask);
    setShowEditModal(false);
    setSelectedTask(null);
  };

  // ✅ Позиционирование overlay с центрированием относительно курсора
  const animatedOverlayStyle = useAnimatedStyle(() => ({
    transform: [
      // ✅ Центрируем карточку относительно курсора
      { translateX: overlayX.value - (CARD_WIDTH / 2) },
      { translateY: overlayY.value - (CARD_HEIGHT / 2) },
      { scale: withSpring(1.05) },
    ],
    opacity: isDraggingValue.value ? 1 : 0,
    zIndex: isDraggingValue.value ? 10000 : -1,
  }));

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Канбан-доска</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{kanbanTasks.length} задач всего</Text>
        </View>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus color="#ffffff" size={20} />
          <Text style={styles.createButtonText}>Создать</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Kanban Board с отслеживанием скролла и позиции контейнера */}
      <View ref={containerRef} onLayout={handleContainerLayout} style={styles.boardContainer}>
        <ScrollView
          ref={boardScrollRef}
          horizontal
          showsHorizontalScrollIndicator={true}
          style={styles.board}
          contentContainerStyle={styles.boardContent}
          onScroll={(e) => setBoardScrollX(e.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16}
        >
          {COLUMNS.map(column => {
            const columnTasks = kanbanTasks.filter(t => t.status === column.status);
            return (
              <View
                key={column.status}
                style={[
                  styles.column,
                  {
                    backgroundColor: hoveredColumn === column.status ? colors.primary + '10' : colors.surfaceSecondary,
                  }
                ]}
              >
                <View style={styles.columnHeader}>
                  <View style={styles.columnTitleContainer}>
                    <View style={[styles.columnDot, { backgroundColor: column.color }]} />
                    <Text style={[styles.columnTitle, { color: colors.text }]}>{column.title}</Text>
                  </View>
                  <View style={[styles.columnCount, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.columnCountText, { color: colors.textSecondary }]}>{columnTasks.length}</Text>
                  </View>
                </View>
                <ScrollView
                  style={styles.columnContent}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.columnContentContainer}
                >
                  {columnTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      users={users}
                      projects={projects}
                      onPress={() => {
                        setSelectedTask(task);
                        setShowEditModal(true);
                      }}
                      onDragStart={(x, y) => handleDragStart(task, x, y)}
                      onDragMove={handleDragMove}
                      onDragEnd={handleDragEnd}
                      colors={colors}
                      isDragging={draggingTask?.id === task.id}
                      isOverdue={isTaskOverdue(task)}
                    />
                  ))}
                  {columnTasks.length === 0 && (
                    <View style={styles.emptyColumn}>
                      <Text style={[styles.emptyText, { color: colors.textMuted }]}>Нет задач</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Drag Overlay */}
      {draggingTask && (
        <View style={styles.dragOverlayContainer} pointerEvents="none">
          <Animated.View style={animatedOverlayStyle}>
            <DragOverlay
              task={draggingTask}
              users={users}
              colors={colors}
              isDragging={isDraggingValue}
            />
          </Animated.View>
        </View>
      )}

      {/* Create Task Modal */}
      <Modal visible={showCreateModal} transparent animationType="fade" onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Создать задачу</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
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
              <Text style={[styles.inputLabel, { color: colors.text }]}>Проект *</Text>
              <ScrollView style={[styles.scroll, { borderColor: colors.border }]}>
                {projects.map((p: any) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.option, newTask.projectId === p.id && { backgroundColor: colors.primaryLight }]}
                    onPress={() => setNewTask({ ...newTask, projectId: p.id })}
                  >
                    <Text style={[styles.optionText, { color: colors.text }]}>{p.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
                    <Text style={[styles.priorityText, { color: newTask.priority === p.value ? '#ffffff' : colors.text }]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
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
                onPress={handleCreateTask}
              >
                <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>Создать</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Task Modal */}
      <Modal visible={showEditModal} transparent animationType="fade" onRequestClose={() => { setShowEditModal(false); setSelectedTask(null); }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Задача</Text>
              <TouchableOpacity onPress={() => { setShowEditModal(false); setSelectedTask(null); }}>
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
                    value={selectedTask.description}
                    onChangeText={(text) => setSelectedTask({ ...selectedTask, description: text })}
                    multiline
                    numberOfLines={3}
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
                </ScrollView>
                <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.surfaceSecondary }]}
                    onPress={() => { setShowEditModal(false); setSelectedTask(null); }}
                  >
                    <Text style={[styles.modalButtonText, { color: colors.text }]}>Закрыть</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleSaveTask(selectedTask)}
                  >
                    <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>Сохранить</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSubtitle: { fontSize: 13, marginTop: 4 },
  createButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  createButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  boardContainer: { flex: 1 }, // ✅ Контейнер для отслеживания позиции
  board: { flex: 1 },
  boardContent: { flexDirection: 'row', padding: 12 },
  column: { width: COLUMN_WIDTH, marginRight: 16, borderRadius: 12, overflow: 'hidden' },
  columnHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  columnTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  columnDot: { width: 8, height: 8, borderRadius: 4 },
  columnTitle: { fontSize: 14, fontWeight: '600' },
  columnCount: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  columnCountText: { fontSize: 12, fontWeight: '500' },
  columnContent: { paddingHorizontal: 12, minHeight: 400 },
  columnContentContainer: { paddingBottom: 12 },
  emptyColumn: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 13 },
  dragOverlayContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 10000 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 16, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  modalBody: { padding: 20, maxHeight: 450 },
  inputLabel: { fontSize: 14, fontWeight: '500', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  scroll: { maxHeight: 100, borderWidth: 1, borderRadius: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  optionText: { fontSize: 14 },
  userAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  userAvatarText: { fontSize: 12, fontWeight: '600', color: '#ffffff' },
  modalRow: { flexDirection: 'row', gap: 12 },
  modalHalf: { flex: 1 },
  priorityOptions: { flexDirection: 'row', gap: 8 },
  priorityOption: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 2, alignItems: 'center' },
  priorityText: { fontSize: 13, fontWeight: '500' },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusOption: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  statusOptionText: { fontSize: 13, fontWeight: '500' },
  modalFooter: { flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1 },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  modalButtonText: { fontSize: 15, fontWeight: '600' },
});