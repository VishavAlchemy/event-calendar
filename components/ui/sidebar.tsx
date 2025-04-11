"use client"

import { Brain, Calendar, Home, Plus, Settings, Users, Clock } from "lucide-react"
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
import { FocusTimer } from "@/components/focus-timer"
import { Session } from "@/components/session"

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
/*   {
    name: "Calendar",
    href: "/calendar",
    icon: Calendar,
  }, */
  {
    name: "Team",
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
  
  // Focus Session State
  const [activeSession, setActiveSession] = useState<{
    duration: string;
    tasks: string[];
    status: 'running' | 'paused' | 'completed';
  } | null>(null);
  const [showSession, setShowSession] = useState(false);

  // Focus Session Handlers
  const handleSessionStatusChange = (status: 'running' | 'paused' | 'completed') => {
    if (activeSession) {
      setActiveSession({ ...activeSession, status });
    }
  };

  const handleSessionCancel = () => {
    setActiveSession(null);
  };

  const handleStartSession = async (tasks: string[], duration: string) => {
    setActiveSession({
      tasks,
      duration,
      status: 'running'
    });
    setShowSession(false);
  };

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

        {/* Focus Mode Section */}
        <div className="pt-6 px-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Focus Mode</h3>
          </div>
          {showSession ? (
            <Session
              className="mb-4"
              onStartSession={handleStartSession}
            />
          ) : activeSession ? (
            <FocusTimer
              className="mb-4"
              duration={activeSession.duration}
              status={activeSession.status}
              tasks={activeSession.tasks}
              onStatusChange={handleSessionStatusChange}
              onCancel={handleSessionCancel}
            />
          ) : (
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() => setShowSession(true)}
            >
              <Clock className="mr-2 h-4 w-4" />
              Start Focus Session
            </Button>
          )}
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