"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Play, Pause, X, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useFocus } from "@/contexts/focus-context";
import { EventColor } from "@/components/event-calendar";

type Emotion = "Fulfilled" | "Flow" | "Calm" | "Courage" | "Stress" | "Afraid";

const emotions: Array<{
  name: Emotion;
  color: string;
}> = [
  { name: "Fulfilled", color: "sky" },
  { name: "Flow", color: "sky" },
  { name: "Calm", color: "emerald" },
  { name: "Courage", color: "amber" },
  { name: "Stress", color: "orange" },
  { name: "Afraid", color: "rose" },
];

const getColorClasses = (color: string) => {
  const colorMap: Record<string, { bg: string; text: string; hover: string }> = {
    sky: {
      bg: "bg-sky-500/10",
      text: "text-sky-500",
      hover: "hover:bg-sky-500/20",
    },
    amber: {
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      hover: "hover:bg-amber-500/20",
    },
    violet: {
      bg: "bg-violet-500/10",
      text: "text-violet-500",
      hover: "hover:bg-violet-500/20",
    },
    rose: {
      bg: "bg-rose-500/10",
      text: "text-rose-500",
      hover: "hover:bg-rose-500/20",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-500",
      hover: "hover:bg-emerald-500/20",
    },
    orange: {
      bg: "bg-orange-500/10",
      text: "text-orange-500",
      hover: "hover:bg-orange-500/20",
    },
    blue: {
      bg: "bg-blue-500/10",
      text: "text-blue-500",
      hover: "hover:bg-blue-500/20",
    },
    yellow: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-500",
      hover: "hover:bg-yellow-500/20",
    },
    red: {
      bg: "bg-red-500/10",
      text: "text-red-500",
      hover: "hover:bg-red-500/20",
    },
  };
  
  return colorMap[color] || colorMap.sky;
};

export function FocusSession({ className }: { className?: string }) {
  const { 
    sessionState, 
    updateSessionStatus, 
    cancelSession, 
    selectedEmotion,
    setSelectedEmotion,
    reflectionText,
    setReflectionText,
    createCalendarEvent,
    timeLeft,
    updateTimeLeft
  } = useFocus();
  
  const hasCompletedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // Initialize audio on mount
  useEffect(() => {
    audioRef.current = new Audio('/sessionscompletefemale.mp3');
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Timer logic with Web Worker
  useEffect(() => {
    if (!sessionState) return;
    
    // Create a Web Worker for handling timers reliably across tab switches
    if (!workerRef.current && typeof window !== 'undefined') {
      // Define the worker in a separate function that's only called client-side
      const createWorker = () => {
        const workerCode = `
          let timerInterval;
          
          self.onmessage = function(e) {
            const { type, duration, status } = e.data;
            
            if (type === 'start') {
              clearInterval(timerInterval);
              
              // Parse the duration into minutes and seconds
              const [mins, secs] = duration.split(':').map(Number);
              let totalSeconds = mins * 60 + secs;
              
              if (status === 'running') {
                timerInterval = setInterval(() => {
                  totalSeconds--;
                  
                  if (totalSeconds <= 0) {
                    clearInterval(timerInterval);
                    self.postMessage({ type: 'completed', timeLeft: '00:00' });
                    return;
                  }
                  
                  const newMins = Math.floor(totalSeconds / 60);
                  const newSecs = totalSeconds % 60;
                  const timeLeft = \`\${newMins.toString().padStart(2, '0')}:\${newSecs.toString().padStart(2, '0')}\`;
                  
                  self.postMessage({ type: 'tick', timeLeft });
                }, 1000);
              }
            } else if (type === 'stop') {
              clearInterval(timerInterval);
            }
          };
        `;
        
        try {
          const blob = new Blob([workerCode], { type: 'application/javascript' });
          return new Worker(URL.createObjectURL(blob));
        } catch (error) {
          console.error("Error creating Web Worker:", error);
          return null;
        }
      };
      
      // Safely create the worker
      const worker = createWorker();
      workerRef.current = worker;
      
      if (worker) {
        worker.onmessage = (e) => {
          const { type, timeLeft: newTimeLeft } = e.data;
          
          if (type === 'tick') {
            updateTimeLeft(newTimeLeft);
          } else if (type === 'completed') {
            updateTimeLeft(newTimeLeft);
            // Only trigger completion once
            if (!hasCompletedRef.current) {
              hasCompletedRef.current = true;
              // Play completion sound
              if (audioRef.current) {
                audioRef.current.play().catch(err => console.error("Error playing audio:", err));
              }
              // Use setTimeout to avoid state updates during render
              setTimeout(() => updateSessionStatus('completed'), 0);
            }
          }
        };
      }
    }
    
    // Reset completion state when status changes to running
    if (sessionState.status === 'running') {
      hasCompletedRef.current = false;
    }
    
    // Start or stop the worker based on session status
    if (workerRef.current) {
      if (sessionState.status === 'running') {
        workerRef.current.postMessage({
          type: 'start',
          duration: timeLeft,
          status: sessionState.status
        });
      } else {
        workerRef.current.postMessage({ type: 'stop' });
      }
    }
    
    // Clean up the worker when the component unmounts
    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'stop' });
      }
    };
  }, [sessionState, updateSessionStatus, timeLeft, updateTimeLeft]);

  // Clean up worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  if (!sessionState) return null;

  // Get the main task and count of remaining tasks
  const mainTask = sessionState.tasks[0];
  const remainingTasks = sessionState.tasks.length - 1;

  if (sessionState.status === 'completed') {
    return (
      <Card className={cn("fixed bottom-6 right-6 w-80 shadow-xl bg-background/95 backdrop-blur", className)}>
        <CardHeader>
          <h2 className="text-lg font-semibold">Session Complete</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">How did you feel?</h3>
            <RadioGroup 
              className="flex flex-wrap gap-2"
              value={selectedEmotion || ""}
              onValueChange={(value) => setSelectedEmotion(value as Emotion)}
            >
              {emotions.map((emotion) => {
                const colorClasses = getColorClasses(emotion.color);
                return (
                  <div key={emotion.name} className="flex items-center">
                    <RadioGroupItem
                      id={`emotion-${emotion.name}`}
                      value={emotion.name}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={`emotion-${emotion.name}`}
                      className={cn(
                        "px-3 py-2 rounded-full cursor-pointer ring-offset-background transition-all",
                        colorClasses.bg,
                        colorClasses.text,
                        selectedEmotion === emotion.name && "ring-2 ring-ring ring-offset-2"
                      )}
                    >
                      {emotion.name}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Add a reflection</h3>
            <Textarea
              placeholder="What did you accomplish? What did you learn?"
              className="resize-none"
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={cancelSession}
          >
            <X className="mr-2 h-4 w-4" />
            Discard
          </Button>
          <Button
            onClick={createCalendarEvent}
          >
            <Check className="mr-2 h-4 w-4" />
            Save to Calendar
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={cn("fixed bottom-6 right-6 w-72 shadow-xl bg-background/95 backdrop-blur", className)}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Current Focus</p>
            <p className="text-sm text-muted-foreground truncate">
              {mainTask}
              {remainingTasks > 0 && ` +${remainingTasks}`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={cancelSession}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold tracking-tighter">{timeLeft}</span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => updateSessionStatus(sessionState.status === 'running' ? 'paused' : 'running')}
            className={cn(
              "h-8 w-8 rounded-full",
              sessionState.status === 'running'
                ? "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
                : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
            )}
          >
            {sessionState.status === 'running' ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 