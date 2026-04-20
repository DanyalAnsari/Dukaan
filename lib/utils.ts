import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to get start of today
export function startOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

// Indian number format with paise → rupees conversion
export function formatCurrency(paise: number): string {
  return (paise / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Amount in words for invoice footer
const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
];
const teens = [
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function numberToWords(n: number): string {
  if (n === 0) return "Zero";

  const words = [];
  if (n >= 10000000) {
    words.push(numberToWords(Math.floor(n / 10000000)) + " Crore");
    n %= 10000000;
  }
  if (n >= 100000) {
    words.push(numberToWords(Math.floor(n / 100000)) + " Lakh");
    n %= 100000;
  }
  if (n >= 1000) {
    words.push(numberToWords(Math.floor(n / 1000)) + " Thousand");
    n %= 1000;
  }
  if (n >= 100) {
    words.push(numberToWords(Math.floor(n / 100)) + " Hundred");
    n %= 100;
  }
  if (n >= 20) {
    words.push(tens[Math.floor(n / 10)]);
    if (n % 10) words.push(ones[n % 10]);
  } else if (n >= 10) {
    words.push(teens[n - 10]);
  } else if (n > 0) {
    words.push(ones[n]);
  }

  return words.join(" ");
}

export function amountInWords(paise: number): string {
  const rupees = Math.floor(paise / 100);
  const remainingPaise = paise % 100;

  if (rupees === 0 && remainingPaise === 0) {
    return "Zero";
  }

  let words = "Rupees ";

  if (rupees > 0) {
    words += numberToWords(rupees);
  }

  if (remainingPaise > 0) {
    if (rupees > 0) words += " and ";
    words += numberToWords(remainingPaise) + " Paise";
  }

  return words + " Only";
}
