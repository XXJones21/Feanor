import * as React from "react"
import { cn } from "@/lib/utils"
import { Tool } from "@/types/chat"
import { useTools } from "@/hooks/useTools"

interface ToolsListProps {
  onSelectTool: (toolId: string) => void;
  isCollapsed?: boolean;
  className?: string;
}

export function ToolsList({
  onSelectTool,
  isCollapsed = false,
  className,
}: ToolsListProps) {
  const { tools, selectedTool, selectTool } = useTools();

  const handleToolClick = React.useCallback((tool: Tool) => {
    selectTool(tool.id);
    onSelectTool(tool.id);
  }, [selectTool, onSelectTool]);

  return (
    <div className={cn("py-2 space-y-1", className)}>
      {tools.map((tool) => (
        <ToolItem
          key={tool.id}
          tool={tool}
          isCollapsed={isCollapsed}
          isActive={selectedTool?.id === tool.id}
          onClick={() => handleToolClick(tool)}
        />
      ))}
    </div>
  );
}

interface ToolItemProps {
  tool: Tool;
  isCollapsed?: boolean;
  isActive?: boolean;
  onClick: () => void;
}

function ToolItem({
  tool,
  isCollapsed,
  isActive,
  onClick,
}: ToolItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center w-full px-4 py-2 text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground",
        isCollapsed ? "justify-center" : "gap-3"
      )}
    >
      <div className="flex-shrink-0">{tool.icon}</div>
      {!isCollapsed && (
        <div className="flex flex-col items-start text-left">
          <span className="font-medium">{tool.name}</span>
          {tool.description && (
            <span className="text-xs text-muted-foreground">{tool.description}</span>
          )}
        </div>
      )}
    </button>
  );
} 