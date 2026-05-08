import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import BackButton from '../components/BackButton';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    //parse order_id from URL if present
    const params = new URLSearchParams(location.search);
    const orderId = params.get('order_id');
    const paymentId = params.get('payment_id');
    
    console.log('Payment successful for order:', orderId);
    
    //can verify the payment with your backend here. add stuff
  }, [location]);
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Payment Successful! 🎉</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your subscription. Your account has been upgraded.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600"
          >
            Go to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}