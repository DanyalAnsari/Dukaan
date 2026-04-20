import { create } from "zustand"

interface Shop {
  id: string
  name: string
  ownerId: string
  address: string | null
  phone: string | null
  gstin: string | null
  invoicePrefix: string
  nextInvoiceNumber: number
}

interface ShopStore {
  shop: Shop | null
  setShop: (shop: Shop | null) => void
  updateInvoiceNumber: () => void
}

export const useShopStore = create<ShopStore>((set, get) => ({
  shop: null,

  setShop: (shop) => set({ shop }),

  updateInvoiceNumber: () => {
    const shop = get().shop
    if (shop) {
      set({
        shop: {
          ...shop,
          nextInvoiceNumber: shop.nextInvoiceNumber + 1,
        },
      })
    }
  },
}))