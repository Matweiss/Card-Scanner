import { GoogleGenAI, Type } from "@google/genai";
import type { ContactInfo } from '../types';

// Get API key from environment variable (replaced at build time by Vite)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
    console.error('GEMINI_API_KEY is not set. Please add it to your environment variables.');
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

const contactSchema = {
    type: Type.OBJECT,
    properties: {
        firstName: { type: Type.STRING, description: "First name of the person." },
        lastName: { type: Type.STRING, description: "Last name of the person." },
        title: { type: Type.STRING, description: "Job title or position." },
        company: { type: Type.STRING, description: "Company or organization name." },
        phone: { type: Type.STRING, description: "Contact phone number." },
        email: { type: Type.STRING, description: "Contact email address." },
        website: { type: Type.STRING, description: "Company or personal website URL." },
        address: { type: Type.STRING, description: "Full mailing address." },
        tags: { type: Type.STRING, description: "Comma-separated tags based on the card's context (e.g., 'prospect, tech, marketing'). Suggest relevant tags." },
    },
    required: ["firstName", "lastName", "email", "company"],
};

export async function extractContactInfo(fileData: { data: string, mimeType: string }): Promise<Omit<ContactInfo, 'notes'>> {
    const filePart = fileToGenerativePart(fileData.data, fileData.mimeType);
    const textPart = {
      text: "Analyze the business card file and extract all contact information, populating the fields according to the provided JSON schema. If a specific piece of information isn't on the card, use an empty string for its value.",
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [filePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: contactSchema,
        },
    });

    try {
        let jsonString = response.text.trim();
        if (jsonString.startsWith("```json")) {
            jsonString = jsonString.slice(7, -3).trim();
        } else if (jsonString.startsWith("```")) {
            jsonString = jsonString.slice(3, -3).trim();
        }

        if (!jsonString) {
          throw new Error("AI returned an empty response.");
        }

        const parsedJson = JSON.parse(jsonString) as Omit<ContactInfo, 'notes'>;
        return { ...parsedJson, tags: parsedJson.tags || '' };
    } catch (e) {
        console.error("Failed to parse JSON from Gemini response:", response.text, e);
        throw new Error("Could not read the business card. The AI failed to extract the information in the correct format. Please try a clearer picture or file.");
    }
}


export async function analyzeBusinessCardImage(fileData: { data: string; mimeType: string }): Promise<string> {
    const filePart = fileToGenerativePart(fileData.data, fileData.mimeType);
    const textPart = {
      text: `Analyze the visual design of this business card (from an image or PDF), including its logo, color scheme, typography, and layout. 
      Based on these elements, provide a brief, one-paragraph description of the company's likely brand identity (e.g., "modern and tech-focused," "traditional and trustworthy," "creative and playful"). 
      Focus on providing context that would be useful for writing a follow-up email. Do not mention that you are analyzing a business card. Start directly with the analysis.`,
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [filePart, textPart] },
    });

    return response.text.trim();
}

export async function draftFollowUpEmail(contactInfo: ContactInfo, emailNotes: string): Promise<string> {
    // Generate a prompt that users can copy and paste into Claude, Gemini, or ChatGPT
    const promptForUser = `I need help drafting a professional follow-up email. Here's the context:

**Recipient Information:**
- Name: ${contactInfo.firstName} ${contactInfo.lastName}
- Title: ${contactInfo.title}
- Company: ${contactInfo.company}
- Email: ${contactInfo.email}
- Phone: ${contactInfo.phone}
- Website: ${contactInfo.website}
- Address: ${contactInfo.address}

**Context & Notes:**
${contactInfo.notes ? `Contact Notes: ${contactInfo.notes}\n` : ''}${emailNotes ? `Email Notes: ${emailNotes}\n` : ''}
**Instructions:**
Please draft a friendly and professional follow-up email to ${contactInfo.firstName} that:

1. Uses a warm, personalized greeting
2. References our previous conversation or meeting (based on the notes above)
3. Shows genuine interest in their company and role
4. If there are AI Insights in the notes, incorporates specific details about their company (e.g., recent news, products, or initiatives)
5. Clearly states the purpose of my follow-up with a specific value proposition
6. Ends with a clear, easy-to-act-on call to action (e.g., scheduling a brief call)
7. Uses a professional closing

The email should be:
- Concise (3-4 short paragraphs)
- Highly personalized, not template-like
- Professional yet conversational
- Focused on providing value to them

Please include a compelling subject line as well.`;

    // Return the prompt directly without calling the AI
    // Users will copy this and paste it into their preferred AI service
    return promptForUser;
}


export async function transcribeAudio(audioData: { data: string, mimeType: string }): Promise<string> {
    const audioPart = fileToGenerativePart(audioData.data, audioData.mimeType);
    const textPart = {
        text: "Transcribe the following audio recording of notes taken after a meeting. Provide only the transcribed text.",
    };

    const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: { parts: [audioPart, textPart] },
    });

    return response.text;
}

export async function recommendWebsite(company: string, email: string): Promise<string> {
    const prompt = `Based on the company name "${company}" and contact email "${email}", find the official website URL. Return only the URL, with no additional text, headers, or markdown. For example: https://www.example.com`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });
    
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const match = response.text.match(urlRegex);

    return match ? match[0].trim() : response.text.trim();
}

export async function getAIInsights(firstName: string, lastName: string, company: string, title: string, website: string): Promise<string> {
    const prompt = `
        Research "${firstName} ${lastName}" (${title} at ${company}) and their company.
        Company website: "${website}"

        Provide a SHORT, actionable research note with these sections:

        ### Quick Company Overview
        In 2-3 sentences: What does ${company} do? What's their main focus or specialty?

        ### About ${firstName}
        In 2-3 sentences: Based on their ${title} role, what are their likely priorities and challenges? What would they care about?

        ### Recent News & Talking Points
        Find 1-2 recent, specific items (news, product launches, company updates, or professional activities).
        Present as bullet points with dates if available.
        These should be concrete conversation starters, not generic observations.

        Keep it concise and focused. Only include verifiable information from web search.
        If you can't find specific information for a section, write "No recent information found" instead of guessing.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    return `\n\n--- AI Insights ---\n${response.text.trim()}`;
}