import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface ThemeSettings {
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  fontFamily: string;
}

export interface AdminSession {
  id: string;
  email: string;
  fullName: string;
  imageUrl?: string;
}

interface AppState {
  theme: ThemeSettings;
  setTheme: (theme: Partial<ThemeSettings>) => void;
  admin: AdminSession | null;
  setAdmin: (admin: AdminSession | null) => void;
  isAuthenticated: boolean;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  notification: {
    show: boolean;
    message: string;
    type: NotificationType;
  };
  showNotification: (message: string, type: NotificationType) => void;
  hideNotification: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: {
        backgroundColor: '#f5f7f9',
        textColor: '#0f172a',
        primaryColor: '#0f766e',
        fontFamily: 'Inter, sans-serif',
      },
      setTheme: (newTheme: Partial<ThemeSettings>) =>
        set((state: AppState) => ({
          theme: { ...state.theme, ...newTheme },
        })),
      admin: null,
      isAuthenticated: false,
      setAdmin: (admin: AdminSession | null) =>
        set({
          admin,
          isAuthenticated: admin !== null,
        }),
      isSidebarOpen: true,
      toggleSidebar: () =>
        set((state: AppState) => ({
          isSidebarOpen: !state.isSidebarOpen,
        })),
      notification: {
        show: false,
        message: '',
        type: 'info',
      },
      showNotification: (message: string, type: NotificationType) =>
        set({
          notification: {
            show: true,
            message,
            type,
          },
        }),
      hideNotification: () =>
        set({
          notification: {
            show: false,
            message: '',
            type: 'info',
          },
        }),
    }),
    {
      name: 'atwagala-admin-storage',
      partialize: (state: AppState) => ({
        theme: state.theme,
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const useNotification = () => {
  const showNotification = useAppStore((state: AppState) => state.showNotification);
  const hideNotification = useAppStore((state: AppState) => state.hideNotification);
  return { showNotification, hideNotification };
};

export const useTheme = () => {
  const theme = useAppStore((state: AppState) => state.theme);
  const setTheme = useAppStore((state: AppState) => state.setTheme);
  return { theme, setTheme };
};
