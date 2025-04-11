"use client"

import { useUser } from "@clerk/nextjs"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useState, useMemo } from "react"
import { EventCalendar, type CalendarEvent } from "@/components/event-calendar"
import ThemeToggle from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import { Session } from "@/components/session"

// Helper function to convert Convex event to CalendarEvent
const convertToCalendarEvent = (event: any): CalendarEvent => ({
  id: event._id.toString(),
  title: event.title,
  description: event.description,
  start: new Date(event.start),
  end: new Date(event.end),
  allDay: event.allDay,
  color: event.color,
  location: event.location,
})

export default function Home() {
  const { user, isLoaded } = useUser()
  const userId = user?.id
  const [showSession, setShowSession] = useState(false)

  // Stabilize query parameters to prevent infinite loops
  const queryParams = useMemo(() => {
    if (!userId) return "skip";
    
    return {
      userId,
      startTime: new Date().getTime() - 30 * 24 * 60 * 60 * 1000, // Last 30 days
      endTime: new Date().getTime() + 60 * 24 * 60 * 60 * 1000, // Next 60 days
    };
  }, [userId]);

  // Fetch events from Convex when user is authenticated
  const events = useQuery(api.events.get, queryParams);

  // Setup mutations
  const createEvent = useMutation(api.events.create)
  const updateEvent = useMutation(api.events.update)
  const deleteEvent = useMutation(api.events.remove)

  const handleEventAdd = async (event: Omit<CalendarEvent, 'id'>) => {
    if (!userId) return

    // Ensure color is never undefined
    const color = event.color || "blue"

    await createEvent({
      title: event.title,
      description: event.description || "",
      start: new Date(event.start).getTime(),
      end: new Date(event.end).getTime(),
      allDay: event.allDay,
      color, // Use default if undefined
      location: event.location,
      userId,
    })
  }

  const handleEventUpdate = async (event: CalendarEvent) => {
    if (!userId) return

    // Ensure color is never undefined
    const color = event.color || "blue"

    await updateEvent({
      id: event.id as Id<"events">,
      title: event.title,
      description: event.description || "",
      start: new Date(event.start).getTime(),
      end: new Date(event.end).getTime(),
      allDay: event.allDay,
      color, // Use default if undefined
      location: event.location,
      userId,
    })
  }

  const handleEventDelete = async (eventId: string) => {
    if (!userId) return
    await deleteEvent({
      id: eventId as Id<"events">,
      userId,
    })
  }

  // Convert Convex events to CalendarEvents
  const calendarEvents = useMemo(() => {
    return events?.map(convertToCalendarEvent) ?? [];
  }, [events]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!userId) {
    return <div>Please sign in to view your calendar</div>
  }

  return (
    <div className="flex h-screen">
      <aside className="hidden lg:block w-64 border-r bg-background">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Focus Mode
            </h2>
            <div className="space-y-1">
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => setShowSession(true)}
              >
                <Clock className="mr-2 h-4 w-4" />
                Start Focus Session
              </Button>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col p-1 sm:p-4 md:p-8 overflow-auto">
        {showSession ? (
          <div className="mb-8">
            <Session
              onStartSession={async () => {
                // Handle session start
              }}
              onCreateCalendarEvent={handleEventAdd}
            />
          </div>
        ) : null}
        <EventCalendar
          events={calendarEvents}
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
        />
        <div className="mt-4">
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
