// Database seed script: creates a super admin, categories, demo surveys with sample
// responses across all question types, analytics data, and tenant users for testing.
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import Category from "./models/Category.js";
import Template from "./models/Template.js";
import User from "./models/User.js";
import Tenant from "./models/Tenant.js";
import Survey from "./models/Survey.js";
import Question from "./models/Question.js";
import Response from "./models/Response.js";
import Answer from "./models/Answer.js";
import SurveyResponse from "./models/SurveyResponse.js";
import AnalyticsResult from "./models/AnalyticsResult.js";
import TenantUser from "./models/TenantUser.js";
import UserTenantRole from "./models/UserTenantRole.js";

dotenv.config({
  path: path.resolve(process.cwd(), "../.env"),
});
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

// Ensures the predefined set of survey categories exists (creates or reactivates each).
const seedCategoriesAndTemplates = async (superAdminId: any) => {
  console.log("\n Seeding categories...");

  const categoryNames = [
    "Restaurant",
    "HR",
    "Education",
    "Healthcare",
    "Events",
    "Corporate",
    "Product",
    "Retail",
  ];

  let createdCount = 0;
  for (const name of categoryNames) {
    const existing = await Category.findOne({ name });
    if (!existing) {
      await Category.create({ name, createdBy: superAdminId, isActive: true });
      console.log(`  ✓ Created category: ${name}`);
      createdCount++;
    } else {
      if (existing.isActive === false) {
        await Category.updateOne({ name }, { $set: { isActive: true } });
        console.log(`  ✓ Reactivated category: ${name}`);
        createdCount++;
      } else {
        console.log(`  ⏭️ Category already exists: ${name}`);
      }
    }
  }
  console.log(
    ` Categories: ${createdCount} new/reactivated, ${categoryNames.length - createdCount} existing`,
  );
};

const Q_TYPES = [
  "multiple_choice",
  "checkbox",
  "short_text",
  "long_text",
  "rating",
  "nps",
  "dropdown",
  "date",
] as const;

