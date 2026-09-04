import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface BudgetItem {
  item: string;
  cost: number;
}

export const generateBudgetPDF = (programTitle: string, items: BudgetItem[], currency: string = 'UGX') => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text('Program Budget', 14, 22);
  
  // Program Name
  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text(`Program: ${programTitle}`, 14, 32);

  // Date Generated
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 40);

  // Prepare Data for AutoTable
  const tableData = items.map(item => [
    item.item,
    `${currency} ${item.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  ]);

  const totalCost = items.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
  
  // Add total row
  tableData.push([
    'TOTAL ESTIMATED COST',
    `${currency} ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  ]);

  // Generate Table
  autoTable(doc, {
    startY: 48,
    head: [['Item Description', 'Estimated Cost']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [147, 51, 234] }, // Purple-600
    styles: { fontSize: 11, cellPadding: 6 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 50, halign: 'right' }
    },
    didParseCell: (data) => {
      // Make the total row bold
      if (data.row.index === items.length) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.textColor = [147, 51, 234];
      }
    }
  });

  // Save the PDF
  const filename = `Budget-${programTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
  doc.save(filename);
};
