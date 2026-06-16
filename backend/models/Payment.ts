import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPayment extends Document {
  orderId: string;
  tenantId: Types.ObjectId;
  username: string;
  email: string;
  amount: number;
  currency: string;
  items: string;
  status: "success" | "pending" | "failed" | "cancelled";
  payherePaymentId?: string;
  billingPeriod: "monthly" | "yearly";
  planName: string;
  createdAt: Date;
  expiresAt?: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: String, required: true, unique: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "LKR" },
    items: { type: String, required: true },
    status: {
      type: String,
      enum: ["success", "pending", "failed", "cancelled"],
      required: true,
    },
    payherePaymentId: { type: String },
    billingPeriod: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    planName: { type: String, required: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);


// archive db collection for expired/historical payments — same schema as Payment. this happens when a plan expires. it is moved to the old payments collection for archiving. removing plan previlages from users.
export const OldPayment = mongoose.model<IPayment>("OldPayment", PaymentSchema);
