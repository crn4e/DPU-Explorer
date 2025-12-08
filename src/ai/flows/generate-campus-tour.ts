'use server';

/**
 * @fileOverview An AI agent for generating personalized campus tour itineraries.
 *
 * - generateCampusTour - A function that generates a campus tour itinerary.
 * - GenerateCampusTourInput - The input type for the generateCampusTour function.
 * - GenerateCampusTourOutput - The return type for the generateCampusTour function.
 */
import {genkit, z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {locations} from '@/lib/data';

const ai = genkit({
  plugins: [googleAI()],
});

const GenerateCampusTourInputSchema = z.object({
  interests: z
    .string()
    .describe('The users interests to tailor the tour towards.'),
  currentTime: z
    .string() // Or maybe a number representing time in minutes from midnight?
    .describe(
      'The current time, formatted as HH:MM, to consider opening hours.'
    ),
});
export type GenerateCampusTourInput = z.infer<
  typeof GenerateCampusTourInputSchema
>;

const GenerateCampusTourOutputSchema = z.object({
  tourItinerary: z.string().describe('A description of the tour itinerary.'),
});
export type GenerateCampusTourOutput = z.infer<
  typeof GenerateCampusTourOutputSchema
>;

export async function generateCampusTour(
  input: GenerateCampusTourInput
): Promise<GenerateCampusTourOutput> {
  return generateCampusTourFlow(input);
}

const generateCampusTourFlow = ai.defineFlow(
  {
    name: 'generateCampusTourFlow',
    inputSchema: GenerateCampusTourInputSchema,
    outputSchema: GenerateCampusTourOutputSchema,
  },
  async (input) => {
    const {output} = await ai.generate({
      model: googleAI.model('gemini-1.5-flash-preview'),
      prompt: `You are a helpful tour guide for Dhurakij Pundit University (DPU) in Thailand. You create personalized tour itineraries based on the user's stated interests and the current time. Your response must be in Thai.

  You must only use the locations provided in the available locations list. Do not invent locations.

  Available DPU Locations:
  ${locations.map((l) => `- ${l.name} (${l.category}): ${l.description}`).join('\n')}

  Consider the current time when suggesting locations, and the opening hours of different locations. Only suggest places that are open right now. If no relevant places are open, inform the user politely in Thai.

  If the user asks a question instead of stating an interest, politely redirect them to the "AI Chat" feature for questions and explain that your role is to create tour itineraries.

  User's Interests: ${input.interests}
  Current Time: ${input.currentTime}

  Create a tour itinerary in Thai that is engaging and informative. Structure the output as a friendly message with a clear itinerary, possibly using bullet points.`,
      output: {
        schema: GenerateCampusTourOutputSchema,
      },
    });
    return output!;
  }
);
