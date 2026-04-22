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

export const UNIT_OPTIONS = [
  { value: "pcs", label: "Pieces (pcs)" },
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "ltr", label: "Liter (ltr)" },
  { value: "pkt", label: "Packet (pkt)" },
  { value: "box", label: "Box" },
] as const;

export const GST_RATE_OPTIONS = [
  { value: "0", label: "0% (Nil)" },
  { value: "5", label: "5%" },
  { value: "12", label: "12%" },
  { value: "18", label: "18%" },
  { value: "28", label: "28%" },
] as const;

export const PAYMENT_METHODS = ["cash", "upi", "card"] as const;
