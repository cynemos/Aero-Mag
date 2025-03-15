import jsPDF from 'jspdf';
import type { Order, OrderItem } from '../../../src/types/database';
import type { UserProfile } from '../../../src/lib/profile';

export const generateOrderPDF = async (order: Order & { profiles?: UserProfile, order_items: OrderItem[] }, returnBuffer: boolean = false) => {
  // Créer un nouveau document PDF
  const doc = new jsPDF();
  
  // Configuration de la police et des marges
  const margin = 20;
  let y = margin;
  
  // En-tête
  doc.setFontSize(20);
  doc.text('Bon de commande', margin, y);
  y += 10;
  
  doc.setFontSize(12);
  doc.text(`N° ${order.id.slice(0, 8)}`, margin, y);
  y += 10;
  
  doc.setFontSize(10);
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, margin, y);
  y += 15;
  
  // Informations client
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
  
  // Adresse de livraison
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
  
  // Articles commandés
  doc.setFontSize(14);
  doc.text('Articles commandés', margin, y);
  y += 10;
  
  // En-tête du tableau
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Article', margin, y);
  doc.text('Numéro', 80, y);
  doc.text('Qté', 120, y);
  doc.text('Prix unit.', 140, y);
  doc.text('Total', 170, y);
  y += 5;
  
  // Ligne de séparation
  doc.line(margin, y, 190, y);
  y += 5;
  
  // Articles
  doc.setFont('helvetica', 'normal');
  order.order_items.forEach((item) => {
    if (y > 250) {
      // Nouvelle page si on dépasse la limite
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
  
  // Ligne de séparation
  y += 5;
  doc.line(margin, y, 190, y);
  y += 10;
  
  // Totaux
  doc.text('Sous-total:', 120, y);
  doc.text(`${(order.total_amount - 2).toFixed(2)} €`, 170, y);
  y += 5;
  
  doc.text('Frais de port:', 120, y);
  doc.text('2.00 €', 170, y);
  y += 5;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 120, y);
  doc.text(`${order.total_amount.toFixed(2)} €`, 170, y);
  
  // Pied de page
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const pageHeight = doc.internal.pageSize.height;
  doc.text('Collection AéroMag - Bon de commande', margin, pageHeight - 10);
  
  if (returnBuffer) {
    return doc.output('arraybuffer');
  } else {
    // Télécharger le PDF
    doc.save(`bon-commande-${order.id.slice(0, 8)}.pdf`);
  }
};
