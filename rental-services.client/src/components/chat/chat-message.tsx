import type { ChatMessage as ChatMessageType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User, ShieldCheck, HelpCircle } from 'lucide-react'; // Added ShieldCheck for staff

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  const isAI = message.sender === 'ai';
  const isStaff = message.sender === 'staff';
  const isSystem = message.sender === 'system'; // For system messages like mode switch

  const getSenderName = () => {
    if (isUser) return "You";
    if (isAI) return "AI Assistant";
    if (isStaff) return "Staff Support";
    if (isSystem) return "System";
    return "Unknown";
  }

  return (
    <div className={cn(
      "flex items-end space-x-3 py-3",
      isUser ? "justify-end" : "justify-start",
      isSystem && "justify-center" // Center system messages
    )}>
      {!isUser && !isSystem && (
        <Avatar className="h-8 w-8">
          {/* <AvatarImage src={isAI ? "/ai-avatar.png" : isStaff ? "/staff-avatar.png" : undefined} /> */}
          <AvatarFallback className={cn(
            "text-sm",
            isAI && "bg-primary text-primary-foreground",
            isStaff && "bg-green-600 text-white" 
          )}>
            {isAI ? <Bot size={18} /> : isStaff ? <ShieldCheck size={18} /> : <HelpCircle size={18}/>}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn(
        "max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow",
        isUser ? "bg-primary text-primary-foreground rounded-br-none" 
               : isSystem ? "bg-muted text-muted-foreground text-center text-xs italic" 
                          : "bg-card text-card-foreground rounded-bl-none"
      )}>
        {!isSystem && !isUser && (
          <p className="text-xs font-semibold mb-0.5 text-muted-foreground">{getSenderName()}</p>
        )}
        <p className={cn("text-sm whitespace-pre-wrap", isSystem && "text-center")}>{message.text}</p>
        {!isSystem && (
          <p className={cn(
            "text-xs mt-1",
            isUser ? "text-primary-foreground/70 text-right" : "text-muted-foreground text-left"
          )}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8">
          {/* <AvatarImage src="/user-avatar.png" /> */}
          <AvatarFallback className="bg-accent text-accent-foreground text-sm">
            <User size={18} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
