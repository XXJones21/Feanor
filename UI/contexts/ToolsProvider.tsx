import * as React from 'react';
import type { ToolsContext as ToolsContextType } from '@/types/chat';
import { useTools } from '@/hooks/useTools';

const ToolsContext = React.createContext<ToolsContextType | null>(null);

/**
 * Hook to use the tools context
 */
export function useToolsContext(): ToolsContextType {
  const context = React.useContext(ToolsContext);
  if (!context) {
    throw new Error('useToolsContext must be used within a ToolsProvider');
  }
  return context;
}

interface ToolsProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for tools functionality
 */
export function ToolsProvider({ children }: ToolsProviderProps) {
  const toolsContext = useTools();

  return (
    <ToolsContext.Provider value={toolsContext}>
      {children}
    </ToolsContext.Provider>
  );
} 