// Creates demo surveys covering all question types, generates sample responses, and populates analytics results.
const seedAnalyticsDemoData = async (superAdminId: any) => {
  console.log("\n Seeding analytics demo data (all question types)...");

  // ── 1. Create or get a demo tenant ──────────────────────────────
  let tenant = await Tenant.findOne({ domain: "demo-analytics.smtiap.com" });
  if (!tenant) {
    tenant = await Tenant.create({
      name: "Demo Analytics Org",
      country: "Sri Lanka",
      address: "123 Demo Lane, Colombo",
      description: "Seed organization for analytics demo data",
      plan: "premium",
      domain: "demo-analytics.smtiap.com",
      orgType: "Technology",
      status: "active",
      createdBy: superAdminId,
    });
    console.log("  ✓ Created demo tenant");
  } else {
    console.log("  ⏭️ Demo tenant already exists");
  }

  // Find the platform user who will own the surveys
  const surveyOwner = await User.findOne({ email: "admin@demo.org" });
  const ownerId = surveyOwner?._id ?? superAdminId;
  console.log(`  ○ Survey owner: ${surveyOwner?.email ?? "superAdmin"}`);

  // ── 2. Define surveys covering every question type ──────────────

  const surveysData = [
    {
      surveyTitle: "Customer Satisfaction Survey",
      description:
        "Measures overall customer satisfaction across key touchpoints.",
      status: "Finished" as const,
      isAnonymous: false,
      createdBy: ownerId,
      themeColor: "#6366F1",
      pages: [
        {
          id: "page-1",
          title: "Experience",
          questions: [
            {
              id: "q-mc",
              type: "multiple_choice",
              label: "How did you hear about us?",
              required: true,
              options: [
                "Social Media",
                "Friend Referral",
                "Search Engine",
                "Advertisement",
              ],
            },
            {
              id: "q-rate",
              type: "rating",
              label: "Rate your overall satisfaction",
              required: true,
              max: 5,
              min: 1,
            },
            {
              id: "q-nps",
              type: "nps",
              label: "How likely are you to recommend us?",
              required: true,
              max: 10,
              min: 0,
            },
            {
              id: "q-short",
              type: "short_text",
              label: "What did you like most?",
              required: false,
              placeholder: "Share a highlight...",
            },
            {
              id: "q-date",
              type: "date",
              label: "When did you last visit us?",
              required: false,
              placeholder: "Select a date",
            },
          ],
        },
      ],
    },
    {
      surveyTitle: "Product Feedback Survey",
      description:
        "Gather detailed feedback on product features and usability.",
      status: "Running" as const,
      isAnonymous: true,
      createdBy: ownerId,
      themeColor: "#10B981",
      pages: [
        {
          id: "page-1",
          title: "Product Feedback",
          questions: [
            {
              id: "q-cb",
              type: "checkbox",
              label: "Which features do you use?",
              required: true,
              options: [
                "Dashboard",
                "Reports",
                "Analytics",
                "Export",
                "Notifications",
              ],
            },
            {
              id: "q-dd",
              type: "dropdown",
              label: "How often do you use our product?",
              required: true,
              options: ["Daily", "Weekly", "Monthly", "Rarely"],
            },
            {
              id: "q-long",
              type: "long_text",
              label: "Describe your ideal feature",
              required: false,
              placeholder: "Tell us in detail...",
            },
            {
              id: "q-rate-2",
              type: "rating",
              label: "Rate the ease of use",
              required: true,
              max: 5,
              min: 1,
            },
          ],
        },
      ],
    },
    {
      surveyTitle: "Employee Engagement Survey",
      description:
        "Annual engagement survey covering workplace culture and growth.",
      status: "Finished" as const,
      isAnonymous: true,
      createdBy: ownerId,
      themeColor: "#F59E0B",
      pages: [
        {
          id: "page-1",
          title: "Workplace Culture",
          questions: [
            {
              id: "q-mc-2",
              type: "multiple_choice",
              label: "How long have you been with the company?",
              required: true,
              options: ["< 1 year", "1-3 years", "3-5 years", "5+ years"],
            },
            {
              id: "q-nps-2",
              type: "nps",
              label: "How likely are you to refer a friend?",
              required: true,
              max: 10,
              min: 0,
            },
            {
              id: "q-cb-2",
              type: "checkbox",
              label: "Which benefits matter most?",
              required: true,
              options: [
                "Health Insurance",
                "Remote Work",
                "Bonuses",
                "Learning Budget",
              ],
            },
            {
              id: "q-dd-2",
              type: "dropdown",
              label: "How would you rate management communication?",
              required: true,
              options: ["Excellent", "Good", "Average", "Poor"],
            },
            {
              id: "q-long-2",
              type: "long_text",
              label: "Any suggestions for improvement?",
              required: false,
              placeholder: "Share your thoughts...",
            },
          ],
        },
      ],
    },
  ];

  let surveyCount = 0;
  let questionCount = 0;
  let responseCount = 0;
  let answerCount = 0;
  let analyticsCount = 0;
  let flatResponseCount = 0;

  // Generate 12 sample responses per survey with staggered submission dates.
  const sampleSize = 12;

  for (const sd of surveysData) {
    const existingSurvey = await Survey.findOne({
      surveyTitle: sd.surveyTitle,
    });
    if (existingSurvey) {
      console.log(`   Survey already exists: "${sd.surveyTitle}"`);
      continue;
    }

    const survey = await Survey.create(sd);
    console.log(`  ✓ Created survey: "${sd.surveyTitle}"`);
    surveyCount++;

    // Create separate Question collection documents alongside the embedded questions
    // in the Survey document. Both representations exist to support different query paths.
    const createdQuestions: any[] = [];
    const allEmbedded: {
      embedId: string;
      type: string;
      options: string[];
      order: number;
    }[] = [];

    for (const page of survey.pages) {
      for (const eq of page.questions) {
        allEmbedded.push({
          embedId: String(eq._id),
          type: eq.type,
          options: eq.options || [],
          order: allEmbedded.length + 1,
        });
      }
    }

    for (const page of sd.pages) {
      for (const qDef of page.questions) {
        const qDoc = await (Question as any).create({
          survey_id: survey._id,
          type: qDef.type,
          text: qDef.label,
          options: qDef.options || [],
          required: qDef.required || false,
          order: page.questions.indexOf(qDef) + 1,
        });
        createdQuestions.push(qDoc);
        questionCount++;
      }
    }

    // ── 3. Generate sample responses & answers ──────────────────
    for (let r = 0; r < sampleSize; r++) {
      const token = `demo-token-${survey._id}-${r}-${Date.now()}`;

      const response = await Response.create({
        survey_id: survey._id,
        tenant_id: tenant._id,
        // Stagger submissions: each response is one day earlier than the next.
        submitted_at: new Date(Date.now() - (sampleSize - r) * 86400000),
        is_anonymous: sd.isAnonymous,
        device_info: {
          ip: `192.168.1.${(r % 255) + 1}`,
          browser: ["Chrome", "Firefox", "Safari", "Edge"][r % 4],
        },
        fraud_flags: { is_suspicious: false, duplicate: false },
      });
      responseCount++;

      // Build flat response map using EMBEDDED question _id as keys
      // so frontend charts (useAnalyticsCharts) can match questions to answers.
      const flatResponses: Record<string, any> = {};

      for (const eq of allEmbedded) {
        let value: any;

        switch (eq.type) {
          case "multiple_choice":
            value = eq.options[r % eq.options.length] || eq.options[0];
            break;
          case "checkbox":
            value = [
              eq.options[r % eq.options.length],
              eq.options[(r + 1) % eq.options.length],
            ].filter(Boolean);
            break;
          case "short_text":
            value = [
              "Great experience!",
              "Needs improvement.",
              "Very satisfied.",
              "Okay overall.",
            ][r % 4];
            break;
          case "long_text":
            value = [
              "I really enjoy using this product. The interface is intuitive and the team is responsive to feedback.",
              "The platform is good but loading times could be faster. I appreciate the regular updates.",
              "Excellent tool for daily operations. The reporting module has saved us hours of manual work.",
              "Some features are hard to find. A better onboarding tutorial would help new users.",
            ][r % 4];
            break;
          case "rating":
            value = Math.min(5, Math.max(1, 3 + (r % 3) - 1));
            break;
          case "nps":
            value = Math.min(10, Math.max(0, 7 + (r % 4) - 2));
            break;
          case "dropdown":
            value = eq.options[r % eq.options.length] || eq.options[0];
            break;
          case "date": {
            const d = new Date();
            d.setDate(d.getDate() - ((r * 7) % 90));
            value = d.toISOString().split("T")[0];
            break;
          }
          default:
            value = "N/A";
        }

        flatResponses[eq.embedId] = value;
      }

      for (const q of createdQuestions) {
        let val: any;
        switch (q.type) {
          case "multiple_choice":
            val = q.options[r % q.options.length] || q.options[0];
            break;
          case "checkbox":
            val = [
              q.options[r % q.options.length],
              q.options[(r + 1) % q.options.length],
            ].filter(Boolean);
            break;
          case "short_text":
            val = [
              "Great experience!",
              "Needs improvement.",
              "Very satisfied.",
              "Okay overall.",
            ][r % 4];
            break;
          case "long_text":
            val = [
              "Great product!",
              "Good but could be faster.",
              "Excellent tool!",
              "Needs better onboarding.",
            ][r % 4];
            break;
          case "rating":
            val = Math.min(5, Math.max(1, 3 + (r % 3) - 1));
            break;
          case "nps":
            val = Math.min(10, Math.max(0, 7 + (r % 4) - 2));
            break;
          case "dropdown":
            val = q.options[r % q.options.length] || q.options[0];
            break;
          case "date": {
            const d = new Date();
            d.setDate(d.getDate() - ((r * 7) % 90));
            val = d.toISOString().split("T")[0];
            break;
          }
          default:
            val = "N/A";
        }
        await Answer.create({
          response_id: response._id,
          question_id: q._id,
          value: val,
        });
        answerCount++;
      }

      const userAgents = [
        "Mozilla/5.0 Chrome/120",
        "Mozilla/5.0 Firefox/121",
        "Mozilla/5.0 Safari/17",
        "Mozilla/5.0 Edge/120",
      ];
      await SurveyResponse.create({
        surveyId: survey._id.toString(),
        tenantId: tenant._id.toString(),
        respondentToken: token,
        ipAddress: `192.168.1.${(r % 255) + 1}`,
        userAgent: userAgents[r % 4],
        deviceHash: `hash-${r}-${survey._id}`,
        responses: flatResponses,
        // Stagger submissions: each response is one day earlier than the next.
        submittedAt: new Date(Date.now() - (sampleSize - r) * 86400000),
      });
      flatResponseCount++;
    }

    // ── 4. Create AnalyticsResult for this survey ─────────────────
    // Hardcoded sample NPS scores matching the 12 generated responses.
    const npsValues = [9, 8, 7, 10, 9, 6, 8, 9, 10, 7, 8, 9];
    const avgNps =
      Math.round(
        (npsValues.reduce((a, b) => a + b, 0) / npsValues.length) * 10,
      ) / 10;

    await AnalyticsResult.create({
      surveyId: survey._id.toString(),
      summary: getSummaryForSurvey(sd.surveyTitle),
      topKeywords: getKeywordsForSurvey(sd.surveyTitle),
      sourceCount: sampleSize,
      total_responses: sampleSize,
      nps_score: avgNps,
      last_updated: new Date(),
    });
    analyticsCount++;
  }

  console.log(`   Surveys created: ${surveyCount}`);
  console.log(`   Questions created: ${questionCount}`);
  console.log(`   Responses created: ${responseCount}`);
  console.log(`   Answers created: ${answerCount}`);
  console.log(`   Flat survey responses created: ${flatResponseCount}`);
  console.log(`   Analytics results created: ${analyticsCount}`);
  console.log("  Analytics demo data seeding complete!");
};

