import { useNavigate } from 'react-router-dom'

const PaymentCancelPage = () => {
  const navigate = useNavigate()

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border p-8 text-center">
        <h1 className="text-3xl font-bold text-amber-700">Payment Cancelled</h1>
        <p className="mt-4 text-gray-600">Your payment was cancelled. You can retry from your tour requests or bookings page.</p>
        <button
          onClick={() => navigate('/tourist/requests')}
          className="btn btn-primary mt-6"
        >
          Return to Tour Requests
        </button>
      </div>
    </div>
  )
}

export default PaymentCancelPage
