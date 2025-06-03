// This is an auto-generated file from Firebase Studio.
'use server';

/**
 * @fileOverview An AI agent for providing chat support related to motorbike rentals.
 *
 * - aiChatSupport - A function that handles the chat support process.
 * - AiChatSupportInput - The input type for the aiChatSupport function.
 * - AiChatSupportOutput - The return type for the aiChatSupport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiChatSupportInputSchema = z.object({
  query: z.string().describe('The user query or question.'),
});
export type AiChatSupportInput = z.infer<typeof AiChatSupportInputSchema>;

const AiChatSupportOutputSchema = z.object({
  answer: z.string().describe('The answer to the user query.'),
});
export type AiChatSupportOutput = z.infer<typeof AiChatSupportOutputSchema>;

export async function aiChatSupport(input: AiChatSupportInput): Promise<AiChatSupportOutput> {
  return aiChatSupportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatSupportPrompt',
  input: {schema: AiChatSupportInputSchema},
  output: {schema: AiChatSupportOutputSchema},
  prompt: `You are a helpful AI chatbot that answers questions about motorbike rentals.

  Your responses should be accurate, concise, and helpful.

  Use the following information to answer the user's query:
  - Available motorbikes: (List of available motorbikes and their details)
  - Rental policies: (Details about rental duration, pricing, insurance, etc.)
  - Other common topics: (Information about location, hours, contact details etc.)
  
  Query: {{{query}}}`,
});

const aiChatSupportFlow = ai.defineFlow(
  {
    name: 'aiChatSupportFlow',
    inputSchema: AiChatSupportInputSchema,
    outputSchema: AiChatSupportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
