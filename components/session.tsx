import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Play, Pause, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarEvent } from "@/components/event-calendar";

type Emotion = "Fulfilled" | "Flow" | "Calm" | "Courage" | "Stress" | "Afraid";

type SessionProps = {
  className?: string;
  onStartSession?: (tasks: string[]) => Promise<void>;
  onCreateCalendarEvent?: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
};

type SessionState = {
  sessionId?: string;
  startTime?: string;
  duration: string;
  tasks: string[];
  sessionType: 'focus' | 'break' | 'meeting';
  status: 'setup' | 'idle' | 'ready' | 'running' | 'paused' | 'completed';
};

const emotions: Array<{
  name: Emotion;
  color: "blue" | "sky" | "emerald" | "yellow" | "orange" | "red";
}> = [
  { name: "Fulfilled", color: "blue" },
  { name: "Flow", color: "sky" },
  { name: "Calm", color: "emerald" },
  { name: "Courage", color: "yellow" },
  { name: "Stress", color: "orange" },
  { name: "Afraid", color: "red" },
];

const getColorClasses = (color: string) => {
  const colorMap: Record<string, { bg: string; text: string; hover: string }> = {
    blue: {
      bg: "bg-blue-500/10",
      text: "text-blue-500",
      hover: "hover:bg-blue-500/20",
    },
    sky: {
      bg: "bg-sky-500/10",
      text: "text-sky-500",
      hover: "hover:bg-sky-500/20",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-500",
      hover: "hover:bg-emerald-500/20",
    },
    yellow: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-500",
      hover: "hover:bg-yellow-500/20",
    },
    orange: {
      bg: "bg-orange-500/10",
      text: "text-orange-500",
      hover: "hover:bg-orange-500/20",
    },
    red: {
      bg: "bg-red-500/10",
      text: "text-red-500",
      hover: "hover:bg-red-500/20",
    },
  };
  
  return colorMap[color] || colorMap.sky;
};

const durations = [
  { label: "25min", value: "25:00" },
  { label: "45min", value: "45:00" },
  { label: "60min", value: "60:00" },
  { label: "90min", value: "90:00" },
  { label: "120min", value: "120:00" },
];

export const Session = ({ className, onStartSession, onCreateCalendarEvent }: SessionProps) => {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [newTask, setNewTask] = useState("");
  const [reflection, setReflection] = useState("");
  const [sessionState, setSessionState] = useState<SessionState>({
    duration: "25:00",
    tasks: [],
    sessionType: 'focus',
    status: 'setup'
  });
  const [timeLeft, setTimeLeft] = useState(sessionState.duration);
  
  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (sessionState.status === 'running') {
      interval = setInterval(() => {
        setTimeLeft(current => {
          const [mins, secs] = current.split(':').map(Number);
          const totalSeconds = mins * 60 + secs - 1;
          
          if (totalSeconds <= 0) {
            clearInterval(interval);
            setSessionState(prev => ({ ...prev, status: 'completed' }));
            return '00:00';
          }
          
          const newMins = Math.floor(totalSeconds / 60);
          const newSecs = totalSeconds % 60;
          return `${newMins.toString().padStart(2, '0')}:${newSecs.toString().padStart(2, '0')}`;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [sessionState.status]);

  const handleAddTask = () => {
    if (newTask.trim()) {
      setSessionState(prev => ({
        ...prev,
        tasks: [...prev.tasks, newTask.trim()]
      }));
      setNewTask("");
    }
  };

  const handleSetupComplete = () => {
    if (sessionState.tasks.length > 0) {
      setSessionState(prev => ({ ...prev, status: 'idle' }));
    }
  };

  const createCalendarEvent = async () => {
    if (!onCreateCalendarEvent) return;

    const now = new Date();
    const [hours, minutes] = sessionState.duration.split(':').map(Number);
    const endTime = new Date(now.getTime() + (hours * 60 + minutes) * 60 * 1000);

    const description = sessionState.tasks.map((task, index) => 
      `${index + 1}. ${task}`
    ).join('\n');

    await onCreateCalendarEvent({
      title: `Focus Session: ${sessionState.tasks[0]}${sessionState.tasks.length > 1 ? ' +' + (sessionState.tasks.length - 1) : ''}`,
      description,
      start: now,
      end: endTime,
      color: 'violet', // Special color for focus sessions
      allDay: false,
    });
  };

  const toggleSession = async () => {
    if (sessionState.status === 'idle') {
      if (onStartSession) {
        await onStartSession(sessionState.tasks);
      }
      await createCalendarEvent();
      setSessionState(prev => ({ ...prev, status: 'running', startTime: new Date().toISOString() }));
    } else if (sessionState.status === 'running') {
      setSessionState(prev => ({ ...prev, status: 'paused' }));
    } else if (sessionState.status === 'paused') {
      setSessionState(prev => ({ ...prev, status: 'running' }));
    }
  };

  if (sessionState.status === 'setup') {
    return (
      <Card className={cn("w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">Set Up Your Focus Session</h2>
          <div className="space-y-4 mt-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Choose Duration</h3>
              <div className="flex flex-wrap gap-2">
                {durations.map(({ label, value }) => (
                  <Button
                    key={value}
                    variant="outline"
                    onClick={() => {
                      setSessionState(prev => ({ ...prev, duration: value }));
                      setTimeLeft(value);
                    }}
                    className={cn(
                      "rounded-full",
                      sessionState.duration === value && "bg-primary text-primary-foreground"
                    )}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Add Your Tasks</h3>
              <div className="space-y-2">
                {sessionState.tasks.map((task, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 p-2 bg-muted/50 rounded-md">{task}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => {
                        setSessionState(prev => ({
                          ...prev,
                          tasks: prev.tasks.filter((_, i) => i !== index)
                        }));
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input 
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a task..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleAddTask}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              disabled={sessionState.tasks.length === 0}
              onClick={handleSetupComplete}
            >
              Start Session
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <CardHeader>
        <h2 className="text-lg font-semibold text-foreground">Current Session</h2>
        <div className="space-y-2 mt-4">
          {sessionState.tasks.map((task, index) => (
            <Button 
              key={index}
              variant="secondary" 
              className="w-full justify-start bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20"
            >
              {task}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-4xl font-bold tracking-tighter">{timeLeft}</span>
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleSession}
              className={cn(
                "rounded-full h-8 w-8",
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
        </div>

        {sessionState.status === 'completed' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Session Complete! How do you feel & what reflections do you have?
            </h3>
            <div className="flex flex-wrap gap-2">
              {emotions.map(({ name, color }) => {
                const colorClasses = getColorClasses(color);
                return (
                  <Button
                    key={name}
                    variant="ghost"
                    onClick={() => setSelectedEmotion(name)}
                    className={cn(
                      "rounded-full px-4 py-2",
                      colorClasses.bg,
                      colorClasses.text,
                      colorClasses.hover,
                      selectedEmotion === name && "ring-2 ring-offset-2 ring-offset-background",
                    )}
                  >
                    {name}
                  </Button>
                );
              })}
            </div>
            <Input 
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Share your thoughts on this session..." 
              className="bg-muted/50 border-0 focus-visible:ring-0"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};