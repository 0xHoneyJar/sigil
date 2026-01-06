/**
 * Sigil v2.0 Example: Payment Form
 *
 * Demonstrates the full payment flow using:
 * - Core: useCriticalAction with server-tick authority
 * - Layout: CriticalZone with financial=true
 * - Lens: useLens (auto-selects StrictLens)
 *
 * @example
 * ```tsx
 * import { PaymentForm } from 'sigil-mark/__examples__/PaymentForm';
 *
 * function CheckoutPage() {
 *   return (
 *     <PaymentForm
 *       amount={99.99}
 *       onSuccess={() => router.push('/success')}
 *       onCancel={() => router.back()}
 *     />
 *   );
 * }
 * ```
 */

import React from 'react';
import { useCriticalAction, CriticalZone, useLens } from '..';

// =============================================================================
// TYPES
// =============================================================================

export interface PaymentFormProps {
  /** Amount to charge */
  amount: number;
  /** Currency symbol */
  currency?: string;
  /** Called on successful payment */
  onSuccess?: (data: { transactionId: string }) => void;
  /** Called when user cancels */
  onCancel?: () => void;
  /** API function to process payment */
  processPayment?: (amount: number) => Promise<{ transactionId: string }>;
}

// =============================================================================
// MOCK API (replace with real implementation)
// =============================================================================

const mockProcessPayment = async (amount: number) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 90% success rate for demo
  if (Math.random() > 0.1) {
    return { transactionId: `txn_${Date.now()}` };
  }

  throw new Error('Payment failed. Please try again.');
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * PaymentForm — Complete payment flow example
 *
 * Architecture:
 * - `useCriticalAction` manages the payment state machine
 * - `CriticalZone` provides critical zone context (server-tick, StrictLens forced)
 * - `useLens()` returns StrictLens automatically in this context
 *
 * State Flow:
 * 1. idle → User sees "Pay ${amount}" button
 * 2. pending → Button shows "Processing..." (server-tick waits for confirmation)
 * 3. confirmed → Button shows "Paid!" → onSuccess called
 * 4. failed → Button shows "Failed - Retry" → User can retry
 */
export function PaymentForm({
  amount,
  currency = '$',
  onSuccess,
  onCancel,
  processPayment = mockProcessPayment,
}: PaymentFormProps) {
  // Core Layer: Physics engine with server-tick authority
  const payment = useCriticalAction({
    mutation: () => processPayment(amount),
    timeAuthority: 'server-tick',
    onSuccess: (data) => {
      console.log('Payment successful:', data);
      onSuccess?.(data);
    },
    onError: (error) => {
      console.error('Payment failed:', error);
    },
  });

  // Lens Layer: Auto-selects StrictLens in CriticalZone
  const Lens = useLens();

  // Format amount for display
  const formattedAmount = `${currency}${amount.toFixed(2)}`;

  return (
    <CriticalZone financial>
      <CriticalZone.Content>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
            Confirm Payment
          </h2>
          <p style={{ fontSize: '32px', fontWeight: 600, color: '#1e3a8a' }}>
            {formattedAmount}
          </p>
          {payment.state.error && (
            <p style={{ color: '#dc2626', marginTop: '12px' }}>
              {payment.state.error.message}
            </p>
          )}
        </div>
      </CriticalZone.Content>

      <CriticalZone.Actions>
        {/* Non-critical button (cancel) */}
        <button
          type="button"
          onClick={onCancel}
          disabled={payment.state.status === 'pending'}
          style={{
            minHeight: '48px',
            padding: '12px 24px',
            backgroundColor: 'transparent',
            border: '2px solid #d1d5db',
            borderRadius: '4px',
            cursor: payment.state.status === 'pending' ? 'not-allowed' : 'pointer',
            opacity: payment.state.status === 'pending' ? 0.5 : 1,
          }}
        >
          Cancel
        </button>

        {/* Critical button (payment) - rendered with StrictLens */}
        <Lens.CriticalButton
          state={payment.state}
          onAction={() => payment.commit()}
          labels={{
            confirming: `Confirm ${formattedAmount}?`,
            pending: 'Processing...',
            confirmed: 'Paid!',
            failed: 'Failed - Retry',
          }}
        >
          Pay {formattedAmount}
        </Lens.CriticalButton>
      </CriticalZone.Actions>
    </CriticalZone>
  );
}

export default PaymentForm;
