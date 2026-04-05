import mongoose, { Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "admin" },
  tenantId: { type: Schema.Types.ObjectId, ref: "Tenant" },
});

export type User = InferSchemaType<typeof userSchema>;

export default mongoose.model<User>("User", userSchema);
