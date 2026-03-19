import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Clock } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { PRIORITY_COLORS } from '../types';

interface DragOverlayProps {
  task: any;
  users: any[];
  colors: any;
  isDragging: any;
}

export default function DragOverlay({ task, colors, isDragging }: DragOverlayProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    // ✅ Убраны все translate трансформации — они теперь в KanbanScreen
    transform: [
      { scale: 1.05 },
    ],
    opacity: isDragging.value ? 1 : 0,
    zIndex: isDragging.value ? 10000 : -1,
    pointerEvents: 'none' as const,
  }));

  return (
    <Animated.View
      style={[
        styles.dragOverlay,
        {
          backgroundColor: colors.surface,
          borderColor: colors.primary,
          borderWidth: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 16,
        },
        animatedStyle
      ]}
      pointerEvents="none"
    >
      <Text style={[styles.taskTitle, { color: colors.text }]} numberOfLines={2}>{task.title}</Text>
      {task.tags && task.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {task.tags.slice(0, 2).map((tag: string, idx: number) => (
            <View key={idx} style={[styles.tag, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.tagText, { color: colors.textSecondary }]}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.taskFooter}>
        <View style={styles.dateContainer}>
          <Clock color={colors.textMuted} size={12} />
          <Text style={[styles.taskDate, { color: colors.textMuted }]}>
            до {format(parseISO(task.endDate), 'd MMM', { locale: ru })}
          </Text>
        </View>
        <View
          style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[task.priority] }]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dragOverlay: {
    position: 'absolute',
    width: 280,
    padding: 14,
    borderRadius: 10,
    // ✅ Начальные translateX/Y = 0, управляются родителем
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
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