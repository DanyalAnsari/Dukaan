"use client";

import { type ReactNode, createContext, useState, useContext } from "react";
import { useStore } from "zustand";

import { type UIStore, createUIStore } from "@/stores/uiStore";

export type UIStoreApi = ReturnType<typeof createUIStore>;

export const UIStoreContext = createContext<UIStoreApi | undefined>(undefined);

export interface UIStoreProviderProps {
  children: ReactNode;
}

export const UIStoreProvider = ({ children }: UIStoreProviderProps) => {
  const [store] = useState(() => createUIStore());
  return (
    <UIStoreContext.Provider value={store}>{children}</UIStoreContext.Provider>
  );
};

export const useUiStore = <T,>(selector: (store: UIStore) => T): T => {
  const uiStoreContext = useContext(UIStoreContext);
  if (!uiStoreContext) {
    throw new Error(`useUIStore must be used within UIStoreProvider`);
  }

  return useStore(uiStoreContext, selector);
};
