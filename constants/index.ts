export const LOGO = "Dukaan";

export const GST_RATES = [0, 5, 12, 18, 28] as const;

export const STEPS = [
  {
    name: "basics" as const,
    label: "Shop Basics",
    fields: ["name", "phone"] as const,
  },
  {
    name: "legal" as const,
    label: "Tax & Legal",
    fields: ["gstin", "pan"] as const,
  },
  {
    name: "billing" as const,
    label: "Billing Config",
    fields: ["upiId", "invoicePrefix", "address"] as const,
  },
] as const;
