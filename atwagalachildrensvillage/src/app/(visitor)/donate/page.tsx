'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Smartphone, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatCurrency, generateReceiptNumber } from '@/lib/utils';

const donationSchema = z.object({
  donor_name: z.string().min(2, 'Name must be at least 2 characters'),
  donor_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  donor_phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  amount: z.number().min(1000, 'Minimum donation amount is UGX 1,000'),
  payment_method: z.enum(['mtn', 'airtel', 'card', 'manual']),
});

type DonationFormData = z.infer<typeof donationSchema>;

interface PaymentSettings {
  id: string;
  mtn_number: string | null;
  mtn_name: string | null;
  airtel_number: string | null;
  airtel_name: string | null;
  manual_payment_instructions: string | null;
  updated_at: string | null;
}

interface PaymentNumber {
  id: string;
  network_name: string;
  phone_number: string;
  account_name: string;
  is_active: boolean;
  display_order: number;
}

interface BankDetails {
  id: string;
  account_name: string;
  bank_name: string;
  account_number: string;
  swift_code: string | null;
  intermediate_bank: string | null;
  is_active: boolean;
  display_order: number;
}

// Define a type for the donation insert
interface DonationInsert {
  donor_name: string;
  donor_email: string | null;
  donor_phone: string;
  amount: number;
  payment_method: 'mtn' | 'airtel' | 'card' | 'manual';
  payment_reference: string;
  receipt_number: string;
  receipt_generated: boolean;
  payment_status: string;
}

