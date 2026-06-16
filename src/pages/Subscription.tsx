import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, AlertCircle, ArrowLeft, Building2 } from "lucide-react";
import { usePayHere } from "../hooks/usePayHere";
import api from "../api/api";
import { useTenant } from "../contexts/TenantContext";
import PlanComparisonTable from "../components/PlanComparisonTable";


interface PricingPlan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  buttonText: string;
  isPopular?: boolean; //? to mean optional. for the popular choice of package.
}

const plans: PricingPlan[] = [
  {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ["1 Member (You)", "5 Active Surveys", "Community support"],
    buttonText: "Current Plan",
  },
  {
    name: "Startup",
    monthlyPrice: 1000,
    yearlyPrice: 11000,
    features: ["10 Members", "10 Active Surveys", "Priority support", "Custom Analytics"],
    buttonText: "Get Started",
    isPopular: true,
  },
  {
    name: "Pro",
    monthlyPrice: 1500,
    yearlyPrice: 17000,
    features: ["100 Members", "100 Active Surveys", "Dedicated account manager", "Custom Analytics"],
    buttonText: "Get Started",
  },
];

const planRank: Record<string, number> = { Free: 0, Startup: 1, Pro: 2 };

export default function Subscription() {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const [isGeneratingHash, setIsGeneratingHash] = useState(false);
  const { startPayment, paymentStatus, isLoading: isPaymentLoading } = usePayHere();
  const { activeTenant, isSystemContext, loading: isTenantLoading } = useTenant();

  //profile data hooks
  const [currentUser, setCurrentUser] = useState<{ username: string; email: string } | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [activePlan, setActivePlan] = useState<{
    plan: string;
    billingPeriod: string;
    createdAt: string | null;
    expiresAt: string | null;
  } | null>(null);
  const [isSubLoading, setIsSubLoading] = useState(false);
  const [backendUnavailable, setBackendUnavailable] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  //fetch email and username to send to later payhere billing details. down
  useEffect(() => {
    let mounted = true;
    api.get("/me")
      .then((res) => {
        if (!mounted || !res.data) return;
        const user = res.data.user ?? res.data;
        setCurrentUser({
          username: user.username || "Registered User",
          email: user.email || "customer@smtiap.com",
        });
      })
      .catch((err) => console.error("Failed to load user:", err))
      .finally(() => { if (mounted) setIsUserLoading(false); });
    return () => { mounted = false; };
  }, []);


  const fetchSubscription = () => {
    //no tenant selected, nothing to show, treat as Free with no active plan
    if (isSystemContext || !activeTenant) {
      setActivePlan(null);
      return;
    }

    setIsSubLoading(true);
    api.get("http://localhost:5000/api/payments/subscription")
      .then((res) => {
        const data = res.data;
        setActivePlan(
          data.plan ? {
            plan: data.plan,
            billingPeriod: data.billingPeriod,
            createdAt: data.createdAt,
            expiresAt: data.expiresAt,
          } : null
        );
      })
      .catch(() => setActivePlan(null))
      .finally(() => setIsSubLoading(false));
  };

  //fetch active plan whenever the selected organization changes
  useEffect(() => {
    if (isTenantLoading) return;
    fetchSubscription();
  }, [activeTenant?.tenantId._id, isSystemContext, isTenantLoading]);

  //refetch after a successful payment
  useEffect(() => {
    if (paymentStatus.status === "success") {
      fetchSubscription();
    }
  }, [paymentStatus.status]);

  const isUiDisabled =
    isPaymentLoading || isGeneratingHash || isUserLoading || isSubLoading || isTenantLoading;

  //get to per-plan state
  const getPlanState = (plan: PricingPlan) => {
    const currentPlanName = activePlan?.plan ?? "Free";
    const currentBilling = activePlan?.billingPeriod ?? null;
    const currentRank = planRank[currentPlanName] ?? 0;
    const thisRank = planRank[plan.name] ?? 0;

    const viewingYearly = isYearly;
    const onYearlyPlan = currentBilling === "yearly";

    const isCurrent =
      plan.name === currentPlanName &&
      (currentBilling === null || currentBilling === (viewingYearly ? "yearly" : "monthly"));

    if (isCurrent) {
      return { label: "Current Plan", disabled: true, style: "current" };
    }

    //if on a yearly plan and viewing monthly tab, everything is a downgrade
    if (onYearlyPlan && !viewingYearly) {
      return { label: "Downgrade", disabled: true, style: "downgrade" };
    }

    if (thisRank < currentRank) {
      return { label: "Downgrade", disabled: true, style: "downgrade" };
    }
    if (plan.monthlyPrice === 0) {
      return { label: "Free Plan", disabled: true, style: "free" };
    }
    return { label: "Upgrade", disabled: false, style: "upgrade" };
  };

  //runs first when clicking to buy a plan. 
  const handlePayment = async (plan: PricingPlan) => {
    //check if plan isnt already current or downgrade. prevent stale UI clicks - duplicate purchases
    const state = getPlanState(plan);
    if (state.disabled) return;

    if (isSystemContext || !activeTenant) {
      setPermissionError("Select an organization from the menu before purchasing a plan.");
      return;
    }

    //prepare payment data
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    const billingPeriod = isYearly ? "yearly" : "monthly";
    const tenantId = activeTenant!.tenantId._id;
    const orderId = `SUB_${plan.name}_${billingPeriod}_${tenantId}_${Date.now()}`;
    const itemDescription = `${plan.name} Subscription`;
    const formattedAmount = price.toFixed(2);
    const liveUsername = currentUser?.username || "Registered User";
    const liveEmail = currentUser?.email || "customer@smtiap.com";

    try {
      //states for disabling visual features before invoking doing payment.
      setIsGeneratingHash(true);
      setBackendUnavailable(false);
      setPermissionError(null);

      const response = await api.post(
        "http://localhost:5000/api/payments/generate-hash",
        { order_id: orderId, amount: price, currency: "LKR", items: itemDescription },
      );

      const { merchant_id, hash, notify_url, tenant_id } = response.data;

      //send and used by usePayHere.ts to filter what gets sent to PayHere itself
      startPayment({
        sandbox: true,
        merchant_id,
        return_url: "http://localhost:5173/subscription/success",
        cancel_url: "http://localhost:5173/subscription/cancel",
        notify_url,
        order_id: orderId,
        items: itemDescription,
        amount: formattedAmount,
        currency: "LKR",
        hash,
        first_name: liveUsername,
        last_name: "Account",
        email: liveEmail,
        phone: "0719021938",
        address: "Colombo",
        city: "Colombo",
        country: "Sri Lanka",
        custom_1: liveUsername,
        custom_2: liveEmail,
      });
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      if (status === 503) {
        //notify backend isnt reachable, refuse to start payment so the user isnt charged
        setBackendUnavailable(true);
      } else if (status === 403) {
        setPermissionError(
          data?.message || "You don't have permission to manage billing for this organization.",
        );
      } else {
        console.error("Payment starting failed:", err);
      }
    } finally {
      setIsGeneratingHash(false);
    }
  };

  const SubscriptionProgress = () => {
    if (!activePlan || activePlan.plan === "Free" || !activePlan.createdAt || !activePlan.expiresAt) {
      return null;
    }

    //sethourse(hours, minutes, seconds, milliseconds)
    const start = new Date(activePlan.createdAt);
    start.setHours(0, 0, 0, 0);  //snap to midnight of start day

    const end = new Date(activePlan.expiresAt);
    end.setHours(23, 59, 59, 999);  //snap to end of expiry day

    const now = new Date();
    now.setHours(0, 0, 0, 0);  //snap to midnight of today

    const totalDuration = end.getTime() - start.getTime();
    const remaining = Math.max(0, end.getTime() - now.getTime());
    const remainingDays = Math.ceil(remaining / (1000 * 60 * 60 * 24));
    const fillPercent = Math.min(100, (remaining / totalDuration) * 100);

    const formatDate = (iso: string) =>
      new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

    const barColor =
      fillPercent > 50
        ? "bg-emerald-500"
        : fillPercent > 20
          ? "bg-yellow-400"
          : "bg-red-500";

    return (
      <div className="w-full mb-8 px-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Started {formatDate(activePlan.createdAt)}
          </span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {remainingDays} day{remainingDays !== 1 ? "s" : ""} remaining
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Expires {formatDate(activePlan.expiresAt)}
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${fillPercent}%` }}
          />
        </div>
        <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-1.5">
          {activePlan.plan} · {activePlan.billingPeriod === "yearly" ? "Annual" : "Monthly"} plan
        </p>
      </div>
    );
  };

  const noTenantSelected = !isTenantLoading && (isSystemContext || !activeTenant);

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

          {!isTenantLoading && activeTenant && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
              <Building2 size={14} />
              Managing billing for {activeTenant.tenantId.name}
            </p>
          )}

          <p className="text-[#64748B] dark:text-slate-400 text-sm text-center max-w-2xl mb-8 sm:mb-12 mt-2 px-2">
            Choose the plan that's right for you. Pay for a monthly subscription or yearly.
          </p>

          {/* no tenant selected — billing applies to organizations, not personal accounts */}
          {noTenantSelected && (
            <div className="mb-6 w-full p-4 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg flex items-center gap-3">
              <Building2 className="text-indigo-600 dark:text-indigo-400" size={20} />
              <p className="text-indigo-800 dark:text-indigo-300">
                Subscriptions belong to organizations. Select or create an organization from the menu in the top to manage its plan.
              </p>
            </div>
          )}

          <SubscriptionProgress />

          {/* Status Banners */}
          {paymentStatus.status === "success" && (
            <div className="mb-6 w-full p-3 sm:p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
              <Check className="text-green-600 dark:text-green-400" size={20} />
              <p className="text-green-800 dark:text-green-300">Payment completed! Order ID: {paymentStatus.orderId}</p>
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
          {backendUnavailable && (
            <div className="mb-6 w-full p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
              <p className="text-red-800 dark:text-red-300">Payment system is temporarily unavailable. Please try again shortly.</p>
            </div>
          )}
          {permissionError && (
            <div className="mb-6 w-full p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
              <p className="text-red-800 dark:text-red-300">{permissionError}</p>
            </div>
          )}

          {/* Billing Switcher */}
          <div className="flex p-1.5 bg-[#F2F2F5] dark:bg-slate-800 rounded-xl mb-8 w-full max-w-[320px]">
            <button onClick={() => setIsYearly(false)} disabled={isUiDisabled}
              className={`flex-1 py-2 px-8 rounded-lg text-sm font-semibold transition-all ${!isYearly ? "bg-white dark:bg-slate-700 shadow-sm text-[#141217] dark:text-white" : "text-[#736682] dark:text-slate-400"} ${isUiDisabled ? "opacity-50 cursor-not-allowed" : ""}`}>
              Monthly
            </button>
            <button onClick={() => setIsYearly(true)} disabled={isUiDisabled}
              className={`flex-1 py-2 px-8 rounded-lg text-sm font-semibold transition-all ${isYearly ? "bg-white dark:bg-slate-700 shadow-sm text-[#141217] dark:text-white" : "text-[#736682] dark:text-slate-400"} ${isUiDisabled ? "opacity-50 cursor-not-allowed" : ""}`}>
              Yearly
            </button>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {plans.map((plan) => {
              const state = getPlanState(plan);
              const isCurrent = state.style === "current";
              const isDowngrade = state.style === "downgrade";
              const purchaseDisabled = state.disabled || noTenantSelected;

              return (
                <div key={plan.name}
                  className={`relative flex flex-col p-5 sm:p-8 rounded-2xl border transition-all
                    ${isCurrent
                      ? "border-blue-500 shadow-xl ring-2 ring-blue-500/30 dark:ring-blue-400/20"
                      : isDowngrade
                        ? "border-[#E0DEE3] dark:border-slate-700 opacity-50"
                        : "border-[#E0DEE3] dark:border-slate-700 hover:border-blue-500 hover:shadow-xl"
                    } bg-white dark:bg-slate-800`}
                >
                  {/* Current plan badge */}
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Your Plan
                    </div>
                  )}

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
                    disabled={isUiDisabled || purchaseDisabled}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all mb-8
                      ${isCurrent
                        ? "bg-blue-500 text-white cursor-not-allowed"
                        : isDowngrade
                          ? "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed"
                          : plan.isPopular
                            ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg"
                            : "bg-[#F2F2F5] dark:bg-slate-700 text-[#141217] dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600"
                      } ${isUiDisabled || purchaseDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isSubLoading ? "Checking plan..." : isUiDisabled ? "Processing..." : state.label}
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
              );
            })}
          </div>
          <PlanComparisonTable />
        </div>
      </main>
    </div>
  );
}