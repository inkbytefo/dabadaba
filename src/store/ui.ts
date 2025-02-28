import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PanelState {
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  leftPanelWidth: number;
  rightPanelWidth: number;
}

interface UIState {
  panels: PanelState;
  modals: {
    profileSettings: boolean;
    appSettings: boolean;
    createGroup: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  setPanelState: (state: Partial<PanelState>) => void;
  setModalState: (modal: keyof UIState['modals'], isOpen: boolean) => void;
  setTheme: (theme: UIState['theme']) => void;
  setCompactMode: (enabled: boolean) => void;
}

const initialState = {
  panels: {
    leftPanelOpen: true,
    rightPanelOpen: true,
    leftPanelWidth: 320,
    rightPanelWidth: 320
  },
  modals: {
    profileSettings: false,
    appSettings: false,
    createGroup: false
  },
  theme: 'system' as const,
  compactMode: false
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      ...initialState,
      setPanelState: (state) => 
        set((prev) => ({
          panels: { ...prev.panels, ...state }
        })),
      setModalState: (modal, isOpen) =>
        set((prev) => ({
          modals: { ...prev.modals, [modal]: isOpen }
        })),
      setTheme: (theme) => set({ theme }),
      setCompactMode: (enabled) => set({ compactMode: enabled })
    }),
    {
      name: 'ui-store',
      // Sadece kalıcı olması gereken state'leri seçiyoruz
      partialize: (state) => ({
        theme: state.theme,
        compactMode: state.compactMode,
        panels: state.panels
      })
    }
  )
);
