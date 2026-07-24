import { Customer, PaymentMethod } from "@/types";
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
  customer: Customer | null;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  discountPaise: number;
  discountType: "flat" | "percentage";
};

export type CartActions = {
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  setCustomer: (customer: Customer | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setAmountPaid: (amount: number) => void;
  setDiscount: (discount: number) => void;
  setDiscountType: (type: "flat" | "percentage") => void;
  clearCart: () => void;
};

export type CartStore = CartState & CartActions;

export const defaultInitState: CartState = {
  items: [],
  customer: null,
  paymentMethod: "cash",
  amountPaid: 0,
  discountPaise: 0,
  discountType: "flat",
};

export const createCartStore = (initState: CartState = defaultInitState) =>
  createStore<CartStore>()((set, get) => ({
    ...initState,

    addItem: (item) => {
      const { productId, quantity = 1 } = item;
      set((state) => {
        const existing = state.items.find((i) => i.productId === productId);
        return {
          items: existing
            ? state.items.map((i) =>
                i.productId === productId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              )
            : [...state.items, { ...item, quantity }],
        };
      });
    },

    updateQty: (productId, quantity) => {
      if (quantity <= 0) {
        get().removeItem(productId);
        return;
      }
      set((state) => ({
        items: state.items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        ),
      }));
    },

    removeItem: (productId) =>
      set((state) => ({
        items: state.items.filter((i) => i.productId !== productId),
      })),

    setCustomer: (customer) =>
      set((state) => {
        // If removing a customer who was on credit, reset payment method
        if (!customer && state.paymentMethod === "credit") {
          return {
            customer,
            paymentMethod: "cash" as PaymentMethod,
            amountPaid: getCartTotal(state.items, state.discountPaise),
          };
        }
        return { customer };
      }),

    setPaymentMethod: (method) => set({ paymentMethod: method }),
    setAmountPaid: (amount) => set({ amountPaid: amount }),
    setDiscount: (discount) => set({ discountPaise: discount }),
    setDiscountType: (type) => set({ discountType: type }),
    clearCart: () => set(defaultInitState),
  }));

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

export function getCartTotal(items: CartItem[], discountPaise = 0): number {
  let subtotal = 0;
  let gst = 0;
  for (const item of items) {
    const lineSubtotal = item.unitPricePaise * item.quantity;
    subtotal += lineSubtotal;
    gst += Math.round((lineSubtotal * item.gstRate) / 100);
  }
  return subtotal + gst - discountPaise;
}
