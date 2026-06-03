import { sendEmail } from "./emailService.js";
import User, { IUser } from "../models/User.js";
import Survey from "../models/Survey.js";
import Notification from "../models/Notification.js";


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

interface RoleChangedPayload {
  email: string;
  username: string;
  organizationName: string;
  newRole: string;
}

interface UserRemovePayload {
  email: string;
  username: string;
  organizationName: string;
}

interface TenantRemovePayload {
  email: string;
  username: string;
  organizationName: string;
}

interface SurveyPublishedPayload {
  email: string,
  username: string,
  organizationName: string,
  surveyName: string
}

interface SurveyStoppedPayload {
  email: string,
  username: string,
  organizationName: string,
  surveyName: string
}

interface RegisteredPayload {
  email: string,
  username: string,
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
                <h1 style="color:white; margin:0;">MTSP System</h1>
            </div>

            <!-- Body -->
            <div style="padding:30px; color:#333;">

                <h2 style="color:#2563eb;">Organization Created</h2>

                <p style="font-size:16px;">
                Hello <b>${creator.username || "User"}</b>,
                </p>

                <p style="font-size:15px; line-height:1.6;">
                Your organization has been successfully created in the MTSP platform.
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
                © ${new Date().getFullYear()} MTSP System. All rights reserved.
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
              MTSP
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
              <b>MTSP platform</b>. You can now collaborate and access assigned resources based on your role.
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
            © ${new Date().getFullYear()} MTSP. All rights reserved.
          </div>

        </div>

      </div>
      `
    );
  } catch (error) {
    console.error("Notification error:", error);
  }
};




export const notifyRoleChanged = async ({
  email,
  username,
  organizationName,
  newRole,
}: RoleChangedPayload): Promise<void> => {
  try {
    await sendEmail(
      email,
      "Your Role Has Been Updated",
      `
      <div style="font-family:Arial, sans-serif; background:#f4f6f8; padding:40px;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,0.08);">

          <!-- Header -->
          <div style="background:#2563eb; padding:18px 24px; text-align:center;">
            <h2 style="color:#ffffff; margin:0; font-size:20px;">
              MTSP
            </h2>
          </div>

          <!-- Body -->
          <div style="padding:30px; color:#1f2937;">

            <h3 style="margin-top:0; color:#111827;">
              Role Update Notification
            </h3>

            <p style="font-size:15px; line-height:1.6;">
              Hello <b>${username}</b>,
            </p>

            <p style="font-size:15px; line-height:1.6;">
              Your access level within the organization
              <b>${organizationName}</b> has been updated by the Tenant Admin.
            </p>

            <!-- Info Box -->
            <div style="margin-top:20px; background:#f1f5f9; border-left:4px solid #2563eb; padding:15px; border-radius:8px;">
              <p style="margin:0; font-size:14px;">
                <b>New Role:</b>
                <span style="color:#2563eb; font-weight:600;">
                  ${formatRole(newRole)}
                </span>
              </p>
            </div>

            <p style="margin-top:25px; font-size:14px; color:#6b7280;">
              If you believe this change was made in error, please contact your system administrator.
            </p>

          </div>

          <!-- Footer -->
          <div style="background:#f9fafb; text-align:center; padding:14px; font-size:12px; color:#9ca3af;">
            © ${new Date().getFullYear()} MTSP System. All rights reserved.
          </div>

        </div>
      </div>
      `
    );
  } catch (error) {
    console.error("Role change email error:", error);
  }
};

export const notifyUserRemove = async ({
  email,
  username,
  organizationName,
}: UserRemovePayload): Promise<void> => {
  try {
    await sendEmail(
      email,
      "Access Removed from Organization",
      `
      <div style="font-family:Arial, sans-serif; background:#f4f6f8; padding:40px;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,0.08);">

          <!-- Header -->
          <div style="background:#ef4444; padding:20px; text-align:center;">
            <h2 style="color:#ffffff; margin:0; font-size:20px;">
              MTSP
            </h2>
          </div>

          <!-- Body -->
          <div style="padding:30px; color:#1f2937;">

            <h3 style="margin-top:0; color:#111827;">
              Access Removed
            </h3>

