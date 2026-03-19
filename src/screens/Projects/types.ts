export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  progress: number;
  status: 'active' | 'completed' | 'archived';
  teamIds: string[];
}

export interface Task {
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

export const STATUS_COLORS: Record<string, string> = {
  planned: '#94a3b8',
  inProgress: '#3b82f6',
  testing: '#f59e0b',
  done: '#10b981',
};

export const STATUS_TEXTS: Record<string, string> = {
  planned: 'Запланировано',
  inProgress: 'В работе',
  testing: 'Тестирование',
  done: 'Готово',
};

export const PROJECT_STATUS_COLORS: Record<string, string> = {
  active: '#10b981',
  completed: '#3b82f6',
  archived: '#6b7280',
};

export const PROJECT_STATUS_TEXTS: Record<string, string> = {
  active: 'Активный',
  completed: 'Завершён',
  archived: 'Архив',
};