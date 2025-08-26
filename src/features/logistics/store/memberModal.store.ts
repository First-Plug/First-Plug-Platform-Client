import { create } from "zustand";

import type { Details } from "@/features/shipments";

interface MemberModalState {
  isOpen: boolean;
  orderDetails: Details | null;
  isMember: boolean;
  memberName: string;
  openModal: (order: Details, isMember: boolean, memberName: string) => void;
  closeModal: () => void;
}

export const useMemberModalStore = create<MemberModalState>((set, get) => ({
  isOpen: false,
  orderDetails: null,
  isMember: false,
  memberName: "",
  openModal: (order: Details, isMember: boolean, memberName: string) => {
    // Solo cambiar el estado del modal, no tocar nada más
    const currentState = get();
    if (!currentState.isOpen) {
      set({
        isOpen: true,
        orderDetails: order,
        isMember: isMember,
        memberName: memberName,
      });
    }
  },
  closeModal: () => {
    // Solo cambiar el estado del modal, no tocar nada más
    const currentState = get();
    if (currentState.isOpen) {
      set({
        isOpen: false,
        orderDetails: null,
        isMember: false,
        memberName: "",
      });
    }
  },
}));
