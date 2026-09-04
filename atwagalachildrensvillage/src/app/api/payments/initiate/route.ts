import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// MTN MoMo API Configuration
const MTN_SUBSCRIPTION_KEY = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
const MTN_API_USER = process.env.MTN_MOMO_API_USER;
const MTN_API_KEY = process.env.MTN_MOMO_API_KEY;
const MTN_BASE_URL = process.env.MTN_MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com';
const MTN_ENVIRONMENT = process.env.MTN_MOMO_ENVIRONMENT || 'sandbox';

// Airtel Money API Configuration
const AIRTEL_CLIENT_ID = process.env.AIRTEL_CLIENT_ID;
const AIRTEL_CLIENT_SECRET = process.env.AIRTEL_CLIENT_SECRET;
const AIRTEL_BASE_URL = process.env.AIRTEL_BASE_URL || 'https://openapiuat.airtel.africa';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { donationId, paymentMethod, amount, phoneNumber } = body;

    if (!donationId || !paymentMethod || !amount || !phoneNumber) {
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

    let paymentResult;

    if (paymentMethod === 'mtn') {
      paymentResult = await initiateMTNPayment({
        amount,
        phoneNumber,
        referenceId: donation.receipt_number,
        externalId: donationId,
      });
    } else if (paymentMethod === 'airtel') {
      paymentResult = await initiateAirtelPayment({
        amount,
        phoneNumber,
        referenceId: donation.receipt_number,
        transactionId: donationId,
      });
    } else {
      return NextResponse.json(
        { error: 'Unsupported payment method' },
        { status: 400 }
      );
    }

    // Update donation with payment reference
    await supabase
      .from('donations')
      .update({
        payment_reference: paymentResult.referenceId,
        payment_status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', donationId);

    return NextResponse.json({
      success: true,
      message: 'Payment initiated successfully. Please check your phone to complete the payment.',
      referenceId: paymentResult.referenceId,
      status: paymentResult.status,
    });

  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment initiation failed' },
      { status: 500 }
    );
  }
}

async function initiateMTNPayment(params: {
  amount: number;
  phoneNumber: string;
  referenceId: string;
  externalId: string;
}) {
  const { amount, phoneNumber, referenceId, externalId } = params;

  // Generate UUID for transaction
  const transactionId = crypto.randomUUID();

  try {
    // Get access token
    const tokenResponse = await fetch(`${MTN_BASE_URL}/collection/token/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${MTN_API_USER}:${MTN_API_KEY}`).toString('base64')}`,
        'Ocp-Apim-Subscription-Key': MTN_SUBSCRIPTION_KEY!,
      },
    });

    const { access_token } = await tokenResponse.json();

    // Request to pay
    const paymentResponse = await fetch(
      `${MTN_BASE_URL}/collection/v1_0/requesttopay`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'X-Reference-Id': transactionId,
          'X-Target-Environment': MTN_ENVIRONMENT,
          'Ocp-Apim-Subscription-Key': MTN_SUBSCRIPTION_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount.toString(),
          currency: 'UGX',
          externalId,
          payer: {
            partyIdType: 'MSISDN',
            partyId: phoneNumber.replace(/\D/g, ''), // Remove non-digits
          },
          payerMessage: 'Donation Payment',
          payeeNote: `Donation - ${referenceId}`,
        }),
      }
    );

    if (!paymentResponse.ok) {
      const errorData = await paymentResponse.json();
      throw new Error(errorData.message || 'MTN payment failed');
    }

    return {
      referenceId: transactionId,
      status: 'processing',
      provider: 'mtn',
    };

  } catch (error: any) {
    console.error('MTN payment error:', error);
    throw new Error(`MTN payment failed: ${error.message}`);
  }
}

async function initiateAirtelPayment(params: {
  amount: number;
  phoneNumber: string;
  referenceId: string;
  transactionId: string;
}) {
  const { amount, phoneNumber, referenceId, transactionId } = params;

  try {
    // Get access token
    const tokenResponse = await fetch(`${AIRTEL_BASE_URL}/auth/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: AIRTEL_CLIENT_ID,
        client_secret: AIRTEL_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
    });

    const { access_token } = await tokenResponse.json();

    // Initiate payment
    const paymentResponse = await fetch(
      `${AIRTEL_BASE_URL}/merchant/v1/payments/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          'X-Country': 'UG',
          'X-Currency': 'UGX',
        },
        body: JSON.stringify({
          reference: referenceId,
          subscriber: {
            country: 'UG',
            currency: 'UGX',
            msisdn: phoneNumber.replace(/\D/g, ''),
          },
          transaction: {
            amount: amount.toString(),
            country: 'UG',
            currency: 'UGX',
            id: transactionId,
          },
        }),
      }
    );

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok || paymentData.status?.code !== '200') {
      throw new Error(paymentData.status?.message || 'Airtel payment failed');
    }

    return {
      referenceId: paymentData.data?.transaction?.id || transactionId,
      status: 'processing',
      provider: 'airtel',
    };

  } catch (error: any) {
    console.error('Airtel payment error:', error);
    throw new Error(`Airtel payment failed: ${error.message}`);
  }
}
