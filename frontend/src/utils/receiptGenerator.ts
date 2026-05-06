import jsPDF from 'jspdf';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

interface ReceiptData {
  orderId: string;
  items: ReceiptItem[];
  customerType: string;
  date: string;
  total: number;
  tax: number;
  grandTotal: number;
  paymentMethod: string;
  transactionId: string;
}

export const generateReceipt = (data: ReceiptData): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200] // Thermal printer width
  });

  const pageWidth = 80;
  const margin = 5;
  const contentWidth = pageWidth - margin * 2;
  let y = 10;

  // Helper functions
  const centerText = (text: string, yPos: number, size: number = 10, style: string = 'normal') => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, yPos);
  };

  const leftRight = (left: string, right: string, yPos: number, size: number = 9) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', 'normal');
    doc.text(left, margin, yPos);
    const rightWidth = doc.getTextWidth(right);
    doc.text(right, pageWidth - margin - rightWidth, yPos);
  };

  const dashedLine = (yPos: number) => {
    doc.setLineDashPattern([1, 1], 0);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
  };

  // === HEADER ===
  centerText('☕ BEAN & BREW', y, 16, 'bold');
  y += 6;
  centerText('Smart Coffee Queue System', y, 8);
  y += 4;
  centerText('123 Coffee Lane, Brew City', y, 7);
  y += 3;
  centerText('GSTIN: 29AABCU9603R1ZM', y, 7);
  y += 5;
  dashedLine(y);
  y += 5;

  // === ORDER INFO ===
  centerText('TAX INVOICE', y, 11, 'bold');
  y += 6;
  leftRight('Order #:', data.orderId.substring(0, 8).toUpperCase(), y, 8);
  y += 4;
  leftRight('Date:', data.date, y, 8);
  y += 4;
  leftRight('Customer:', data.customerType, y, 8);
  y += 4;
  leftRight('Payment:', data.paymentMethod, y, 8);
  y += 5;
  dashedLine(y);
  y += 5;

  // === ITEMS HEADER ===
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Item', margin, y);
  doc.text('Qty', margin + 38, y);
  const priceHeader = 'Amount';
  doc.text(priceHeader, pageWidth - margin - doc.getTextWidth(priceHeader), y);
  y += 3;
  dashedLine(y);
  y += 4;

  // === ITEMS ===
  doc.setFont('helvetica', 'normal');
  data.items.forEach((item) => {
    doc.setFontSize(8);
    doc.text(item.name, margin, y);
    doc.text(`x${item.quantity}`, margin + 40, y);
    const amountStr = `₹${(item.price * item.quantity).toFixed(2)}`;
    doc.text(amountStr, pageWidth - margin - doc.getTextWidth(amountStr), y);
    y += 5;
  });

  y += 1;
  dashedLine(y);
  y += 5;

  // === TOTALS ===
  leftRight('Subtotal:', `₹${data.total.toFixed(2)}`, y, 9);
  y += 5;
  leftRight(`GST (5%):`, `₹${data.tax.toFixed(2)}`, y, 9);
  y += 3;
  dashedLine(y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', margin, y);
  const totalStr = `₹${data.grandTotal.toFixed(2)}`;
  doc.text(totalStr, pageWidth - margin - doc.getTextWidth(totalStr), y);
  y += 3;
  dashedLine(y);
  y += 6;

  // === TRANSACTION ===
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  centerText(`Txn ID: ${data.transactionId}`, y, 7);
  y += 8;

  // === FOOTER ===
  centerText('Thank you for your visit!', y, 9, 'bold');
  y += 4;
  centerText('See you again soon ☕', y, 8);
  y += 6;
  centerText('--- Powered by Bean & Brew ---', y, 6);

  return doc;
};

export const downloadReceipt = (data: ReceiptData) => {
  const doc = generateReceipt(data);
  doc.save(`receipt_${data.orderId.substring(0, 8)}.pdf`);
};

export const printReceipt = (data: ReceiptData) => {
  const doc = generateReceipt(data);
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  const printWindow = window.open(url);
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
