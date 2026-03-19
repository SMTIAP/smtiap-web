import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowLeft, AlertCircle } from 'lucide-react';
import { usePayHere } from '../hooks/usePayHere';

//frontend ui layer for payment handling

//definitions for typescript structure
interface PricingPlan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
}

//define structure for plans
const plans: PricingPlan[] = [
  {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ['1 user', 'Basic features', 'Community support'],
    buttonText: 'Current Plan',
  },
  {
    name: 'Startup',
    monthlyPrice: 1000,
    yearlyPrice: 11000,
    features: ['5 users', 'All basic features', 'Priority support', 'Advanced analytics'],
    buttonText: 'Get Started',
    isPopular: true, //use to highlight button blue
  },
  {
    name: 'Pro',
    monthlyPrice: 1500,
    yearlyPrice: 17000,
    features: ['10 users', 'All startup features', 'Dedicated account manager', 'Custom integrations'],
    buttonText: 'Get Started',
  },
];

export default function Subscription() {
  const [isYearly, setIsYearly] = useState(false);
  //hook connection for pyament logic. 
  const { startPayment, paymentStatus, isLoading } = usePayHere();

  const handlePayment = async (plan: PricingPlan) => {
    if (plan.monthlyPrice === 0) {
      //handler for when free plan selection is done
      console.log('Selected free plan');
      //consider showing a message here or not later
      return;
    }

    //dynamically generate price, billing type and unique orderid
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    const billingPeriod = isYearly ? 'yearly' : 'monthly';
    const orderId = `SUB_${plan.name}_${billingPeriod}_${Date.now()}`;

    //hardcoded for now. the actual user profile data. need to come from auth-user system. replaxe later after hiruna
    const userDetails = {
      first_name: 'Test',
      last_name: 'User',
      email: 'user@example.com',
      phone: '0771234567',
    };

    //send all payment data into the hook
    await startPayment({
      sandbox: true,
      merchant_id: '1233563',
      //for the return fron payhere redirect after opening payment portal
      return_url: 'http://localhost:3000/subscription/success',
      cancel_url: 'http://localhost:3000/subscription/cancel',
      notify_url: 'http://localhost:5000/payhere-notify', //for backend notify. no app.post(/payhere-notify) added yet in serverjs. need to later
      
      order_id: orderId,
      items: `${plan.name} Subscription`,
      amount: price.toFixed(2),
      currency: 'LKR',
      
      //customer details from userdetails const
      first_name: userDetails.first_name,
      last_name: userDetails.last_name,
      email: userDetails.email,
      phone: userDetails.phone,
      address: 'Colombo', //extra detail collecting placeholders
      city: 'Colombo',
      country: 'Sri Lanka',
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-inter text-[#141217]">
      {/* navigation header with back button */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-20 border-b border-gray-100">
        <Link to="/" className="cursor-pointer text-nowrap py-2 px-6 flex justify-center items-center gap-2 rounded-md bg-[#1E293B] text-[#FFF] font-inter text-sm font-medium transition-opacity hover:opacity-90">
          <ArrowLeft size={16} />
          Back
        </Link>
        <div className="w-20" /> {/* Spacer */}
      </nav>

      {/* title and other details */}
      <main className="flex-1 flex flex-col items-center py-10 px-4 md:px-20">
        <div className="max-w-[960px] w-full flex flex-col items-center">
          {/* page titles */}
          <span className="text-[#141217] text-base font-bold tracking-widest uppercase mb-4">
            Subscription
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-center mb-6">
            Upgrade to enjoy extra features now
          </h1>
          <p className="text-gray-600 text-lg text-center max-w-2xl mb-12">
            Choose the plan that's right for you. Pay for a monthly subscription or yearly.
          </p>

          {/* color coded payment outcome messages to display */}
          {paymentStatus.status === 'success' && (
            <div className="mb-6 w-full p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <Check className="text-green-600" size={20} />
              <p className="text-green-800">Payment completed successfully! Order ID: {paymentStatus.orderId}</p>
            </div>
          )}

          {paymentStatus.status === 'cancelled' && (
            <div className="mb-6 w-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-yellow-600" size={20} />
              <p className="text-yellow-800">Payment was cancelled.</p>
            </div>
          )}

          {paymentStatus.status === 'error' && (
            <div className="mb-6 w-full p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-red-800">Payment failed: {paymentStatus.error || 'Please try again.'}</p>
            </div>
          )}

          {/* billing switcher. switch between billing periods */}
          <div className="flex p-1.5 bg-[#F2F2F5] rounded-xl mb-8 w-full md:w-fit min-w-[320px]">
            <button 
              onClick={() => setIsYearly(false)}
              disabled={isLoading}
              className={`flex-1 py-2 px-8 rounded-lg text-sm font-semibold transition-all ${
                !isYearly ? 'bg-white shadow-sm text-[#141217]' : 'text-[#736682]'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setIsYearly(true)}
              disabled={isLoading}
              className={`flex-1 py-2 px-8 rounded-lg text-sm font-semibold transition-all ${
                isYearly ? 'bg-white shadow-sm text-[#141217]' : 'text-[#736682]'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Yearly
            </button>
          </div>

          {/* discount badge */}
          {isYearly && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-2 mb-8">
              <span className="bg-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                Save LKR1,000 with yearly billing
              </span>
            </div>
          )}

          {/* pricing grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {plans.map((plan) => (
              <div 
                key={plan.name}
                className="relative flex flex-col p-8 rounded-2xl border border-[#E0DEE3] bg-white transition-all hover:border-blue-500 hover:shadow-xl group"
              >
              <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="text-5xl font-black tracking-tight">
                      LKR.{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-gray-500 font-bold">/month</span>
                  </div>
                </div>

                <button
                //button to start everything. 
                  onClick={() => handlePayment(plan)}
                  disabled={isLoading || plan.monthlyPrice === 0}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all mb-8 ${
                    plan.isPopular 
                      ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg' 
                      : plan.monthlyPrice === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#F2F2F5] text-[#141217] hover:bg-gray-200'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Processing...' : plan.buttonText}
                </button>

                <div className="space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-gray-50">
                        <Check size={14} className="text-[#141217] font-bold" />
                      </div>
                      <span className="text-sm text-gray-700 leading-none">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );}