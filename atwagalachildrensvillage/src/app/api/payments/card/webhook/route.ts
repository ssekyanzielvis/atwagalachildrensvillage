import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FLUTTERWAVE_SECRET_HASH = process.env.FLUTTERWAVE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook signature
    const signature = request.headers.get('verif-hash');
    
    if (!signature || signature !== FLUTTERWAVE_SECRET_HASH) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const { event, data } = body;

    // Handle charge.completed event
    if (event === 'charge.completed') {
      const { tx_ref, status, amount, currency, id } = data;

      // Find donation by receipt number
      const { data: donations } = await supabase
        .from('donations')
        .select('*')
        .eq('receipt_number', tx_ref)
        .limit(1);

      if (donations && donations.length > 0) {
        const paymentStatus = status === 'successful' ? 'success' : 
                             status === 'failed' ? 'failed' : 'processing';

        await supabase
          .from('donations')
          .update({
            payment_status: paymentStatus,
            receipt_generated: paymentStatus === 'success',
            payment_reference: id.toString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', donations[0].id);

        console.log(`Webhook processed: ${tx_ref} - ${paymentStatus}`);
      }
    }

    return NextResponse.json({ status: 'success' });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
