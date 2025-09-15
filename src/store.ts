import { create } from 'zustand';

type AppState = {
  isListening: boolean;
  isSending: boolean;
  isSpeaking: boolean;
  lastResponseText: string;
  setListening: (isListening: boolean) => void;
  setSending: (isSending: boolean) => void;
  setSpeaking: (isSpeaking: boolean) => void;
  setLastResponseText: (text: string) => void;
};

export const useStore = create<AppState>((set) => ({
  isListening: false,
  isSending: false,
  isSpeaking: false,
  lastResponseText: '',
  setListening: (isListening) => set({ isListening }),
  setSending: (isSending) => set({ isSending }),
  setSpeaking: (isSpeaking) => set({ isSpeaking }),
  setLastResponseText: (text) => set({ lastResponseText: text }),
}));
