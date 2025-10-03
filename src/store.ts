import { create } from 'zustand';

// --- Zustand State Management ---
export interface AppState {
  appState: 'initializing' | 'listening' | 'processing' | 'speaking' | 'error';
  lastResponseText: string;
  setAppState: (state: AppState['appState']) => void;
  setLastResponseText: (text: string) => void;
}

export const useStore = create<AppState>((set) => ({
  appState: 'initializing',
  lastResponseText: 'Initializing...',
  setAppState: (appState) => set({ appState }),
  setLastResponseText: (lastResponseText) => set({ lastResponseText }),
}));
