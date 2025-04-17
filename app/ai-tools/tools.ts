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
    // Get ACTUAL current date - don't try to manually calculate timezone offsets
    const TODAY_REFERENCE = new Date();
    
    console.log("Current date:", TODAY_REFERENCE.toISOString());
    
    // Create a copy for date calculations
    const referenceDateCopy = new Date(TODAY_REFERENCE);
    // Reset time to start of day
    referenceDateCopy.setHours(0, 0, 0, 0);
    
    let baseDate;
    
    // Handle day names (Monday, Tuesday, etc.)
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const lowerStartDate = startDate.toLowerCase();
    
    if (daysOfWeek.includes(lowerStartDate)) {
      // Find the target day index
      const targetDayIndex = daysOfWeek.indexOf(lowerStartDate);
      
      // Get current day index
      const currentDayIndex = TODAY_REFERENCE.getDay();
      
      // Calculate days to add (ensuring we get the NEXT occurrence of the day)
      let daysToAdd = targetDayIndex - currentDayIndex;
      if (daysToAdd <= 0) {
        daysToAdd += 7; // If it's today or earlier in the week, go to next week
      }
      
      baseDate = new Date(referenceDateCopy);
      baseDate.setDate(referenceDateCopy.getDate() + daysToAdd);
      console.log(`Calculated next ${lowerStartDate} as:`, baseDate.toISOString());
    } else if (lowerStartDate.includes('next') && daysOfWeek.some(day => lowerStartDate.includes(day))) {
      // Handle "next monday", "next tuesday", etc.
      const dayName = daysOfWeek.find(day => lowerStartDate.includes(day));
      if (dayName) {
        const targetDayIndex = daysOfWeek.indexOf(dayName);
        const currentDayIndex = TODAY_REFERENCE.getDay();
        
        // Calculate days to add (for "next X", we always go to next week)
        let daysToAdd = targetDayIndex - currentDayIndex;
        if (daysToAdd <= 0) {
          daysToAdd += 7;
        } else {
          daysToAdd += 7; // For "next X", add an additional week
        }
        
        baseDate = new Date(referenceDateCopy);
        baseDate.setDate(referenceDateCopy.getDate() + daysToAdd);
        console.log(`Calculated next ${dayName} as:`, baseDate.toISOString());
      } else {
        // Fallback if we couldn't extract a valid day name
        baseDate = new Date(referenceDateCopy);
        console.log(`Couldn't parse day in "${lowerStartDate}", using today:`, baseDate.toISOString());
      }
    } else {
      switch (lowerStartDate) {
        case 'today':
          baseDate = new Date(referenceDateCopy);
          break;
        case 'tomorrow':
          baseDate = new Date(referenceDateCopy);
          baseDate.setDate(referenceDateCopy.getDate() + 1);
          break;
        case 'next week':
          baseDate = new Date(referenceDateCopy);
          baseDate.setDate(referenceDateCopy.getDate() + 7);
          break;
        default:
          try {
            // Try to parse as YYYY-MM-DD or MM/DD/YYYY or other formats
            baseDate = new Date(startDate);
            if (isNaN(baseDate.getTime())) {
              throw new Error(`Invalid date format: ${startDate}`);
            }
            // Ensure we're not using a date from the past year
            const currentYear = TODAY_REFERENCE.getFullYear();
            if (baseDate.getFullYear() < currentYear) {
              baseDate.setFullYear(currentYear);
            }
          } catch (e) {
            console.error("Date parsing error:", e);
            throw new Error(`Cannot parse date: ${startDate}`);
          }
      }
      console.log(`Calculated date for ${lowerStartDate} as:`, baseDate.toISOString());
    }

    // Parse the time string
    let hours = 0;
    let minutes = 0;

    try {
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

      console.log(`Parsed time: ${hours}:${minutes} (${isPM ? 'PM' : 'AM'})`);
    } catch (e) {
      console.error("Time parsing error:", e);
      throw new Error(`Cannot parse time: ${startTime}`);
    }

    // Set the time components on our base date
    baseDate.setHours(hours, minutes, 0, 0);
    console.log("Final date with time:", baseDate.toISOString());

    // Create start and end dates
    const start = baseDate;
    const end = new Date(start.getTime() + duration * 60 * 1000);

    console.log("Event start:", start.toISOString());
    console.log("Event end:", end.toISOString());

    // Return the event details with the original time
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
        isPM: hours >= 12,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currentSystemTime: new Date().toISOString()
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