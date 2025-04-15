"use client"

import { Brain, Calendar, Home, Plus, Settings, Users, Clock, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { eb } from "@/lib/fonts"
import { UserButton, SignInButton, useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useContext } from "react"
import { useFocus } from "@/contexts/focus-context"

// Color mapping function
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

const colorOptions = [
  { value: "sky", label: "Sky" },
  { value: "violet", label: "Violet" },
  { value: "emerald", label: "Emerald" },
  { value: "rose", label: "Rose" },
  { value: "orange", label: "Orange" },
  { value: "amber", label: "Amber" },
]

interface Intention {
  _id: Id<"monthlyIntentions"> | Id<"weeklyIntentions">;
  text: string;
  color: string;
  userId: Id<"users">;
  createdAt: number;
  updatedAt: number;
}

const sidebarItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "AI",
    href: "/ai",
    icon: Brain,
  },
  {
    name: "Team (coming soon)",
    href: "/team",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isSignedIn, user } = useUser()
  const { openFocusModal } = useFocus()
  
  // Daily Tasks State
  const [newTask, setNewTask] = useState("")
  const dailyTasks = useQuery(api.dailyTasks.getDailyTasks) || []
  const addDailyTask = useMutation(api.dailyTasks.addDailyTask)
  const toggleTaskCompletion = useMutation(api.dailyTasks.toggleTaskCompletion)
  const deleteTask = useMutation(api.dailyTasks.deleteTask)

  const handleAddDailyTask = async () => {
    if (newTask.trim()) {
      await addDailyTask({ text: newTask.trim() })
      setNewTask("")
    }
  }

  // Convex queries and mutations
  const monthlyIntentions = useQuery(api.intentions.getMonthlyIntentions) || []
  const weeklyIntentions = useQuery(api.intentions.getWeeklyIntentions) || []
  
  const addMonthlyIntention = useMutation(api.intentions.addMonthlyIntention)
  const addWeeklyIntention = useMutation(api.intentions.addWeeklyIntention)
  const updateMonthlyIntention = useMutation(api.intentions.updateMonthlyIntention)
  const updateWeeklyIntention = useMutation(api.intentions.updateWeeklyIntention)
  const deleteMonthlyIntention = useMutation(api.intentions.deleteMonthlyIntention)
  const deleteWeeklyIntention = useMutation(api.intentions.deleteWeeklyIntention)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'monthly' | 'weekly'>('monthly')
  const [editingIntention, setEditingIntention] = useState<Intention | null>(null)
  
  // Form state
  const [intentionText, setIntentionText] = useState('')
  const [intentionColor, setIntentionColor] = useState('sky')
  
  // Open modal for adding new intention
  const handleAddIntention = (type: 'monthly' | 'weekly') => {
    setModalType(type)
    setEditingIntention(null)
    setIntentionText('')
    setIntentionColor('sky')
    setIsModalOpen(true)
  }
  
  // Open modal for editing existing intention
  const handleEditIntention = (intention: Intention, type: 'monthly' | 'weekly') => {
    setModalType(type)
    setEditingIntention(intention)
    setIntentionText(intention.text)
    setIntentionColor(intention.color)
    setIsModalOpen(true)
  }
  
  // Save intention (new or edited)
  const handleSaveIntention = async () => {
    if (!intentionText.trim()) return
    
    try {
      if (modalType === 'monthly') {
        if (editingIntention) {
          await updateMonthlyIntention({
            id: editingIntention._id as Id<"monthlyIntentions">,
            text: intentionText.trim(),
            color: intentionColor,
          })
        } else {
          await addMonthlyIntention({
            text: intentionText.trim(),
            color: intentionColor,
          })
        }
      } else {
        if (editingIntention) {
          await updateWeeklyIntention({
            id: editingIntention._id as Id<"weeklyIntentions">,
            text: intentionText.trim(),
            color: intentionColor,
          })
        } else {
          await addWeeklyIntention({
            text: intentionText.trim(),
            color: intentionColor,
          })
        }
      }
      
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to save intention:', error)
    }
  }
  
  // Delete intention
  const handleDeleteIntention = async () => {
    if (!editingIntention) return
    
    try {
      if (modalType === 'monthly') {
        await deleteMonthlyIntention({
          id: editingIntention._id as Id<"monthlyIntentions">,
        })
      } else {
        await deleteWeeklyIntention({
          id: editingIntention._id as Id<"weeklyIntentions">,
        })
      }
      
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to delete intention:', error)
    }
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b gap-2 px-4">
        <Image src="/alk-city.svg" alt="Sagacity" width={40} height={40} />
        <h1 className={`text-2xl ${eb.className}`}>Sagacity</h1>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.name}
            </Link>
          )
        })}

        {/* Daily Tasks Section */}
        <div className="pt-6 px-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Daily Tasks</h3>
          </div>
          <div className="space-y-2">
            {dailyTasks.map((task) => (
              <div key={task._id} className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-5 p-0",
                    task.completed && "text-emerald-500"
                  )}
                  onClick={() => toggleTaskCompletion({ id: task._id })}
                >
                  <div className={cn(
                    "size-4 rounded border-2",
                    task.completed ? "bg-emerald-500 border-emerald-500" : "border-muted-foreground"
                  )}>
                    {task.completed && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-3 text-white"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </Button>
                <span className={cn(
                  "flex-1 text-sm",
                  task.completed && "line-through text-muted-foreground"
                )}>
                  {task.text}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteTask({ id: task._id })}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a task..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAddDailyTask()}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleAddDailyTask}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      
        {/* Intentions of the Month */}
        <div className="pt-6 px-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Intentions of the Month</h3>
            <Button 
              variant="ghost" 
              size="icon"
              className="size-6 rounded-full p-0"
              onClick={() => handleAddIntention('monthly')}
            >
              <Plus className="size-4 text-muted-foreground" />
              <span className="sr-only">Add monthly intention</span>
            </Button>
          </div>
          <ul className="space-y-1">
            {monthlyIntentions.map((intention) => {
              const colorClasses = getColorClasses(intention.color)
              return (
                <li 
                  key={intention._id}
                  className={cn(
                    "text-sm rounded-md py-1 px-2 border cursor-pointer",
                    colorClasses.bg,
                    colorClasses.text,
                    colorClasses.border
                  )}
                  onClick={() => handleEditIntention(intention, 'monthly')}
                >
                  {intention.text}
                </li>
              )
            })}
          </ul>
        </div>
        
        {/* Intentions of the Week */}
        <div className="pt-6 px-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Intentions of the Week</h3>
            <Button 
              variant="ghost" 
              size="icon"
              className="size-6 rounded-full p-0"
              onClick={() => handleAddIntention('weekly')}
            >
              <Plus className="size-4 text-muted-foreground" />
              <span className="sr-only">Add weekly intention</span>
            </Button>
          </div>
          <ul className="space-y-1">
            {weeklyIntentions.map((intention) => {
              const colorClasses = getColorClasses(intention.color)
              return (
                <li 
                  key={intention._id}
                  className={cn(
                    "text-sm rounded-md py-1 px-2 border cursor-pointer",
                    colorClasses.bg,
                    colorClasses.text,
                    colorClasses.border
                  )}
                  onClick={() => handleEditIntention(intention, 'weekly')}
                >
                  {intention.text}
                </li>
              )
            })}
          </ul>
        </div>

        {/* Focus Mode Section - Updated */}
        <div className="pt-6 px-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Focus Mode</h3>
          </div>
          <Button
            variant="secondary"
            className="w-full justify-start"
            onClick={openFocusModal}
          >
            <Clock className="mr-2 h-4 w-4" />
            Start Focus Session
          </Button>
        </div>
      </nav>
      
      {/* User Profile or Sign In */}
      <div className="border-t p-4">
        {isSignedIn ? (
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="text-sm">
              <p className="font-medium">{user.fullName || user.username}</p>
              <p className="text-muted-foreground text-xs">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
        ) : (
          <SignInButton mode="modal">
            <button className="w-full bg-white text-black border border-gray-200 rounded-md py-2 px-4 text-sm font-medium hover:bg-gray-50 transition-colors">
              Sign In
            </button>
          </SignInButton>
        )}
      </div>
      
      {/* Intention Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingIntention ? "Edit Intention" : "Add Intention"}
            </DialogTitle>
            <DialogDescription>
              {modalType === 'monthly' ? "Monthly" : "Weekly"} intention
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="intention-text">Intention</Label>
              <Input
                id="intention-text"
                value={intentionText}
                onChange={(e) => setIntentionText(e.target.value)}
                placeholder="Enter your intention"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Color</Label>
              <RadioGroup
                className="flex flex-wrap gap-2"
                value={intentionColor}
                onValueChange={setIntentionColor}
              >
                {colorOptions.map((colorOption) => {
                  const colorClasses = getColorClasses(colorOption.value)
                  return (
                    <div key={colorOption.value} className="flex items-center">
                      <RadioGroupItem
                        id={`color-${colorOption.value}`}
                        value={colorOption.value}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={`color-${colorOption.value}`}
                        className={cn(
                          "h-8 w-8 rounded-md cursor-pointer ring-offset-background transition-all hover:opacity-90",
                          "flex items-center justify-center",
                          colorClasses.bg,
                          colorClasses.border,
                          intentionColor === colorOption.value && "ring-2 ring-ring ring-offset-2"
                        )}
                      >
                        <span className="sr-only">{colorOption.label}</span>
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            {editingIntention && (
              <Button variant="destructive" onClick={handleDeleteIntention}>
                Delete
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveIntention}>
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 