import "dotenv/config";

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "",
  merchantId: process.env.MERCHANT_ID || "1233563",
  merchantSecret:
    process.env.MERCHANT_SECRET ||
    "MjQ1NTQ4Njg5MDk1MDA2MzM5NzE0NDU1NTg4Njc0MDk5NjA1MTIy",
};
