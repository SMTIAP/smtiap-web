import { useState, useEffect } from "react";

//bridge between ui and backend + payhere. used by payment subscription.tsx for preparing and sending payment request

interface PaymentStatus {
  status: "idle" | "success" | "cancelled" | "error";
  orderId?: string;
  error?: string;
}

//declare payHere window object
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

  //set up payHere event listeners when hook mounts
  useEffect(() => {
    if (typeof window === 'undefined' || !window.payhere) return;

    window.payhere.onCompleted = (orderId: string) => {
      console.log('Payment completed:', orderId);
      setPaymentStatus({
        status: "success",
        orderId: orderId,
      });
      setIsLoading(false);
    };

    window.payhere.onDismissed = () => {
      console.log('Payment dismissed');
      setPaymentStatus({
        status: "cancelled",
      });
      setIsLoading(false);
    };

    window.payhere.onError = (error: string) => {
      console.error('PayHere error:', error);
      setPaymentStatus({
        status: "error",
        error: error,
      });
      setIsLoading(false);
    };
  }, []);

  const startPayment = async (data: any) => {
    setIsLoading(true);
    setPaymentStatus({ status: "idle" });

    try {
      //request hash from backend
      const response = await fetch("http://localhost:5000/payhere-hash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: data.order_id,
          amount: data.amount,
          currency: data.currency,
        }),
      });

      const { merchant_id, hash } = await response.json();

      //create payment object for payHere SDK
      const payment = {
        sandbox: data.sandbox || true,
        merchant_id: merchant_id,
        return_url: data.return_url,
        cancel_url: data.cancel_url,
        notify_url: data.notify_url,

        order_id: data.order_id,
        items: data.items,
        currency: data.currency,
        amount: data.amount,
        hash: hash,

        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
      };

      //use payHere SDK not form submission
      if (window.payhere) {
        window.payhere.startPayment(payment);
      } else {
        throw new Error("PayHere SDK not loaded");
      }

    } catch (err) {
      console.error("Payment error:", err);
      setPaymentStatus({
        status: "error",
        error: "Payment initialization failed",
      });
      setIsLoading(false);
    }
  };

  return {
    startPayment,
    paymentStatus,
    isLoading,
  };
};