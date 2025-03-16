import jsPDF from 'jspdf';
import type { Order, OrderItem } from '../types/database';
import type { UserProfile } from './profile';

export const generateOrderPDF = async (order: Order & { profiles?: UserProfile, order_items: OrderItem[] }, type: 'order' | 'invoice' = 'order') => {
  // Create a new PDF document
  const doc = new jsPDF();

  // Set font and margins
  const margin = 20;
  let y = margin;

  // Header
  doc.setFontSize(20);
  doc.text(type === 'invoice' ? 'Facture' : 'Bon de commande', margin, y);
  y += 10;

  doc.setFontSize(12);
  doc.text(`N° ${order.id.slice(0, 8)}`, margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, margin, y);
  y += 15;

  // Customer information
  doc.setFontSize(14);
  doc.text('Informations Client', margin, y);
  y += 10;

  doc.setFontSize(10);
  if (order.profiles) {
    doc.text(`${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`, margin, y);
    y += 5;
    doc.text(order.profiles.email || '', margin, y);
    y += 5;
  }

  // Shipping address
  y += 10;
  doc.setFontSize(14);
  doc.text('Adresse de livraison', margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.text(order.shipping_address.street, margin, y);
  y += 5;
  doc.text(`${order.shipping_address.postal_code} ${order.shipping_address.city}`, margin, y);
  y += 5;
  doc.text(order.shipping_address.country, margin, y);
  y += 15;

  // Ordered items
  doc.setFontSize(14);
  doc.text('Articles commandés', margin, y);
  y += 10;

  // Table header
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Article', margin, y);
  doc.text('Numéro', 80, y);
  doc.text('Qté', 120, y);
  doc.text('Prix unit.', 140, y);
  doc.text('Total', 170, y);
  y += 5;

  // Separator line
  doc.line(margin, y, 190, y);
  y += 5;

  // Items
  doc.setFont('helvetica', 'normal');
  order.order_items.forEach((item) => {
    if (y > 250) {
      // New page if exceeding limit
      doc.addPage();
      y = margin;
    }

    doc.text(item.magazine?.title || '', margin, y);
    doc.text(item.magazine?.issue_number || '', 80, y);
    doc.text(item.quantity.toString(), 120, y);
    doc.text(`${item.price_at_time.toFixed(2)} €`, 140, y);
    doc.text(`${(item.price_at_time * item.quantity).toFixed(2)} €`, 170, y);
    y += 8;
  });

  // Separator line
  y += 5;
  doc.line(margin, y, 190, y);
  y += 10;

  // Totals
  doc.text('Sous-total:', 120, y);
  doc.text(`${(order.total_amount - 2).toFixed(2)} €`, 170, y);
  y += 5;

  doc.text('Frais de port:', 120, y);
  doc.text('2.00 €', 170, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 120, y);
  doc.text(`${order.total_amount.toFixed(2)} €`, 170, y);

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const pageHeight = doc.internal.pageSize.height;
  doc.text('Collection AéroMag - ' + (type === 'invoice' ? 'Facture' : 'Bon de commande'), margin, pageHeight - 10);

  // Convert the PDF to a Blob
  const pdfBlob = doc.output('blob');

  // Trigger the download using a temporary URL
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const downloadLink = document.createElement('a');
  downloadLink.href = pdfUrl;
  downloadLink.download = `${type === 'invoice' ? 'facture' : 'bon-commande'}-${order.id.slice(0, 8)}.pdf`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  // Revoke the temporary URL
  URL.revokeObjectURL(pdfUrl);
};
