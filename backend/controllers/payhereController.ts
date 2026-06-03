import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { env } from "../config/env.js";

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
