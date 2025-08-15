'use server';

/**
 * @fileOverview A chatbot for answering questions about DPU.
 *
 * - chatDpu - A function that handles the chat conversation.
 * - ChatDpuInput - The input type for the chatDpu function.
 * - ChatDpuOutput - The return type for the chatDpu function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { locations } from '@/lib/data';

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

const locationsContext = locations.map(loc => `
  - ${loc.name} (${loc.category}): ${loc.description} 
    Hours: ${Object.entries(loc.hours).map(([day, hours]) => `${day}: ${hours ? `${hours.open}-${hours.close}` : 'Closed'}`).join(', ')}
    ${loc.announcement ? `Announcement: ${loc.announcement}`: ''}
`).join('\n');

const systemPrompt = `You are a friendly and helpful AI assistant for Dhurakij Pundit University (DPU), named 'DPU AI Friend'. Your role is to answer questions from students and visitors about the campus.

You have access to the following information about campus locations:
${locationsContext}

Use this information to answer questions about locations, opening hours, and what they offer. Be conversational and welcoming. If you don't know the answer, say that you don't have that information but you can help with other questions about DPU.`;

const prompt = ai.definePrompt({
  name: 'chatDpuPrompt',
  input: {schema: ChatDpuInputSchema},
  output: {schema: ChatDpuOutputSchema},
  system: systemPrompt,
  prompt: `{{#each history}}
    {{#if (eq role 'user')}}
        User: {{{content}}}
    {{else}}
        AI: {{{content}}}
    {{/if}}
  {{/each}}

  User: {{{message}}}
  AI:`,
  // Remap the output to our desired schema.
  to: (output) => ({ response: output as string }),
});


const chatDpuFlow = ai.defineFlow(
  {
    name: 'chatDpuFlow',
    inputSchema: ChatDpuInputSchema,
    outputSchema: ChatDpuOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
