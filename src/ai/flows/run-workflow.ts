'use server';

/**
 * @fileOverview Runs a predefined workflow on a block of code.
 *
 * - runWorkflow - A function that takes code and a workflow description and returns the modified code.
 * - RunWorkflowInput - The input type for the runWorkflow function.
 * - RunWorkflowOutput - The return type for the runWorkflow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RunWorkflowInputSchema = z.object({
  code: z.string().describe('The code to modify.'),
  language: z.string().describe('The programming language of the code.'),
  workflow: z.string().describe('The workflow task to perform.'),
});
export type RunWorkflowInput = z.infer<typeof RunWorkflowInputSchema>;

const RunWorkflowOutputSchema = z.object({
  modifiedCode: z.string().describe('The modified code after running the workflow.'),
});
export type RunWorkflowOutput = z.infer<typeof RunWorkflowOutputSchema>;

export async function runWorkflow(input: RunWorkflowInput): Promise<RunWorkflowOutput> {
  return runWorkflowFlow(input);
}

const prompt = ai.definePrompt({
  name: 'runWorkflowPrompt',
  input: {schema: RunWorkflowInputSchema},
  output: {schema: RunWorkflowOutputSchema},
  prompt: `You are an expert software developer that only outputs code. You will be given a block of code and a task to perform on it. Your task is to apply the requested changes and output ONLY the complete, modified code block. Do not add any explanations, comments, or markdown formatting around the code.

Task: {{{workflow}}}

Language: {{{language}}}

Code:
\`\`\`{{{language}}}
{{{code}}}
\`\`\`
`,
});

const runWorkflowFlow = ai.defineFlow(
  {
    name: 'runWorkflowFlow',
    inputSchema: RunWorkflowInputSchema,
    outputSchema: RunWorkflowOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
