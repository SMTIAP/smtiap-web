import { useState } from "react";

//bridge between ui and backend + payhere. used by payment subscription.tsx for preparing and sending payment request

interface PaymentStatus {
  status: "idle" | "success" | "cancelled" | "error";
  orderId?: string;
  error?: string;
}

export const usePayHere = () => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: "idle",
  });

  const [isLoading, setIsLoading] = useState(false);

  const startPayment = async (data: any) => {
    setIsLoading(true);

    try {
      //request hash from backend
      const response = await fetch("http://localhost:5000/payhere-hash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        //sends orderid, amount and currency cause payhere need hash generated using secret key
        body: JSON.stringify({
          order_id: data.order_id,
          amount: data.amount,
          currency: data.currency,
        }),
      });

      //get back verified merchant id and secure hash from serverjs
      const { merchant_id, hash } = await response.json();

      //create a payment form for payhere
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://sandbox.payhere.lk/pay/checkout";

      //attach all the fields
      const fields: Record<string, string> = {
        merchant_id,
        return_url: data.return_url,
        cancel_url: data.cancel_url,
        notify_url: data.notify_url,

        order_id: data.order_id,
        items: data.items,
        currency: data.currency,
        amount: data.amount,
        hash,

        //details collect for invoice generation and email send
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
      };

      //create hidden inputs for each field
      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      //submit that created form. this redirects user to form.action url. payhere.lk/pay/checkout. leaves browser and open payhere checkout page.
      document.body.appendChild(form);
      form.submit();

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