// Returns a hardcoded AI-style summary for each demo survey to populate analytics results.
function getSummaryForSurvey(title: string): string {
  const summaries: Record<string, string> = {
    "Customer Satisfaction Survey":
      "Overall customer satisfaction is positive with an average rating of 4.2/5. Most customers discovered us through social media and friend referrals. NPS score indicates strong loyalty among existing users. Short-text feedback highlights product quality and customer support as key strengths.",
    "Product Feedback Survey":
      "Product feedback shows high engagement with the Dashboard and Reports features. Users rate ease of use at 4.0/5 on average. Long-text responses reveal demand for deeper analytics capabilities and mobile app integration. Weekly usage is the most common frequency.",
    "Employee Engagement Survey":
      "Employee engagement scores are healthy with 85% of respondents likely to refer a friend. Health Insurance and Remote Work are the most valued benefits. Management communication ratings are predominantly 'Good' to 'Excellent'. Long-text suggestions focus on career development opportunities.",
  };
  return (
    summaries[title] ||
    "AI-generated summary of survey responses showing overall trends and key insights."
  );
}

// Returns hardcoded top keywords with counts for each demo survey to populate analytics results.
function getKeywordsForSurvey(
  title: string,
): { keyword: string; count: number }[] {
  const keywords: Record<string, { keyword: string; count: number }[]> = {
    "Customer Satisfaction Survey": [
      { keyword: "customer support", count: 8 },
      { keyword: "product quality", count: 7 },
      { keyword: "user friendly", count: 6 },
      { keyword: "social media", count: 5 },
      { keyword: "fast delivery", count: 4 },
    ],
    "Product Feedback Survey": [
      { keyword: "dashboard", count: 9 },
      { keyword: "analytics", count: 7 },
      { keyword: "mobile app", count: 6 },
      { keyword: "integration", count: 5 },
      { keyword: "performance", count: 4 },
    ],
    "Employee Engagement Survey": [
      { keyword: "remote work", count: 9 },
      { keyword: "health insurance", count: 8 },
      { keyword: "career growth", count: 7 },
      { keyword: "work culture", count: 6 },
      { keyword: "training", count: 5 },
    ],
  };
  return (
    keywords[title] || [
      { keyword: "feedback", count: 10 },
      { keyword: "improvement", count: 7 },
      { keyword: "satisfaction", count: 6 },
      { keyword: "quality", count: 5 },
      { keyword: "service", count: 4 },
    ]
  );
}

