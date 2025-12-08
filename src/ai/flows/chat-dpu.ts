'use server';

/**
 * @fileOverview A chatbot for answering questions about DPU.
 *
 * - chatDpu - A function that handles the chat conversation.
 * - ChatDpuInput - The input type for the chatDpu function.
 * - ChatDpuOutput - The return type for the chatDpu function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const ChatDpuInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The chat history.'),
  message: z.string().describe('The latest user message.'),
});
export type ChatDpuInput = z.infer<typeof ChatDpuInputSchema>;

const ChatDpuOutputSchema = z.object({
  response: z.string().describe('The AI response.'),
});
export type ChatDpuOutput = z.infer<typeof ChatDpuOutputSchema>;

export async function chatDpu(input: ChatDpuInput): Promise<ChatDpuOutput> {
  return chatDpuFlow(input);
}

const systemPrompt = `คุณคือผู้ช่วยที่เชี่ยวชาญและมีความรู้เกี่ยวกับเรื่องทุกอย่างในมหาวิทยาลัยธุรกิจบัณฑิตย์`;

const chatDpuFlow = ai.defineFlow(
  {
    name: 'chatDpuFlow',
    inputSchema: ChatDpuInputSchema,
    outputSchema: ChatDpuOutputSchema,
  },
  async ({ message, history }) => {
    const model = googleAI.model('gemini-1.5-flash', { tools: [googleAI.googleSearch]});
    const { text } = await ai.generate({
      model,
      history,
      system: systemPrompt,
      prompt: message,
      config: {
        temperature: 0.2,
      },
    });

    return { response: text };
  }
);
