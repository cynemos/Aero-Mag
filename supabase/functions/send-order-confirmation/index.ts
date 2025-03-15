import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { generateOrderPDF } from './lib/pdf.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { order, profile, adminEmail } = await req.json();

    // Generate the order PDF
    const pdfBuffer = await generateOrderPDF(order, true);

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
