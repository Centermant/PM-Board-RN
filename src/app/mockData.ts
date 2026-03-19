export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'developer' | 'qa' | 'employee';
  avatarInitials: string;
  color: string;
  loadPercent: number;
  activeTasks: number;
  department?: string;
  position?: string;
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

export interface Settings {
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  dateFormat: string;
  language: string;
}

export const mockData = {
  users: [
    {
      id: '1',
      name: 'Лещенко Андрей',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      avatarInitials: 'ЛА',
      color: '#3b82f6',
      loadPercent: 45,
      activeTasks: 2,
      department: 'Разработка',
      position: 'Главный Fullstack-разработчик'
    },
    {
      id: '2',
      name: 'Новицкий Никита',
      email: 'nikita@example.com',
      password: 'nikita123',
      role: 'employee',
      avatarInitials: 'НН',
      color: '#f59e0b',
      loadPercent: 35,
      activeTasks: 1,
      department: 'Дизайн',
      position: 'UI/UX-дизайнер, Технический писатель'
    },
    {
      id: '3',
      name: 'Норко Александр',
      email: 'alexander.norko@example.com',
      password: 'norko123',
      role: 'developer',
      avatarInitials: 'НА',
      color: '#10b981',
      loadPercent: 40,
      activeTasks: 2,
      department: 'Разработка',
      position: 'Лидер команды'
    }
  ] as User[],

  projects: [
    {
      id: 'p1',
      name: 'PM-доска',
      description: 'Кроссплатформенное мобильное приложение для управления проектами с офлайн-режимом и P2P-синхронизацией',
      startDate: '2026-02-01',
      endDate: '2026-03-20',
      budget: 100,
      progress: 95,
      status: 'active',
      teamIds: ['1', '2', '3']
    }
  ] as Project[],

  tasks: [
    {
      id: 't1',
      title: 'Проработка идеи и концепции',
      description: 'Анализ требований, определение целевой аудитории, изучение конкурентов',
      status: 'done',
      projectId: 'p1',
      assigneeId: '3',
      startDate: '2026-02-01',
      endDate: '2026-02-05',
      durationDays: 5,
      tags: ['analysis', 'planning'],
      priority: 'high',
      estimatedHours: 16,
      actualHours: 18
    },
    {
      id: 't2',
      title: 'Проектирование архитектуры приложения',
      description: 'Разработка общей архитектуры кроссплатформенного приложения, выбор стека технологий (React Native, FastAPI, Docker)',
      status: 'done',
      projectId: 'p1',
      assigneeId: '1',
      startDate: '2026-02-03',
      endDate: '2026-02-08',
      durationDays: 6,
      tags: ['architecture', 'backend'],
      priority: 'high',
      estimatedHours: 24,
      actualHours: 26
    },
    {
      id: 't3',
      title: 'Дизайн визуальной концепции',
      description: 'Создание макетов всех экранов приложения в Figma, разработка дизайн-системы',
      status: 'done',
      projectId: 'p1',
      assigneeId: '2',
      startDate: '2026-02-05',
      endDate: '2026-02-12',
      durationDays: 8,
      tags: ['design', 'UI/UX', 'figma'],
      priority: 'high',
      estimatedHours: 32,
      actualHours: 34
    },
    {
      id: 't4',
      title: 'Настройка React Native проекта',
      description: 'Инициализация проекта, настройка навигации, темизация, интеграция библиотек',
      status: 'done',
      projectId: 'p1',
      assigneeId: '1',
      startDate: '2026-02-10',
      endDate: '2026-02-14',
      durationDays: 5,
      tags: ['frontend', 'react-native'],
      priority: 'high',
      estimatedHours: 16,
      actualHours: 18
    },
    {
      id: 't5',
      title: 'Разработка офлайн-режима',
      description: 'Реализация локального хранения данных (AsyncStorage/IndexedDB), логика работы без интернета',
      status: 'done',
      projectId: 'p1',
      assigneeId: '1',
      startDate: '2026-02-12',
      endDate: '2026-02-18',
      durationDays: 7,
      tags: ['backend', 'offline', 'storage'],
      priority: 'high',
      estimatedHours: 40,
      actualHours: 42
    },
    {
      id: 't6',
      title: 'Создание презентационных материалов',
      description: 'Подготовка слайдов для олимпиады, описание проекта, преимущества',
      status: 'done',
      projectId: 'p1',
      assigneeId: '2',
      startDate: '2026-02-15',
      endDate: '2026-02-19',
      durationDays: 5,
      tags: ['presentation', 'documentation'],
      priority: 'medium',
      estimatedHours: 16,
      actualHours: 20
    },
    {
      id: 't7',
      title: 'Разработка Kanban-доски',
      description: 'Реализация Drag-and-Drop механики, колонок задач, карточек с анимациями',
      status: 'done',
      projectId: 'p1',
      assigneeId: '1',
      startDate: '2026-02-17',
      endDate: '2026-02-25',
      durationDays: 9,
      tags: ['frontend', 'kanban', 'gesture-handler'],
      priority: 'high',
      estimatedHours: 48,
      actualHours: 52
    },
    {
      id: 't8',
      title: 'Диаграмма Ганта',
      description: 'Визуализация временной шкалы проекта, масштабирование, выбор проекта',
      status: 'done',
      projectId: 'p1',
      assigneeId: '1',
      startDate: '2026-02-20',
      endDate: '2026-02-28',
      durationDays: 9,
      tags: ['frontend', 'charts', 'gantt'],
      priority: 'medium',
      estimatedHours: 36,
      actualHours: 38
    },
    {
      id: 't9',
      title: 'Координация команды и распределение задач',
      description: 'Планирование спринтов, распределение задач между участниками, контроль сроков',
      status: 'done',
      projectId: 'p1',
      assigneeId: '3',
      startDate: '2026-02-01',
      endDate: '2026-02-28',
      durationDays: 28,
      tags: ['management', 'coordination'],
      priority: 'high',
      estimatedHours: 40,
      actualHours: 45
    },

    {
      id: 't10',
      title: 'Экран управления проектами',
      description: 'Создание, редактирование, удаление проектов, выбор команды проекта',
      status: 'done',
      projectId: 'p1',
      assigneeId: '1',
      startDate: '2026-03-01',
      endDate: '2026-03-08',
      durationDays: 8,
      tags: ['frontend', 'projects'],
      priority: 'high',
      estimatedHours: 32,
      actualHours: 35
    },
    {
      id: 't11',
      title: 'Экран команды',
      description: 'Просмотр сотрудников, статистика загрузки, роли, добавление/удаление',
      status: 'done',
      projectId: 'p1',
      assigneeId: '1',
      startDate: '2026-03-05',
      endDate: '2026-03-10',
      durationDays: 6,
      tags: ['frontend', 'team'],
      priority: 'medium',
      estimatedHours: 24,
      actualHours: 26
    },
    {
      id: 't12',
      title: 'Подготовка демо-видео',
      description: 'Запись скринкаста работы приложения, монтаж, озвучка',
      status: 'done',
      projectId: 'p1',
      assigneeId: '2',
      startDate: '2026-03-08',
      endDate: '2026-03-12',
      durationDays: 5,
      tags: ['video', 'presentation'],
      priority: 'high',
      estimatedHours: 20,
      actualHours: 24
    },
    {
      id: 't13',
      title: 'Техническая документация',
      description: 'Описание архитектуры, технологий, инструкций по развёртыванию',
      status: 'done',
      projectId: 'p1',
      assigneeId: '2',
      startDate: '2026-03-10',
      endDate: '2026-03-14',
      durationDays: 5,
      tags: ['documentation', 'technical-writing'],
      priority: 'medium',
      estimatedHours: 24,
      actualHours: 28
    },
    {
      id: 't14',
      title: 'Code review и оптимизация',
      description: 'Ревью кода команды, рефакторинг, оптимизация производительности',
      status: 'done',
      projectId: 'p1',
      assigneeId: '3',
      startDate: '2026-03-01',
      endDate: '2026-03-15',
      durationDays: 15,
      tags: ['review', 'optimization'],
      priority: 'high',
      estimatedHours: 32,
      actualHours: 36
    },
    {
      id: 't15',
      title: 'Тестирование приложения',
      description: 'Ручное тестирование всех функций, исправление багов, оптимизация',
      status: 'done',
      projectId: 'p1',
      assigneeId: '1',
      startDate: '2026-03-12',
      endDate: '2026-03-16',
      durationDays: 5,
      tags: ['qa', 'testing'],
      priority: 'high',
      estimatedHours: 32,
      actualHours: 34
    },

    {
      id: 't16',
      title: 'Интеграция нейросетей для code review',
      description: 'Подключение Qwen 3.5-Plus для автоматического ревью кода, оптимизация алгоритмов синхронизации',
      status: 'inProgress',
      projectId: 'p1',
      assigneeId: '1',
      startDate: '2026-03-15',
      endDate: '2026-03-20',
      durationDays: 6,
      tags: ['ai', 'backend', 'qwen'],
      priority: 'medium',
      estimatedHours: 28,
      actualHours: 18
    },
    {
      id: 't17',
      title: 'Финальная сборка и подготовка к сдаче',
      description: 'Сборка релизной версии, проверка всех функций, подготовка к олимпиаде',
      status: 'inProgress',
      projectId: 'p1',
      assigneeId: '3',
      startDate: '2026-03-17',
      endDate: '2026-03-20',
      durationDays: 4,
      tags: ['release', 'deployment'],
      priority: 'high',
      estimatedHours: 20,
      actualHours: 12
    }
  ] as Task[],

  settings: {
    theme: 'light',
    notificationsEnabled: true,
    dateFormat: 'dd.MM.yyyy',
    language: 'ru'
  } as Settings
};