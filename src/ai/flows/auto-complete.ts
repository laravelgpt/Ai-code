'use server';

/**
 * @fileOverview AI-powered code completion flow.
 *
 * - autoComplete - A function that handles the code completion process.
 * - AutoCompleteInput - The input type for the autoComplete function.
 * - AutoCompleteOutput - The return type for the autoComplete function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoCompleteInputSchema = z.object({
  codePrefix: z.string().describe('The code prefix to complete.'),
  language: z.string().describe('The programming language.'),
});
export type AutoCompleteInput = z.infer<typeof AutoCompleteInputSchema>;

const AutoCompleteOutputSchema = z.object({
  completion: z.string().describe('The code completion suggestion.'),
});
export type AutoCompleteOutput = z.infer<typeof AutoCompleteOutputSchema>;

export async function autoComplete(input: AutoCompleteInput): Promise<AutoCompleteOutput> {
  return autoCompleteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoCompletePrompt',
  input: {schema: AutoCompleteInputSchema},
  output: {schema: AutoCompleteOutputSchema},
  prompt: `You are an AI code completion assistant.  Given the following code prefix and programming language, suggest a code completion.

Language: {{{language}}}
Code Prefix:
{{{codePrefix}}}`,
});

const autoCompleteFlow = ai.defineFlow(
  {
    name: 'autoCompleteFlow',
    inputSchema: AutoCompleteInputSchema,
    outputSchema: AutoCompleteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
