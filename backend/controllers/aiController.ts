import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Survey from "../models/Survey.js";

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

IMPORTANT: When creating branching, make sure the targetQuestionLabel exactly matches the label of another question in the survey. Use "__END__" if the survey should end after that option.

IMPORTANT — Input validation: Before generating a survey, FIRST determine if the user's request is a meaningful survey description. A valid description should describe a topic, purpose, or theme for a survey (e.g., "customer feedback", "employee satisfaction", "event registration", "course evaluation"). 

If the input is gibberish, random characters, nonsense text, off-topic questions, non-survey requests, or anything that is NOT a clear survey description, do NOT generate a survey. Instead, return this EXACT JSON:
{
  "_error": "invalid_input",
  "_message": "Please describe what kind of survey you want to create. For example: \"A customer feedback survey about our new mobile app\" or \"An employee engagement survey for our company\"."
}`;

// Generates a complete survey structure from a user's natural-language description via Gemini.
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

    // Check both frontend (VITE_) and backend env var naming conventions.
    const apiKey =
      process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Gemini API key is missing" });
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const fullPrompt = `${SURVEY_GENERATION_SYSTEM_PROMPT}\n\nUser request: ${prompt}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json", // Forces Gemini to return raw JSON.
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

// Modifies an existing survey structure based on a user's natural-language change request.
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

    // Check both frontend (VITE_) and backend env var naming conventions.
    const apiKey =
      process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Gemini API key is missing" });
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

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

// Matches user input against known page routes locally, used as fallback when Gemini is unavailable.
const tryLocalNavigation = (prompt: string) => {
  const normalized = prompt.toLowerCase().trim();

  // Define route mapping
  const routes = [
    {
      pattern: /\b(dashboard|creator-dashboard|creator dashboard)\b/,
      path: "/creator-dashboard",
      name: "Dashboard",
    },
    {
      pattern:
        /\b(analytics|stats|charts|reports|analyze|analyzed|analysis|analyse|analysed)\b/,
      path: "/analytics",
      name: "Analytics",
    },
    {
      pattern:
        /\b(created surveys|my surveys|view surveys|surveys|survey|survey list)\b/,
      path: "/created-surveys",
      name: "Created Surveys",
    },
    {
      pattern:
        /\b(create new survey|create survey|new survey|make survey|add survey)\b/,
      path: "/create-new-survey",
      name: "Create New Survey",
    },
    {
      pattern: /\b(templates|template)\b/,
      path: "/templates",
      name: "Templates",
    },
    {
      pattern: /\b(subscription|billing|plan|credits|pricing)\b/,
      path: "/subscription",
      name: "Subscription",
    },
    {
      pattern:
        /\b(organization registration|register organization|org registration|organization|org)\b/,
      path: "/organization-registration",
      name: "Organization Registration",
    },
    {
      pattern: /\b(role management|roles|role|manage roles)\b/,
      path: "/role-management",
      name: "Role Management",
    },
    {
      pattern: /\b(audit logs|audit log|logs|audit)\b/,
      path: "/audit-log",
      name: "Audit Logs",
    },
    { pattern: /\b(admin|administrator)\b/, path: "/admin", name: "Admin" },
    { pattern: /\b(home|landing|main|index)\b/, path: "/", name: "Home" },
  ];

  for (const route of routes) {
    if (route.pattern.test(normalized)) {
      return {
        response_message: `Navigating you to your ${route.name.toLowerCase()} page.`,
        action: "navigate",
        path: route.path,
      };
    }
  }

  // Also match general greets/questions for polite fallback
  if (/\b(hi|hello|hey|greetings|yo)\b/.test(normalized)) {
    return {
      response_message:
        "Hello! I am your AI assistant. How can I help you navigate?",
      action: "speak",
      path: null,
    };
  }

  return null;
};

