"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { CalendarEvent, EventColor } from "@/components/event-calendar";

type Emotion = "Fulfilled" | "Flow" | "Calm" | "Courage" | "Stress" | "Afraid";

type SessionState = {
  duration: string;
  tasks: string[];
  status: 'setup' | 'idle' | 'ready' | 'running' | 'paused' | 'completed';
  startTime?: Date;
};

interface FocusContextType {
  isModalOpen: boolean;
  sessionState: SessionState | null;
  selectedEmotion: Emotion | null;
  reflectionText: string;
  timeLeft: string;
  openFocusModal: () => void;
  closeFocusModal: () => void;
  startSession: (tasks: string[], duration: string) => void;
  updateSessionStatus: (status: 'running' | 'paused' | 'completed') => void;
  cancelSession: () => void;
  setSelectedEmotion: (emotion: Emotion | null) => void;
  setReflectionText: (text: string) => void;
  createCalendarEvent: () => Promise<void>;
  updateTimeLeft: (time: string) => void;
}

const defaultContext: FocusContextType = {
  isModalOpen: false,
  sessionState: null,
  selectedEmotion: null,
  reflectionText: "",
  timeLeft: "",
  openFocusModal: () => {},
  closeFocusModal: () => {},
  startSession: () => {},
  updateSessionStatus: () => {},
  cancelSession: () => {},
  setSelectedEmotion: () => {},
  setReflectionText: () => {},
  createCalendarEvent: async () => {},
  updateTimeLeft: () => {},
};

export const FocusContext = createContext<FocusContextType>(defaultContext);

export const useFocus = () => useContext(FocusContext);

interface FocusProviderProps {
  children: ReactNode;
  onCreateCalendarEvent?: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
}

export function FocusProvider({ 
  children, 
  onCreateCalendarEvent 
}: FocusProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [reflectionText, setReflectionText] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  // Update timeLeft when session changes or starts
  useEffect(() => {
    if (sessionState) {
      setTimeLeft(sessionState.duration);
    }
  }, [sessionState?.duration]);

  const openFocusModal = () => {
    setIsModalOpen(true);
  };

  const closeFocusModal = () => {
    setIsModalOpen(false);
  };

  const startSession = (tasks: string[], duration: string) => {
    setSessionState({
      tasks,
      duration,
      status: 'running',
      startTime: new Date(),
    });
    setTimeLeft(duration);
    setIsModalOpen(false);
  };

  const updateSessionStatus = (status: 'running' | 'paused' | 'completed') => {
    if (sessionState) {
      setSessionState({ ...sessionState, status });
    }
  };

  const cancelSession = () => {
    setSessionState(null);
    setSelectedEmotion(null);
    setReflectionText("");
    setTimeLeft("");
  };

  const updateTimeLeft = (time: string) => {
    setTimeLeft(time);
  };

  const createCalendarEvent = async () => {
    if (!sessionState || !onCreateCalendarEvent) return;

    const now = sessionState.startTime || new Date();
    const [hours, minutes] = sessionState.duration.split(':').map(Number);
    const endTime = new Date(now.getTime() + (hours * 60 + minutes) * 60 * 1000);

    const description = sessionState.tasks.map((task, index) => 
      `${index + 1}. ${task}`
    ).join('\n') + (reflectionText ? `\n\nReflection: ${reflectionText}` : "");

    await onCreateCalendarEvent({
      title: `Focus Session: ${sessionState.tasks[0]}${sessionState.tasks.length > 1 ? ' +' + (sessionState.tasks.length - 1) : ''}`,
      description,
      start: now,
      end: endTime,
      color: getEmotionColor(),
      allDay: false,
    });

    // Reset session state after creating the calendar event
    cancelSession();
  };

  // Helper function to map emotion to color
  const getEmotionColor = (): EventColor => {
    const emotionColorMap: Record<Emotion, EventColor> = {
      "Fulfilled": "sky",
      "Flow": "sky",
      "Calm": "emerald",
      "Courage": "amber",
      "Stress": "orange", 
      "Afraid": "rose"
    };
    
    return selectedEmotion ? emotionColorMap[selectedEmotion] : "violet";
  };

  return (
    <FocusContext.Provider
      value={{
        isModalOpen,
        sessionState,
        selectedEmotion,
        reflectionText,
        timeLeft,
        openFocusModal,
        closeFocusModal,
        startSession,
        updateSessionStatus,
        cancelSession,
        setSelectedEmotion,
        setReflectionText,
        createCalendarEvent,
        updateTimeLeft,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
} 