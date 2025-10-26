import { GoogleGenAI, Type } from "@google/genai";
import type { ContactInfo } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    const prompt = `
      You are a highly skilled professional communication assistant, an expert in crafting personalized and impactful business emails.
      Your task is to draft a friendly and professional follow-up email to ${contactInfo.firstName} ${contactInfo.lastName} from ${contactInfo.company}.

      **Context and Information:**
      - Recipient's Name: ${contactInfo.firstName} ${contactInfo.lastName}
      - Recipient's Title: ${contactInfo.title}
      - Recipient's Company: ${contactInfo.company}
      - Recipient's Website: ${contactInfo.website}
      - Contact Tags: ${contactInfo.tags}
      - My permanent notes about this contact: "${contactInfo.notes}"
      - My notes for this specific email draft (includes AI insights): "${emailNotes}"

      **Instructions for Drafting:**

      1.  **Analyze and Infer:** Based on the company name, title, website, tags, and notes, first infer the company's industry (e.g., "SaaS", "Healthcare Tech", "Digital Marketing Agency"). This will help you tailor the language.

      2.  **Synthesize Context:** Carefully combine my permanent notes with the email draft notes. The "AI Insights" section in the email notes is especially important for personalization. Identify the core reason for our previous interaction and the main goal of this follow-up.

      3.  **Craft the Email:**
          *   **Subject Line:** Create a concise and compelling subject line. It should be relevant to our last conversation (e.g., "Following up on our chat about AI").
          *   **Greeting:** Start with a warm and personal greeting (e.g., "Hi ${contactInfo.firstName},").
          *   **Opening:** Briefly and warmly reference where you met or your last conversation, as mentioned in the notes.
          *   **Body - Add Value and Personalize:**
              *   Show genuine interest by connecting your reason for reaching out to their specific industry or company.
              *   Use the "AI Insights" from the notes to mention something specific and positive about their company (e.g., a recent product launch, a news article, an interesting project mentioned on their website). This shows you've done your homework.
              *   Clearly state the purpose of your follow-up, framing it in terms of a mutual benefit or a solution to a problem they might have.
          *   **Call to Action:** End with a single, clear, and easy-to-act-on call to action (e.g., "Are you free for a 15-minute call next week to discuss this further?").
          *   **Closing:** Use a professional closing (e.g., "Best regards," or "Looking forward to hearing from you,").
          *   **Signature:** Sign off literally as "[Your Name]". Do not invent a name.

      The final email should be concise, professional, and feel highly personalized, not like a generic template.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    return response.text;
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
        As a business intelligence analyst, perform a quick web search on the person "${firstName} ${lastName}" (${title}) and the company "${company}". 
        The company's website is "${website}".
        
        Provide a concise summary in markdown format with the following three sections:

        ### Company Snapshot
        Briefly describe what the company does, its main products/services, and its target market based on their website.

        ### Role Insights
        Based on their title ("${title}"), what are their likely key responsibilities and business priorities? What kind of challenges might they be facing?

        ### Conversation Starters
        Find recent news, company announcements, or professional activities of the person. Suggest 2-3 specific, personalized icebreakers or talking points for a follow-up email. Frame them as engaging questions or observations.

        If you cannot find specific information for a section, state that clearly. Do not fabricate information.
        The entire output should be formatted as markdown.
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