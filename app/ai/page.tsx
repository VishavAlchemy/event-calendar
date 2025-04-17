'use client';

import { useChat } from '@ai-sdk/react';
import { Weather } from '@/components/weather';
import { Session } from '@/components/session';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { useRef, useState, useEffect } from 'react';
import { CalendarEvent } from '@/components/event-calendar';
import { EventHistory } from '@/components/event-history';
import { eb } from '@/lib/fonts'; 

// Add color mapping function from sidebar
const getColorClasses = (color: string) => {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    sky: {
      bg: "bg-sky-500/10",
      text: "text-sky-700 dark:text-sky-300",
      border: "border-sky-500/20",
    },
    violet: {
      bg: "bg-violet-500/10",
      text: "text-violet-700 dark:text-violet-300",
      border: "border-violet-500/20",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-500/20",
    },
    rose: {
      bg: "bg-rose-500/10",
      text: "text-rose-700 dark:text-rose-300",
      border: "border-rose-500/20",
    },
    orange: {
      bg: "bg-orange-500/10",
      text: "text-orange-700 dark:text-orange-300",
      border: "border-orange-500/20",
    },
    amber: {
      bg: "bg-amber-500/10",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-500/20",
    },
  }
  
  return colorMap[color] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" }
}

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const { user } = useUser();
  const createEvent = useMutation(api.events.create);
  const processedToolCalls = useRef(new Set<string>());
  const formRef = useRef<HTMLFormElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showDirectSession, setShowDirectSession] = useState(false);
  const hasStartedConversation = messages.length > 0;

  // Auto-scroll to the latest message whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showDirectSession]);

  // Wrap the handleSubmit to also close the direct session
  const wrappedHandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setShowDirectSession(false);
    handleSubmit(e);
  };

  // Handle quick action buttons
  const handleStartFocusSession = () => {
    setShowDirectSession(true);
  };

  const handleLastSevenDays = () => {
    handleInputChange({ target: { value: "What happened in the last 7 days" } } as React.ChangeEvent<HTMLInputElement>);
    setTimeout(() => formRef.current?.requestSubmit(), 0);
  };

  const handleAddEvent = () => {
    handleInputChange({ target: { value: "Add event" } } as React.ChangeEvent<HTMLInputElement>);
  };

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
      
      <div ref={messagesContainerRef} className="flex-1 overflow-auto mb-4">
        {messages.length === 0 && !showDirectSession && (
          <div className="flex items-center justify-center h-full">
            <h2 className={`${eb.className} text-3xl  text-muted-foreground/70`}>Execute Plan Focus</h2>
          </div>
        )}
        {showDirectSession && (
          <div className="mb-4 p-3 rounded-lg backdrop-blur-sm bg-muted/5 mr-auto max-w-[80%]">
            <div className="font-semibold mb-1 text-sm opacity-75">
              Sage
            </div>
            <div className="whitespace-pre-wrap">
              Starting a focus session for you...
              <button 
                onClick={() => setShowDirectSession(false)}
                className="ml-2 text-xs text-muted-foreground hover:text-primary"
              >
                ×
              </button>
            </div>
            <div className="mt-4">
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
          </div>
        )}
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
                  if (toolName === 'fetchEventHistory') {
                    const { result } = toolInvocation;
                    return (
                      <div key={toolCallId}>
                        <EventHistory {...result} />
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
                    ) : toolName === 'fetchEventHistory' ? (
                      <div>Fetching your calendar history...</div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Buttons - Only show if no conversation started */}
      {!hasStartedConversation && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={handleStartFocusSession}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${getColorClasses('emerald').bg} ${getColorClasses('emerald').text} ${getColorClasses('emerald').border} border`}
          >
            Start Focus Session
          </button>
          <button
            onClick={handleLastSevenDays}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${getColorClasses('violet').bg} ${getColorClasses('violet').text} ${getColorClasses('violet').border} border`}
          >
            What happened in the last 7 days
          </button>
          <button
            onClick={handleAddEvent}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${getColorClasses('sky').bg} ${getColorClasses('sky').text} ${getColorClasses('sky').border} border`}
          >
            Add event
          </button>
        </div>
      )}

      <form ref={formRef} onSubmit={wrappedHandleSubmit} className="relative">
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