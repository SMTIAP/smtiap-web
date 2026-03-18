import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';

interface PricingPlan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
}

const plans: PricingPlan[] = [
  {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ['1 user', 'Basic features', 'Community support'],
    buttonText: 'Get Started',
  },
  {
    name: 'Startup',
    monthlyPrice: 20,
    yearlyPrice: 16, // Assuming 20% off (20 * 0.8 = 16)
    features: ['5 users', 'All basic features', 'Priority support', 'Advanced analytics'],
    buttonText: 'Get Started',
    isPopular: true,
  },
  {
    name: 'Pro',
    monthlyPrice: 49,
    yearlyPrice: 39, // Assuming 20% off (~49 * 0.8 ≈ 39)
    features: ['10 users', 'All startup features', 'Dedicated account manager', 'Custom integrations'],
    buttonText: 'Get Started',
  },
];

export default function Subscription() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white font-inter text-[#141217]">
      {/* Navigation Header */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-20 border-b border-gray-100">
        <Link to="/" className="cursor-pointer text-nowrap py-2 px-6 flex justify-center items-center gap-2 rounded-md bg-[#1E293B] text-[#FFF] font-inter text-sm font-medium transition-opacity hover:opacity-90">
          <ArrowLeft size={16} />
          Back
        </Link>
        <div className="w-20" /> {/* Spacer */}
      </nav>

      <main className="flex-1 flex flex-col items-center py-10 px-4 md:px-20">
        <div className="max-w-[960px] w-full flex flex-col items-center">
          {/* Page Titles */}
          <span className="text-[#141217] text-base font-bold tracking-widest uppercase mb-4">
            Subscription
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-center mb-6">
            Pricing on your terms
          </h1>
          <p className="text-gray-600 text-lg text-center max-w-2xl mb-12">
            Choose the plan that's right for you. Upgrade or downgrade at any time.
          </p>

          {/* Billing Switcher */}
          <div className="flex p-1.5 bg-[#F2F2F5] rounded-xl mb-8 w-full md:w-fit min-w-[320px]">
            <button 
              onClick={() => setIsYearly(false)}
              className={`flex-1 py-2 px-8 rounded-lg text-sm font-semibold transition-all ${
                !isYearly ? 'bg-white shadow-sm text-[#141217]' : 'text-[#736682]'
              }`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setIsYearly(true)}
              className={`flex-1 py-2 px-8 rounded-lg text-sm font-semibold transition-all ${
                isYearly ? 'bg-white shadow-sm text-[#141217]' : 'text-[#736682]'
              }`}
            >
              Yearly
            </button>
          </div>

          {/* Discount Badge */}
          {isYearly && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-2 mb-8">
              <span className="bg-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                Save 20% with yearly billing
              </span>
            </div>
          )}

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {plans.map((plan) => (
              <div 
                key={plan.name}
                className="relative flex flex-col p-8 rounded-2xl border border-[#E0DEE3] bg-white transition-all hover:border-blue-500 hover:shadow-xl group"
              >
            

                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tight">
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-gray-500 font-bold">/month</span>
                  </div>
                </div>

                <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all mb-8 ${
                  plan.isPopular 
                    ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg' 
                    : 'bg-[#F2F2F5] text-[#141217] hover:bg-gray-200'
                }`}>
                  {plan.buttonText}
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
  );
}
