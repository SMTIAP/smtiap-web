import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import Category from "./models/Category.js";
import Template from "./models/Template.js";
import User from "./models/User.js";

dotenv.config({
  path: path.resolve(process.cwd(), "../.env"),
});
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const seedCategoriesAndTemplates = async (superAdminId: any) => {
  console.log("\n📁 Seeding categories...");
  
  const categoryNames = [
    "Most Popular", "Restaurant", "HR", "Education", "Healthcare",
    "Events", "Corporate", "Product", "Retail",
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
  console.log(`✅ Categories: ${createdCount} new/reactivated, ${categoryNames.length - createdCount} existing`);

  console.log("\n📄 Seeding templates...");

  const templatesData = [
    {
      title: "Customer Satisfaction Survey",
      description: "Keep your customers happy and turn them into advocates. Measure satisfaction across all touchpoints.",
      category: "Most Popular",
      usedCount: "388,600+",
      gradient: "from-orange-400 to-rose-500",
      icon: "Star",
      aiPrompt: "Create a detailed customer satisfaction survey covering overall experience, product/service quality, staff friendliness, value for money, likelihood to recommend (NPS), and open feedback.",
      previewQuestions: [
        { type: "rating", label: "How satisfied are you with our product/service overall?", max: 5 },
        { type: "multiple_choice", label: "How did you hear about us?", options: ["Friend/Family", "Social Media", "Google", "Advertisement", "Other"] },
        { type: "rating", label: "How likely are you to recommend us to a friend?", max: 10 },
        { type: "text", label: "What did you enjoy most about your experience?" },
        { type: "text", label: "What could we improve?" },
      ],
    },
    {
      title: "Employee Engagement Survey",
      description: "Learn about your employees' experience and workplace happiness. Build a better culture.",
      category: "HR",
      usedCount: "345,600+",
      gradient: "from-pink-400 to-rose-500",
      icon: "Users",
      aiPrompt: "Create an employee engagement survey covering job satisfaction, team culture, manager support, work-life balance, recognition, career growth, and NPS for recommending the company.",
      previewQuestions: [
        { type: "rating", label: "How satisfied are you with your current role?", max: 5 },
        { type: "rating", label: "How would you rate the team culture and collaboration?", max: 5 },
        { type: "multiple_choice", label: "How would you describe your work-life balance?", options: ["Excellent", "Good", "Fair", "Poor"] },
        { type: "rating", label: "How likely are you to recommend this company as a great place to work?", max: 10 },
        { type: "text", label: "What do you enjoy most about working here?" },
        { type: "text", label: "What would make your work experience better?" },
      ],
    },
    {
      title: "Net Promoter Score (NPS)",
      description: "Measure customer loyalty and identify your promoters, passives, and detractors.",
      category: "Most Popular",
      usedCount: "280,000+",
      gradient: "from-blue-400 to-indigo-500",
      icon: "Zap",
      aiPrompt: "Create an NPS survey with the standard NPS question (0-10 scale), follow-up reason question, and open-ended feedback for improvement.",
      previewQuestions: [
        { type: "rating", label: "How likely are you to recommend us to a friend or colleague?", max: 10 },
        { type: "multiple_choice", label: "What is the primary reason for your score?", options: ["Product quality", "Customer service", "Value for money", "Ease of use", "Other"] },
        { type: "text", label: "What could we do to improve your experience?" },
      ],
    },
    {
      title: "Food Satisfaction Survey",
      description: "Rate food quality, service speed, and overall dining experience at your restaurant.",
      category: "Restaurant",
      usedCount: "120,000+",
      gradient: "from-orange-400 to-amber-500",
      icon: "Utensils",
      aiPrompt: "Create a food satisfaction survey for a restaurant covering food quality, service speed, staff friendliness, ambiance, value for money, and overall experience.",
      previewQuestions: [
        { type: "rating", label: "How would you rate the overall food quality?", max: 5 },
        { type: "rating", label: "How satisfied are you with the service?", max: 5 },
        { type: "rating", label: "How would you rate the ambiance and atmosphere?", max: 5 },
        { type: "multiple_choice", label: "Would you recommend us to a friend?", options: ["Definitely yes", "Probably yes", "Not sure", "Probably not", "Definitely not"] },
        { type: "text", label: "Any suggestions to improve our food or service?" },
      ],
    },
    {
      title: "Daily Cafe Feedback",
      description: "Get daily feedback on coffee quality, service speed, and cafe atmosphere.",
      category: "Restaurant",
      usedCount: "85,000+",
      gradient: "from-amber-400 to-orange-500",
      icon: "Coffee",
      aiPrompt: "Create a daily cafe feedback survey covering coffee and drink quality, service speed, seating comfort, cleanliness, visit frequency, and suggestions for improvement.",
      previewQuestions: [
        { type: "rating", label: "How would you rate the quality of your coffee/drink?", max: 5 },
        { type: "rating", label: "How satisfied are you with the speed of service?", max: 5 },
        { type: "multiple_choice", label: "What did you order today?", options: ["Coffee", "Tea", "Smoothie", "Pastry", "Full meal", "Other"] },
        { type: "text", label: "What would make your cafe experience better?" },
      ],
    },
    {
      title: "Patient Experience Survey",
      description: "Measure healthcare quality, staff communication, and patient satisfaction scores.",
      category: "Healthcare",
      usedCount: "95,000+",
      gradient: "from-emerald-400 to-teal-500",
      icon: "Heart",
      aiPrompt: "Create a healthcare patient experience survey covering quality of care, wait times, staff communication, facility cleanliness, likelihood to return, and improvement suggestions.",
      previewQuestions: [
        { type: "rating", label: "How would you rate the overall quality of care you received?", max: 5 },
        { type: "rating", label: "How satisfied were you with the wait time?", max: 5 },
        { type: "rating", label: "How well did the staff communicate with you?", max: 5 },
        { type: "multiple_choice", label: "Would you return to this facility?", options: ["Definitely yes", "Probably yes", "Not sure", "Probably not"] },
        { type: "text", label: "Is there anything specific we could do to improve your experience?" },
      ],
    },
    {
      title: "Course Evaluation Survey",
      description: "Collect detailed feedback on instructor effectiveness and course content quality.",
      category: "Education",
      usedCount: "110,000+",
      gradient: "from-indigo-400 to-violet-500",
      icon: "GraduationCap",
      aiPrompt: "Create a university course evaluation survey covering instructor effectiveness, course content quality, pace, difficulty level, learning outcomes, and improvement suggestions.",
      previewQuestions: [
        { type: "rating", label: "How would you rate the overall quality of this course?", max: 5 },
        { type: "rating", label: "How effective was the instructor at explaining concepts?", max: 5 },
        { type: "multiple_choice", label: "How was the pace of the course?", options: ["Too fast", "Slightly fast", "Just right", "Slightly slow", "Too slow"] },
        { type: "multiple_choice", label: "Would you recommend this course to others?", options: ["Definitely yes", "Probably yes", "Not sure", "Probably not"] },
        { type: "text", label: "What improvements would you suggest for this course?" },
      ],
    },
    {
      title: "Event Feedback Survey",
      description: "Measure attendee satisfaction, speaker quality, and improve your future events.",
      category: "Events",
      usedCount: "75,000+",
      gradient: "from-yellow-400 to-amber-500",
      icon: "Star",
      aiPrompt: "Create a post-event feedback survey covering overall experience, organization, speaker or content quality, venue, networking value, likelihood to attend future events, and suggestions.",
      previewQuestions: [
        { type: "rating", label: "How would you rate the overall event experience?", max: 5 },
        { type: "rating", label: "How satisfied were you with the event organisation and logistics?", max: 5 },
        { type: "rating", label: "How would you rate the quality of speakers/content?", max: 5 },
        { type: "multiple_choice", label: "Would you attend future events by us?", options: ["Definitely yes", "Probably yes", "Not sure", "Probably not"] },
        { type: "text", label: "What could we improve for next time?" },
      ],
    },
  ];

  let templatesCreated = 0;
  for (const templateData of templatesData) {
    const existing = await Template.findOne({ title: templateData.title });
    if (!existing) {
      await Template.create({ ...templateData, createdBy: superAdminId });
      console.log(`  ✓ Created template: ${templateData.title}`);
      templatesCreated++;
    } else {
      console.log(`  ⏭️ Template already exists: ${templateData.title}`);
    }
  }
  console.log(`✅ Templates: ${templatesCreated} new, ${templatesData.length - templatesCreated} existing`);
};

const runSeed = async (): Promise<void> => {
  try {
    // Use MONGO_URI from .env file instead of connectDb()
    const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smtiap";
    await mongoose.connect(mongoURI);
    console.log("MongoDB Connected.");
    console.log(`Database: ${mongoose.connection.db?.databaseName}`);
    
    // Find super admin directly from database
    let superAdmin = await User.findOne({ role: "super_admin" });
    
    if (!superAdmin) {
      console.log("No super admin found. Creating one...");
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash("Admin123!", 10);
      
      superAdmin = await User.create({
        email: "superadmin@smtiap.com",
        username: "SuperAdmin",
        password: hashedPassword,
        role: "super_admin",
        isVerified: true,
      });
      console.log("✅ Super admin created:", superAdmin.email);
    } else {
      console.log("✅ Super admin found:", superAdmin.email);
    }
    
    await seedCategoriesAndTemplates(superAdmin._id);
    
    console.log("\n✅ Seeding completed!");
    
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