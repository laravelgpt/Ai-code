'use server';

/**
 * @fileOverview A conversational AI agent for the code workbench.
 *
 * - chat - A function that handles the conversational chat process.
 * - ChatMessage - The type for a single chat message.
 */

import {ai} from '@/ai/genkit';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export async function chat(history: ChatMessage[], newMessage: string): Promise<string> {
  const genkitHistory = history.map((msg) => ({
    role: msg.role,
    content: [{text: msg.content}],
  }));

  const {output} = await ai.generate({
    prompt: newMessage,
    history: genkitHistory,
  });

  return output!.text!;
}
