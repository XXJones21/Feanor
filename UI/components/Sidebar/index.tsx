import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "../Common/Button"
import { ChatList } from "./ChatList"
import { NewChatButton } from "./NewChatButton"
import { ToolsList } from "./ToolsList"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  currentChatId: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  className,
  currentChatId,
  onChatSelect,
  onNewChat,
  isCollapsed = false,
  onToggleCollapse,
  ...props
}: SidebarProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col h-screen bg-background border-r transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        "md:relative md:w-auto",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className={cn("font-semibold", isCollapsed && "hidden")}>
          Chat Sessions
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="md:hidden"
        >
          <CollapseIcon isCollapsed={isCollapsed} />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <NewChatButton
            onClick={onNewChat}
            isCollapsed={isCollapsed}
          />
        </div>
        <ChatList
          groups={[]} // TODO: Implement chat history
          onSelectSession={onChatSelect}
          activeSessionId={currentChatId}
          className="mb-4"
        />
        <div className="px-4 py-2 border-t">
          <h3 className={cn("text-sm font-medium text-muted-foreground mb-2", isCollapsed && "hidden")}>
            Tools
          </h3>
          <ToolsList
            onSelectTool={() => {}} // Tool selection is handled by the ToolsList component
            isCollapsed={isCollapsed}
          />
        </div>
      </div>
    </div>
  );
}

function CollapseIcon({ isCollapsed }: { isCollapsed: boolean }) {
  return (
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
      className="transition-transform"
      style={{ transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
} 