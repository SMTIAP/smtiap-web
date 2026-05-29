import mongoose, { Document, Model, Schema, CallbackWithoutResultAndOptionalError, Types } from "mongoose";
import bcrypt from "bcryptjs";


export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  role: "viewer" | "admin" | "creator" | "super_admin" | "billing_manager";

  resetPasswordToken?: string | null;
  resetPasswordExpire?: Date | null;
  isVerified: boolean;
  verificationToken?: string | null;
  verificationTokenExpire?: Date | null;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ["viewer", "admin", "creator", "super_admin", "billing_manager"],
    default: "admin"
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpire: {
    type: Date,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  verificationTokenExpire: {
    type: Date,
    default: null
  }
},
  {
    timestamps: true
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;