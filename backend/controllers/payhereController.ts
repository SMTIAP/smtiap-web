import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { env } from "../config/env.js";
import { Payment } from "../models/Payment.js";

const getPlanDuration = (billingPeriod: string): number => {
  return billingPeriod === "yearly" ? 365 : 30; // days
};

//check that our personal notify endpoint is reachable from outside
const isNotifyUrlReachable = async (): Promise<boolean> => {
  if (!env.notifyBaseUrl) {
    console.warn("NOTIFY_BASE_URL is not set — refusing to start payments.");
    return false;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const response = await fetch(`${env.notifyBaseUrl}/api/health`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return response.ok;
  } catch (err) {
    console.error("Notify URL health check failed:", err);
    return false;
  }
};

//these are the roles allowed to purchase or change a tenant's subscription
const BILLING_ROLES = ["admin", "billing_manager", "super_admin"];

//payhere create hash part
export const createPayHereHash = async (
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
        //0a. Require an active tenant context (set by loadTenant, header-verified)
    const activeTenantId = (req as any).activeTenantId as string | null;
    if (!activeTenantId) {
      res.status(403).json({
        error: "NO_ACTIVE_TENANT",
        message: "Select an organization before purchasing a plan.",
      });
      return;
    }

    //0b. Require the user to hold a billing-capable role in that tenant
    const memberships = (req as any).memberships as
      | { tenantId: any; role: string }[]
      | undefined;
    const membership = memberships?.find(
      (m) => String(m.tenantId) === activeTenantId,
    );

    if (!membership || !BILLING_ROLES.includes(membership.role)) {
      res.status(403).json({
        error: "INSUFFICIENT_PERMISSIONS",
        message: "You don't have permission to manage billing for this organization.",
      });
      return;
    }

    //0c. Refuse to proceed if our notify endpoint isnt reachable
    const reachable = await isNotifyUrlReachable();
    if (!reachable) {
      res.status(503).json({
        error: "PAYMENT_BACKEND_UNREACHABLE",
        message:
          "Payment system is temporarily unavailable. Please try again shortly.",
      });
      return;
    }

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

    res.json({
      merchant_id: env.merchantId,
      hash,
      notify_url: `${env.notifyBaseUrl}/api/payhere-notify`,
      tenant_id: activeTenantId,
    });

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
    const tenantId = orderParts[3];

    //3b. Require a tenant ID to be present
    if (!tenantId) {
      console.warn("PayHere notify: missing tenantId — cannot record payment.");
      res.sendStatus(400);
      return;
    }
 
    //4. Single upsert into MongoDB, scoped to the tenant
    console.log("Attempting DB write for order:", order_id, "tenant:", tenantId);

    // Remove the tenant's previous active plan (upgrades replace, not stack)
    await Payment.deleteMany({ tenantId, status: "success" });

    // calculate expiry date
    const days = getPlanDuration(billingPeriod);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    await Payment.findOneAndUpdate(
      { orderId: order_id },
      {
        orderId: order_id,
        tenantId,
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

    console.log(`Payment recorded — Order: ${order_id} | Tenant: ${tenantId} | Status: ${status}`);
    res.sendStatus(200);
  } catch (err) {
    console.error("PayHere notify handler error:", err);
    next(err);
  }
};

//returns the active plan for the CURRENT tenant context (from x-tenant-id, validated server-side by loadTenant, never trusted from the client directly)
export const getTenantSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const activeTenantId = (req as any).activeTenantId as string | null;
    if (!activeTenantId) {
      res.json({ plan: null, billingPeriod: null, createdAt: null, expiresAt: null });
      return;
    }

    const payment = await Payment.findOne(
      { tenantId: activeTenantId, status: "success" },
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