// Main conversational AI handler: routes navigation, answers questions, or generates surveys.
// Falls back to local route matching when Gemini is unreachable.
export const chatWithAi = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { prompt, history, file } = req.body;
  if (!prompt) {
    res.status(400).json({ error: "Prompt is required" });
    return;
  }

  try {
    // Intercept specific requests for individual survey analytics or settings using surveyTitle
    const normalizedPrompt = prompt.toLowerCase();
    const isAnalyticsRequest =
      /\b(analytics|results|charts|stats|responses|analyse|analysis|analyze|analyzed)\b/.test(
        normalizedPrompt,
      );
    const isSettingsRequest =
      /\b(settings|configure|configuration|edit settings)\b/.test(
        normalizedPrompt,
      );

    if (isAnalyticsRequest || isSettingsRequest) {
      // Find all surveys
      const surveys = await Survey.find({}, "surveyTitle _id").lean();
      // Sort surveys by title length descending to prevent partial match issues
      const sortedSurveys = surveys.sort(
        (a, b) => b.surveyTitle.length - a.surveyTitle.length,
      );

      for (const survey of sortedSurveys) {
        const titleLower = survey.surveyTitle.toLowerCase();
        if (normalizedPrompt.includes(titleLower)) {
          if (isAnalyticsRequest) {
            res.json({
              response_message: `Opening analytics for survey "${survey.surveyTitle}".`,
              action: "navigate",
              path: `/survey-results/${survey._id}`,
            });
            return;
          } else if (isSettingsRequest) {
            res.json({
              response_message: `Opening settings for survey "${survey.surveyTitle}".`,
              action: "navigate",
              path: `/survey-settings/${survey._id}`,
            });
            return;
          }
        }
      }
    }

    const apiKey =
      process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Local navigation fallback when API key is missing
      const fallback = tryLocalNavigation(prompt);
      if (fallback) {
        res.json(fallback);
        return;
      }
      res
        .status(500)
        .json({
          error:
            "Gemini API key is missing. Please set GEMINI_API_KEY in your backend/.env file.",
        });
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // System prompt for structured navigation/actions
    const systemInstruction = `You are a helpful AI assistant for a website (SMTIAP survey platform). 
Your goal is to understand the user's intent, answer questions politely and accurately using the system context below, and tell the frontend what action to take.
You must always respond in strictly valid JSON format with the following structure:
{
  "response_message": "The text to speak back to the user",
  "action": "navigate" | "speak" | "generate" | "none",
  "path": "/path/to/page" // ONLY if action is navigate, otherwise null,
  "surveyData": { // ONLY if action is generate, otherwise omit this field entirely
    "surveyTitle": "string",
    "description": "string",
    "pages": [
      {
        "title": "string",
        "questions": [
          {
            "type": "short_text" | "long_text" | "multiple_choice" | "checkboxes" | "rating" | "number" | "date",
            "label": "string",
            "required": boolean,
            "placeholder": "string (optional)",
            "options": ["string"] (only for multiple_choice/checkboxes),
            "max": number (only for rating/number),
            "min": number (only for number)
          }
        ]
      }
    ]
  }
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

SYSTEM CONTEXT & INFORMATION:
1. Billing & Pricing Plans:
   - Route: /subscription
   - Currency: LKR (Sri Lankan Rupees), payment processed securely via PayHere gateway sandbox.
   - Free Plan: LKR 0/month. Features: 1 user, Basic features, Community support.
   - Startup Plan: LKR 1,000/month or LKR 11,000/year (saves LKR 1,000 yearly). Features: 5 users, All basic features, Priority support, Advanced analytics.
   - Pro Plan: LKR 1,500/month or LKR 17,000/year. Features: 10 users, All startup features, Dedicated account manager, Custom integrations.
   - If user asks about billing or how to upgrade, explain the plans and offer to navigate them to the /subscription page.

2. Survey & Permissions:
   - Surveys belong to tenants (organizations) to ensure data isolation.
   - Survey statuses: Draft, Running, Finished, Scheduled.
   - Survey details: Supports multi-page structures, customizable branding (colors, logo, website URL), password protection, anonymous responses, and advanced question types (short_text, long_text, multiple_choice, checkboxes, rating, number, date).
   - Conditional branching: Supported for multiple_choice and checkboxes questions to route user to target questions or end the survey.
   - Role Permissions: Users with roles 'super_admin', 'admin', or 'creator' can create, update, and delete surveys. Users with roles 'viewer' or 'billing_manager' cannot modify or create surveys.
   - If user asks about survey configurations, statuses, templates, or permissions, provide details and/or offer navigation to relevant routes like /created-surveys, /create-new-survey, or /templates.

If the user asks to generate, create, or build a survey (especially if they upload or provide questions and answers in a text file or an image/screenshot of a survey), parse and analyze the provided text content or image, generate the survey JSON structure matching the surveyData format, set action to "generate", set surveyData to the generated JSON, and response_message to a polite confirmation like "I have generated the survey from your questions. Let me take you to the editor."
If the user asks to go to a page or open a page, set action to "navigate", path to the page path, and response_message to confirm the action.
If the user asks a general question, hello, or asks about billing/surveys, answer it in response_message, set action to "speak" (or "navigate" if they explicitly asked to go to the page), and path to null (unless navigating).`;

    // Include prior conversation turns so the AI maintains context across messages.
    let historyText = "";
    if (Array.isArray(history) && history.length > 0) {
      historyText =
        "\n\nConversation History:\n" +
        history
          .map(
            (msg: any) =>
              `${msg.sender === "user" ? "User" : "AI Assistant"}: ${msg.text}`,
          )
          .join("\n");
    }

    const fullPrompt = `${systemInstruction}${historyText}\n\nUser request: ${prompt}`;

    const parts: any[] = [{ text: fullPrompt }];
    if (file && file.mimeType && file.data) {
      parts.push({
        inlineData: {
          mimeType: file.mimeType,
          data: file.data
        }
      });
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();
    const aiResponse = JSON.parse(responseText);

    res.json(aiResponse);
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    // Even if Gemini fails at runtime (e.g. rate limit, invalid key, or network issue), try local navigation fallback before erroring
    const fallback = tryLocalNavigation(prompt);
    if (fallback) {
      res.json(fallback);
      return;
    }
    res.status(500).json({ error: "Failed to communicate with AI" });
  }
};
