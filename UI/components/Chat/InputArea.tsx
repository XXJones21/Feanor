import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "../Common/Button"
import { Textarea } from "../Common/Form/Textarea"
import { Attachment as AttachmentType } from "@/types/chat"

/**
 * Internal attachment state type
 */
interface AttachmentState {
  id: string;
  file: File;
  previewUrl?: string;
}

/**
 * Props for the InputArea component
 */
export interface InputAreaProps {
  onSend: (content: string, attachments?: File[]) => Promise<void>;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  maxAttachments?: number;
}

export function InputArea({
  onSend,
  isLoading,
  placeholder = "Type a message...",
  className,
  maxAttachments = 5,
}: InputAreaProps) {
  const [content, setContent] = React.useState("");
  const [attachments, setAttachments] = React.useState<AttachmentState[]>([]);
  const [isAttaching, setIsAttaching] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() || attachments.length > 0) {
      try {
        await onSend(
          content,
          attachments.map((a) => a.file)
        );
        setContent("");
        setAttachments([]);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (attachments.length + files.length > maxAttachments) {
      // Show error toast or message
      return
    }

    setIsAttaching(true)
    const newAttachments = await Promise.all(
      files.map(async (file) => {
        const attachment: AttachmentState = {
          id: Math.random().toString(36).slice(2),
          file,
        }

        if (file.type.startsWith("image/")) {
          attachment.previewUrl = URL.createObjectURL(file)
        }

        return attachment
      })
    )

    setAttachments((prev) => [...prev, ...newAttachments])
    setIsAttaching(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id)
      if (attachment?.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl)
      }
      return prev.filter((a) => a.id !== id)
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "p-4 border-t transition-transform duration-200",
        isLoading && "opacity-80",
        className
      )}
    >
      {attachments.length > 0 && (
        <div
          className={cn(
            "flex gap-2 mb-4 overflow-x-auto pb-2 transition-all duration-200",
            isAttaching ? "opacity-50" : "opacity-100"
          )}
        >
          {attachments.map((attachment, index) => (
            <div
              key={attachment.id}
              className={cn(
                "relative flex-shrink-0 group transition-all duration-200",
                "animate-scale-in",
                { "delay-100": index > 0 }
              )}
            >
              {attachment.previewUrl ? (
                <img
                  src={attachment.previewUrl}
                  alt={attachment.file.name}
                  className="h-20 w-20 object-cover rounded-md"
                />
              ) : (
                <div className="h-20 w-20 flex items-center justify-center bg-muted rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
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
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                className={cn(
                  "absolute -top-2 -right-2 h-6 w-6",
                  "bg-destructive text-destructive-foreground rounded-full",
                  "flex items-center justify-center",
                  "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100",
                  "transition-all duration-200"
                )}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "min-h-[60px] max-h-[200px] transition-all duration-200",
            isLoading && "opacity-50"
          )}
          disabled={isLoading}
        />
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || attachments.length >= maxAttachments}
            className={cn(
              "h-10 w-10 p-0 transition-all duration-200",
              isAttaching && "animate-pulse"
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-200 hover:scale-110"
            >
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </Button>
          <Button
            type="submit"
            disabled={isLoading || (!content.trim() && attachments.length === 0)}
            className="h-10 w-10 p-0 transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-200 hover:scale-110"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </Button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={handleFileSelect}
      />
    </form>
  )
} 