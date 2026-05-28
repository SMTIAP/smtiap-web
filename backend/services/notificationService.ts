import { sendEmail } from "./emailService.js";
import User, { IUser } from "../models/User.js";


interface TenantType {
  _id: string;
  name: string;
  country: string;
  domain: string;
  orgType: string;
  createdBy: string;
}

export const notifyOrganizationCreated = async (
  org: TenantType
): Promise<void> => {
  try {
    const creator = await User.findById(org.createdBy).lean<IUser>();

    if (!creator) return;

    await sendEmail(
        creator.email,
        "Organization Created Successfully",
        `
        <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:30px;">

            <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

            <!-- Header -->
            <div style="background:#2563eb; padding:20px; text-align:center;">
                <h1 style="color:white; margin:0;">SMTIAP System</h1>
            </div>

            <!-- Body -->
            <div style="padding:30px; color:#333;">

                <h2 style="color:#2563eb;">Organization Created</h2>

                <p style="font-size:16px;">
                Hello <b>${creator.username || "User"}</b>,
                </p>

                <p style="font-size:15px; line-height:1.6;">
                Your organization has been successfully created in the SMTIAP platform.
                </p>

                <!-- Info Box -->
                <div style="background:#f1f5f9; padding:15px; border-radius:8px; margin-top:20px;">

                <p style="margin:5px 0;"><b>🏢 Name:</b> ${org.name}</p>
                <p style="margin:5px 0;"><b>🌍 Country:</b> ${org.country}</p>
                <p style="margin:5px 0;"><b>🌐 Domain:</b> ${org.domain}</p>
                <p style="margin:5px 0;"><b>🏷 Type:</b> ${org.orgType}</p>

                </div>

                <!-- Button -->
                <div style="text-align:center; margin-top:30px;">
                <a href="http://localhost:3000/dashboard"
                    style="background:#2563eb; color:white; padding:12px 20px;
                    text-decoration:none; border-radius:6px; display:inline-block;">
                    Go to Dashboard
                </a>
                </div>

                <p style="margin-top:25px; font-size:13px; color:#666;">
                If you did not perform this action, please contact support immediately.
                </p>

            </div>

            <!-- Footer -->
            <div style="background:#f9fafb; text-align:center; padding:15px; font-size:12px; color:#888;">
                © ${new Date().getFullYear()} SMTIAP System. All rights reserved.
            </div>

            </div>
        </div>
        `
    );
  } catch (error) {
    console.error("Notification error:", error);
  }
};