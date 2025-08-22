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

  // Update calendar event
  const updateCalendarEvent = (eventId: string, field: 'title' | 'time' | 'duration', value: string) => {
    setCalendar(prev => prev.map(event => {
      if (event.id !== eventId) return event;
      
      if (field === 'title') {
        return { ...event, summary: value };
      } else if (field === 'time') {
        // Simple time update - just change the hour
        const currentStart = new Date(event.start.dateTime || event.start.date!);
        const [hours, minutes] = value.split(':');
        currentStart.setHours(parseInt(hours), parseInt(minutes));
        const currentEnd = new Date(currentStart.getTime() + 60 * 60 * 1000); // +1 hour default
        
        return {
          ...event,
          start: { dateTime: currentStart.toISOString().slice(0, -1) + '-08:00' },
          end: { dateTime: currentEnd.toISOString().slice(0, -1) + '-08:00' }
        };
      }
      return event;
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
                        <div>
                          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Time</label>
                          <Input
                            type="time"
                            value={new Date(event.start.dateTime || event.start.date!).toLocaleTimeString('en-US', { 
                              hour12: false, 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                            onChange={(e) => updateCalendarEvent(event.id, 'time', e.target.value)}
                            className="text-sm"
                          />
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
