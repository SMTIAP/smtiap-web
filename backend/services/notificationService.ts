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

interface UserAddedPayload {
  email: string;
  username: string;
  organizationName: string;
  role: string;
}

export const formatRole = (role: string) => {
  return role
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};


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


export const notifyUserAddedToOrganization = async ({
  email,
  username,
  organizationName,
  role,
}: UserAddedPayload): Promise<void> => {
  try {
    await sendEmail(
      email,
      `You've been added to ${organizationName}`,
      `
      <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:40px 0;">

        <div style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:14px; overflow:hidden; border:1px solid #e5e7eb;">

          <!-- Header -->
          <div style="background:linear-gradient(135deg,#2563eb,#4f46e5); padding:24px; text-align:center;">
            <h1 style="margin:0; color:#ffffff; font-size:20px; letter-spacing:0.5px;">
              SMTIAP
            </h1>
          </div>

          <!-- Body -->
          <div style="padding:32px; color:#111827;">

            <h2 style="margin-top:0; color:#1f2937;">
              Welcome to ${organizationName}
            </h2>

            <p style="font-size:15px; line-height:1.6; color:#374151;">
              Hello <b>${username}</b>,
            </p>

            <p style="font-size:15px; line-height:1.6; color:#374151;">
              You have been successfully added to an organization in the
              <b>SMTIAP platform</b>. You can now collaborate and access assigned resources based on your role.
            </p>

            <!-- Info Card -->
            <div style="margin:24px 0; padding:16px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px;">

              <p style="margin:8px 0; font-size:14px;">
                <span style="color:#6b7280;">Organization:</span>
                <b style="color:#111827;">${organizationName}</b>
              </p>

              <p style="margin:8px 0; font-size:14px;">
                <span style="color:#6b7280;">Assigned Role:</span>
                <b style="color:#111827;">${formatRole(role)}</b>
              </p>

            </div>

            <!-- CTA -->
            <div style="text-align:center; margin-top:28px;">
              <a href="http://localhost:3000/dashboard"
                style="display:inline-block; padding:12px 22px; background:#2563eb; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600; font-size:14px;">
                Open Dashboard
              </a>
            </div>

            <p style="margin-top:24px; font-size:12px; color:#6b7280; line-height:1.5;">
              If you were not expecting this invitation, you can safely ignore this email or contact your organization administrator.
            </p>

          </div>

          <!-- Footer -->
          <div style="background:#f9fafb; padding:16px; text-align:center; font-size:12px; color:#9ca3af;">
            © ${new Date().getFullYear()} SMTIAP. All rights reserved.
          </div>

        </div>

      </div>
      `
    );
  } catch (error) {
    console.error("Notification error:", error);
  }
};