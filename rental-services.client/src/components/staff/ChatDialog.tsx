import { format } from 'date-fns'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Textarea } from '../ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { ScrollArea } from '../ui/scroll-area'
import { Send, Bot, User } from 'lucide-react'
import { type CustomerMessage } from '../../lib/mock-staff-data'

interface ChatDialogProps {
    isOpen: boolean
    onClose: () => void
    selectedMessage: CustomerMessage | null
    replyText: string
    setReplyText: (text: string) => void
    onSendReply: (messageId: string) => void
}

export default function ChatDialog({
    isOpen,
    onClose,
    selectedMessage,
    replyText,
    setReplyText,
    onSendReply
}: ChatDialogProps) {
    const getPriorityBadgeVariant = (priority: string) => {
        switch (priority) {
            case 'high': return 'destructive'
            case 'medium': return 'default'
            case 'low': return 'secondary'
            default: return 'outline'
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={selectedMessage?.customerAvatar} />
                            <AvatarFallback>
                                {selectedMessage?.customerName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        Conversation with {selectedMessage?.customerName}
                        <Badge variant={getPriorityBadgeVariant(selectedMessage?.priority || 'low')} className="ml-2">
                            {selectedMessage?.priority} priority
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        <strong>Subject:</strong> {selectedMessage?.subject}
                        <br />
                        <strong>Customer:</strong> {selectedMessage?.customerEmail}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col h-[60vh]">
                    {/* Chat History */}
                    <ScrollArea className="flex-1 border rounded-md p-4 mb-4">
                        <div className="space-y-4">
                            {selectedMessage?.conversationHistory.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 ${msg.senderType === 'staff' ? 'flex-row-reverse' : ''}`}
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>
                                            {msg.senderType === 'ai' ? <Bot className="h-4 w-4" /> :
                                                msg.senderType === 'staff' ? <User className="h-4 w-4" /> :
                                                    msg.senderName.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${msg.senderType === 'staff' ? 'bg-primary text-primary-foreground' :
                                        msg.senderType === 'ai' ? 'bg-orange-100 text-orange-900' : 'bg-muted'
                                        } rounded-lg p-3`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium">{msg.senderName}</span>
                                            {msg.senderType === 'ai' && (
                                                <Badge variant="outline" className="text-xs">AI Assistant</Badge>
                                            )}
                                            <span className="text-xs opacity-70">
                                                {format(new Date(msg.timestamp), "MMM d, HH:mm")}
                                            </span>
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Reply Input */}
                    <div className="flex gap-2">
                        <Textarea
                            placeholder="Type your reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="flex-1"
                            rows={3}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault()
                                    if (selectedMessage && replyText.trim()) {
                                        onSendReply(selectedMessage.id)
                                    }
                                }
                            }}
                        />
                        <Button
                            onClick={() => selectedMessage && onSendReply(selectedMessage.id)}
                            disabled={!replyText.trim()}
                            className="self-end"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Tip: Press Ctrl+Enter to send quickly
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}