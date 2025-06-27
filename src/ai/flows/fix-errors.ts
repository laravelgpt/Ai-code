'use server';

/**
 * @fileOverview AI tool that suggests fixes for errors in a selected code block.
 *
 * - fixErrors - A function that takes code with errors and returns suggested fixes.
 * - FixErrorsInput - The input type for the fixErrors function.
 * - FixErrorsOutput - The return type for the fixErrors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FixErrorsInputSchema = z.object({
  code: z.string().describe('The code block to fix, which may contain errors.'),
  language: z.string().describe('The programming language of the code.'),
});
export type FixErrorsInput = z.infer<typeof FixErrorsInputSchema>;

const FixErrorsOutputSchema = z.object({
  fixedCode: z.string().describe('The corrected code block with errors fixed.'),
  explanation: z
    .string()
    .describe('An explanation of the changes made to fix the errors.'),
});
export type FixErrorsOutput = z.infer<typeof FixErrorsOutputSchema>;

export async function fixErrors(input: FixErrorsInput): Promise<FixErrorsOutput> {
  return fixErrorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fixErrorsPrompt',
  input: {schema: FixErrorsInputSchema},
  output: {schema: FixErrorsOutputSchema},
  prompt: `You are an AI code assistant. You will receive a block of code, and your job is to fix any errors in the code, and explain what you changed and why.

  Language: {{{language}}}
  Code:
  {{{
    code
  }}}
  `,
});

const fixErrorsFlow = ai.defineFlow(
  {
    name: 'fixErrorsFlow',
    inputSchema: FixErrorsInputSchema,
    outputSchema: FixErrorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
