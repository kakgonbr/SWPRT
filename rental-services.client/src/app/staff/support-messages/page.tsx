
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Textarea removed as reply now happens in chat widget
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessagesSquare, UserCircle, Mail, Clock, Send, Edit2, MessageCircle } from 'lucide-react'; // Changed Send to MessageCircle for opening chat
import { MOCK_ADMIN_SUPPORT_MESSAGES } from '@/lib/mock-data'; 
import type { AdminSupportMessage, AdminSupportMessageStatus, ChatMessage as ChatMessageType } from '@/lib/types'; // Added ChatMessageType
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useChatWidget } from '@/contexts/chat-widget-context'; // Import useChatWidget

export default function StaffSupportMessagesPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<AdminSupportMessage[]>([]);
  const { openChatWidget, setInitialMessagesForWidget } = useChatWidget(); // Get openChatWidget from context

  // replyingTo and replyContent state are no longer needed here
  // const [replyingTo, setReplyingTo] = useState<string | null>(null);
  // const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    const sortedMessages = [...MOCK_ADMIN_SUPPORT_MESSAGES].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setMessages(sortedMessages);
  }, []);

  const handleStatusChange = (messageId: string, newStatus: AdminSupportMessageStatus) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, status: newStatus } : msg
      )
    );
    toast({ title: "Status Updated", description: `Message ${messageId} status changed to ${newStatus}.` });
  };

  const handleStartReplyFlow = (msg: AdminSupportMessage) => {
    // Prepare initial messages for the chat widget based on the selected support message
    const initialChatMessages: ChatMessageType[] = [
      {
        id: `customer-query-${msg.id}`,
        text: `Regarding: "${msg.subject}"\n\n${msg.userName} wrote:\n"${msg.messageContent}"`,
        sender: 'user', // Simulate this as the user's message in the chat context
        timestamp: msg.timestamp,
      },
      {
        id: `system-staff-replying-${Date.now()}`,
        text: `You are now replying to ${msg.userName} (${msg.userEmail}).`,
        sender: 'system',
        timestamp: new Date(),
      }
    ];
    setInitialMessagesForWidget(initialChatMessages);
    openChatWidget(); 
    // Optionally, change status to 'In Progress' if it's 'New'
    if (msg.status === 'New') {
      handleStatusChange(msg.id, 'In Progress');
    }
  };

  // handleSendReply is no longer needed here as reply happens in ChatWidget
  // const handleSendReply = (messageId: string) => { ... }

  const getStatusColor = (status: AdminSupportMessageStatus) => {
    switch (status) {
      case 'New': return 'bg-blue-500';
      case 'In Progress': return 'bg-yellow-500';
      case 'Replied': return 'bg-green-500';
      case 'Resolved': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center">
            <MessagesSquare className="h-7 w-7 mr-2 text-primary" /> Customer Support Queue
          </CardTitle>
          <CardDescription>View and manage incoming customer inquiries. Click "Reply in Chat" to open the chat window.</CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No support messages found.</p>
          ) : (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {messages.map((msg) => (
                <Card key={msg.id} className="bg-card-foreground/5">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg mb-1">{msg.subject}</CardTitle>
                        <div className="flex items-center text-xs text-muted-foreground space-x-3">
                          <span className="flex items-center"><UserCircle className="w-3.5 h-3.5 mr-1" />{msg.userName}</span>
                          <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1" />{msg.userEmail}</span>
                          <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" />{formatDistanceToNow(msg.timestamp, { addSuffix: true })}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant="secondary" className={`text-xs ${getStatusColor(msg.status)} text-white`}>
                          {msg.status}
                        </Badge>
                         <Select
                            value={msg.status}
                            onValueChange={(value) => handleStatusChange(msg.id, value as AdminSupportMessageStatus)}
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                              <SelectValue placeholder="Change status" />
                            </SelectTrigger>
                            <SelectContent>
                              {(['New', 'In Progress', 'Replied', 'Resolved'] as AdminSupportMessageStatus[]).map(s => (
                                <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{msg.messageContent}</p>
                  </CardContent>
                  <CardFooter className="pt-3 flex flex-col items-stretch">
                    {/* Removed inline reply textarea and buttons */}
                    <Button variant="outline" size="sm" onClick={() => handleStartReplyFlow(msg)} className="self-start">
                      <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> Reply in Chat
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