            <p style="font-size:15px;">
              Hello <b>${username}</b>,
            </p>

            <p style="font-size:15px; line-height:1.6;">
              This is to inform you that your access to the organization
              <b>${organizationName}</b> has been removed by a Tenant Admin.
            </p>

            <!-- Info Box -->
            <div style="margin-top:20px; background:#fef2f2; border-left:4px solid #ef4444; padding:15px; border-radius:8px;">
              <p style="margin:0; font-size:14px;">
                <b>Organization:</b> ${organizationName}
              </p>
            </div>

            <p style="margin-top:25px; font-size:14px; color:#6b7280;">
              If you believe this action was taken in error, please contact your system administrator.
            </p>

          </div>

          <!-- Footer -->
          <div style="background:#f9fafb; text-align:center; padding:14px; font-size:12px; color:#9ca3af;">
            © ${new Date().getFullYear()} MTSP System. All rights reserved.
          </div>

        </div>
      </div>
      `
    );
  } catch (error) {
    console.error("User removal email error:", error);
  }
};

export const notifyTenantRemoved = async ({
  email,
  username,
  organizationName,
}: TenantRemovePayload): Promise<void> => {
   try {
    await sendEmail(
      email,
      "Organization Deactivated",
      `
      <div style="font-family:Arial, sans-serif; background:#f4f6f8; padding:40px;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,0.08);">

          <!-- Header -->
          <div style="background:#374151; padding:20px; text-align:center;">
            <h2 style="color:#ffffff; margin:0; font-size:20px;">
              MTSP
            </h2>
          </div>

          <!-- Body -->
          <div style="padding:30px; color:#1f2937;">

            <h3 style="margin-top:0; color:#111827;">
              Organization Deactivated!
            </h3>

            <p style="font-size:15px;">
              Hello <b>${username}</b>,
            </p>

            <p style="font-size:15px; line-height:1.6;">
              This is to inform you that the organization
              <b>${organizationName}</b> is no longer active on the MTSP platform.
              As a result, access to this organization has been disabled.
            </p>

            <!-- Info Box -->
            <div style="margin-top:20px; background:#f9fafb; border-left:4px solid #6b7280; padding:15px; border-radius:8px;">
              <p style="margin:0; font-size:14px;">
                <b>Organization:</b> ${organizationName}
              </p>
              <p style="margin:6px 0 0; font-size:14px;">
                <b>Status:</b> Deactivated
              </p>
            </div>

            <p style="margin-top:25px; font-size:14px; color:#6b7280;">
              If you believe this change was made in error, please contact your system administrator for assistance.
            </p>

          </div>

          <!-- Footer -->
          <div style="background:#f9fafb; text-align:center; padding:14px; font-size:12px; color:#9ca3af;">
            © ${new Date().getFullYear()} MTSP System. All rights reserved.
          </div>

        </div>
      </div>
      `
    );
  } catch (error) {
    console.error("Tenant removal email error:", error);
  }
}

export const notifySurveyPublished = async({
    email,
    username,
    organizationName,
    surveyName,
}: SurveyPublishedPayload): Promise<void> => {
  try {
    await sendEmail(
      email,
      "Survey Published",
      `
      <div style="font-family:Arial, sans-serif; background:#f4f6f8; padding:40px;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,0.08);">

          <!-- Header -->
          <div style="background:#2563eb; padding:20px; text-align:center;">
            <h2 style="color:#ffffff; margin:0; font-size:20px;">
              MTSP
            </h2>
          </div>

          <!-- Body -->
          <div style="padding:30px; color:#1f2937;">

            <h3 style="margin-top:0; color:#111827;">
              Survey Published
            </h3>

            <p style="font-size:15px;">
              Hello <b>${username}</b>,
            </p>

            <p style="font-size:15px; line-height:1.6;">
              ${
                organizationName
                  ? `A new survey has been published in the organization <b>${organizationName}</b>.`
                  : `A new survey has been published in the system.`
              }
            </p>

