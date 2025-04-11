'use client';

import { useChat } from '@ai-sdk/react';
import { Weather } from '@/components/weather';
import { Session } from '@/components/session';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { useRef } from 'react';
import { CalendarEvent } from '@/components/event-calendar';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const { user } = useUser();
  const createEvent = useMutation(api.events.create);
  const processedToolCalls = useRef(new Set<string>());

  const handleCreateCalendarEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    if (!user?.id) {
      toast.error('Please sign in to create calendar events');
      return;
    }

    try {
      await createEvent({
        title: event.title,
        description: event.description || "",
        start: new Date(event.start).getTime(),
        end: new Date(event.end).getTime(),
        allDay: event.allDay || false,
        color: event.color || "blue",
        location: event.location || "",
        userId: user.id,
      });

      toast.success('Focus session added to calendar!', {
        description: `${event.title} - ${new Date(event.start).toLocaleTimeString()}`,
      });
    } catch (error) {
      console.error('Error creating calendar event:', error);
      toast.error('Failed to add session to calendar');
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-10"></h1>
      
      <div className="flex-1 overflow-auto mb-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`mb-4 p-3 rounded-lg backdrop-blur-sm ${
              message.role === 'user' 
                ? 'bg-primary/5 ml-auto max-w-[80%]' 
                : 'bg-muted/5 mr-auto max-w-[80%]'
            }`}
          >
            <div className="font-semibold mb-1 text-sm opacity-75">
              {message.role === 'user' ? 'You' : 'Sage'}
            </div>
            <div className="whitespace-pre-wrap">
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case 'text':
                    return <div key={`${message.id}-${i}`}>{part.text}</div>;
                }
              })}
            </div>
            <div className='mt-4'>
              {message.toolInvocations?.map((toolInvocation) => {
                const { toolName, toolCallId, state } = toolInvocation;

                if (state === 'result') {
                  if (toolName === 'displayWeather') {
                    const { result } = toolInvocation;
                    return (
                      <div key={toolCallId}>
                        <Weather {...result} />
                      </div>
                    );
                  }
                  if (toolName === 'startSession') {
                    const { result } = toolInvocation;
                    return (
                      <div key={toolCallId}>
                        <Session 
                          onStartSession={async (tasks, duration) => {
                            console.log('Session started with tasks:', tasks, 'duration:', duration);
                          }}
                          onCreateCalendarEvent={handleCreateCalendarEvent}
                          onSubmitReflection={async (reflection) => {
                            console.log('Session reflection:', reflection);
                          }}
                        />
                      </div>
                    );
                  }
                  if (toolName === 'createCalendarEvent') {
                    const { result } = toolInvocation;
                    // Check if we've already processed this tool call
                    if (!processedToolCalls.current.has(toolCallId) && user?.id) {
                      processedToolCalls.current.add(toolCallId);
                      // Add the event to the calendar
                      createEvent({
                        title: result.title,
                        description: result.description,
                        start: new Date(result.start).getTime(),
                        end: new Date(result.end).getTime(),
                        allDay: result.allDay,
                        color: result.color,
                        location: result.location,
                        userId: user.id,
                      }).then(() => {
                        toast.success('Event added to calendar!');
                      }).catch((error) => {
                        toast.error('Failed to add event to calendar');
                        console.error('Error adding event:', error);
                      });
                    }
                    return (
                      <div key={toolCallId} className="p-4 bg-primary/10 rounded-lg">
                        <h3 className="font-semibold mb-2">📅 Event Created</h3>
                        <p><strong>Title:</strong> {result.title}</p>
                        <p><strong>When:</strong> {new Date(result.start).toLocaleString()}</p>
                        {result.location && <p><strong>Where:</strong> {result.location}</p>}
                      </div>
                    );
                  }
                }
                return (
                  <div key={toolCallId}>
                    {toolName === 'displayWeather' ? (
                      <div>Loading weather...</div>
                    ) : toolName === 'startSession' ? (
                      <div>Initializing session...</div>
                    ) : toolName === 'createCalendarEvent' ? (
                      <div>Creating calendar event...</div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          className="w-full p-3 pr-12 bg-background/50 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          value={input}
          placeholder="Ask me anything..."
          onChange={handleInputChange}
        />
        <button 
          type="submit" 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-primary/90 text-primary-foreground rounded-md hover:bg-primary transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}