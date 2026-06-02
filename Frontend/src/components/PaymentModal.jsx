import React, { useState } from 'react'
import PayHereCheckout from './PayHereCheckout'

/**
 * PaymentModal - Modal dialog for handling payments
 * 
 * Usage:
 * <PaymentModal
 *   isOpen={showPayment}
 *   onClose={() => setShowPayment(false)}
 *   paymentType="booking"
 *   bookingId={booking._id}
 *   amount={booking.pricing.totalAmount}
 *   onSuccess={() => {
 *     toast.success('Payment successful!')
 *     setShowPayment(false)
 *   }}
 * />
 */
const PaymentModal = ({
  isOpen,
  onClose,
  paymentType = 'booking',
  bookingId,
  tourRequestId,
  bidId,
  amount,
  serviceName,
  onSuccess
}) => {
  const [error, setError] = useState('')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {paymentType === 'booking' ? 'Complete Payment' : 'Advance Payment'}
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            {serviceName && `Service: ${serviceName}`}
            {amount && ` • Amount: Rs. ${amount.toLocaleString()}`}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <PayHereCheckout
            bookingId={bookingId}
            tourRequestId={tourRequestId}
            bidId={bidId}
            paymentType={paymentType}
            onSuccess={() => {
              onSuccess && onSuccess()
              onClose()
            }}
            onCancel={onClose}
          />
        </div>

        {/* Footer Info */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 rounded-b-lg">
          <p className="text-xs text-slate-600">
            <span className="font-semibold">🔒 Secure Payment:</span> Your payment is processed through PayHere, a secure and trusted payment gateway.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
