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
    const { donationId, amount, email, phoneNumber, name } = body;

    if (!donationId || !amount || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get donation details
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .select('*')
      .eq('id', donationId)
      .single();

    if (donationError || !donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }

    // Initialize Flutterwave payment
    const paymentData = {
      tx_ref: donation.receipt_number,
      amount: amount,
      currency: 'UGX',
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/donate/verify`,
      customer: {
        email: email,
        phonenumber: phoneNumber,
        name: name,
      },
      customizations: {
        title: 'Donation Payment',
        description: `Donation - ${donation.receipt_number}`,
        logo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/logo.png`,
      },
      meta: {
        donation_id: donationId,
        receipt_number: donation.receipt_number,
      },
    };

    const response = await fetch(`${FLUTTERWAVE_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    if (!response.ok || result.status !== 'success') {
      throw new Error(result.message || 'Payment initialization failed');
    }

    // Update donation status
    await supabase
      .from('donations')
      .update({
        payment_reference: donation.receipt_number,
        payment_status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', donationId);

    return NextResponse.json({
      success: true,
      message: 'Payment initialized successfully',
      paymentLink: result.data.link,
      referenceId: donation.receipt_number,
    });

  } catch (error: any) {
    console.error('Card payment initiation error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment initialization failed' },
      { status: 500 }
    );
  }
}
