'use client'

import { format } from 'date-fns'
import { 
  CheckCircle2, 
  Users, 
  ChevronRight, 
  CheckCircle, 
  Sparkles
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const tasks = [
  {
    id: 1,
    title: 'Build Saga Project Manager',
    tags: ['Product', 'Design'],
    dueDate: 'Tomorrow',
  },
  {
    id: 2,
    title: 'Review Pitch Deck for SagaCity 2025',
    tags: ['Marketing', 'Writing'],
    dueDate: 'Friday',
  },
  {
    id: 3,
    title: 'Complete (2) Web Design Clients',
    tags: ['Software', 'Writing'],
    dueDate: 'Saturday',
  },
  {
    id: 4,
    title: 'Publish Blog for SagaCity (1x per week)',
    tags: ['Future', 'Writing'],
    dueDate: 'Tuesday',
  },
  {
    id: 5,
    title: 'Setup ads for (5) clients',
    tags: ['Advertise', 'Writing'],
    dueDate: 'Friday',
  },
  {
    id: 6,
    title: 'Create FumaDocs for Blog (Fumadocs)',
    tags: ['AI/Neural', 'Writing'],
    dueDate: 'Friday',
  },
]

const tagColors = {
  Product: 'bg-green-500 text-green-50',
  Design: 'bg-red-500 text-red-50',
  Marketing: 'bg-orange-500 text-orange-50',
  Writing: 'bg-blue-500 text-blue-50',
  Software: 'bg-purple-500 text-purple-50',
  Future: 'bg-blue-600 text-blue-50',
  Advertise: 'bg-red-600 text-red-50',
  'AI/Neural': 'bg-red-500 text-red-50',
}

export default function ProjectPage() {
  const today = new Date()
  
  return (
    <div className="flex-1 p-4 bg-black text-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center mb-6">
          <h2 className="text-xl font-medium text-zinc-300">
            {format(today, 'EEEE, MMMM do yyyy')}
          </h2>
          <h1 className="text-4xl font-bold mt-2 mb-6 text-white">
            Good Morning Vishav
          </h1>
          
          <div className="flex items-center gap-2 bg-zinc-900 rounded-full p-2 px-4 w-fit">
            <Button variant="ghost" className="p-2 text-white">My Weekly Tasks</Button>
            <div className="flex items-center gap-2 bg-zinc-800 rounded-full px-4 py-2">
              <CheckCircle2 size={18} />
              <span>20 Tasks</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2">
              <Users size={18} />
              <span>400 Collabs</span>
            </div>
          </div>
        </div>
        
        <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center">
              <img 
                src="/avatar.png" 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://ui-avatars.com/api/?name=V&background=F97316&color=fff'
                }}
              />
            </div>
            <h2 className="text-xl font-bold text-white">My Workboard</h2>
          </div>
          
          <Tabs defaultValue="upcoming" className="w-full">
            <div className="border-b border-zinc-800 px-6">
              <TabsList className="bg-transparent">
                <TabsTrigger 
                  value="upcoming" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 border-white rounded-none text-white"
                >
                  Upcoming
                </TabsTrigger>
                <TabsTrigger 
                  value="overdue" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 border-white rounded-none text-white"
                >
                  Overdue
                </TabsTrigger>
                <TabsTrigger 
                  value="completed" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 border-white rounded-none text-white"
                >
                  Completed
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="upcoming" className="p-0 m-0">
              <div className="flex flex-col divide-y divide-zinc-800">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center py-3 px-4 hover:bg-zinc-800/50">
                    <div className="w-6 h-6 mr-3 flex-shrink-0">
                      <div className="w-5 h-5 rounded-full border border-zinc-500 flex items-center justify-center">
                        {/* Empty circle for unchecked state */}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">{task.title}</p>
                      <div className="flex mt-1 gap-1">
                        {task.tags.map((tag) => (
                          <Badge 
                            key={tag} 
                            className={cn("rounded-md text-xs font-medium", tagColors[tag as keyof typeof tagColors])}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className={cn(
                      "text-xs",
                      task.dueDate === 'Tomorrow' ? 'text-green-500' : 
                      task.dueDate === 'Saturday' ? 'text-yellow-500' : 
                      'text-blue-500'
                    )}>
                      {task.dueDate}
                    </p>
                  </div>
                ))}
                <div className="p-3">
                  <button className="text-zinc-500 text-xs hover:text-zinc-300">
                    Show More
                  </button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="overdue" className="p-4">
              <p className="text-zinc-500">No overdue tasks</p>
            </TabsContent>
            
            <TabsContent value="completed" className="p-4">
              <p className="text-zinc-500">No completed tasks</p>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
