"use client";

import { cn } from "@/lib/utils";
import { useFocus } from "@/contexts/focus-context";
import { Clock, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FocusTimer({ className }: { className?: string }) {
  const { 
    sessionState, 
    updateSessionStatus,
    cancelSession,
    timeLeft
  } = useFocus();
  
  // If there's no active session, don't render anything
  if (!sessionState || sessionState.status === 'completed') {
    return null;
  }
  
  // Get the main task name to display
  const mainTask = sessionState.tasks[0] || "Focus Session";
  const remainingTasks = sessionState.tasks.length - 1;
  
  // Get the appropriate status text and action button
  const isRunning = sessionState.status === 'running';
  
  return (
    <div className={cn(
      "flex items-center justify-center gap-3 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-full border shadow-sm",
      className
    )}>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" />
        <div className="font-mono text-sm font-medium">{timeLeft}</div>
      </div>
      <div className="text-sm truncate max-w-[180px]">
        {mainTask}
        {remainingTasks > 0 && <span className="text-muted-foreground"> +{remainingTasks}</span>}
      </div>
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6"
          onClick={() => updateSessionStatus(isRunning ? 'paused' : 'running')}
        >
          {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={cancelSession}
        >
          <span className="text-xs">×</span>
        </Button>
      </div>
    </div>
  );
} 