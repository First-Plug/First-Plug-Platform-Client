import { create } from "zustand";

import type { Member } from "@/features/members";

interface MemberState {
  selectedMember: Member | null;
  memberOffBoarding: string;

  setSelectedMember: (member: Member | null) => void;
  setMemberOffBoarding: (name: string) => void;
}

export const useMemberStore = create<MemberState>((set) => ({
  memberOffBoarding: "",
  selectedMember: null,

  setSelectedMember: (member) => set({ selectedMember: member }),
  setMemberOffBoarding: (name) => set({ memberOffBoarding: name }),
}));
