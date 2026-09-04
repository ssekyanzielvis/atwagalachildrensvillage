import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FLUTTERWAVE_BASE_URL = process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, txRef } = body;

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Verify transaction with Flutterwave
    const response = await fetch(
      `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = await response.json();

    if (!response.ok || result.status !== 'success') {
      throw new Error(result.message || 'Verification failed');
    }

    const transactionData = result.data;

    // Update donation based on payment status
    const paymentStatus = transactionData.status === 'successful' ? 'success' : 
                         transactionData.status === 'failed' ? 'failed' : 'processing';

    // Find donation by receipt number
    const { data: donations } = await supabase
      .from('donations')
      .select('*')
      .eq('receipt_number', transactionData.tx_ref)
      .limit(1);

    if (donations && donations.length > 0) {
      await supabase
        .from('donations')
        .update({
          payment_status: paymentStatus,
          receipt_generated: paymentStatus === 'success',
          updated_at: new Date().toISOString(),
        })
        .eq('id', donations[0].id);
    }

    return NextResponse.json({
      success: true,
      status: paymentStatus,
      amount: transactionData.amount,
      currency: transactionData.currency,
      transactionId: transactionData.id,
      reference: transactionData.tx_ref,
    });

  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
