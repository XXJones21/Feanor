import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "../Common/Button"

interface ChatSession {
  id: string
  title: string
  lastMessage?: string
  timestamp: string
  isActive?: boolean
}

interface ChatGroupProps {
  title: string
  sessions: ChatSession[]
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

interface ChatListProps {
  groups: ChatGroupProps[]
  onSelectSession: (sessionId: string) => void
  activeSessionId?: string
  className?: string
}

function ChatGroup({ title, sessions, isCollapsed, onToggleCollapse }: ChatGroupProps) {
  return (
    <div className="py-2">
      <button
        onClick={onToggleCollapse}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <span>{title}</span>
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
          className={cn(
            "transition-transform",
            isCollapsed ? "-rotate-90" : "rotate-0"
          )}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {!isCollapsed && (
        <div className="space-y-1">
          {sessions.map((session) => (
            <ChatSessionItem key={session.id} {...session} />
          ))}
        </div>
      )}
    </div>
  )
}

function ChatSessionItem({
  id,
  title,
  lastMessage,
  timestamp,
  isActive,
}: ChatSession) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 px-4 py-2 cursor-pointer",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium truncate">{title}</span>
        <span className="text-xs text-muted-foreground">{timestamp}</span>
      </div>
      {lastMessage && (
        <p className="text-sm text-muted-foreground truncate">{lastMessage}</p>
      )}
    </div>
  )
}

export function ChatList({
  groups,
  onSelectSession,
  activeSessionId,
  className,
}: ChatListProps) {
  return (
    <div className={cn("py-2", className)}>
      {groups.map((group, index) => (
        <ChatGroup key={index} {...group} />
      ))}
    </div>
  )
} 