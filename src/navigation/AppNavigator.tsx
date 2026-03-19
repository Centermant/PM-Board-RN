import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore, useAppStore } from '../app/store';
import { useTheme } from '../theme/ThemeContext';
import {
  LayoutDashboard,
  Kanban as KanbanIcon,
  GanttChart,
  Folder,
  Users,
  Settings as SettingsIcon,
  LogOut
} from 'lucide-react-native';
// Screens
import LoginScreen from '../screens/Login/LoginScreen';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import KanbanScreen from '../screens/Kanban/KanbanScreen';
import GanttScreen from '../screens/Gantt/GanttScreen';
import ProjectsScreen from '../screens/Projects/ProjectsScreen';
import ProjectDetailsScreen from '../screens/Projects/ProjectDetailsScreen';
import TeamScreen from '../screens/Team/TeamScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');
const isDesktop = width >= 768;

const menuItems = [
  { path: 'Dashboard', icon: LayoutDashboard, label: 'Главная' },
  { path: 'Kanban', icon: KanbanIcon, label: 'Канбан' },
  { path: 'Gantt', icon: GanttChart, label: 'Гантт' },
  { path: 'Projects', icon: Folder, label: 'Проекты' },
  { path: 'Team', icon: Users, label: 'Команда' },
  { path: 'Settings', icon: SettingsIcon, label: 'Настройки' },
];

