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

export const calendarTool = createTool({
  description: 'Create a new calendar event. Use relative dates like "today", "tomorrow", "next week". Times should be in EST.',
  parameters: z.object({
    title: z.string().describe('The title of the event'),
    description: z.string().optional().describe('Description of the event'),
    startDate: z.string().describe('Date of the event (e.g., "today", "tomorrow", "2024-03-20")'),
    startTime: z.string().describe('Start time in EST (e.g., "10:00 AM", "14:30")'),
    duration: z.number().default(60).describe('Duration in minutes'),
    location: z.string().optional().describe('Location of the event'),
    allDay: z.boolean().optional().default(false).describe('Whether this is an all-day event'),
    color: z.string().optional().default('blue').describe('Color of the event'),
  }),
  execute: async function ({ title, description, startDate, startTime, duration, location, allDay, color }) {
    // Get current date in EST
    const now = new Date();
    const estOffset = -4; // EST offset from UTC
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const TODAY_REFERENCE = new Date(utc + (3600000 * estOffset));
    
    // Reset time to start of day
    TODAY_REFERENCE.setHours(0, 0, 0, 0);
    
    let baseDate;
    
    switch (startDate.toLowerCase()) {
      case 'today':
        baseDate = new Date(TODAY_REFERENCE);
        break;
      case 'tomorrow':
        baseDate = new Date(TODAY_REFERENCE);
        baseDate.setDate(TODAY_REFERENCE.getDate() + 1);
        break;
      case 'next week':
        baseDate = new Date(TODAY_REFERENCE);
        baseDate.setDate(TODAY_REFERENCE.getDate() + 7);
        break;
      default:
        // Try to parse as YYYY-MM-DD
        baseDate = new Date(startDate);
        if (isNaN(baseDate.getTime())) {
          throw new Error('Invalid date format');
        }
    }

    // Parse the time string
    let hours = 0;
    let minutes = 0;

    // Handle different time formats (e.g., "2:30 PM", "14:30", "2PM")
    const timeStr = startTime.toLowerCase().trim();
    const isPM = timeStr.includes('pm');
    const isAM = timeStr.includes('am');

    // Remove AM/PM and split time
    const timeParts = timeStr
      .replace(/[ap]m/i, '')
      .trim()
      .split(':');

    hours = parseInt(timeParts[0], 10);
    minutes = timeParts[1] ? parseInt(timeParts[1], 10) : 0;

    // Convert to 24-hour format if PM
    if (isPM && hours !== 12) {
      hours += 12;
    } else if (isAM && hours === 12) {
      hours = 0;
    }

    // Set the time components on our base date
    baseDate.setHours(hours, minutes, 0, 0);

    // Create start and end dates
    const start = baseDate;
    const end = new Date(start.getTime() + duration * 60 * 1000);

    // Return the event details with the original EST time
    return {
      title,
      description: description || "",
      start: start.toISOString(),
      end: end.toISOString(),
      location: location || "",
      allDay: allDay || false,
      color: color || "blue",
      // Add these fields to help with debugging and verification
      originalTime: {
        hours,
        minutes,
        isPM,
        timezone: "EST"
      }
    };
  },
});

export const eventHistoryTool = createTool({
  description: 'Fetch calendar events for a specific time period',
  parameters: z.object({
    timePeriod: z.string().describe('Time period to fetch events for (e.g., "last week", "yesterday", "past month")'),
    startDate: z.string().optional().describe('Start date for custom time range (YYYY-MM-DD format)'),
    endDate: z.string().optional().describe('End date for custom time range (YYYY-MM-DD format)'),
  }),
  execute: async function ({ timePeriod, startDate, endDate }) {
    // This function will be called by the AI, but actual data fetching happens in the component
    // Return a placeholder that the component will use to know it needs to fetch data
    return {
      timePeriod,
      startDate,
      endDate,
      requestId: `history_request_${Date.now()}`
    };
  },
});

export const tools = {
  displayWeather: weatherTool,
  startSession: sessionTool,
  createCalendarEvent: calendarTool,
  fetchEventHistory: eventHistoryTool,
};