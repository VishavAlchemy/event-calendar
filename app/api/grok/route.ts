import { streamText } from 'ai';
import { tools } from '@/app/ai-tools/tools';
import { xai } from '@ai-sdk/xai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: xai('grok-3-beta'),
    system: 'You are a friendly assistant!',
    messages,
    maxSteps: 5,
    tools,
  });

  return result.toDataStreamResponse();
}