            <!-- Info Box -->
            <div style="margin-top:20px; background:#eff6ff; border-left:4px solid #2563eb; padding:15px; border-radius:8px;">
              <p style="margin:0; font-size:14px;">
                <b>Survey:</b> ${surveyName}
              </p>
              <p style="margin:6px 0 0; font-size:14px;">
              ${organizationName ? `<b>Organization:</b> ${organizationName}</p> ` : ``}
            </div>

            <p style="margin-top:25px; font-size:15px; line-height:1.6;">
              The survey has been successfully published and is now accessible to respondents.
            </p>

            <div style="text-align:center; margin-top:24px;">
              <a href="http://localhost:3000/dashboard"
                style="display:inline-block; padding:12px 22px; background:#2563eb; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600;">
                Open MTSP
              </a>
            </div>

          </div>

          <!-- Footer -->
          <div style="background:#f9fafb; text-align:center; padding:14px; font-size:12px; color:#9ca3af;">
            © ${new Date().getFullYear()} MTSP System. All rights reserved.
          </div>

        </div>
      </div>
      `
    );
  } catch (error) {
    console.error("Survey published email error:", error);
  }
};


export const notifySurveyStopped = async ({
  email,
  username,
  organizationName,
  surveyName,
}: SurveyStoppedPayload): Promise<void> => {
  try {
    await sendEmail(
      email,
      "Survey Stopped",
      `
      <div style="font-family:Arial, sans-serif; background:#f4f6f8; padding:40px;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,0.08);">

          <!-- Header -->
          <div style="background:#6b7280; padding:20px; text-align:center;">
            <h2 style="color:#ffffff; margin:0; font-size:20px;">
              MTSP
            </h2>
          </div>

          <!-- Body -->
          <div style="padding:30px; color:#1f2937;">

            <h3 style="margin-top:0; color:#111827;">
              Survey Stopped
            </h3>

            <p style="font-size:15px;">
              Hello <b>${username}</b>,
            </p>

            <p style="font-size:15px; line-height:1.6;">
              ${
                organizationName
                  ? `A survey has been stopped (closed) in the organization <b>${organizationName}</b>.`
                  : `A survey has been stopped (closed) in the organization`
              }
              
            </p>

            <!-- Info Box -->
            <div style="margin-top:20px; background:#f3f4f6; border-left:4px solid #6b7280; padding:15px; border-radius:8px;">
              <p style="margin:0; font-size:14px;">
                <b>Survey:</b> ${surveyName}
              </p>
              <p style="margin:6px 0 0; font-size:14px;">
                ${
                  organizationName
                    ? `
                  <p style="margin:6px 0 0; font-size:14px;">
                    <b>Organization:</b> ${organizationName}
                  </p>
                `
                    : ""
                }
              </p>
            </div>

            <p style="margin-top:25px; font-size:15px; line-height:1.6;">
              The survey is no longer accepting responses.
            </p>

            <div style="text-align:center; margin-top:24px;">
              <a href="http://localhost:3000/dashboard"
                style="display:inline-block; padding:12px 22px; background:#6b7280; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600;">
                Open MTSP
              </a>
            </div>

          </div>

          <!-- Footer -->
          <div style="background:#f9fafb; text-align:center; padding:14px; font-size:12px; color:#9ca3af;">
            © ${new Date().getFullYear()} MTSP System. All rights reserved.
          </div>

        </div>
      </div>
      `
    );
  } catch (error) {
    console.error("Survey stopped email error:", error);
  }
};

export const notifyRegistered = async ({
  email,
  username,
}: RegisteredPayload): Promise<void> => {
  try{
    await sendEmail(
      email,
            "Registration Successful",
   `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 12px; padding: 24px;">

      <h2 style="color:#5C38E1; text-align:center;">
        Registration Successful 
      </h2>

      <p>Hi <strong>${username}</strong>,</p>

      <p>Your account has been successfully created.</p>

      <div style="background:#F3F0FF; padding:14px; border-radius:8px; margin:16px 0;">
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Email:</strong> ${email}</p>
      </div>

      <p>Welcome aboard! Your account is now verified and ready to use.</p>

      <p style="color:#6B7280; font-size:12px;">
        If this wasn't you, you can ignore this email.
      </p>

    </div>
  `);
    
  } catch (error) {
    console.error("Survey stopped email error:", error);
  }
};