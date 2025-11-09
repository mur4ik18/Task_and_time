import { create } from 'zustand';
import { User } from '../services/auth';
import { Task } from '../services/tasks';
import { Session } from '../services/sessions';
import { Break } from '../services/breaks';
import { Settings } from '../services/settings';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;

  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: number, task: Partial<Task>) => void;
  removeTask: (id: number) => void;

  // Sessions
  activeSession: Session | null;
  setActiveSession: (session: Session | null) => void;

  // Breaks
  activeBreak: Break | null;
  setActiveBreak: (breakRecord: Break | null) => void;

  // Settings
  settings: Settings | null;
  setSettings: (settings: Settings) => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useStore = create<AppState>((set) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false, activeSession: null, activeBreak: null });
  },

  // Tasks
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updatedTask } : task
      ),
    })),
  removeTask: (id) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),

  // Sessions
  activeSession: null,
  setActiveSession: (session) => set({ activeSession: session }),

  // Breaks
  activeBreak: null,
  setActiveBreak: (breakRecord) => set({ activeBreak: breakRecord }),

  // Settings
  settings: null,
  setSettings: (settings) => set({ settings }),

  // Theme
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: newTheme };
    }),

  // UI State
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));

