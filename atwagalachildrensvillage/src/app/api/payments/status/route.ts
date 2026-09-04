import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MTN_BASE_URL = process.env.MTN_MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com';
const MTN_SUBSCRIPTION_KEY = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
const MTN_API_USER = process.env.MTN_MOMO_API_USER;
const MTN_API_KEY = process.env.MTN_MOMO_API_KEY;
const MTN_ENVIRONMENT = process.env.MTN_MOMO_ENVIRONMENT || 'sandbox';

const AIRTEL_BASE_URL = process.env.AIRTEL_BASE_URL || 'https://openapiuat.airtel.africa';
const AIRTEL_CLIENT_ID = process.env.AIRTEL_CLIENT_ID;
const AIRTEL_CLIENT_SECRET = process.env.AIRTEL_CLIENT_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referenceId, provider } = body;

    if (!referenceId || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let status;
    let transactionStatus = 'failed';

    if (provider === 'mtn') {
      status = await checkMTNPaymentStatus(referenceId);
      transactionStatus = status.status;
    } else if (provider === 'airtel') {
      status = await checkAirtelPaymentStatus(referenceId);
      transactionStatus = status.status;
    }

    // Update donation status in database
    await supabase
      .from('donations')
      .update({
        payment_status: transactionStatus,
        receipt_generated: transactionStatus === 'success',
        updated_at: new Date().toISOString(),
      })
      .eq('payment_reference', referenceId);

    return NextResponse.json({
      success: true,
      status: transactionStatus,
      details: status,
    });

  } catch (error: any) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { error: error.message || 'Status check failed' },
      { status: 500 }
    );
  }
}

async function checkMTNPaymentStatus(referenceId: string) {
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

    // Check transaction status
    const statusResponse = await fetch(
      `${MTN_BASE_URL}/collection/v1_0/requesttopay/${referenceId}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'X-Target-Environment': MTN_ENVIRONMENT,
          'Ocp-Apim-Subscription-Key': MTN_SUBSCRIPTION_KEY!,
        },
      }
    );

    const statusData = await statusResponse.json();

    return {
      status: statusData.status === 'SUCCESSFUL' ? 'success' : 
              statusData.status === 'PENDING' ? 'processing' : 'failed',
      amount: statusData.amount,
      currency: statusData.currency,
      reason: statusData.reason,
    };

  } catch (error: any) {
    console.error('MTN status check error:', error);
    throw error;
  }
}

async function checkAirtelPaymentStatus(referenceId: string) {
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

    // Check transaction status
    const statusResponse = await fetch(
      `${AIRTEL_BASE_URL}/standard/v1/payments/${referenceId}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'X-Country': 'UG',
          'X-Currency': 'UGX',
        },
      }
    );

    const statusData = await statusResponse.json();

    return {
      status: statusData.status?.code === '200' && statusData.data?.transaction?.status === 'TS' ? 'success' :
              statusData.data?.transaction?.status === 'TP' ? 'processing' : 'failed',
      amount: statusData.data?.transaction?.amount,
      currency: statusData.data?.transaction?.currency,
      message: statusData.status?.message,
    };

  } catch (error: any) {
    console.error('Airtel status check error:', error);
    throw error;
  }
}
