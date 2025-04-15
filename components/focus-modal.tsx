"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Play } from "lucide-react";
import { useState } from "react";
import { useFocus } from "@/contexts/focus-context";

const durations = [
  { label: "1sec", value: "0:01" },
  { label: "1min", value: "1:00" },
  { label: "25min", value: "25:00" },
  { label: "45min", value: "45:00" },
  { label: "60min", value: "60:00" },
  { label: "90min", value: "90:00" },
  { label: "120min", value: "120:00" },
];

export function FocusModal() {
  const { closeFocusModal, startSession } = useFocus();
  const [newTask, setNewTask] = useState("");
  const [tasks, setTasks] = useState<string[]>([]);
  const [duration, setDuration] = useState("25:00");

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks(prev => [...prev, newTask.trim()]);
      setNewTask("");
    }
  };

  const handleRemoveTask = (index: number) => {
    setTasks(prev => prev.filter((_, i) => i !== index));
  };

  const handleStart = () => {
    if (tasks.length > 0) {
      startSession(tasks, duration);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Start Focus Session</DialogTitle>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Choose Duration</h3>
          <div className="flex flex-wrap gap-2">
            {durations.map(({ label, value }) => (
              <Button
                key={value}
                variant="outline"
                onClick={() => setDuration(value)}
                className={`rounded-full ${
                  duration === value ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Add Your Tasks</h3>
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1 p-2 bg-muted/50 rounded-md">{task}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => handleRemoveTask(index)}
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
      </div>
      
      <DialogFooter>
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            className="flex-1"
            onClick={closeFocusModal}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleStart}
            disabled={tasks.length === 0}
          >
            <Play className="mr-2 h-4 w-4" />
            Start
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
} 