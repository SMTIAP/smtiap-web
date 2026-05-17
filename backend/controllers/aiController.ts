import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SURVEY_GENERATION_SYSTEM_PROMPT = `You are a survey generation assistant. Given a user's description, generate a complete survey in JSON format.

Available question types: "short_text", "long_text", "multiple_choice", "checkboxes", "rating", "number", "date".

Rules:
- For "multiple_choice" and "checkboxes", always include an "options" array with at least 2 options.
- For "rating", always include a "max" number (default 5).
- For "number", include "min" and "max" (use reasonable defaults).
- Each question must have "required" (boolean) and a descriptive "label".
- Generate 1-3 pages depending on complexity.
- **Conditional branching:** For "multiple_choice" and "checkboxes" questions, add smart conditional branching rules that map each answer option to the logical next question. Use "targetQuestionLabel" to reference the target question by its exact label. Use "__END__" to end the survey.
- Always return valid JSON in this exact structure:
{
  "surveyTitle": "string",
  "description": "string",
  "pages": [
    {
      "title": "string",
      "questions": [
        {
          "type": "string (one of the types above)",
          "label": "string",
          "required": boolean,
          "placeholder": "string (optional)",
          "options": ["string"] (only for multiple_choice/checkboxes),
          "max": number (only for rating/number),
          "min": number (only for number),
          "branching": {
            "enabled": true,
            "rules": [
              { "value": "Option text", "targetQuestionLabel": "Exact label of target question" }
            ],
            "defaultTargetQuestionLabel": "Label of fallback question or leave empty"
          }
        }
      ]
    }
  ]
}

Generate diverse question types - don't use the same type for all questions. Mix short_text, multiple_choice, rating, etc. as appropriate for the survey topic.

IMPORTANT: When creating branching, make sure the targetQuestionLabel exactly matches the label of another question in the survey. Use "__END__" if the survey should end after that option.`;

export const generateSurveyWithAi = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const apiKey =
      process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Gemini API key is missing" });
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const fullPrompt = `${SURVEY_GENERATION_SYSTEM_PROMPT}\n\nUser request: ${prompt}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();
    const surveyData = JSON.parse(responseText);

    res.json(surveyData);
  } catch (error) {
    console.error("Error generating survey with AI:", error);
    res.status(500).json({ error: "Failed to generate survey with AI" });
  }
};

const SURVEY_MODIFICATION_SYSTEM_PROMPT = `You are a survey modification assistant. Given an existing survey structure and a user's modification request, update the survey accordingly.

Available question types: "short_text", "long_text", "multiple_choice", "checkboxes", "rating", "number", "date".

Rules:
- Preserve all existing questions UNLESS the user asks to modify/remove them.
- For "multiple_choice" and "checkboxes", always include an "options" array with at least 2 options.
- For "rating", always include a "max" number (default 5).
- For "number", include "min" and "max" (use reasonable defaults).
- Each question must have "required" (boolean) and a descriptive "label".
- For "multiple_choice" and "checkboxes" questions, add conditional branching using "targetQuestionLabel" referencing the exact label of the target question. Use "__END__" to end the survey.
- Return valid JSON with the SAME structure as the input:
{
  "surveyTitle": "string",
  "description": "string",
  "pages": [
    {
      "title": "string",
      "questions": [
        {
          "type": "string",
          "label": "string",
          "required": boolean,
          "placeholder": "string (optional)",
          "options": ["string"] (only for multiple_choice/checkboxes),
          "max": number (only for rating/number),
          "min": number (only for number),
          "branching": {
            "enabled": true,
            "rules": [{ "value": "Option text", "targetQuestionLabel": "Exact label of target question" }],
            "defaultTargetQuestionLabel": "Fallback question label"
          }
        }
      ]
    }
  ]
}`;

export const modifySurveyWithAi = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { prompt, currentSurvey } = req.body;
    if (!prompt || !currentSurvey) {
      res.status(400).json({ error: "Prompt and currentSurvey are required" });
      return;
    }

    const apiKey =
      process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Gemini API key is missing" });
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const currentSurveyJson = JSON.stringify(currentSurvey, null, 2);
    const fullPrompt = `${SURVEY_MODIFICATION_SYSTEM_PROMPT}\n\nCurrent survey:\n${currentSurveyJson}\n\nModification request: ${prompt}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();
    const modifiedSurvey = JSON.parse(responseText);

    res.json(modifiedSurvey);
  } catch (error) {
    console.error("Error modifying survey with AI:", error);
    res.status(500).json({ error: "Failed to modify survey with AI" });
  }
};

export const chatWithAi = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const apiKey =
      process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
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
      },
    });

    const responseText = result.response.text();
    const aiResponse = JSON.parse(responseText);

    res.json(aiResponse);
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    res.status(500).json({ error: "Failed to communicate with AI" });
  }
};
