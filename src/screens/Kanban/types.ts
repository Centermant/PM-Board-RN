export interface TaskData {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'inProgress' | 'testing' | 'done';
  projectId: string;
  assigneeId: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  estimatedHours: number;
  actualHours: number;
}

export interface ColumnData {
  status: string;
  title: string;
  color: string;
}

export const COLUMNS: ColumnData[] = [
  { status: 'planned', title: 'Запланировано', color: '#94a3b8' },
  { status: 'inProgress', title: 'В работе', color: '#3b82f6' },
  { status: 'testing', title: 'На тестировании', color: '#f59e0b' },
  { status: 'done', title: 'Готово', color: '#10b981' },
];

export const PRIORITY_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};