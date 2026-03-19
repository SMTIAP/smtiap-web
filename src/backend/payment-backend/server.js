import express from "express";
import cors from "cors";
import crypto from "crypto";
//express server, cors allow frontend access, crypto for hash generating.

//payment backend for creating hash for payment features

const app = express();

app.use(cors());
app.use(express.json());

const MERCHANT_ID = "1233563";
const MERCHANT_SECRET = "MjQ1NTQ4Njg5MDk1MDA2MzM5NzE0NDU1NTg4Njc0MDk5NjA1MTIy";

//create payhere hash. called from usepayhere.ts
app.post("/payhere-hash", (req, res) => {
  const { order_id, amount, currency } = req.body;

  try {
    //format amount for payhere. like 1000.00
    const formattedAmount = Number(amount)
      .toLocaleString("en-us", { minimumFractionDigits: 2 })
      .replaceAll(",", "");

    const hashedSecret = crypto
      .createHash("md5")
      .update(MERCHANT_SECRET)
      .digest("hex")
      .toUpperCase();

      //build the hash string
    const hashString =
      MERCHANT_ID + order_id + formattedAmount + currency + hashedSecret;

      //final hash to send
    const hash = crypto
      .createHash("md5")
      .update(hashString)
      .digest("hex")
      .toUpperCase();

    console.log("Hash generated:", {
      order_id,
      formattedAmount,
      currency,
      hash,
    });

    res.json({ merchant_id: MERCHANT_ID, hash });
  } catch (err) {
    console.error("Hash generation error:", err);
    res.status(500).json({ error: "Hash generation failed" });
  }
});


const PORT = 5000;

app.listen(PORT, () => {
  console.log(`PayHere backend running at http://localhost:${PORT}`);
});