// Creates TenantUser and platform User records for demo accounts (admin, editor, viewer)
// and links them to the demo tenant via UserTenantRole.
const seedTenantUsers = async (superAdminId: any) => {
  console.log("\n👥 Seeding tenant users...");

  const tenant = await Tenant.findOne({ domain: "demo-analytics.smtiap.com" });
  if (!tenant) {
    console.log("   No demo tenant found — skipping tenant users");
    return;
  }

  const bcrypt = await import("bcryptjs");

  // ── TenantUser records (org-level users) ─────────────────────────
  const tenantUsersData = [
    {
      email: "admin@demo.org",
      name: "Alice Admin",
      role: "admin" as const,
      password: "Demo@123",
    },
    {
      email: "editor@demo.org",
      name: "Bob Editor",
      role: "editor" as const,
      password: "Demo@123",
    },
    {
      email: "viewer@demo.org",
      name: "Carol Viewer",
      role: "viewer" as const,
      password: "Demo@123",
    },
  ];

  let createdTu = 0;
  for (const u of tenantUsersData) {
    const exists = await (TenantUser as any).findOne({
      tenant_id: tenant._id,
      email: u.email,
    });
    if (!exists) {
      const hash = await bcrypt.hash(u.password, 10);
      await (TenantUser as any).create({
        tenant_id: tenant._id,
        email: u.email,
        password_hash: hash,
        role: u.role,
        name: u.name,
        status: "active",
      });
      createdTu++;
    }
  }
  console.log(
    `  ✓ TenantUsers: ${createdTu} created, ${tenantUsersData.length - createdTu} existing`,
  );

  // accounts for these demo users .
  const platformUsersData = [
    { email: "admin@demo.org", name: "Alice Admin", role: "admin" as const },
    { email: "editor@demo.org", name: "Bob Editor", role: "creator" as const },
    { email: "viewer@demo.org", name: "Carol Viewer", role: "viewer" as const },
  ];

  let createdPu = 0;
  let createdRole = 0;

  for (const u of platformUsersData) {
    // Create platform User (Mongoose pre-save hook handles password hashing)
    let platformUser = await User.findOne({ email: u.email });
    if (!platformUser) {
      platformUser = await User.create({
        email: u.email,
        username: u.name,
        password: "Demo@123",
        role: u.role,
        isVerified: true,
      });
      createdPu++;
      console.log(`  ✓ Created platform User: ${u.email}`);
    }

    // Create UserTenantRole linking platform user to demo tenant
    if (platformUser) {
      const existingRole = await UserTenantRole.findOne({
        userId: platformUser._id,
        tenantId: tenant._id,
        status: "active",
      });
      if (!existingRole) {
        await UserTenantRole.create({
          userId: platformUser._id,
          tenantId: tenant._id,
          role: u.role,
          status: "active",
        });
        createdRole++;
      }
    }
  }

  console.log(`  ✓ Platform Users: ${createdPu} created`);
  console.log(`  ✓ UserTenantRoles: ${createdRole} created`);

  // Also ensure super admin has a UserTenantRole
  const superAdmin = await User.findById(superAdminId);
  if (superAdmin) {
    const existingRole = await UserTenantRole.findOne({
      userId: superAdmin._id,
      tenantId: tenant._id,
      status: "active",
    });
    if (!existingRole) {
      await UserTenantRole.create({
        userId: superAdmin._id,
        tenantId: tenant._id,
        role: "admin",
        status: "active",
      });
      console.log("  ✓ Created UserTenantRole (super admin): admin");
    }
  }

  console.log("Tenant user seeding complete!");
};

// Main entry point: connects to MongoDB, ensures a super admin exists, then seeds
// categories, demo surveys with analytics data, and tenant users.
const runSeed = async (): Promise<void> => {
  try {
    const mongoURI =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smtiap";
    await mongoose.connect(mongoURI);
    console.log("MongoDB Connected.");
    console.log(`Database: ${mongoose.connection.db?.databaseName}`);

    let superAdmin = await User.findOne({ role: "super_admin" });

    if (!superAdmin) {
      console.log("No super admin found. Creating one...");

      superAdmin = await User.create({
        email: "smtiapweb@gmail.com",
        username: "Super Admin",
        password: "SuperAdmin@12345",
        role: "super_admin",
        isVerified: true,
      });
      console.log("Super admin created:", superAdmin.email);
    } else {
      console.log("Super admin found:", superAdmin.email);
    }

    await seedCategoriesAndTemplates(superAdmin._id);

    await seedAnalyticsDemoData(superAdmin._id);

    await seedTenantUsers(superAdmin._id);

    console.log("\n Seeding completed!");
  } catch (error: unknown) {
    console.error(
      "Error while seeding:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

runSeed();
