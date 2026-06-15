// Utility to list available Gemini model IDs from the Google AI API.
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
async function list() {
  const models = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
  ).then((r) => r.json());
  console.log(models.models.map((m: any) => m.name));
}
list();
