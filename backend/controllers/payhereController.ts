import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { env } from "../config/env.js";
import { Payment } from "../models/Payment.js";

const getPlanDuration = (billingPeriod: string): number => {
  return billingPeriod === "yearly" ? 365 : 30; // days
};

//payhere create hash part
export const createPayHereHash = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { order_id, amount, currency, items } = req.body as {
    order_id: string;
    amount: number | string;
    currency: string;
    items: string;
  };

  console.log('Merchant ID:', env.merchantId);
  console.log('Merchant Secret exists:', !!env.merchantSecret);

  try {
    const formattedAmount = Number(amount).toFixed(2);

    const hashedSecret = crypto
      .createHash("md5")
      .update(env.merchantSecret)
      .digest("hex")
      .toUpperCase();

    console.log('Hashed secret:', hashedSecret);

    const hashString = env.merchantId + order_id + formattedAmount + currency + hashedSecret;

    console.log('Hash string:', hashString);

    const hash = crypto
      .createHash("md5")
      .update(hashString)
      .digest("hex")
      .toUpperCase();
    
    console.log('Generated hash:', hash);

    res.json({ merchant_id: env.merchantId,
      hash });
  } catch (err) {
    console.error('Hash generation error:', err);
    next(err);
  }
};

//payHere notification handler part, called by payhere after payment
export const handlePayHereNotify = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      custom_1: username,
      custom_2: email,
    } = req.body as {
      merchant_id: string;
      order_id: string;
      payment_id: string;
      payhere_amount: string;
      payhere_currency: string;
      status_code: string;
      md5sig: string;
      custom_1: string;
      custom_2: string;
    };
 
    //go part by part
    //1. verify the notification signature
    const hashedSecret = crypto
      .createHash("md5")
      .update(env.merchantSecret)
      .digest("hex")
      .toUpperCase();
 
    const expectedSig = crypto
      .createHash("md5")
      .update(
        merchant_id +
          order_id +
          payhere_amount +
          payhere_currency +
          status_code +
          hashedSecret,
      )
      .digest("hex")
      .toUpperCase();
 
    if (expectedSig !== md5sig) {
      console.warn("PayHere notify: signature mismatch — possible spoofed request.");
      res.sendStatus(400);
      return;
    }
 
    //2. map status_code -> readable status
    const statusMap: Record<string, IPaymentStatus> = {
      "2": "success",
      "0": "pending",
      "-1": "cancelled",
      "-2": "failed",
    };
    const status = statusMap[status_code] ?? "failed";
 
    //3. parse plan info from the order_id
    const orderParts = order_id.split("_");
    const planName = orderParts[1] ?? "Unknown";
    const billingPeriod = orderParts[2] === "yearly" ? "yearly" : "monthly";
 
    //4. calculate expireAt
    const expireAt = status === "success"
      ? (() => {
          const date = new Date();
          date.setDate(date.getDate() + (billingPeriod === "yearly" ? 365 : 30));
          return date;
        })()
      : undefined;

    //5. single upsert into mongoDB
    console.log("Attempting DB write for order:", order_id);
    await Payment.deleteMany({ email: email || "customer@smtiap.com", status: "success" });

    // Calculate expiry date
    const days = getPlanDuration(billingPeriod);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    await Payment.findOneAndUpdate(
      { orderId: order_id },
      {
        orderId: order_id,
        username: username || "Registered User",
        email: email || "customer@smtiap.com",
        amount: parseFloat(payhere_amount),
        currency: payhere_currency,
        items: `${planName} Subscription`,
        status,
        payherePaymentId: payment_id,
        billingPeriod,
        planName,
        expiresAt,
      },
      { upsert: true, returnDocument: "after" },
    );

    console.log(`Payment recorded — Order: ${order_id} | Status: ${status}`);
    res.sendStatus(200);
  } catch (err) {
    console.error("PayHere notify handler error:", err);
    next(err);
  }
};

export const getUserSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.query as { email: string };
    if (!email) { res.json({ plan: null, billingPeriod: null }); return; }

    const payment = await Payment.findOne(
      { email, status: "success" },
      {},
      { sort: { createdAt: -1 } },
    );

    res.json({
      plan: payment?.planName ?? null,
      billingPeriod: payment?.billingPeriod ?? null,
      createdAt: payment?.createdAt ?? null,
      expiresAt: payment?.expiresAt ?? null,
    });
  } catch (err) {
    next(err);
  }
};
 
type IPaymentStatus = "success" | "pending" | "failed" | "cancelled";
