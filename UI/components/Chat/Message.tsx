import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "../Common/Card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/Common/Avatar"
import { Button } from "../Common/Button"
import { Message as MessageType, MessageStatus, User, Attachment } from "@/types/chat"

/**
 * Props for the Message component
 * Extends MessageType but converts timestamp to string for display
 */
export interface MessageProps extends Omit<MessageType, 'timestamp'> {
  timestamp: string; // Display format of the timestamp
  isLastMessage?: boolean;
  onRetry?: () => void;
  onDelete?: () => void;
  className?: string;
}

function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"]
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

export function Message({
  content,
  timestamp,
  sender,
  attachments = [], // Provide default empty array
  status,
  error,
  isStreaming,
  isLastMessage,
  onRetry,
  onDelete,
  className
}: MessageProps) {
  const isError = status === "error"
  const isSending = status === "sending"
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={cn(
        "flex gap-3 p-4 transition-all duration-200",
        sender.isBot ? "bg-muted/50" : "bg-background",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <div className="flex gap-4">
        <Avatar className={cn(
          "h-8 w-8 transition-transform duration-200",
          sender.isBot && "bg-primary text-primary-foreground",
          isVisible ? "scale-100" : "scale-0"
        )}>
          <AvatarImage src={sender.avatar} alt={sender.name} />
          <AvatarFallback>{sender.name[0]}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{sender.name}</span>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
          {status && (
            <span
              className={cn(
                "text-xs transition-colors duration-200",
                isError && "text-destructive",
                isSending && "text-muted-foreground animate-pulse"
              )}
            >
              {isError ? "Failed to send" : isSending ? "Sending..." : "Sent"}
            </span>
          )}
        </div>
        <div className="space-y-4">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </p>
          {attachments && attachments.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {attachments.map((attachment, index) => (
                <Card
                  key={attachment.id}
                  className={cn(
                    "overflow-hidden transition-all duration-200",
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4",
                    { "delay-100": index > 0 }
                  )}
                >
                  {attachment.type === "image" ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="aspect-video w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <CardContent className="p-2">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                          <polyline points="13 2 13 9 20 9" />
                        </svg>
                        <div className="flex-1 truncate">
                          <p className="text-sm truncate">{attachment.name}</p>
                          {attachment.size && (
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(attachment.size)}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
        {isError && onRetry && (
          <div
            className={cn(
              "flex items-center gap-2 pt-2 transition-all duration-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="h-auto p-0 text-destructive hover:text-destructive"
            >
              Retry
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 