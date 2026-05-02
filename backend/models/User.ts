import mongoose, { Document, Model, Schema, CallbackWithoutResultAndOptionalError } from "mongoose";
import bcrypt from "bcryptjs";


export interface IUser extends Document {
  email: string;
  password: string;
  role: "customer" | "admin";

  resetPasswordToken?: string | null;
  resetPasswordExpire?: Date | null;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ["customer", "admin"],
    default: "customer"
  },
  resetPasswordToken: {
      type: String,
      default: null
    },

    resetPasswordExpire: {
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