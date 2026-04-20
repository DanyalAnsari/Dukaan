export type UserIdMap = Record<string, string>;

// ─────────────────────────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────────────────────────

export const seedUserDefs = [
  {
    key: "owner1",
    name: "Rajesh Kumar",
    email: "rajesh@shop.com",
    password: "Password123!",
    emailVerified: true,
  },
  {
    key: "owner2",
    name: "Priya Singh",
    email: "priya@store.com",
    password: "Password123!",
    emailVerified: true,
  },
  {
    key: "staff1",
    name: "Amit Patel",
    email: "amit@shop.com",
    password: "Password123!",
    emailVerified: true,
  },
];

export const TEST_CREDENTIALS = [
  { email: "rajesh@shop.com", password: "Password123!" },
  { email: "priya@store.com", password: "Password123!" },
  { email: "amit@shop.com", password: "Password123!" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Shops
// ─────────────────────────────────────────────────────────────────────────────

export const seedShops = (users: UserIdMap) => [
  {
    name: "Kumar General Store",
    ownerId: users.owner1,
    address: "123 Main Street, Mumbai, Maharashtra 400001",
    phone: "+91 98765 43210",
    gstin: "27AABCU9603R1ZM",
    invoicePrefix: "KGS",
    nextInvoiceNumber: 1001,
  },
  {
    name: "Priya Electronics",
    ownerId: users.owner2,
    address: "456 Park Road, Delhi 110001",
    phone: "+91 98765 43211",
    gstin: "07AABCU9603R1ZN",
    invoicePrefix: "PE",
    nextInvoiceNumber: 2001,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────────────────────

export const seedProducts = (shops: Record<string, string>) => [
  // Shop 1 Products
  {
    shopId: shops.shop1,
    name: "Tata Salt",
    sku: "SALT-001",
    barcode: "8901063110014",
    hsnCode: "25010091",
    unit: "kg",
    unitPricePaise: 2000, // ₹20
    mrpPaise: 2200,
    gstRate: 0,
    stockQty: 500,
    reorderLevel: 50,
    isActive: true,
  },
  {
    shopId: shops.shop1,
    name: "Fortune Sunflower Oil",
    sku: "OIL-001",
    barcode: "8901499000010",
    hsnCode: "15121100",
    unit: "liter",
    unitPricePaise: 15000, // ₹150
    mrpPaise: 16000,
    gstRate: 5,
    stockQty: 200,
    reorderLevel: 20,
    isActive: true,
  },
  {
    shopId: shops.shop1,
    name: "Parle-G Biscuits",
    sku: "BIS-001",
    barcode: "8901719100017",
    hsnCode: "19053100",
    unit: "pcs",
    unitPricePaise: 500, // ₹5
    mrpPaise: 500,
    gstRate: 12,
    stockQty: 1000,
    reorderLevel: 100,
    isActive: true,
  },
  {
    shopId: shops.shop1,
    name: "Amul Milk 1L",
    sku: "MILK-001",
    barcode: "8901430100011",
    hsnCode: "04011000",
    unit: "liter",
    unitPricePaise: 6000, // ₹60
    mrpPaise: 6200,
    gstRate: 0,
    stockQty: 50,
    reorderLevel: 10,
    isActive: true,
  },
  // Shop 2 Products
  {
    shopId: shops.shop2,
    name: 'Samsung LED TV 32"',
    sku: "TV-SAM-32",
    barcode: "8806090351013",
    hsnCode: "85287210",
    unit: "pcs",
    unitPricePaise: 1500000, // ₹15,000
    mrpPaise: 1800000,
    gstRate: 18,
    stockQty: 15,
    reorderLevel: 3,
    isActive: true,
  },
  {
    shopId: shops.shop2,
    name: "LG Washing Machine 6kg",
    sku: "WM-LG-6",
    barcode: "8806084100012",
    hsnCode: "84501100",
    unit: "pcs",
    unitPricePaise: 1200000, // ₹12,000
    mrpPaise: 1500000,
    gstRate: 28,
    stockQty: 8,
    reorderLevel: 2,
    isActive: true,
  },
  {
    shopId: shops.shop2,
    name: "Philips LED Bulb 9W",
    sku: "BULB-PHI-9",
    barcode: "8711500100016",
    hsnCode: "85395000",
    unit: "pcs",
    unitPricePaise: 15000, // ₹150
    mrpPaise: 18000,
    gstRate: 18,
    stockQty: 200,
    reorderLevel: 20,
    isActive: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Customers
// ─────────────────────────────────────────────────────────────────────────────

export const seedCustomers = (shops: Record<string, string>) => [
  // Shop 1 Customers
  {
    shopId: shops.shop1,
    name: "Suresh Sharma",
    phone: "+91 98765 11111",
    email: "suresh@example.com",
    address: "Flat 101, ABC Apartments, Mumbai",
    outstandingBalancePaise: 0,
    creditLimitPaise: 1000000, // ₹10,000
    isActive: true,
  },
  {
    shopId: shops.shop1,
    name: "Anita Desai",
    phone: "+91 98765 22222",
    email: null,
    address: "House 25, XYZ Colony, Mumbai",
    outstandingBalancePaise: 50000, // ₹500
    creditLimitPaise: 500000,
    isActive: true,
  },
  {
    shopId: shops.shop1,
    name: "Walk-in Customer",
    phone: null,
    email: null,
    address: null,
    outstandingBalancePaise: 0,
    creditLimitPaise: null,
    isActive: true,
  },
  // Shop 2 Customers
  {
    shopId: shops.shop2,
    name: "Vikram Malhotra",
    phone: "+91 98765 33333",
    email: "vikram@example.com",
    address: "B-45, Green Park, Delhi",
    outstandingBalancePaise: 0,
    creditLimitPaise: 5000000, // ₹50,000
    isActive: true,
  },
  {
    shopId: shops.shop2,
    name: "Neha Kapoor",
    phone: "+91 98765 44444",
    email: "neha@example.com",
    address: "C-12, South Extension, Delhi",
    outstandingBalancePaise: 15000000, // ₹1,50,000
    creditLimitPaise: 20000000,
    isActive: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Bills
// ─────────────────────────────────────────────────────────────────────────────

export const seedBills = (
  shops: Record<string, string>,
  customers: Record<string, string>
) => [
  {
    shopId: shops.shop1,
    invoiceNumber: "KGS-1001",
    customerId: customers.customer1,
    billDate: new Date("2024-01-15T10:30:00"),
    subtotalPaise: 21500, // ₹215
    discountPaise: 0,
    gstTotalPaise: 1290, // 12% on biscuits, 5% on oil
    totalPaise: 22790,
    status: "paid",
    amountPaidPaise: 22790,
    amountDuePaise: 0,
    notes: null,
  },
  {
    shopId: shops.shop1,
    invoiceNumber: "KGS-1002",
    customerId: customers.customer2,
    billDate: new Date("2024-01-16T14:20:00"),
    subtotalPaise: 6500, // ₹65
    discountPaise: 500,
    gstTotalPaise: 0,
    totalPaise: 6000,
    status: "credit",
    amountPaidPaise: 0,
    amountDuePaise: 6000,
    notes: "Pay by end of month",
  },
  {
    shopId: shops.shop2,
    invoiceNumber: "PE-2001",
    customerId: customers.customer4,
    billDate: new Date("2024-01-10T11:00:00"),
    subtotalPaise: 1500000, // ₹15,000
    discountPaise: 50000, // ₹500 discount
    gstTotalPaise: 261000, // 18% GST
    totalPaise: 1711000,
    status: "paid",
    amountPaidPaise: 1711000,
    amountDuePaise: 0,
    notes: "New Year Sale",
  },
  {
    shopId: shops.shop2,
    invoiceNumber: "PE-2002",
    customerId: customers.customer5,
    billDate: new Date("2024-01-12T15:30:00"),
    subtotalPaise: 1200000, // ₹12,000
    discountPaise: 0,
    gstTotalPaise: 336000, // 28% GST
    totalPaise: 1536000,
    status: "partial",
    amountPaidPaise: 1000000, // ₹10,000 paid
    amountDuePaise: 536000, // ₹5,360 due
    notes: "Remaining amount to be paid on delivery",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Bill Items
// ─────────────────────────────────────────────────────────────────────────────

export const seedBillItems = (
  bills: Record<string, string>,
  products: Record<string, string>
) => [
  // Bill 1 items
  {
    billId: bills.bill1,
    productId: products.product1,
    productName: "Tata Salt",
    productSku: "SALT-001",
    unit: "kg",
    quantity: 2,
    unitPricePaise: 2000,
    gstRate: 0,
    gstAmountPaise: 0,
    lineTotalPaise: 4000,
  },
  {
    billId: bills.bill1,
    productId: products.product2,
    productName: "Fortune Sunflower Oil",
    productSku: "OIL-001",
    unit: "liter",
    quantity: 1,
    unitPricePaise: 15000,
    gstRate: 5,
    gstAmountPaise: 750,
    lineTotalPaise: 15750,
  },
  {
    billId: bills.bill1,
    productId: products.product3,
    productName: "Parle-G Biscuits",
    productSku: "BIS-001",
    unit: "pcs",
    quantity: 5,
    unitPricePaise: 500,
    gstRate: 12,
    gstAmountPaise: 300,
    lineTotalPaise: 2800,
  },
  // Bill 2 items
  {
    billId: bills.bill2,
    productId: products.product4,
    productName: "Amul Milk 1L",
    productSku: "MILK-001",
    unit: "liter",
    quantity: 1,
    unitPricePaise: 6000,
    gstRate: 0,
    gstAmountPaise: 0,
    lineTotalPaise: 6000,
  },
  {
    billId: bills.bill2,
    productId: products.product1,
    productName: "Tata Salt",
    productSku: "SALT-001",
    unit: "kg",
    quantity: 1,
    unitPricePaise: 2000,
    gstRate: 0,
    gstAmountPaise: 0,
    lineTotalPaise: 2000,
  },
  // Bill 3 items
  {
    billId: bills.bill3,
    productId: products.product5,
    productName: 'Samsung LED TV 32"',
    productSku: "TV-SAM-32",
    unit: "pcs",
    quantity: 1,
    unitPricePaise: 1500000,
    gstRate: 18,
    gstAmountPaise: 270000,
    lineTotalPaise: 1770000,
  },
  // Bill 4 items
  {
    billId: bills.bill4,
    productId: products.product6,
    productName: "LG Washing Machine 6kg",
    productSku: "WM-LG-6",
    unit: "pcs",
    quantity: 1,
    unitPricePaise: 1200000,
    gstRate: 28,
    gstAmountPaise: 336000,
    lineTotalPaise: 1536000,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Payments
// ─────────────────────────────────────────────────────────────────────────────

export const seedPayments = (
  shops: Record<string, string>,
  customers: Record<string, string>,
  bills: Record<string, string>
) => [
  {
    shopId: shops.shop1,
    customerId: customers.customer1,
    billId: bills.bill1,
    amountPaise: 22790,
    paymentMethod: "upi",
    referenceNumber: "UPI123456789",
    notes: "Google Pay",
    createdAt: new Date("2024-01-15T10:35:00"),
  },
  {
    shopId: shops.shop2,
    customerId: customers.customer4,
    billId: bills.bill3,
    amountPaise: 1711000,
    paymentMethod: "card",
    referenceNumber: "CARD987654321",
    notes: "HDFC Credit Card",
    createdAt: new Date("2024-01-10T11:05:00"),
  },
  {
    shopId: shops.shop2,
    customerId: customers.customer5,
    billId: bills.bill4,
    amountPaise: 1000000,
    paymentMethod: "cash",
    referenceNumber: null,
    notes: "Partial payment",
    createdAt: new Date("2024-01-12T15:35:00"),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Purchases (Inventory Restocking)
// ─────────────────────────────────────────────────────────────────────────────

export const seedPurchases = (
  shops: Record<string, string>,
  products: Record<string, string>
) => [
  {
    shopId: shops.shop1,
    productId: products.product1,
    purchaseDate: new Date("2024-01-01T09:00:00"),
    quantity: 500,
    unitCostPaise: 1800,
    batchNumber: "SALT-JAN-2024",
    expiryDate: new Date("2025-12-31"),
    supplierName: "Tata Consumer Products",
    notes: "Opening stock",
  },
  {
    shopId: shops.shop1,
    productId: products.product2,
    purchaseDate: new Date("2024-01-01T09:00:00"),
    quantity: 200,
    unitCostPaise: 14000,
    batchNumber: "OIL-JAN-2024",
    expiryDate: new Date("2025-06-30"),
    supplierName: "Adani Wilmar",
    notes: "Opening stock",
  },
  {
    shopId: shops.shop2,
    productId: products.product5,
    purchaseDate: new Date("2023-12-15T10:00:00"),
    quantity: 20,
    unitCostPaise: 1300000,
    batchNumber: "TV-DEC-2023",
    expiryDate: null,
    supplierName: "Samsung India Electronics",
    notes: "Year-end stock",
  },
  {
    shopId: shops.shop2,
    productId: products.product7,
    purchaseDate: new Date("2024-01-05T11:30:00"),
    quantity: 300,
    unitCostPaise: 12000,
    batchNumber: "BULB-JAN-2024",
    expiryDate: null,
    supplierName: "Philips India Ltd",
    notes: "Monthly stock",
  },
];
