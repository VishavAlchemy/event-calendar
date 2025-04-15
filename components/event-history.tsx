'use client';

import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { format, parseISO } from 'date-fns';

type EventHistoryProps = {
  timePeriod: string;
  startDate?: string;
  endDate?: string;
  requestId: string;
};

export function EventHistory({ timePeriod, startDate, endDate, requestId }: EventHistoryProps) {
  const { user } = useUser();
  const [timeRange, setTimeRange] = useState<{ start: number; end: number }>({ 
    start: 0, 
    end: 0 
  });
  
  // Parse the time period to get actual date ranges
  useEffect(() => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    let start = new Date();
    let end = new Date();
    
    // Handle custom date range if provided
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of the day
    } else {
      // Handle predefined time periods
      switch (timePeriod.toLowerCase()) {
        case 'yesterday':
          start = new Date(today);
          start.setDate(today.getDate() - 1);
          end = new Date(today);
          end.setMilliseconds(-1); // Just before midnight
          break;
        case 'last week':
        case 'past week':
          start = new Date(today);
          start.setDate(today.getDate() - 7);
          end = new Date(now);
          break;
        case 'last month':
        case 'past month':
          start = new Date(today);
          start.setMonth(today.getMonth() - 1);
          end = new Date(now);
          break;
        case 'last 3 days':
        case 'past 3 days':
          start = new Date(today);
          start.setDate(today.getDate() - 3);
          end = new Date(now);
          break;
        case 'today':
          start = new Date(today);
          end = new Date(now);
          break;
        default:
          // Default to last 7 days
          start = new Date(today);
          start.setDate(today.getDate() - 7);
          end = new Date(now);
      }
    }
    
    setTimeRange({
      start: start.getTime(),
      end: end.getTime()
    });
  }, [timePeriod, startDate, endDate]);
  
  // Fetch events for the specified time range
  const events = useQuery(
    api.events.get, 
    user?.id && timeRange.start !== 0 ? {
      userId: user.id,
      startTime: timeRange.start,
      endTime: timeRange.end
    } : "skip"
  );
  
  // Group events by date
  const eventsByDate = events?.reduce((acc, event) => {
    const date = new Date(event.start).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, any[]>) || {};
  
  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(eventsByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  if (!user?.id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event History</CardTitle>
          <CardDescription>Please sign in to view your event history</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  if (timeRange.start === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event History</CardTitle>
          <CardDescription>Processing your request...</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  if (!events || events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event History</CardTitle>
          <CardDescription>No events found for the specified time period</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {`Looking for events between ${new Date(timeRange.start).toLocaleDateString()} and ${new Date(timeRange.end).toLocaleDateString()}`}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event History</CardTitle>
        <CardDescription>
          {`${events.length} events from ${new Date(timeRange.start).toLocaleDateString()} to ${new Date(timeRange.end).toLocaleDateString()}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedDates.map(date => (
            <div key={date} className="border-b pb-3 last:border-b-0">
              <h3 className="font-medium text-sm">{format(new Date(date), 'EEEE, MMMM d, yyyy')}</h3>
              <ul className="mt-2 space-y-2">
                {eventsByDate[date].map(event => (
                  <li key={event._id} className="flex justify-between items-start text-sm">
                    <div>
                      <span className="font-medium">{event.title}</span>
                      {event.location && <span className="text-muted-foreground ml-2">({event.location})</span>}
                    </div>
                    <div className="text-muted-foreground">
                      {event.allDay 
                        ? 'All day' 
                        : `${format(new Date(event.start), 'h:mm a')} - ${format(new Date(event.end), 'h:mm a')}`}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 