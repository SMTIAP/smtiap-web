import { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import BackButton from '../components/BackButton';
import { usePayHere } from '../hooks/usePayHere';

interface PricingPlan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
}

const plans: PricingPlan[] = [
  { name: 'Free', monthlyPrice: 0, yearlyPrice: 0, features: ['1 user', 'Basic features', 'Community support'], buttonText: 'Current Plan' },
  { name: 'Startup', monthlyPrice: 1000, yearlyPrice: 11000, features: ['5 users', 'All basic features', 'Priority support', 'Advanced analytics'], buttonText: 'Get Started', isPopular: true },
  { name: 'Pro', monthlyPrice: 1500, yearlyPrice: 17000, features: ['10 users', 'All startup features', 'Dedicated account manager', 'Custom integrations'], buttonText: 'Get Started' },
];

export default function Subscription() {
  const [isYearly, setIsYearly] = useState(false);
  const { startPayment, paymentStatus, isLoading } = usePayHere();

  const handlePayment = async (plan: PricingPlan) => {
    if (plan.monthlyPrice === 0) { console.log('Selected free plan'); return; }
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    const billingPeriod = isYearly ? 'yearly' : 'monthly';
    const orderId = `SUB_${plan.name}_${billingPeriod}_${Date.now()}`;
    const userDetails = { first_name: 'Test', last_name: 'User', email: 'user@example.com', phone: '0771234567' };
    await startPayment({
      sandbox: true, merchant_id: '1233563',
      return_url: 'http://127.0.0.1:5173/subscription/success',
      cancel_url: 'http://127.0.0.1:5173/subscription/cancel',
      notify_url: 'http://localhost:5000/payhere-notify',
      order_id: orderId, items: `${plan.name} Subscription`,
      amount: price.toFixed(2), currency: 'LKR',
      first_name: userDetails.first_name, last_name: userDetails.last_name,
      email: userDetails.email, phone: userDetails.phone,
      address: 'Colombo', city: 'Colombo', country: 'Sri Lanka',
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0F172A] font-inter text-[#141217] dark:text-white transition-colors duration-300">
      <main className="flex-1 flex flex-col items-center py-10 px-4 md:px-20">
        <div className="w-full max-w-[960px] flex justify-start mb-6">
          <BackButton to="/" />
        </div>
        <div className="max-w-[960px] w-full flex flex-col items-center">

          <span className="text-[#141217] dark:text-white text-base font-bold tracking-widest uppercase mb-4">Subscription</span>
          <h1 className="text-4xl md:text-5xl font-black text-center mb-6 dark:text-white">Upgrade to enjoy extra features now</h1>
          <p className="text-gray-600 dark:text-slate-400 text-lg text-center max-w-2xl mb-12">
            Choose the plan that's right for you. Pay for a monthly subscription or yearly.
          </p>

          {paymentStatus.status === 'success' && (
            <div className="mb-6 w-full p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
              <Check className="text-green-600 dark:text-green-400" size={20} />
              <p className="text-green-800 dark:text-green-300">Payment completed successfully! Order ID: {paymentStatus.orderId}</p>
            </div>
          )}
          {paymentStatus.status === 'cancelled' && (
            <div className="mb-6 w-full p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={20} />
              <p className="text-yellow-800 dark:text-yellow-300">Payment was cancelled.</p>
            </div>
          )}
          {paymentStatus.status === 'error' && (
            <div className="mb-6 w-full p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
              <p className="text-red-800 dark:text-red-300">Payment failed: {paymentStatus.error || 'Please try again.'}</p>
            </div>
          )}

          {/* Billing switcher */}
          <div className="flex p-1.5 bg-[#F2F2F5] dark:bg-slate-800 rounded-xl mb-8 w-full md:w-fit min-w-[320px]">
            <button onClick={() => setIsYearly(false)} disabled={isLoading}
              className={`flex-1 py-2 px-8 rounded-lg text-sm font-semibold transition-all ${!isYearly ? 'bg-white dark:bg-slate-700 shadow-sm text-[#141217] dark:text-white' : 'text-[#736682] dark:text-slate-400'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              Monthly
            </button>
            <button onClick={() => setIsYearly(true)} disabled={isLoading}
              className={`flex-1 py-2 px-8 rounded-lg text-sm font-semibold transition-all ${isYearly ? 'bg-white dark:bg-slate-700 shadow-sm text-[#141217] dark:text-white' : 'text-[#736682] dark:text-slate-400'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              Yearly
            </button>
          </div>

          {isYearly && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-2 mb-8">
              <span className="bg-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">Save LKR1,000 with yearly billing</span>
            </div>
          )}

          {/* Pricing grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {plans.map((plan) => (
              <div key={plan.name}
                className="relative flex flex-col p-8 rounded-2xl border border-[#E0DEE3] dark:border-slate-700 bg-white dark:bg-slate-800 transition-all hover:border-blue-500 hover:shadow-xl group">
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="text-5xl font-black tracking-tight dark:text-white">LKR.{isYearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                    <span className="text-gray-500 dark:text-slate-400 font-bold">/month</span>
                  </div>
                </div>
                <button onClick={() => handlePayment(plan)} disabled={isLoading || plan.monthlyPrice === 0}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all mb-8 ${
                    plan.isPopular
                      ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
                      : plan.monthlyPrice === 0
                      ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                      : 'bg-[#F2F2F5] dark:bg-slate-700 text-[#141217] dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isLoading ? 'Processing...' : plan.buttonText}
                </button>
                <div className="space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-gray-50 dark:bg-slate-700">
                        <Check size={14} className="text-[#141217] dark:text-white font-bold" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-slate-300 leading-none">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}