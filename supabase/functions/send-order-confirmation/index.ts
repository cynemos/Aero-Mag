import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import jsPDF from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
import type { Order, OrderItem } from '../../../src/types/database';
import type { UserProfile } from '../../../src/lib/profile';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// generateOrderPDF function
const generateOrderPDF = async (order: Order & { profiles?: UserProfile, order_items: OrderItem[] }, type: 'order' | 'invoice' = 'order', returnBuffer: boolean = false) => {
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
    
    if (returnBuffer) {
      return doc.output('arraybuffer');
    } else {
      // Download the PDF
      doc.save(`${type === 'invoice' ? 'facture' : 'bon-commande'}-${order.id.slice(0, 8)}.pdf`);
    }
  };

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { order, profile, adminEmail } = await req.json();

    // Generate the order PDF
    const pdfBuffer = await generateOrderPDF(order, 'order', true);

    // Convert the PDF buffer to a base64 string
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

    // Construct the email HTML
    const orderHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .header { background: #f3f4f6; padding: 20px; }
            .content { padding: 20px; }
            .footer { padding: 20px; text-align: center; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Nouvelle Commande #${order.id.slice(0, 8)}</h1>
            <p>Date: ${new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          
          <div class="content">
            <h2>Informations Client</h2>
            <p>Nom: ${profile.first_name || ''} ${profile.last_name || ''}</p>
            <p>Email: ${profile.email || ''}</p>
            
            <h3>Adresse de livraison</h3>
            <p>${order.shipping_address.street}<br>
            ${order.shipping_address.postal_code} ${order.shipping_address.city}<br>
            ${order.shipping_address.country}</p>
            
            <h2>Articles commandés</h2>
            <table>
              <thead>
                <tr>
                  <th>Magazine</th>
                  <th>Numéro</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.order_items.map(item => `
                  <tr>
                    <td>${item.magazine.title}</td>
                    <td>${item.magazine.issue_number}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price_at_time.toFixed(2)} €</td>
                    <td>${(item.price_at_time * item.quantity).toFixed(2)} €</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <h3>Total: ${order.total_amount.toFixed(2)} €</h3>
          </div>
          
          <div class="footer">
            <p>Collection AéroMag - Confirmation de commande</p>
          </div>
        </body>
      </html>
    `;

    // Prepare the Postmark API request
    const postmarkApiToken = Deno.env.get('VITE_POSTMARK_API_KEY');
    if (!postmarkApiToken) {
      throw new Error('POSTMARK_API_TOKEN is not set in the environment.');
    }

    const postmarkEndpoint = 'https://api.postmarkapp.com/email';
    const emailData = {
      From: Deno.env.get('VITE_POSTMARK_FROM_EMAIL')!, // Use the same email as before
      To: adminEmail,
      Subject: `Nouvelle commande #${order.id.slice(0, 8)}`,
      HtmlBody: orderHtml,
      Attachments: [
        {
          Name: `bon-commande-${order.id.slice(0, 8)}.pdf`,
          Content: pdfBase64,
          ContentType: 'application/pdf',
        },
      ],
    };

    // Send the email using Postmark API
    const postmarkResponse = await fetch(postmarkEndpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': postmarkApiToken,
      },
      body: JSON.stringify(emailData),
    });

    if (!postmarkResponse.ok) {
      const errorBody = await postmarkResponse.json();
      console.error('Postmark API error:', errorBody);
      throw new Error(`Failed to send email via Postmark: ${postmarkResponse.status} ${postmarkResponse.statusText}`);
    }

    const postmarkResponseBody = await postmarkResponse.json();
    console.log('Postmark API response:', postmarkResponseBody);

    return new Response(
      JSON.stringify({ message: 'Order confirmation sent successfully via Postmark' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
