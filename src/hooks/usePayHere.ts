import { useState, useEffect } from "react";

interface PaymentStatus {
  status: "idle" | "success" | "cancelled" | "error";
  orderId?: string;
  error?: string;
}

declare global {
  interface Window {
    payhere: {
      startPayment: (payment: any) => void;
      onCompleted: (orderId: string) => void;
      onDismissed: () => void;
      onError: (error: string) => void;
    };
  }
}

export const usePayHere = () => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: "idle",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.payhere) return;

    window.payhere.onCompleted = (orderId: string) => {
      setPaymentStatus({ status: "success", orderId });
      setIsLoading(false);
    };

    window.payhere.onDismissed = () => {
      setPaymentStatus({ status: "cancelled" });
      setIsLoading(false);
    };

    window.payhere.onError = (error: string) => {
      setPaymentStatus({ status: "error", error });
      setIsLoading(false);
    };
  }, []);

  const startPayment = async (data: any) => {
    setIsLoading(true);
    setPaymentStatus({ status: "idle" });

    try {
      //create payment object using the pre generated hash values directly
      const payment = {
        sandbox: data.sandbox,
        merchant_id: data.merchant_id,
        return_url: data.return_url,
        cancel_url: data.cancel_url,
        notify_url: data.notify_url,
        order_id: data.order_id,
        items: data.items,
        currency: data.currency,
        amount: data.amount,
        hash: data.hash, // Use the hash directly!
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
      };

      if (window.payhere) {
        window.payhere.startPayment(payment);
      } else {
        throw new Error("PayHere SDK script wrapper not detected on window.");
      }

    } catch (err) {
      console.error("Hook runtime error:", err);
      setPaymentStatus({
        status: "error",
        error: "Payment initialization failed",
      });
      setIsLoading(false);
    }
  };

  return { startPayment, paymentStatus, isLoading };
};