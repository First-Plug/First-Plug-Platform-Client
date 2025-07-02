"use client";
import { create } from "zustand";
import { AsideType } from "@/features/asides";

type Maybe<T> = T | undefined;

interface AsideState {
  type?: AsideType;
  csvContext?: string;
  isClosed: boolean;
  setAside: (type: Maybe<AsideType>, csvContext?: string) => void;
  closeAside: () => void;
}

export const useAsideStore = create<AsideState>((set) => ({
  type: undefined,
  csvContext: undefined,
  isClosed: true,
  setAside: (type, csvContext) =>
    set({
      type,
      csvContext,
      isClosed: false,
    }),
  closeAside: () =>
    set({
      type: undefined,
      isClosed: true,
    }),
}));