export default function DonatePage() {
  const [submitting, setSubmitting] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [transactionReference, setTransactionReference] = useState<string | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [paymentNumbers, setPaymentNumbers] = useState<PaymentNumber[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetails[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const showNotification = useAppStore((state) => state.showNotification);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      payment_method: 'manual',
    },
  });

  const paymentMethod = watch('payment_method');

  useEffect(() => {
    setIsMounted(true);
    fetchPaymentSettings();
    fetchPaymentNumbers();
    fetchBankDetails();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error('Error fetching payment settings:', error);
        setPaymentSettings(null);
        return;
      }
      if (data) {
        setPaymentSettings(data);
      } else {
        setPaymentSettings(null);
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      setPaymentSettings(null);
    }
  };

  const fetchPaymentNumbers = async () => {
    try {
      const { data } = await supabase
        .from('payment_numbers')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (data) {
        setPaymentNumbers(data);
      }
    } catch (error) {
      console.error('Error fetching payment numbers:', error);
    }
  };

  const fetchBankDetails = async () => {
    try {
      const { data } = await supabase
        .from('bank_details')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (data) {
        setBankDetails(data);
      }
    } catch (error) {
      console.error('Error fetching bank details:', error);
    }
  };

  const onSubmit = async (data: DonationFormData) => {
    setSubmitting(true);
    try {
      const receiptNumber = generateReceiptNumber();

      // Create donation record first
      const donationInsert: DonationInsert = {
        donor_name: data.donor_name,
        donor_email: data.donor_email || null,
        donor_phone: data.donor_phone,
        amount: data.amount,
        payment_method: data.payment_method,
        payment_reference: receiptNumber,
        receipt_number: receiptNumber,
        receipt_generated: false,
        payment_status: 'pending',
      };

      // Use type assertion to bypass TypeScript error
      const { data: donationData, error: insertError } = await (supabase
        .from('donations') as any)
        .insert([donationInsert])
        .select();

      if (insertError) throw insertError;

      const donationId = donationData[0].id;

      // Handle MTN or Airtel payment via API
      if (data.payment_method === 'mtn' || data.payment_method === 'airtel') {
        setProcessingPayment(true);
        showNotification(
          'Initiating payment... Please check your phone for payment prompt.',
          'info'
        );

        try {
          const paymentResponse = await fetch('/api/payments/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              donationId,
              paymentMethod: data.payment_method,
              amount: data.amount,
              phoneNumber: data.donor_phone,
            }),
          });

          const paymentResult = await paymentResponse.json();

          if (!paymentResponse.ok) {
            throw new Error(paymentResult.error || 'Payment initiation failed');
          }

          setTransactionReference(paymentResult.referenceId);

          showNotification(
            `Payment prompt sent to your phone! Reference: ${paymentResult.referenceId}`,
            'success'
          );

          // Start checking payment status
          checkPaymentStatus(paymentResult.referenceId, data.payment_method);

        } catch (paymentError: any) {
          console.error('Payment API error:', paymentError);
          showNotification(
            paymentError.message || 'Failed to initiate payment. You can still complete payment manually.',
            'error'
          );
          setProcessingPayment(false);
          setSubmitting(false);
        }

      } else if (data.payment_method === 'card') {
        // Handle card payment via Flutterwave
        setProcessingPayment(true);
        showNotification(
          'Redirecting to secure payment page...',
          'info'
        );

        try {
          const cardPaymentResponse = await fetch('/api/payments/card/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              donationId,
              amount: data.amount,
              email: data.donor_email || `${data.donor_phone}@temp.com`,
              phoneNumber: data.donor_phone,
              name: data.donor_name,
            }),
          });

          const cardPaymentResult = await cardPaymentResponse.json();

          if (!cardPaymentResponse.ok) {
            throw new Error(cardPaymentResult.error || 'Card payment initialization failed');
          }

          // Redirect to Flutterwave payment page
          window.location.href = cardPaymentResult.paymentLink;

        } catch (cardError: any) {
          console.error('Card payment error:', cardError);
          showNotification(
            cardError.message || 'Failed to initialize card payment. Please try again.',
            'error'
          );
          setProcessingPayment(false);
          setSubmitting(false);
        }
      } else {
        showNotification(
          `Thank you for your donation of ${formatCurrency(data.amount)}! Reference: ${receiptNumber}`,
          'success'
        );
        reset();
        setSubmitting(false);
      }

    } catch (error: any) {
      console.error('Error processing donation:', error);
      showNotification(error.message || 'Failed to process donation. Please try again.', 'error');
      setSubmitting(false);
    }
  };

  const checkPaymentStatus = async (referenceId: string, provider: string) => {
    let attempts = 0;
    const maxAttempts = 12; // Check for up to 2 minutes (12 * 10 seconds)

    const checkStatus = async () => {
      try {
        const response = await fetch('/api/payments/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referenceId, provider }),
        });

        const result = await response.json();

        if (result.status === 'success') {
          showNotification(
            'Payment successful! Thank you for your donation.',
            'success'
          );
          setProcessingPayment(false);
          setSubmitting(false);
          setTransactionReference(null);
          reset();
          return;
        } else if (result.status === 'failed') {
          showNotification(
            'Payment failed. Please try again or use manual transfer.',
            'error'
          );
          setProcessingPayment(false);
          setSubmitting(false);
          setTransactionReference(null);
          return;
        }

        // Still processing
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000); // Check again in 10 seconds
        } else {
          showNotification(
            'Payment is taking longer than expected. We will notify you once confirmed.',
            'info'
          );
          setProcessingPayment(false);
          setSubmitting(false);
          setTransactionReference(null);
          reset();
        }
      } catch (error) {
        console.error('Status check error:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000);
        } else {
          setProcessingPayment(false);
          setSubmitting(false);
          setTransactionReference(null);
        }
      }
    };

    // Start checking after 5 seconds (give time for payment prompt)
    setTimeout(checkStatus, 5000);
  };

  if (!isMounted) {
    return (
      <div className="w-full py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Make a Donation</h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Your generosity helps us continue our mission to create positive change in the community.
        </p>

        {/* Payment Settings Display */}
        {paymentSettings && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-800">Payment Numbers & Instructions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg text-yellow-700 mb-2">MTN Mobile Money</h3>
                {paymentSettings.mtn_number ? (
                  <>
                    <p className="text-base text-gray-900 font-bold">Number: <span className="text-blue-700">{paymentSettings.mtn_number}</span></p>
                    {paymentSettings.mtn_name && <p className="text-sm text-gray-700">Name: {paymentSettings.mtn_name}</p>}
                  </>
                ) : <p className="text-sm text-gray-500">Not configured</p>}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-red-700 mb-2">Airtel Money</h3>
                {paymentSettings.airtel_number ? (
                  <>
                    <p className="text-base text-gray-900 font-bold">Number: <span className="text-red-700">{paymentSettings.airtel_number}</span></p>
                    {paymentSettings.airtel_name && <p className="text-sm text-gray-700">Name: {paymentSettings.airtel_name}</p>}
                  </>
                ) : <p className="text-sm text-gray-500">Not configured</p>}
              </div>
            </div>
            {paymentSettings.manual_payment_instructions && (
              <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
                <h4 className="font-semibold mb-2">Manual Payment Instructions</h4>
                <p className="text-sm text-gray-800">{paymentSettings.manual_payment_instructions}</p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <DollarSign className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Direct Impact</h3>
            <p className="text-gray-700">Your donation directly supports our programs and initiatives.</p>
          </div>
          <div className="bg-green-50 rounded-lg p-6 text-center">
            <Smartphone className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Easy Payment</h3>
            <p className="text-gray-700">Multiple payment options for your convenience.</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-6 text-center">
            <CreditCard className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Secure</h3>
            <p className="text-gray-700">All transactions are secure and confidential.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Donor Information */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="donor_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    {...register('donor_name')}
                    type="text"
                    id="donor_name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                  {errors.donor_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.donor_name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="donor_phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    {...register('donor_phone')}
                    type="tel"
                    id="donor_phone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+256 700 000000"
                  />
                  {errors.donor_phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.donor_phone.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="donor_email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    {...register('donor_email')}
                    type="email"
                    id="donor_email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                  {errors.donor_email && (
                    <p className="mt-1 text-sm text-red-600">{errors.donor_email.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Donation Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Donation Amount (UGX) *
              </label>
              <input
                {...register('amount', { valueAsNumber: true })}
                type="number"
                id="amount"
                min="1000"
                step="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10000"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    {...register('payment_method')}
                    type="radio"
                    value="mtn"
                    className="mr-3"
                  />
                  <div>
                    <p className="font-semibold">MTN Mobile Money</p>
                    <p className="text-sm text-gray-600">Pay via MTN</p>
                  </div>
                </label>

                <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    {...register('payment_method')}
                    type="radio"
                    value="airtel"
                    className="mr-3"
                  />
                  <div>
                    <p className="font-semibold">Airtel Money</p>
                    <p className="text-sm text-gray-600">Pay via Airtel</p>
                  </div>
                </label>

                <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    {...register('payment_method')}
                    type="radio"
                    value="card"
                    className="mr-3"
                  />
                  <div>
                    <p className="font-semibold">Credit/Debit Card</p>
                    <p className="text-sm text-gray-600">Pay with card</p>
                  </div>
                </label>

                <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    {...register('payment_method')}
                    type="radio"
                    value="manual"
                    className="mr-3"
                  />
                  <div>
                    <p className="font-semibold">Manual Transfer</p>
                    <p className="text-sm text-gray-600">Mobile Money & Bank Transfer</p>
                  </div>
                </label>
              </div>
            </div>

            {/* MTN Mobile Money Instructions */}
            {paymentMethod === 'mtn' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <Smartphone className="w-5 h-5 mr-2 text-yellow-600" />
                  MTN Mobile Money Payment
                </h3>
                {processingPayment && transactionReference ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <LoadingSpinner size="sm" />
                      <p className="font-semibold text-blue-900">Processing payment...</p>
                    </div>
                    <p className="text-sm text-blue-800">Reference: {transactionReference}</p>
                    <p className="text-sm text-blue-700 mt-2">
                      Please approve the payment on your phone. We're checking the payment status.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-white border border-yellow-300 rounded-lg p-4">
                      <p className="font-semibold text-gray-900 mb-2">Automated Payment:</p>
                      <p className="text-sm text-gray-700 mb-3">
                        When you submit this form, a payment prompt will be sent to your phone automatically.
                        Simply approve it with your MTN PIN.
                      </p>
                      <p className="text-xs text-gray-600">
                        Amount: <strong className="text-blue-600">UGX {watch('amount')?.toLocaleString() || '0'}</strong>
                      </p>
                    </div>
                    <div className="bg-white border border-yellow-300 rounded-lg p-4">
                      <p className="font-semibold text-gray-900 mb-2">Manual Payment Option:</p>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                        <li>Dial <strong className="text-blue-600">*165#</strong> on your MTN phone</li>
                        <li>Select <strong>Send Money (Option 1)</strong></li>
                        <li>Enter the organization's MTN number shown below</li>
                        <li>Enter amount: <strong className="text-blue-600">UGX {watch('amount')?.toLocaleString() || '0'}</strong></li>
                        <li>Enter your MTN PIN to confirm</li>
                      </ol>
                    </div>
                    {paymentNumbers.filter(n => n.network_name.toLowerCase().includes('mtn')).length > 0 ? (
                      <div className="space-y-2">
                        <p className="font-semibold text-gray-900">Send payment to:</p>
                        {paymentNumbers
                          .filter(n => n.network_name.toLowerCase().includes('mtn'))
                          .map((number) => (
                            <div key={number.id} className="bg-white border border-yellow-300 rounded-lg p-3">
                              <p className="text-lg font-bold text-blue-600">{number.phone_number}</p>
                              <p className="text-sm text-gray-600">Name: {number.account_name}</p>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-sm text-red-700">
                          MTN payment number not configured. Please use another payment method or contact us.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Airtel Money Instructions */}
            {paymentMethod === 'airtel' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <Smartphone className="w-5 h-5 mr-2 text-red-600" />
                  Airtel Money Payment
                </h3>
                {processingPayment && transactionReference ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <LoadingSpinner size="sm" />
                      <p className="font-semibold text-blue-900">Processing payment...</p>
                    </div>
                    <p className="text-sm text-blue-800">Reference: {transactionReference}</p>
                    <p className="text-sm text-blue-700 mt-2">
                      Please approve the payment on your phone. We're checking the payment status.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-white border border-red-300 rounded-lg p-4">
                      <p className="font-semibold text-gray-900 mb-2">Automated Payment:</p>
                      <p className="text-sm text-gray-700 mb-3">
                        When you submit this form, a payment prompt will be sent to your phone automatically.
                        Simply approve it with your Airtel PIN.
                      </p>
                      <p className="text-xs text-gray-600">
                        Amount: <strong className="text-red-600">UGX {watch('amount')?.toLocaleString() || '0'}</strong>
                      </p>
                    </div>
                    <div className="bg-white border border-red-300 rounded-lg p-4">
                      <p className="font-semibold text-gray-900 mb-2">Manual Payment Option:</p>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                        <li>Dial <strong className="text-red-600">*185#</strong> on your Airtel phone</li>
                        <li>Select <strong>Send Money (Option 1)</strong></li>
                        <li>Enter the organization's Airtel number shown below</li>
                        <li>Enter amount: <strong className="text-red-600">UGX {watch('amount')?.toLocaleString() || '0'}</strong></li>
                        <li>Enter your Airtel PIN to confirm</li>
                      </ol>
                    </div>
                    {paymentNumbers.filter(n => n.network_name.toLowerCase().includes('airtel')).length > 0 ? (
                      <div className="space-y-2">
                        <p className="font-semibold text-gray-900">Send payment to:</p>
                        {paymentNumbers
                          .filter(n => n.network_name.toLowerCase().includes('airtel'))
                          .map((number) => (
                            <div key={number.id} className="bg-white border border-red-300 rounded-lg p-3">
                              <p className="text-lg font-bold text-red-600">{number.phone_number}</p>
                              <p className="text-sm text-gray-600">Name: {number.account_name}</p>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-sm text-red-700">
                          Airtel payment number not configured. Please use another payment method or contact us.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Card Payment Instructions */}
            {paymentMethod === 'card' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                  Credit/Debit Card Payment
                </h3>
                {processingPayment && transactionReference ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <LoadingSpinner size="sm" />
                      <p className="font-semibold text-blue-900">Redirecting to payment page...</p>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">
                      Please wait while we redirect you to our secure payment gateway.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white border border-purple-300 rounded-lg p-4">
                      <p className="font-semibold text-gray-900 mb-2">Secure Card Payment:</p>
                      <p className="text-sm text-gray-700 mb-3">
                        When you submit this form, you'll be redirected to a secure payment page where you can pay with:
                      </p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                          Visa & Mastercard
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                          Verve Cards
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                          Mobile Money (MTN, Airtel via card gateway)
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                          Bank Transfers
                        </li>
                      </ul>
                      <div className="mt-3 p-3 bg-purple-100 rounded">
                        <p className="text-xs text-purple-900">
                          <strong>🔒 Secure Payment:</strong> All transactions are encrypted and processed through Flutterwave's secure payment gateway.
                        </p>
                      </div>
                    </div>
                    <div className="bg-white border border-purple-300 rounded-lg p-4">
                      <p className="font-semibold text-gray-900 mb-2">Amount to Pay:</p>
                      <p className="text-2xl font-bold text-purple-600">
                        UGX {watch('amount')?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Manual Payment Instructions */}
            {paymentMethod === 'manual' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">Manual Payment Instructions</h3>
                <p className="text-sm text-gray-700 mb-6">
                  You can make your donation directly through Mobile Money or via Bank Transfer using the details below.
                </p>

                {/* Mobile Money Numbers */}
                {paymentNumbers.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 border-b border-yellow-300 pb-1">Mobile Money Options</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {paymentNumbers.map((number) => (
                        <div
                          key={number.id}
                          className="bg-white border border-yellow-300 rounded-lg p-4 shadow-sm"
                        >
                          <p className="font-semibold text-base text-gray-900">
                            {number.network_name}
                          </p>
                          <p className="text-lg font-bold text-blue-600 mt-1">
                            {number.phone_number}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Name: {number.account_name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bank Details */}
                {bankDetails.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 border-b border-yellow-300 pb-1">Bank Transfer Options</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {bankDetails.map((bank) => (
                        <div key={bank.id} className="bg-white border border-yellow-300 rounded-lg p-5 shadow-sm">
                          <h5 className="font-bold text-lg text-blue-800 mb-2">{bank.bank_name}</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                              <span className="text-gray-500">Account Name:</span>
                              <span className="font-semibold text-gray-900 text-right">{bank.account_name}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                              <span className="text-gray-500">Account Number:</span>
                              <span className="font-bold text-gray-900 text-right">{bank.account_number}</span>
                            </div>
                            {bank.swift_code && (
                              <div className="flex justify-between border-b border-gray-100 pb-1">
                                <span className="text-gray-500">SHIFT ADDRESS / CODE:</span>
                                <span className="font-semibold text-gray-900 text-right">{bank.swift_code}</span>
                              </div>
                            )}
                            {bank.intermediate_bank && (
                              <div className="flex justify-between pb-1">
                                <span className="text-gray-500">Intermediate Bank:</span>
                                <span className="font-semibold text-gray-900 text-right">{bank.intermediate_bank}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-700 mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                  <strong>Important:</strong> After making the transfer, please complete this form by clicking "Complete Donation" below so we can properly record and acknowledge your contribution.
                </div>
              </div>
            )}

            {/* Fallback if no payment numbers and no bank details */}
            {paymentMethod === 'manual' && paymentNumbers.length === 0 && bankDetails.length === 0 && paymentSettings && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Payment Instructions</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Please send your donation to:
                </p>
                {paymentSettings.mtn_number && (
                  <p className="text-sm font-semibold">
                    MTN: {paymentSettings.mtn_number}
                  </p>
                )}
                {paymentSettings.mtn_name && (
                  <p className="text-sm text-gray-700">
                    Name: {paymentSettings.mtn_name}
                  </p>
                )}
                {paymentSettings.airtel_number && (
                  <p className="text-sm font-semibold mt-2">
                    Airtel: {paymentSettings.airtel_number}
                  </p>
                )}
                {paymentSettings.airtel_name && (
                  <p className="text-sm text-gray-700">
                    Name: {paymentSettings.airtel_name}
                  </p>
                )}
                {paymentSettings.manual_payment_instructions && (
                  <p className="text-sm text-gray-700 mt-2">
                    {paymentSettings.manual_payment_instructions}
                  </p>
                )}
                <p className="text-sm text-gray-700 mt-2">
                  After payment, submit this form to record your donation.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || processingPayment}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {submitting || processingPayment ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>{processingPayment ? 'Processing Payment...' : 'Submitting...'}</span>
                </>
              ) : (
                <span>Complete Donation</span>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            Your donation is tax-deductible to the extent allowed by law. You will receive a receipt via email.
          </p>
        </div>
      </div>
    </div>
  );
}