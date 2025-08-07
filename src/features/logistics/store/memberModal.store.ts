import { create } from "zustand";

interface MemberModalState {
  isOpen: boolean;
  memberName: string;
  openModal: (memberName: string) => void;
  closeModal: () => void;
}

export const useMemberModalStore = create<MemberModalState>((set, get) => ({
  isOpen: false,
  memberName: "",
  openModal: (memberName: string) => {
    // Solo cambiar el estado del modal, no tocar nada más
    const currentState = get();
    if (!currentState.isOpen) {
      set({ isOpen: true, memberName });
    }
  },
  closeModal: () => {
    // Solo cambiar el estado del modal, no tocar nada más
    const currentState = get();
    if (currentState.isOpen) {
      set({ isOpen: false, memberName: "" });
    }
  },
}));
