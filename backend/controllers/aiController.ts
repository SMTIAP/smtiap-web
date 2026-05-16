import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const chatWithAi = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Gemini API key is missing" });
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // System prompt for structured navigation/actions
    const systemInstruction = `You are a helpful AI assistant for a website. 
Your goal is to understand the user's intent, respond to them politely, and tell the frontend what action to take.
You must always respond in strictly valid JSON format with the following structure:
{
  "response_message": "The text to speak back to the user",
  "action": "navigate" | "speak" | "none",
  "path": "/path/to/page" // ONLY if action is navigate, otherwise null
}

Available pages to navigate to:
- Dashboard: /creator-dashboard
- Analytics: /analytics
- Created Surveys: /created-surveys
- Create New Survey: /create-new-survey
- Templates: /templates
- Subscription: /subscription
- Organization Registration: /organization-registration
- Role Management: /role-management
- Audit Logs: /audit-log
- Admin: /admin
- Home: /

If the user asks to go to a page or open a page, set action to "navigate", path to the page path, and response_message to confirm the action.
If the user asks a general question or says hello, answer it in response_message, set action to "speak", and path to null.`;

    const fullPrompt = `${systemInstruction}\n\nUser request: ${prompt}`;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    const responseText = result.response.text();
    const aiResponse = JSON.parse(responseText);

    res.json(aiResponse);
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    res.status(500).json({ error: "Failed to communicate with AI" });
  }
};
