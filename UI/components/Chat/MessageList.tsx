import * as React from "react"
import { cn } from "@/lib/utils"
import { Message as MessageComponent, type MessageProps } from "./Message"
import { Spinner } from "../Common/Loading/Spinner"
import { Message as MessageType } from "@/types/chat"

/**
 * Props for the MessageList component
 */
interface MessageListProps {
  messages: MessageType[]; // Use the base Message type
  isLoading?: boolean;
  onRetry?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  className?: string;
}

export function MessageList({
  messages,
  isLoading,
  onRetry,
  onDelete,
  className,
}: MessageListProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div
      className={cn(
        "flex flex-col flex-1 overflow-y-auto bg-background",
        className
      )}
    >
      <div className="flex-1" />
      <div className="relative">
        {messages.map((message, index) => (
          <MessageComponent
            key={message.id}
            {...message}
            timestamp={formatTimestamp(message.timestamp)}
            isLastMessage={index === messages.length - 1}
            onRetry={message.status === 'error' ? () => onRetry?.(message.id) : undefined}
            onDelete={message.status === 'error' ? () => onDelete?.(message.id) : undefined}
          />
        ))}
        {isLoading && (
          <div className="flex justify-center p-4">
            <Spinner size="sm" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
} 