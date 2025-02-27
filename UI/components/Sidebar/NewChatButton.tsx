import * as React from "react"
import { Button } from "../Common/Button"
import { cn } from "@/lib/utils"

interface NewChatButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isCollapsed?: boolean
}

export function NewChatButton({
  className,
  isCollapsed = false,
  ...props
}: NewChatButtonProps) {
  return (
    <Button
      className={cn(
        "w-full justify-start gap-2",
        isCollapsed && "justify-center",
        className
      )}
      {...props}
    >
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
        <path d="M12 5v14M5 12h14" />
      </svg>
      {!isCollapsed && <span>New Chat</span>}
    </Button>
  )
} 