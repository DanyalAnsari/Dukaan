import { PaymentMethod } from "@/types";
import { createStore } from "zustand/vanilla";

export interface CartItem {
  productId: string;
  productName: string;
  productSku: string | null;
  hsnCode: string | null;
  unitPricePaise: number;
  gstRate: number;
  quantity: number;
}

export type CartState = {
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  discountPaise: number;
};

export type CartActions = {
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  setCustomer: (id: string | null, name: string | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setAmountPaid: (amount: number) => void;
  setDiscount: (discount: number) => void;
  clearCart: () => void;
};

export type CartStore = CartState & CartActions;

export const defaultInitState: CartState = {
  items: [],
  customerId: null,
  customerName: null,
  paymentMethod: "cash",
  amountPaid: 0,
  discountPaise: 0,
};

function calculateItemTotals(item: CartItem) {
  const subtotal = item.unitPricePaise * item.quantity;
  const gstAmount = Math.round((subtotal * item.gstRate) / 100);
  const lineTotal = subtotal + gstAmount;
  return { subtotal, gstAmount, lineTotal };
}

export const createCartStore = (initState: CartState = defaultInitState) => {
  return createStore<CartStore>()((set, get) => ({
    ...initState,
    addItem: (item) => {
      const { productId, quantity = 1 } = item;
      const currentItems = get().items;
      const existing = currentItems.find((i) => i.productId === productId);

      if (existing) {
        set({
          items: currentItems.map((i) =>
            i.productId === productId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          ),
        });
      } else {
        set({
          items: [...currentItems, { ...item, quantity }],
        });
      }
    },

    updateQty: (productId, quantity) => {
      if (quantity <= 0) {
        get().removeItem(productId);
        return;
      }
      set({
        items: get().items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        ),
      });
    },

    removeItem: (productId) => {
      set({ items: get().items.filter((i) => i.productId !== productId) });
    },

    setCustomer: (id, name) => {
      set((state) => {
        const updates: Partial<CartStore> = {
          customerId: id,
          customerName: name,
        };
        if (!id && state.paymentMethod === "credit") {
          updates.paymentMethod = "cash";
          updates.amountPaid = getCartTotal(state.items, state.discountPaise);
        }
        return updates;
      });
    },

    setPaymentMethod: (method) => {
      set({ paymentMethod: method });
    },

    setAmountPaid: (amount) => {
      set({ amountPaid: amount });
    },

    setDiscount: (discount) => {
      set({ discountPaise: discount });
    },

    clearCart: () => {
      set(defaultInitState);
    },
  }));
};

// Computed getters
export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce(
    (sum, item) => sum + item.unitPricePaise * item.quantity,
    0
  );
}

export function getCartTotalGst(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const subtotal = item.unitPricePaise * item.quantity;
    return sum + Math.round((subtotal * item.gstRate) / 100);
  }, 0);
}

export function getCartTotal(
  items: CartItem[],
  discountPaise: number = 0
): number {
  const subtotal = getCartSubtotal(items);
  const totalGst = getCartTotalGst(items);
  return subtotal + totalGst - discountPaise;
}
