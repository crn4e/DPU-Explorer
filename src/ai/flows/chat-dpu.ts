'use server';

/**
 * @fileOverview A chatbot for answering questions about DPU.
 *
 * - chatDpu - A function that handles the chat conversation.
 * - ChatDpuInput - The input type for the chatDpu function.
 * - ChatDpuOutput - The return type for the chatDpu function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatDpuInputSchema = z.object({
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.array(z.object({ text: z.string() })),
      })
    )
    .describe('The chat history.'),
  message: z.string().describe('The latest user message.'),
});
export type ChatDpuInput = z.infer<typeof ChatDpuInputSchema>;

const ChatDpuOutputSchema = z.object({
  response: z.string().describe('The AI response.'),
});
export type ChatDpuOutput = z.infer<typeof ChatDpuOutputSchema>;

const systemPrompt = `You are a helpful and knowledgeable assistant specializing in all matters related to Dhurakij Pundit University (DPU). Your primary role is to provide accurate, comprehensive, and useful information to students, parents, staff, and anyone interested in DPU. All your information must be sourced from the official DPU website (https://www.dpu.ac.th) and its subdomains. Do not invent information. If you cannot find an answer, politely state that the information is unavailable and suggest contacting the relevant department. Your tone should be polite, friendly, and helpful. Format your answers for readability using headings, lists, or paragraphs as appropriate.`;


const chatDpuFlow = ai.defineFlow(
  {
    name: 'chatDpuFlow',
    inputSchema: ChatDpuInputSchema,
    outputSchema: ChatDpuOutputSchema,
  },
  async ({ history, message }) => {
    
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      system: systemPrompt,
      history: history,
      prompt: message,
    });

    const response = llmResponse.text;

    return { response };
  }
);


export async function chatDpu(input: ChatDpuInput): Promise<ChatDpuOutput> {
  return await chatDpuFlow(input);
}
