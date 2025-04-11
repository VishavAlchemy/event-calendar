import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";

type FocusTimerProps = {
  className?: string;
  duration: string;
  status: 'setup' | 'idle' | 'ready' | 'running' | 'paused' | 'completed';
  onStatusChange: (status: 'running' | 'paused' | 'completed') => void;
  onCancel: () => void;
  tasks: string[];
};

export function FocusTimer({ 
  className, 
  duration, 
  status, 
  onStatusChange,
  onCancel,
  tasks 
}: FocusTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const hasCompletedRef = useRef(false);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Reset completion state when status changes to running
    if (status === 'running') {
      hasCompletedRef.current = false;
    }
    
    if (status === 'running') {
      interval = setInterval(() => {
        setTimeLeft(current => {
          const [mins, secs] = current.split(':').map(Number);
          const totalSeconds = mins * 60 + secs - 1;
          
          if (totalSeconds <= 0) {
            clearInterval(interval);
            // Only trigger completion once
            if (!hasCompletedRef.current) {
              hasCompletedRef.current = true;
              // Use setTimeout to avoid state updates during render
              setTimeout(() => onStatusChange('completed'), 0);
            }
            return '00:00';
          }
          
          const newMins = Math.floor(totalSeconds / 60);
          const newSecs = totalSeconds % 60;
          return `${newMins.toString().padStart(2, '0')}:${newSecs.toString().padStart(2, '0')}`;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [status, onStatusChange]);

  // Reset timer when duration changes
  useEffect(() => {
    setTimeLeft(duration);
    hasCompletedRef.current = false;
  }, [duration]);

  const mainTask = tasks[0];
  const remainingTasks = tasks.length - 1;

  // Don't show the timer for setup or completed states
  if (status === 'setup' || status === 'completed') {
    return null;
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="space-y-4">
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
            onClick={onCancel}
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
            onClick={() => onStatusChange(status === 'running' ? 'paused' : 'running')}
            className={cn(
              "h-8 w-8 rounded-full",
              status === 'running'
                ? "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
                : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
            )}
          >
            {status === 'running' ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
} 