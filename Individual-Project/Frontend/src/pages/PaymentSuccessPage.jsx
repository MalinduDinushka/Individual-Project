import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { paymentAPI } from '../api'
import { toast } from 'react-hot-toast'

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('Checking payment status...')
  const paymentId = searchParams.get('paymentId')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStatus = async () => {
      if (!paymentId) {
        setStatus('Payment was successful. You can return to your dashboard.')
        return
      }

      try {
        const response = await paymentAPI.getPaymentStatus(paymentId)
        const payment = response.data.data.payment
        if (payment.status === 'completed') {
          setStatus('Payment completed successfully. Thank you!')
        } else if (payment.status === 'pending') {
          setStatus('Payment is pending. We will confirm it shortly.')
        } else {
          setStatus(`Payment status: ${payment.status}`)
        }
      } catch (error) {
        console.error('Payment status fetch error:', error)
        toast.error('Unable to verify payment status at this time.')
        setStatus('Payment was successful. Please check your dashboard for status updates.')
      }
    }

    fetchStatus()
  }, [paymentId])

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border p-8 text-center">
        <h1 className="text-3xl font-bold text-emerald-700">Payment Completed</h1>
        <p className="mt-4 text-gray-600">{status}</p>
        <button
          onClick={() => navigate('/tourist/trips')}
          className="btn btn-primary mt-6"
        >
          Return to My Trips
        </button>
      </div>
    </div>
  )
}

export default PaymentSuccessPage
