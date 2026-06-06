import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, AlertCircle, ArrowLeft } from "lucide-react";
import { usePayHere } from "../hooks/usePayHere";
import api from "../api/api"; 

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
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ["1 user", "Basic features", "Community support"],
    buttonText: "Current Plan",
  },
  {
    name: "Startup",
    monthlyPrice: 1000,
    yearlyPrice: 11000,
    features: ["5 users", "All basic features", "Priority support", "Advanced analytics"],
    buttonText: "Get Started",
    isPopular: true,
  },
  {
    name: "Pro",
    monthlyPrice: 1500,
    yearlyPrice: 17000,
    features: ["10 users", "All startup features", "Dedicated account manager", "Custom integrations"],
    buttonText: "Get Started",
  },
];

export default function Subscription() {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const [isGeneratingHash, setIsGeneratingHash] = useState(false);
  const { startPayment, paymentStatus, isLoading: isPaymentLoading } = usePayHere();

  //profile data hooks
  const [currentUser, setCurrentUser] = useState<{ username: string; email: string } | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    api
      .get("/me") 
      .then((res) => {
        if (!mounted || !res.data) return;

        console.log("--- SUBSCRIPTION COMPONENT FETCH USER DATA ---", res.data);

        //fail safe - checks nested data structures else to fallback objects
        if (res.data.user) {
          setCurrentUser({
            username: res.data.user.username || "Registered User",
            email: res.data.user.email || "customer@smtiap.com",
          });
        } else {
          setCurrentUser({
            username: res.data.username || "Registered User",
            email: res.data.email || "customer@smtiap.com",
          });
        }
      })
      .catch((err) => {
        console.error("Subscription screen failed to pull account details safely:", err);
      })
      .finally(() => {
        if (mounted) {
          setIsUserLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const isUiDisabled = isPaymentLoading || isGeneratingHash || isUserLoading;

  const handlePayment = async (plan: PricingPlan) => {
    if (plan.monthlyPrice === 0) return;

    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    const billingPeriod = isYearly ? "yearly" : "monthly";
    const orderId = `SUB_${plan.name}_${billingPeriod}_${Date.now()}`;
    const itemDescription = `${plan.name} Subscription`;
    const formattedAmount = price.toFixed(2);

    //fallback consts if values are missing
    const liveUsername = currentUser?.username || "Registered User";
    const liveEmail = currentUser?.email || "customer@smtiap.com";

    try {
      setIsGeneratingHash(true);

      const response = await fetch("http://localhost:5000/api/payments/generate-hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          amount: price,
          currency: "LKR",
          items: itemDescription,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch secure signature verification.");
      
      const { merchant_id, hash } = await response.json();

      startPayment({
        sandbox: true,
        merchant_id: merchant_id,
        return_url: "http://localhost:5173/subscription/success",
        cancel_url: "http://localhost:5173/subscription/cancel",
        notify_url: "http://localhost:5000/payhere-notify",
        order_id: orderId,
        items: itemDescription,
        amount: formattedAmount,
        currency: "LKR",
        hash: hash,
        first_name: liveUsername, 
        last_name: "Account",      
        email: liveEmail,         
        phone: "0719021938",      
        address: "Colombo",       
        city: "Colombo",          
        country: "Sri Lanka",     
      });

    } catch (err) {
      console.error("Payment starting failed:", err);
    } finally {
      setIsGeneratingHash(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0F172A] font-inter text-[#141217] dark:text-white transition-colors duration-300">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <main className="flex-1 flex flex-col items-center py-10 px-4 md:px-20">
        <div className="max-w-[960px] w-full flex flex-col items-center">
          
          <div className="w-full relative flex items-center justify-center mb-2">
            <h1 className="text-[#0F172A] dark:text-white text-2xl sm:text-3xl font-black tracking-tight">
              Subscription
            </h1>
            <button
              onClick={() => navigate(-1)}
              disabled={isUiDisabled}
              className="absolute right-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} />
            </button>
          </div>

          <p className="text-[#64748B] dark:text-slate-400 text-sm text-center max-w-2xl mb-8 sm:mb-12 mt-2 px-2">
            Choose the plan that's right for you. Pay for a monthly subscription or yearly.
          </p>

          {/* Status Banners */}
          {paymentStatus.status === "success" && (
            <div className="mb-6 w-full p-3 sm:p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
              <Check className="text-green-600 dark:text-green-400" size={20} />
              <p className="text-green-800 dark:text-green-300">Payment completed successfully! Order ID: {paymentStatus.orderId}</p>
            </div>
          )}
          {paymentStatus.status === "cancelled" && (
            <div className="mb-6 w-full p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={20} />
              <p className="text-yellow-800 dark:text-yellow-300">Payment was cancelled.</p>
            </div>
          )}
          {paymentStatus.status === "error" && (
            <div className="mb-6 w-full p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
              <p className="text-red-800 dark:text-red-300">Payment failed: {paymentStatus.error || "Please try again."}</p>
            </div>
          )}

          {/* Billing Switcher */}
          <div className="flex p-1.5 bg-[#F2F2F5] dark:bg-slate-800 rounded-xl mb-8 w-full max-w-[320px]">
            <button
              onClick={() => setIsYearly(false)}
              disabled={isUiDisabled}
              className={`flex-1 py-2 px-8 rounded-lg text-sm font-semibold transition-all ${!isYearly ? "bg-white dark:bg-slate-700 shadow-sm text-[#141217] dark:text-white" : "text-[#736682] dark:text-slate-400"} ${isUiDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              disabled={isUiDisabled}
              className={`flex-1 py-2 px-8 rounded-lg text-sm font-semibold transition-all ${isYearly ? "bg-white dark:bg-slate-700 shadow-sm text-[#141217] dark:text-white" : "text-[#736682] dark:text-slate-400"} ${isUiDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Yearly
            </button>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="relative flex flex-col p-5 sm:p-8 rounded-2xl border border-[#E0DEE3] dark:border-slate-700 bg-white dark:bg-slate-800 transition-all hover:border-blue-500 hover:shadow-xl group"
              >
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="text-3xl sm:text-5xl font-black tracking-tight dark:text-white">
                      LKR.{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-gray-500 dark:text-slate-400 font-bold">
                      /{isYearly ? "year" : "month"}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => handlePayment(plan)}
                  disabled={isUiDisabled || plan.monthlyPrice === 0}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all mb-8 ${
                    plan.isPopular
                      ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg"
                      : plan.monthlyPrice === 0
                        ? "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed"
                        : "bg-[#F2F2F5] dark:bg-slate-700 text-[#141217] dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600"
                  } ${isUiDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isUserLoading ? "Verifying Session..." : isUiDisabled ? "Processing..." : plan.buttonText}
                </button>
                
                <div className="space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-gray-50 dark:bg-slate-700">
                        <Check size={14} className="text-[#141217] dark:text-white font-bold" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-slate-300 leading-none">
                        {feature}
                      </span>
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