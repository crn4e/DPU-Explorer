'use server';

/**
 * @fileOverview An AI agent for generating personalized campus tour itineraries.
 *
 * - generateCampusTour - A function that generates a campus tour itinerary.
 * - GenerateCampusTourInput - The input type for the generateCampusTour function.
 * - GenerateCampusTourOutput - The return type for the generateCampusTour function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCampusTourInputSchema = z.object({
  interests: z
    .string()
    .describe('The users interests to tailor the tour towards.'),
  currentTime: z
    .string() // Or maybe a number representing time in minutes from midnight?
    .describe('The current time, formatted as HH:MM, to consider opening hours.'),
});
export type GenerateCampusTourInput = z.infer<typeof GenerateCampusTourInputSchema>;

const GenerateCampusTourOutputSchema = z.object({
  tourItinerary: z.string().describe('A description of the tour itinerary.'),
});
export type GenerateCampusTourOutput = z.infer<typeof GenerateCampusTourOutputSchema>;

export async function generateCampusTour(input: GenerateCampusTourInput): Promise<GenerateCampusTourOutput> {
  return generateCampusTourFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCampusTourPrompt',
  input: {schema: GenerateCampusTourInputSchema},
  output: {schema: GenerateCampusTourOutputSchema},
  prompt: `You are a helpful tour guide for DPU that creates personalized tour itineraries based on the user's stated interests and the current time.

  Consider the current time when suggesting locations, and the opening hours of different locations. Only suggest places that are open right now.

  Interests: {{{interests}}}
  Current Time: {{{currentTime}}}

  Create a tour itinerary that is engaging and informative.`,
});

const generateCampusTourFlow = ai.defineFlow(
  {
    name: 'generateCampusTourFlow',
    inputSchema: GenerateCampusTourInputSchema,
    outputSchema: GenerateCampusTourOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
