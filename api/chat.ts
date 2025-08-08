// This file would be deployed as a serverless function, e.g., at /api/chat
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, MessageSender } from '../types';
import { AI_PERSONA_PROMPT } from "../constants";

// This would be set in your serverless environment variables, NOT in the code.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async (req: Request) => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
    }

    try {
        const { message, history, isEvaluation, clientApiKey } = await req.json();

        const effectiveKey = (typeof clientApiKey === 'string' && clientApiKey.trim().length > 0)
          ? clientApiKey.trim()
          : GEMINI_API_KEY;

        if (!effectiveKey) {
          return new Response(JSON.stringify({ message: 'Server configuration error: API key not set.' }), { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey: effectiveKey });
        
        let response: GenerateContentResponse;

        if (isEvaluation) {
            // Handle code evaluation
             response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: message // The message here is the full evaluation prompt
             });
        } else {
            // Handle standard chat
            const chatHistory = (history || []).map((msg: ChatMessage) => ({
                role: msg.sender === MessageSender.USER ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));
            
            const contents = [...chatHistory, { role: 'user', parts: [{ text: message }] }];

            response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: contents,
                config: {
                    systemInstruction: AI_PERSONA_PROMPT,
                }
            });
        }
        
        return new Response(JSON.stringify({ text: response.text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Error in /api/chat:', error);
        return new Response(JSON.stringify({ message: 'An error occurred while communicating with the AI.' }), { status: 500 });
    }
};
