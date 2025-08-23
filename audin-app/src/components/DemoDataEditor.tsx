"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Plus, Trash2, RotateCcw } from "lucide-react";
import { Email } from "@/types/email";
import { CalendarEvent } from "@/types/calendar";
import { demoPresets, getPresetByName } from "@/data/demoPresets";

interface DemoDataEditorProps {
  isDemo: boolean;
  onDataChange: (emails: Email[], calendar: CalendarEvent[]) => void;
  currentEmails: Email[];
  currentCalendar: CalendarEvent[];
}

export default function DemoDataEditor({ 
  isDemo, 
  onDataChange, 
  currentEmails, 
  currentCalendar 
}: DemoDataEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);
  const [calendar, setCalendar] = useState<CalendarEvent[]>([]);
  const [editingValues, setEditingValues] = useState<{[key: string]: {hours?: string, minutes?: string}}>({});

  // Initialize with current data or default preset
  useEffect(() => {
    if (currentEmails.length > 0 || currentCalendar.length > 0) {
      setEmails(currentEmails);
      setCalendar(currentCalendar);
    } else {
      // Load default preset if no custom data
      const defaultPreset = getPresetByName("Default");
      if (defaultPreset) {
        setEmails(defaultPreset.emails);
        setCalendar(defaultPreset.calendar);
      }
    }
  }, [currentEmails, currentCalendar]);

  if (!isDemo) return null;

  // Helper function to get email field value
  const getEmailField = (email: Email, field: 'from' | 'subject') => {
    const header = email.payload.headers.find(h => 
      h.name.toLowerCase() === (field === 'from' ? 'from' : 'subject')
    );
    return header?.value || '';
  };

  // Helper function to update email field
  const updateEmailField = (emailId: string, field: 'from' | 'subject' | 'body', value: string) => {
    setEmails(prev => prev.map(email => {
      if (email.id !== emailId) return email;
      
      if (field === 'body') {
        return {
          ...email,
          payload: {
            ...email.payload,
            body: { ...email.payload.body, data: value }
          },
          snippet: value.substring(0, 100) + (value.length > 100 ? '...' : '')
        };
      } else {
        const headerName = field === 'from' ? 'From' : 'Subject';
        return {
          ...email,
          payload: {
            ...email.payload,
            headers: email.payload.headers.map(header =>
              header.name === headerName ? { ...header, value } : header
            )
          }
        };
      }
    }));
  };

  // Add new email
  const addEmail = () => {
    const newId = `email_custom_${Date.now()}`;
    const newEmail: Email = {
      id: newId,
      threadId: `thread_${newId}`,
      snippet: "New email content...",
      payload: {
        headers: [
          { name: "From", value: "New Sender <sender@example.com>" },
          { name: "Subject", value: "New Email Subject" },
          { name: "Date", value: new Date().toString() }
        ],
        body: {
          data: "New email content goes here..."
        }
      },
      internalDate: Date.now().toString(),
      labelIds: ["UNREAD", "INBOX"]
    };
    setEmails(prev => [...prev, newEmail]);
  };

  // Remove email
  const removeEmail = (emailId: string) => {
    setEmails(prev => prev.filter(email => email.id !== emailId));
  };

  // Helper functions to get hours and minutes from calendar event
  const getEventHours = (event: CalendarEvent): string => {
    const dateTimeStr = event.start.dateTime || event.start.date!;
    console.log(`🐛 getEventHours input: ${dateTimeStr}`);
    
    // Parse directly from ISO string to avoid timezone issues
    const timeMatch = dateTimeStr.match(/T(\d{2}):\d{2}:/);
    const hours = timeMatch ? timeMatch[1] : '00';
    
    console.log(`🐛 getEventHours output: ${hours}`);
    return hours;
  };

  const getEventMinutes = (event: CalendarEvent): string => {
    const dateTimeStr = event.start.dateTime || event.start.date!;
    console.log(`🐛 getEventMinutes input: ${dateTimeStr}`);
    
    // Parse directly from ISO string to avoid timezone issues
    const timeMatch = dateTimeStr.match(/T\d{2}:(\d{2}):/);
    const minutes = timeMatch ? timeMatch[1] : '00';
    
    console.log(`🐛 getEventMinutes output: ${minutes}`);
    return minutes;
  };

  // Update calendar event with temporary editing support
  const updateCalendarEvent = (eventId: string, field: 'title' | 'hours' | 'minutes', value: string) => {
    if (field === 'title') {
      setCalendar(prev => prev.map(event => {
        if (event.id !== eventId) return event;
        return { ...event, summary: value };
      }));
    } else if (field === 'hours' || field === 'minutes') {
      // Store the raw editing value temporarily
      setEditingValues(prev => ({
        ...prev,
        [eventId]: {
          ...prev[eventId],
          [field]: value
        }
      }));
    }
  };

  // Apply time changes when user finishes editing (onBlur)
  const applyTimeChange = (eventId: string, field: 'hours' | 'minutes') => {
    const editingValue = editingValues[eventId]?.[field];
    if (editingValue === undefined) return;

    console.log(`🐛 DEBUG: applyTimeChange for ${field}, input: "${editingValue}"`);

    setCalendar(prev => prev.map(event => {
      if (event.id !== eventId) return event;
      
      console.log(`🐛 Current event dateTime: ${event.start.dateTime}`);
      
      // Parse the current ISO string directly
      const currentDateTimeStr = event.start.dateTime || '';
      const timeMatch = currentDateTimeStr.match(/T(\d{2}):(\d{2}):/);
      const currentHours = timeMatch ? parseInt(timeMatch[1]) : 0;
      const currentMinutes = timeMatch ? parseInt(timeMatch[2]) : 0;
      
      console.log(`🐛 Parsed current hours: ${currentHours}, minutes: ${currentMinutes}`);
      
      let newHours = currentHours;
      let newMinutes = currentMinutes;
      
      if (field === 'hours') {
        const inputHours = parseInt(editingValue);
        console.log(`🐛 Parsed input hours: ${inputHours}`);
        if (!isNaN(inputHours)) {
          newHours = Math.max(0, Math.min(23, inputHours));
          console.log(`🐛 Validated new hours: ${newHours}`);
        } else {
          newHours = 0;
        }
      } else if (field === 'minutes') {
        const inputMinutes = parseInt(editingValue);
        console.log(`🐛 Parsed input minutes: ${inputMinutes}`);
        if (!isNaN(inputMinutes)) {
          newMinutes = Math.max(0, Math.min(59, inputMinutes));
          console.log(`🐛 Validated new minutes: ${newMinutes}`);
        } else {
          newMinutes = 0;
        }
      }
      
      // Format as ISO string directly
      const hoursStr = newHours.toString().padStart(2, '0');
      const minutesStr = newMinutes.toString().padStart(2, '0');
      const startTimeStr = `2025-01-15T${hoursStr}:${minutesStr}:00-08:00`;
      
      console.log(`🐛 New dateTime string: ${startTimeStr}`);
      
      // End time is 1 hour later
      const endHours = (newHours + 1) % 24;
      const endHoursStr = endHours.toString().padStart(2, '0');
      const endTimeStr = `2025-01-15T${endHoursStr}:${minutesStr}:00-08:00`;
      
      return {
        ...event,
        start: { dateTime: startTimeStr },
        end: { dateTime: endTimeStr }
      };
    }));

    // Clear the temporary editing value
    setEditingValues(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [field]: undefined
      }
    }));
  };

  // Add new calendar event
  const addCalendarEvent = () => {
    const newId = `event_custom_${Date.now()}`;
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1); // 1 hour from now
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1 hour
    
    const newEvent: CalendarEvent = {
      id: newId,
      summary: "New Meeting",
      start: { dateTime: startTime.toISOString().slice(0, -1) + '-08:00' },
      end: { dateTime: endTime.toISOString().slice(0, -1) + '-08:00' },
      status: "confirmed"
    };
    setCalendar(prev => [...prev, newEvent]);
  };

  // Remove calendar event
  const removeCalendarEvent = (eventId: string) => {
    setCalendar(prev => prev.filter(event => event.id !== eventId));
  };

  // Load preset
  const loadPreset = (presetName: string) => {
    const preset = getPresetByName(presetName);
    if (preset) {
      setEmails(preset.emails);
      setCalendar(preset.calendar);
      onDataChange(preset.emails, preset.calendar);
    }
  };

  // Save changes
  const saveChanges = () => {
    onDataChange(emails, calendar);
    setIsExpanded(false);
  };

  // Reset to default
  const resetToDefault = () => {
    const defaultPreset = getPresetByName("Default");
    if (defaultPreset) {
      setEmails(defaultPreset.emails);
      setCalendar(defaultPreset.calendar);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-8">
      {/* Expandable Header */}
      <Card className="border-dashed border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                ✏️ Custom Editor
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Fine-tune your selected scenario or create custom content
              </p>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {isExpanded ? 'Close Editor' : 'Edit Data'}
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>Tip:</strong> Use the preset selector above to quickly switch scenarios, then edit details here if needed. 
                Changes will mark your data as "Custom".
              </p>
            </div>

            {/* Email Editor */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">📧 Emails ({emails.length})</h3>
                <Button size="sm" onClick={addEmail}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Email
                </Button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {emails.map((email, index) => (
                  <Card key={email.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Email {index + 1}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => removeEmail(email.id)}
                          disabled={emails.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">From</label>
                          <Input
                            value={getEmailField(email, 'from')}
                            onChange={(e) => updateEmailField(email.id, 'from', e.target.value)}
                            placeholder="Sender Name <email@example.com>"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Subject</label>
                          <Input
                            value={getEmailField(email, 'subject')}
                            onChange={(e) => updateEmailField(email.id, 'subject', e.target.value)}
                            placeholder="Email subject line"
                            className="text-sm"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Content</label>
                        <textarea
                          value={email.payload.body.data}
                          onChange={(e) => updateEmailField(email.id, 'body', e.target.value)}
                          placeholder="Email content..."
                          className="w-full mt-1 p-2 text-sm border rounded-md resize-none h-20 bg-background"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Calendar Editor */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">📅 Calendar Events ({calendar.length})</h3>
                <Button size="sm" onClick={addCalendarEvent}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Event
                </Button>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {calendar.map((event, index) => (
                  <Card key={event.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Event {index + 1}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => removeCalendarEvent(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Title</label>
                          <Input
                            value={event.summary}
                            onChange={(e) => updateCalendarEvent(event.id, 'title', e.target.value)}
                            placeholder="Meeting title"
                            className="text-sm"
                          />
                        </div>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Hours</label>
                            <Input
                              type="text"
                              value={editingValues[event.id]?.hours ?? getEventHours(event)}
                              onChange={(e) => updateCalendarEvent(event.id, 'hours', e.target.value)}
                              onBlur={() => applyTimeChange(event.id, 'hours')}
                              placeholder="14"
                              className="text-sm font-mono text-center"
                              maxLength={2}
                            />
                          </div>
                          <div className="text-lg font-bold text-slate-500 pb-1">:</div>
                          <div className="flex-1">
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Minutes</label>
                            <Input
                              type="text"
                              value={editingValues[event.id]?.minutes ?? getEventMinutes(event)}
                              onChange={(e) => updateCalendarEvent(event.id, 'minutes', e.target.value)}
                              onBlur={() => applyTimeChange(event.id, 'minutes')}
                              placeholder="30"
                              className="text-sm font-mono text-center"
                              maxLength={2}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={saveChanges} className="flex-1">
                Save & Close
              </Button>
              <Button variant="outline" onClick={resetToDefault}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset to Default
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
