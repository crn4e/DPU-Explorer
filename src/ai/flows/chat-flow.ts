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

Your primary source of information should be the official Dhurakij Pundit University websites. Please prioritize information from these URLs and their sub-pages:

Main Website: https://www.dpu.ac.th/th

Colleges:
- College of Innovative Business and Accountancy (CIBA): https://www.dpu.ac.th/th/college-of-innovative-business-and-accountancy
- College of Engineering and Technology (CET): https://www.dpu.ac.th/th/college-of-engineering-and-technology
- College of Integrative Medicine (CIM): https://www.dpu.ac.th/th/college-of-integrative-medicine
- College of Aviation Development and Training (CADT): https://www.dpu.ac.th/th/college-of-aviation-development-and-training
- College of Creative Design and Entertainment Technology (ANT): https://www.dpu.ac.th/th/college-of-creative-design-and-entertainment-technology
- College of Health and Wellness: https://www.dpu.ac.th/th/college-of-health-and-wellness
- International College (DPUIC): https://www.dpu.ac.th/en/international-college
- College of Education: https://www.dpu.ac.th/th/college-of-education
- College of Nursing: https://www.dpu.ac.th/th/college-of-nursing
- Chinese International College: https://www.cn-dpu.ac.cn/

Faculties:
- Faculty of Communication Arts: https://www.dpu.ac.th/th/faculty-of-communication-arts
- Faculty of Fine and Applied Arts: https://www.dpu.ac.th/th/faculty-of-fine-and-applied-arts
- Pridi Banomyong Faculty of Law: https://www.dpu.ac.th/th/pridi-banomyong-faculty-of-law
- Faculty of Public Administration: https://www.dpu.ac.th/th/faculty-of-public-administration
- Faculty of Tourism and Hospitality: https://www.dpu.ac.th/th/faculty-of-tourism-and-hospitality
- Faculty of Arts: https://www.dpu.ac.th/th/faculty-of-arts

When responding to questions, please:
- Be friendly and approachable.
- Provide clear and concise answers based on the information from the provided websites.
- If you cannot find an answer on the provided websites, say so honestly rather than making something up.
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
      model: googleAI.model('gemini-1.5-flash'),
      system: systemPrompt,
      history: history,
      prompt: message,
    });

    return { response: llmResponse.text };
  }
);
