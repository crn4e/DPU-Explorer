'use server';
/**
 * @fileOverview A conversational AI flow for answering questions about Dhurakij Pundit University.
 *
 * - chatDpu - A function that takes a user's message and chat history to get a response.
 * - ChatDpuInput - The input type for the chatDpu function.
 * - ChatDpuOutput - The return type for the chatDpu function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';
import {GenerateContentRequest} from '@google/generative-ai';

const systemPrompt = `You are a helpful and knowledgeable assistant specializing in all matters related to Dhurakij Pundit University (DPU). Your role is to provide accurate, friendly, and up-to-date information to students, faculty, and visitors.

Your knowledge base includes, but is not limited to:
- Campus locations, building numbers, and what each building is used for.
- Office hours and contact information for various departments.
- Academic programs, faculties, and courses.
- Campus services, amenities, and facilities (e.g., library, food court, sports complex).
- University history, mission, and values.
- Important announcements and events.

When responding to questions, please:
- Be friendly and approachable.
- Provide clear and concise answers.
- If you don't know an answer, say so honestly rather than making something up.
- Use Thai language for your responses.`;

const HistoryItemSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type HistoryItem = z.infer<typeof HistoryItemSchema>;

const ChatDpuInputSchema = z.object({
  message: z.string().describe("The user's latest message."),
  history: z.array(HistoryItemSchema).describe('The conversation history.'),
});
export type ChatDpuInput = z.infer<typeof ChatDpuInputSchema>;

const ChatDpuOutputSchema = z.object({
  response: z.string().describe("The AI's response to the user."),
});
export type ChatDpuOutput = z.infer<typeof ChatDpuOutputSchema>;

export async function chatDpu(
  input: ChatDpuInput
): Promise<ChatDpuOutput> {
  return chatDpuFlow(input);
}

const chatDpuFlow = ai.defineFlow(
  {
    name: 'chatDpuFlow',
    inputSchema: ChatDpuInputSchema,
    outputSchema: ChatDpuOutputSchema,
  },
  async ({ message, history }) => {
    const llmResponse = await ai.generate({
      model: googleAI.model('gemini-1.5-flash-latest'),
      system: systemPrompt,
      history: history,
      prompt: message,
    });

    return { response: llmResponse.text };
  }
);
