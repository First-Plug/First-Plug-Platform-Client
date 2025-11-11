"use client";
import { create } from "zustand";
import { AsideType } from "@/features/asides";

type Maybe<T> = T | undefined;

interface AsideItem {
  type: AsideType;
  csvContext?: string;
}

interface AsideState {
  stack: AsideItem[];
  isClosed: boolean;
  setAside: (type: Maybe<AsideType>, csvContext?: string) => void;
  pushAside: (type: AsideType, csvContext?: string) => void;
  popAside: () => void;
  closeAside: () => void;
  getCurrentAside: () => AsideItem | undefined;
}

export const useAsideStore = create<AsideState>((set, get) => ({
  stack: [],
  isClosed: true,
  setAside: (type, csvContext) =>
    set({
      stack: type ? [{ type, csvContext }] : [],
      isClosed: !type,
    }),
  pushAside: (type, csvContext) =>
    set((state) => ({
      stack: [...state.stack, { type, csvContext }],
      isClosed: false,
    })),
  popAside: () =>
    set((state) => {
      const newStack = state.stack.slice(0, -1);
      return {
        stack: newStack,
        isClosed: newStack.length === 0,
      };
    }),
  closeAside: () =>
    set({
      stack: [],
      isClosed: true,
    }),
  getCurrentAside: () => {
    const stack = get().stack;
    return stack.length > 0 ? stack[stack.length - 1] : undefined;
  },
}));
