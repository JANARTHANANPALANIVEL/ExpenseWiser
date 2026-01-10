import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SpendRecord } from './types';
import { format, parseISO } from 'date-fns';

export const exportToCSV = (records: SpendRecord[], monthLabel: string) => {
  const headers = ['Date', 'Purpose', 'Amount (₹)', 'Payment Method'];
  
  const rows = records.map((record) => [
    format(parseISO(record.date), 'yyyy-MM-dd'),
    record.purpose,
    record.amount.toFixed(2),
    record.method === 'gpay' ? 'GPay' : 'Hand',
  ]);

  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);
  rows.push(['', 'TOTAL', totalAmount.toFixed(2), '']);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `expenses-${monthLabel}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (records: SpendRecord[], monthLabel: string) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(89, 68, 48); // Brown color
  doc.text('ExpenseWise', 14, 20);
  
  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text(`Monthly Expense Report - ${monthLabel}`, 14, 30);
  
  // Summary
  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);
  const handTotal = records.filter(r => r.method === 'hand').reduce((sum, r) => sum + r.amount, 0);
  const gpayTotal = records.filter(r => r.method === 'gpay').reduce((sum, r) => sum + r.amount, 0);
  
  doc.setFontSize(11);
  doc.setTextColor(60);
  doc.text(`Total Expenses: ₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 14, 42);
  doc.text(`Hand: ₹${handTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}  |  GPay: ₹${gpayTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 14, 50);
  
  // Table
  const tableData = records.map((record) => [
    format(parseISO(record.date), 'MMM dd, yyyy'),
    record.purpose,
    `₹${record.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    record.method === 'gpay' ? 'GPay' : 'Hand',
  ]);

  autoTable(doc, {
    head: [['Date', 'Purpose', 'Amount', 'Method']],
    body: tableData,
    startY: 58,
    theme: 'grid',
    headStyles: {
      fillColor: [89, 68, 48],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 240, 235],
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 80 },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 30 },
    },
    foot: [['', 'Total', `₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, '']],
    footStyles: {
      fillColor: [89, 68, 48],
      textColor: 255,
      fontStyle: 'bold',
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')} | Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  doc.save(`expenses-${monthLabel}.pdf`);
};
