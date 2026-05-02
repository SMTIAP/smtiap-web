import mongoose, { Schema, type InferSchemaType } from "mongoose";

const creditLedgerSchema = new Schema(
  {
    tenant_id: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    action: { type: String, required: true, trim: true },
    credits_used: { type: Number, required: true, default: 0 },
    balance_after: { type: Number, required: true, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

creditLedgerSchema.index({ tenant_id: 1 });

export type CreditLedger = InferSchemaType<typeof creditLedgerSchema>;

export default mongoose.model<CreditLedger>("CreditLedger", creditLedgerSchema);
