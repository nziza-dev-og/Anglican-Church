// src/ai/flows/personalized-content-recommendations.ts
'use server';

/**
 * @fileOverview Provides personalized content recommendations based on user role and interests.
 *
 * - personalizedContentRecommendations - A function that returns personalized content recommendations.
 * - PersonalizedContentRecommendationsInput - The input type for the personalizedContentRecommendations function.
 * - PersonalizedContentRecommendationsOutput - The return type for the personalizedContentRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedContentRecommendationsInputSchema = z.object({
  userRole: z
    .string()
    .describe("The user's role within the church (e.g., 'Regular Member', 'Choir Admin')."),
  userInterests: z
    .string()
    .describe('A comma-separated list of the user interests (e.g., Music, Bible Study, Events).'),
});
export type PersonalizedContentRecommendationsInput = z.infer<
  typeof PersonalizedContentRecommendationsInputSchema
>;

const PersonalizedContentRecommendationsOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      title: z.string().describe('The title of the recommended content.'),
      description: z.string().describe('A brief description of the content.'),
      link: z.string().describe('A link to the content.'),
    })
  ).
describe('A list of personalized content recommendations.'),
});
export type PersonalizedContentRecommendationsOutput = z.infer<
  typeof PersonalizedContentRecommendationsOutputSchema
>;

export async function personalizedContentRecommendations(
  input: PersonalizedContentRecommendationsInput
): Promise<PersonalizedContentRecommendationsOutput> {
  return personalizedContentRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedContentRecommendationsPrompt',
  input: {schema: PersonalizedContentRecommendationsInputSchema},
  output: {schema: PersonalizedContentRecommendationsOutputSchema},
  prompt: `You are a content recommendation system for the Anglican Church in Rubavu.

  Based on the user's role and interests, recommend relevant content such as upcoming events, recent videos, or books.

  User Role: {{{userRole}}}
  User Interests: {{{userInterests}}}

  Format your response as a JSON object with a 'recommendations' field. Each recommendation should include a 'title', 'description', and 'link'.
  For the links, make them realistic, but they do not need to actually work.
  Do not include any introductory or concluding remarks. Only provide the valid JSON output.
  Ensure the JSON is valid and parseable.

  Example:
  {
    "recommendations": [
      {
        "title": "Upcoming Choir Practice",
        "description": "Practice for the Christmas service.",
        "link": "/events/choir-practice"
      },
      {
        "title": "Sermon Video: The Power of Forgiveness",
        "description": "A powerful sermon on forgiveness.",
        "link": "/videos/forgiveness"
      }
    ]
  }`,
});

const personalizedContentRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedContentRecommendationsFlow',
    inputSchema: PersonalizedContentRecommendationsInputSchema,
    outputSchema: PersonalizedContentRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
