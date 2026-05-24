import mongoose, { Schema, type InferSchemaType } from "mongoose";

const auditLogSchema = new Schema(
  {
    tenant_id: { type: Schema.Types.ObjectId, ref: "Tenant", default: null },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true, trim: true },
    entity: { type: String, required: true, trim: true },
    entity_id: { type: Schema.Types.ObjectId, required: true },
    description: { type: String, trim: true}, },
    // timestamp: { type: Date, default: Date.now },
  { timestamps: true },
  // { timestamps: false },
);

auditLogSchema.index({ tenant_id: 1 });
auditLogSchema.index({ user_id: 1 });
auditLogSchema.index({ entity: 1, entity_id: 1 });

export type AuditLog = InferSchemaType<typeof auditLogSchema>;

export default mongoose.model<AuditLog>("AuditLog", auditLogSchema);
