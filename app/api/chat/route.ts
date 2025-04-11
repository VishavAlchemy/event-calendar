import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { tools } from '@/app/ai-tools/tools';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are a friendly assistant!',
    messages,
    maxSteps: 5,
    tools,
  });

  return result.toDataStreamResponse();
}