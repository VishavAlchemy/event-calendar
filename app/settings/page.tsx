'use client'
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import timezones from "../lib/timezones";

export default function SettingsPage() {
  const { user } = useUser();
  const userPreferences = useQuery(api.users.getUserPreferences);
  const updatePreferences = useMutation(api.users.updateUserPreferences);
  const submitBugReport = useMutation(api.bugReports.create);

  const [bugReport, setBugReport] = React.useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high"
  });

  const handleTimezoneChange = async (timezone: string) => {
    try {
      await updatePreferences({
        preferences: {
          theme: userPreferences?.theme || "light",
          notifications: userPreferences?.notifications || false,
          emailNotifications: userPreferences?.emailNotifications || false,
          timezone
        }
      });
      toast.success("Timezone updated successfully!");
    } catch (error) {
      toast.error("Failed to update timezone");
    }
  };

  const handleBugReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitBugReport({
        ...bugReport,
        status: "open"
      });
      setBugReport({ title: "", description: "", priority: "medium" });
      toast.success("Bug report submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit bug report");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="space-y-6">
        <Card className="w-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Time Zone Settings</CardTitle>
            <CardDescription>
              Choose your preferred time zone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full max-w-xs">
              <Label htmlFor="timezone">Time Zone</Label>
              <Select
                value={userPreferences?.timezone || "UTC"}
                onValueChange={handleTimezoneChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz: { value: string; label: string }) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Report an Issue</CardTitle>
            <CardDescription>
              Help us improve by reporting bugs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBugReportSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title</Label>
                <Input
                  id="title"
                  value={bugReport.title}
                  onChange={(e) => setBugReport(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  value={bugReport.description}
                  onChange={(e) => setBugReport(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Please provide as much detail as possible..."
                  required
                  className="min-h-[120px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={bugReport.priority}
                  onValueChange={(value: "low" | "medium" | "high") => 
                    setBugReport(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full mt-6">
                Submit Report
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}