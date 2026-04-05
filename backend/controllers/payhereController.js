import crypto from "crypto";
import { env } from "../config/env.js";

export const createPayHereHash = (req, res, next) => {
  const { order_id, amount, currency } = req.body;

  try {
    const formattedAmount = Number(amount)
      .toLocaleString("en-us", { minimumFractionDigits: 2 })
      .replaceAll(",", "");

    const hashedSecret = crypto
      .createHash("md5")
      .update(env.merchantSecret)
      .digest("hex")
      .toUpperCase();

    const hashString =
      env.merchantId + order_id + formattedAmount + currency + hashedSecret;

    const hash = crypto
      .createHash("md5")
      .update(hashString)
      .digest("hex")
      .toUpperCase();

    res.json({ merchant_id: env.merchantId, hash });
  } catch (err) {
    next(err);
  }
};
