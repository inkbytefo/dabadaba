import { create } from 'zustand';

interface ModalState {
  profileSettings: boolean;
  appSettings: boolean;
  createGroup: boolean;
}

export interface UIState {
  // View state
  activeView: 'chat' | 'groups' | null;
  
  // Modal states
  modals: ModalState;
  
  // Actions
  setActiveView: (view: 'chat' | 'groups' | null) => void;
  setModalState: (modal: keyof ModalState, isOpen: boolean) => void;
  resetUI: () => void;
}

const initialState = {
  activeView: null,
  modals: {
    profileSettings: false,
    appSettings: false,
    createGroup: false,
  },
};

export const useUIStore = create<UIState>()((set) => ({
  ...initialState,

  setActiveView: (view) => set({ activeView: view }),

  setModalState: (modal, isOpen) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modal]: isOpen,
      },
    })),

  resetUI: () => set(initialState),
}));
