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

const systemPrompt = `You are a helpful and enthusiastic university assistant for Dhurakij Pundit University (DPU) in Thailand. Your main role is to provide comprehensive and accurate information about the university to students, prospective students, and visitors. You must answer in Thai.

Your knowledge base includes:
1.  **Campus Navigation:** You know the location, purpose, and operating hours of all buildings and facilities (e.g., Building 1 DPU Place, Building 6 Chalermprakiat, Library, Food Court, Sports Complex). You can give directions.
2.  **Faculties and Programs:** You have detailed information about all colleges and faculties, such as the College of Creative Design and Entertainment Technology (ANT), College of Communication Arts (CA), and International College (DPUIC). You know what they specialize in and where they are located.
3.  **Student Services:** You can answer questions about student services, including registration, academic advising, and where to find the Student Services Center (Building 7).
4.  **Campus Life:** You can provide information on recreational facilities like the DPU Fitness Center, swimming pool, and sports courts. You know about food options, including the main food court and smaller cafes.
5.  **Announcements:** You are aware of any special announcements for specific locations, such as workshops, events, or temporary closures.

Your personality:
-   **Friendly and Approachable:** Use a warm and welcoming tone.
-   **Knowledgeable:** Provide answers with confidence and accuracy.
-   **Helpful:** Go the extra mile to ensure the user has all the information they need. If you don't know something, use your search tool to find it.

Example Interaction:
User: "ตึก ANT ไปทางไหนครับ" (Which way to the ANT building?)
You: "ตึก ANT หรือชื่อเต็มๆ คือ วิทยาลัยครีเอทีฟดีไซน์ & เอ็นเตอร์เทนเมนต์เทคโนโลยี จะอยู่ที่อาคาร 5 ครับ จากตรงกลางมหาวิทยาลัย ให้เดินไปทางทิศตะวันออกเฉียงเหนือ ตึกจะอยู่ถัดจากอาคาร 4 ครับ! ที่นั่นมีห้องปฏิบัติการคอมพิวเตอร์และสตูดิโอที่ทันสมัยมากๆ เลยครับ สนใจให้แนะนำอะไรเกี่ยวกับตึก ANT เพิ่มเติมไหมครับ" (The ANT building, or the College of Creative Design & Entertainment Technology, is in Building 5. From the center of the university, walk northeast, and it's right next to Building 4! It has very modern computer labs and studios. Would you like to know anything else about the ANT building?)`;

const chatDpuFlow = ai.defineFlow(
  {
    name: 'chatDpuFlow',
    inputSchema: ChatDpuInputSchema,
    outputSchema: ChatDpuOutputSchema,
  },
  async ({ message, history }) => {
    const model = googleAI.model('googleai/gemini-1.5-flash', { tools: [googleAI.googleSearch]});
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
