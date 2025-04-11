import { tool as createTool } from 'ai';
import { z } from 'zod';

export const weatherTool = createTool({
  description: 'Display the weather for a location',
  parameters: z.object({
    location: z.string().describe('The location to get the weather for'),
  }),
  execute: async function ({ location }) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { weather: 'Sunny', temperature: 75, location };
  },
});

export const sessionTool = createTool({
  description: 'Start a new focus session with specified duration and tasks',
  parameters: z.object({
    duration: z.number().min(1).max(180).describe('Session duration in minutes'),
    tasks: z.array(z.string()).describe('List of tasks for the session'),
    sessionType: z.enum(['focus', 'break', 'meeting']).default('focus').describe('Type of session'),
  }),
  execute: async function ({ duration, tasks, sessionType }) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate initialization
    
    const formattedDuration = `${Math.floor(duration)}:${(duration % 1 * 60).toString().padStart(2, '0')}`;
    
    return {
      sessionId: `session_${Date.now()}`,
      startTime: new Date().toISOString(),
      duration: formattedDuration,
      tasks,
      sessionType,
      status: 'ready',
    };
  },
});

export const tools = {
  displayWeather: weatherTool,
  startSession: sessionTool,
};