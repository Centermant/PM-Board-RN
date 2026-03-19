import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockData, User, Task, Project, Settings } from './mockData';

interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

interface AppState {
  users: User[];
  tasks: Task[];
  projects: Project[];
  settings: Settings;
  initialized: boolean;
  
  initializeData: () => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  createTask: (task: Omit<Task, 'id'>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  createProject: (project: Omit<Project, 'id'>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  createUser: (user: Omit<User, 'id'>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  exportData: () => string;
  importData: (jsonData: string) => Promise<boolean>;
}

// Auth Store
export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  currentUser: null,
  
  login: async (email: string, password: string) => {
    try {
      const storedUsers = await AsyncStorage.getItem('users');
      const users = storedUsers ? JSON.parse(storedUsers) : mockData.users;
      const user = users.find((u: User) => u.email === email && u.password === password);
      
      if (user) {
        await AsyncStorage.setItem('authToken', 'mock-token-' + user.id);
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
        set({ isAuthenticated: true, currentUser: user });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },
  
  logout: async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('currentUser');
      set({ isAuthenticated: false, currentUser: null });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}));

// App Store
export const useAppStore = create<AppState>((set, get) => ({
  users: [],
  tasks: [],
  projects: [],
  settings: mockData.settings,
  initialized: false,
  
  initializeData: async () => {
    try {
      const storedUsers = await AsyncStorage.getItem('users');
      const storedTasks = await AsyncStorage.getItem('tasks');
      const storedProjects = await AsyncStorage.getItem('projects');
      const storedSettings = await AsyncStorage.getItem('settings');
      
      if (storedUsers && storedTasks && storedProjects) {
        set({
          users: JSON.parse(storedUsers),
          tasks: JSON.parse(storedTasks),
          projects: JSON.parse(storedProjects),
          settings: storedSettings ? JSON.parse(storedSettings) : mockData.settings,
          initialized: true
        });
      } else {
        await AsyncStorage.setItem('users', JSON.stringify(mockData.users));
        await AsyncStorage.setItem('tasks', JSON.stringify(mockData.tasks));
        await AsyncStorage.setItem('projects', JSON.stringify(mockData.projects));
        await AsyncStorage.setItem('settings', JSON.stringify(mockData.settings));
        set({
          users: mockData.users,
          tasks: mockData.tasks,
          projects: mockData.projects,
          settings: mockData.settings,
          initialized: true
        });
      }
    } catch (error) {
      console.error('Initialize error:', error);
    }
  },
  
  updateTask: async (taskId: string, updates: Partial<Task>) => {
    const tasks = get().tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    set({ tasks });
  },
  
  createTask: async (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = { ...taskData, id: `t${Date.now()}` };
    const tasks = [...get().tasks, newTask];
    await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    set({ tasks });
  },
  
  deleteTask: async (taskId: string) => {
    const tasks = get().tasks.filter(task => task.id !== taskId);
    await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    set({ tasks });
  },
  
  updateProject: async (projectId: string, updates: Partial<Project>) => {
    const projects = get().projects.map(project =>
      project.id === projectId ? { ...project, ...updates } : project
    );
    await AsyncStorage.setItem('projects', JSON.stringify(projects));
    set({ projects });
  },
  
  createProject: async (projectData: Omit<Project, 'id'>) => {
    const newProject: Project = { ...projectData, id: `p${Date.now()}` };
    const projects = [...get().projects, newProject];
    await AsyncStorage.setItem('projects', JSON.stringify(projects));
    set({ projects });
  },
  
  deleteProject: async (projectId: string) => {
    const projects = get().projects.filter(project => project.id !== projectId);
    const tasks = get().tasks.filter(task => task.projectId !== projectId);
    await AsyncStorage.setItem('projects', JSON.stringify(projects));
    await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    set({ projects, tasks });
  },
  
  updateUser: async (userId: string, updates: Partial<User>) => {
    const users = get().users.map(user =>
      user.id === userId ? { ...user, ...updates } : user
    );
    await AsyncStorage.setItem('users', JSON.stringify(users));
    set({ users });
  },
  
  createUser: async (userData: Omit<User, 'id'>) => {
    const newUser: User = { ...userData, id: `u${Date.now()}` };
    const users = [...get().users, newUser];
    await AsyncStorage.setItem('users', JSON.stringify(users));
    set({ users });
  },
  
  deleteUser: async (userId: string) => {
    const users = get().users.filter(user => user.id !== userId);
    await AsyncStorage.setItem('users', JSON.stringify(users));
    set({ users });
  },
  
  updateSettings: async (updates: Partial<Settings>) => {
    const settings = { ...get().settings, ...updates };
    await AsyncStorage.setItem('settings', JSON.stringify(settings));
    set({ settings });
  },
  
  exportData: () => {
    const data = {
      users: get().users,
      tasks: get().tasks,
      projects: get().projects,
      settings: get().settings
    };
    return JSON.stringify(data, null, 2);
  },

  importData: (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.users && data.tasks && data.projects && data.settings) {
        AsyncStorage.setItem('users', JSON.stringify(data.users));
        AsyncStorage.setItem('tasks', JSON.stringify(data.tasks));
        AsyncStorage.setItem('projects', JSON.stringify(data.projects));
        AsyncStorage.setItem('settings', JSON.stringify(data.settings));
        set({
          users: data.users,
          tasks: data.tasks,
          projects: data.projects,
          settings: data.settings
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Import error:', error);
      return false;
    }
  }
}));