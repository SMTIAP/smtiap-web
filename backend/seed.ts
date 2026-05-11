/**
 * Seed script — creates:
 *   • 1 admin user
 *   • 1 realistic "Customer Satisfaction" survey (Finished)
 *   • 35 survey responses with varied realistic data
 *
 * Run from backend/:
 *   npx tsx seed.ts
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "./config/env.js";
import User from "./models/User.js";
import Survey from "./models/Survey.js";
import SurveyResponse from "./models/SurveyResponse.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickN = <T>(arr: T[], n: number): T[] =>
  [...arr].sort(() => Math.random() - 0.5).slice(0, n);
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - randInt(0, daysAgo));
  d.setHours(randInt(7, 22), randInt(0, 59), randInt(0, 59));
  return d;
};

// ─── Question IDs ─────────────────────────────────────────────────────────────
const q1Id = new mongoose.Types.ObjectId().toHexString();
const q2Id = new mongoose.Types.ObjectId().toHexString();
const q3Id = new mongoose.Types.ObjectId().toHexString();
const q4Id = new mongoose.Types.ObjectId().toHexString();
const q5Id = new mongoose.Types.ObjectId().toHexString();
const q6Id = new mongoose.Types.ObjectId().toHexString();
const q7Id = new mongoose.Types.ObjectId().toHexString();

// ─── Survey Definition ────────────────────────────────────────────────────────
const surveyDef = {
  surveyTitle: "Customer Satisfaction Survey",
  description: "Help us improve our products and services by sharing your experience.",
  themeColor: "#6366F1",
  primaryColor: "#6366F1",
  status: "Finished",
  isAnonymous: true,
  tenantId: "default",
  pages: [
    {
      id: "page1",
      title: "Your Experience",
      questions: [
        {
          _id: q1Id, id: q1Id,
          type: "multiple_choice",
          label: "How did you hear about us?",
          required: true,
          options: ["Social Media", "Search Engine", "Friend / Referral", "Advertisement", "Other"],
        },
        {
          _id: q2Id, id: q2Id,
          type: "rating",
          label: "How would you rate your overall experience?",
          required: true, max: 5,
        },
        {
          _id: q3Id, id: q3Id,
          type: "multiple_choice",
          label: "Which product category did you purchase?",
          required: true,
          options: ["Electronics", "Clothing", "Home & Garden", "Sports & Outdoors", "Books"],
        },
        {
          _id: q4Id, id: q4Id,
          type: "checkboxes",
          label: "What aspects did you find most valuable? (Select all that apply)",
          required: false,
          options: ["Product Quality", "Pricing", "Delivery Speed", "Customer Support", "Website Usability", "Return Policy"],
        },
      ],
    },
    {
      id: "page2",
      title: "Details",
      questions: [
        {
          _id: q5Id, id: q5Id,
          type: "rating",
          label: "How likely are you to recommend us to a friend? (NPS)",
          required: true, max: 10,
        },
        {
          _id: q6Id, id: q6Id,
          type: "short_text",
          label: "What is the one thing we could improve?",
          required: false, placeholder: "Your honest feedback...",
        },
        {
          _id: q7Id, id: q7Id,
          type: "multiple_choice",
          label: "Would you shop with us again?",
          required: true,
          options: ["Definitely yes", "Probably yes", "Not sure", "Probably not", "Definitely not"],
        },
      ],
    },
  ],
};

// ─── Response Generator ───────────────────────────────────────────────────────
const improvements = [
  "Faster delivery would be great",
  "Lower shipping costs",
  "More product variety",
  "Better mobile experience",
  "Easier return process",
  "More detailed product descriptions",
  "Live chat support",
  "Loyalty rewards program",
  "Clearer pricing with no hidden fees",
  "Email notifications for order status",
  "Better packaging to avoid damage",
  "More payment options",
  "Improved search filters",
  null, null, null, // ~20% skip the optional question
];

function generateResponse(surveyId: string) {
  const rating = randInt(1, 5);
  const nps =
    rating >= 4 ? randInt(7, 10) : rating === 3 ? randInt(5, 7) : randInt(1, 5);
  const returnIntention =
    nps >= 8
      ? pick(["Definitely yes", "Probably yes"])
      : nps >= 5
      ? pick(["Probably yes", "Not sure"])
      : pick(["Not sure", "Probably not", "Definitely not"]);

  const responses: Record<string, unknown> = {
    [q1Id]: pick(["Social Media", "Search Engine", "Friend / Referral", "Advertisement", "Other"]),
    [q2Id]: String(rating),
    [q3Id]: pick(["Electronics", "Clothing", "Home & Garden", "Sports & Outdoors", "Books"]),
    [q4Id]: pickN(
      ["Product Quality", "Pricing", "Delivery Speed", "Customer Support", "Website Usability", "Return Policy"],
      randInt(1, 4)
    ),
    [q5Id]: String(nps),
    [q7Id]: returnIntention,
  };

  const improvement = pick(improvements);
  if (improvement) responses[q6Id] = improvement;

  return { surveyId, responses, submittedAt: randDate(30) };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected.");

  // Admin user
  const existingAdmin = await User.findOne({ email: "admin@smtiap.com" });
  if (existingAdmin) {
    console.log("Admin user already exists, skipping.");
  } else {
    const hash = await bcrypt.hash("Admin@12345", 10);
    await User.create({ email: "admin@smtiap.com", username: "Admin", password: hash, role: "admin" });
    console.log("Admin user created.  admin@smtiap.com / Admin@12345");
  }

  // Survey
  const existing = await Survey.findOne({ surveyTitle: "Customer Satisfaction Survey" });
  let surveyId: string;
  if (existing) {
    console.log(`Survey already exists (id: ${existing._id}), skipping.`);
    surveyId = String(existing._id);
  } else {
    const survey = await Survey.create(surveyDef);
    surveyId = String(survey._id);
    console.log(`Survey created.  id: ${surveyId}`);
  }

  // Responses
  const existingCount = await SurveyResponse.countDocuments({ surveyId });
  if (existingCount >= 35) {
    console.log(`Already ${existingCount} responses, skipping.`);
  } else {
    const needed = 35 - existingCount;
    await SurveyResponse.insertMany(
      Array.from({ length: needed }, () => generateResponse(surveyId))
    );
    console.log(`${needed} responses inserted.  (total: ${existingCount + needed})`);
  }

  await mongoose.disconnect();
  console.log("\nSeeding complete.");
  console.log("  Login → admin@smtiap.com / Admin@12345");
}

seed().catch((err) => { console.error("Seed failed:", err); process.exit(1); });