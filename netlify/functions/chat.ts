import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AI_PERSONA_PROMPT } from "../../constants";
import { ChatMessage, MessageSender } from "../../types";

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Server configuration error: API key not set.' }) };
  }

  try {
    const { message, history, isEvaluation } = JSON.parse(event.body || '{}');

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    let response: GenerateContentResponse;

    if (isEvaluation) {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message
      });
    } else {
      const chatHistory = (history || []).map((msg: ChatMessage) => ({
        role: msg.sender === MessageSender.USER ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const contents = [...chatHistory, { role: 'user', parts: [{ text: message }] }];

      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: AI_PERSONA_PROMPT,
        }
      });
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: response.text })
    };
  } catch (error: any) {
    console.error('Error in chat function:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'An error occurred while communicating with the AI.' }) };
  }
}