function CustomSidebar({ activeRoute, onNavigate }: { activeRoute: string; onNavigate: (route: string) => void }) {
  const { colors } = useTheme();
  const { currentUser, logout } = useAuthStore();
  
  const handleLogout = () => {
    logout();
  };

  return (
    <View style={[styles.sidebar, { backgroundColor: colors.sidebar, borderRightColor: colors.sidebarBorder }]}>
      {/* Logo/Brand */}
      <View style={[styles.logoContainer, { borderBottomColor: colors.sidebarBorder }]}>
        <Text style={[styles.logoText, { color: colors.primary }]}>PM-доска</Text>
        {currentUser && (
          <View style={styles.userProfile}>
            <View style={[styles.userAvatar, { backgroundColor: currentUser.color || colors.primary }]}>
              <Text style={styles.avatarText}>
                {currentUser.avatarInitials?.charAt(0) || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                {currentUser.name || 'User'}
              </Text>
              <Text style={[styles.userRole, { color: colors.textMuted }]} numberOfLines={1}>
                {currentUser.role || 'employee'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Navigation */}
      <ScrollView style={styles.navContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.path;
          return (
            <TouchableOpacity
              key={item.path}
              style={[
                styles.navItem,
                isActive && { backgroundColor: colors.primary }
              ]}
              onPress={() => onNavigate(item.path)}
            >
              <Icon
                color={isActive ? '#ffffff' : colors.sidebarForeground}
                size={20}
              />
              <Text
                style={[
                  styles.navLabel,
                  { color: isActive ? '#ffffff' : colors.sidebarForeground },
                  isActive && { fontWeight: '600' }
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Logout */}
      <View style={[styles.logoutContainer, { borderTopColor: colors.sidebarBorder }]}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color={colors.danger} size={20} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Выйти</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MainTabs({ onRouteChange, onProjectSelect }: { onRouteChange: (route: string) => void; onProjectSelect: (projectId: string) => void }) {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Главная',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
        listeners={{ tabPress: () => onRouteChange('Dashboard') }}
      />
      <Tab.Screen
        name="Kanban"
        component={KanbanScreen}
        options={{
          title: 'Канбан',
          tabBarIcon: ({ color, size }) => <KanbanIcon color={color} size={size} />,
        }}
        listeners={{ tabPress: () => onRouteChange('Kanban') }}
      />
      <Tab.Screen
        name="Gantt"
        component={GanttScreen}
        options={{
          title: 'Гантт',
          tabBarIcon: ({ color, size }) => <GanttChart color={color} size={size} />,
        }}
        listeners={{ tabPress: () => onRouteChange('Gantt') }}
      />
      <Tab.Screen
        name="Projects"
        component={() => <ProjectsScreen onProjectSelect={onProjectSelect} />}
        options={{
          title: 'Проекты',
          tabBarIcon: ({ color, size }) => <Folder color={color} size={size} />,
        }}
        listeners={{ tabPress: () => onRouteChange('Projects') }}
      />
      <Tab.Screen
        name="Team"
        component={TeamScreen}
        options={{
          title: 'Команда',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
        listeners={{ tabPress: () => onRouteChange('Team') }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Настройки',
          tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />,
        }}
        listeners={{ tabPress: () => onRouteChange('Settings') }}
      />
    </Tab.Navigator>
  );
}

// Desktop Layout
function DesktopLayout({ activeRoute, setActiveRoute, onProjectSelect }: { activeRoute: string; setActiveRoute: (route: string) => void; onProjectSelect: (projectId: string) => void }) {
  const renderScreen = () => {
    switch (activeRoute) {
      case 'Dashboard': return <DashboardScreen />;
      case 'Kanban': return <KanbanScreen />;
      case 'Gantt': return <GanttScreen />;
      case 'Projects': return <ProjectsScreen onProjectSelect={onProjectSelect} />;
      case 'Team': return <TeamScreen />;
      case 'Settings': return <SettingsScreen />;
      default: return <DashboardScreen />;
    }
  };

  return (
    <View style={styles.desktopContainer}>
      <CustomSidebar activeRoute={activeRoute} onNavigate={setActiveRoute} />
      <View style={styles.mainContent}>
        {renderScreen()}
      </View>
    </View>
  );
}

// Mobile Layout
function MobileLayout({ activeRoute, setActiveRoute, onProjectSelect }: { activeRoute: string; setActiveRoute: (route: string) => void; onProjectSelect: (projectId: string) => void }) {
  return <MainTabs onRouteChange={setActiveRoute} onProjectSelect={onProjectSelect} />;
}

export default function AppNavigator() {
  const { isAuthenticated } = useAuthStore();
  const { initialized, initializeData } = useAppStore();
  const [isReady, setIsReady] = useState(false);
  const [activeRoute, setActiveRoute] = useState('Dashboard');
  const [isDesktopMode, setIsDesktopMode] = useState(width >= 768);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) {
      initializeData().then(() => setIsReady(true));
    } else {
      setIsReady(true);
    }
  }, [initialized, initializeData]);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsDesktopMode(window.width >= 768);
    });
    return () => subscription?.remove();
  }, []);

  if (!isReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#f9fafb' }]}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  if (selectedProjectId) {
    return (
      <ProjectDetailsScreen
        projectId={selectedProjectId}
        onBack={() => setSelectedProjectId(null)}
      />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="App">
            {() =>
              isDesktopMode ? (
                <DesktopLayout
                  activeRoute={activeRoute}
                  setActiveRoute={(route) => {
                    setActiveRoute(route);
                    setSelectedProjectId(null);
                  }}
                  onProjectSelect={setSelectedProjectId}
                />
              ) : (
                <MobileLayout
                  activeRoute={activeRoute}
                  setActiveRoute={(route) => {
                    setActiveRoute(route);
                    setSelectedProjectId(null);
                  }}
                  onProjectSelect={setSelectedProjectId}
                />
              )
            }
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#6b7280' },
  desktopContainer: { flex: 1, flexDirection: 'row' },
  sidebar: { width: 256, borderRightWidth: 1, flexDirection: 'column' },
  logoContainer: { padding: 24, borderBottomWidth: 1, alignItems: 'center' },
  logoText: { fontSize: 20, fontWeight: '700' },
  userProfile: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  userAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  userInfo: { flex: 1 },
  userName: { fontSize: 14, fontWeight: '600' },
  userRole: { fontSize: 12 },
  navContainer: { flex: 1, padding: 12 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, marginBottom: 4 },
  navLabel: { fontSize: 14, fontWeight: '500' },
  logoutContainer: { padding: 16, borderTopWidth: 1 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8 },
  logoutText: { fontSize: 14, fontWeight: '500' },
  mainContent: { flex: 1 },
});