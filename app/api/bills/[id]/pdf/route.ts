import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database";
import { bills, shops } from "@/database/schemas";
import { getSession } from "@/lib/get-session";
import { eq } from "drizzle-orm";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

const fontPath = path.join(process.cwd(), "public/fonts/Roboto/static");

// Verify fonts exist
function verifyFonts() {
  const fonts = {
    Regular: path.join(fontPath, "Roboto-Regular.ttf"),
    Bold: path.join(fontPath, "Roboto-Bold.ttf"),
    Italic: path.join(fontPath, "Roboto-Italic.ttf"),
  };

  for (const [name, filePath] of Object.entries(fonts)) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Font file not found: ${name} at ${filePath}`);
    }
  }

  return fonts;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const bill = await db.query.bills.findFirst({
      where: eq(bills.id, id),
      with: { items: true, customer: true },
    });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    const shop = await db.query.shops.findFirst({
      where: eq(shops.id, bill.shopId),
    });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    // Verify fonts exist before creating PDF
    const fonts = verifyFonts();

    // ===== STREAMING PDF GENERATION =====
    const stream = new ReadableStream({
      start(controller) {
        const doc = new PDFDocument({
          size: "A4",
          margin: 50,
          font:path.join(fontPath, "Roboto-Regular.ttf"),
          bufferPages: true,
          autoFirstPage: false, // We'll add the first page manually
        });

        // Register fonts BEFORE creating any pages
        doc.registerFont("Regular", fonts.Regular);
        doc.registerFont("Bold", fonts.Bold);
        doc.registerFont("Italic", fonts.Italic);

        // Now add the first page with default font set
        doc.addPage();
        doc.font("Regular"); // Set default font

        // Stream PDF data
        doc.on("data", (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });

        doc.on("end", () => {
          controller.close();
        });

        doc.on("error", (err) => {
          console.error("PDF generation error:", err);
          controller.error(err);
        });

        // ===== PDF GENERATION =====
        try {
          generatePDF(doc, bill, shop);
          doc.end();
        } catch (error) {
          console.error("Error in generatePDF:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Invoice-${bill.invoiceNumber}.pdf"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ===== IMPROVED PDF LAYOUT =====
function generatePDF(doc: PDFKit.PDFDocument, bill: any, shop: any) {
  const formatCurrency = (paise: number) => `₹${(paise / 100).toFixed(2)}`;

  const cgst = Math.floor(bill.gstTotalPaise / 2);
  const sgst = bill.gstTotalPaise - cgst;

  // Page dimensions
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 50;
  const contentWidth = pageWidth - 2 * margin;

  // Colors
  const primaryColor = "#1a1a1a";
  const secondaryColor = "#666666";
  const accentColor = "#2563eb";
  const borderColor = "#e5e7eb";
  const lightBg = "#f9fafb";

  let y = margin;

  // ================= HEADER SECTION =================
  // Company Name
  doc
    .font("Bold")
    .fontSize(24)
    .fillColor(primaryColor)
    .text(shop.name.toUpperCase(), margin, y, {
      width: contentWidth * 0.6,
    });

  // Invoice Title (Right aligned)
  doc
    .font("Bold")
    .fontSize(20)
    .fillColor(accentColor)
    .text("INVOICE", pageWidth - margin - 120, y, {
      width: 120,
      align: "right",
    });

  y += 35;

  // Company Details
  doc.font("Regular").fontSize(9).fillColor(secondaryColor);

  if (shop.address) {
    doc.text(shop.address, margin, y, {
      width: contentWidth * 0.6,
      lineGap: 2,
    });
    y += 15;
  }

  if (shop.phone) {
    doc.text(`Phone: ${shop.phone}`, margin, y);
    y += 12;
  }

  if (shop.email) {
    doc.text(`Email: ${shop.email}`, margin, y);
    y += 12;
  }

  if (shop.gstin) {
    doc.text(`GSTIN: ${shop.gstin}`, margin, y);
  }

  // Invoice Meta (Right side)
  const metaX = pageWidth - margin - 140;
  let metaY = margin + 35;

  doc.font("Bold").fontSize(9).fillColor(primaryColor);

  doc.text("Invoice No:", metaX, metaY);
  doc.font("Regular").text(bill.invoiceNumber, metaX + 70, metaY);
  metaY += 15;

  doc.font("Bold").text("Date:", metaX, metaY);
  doc.font("Regular").text(
    new Date(bill.billDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    metaX + 70,
    metaY
  );
  metaY += 15;

  if (bill.paymentMethod) {
    doc.font("Bold").text("Payment:", metaX, metaY);
    doc
      .font("Regular")
      .text(bill.paymentMethod.toUpperCase(), metaX + 70, metaY);
  }

  // Divider line
  y = Math.max(y, metaY) + 20;
  doc
    .strokeColor(borderColor)
    .lineWidth(1)
    .moveTo(margin, y)
    .lineTo(pageWidth - margin, y)
    .stroke();

  y += 25;

  // ================= BILL TO SECTION =================
  doc
    .font("Bold")
    .fontSize(11)
    .fillColor(primaryColor)
    .text("BILL TO:", margin, y);

  y += 18;

  doc.font("Regular").fontSize(10).fillColor(primaryColor);

  if (bill.customer) {
    doc.text(bill.customer.name, margin, y);
    y += 15;
    if (bill.customer.phone) {
      doc
        .fillColor(secondaryColor)
        .text(`Phone: ${bill.customer.phone}`, margin, y);
      y += 15;
    }
    if (bill.customer.email) {
      doc.text(`Email: ${bill.customer.email}`, margin, y);
      y += 15;
    }
    if (bill.customer.address) {
      doc.text(bill.customer.address, margin, y, {
        width: contentWidth * 0.5,
      });
      y += 20;
    }
  } else {
    doc.text("Walk-in Customer", margin, y);
    y += 25;
  }

  y += 10;

  // ================= TABLE SECTION =================
  const tableTop = y;
  const tableHeaders = ["#", "Item", "Qty", "Rate", "GST", "Amount"];
  const colWidths = [30, 220, 50, 80, 50, 90];
  const colX = colWidths.reduce((acc, width, i) => {
    acc.push(i === 0 ? margin : acc[i - 1] + colWidths[i - 1]);
    return acc;
  }, [] as number[]);

  const rowHeight = 30;
  const headerHeight = 35;

  // Table Header Background
  doc
    .rect(margin, tableTop, contentWidth, headerHeight)
    .fillAndStroke(lightBg, borderColor);

  // Table Headers
  doc.font("Bold").fontSize(10).fillColor(primaryColor);

  tableHeaders.forEach((header, i) => {
    const align = i === 0 || i === 1 ? "left" : "right";
    const textX =
      align === "right" ? colX[i] + colWidths[i] - 10 : colX[i] + 10;

    doc.text(header, textX, tableTop + 12, {
      width: colWidths[i] - 20,
      align: align,
    });
  });

  y = tableTop + headerHeight;

  // Table Rows
  doc.font("Regular").fontSize(9);

  bill.items.forEach((item: any, index: number) => {
    // Check if we need a new page
    if (y + rowHeight > pageHeight - 150) {
      doc.addPage();
      y = margin;
    }

    // Alternate row background
    if (index % 2 === 1) {
      doc
        .rect(margin, y, contentWidth, rowHeight)
        .fillAndStroke(lightBg, borderColor)
        .stroke();
    } else {
      doc.rect(margin, y, contentWidth, rowHeight).stroke(borderColor);
    }

    doc.fillColor(primaryColor);

    // Serial Number
    doc.text(String(index + 1), colX[0] + 10, y + 10, {
      width: colWidths[0] - 20,
      align: "left",
    });

    // Item Name
    doc.font("Regular").text(item.productName, colX[1] + 10, y + 10, {
      width: colWidths[1] - 20,
      align: "left",
      lineGap: 1,
    });

    // Quantity
    doc.text(
      `${item.quantity} ${item.unit || ""}`.trim(),
      colX[2] + colWidths[2] - 10,
      y + 10,
      {
        width: colWidths[2] - 20,
        align: "right",
      }
    );

    // Rate
    doc.text(
      formatCurrency(item.unitPricePaise),
      colX[3] + colWidths[3] - 10,
      y + 10,
      {
        width: colWidths[3] - 20,
        align: "right",
      }
    );

    // GST Rate
    doc.text(`${item.gstRate}%`, colX[4] + colWidths[4] - 10, y + 10, {
      width: colWidths[4] - 20,
      align: "right",
    });

    // Line Total
    doc
      .font("Bold")
      .text(
        formatCurrency(item.lineTotalPaise),
        colX[5] + colWidths[5] - 10,
        y + 10,
        {
          width: colWidths[5] - 20,
          align: "right",
        }
      );

    y += rowHeight;
  });

  // Bottom border
  doc
    .strokeColor(borderColor)
    .lineWidth(1)
    .moveTo(margin, y)
    .lineTo(pageWidth - margin, y)
    .stroke();

  y += 30;

  // ================= TOTALS SECTION =================
  const totalsX = pageWidth - margin - 250;
  const totalsWidth = 250;
  const totalRowHeight = 25;

  // Helper function for total rows
  const addTotalRow = (
    label: string,
    amount: string,
    isBold = false,
    backgroundColor?: string
  ) => {
    if (backgroundColor) {
      doc.rect(totalsX, y, totalsWidth, totalRowHeight).fill(backgroundColor);
    }

    doc
      .font(isBold ? "Bold" : "Regular")
      .fontSize(isBold ? 11 : 10)
      .fillColor(primaryColor)
      .text(label, totalsX + 15, y + 8, {
        width: 150,
        align: "left",
      });

    doc.text(amount, totalsX + 165, y + 8, {
      width: 70,
      align: "right",
    });

    doc
      .strokeColor(borderColor)
      .lineWidth(0.5)
      .rect(totalsX, y, totalsWidth, totalRowHeight)
      .stroke();

    y += totalRowHeight;
  };

  // Subtotal
  addTotalRow("Subtotal", formatCurrency(bill.subtotalPaise));

  // CGST
  addTotalRow("CGST", formatCurrency(cgst));

  // SGST
  addTotalRow("SGST", formatCurrency(sgst));

  // Discount (if any)
  if (bill.discountPaise && bill.discountPaise > 0) {
    addTotalRow("Discount", `- ${formatCurrency(bill.discountPaise)}`);
  }

  // Total (highlighted)
  doc.font("Bold").fontSize(12);
  addTotalRow("TOTAL", formatCurrency(bill.totalPaise), true, lightBg);

  y += 20;

  // ================= AMOUNT IN WORDS =================
  const amountInWords = numberToWords(Math.floor(bill.totalPaise / 100));
  doc
    .font("Italic")
    .fontSize(9)
    .fillColor(secondaryColor)
    .text(`Amount in words: ${amountInWords} Rupees Only`, margin, y, {
      width: contentWidth,
    });

  y += 40;

  // ================= NOTES/TERMS =================
  if (bill.notes) {
    doc
      .font("Bold")
      .fontSize(10)
      .fillColor(primaryColor)
      .text("Notes:", margin, y);
    y += 15;
    doc
      .font("Regular")
      .fontSize(9)
      .fillColor(secondaryColor)
      .text(bill.notes, margin, y, {
        width: contentWidth * 0.6,
      });
  }

  // ================= FOOTER =================
  const footerY = pageHeight - margin - 50;

  // Signature section
  doc
    .font("Regular")
    .fontSize(9)
    .fillColor(secondaryColor)
    .text("Authorized Signature", pageWidth - margin - 150, footerY, {
      width: 150,
      align: "center",
    });

  doc
    .strokeColor(borderColor)
    .lineWidth(1)
    .moveTo(pageWidth - margin - 150, footerY + 30)
    .lineTo(pageWidth - margin, footerY + 30)
    .stroke();

  // Thank you note
  doc
    .font("Italic")
    .fontSize(10)
    .fillColor(accentColor)
    .text("Thank you for your business!", margin, pageHeight - margin - 30, {
      width: contentWidth,
      align: "center",
    });

  // Page number (if multiple pages)
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc
      .font("Regular")
      .fontSize(8)
      .fillColor(secondaryColor)
      .text(
        `Page ${i + 1} of ${pages.count}`,
        margin,
        pageHeight - margin + 10,
        {
          align: "center",
          width: contentWidth,
        }
      );
  }
}

// ===== HELPER FUNCTION: NUMBER TO WORDS =====
function numberToWords(num: number): string {
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

  if (num === 0) return "Zero";

  const crores = Math.floor(num / 10000000);
  const lakhs = Math.floor((num % 10000000) / 100000);
  const thousands = Math.floor((num % 100000) / 1000);
  const hundreds = Math.floor((num % 1000) / 100);
  const remainder = num % 100;

  let words = "";

  if (crores > 0) {
    words += convertTwoDigit(crores) + " Crore ";
  }

  if (lakhs > 0) {
    words += convertTwoDigit(lakhs) + " Lakh ";
  }

  if (thousands > 0) {
    words += convertTwoDigit(thousands) + " Thousand ";
  }

  if (hundreds > 0) {
    words += ones[hundreds] + " Hundred ";
  }

  if (remainder > 0) {
    if (remainder < 10) {
      words += ones[remainder];
    } else if (remainder < 20) {
      words += teens[remainder - 10];
    } else {
      words += tens[Math.floor(remainder / 10)];
      if (remainder % 10 > 0) {
        words += " " + ones[remainder % 10];
      }
    }
  }

  return words.trim();

  function convertTwoDigit(n: number): string {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    return (
      tens[Math.floor(n / 10)] + (n % 10 > 0 ? " " + ones[n % 10] : "")
    ).trim();
  }
}
