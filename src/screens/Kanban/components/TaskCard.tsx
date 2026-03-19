import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Clock, Folder } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { PRIORITY_COLORS } from '../types';

interface TaskCardProps {
  task: any;
  users: any[];
  projects: any[];
  onPress: () => void;
  onDragStart: (x: number, y: number) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: () => void;
  colors: any;
  isDragging: boolean;
  isOverdue: boolean;
}

export default function TaskCard({
  task,
  users,
  projects,
  onPress,
  onDragStart,
  onDragMove,
  onDragEnd,
  colors,
  isDragging,
  isOverdue,
}: TaskCardProps) {
  const assignee = users.find(u => u.id === task.assigneeId);
  const project = projects.find(p => p.id === task.projectId);

  // ✅ Shared values для анимации самой карточки
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const gesture = Gesture.Pan()
    .activateAfterLongPress(100)
    .minDistance(5)
    .onStart((event) => {
      // ✅ Скрываем оригинальную карточку
      scale.value = withSpring(0.95);
      opacity.value = withTiming(0, { duration: 100 });
      // ✅ Передаём абсолютные координаты
      runOnJS(onDragStart)(event.absoluteX, event.absoluteY);
    })
    .onUpdate((event) => {
      // ✅ Передаём абсолютные координаты при движении
      runOnJS(onDragMove)(event.absoluteX, event.absoluteY);
    })
    .onEnd(() => {
      // ✅ Возвращаем карточку
      scale.value = withSpring(1);
      opacity.value = withTiming(1);
      runOnJS(onDragEnd)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    // ✅ Полная прозрачность когда isDragging=true
    opacity: isDragging ? 0 : opacity.value,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.taskCard,
          {
            backgroundColor: colors.surface,
            borderColor: isOverdue ? colors.danger : colors.border,
            borderWidth: isOverdue ? 2 : 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          },
          animatedStyle,
        ]}
      >
        <TouchableOpacity onPress={onPress} style={styles.taskCardContent} activeOpacity={0.7}>
          <Text style={[styles.taskTitle, { color: colors.text }]} numberOfLines={2}>{task.title}</Text>
          {project && (
            <View style={styles.projectContainer}>
              <Folder color={colors.textMuted} size={14} />
              <Text style={[styles.projectText, { color: colors.textMuted }]} numberOfLines={1}>{project.name}</Text>
            </View>
          )}
          {task.tags && task.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {task.tags.slice(0, 3).map((tag: string, idx: number) => (
                <View key={idx} style={[styles.tag, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text style={[styles.tagText, { color: colors.textSecondary }]}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={styles.taskFooter}>
            <View style={styles.taskFooterLeft}>
              {assignee && (
                <View style={[styles.avatar, { backgroundColor: assignee.color }]}>
                  <Text style={styles.avatarText}>{assignee.avatarInitials.charAt(0)}</Text>
                </View>
              )}
              <View style={styles.dateContainer}>
                <Clock color={colors.textMuted} size={12} />
                <Text style={[styles.taskDate, { color: colors.textMuted }]}>
                  до {format(parseISO(task.endDate), 'd MMM', { locale: ru })}
                </Text>
              </View>
            </View>
            <View
              style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[task.priority] }]}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  taskCard: {
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  taskCardContent: {
    padding: 14,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  projectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  projectText: {
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskDate: {
    fontSize: 11,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});