"use client";

import { type ReactNode, createContext, useContext, useState } from "react";
import { useStore } from "zustand";
import { type CartStore, createCartStore } from "@/stores/cartStore";

export type CartStoreApi = ReturnType<typeof createCartStore>;

export const CartStoreContext = createContext<CartStoreApi | undefined>(
  undefined
);

export interface CartStoreProviderProps {
  children: ReactNode;
}

export const CartStoreProvider = ({ children }: CartStoreProviderProps) => {
  const [store] = useState(createCartStore); // no arrow wrapper needed
  return (
    <CartStoreContext.Provider value={store}>
      {children}
    </CartStoreContext.Provider>
  );
};

export const useCartStore = <T,>(selector: (store: CartStore) => T): T => {
  const cartStoreContext = useContext(CartStoreContext);
  if (!cartStoreContext) {
    throw new Error("useCartStore must be used within a CartStoreProvider");
  }
  return useStore(cartStoreContext, selector);
};
