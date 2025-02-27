import * as React from 'react';
import { Tool, ToolExecutionResponse, ToolsContext } from '@/types/chat';
import { IpcChannels, ToolsConfig } from '@/types/electron';

/**
 * Hook for managing tools state and execution
 */
export function useTools(): ToolsContext {
  const [tools, setTools] = React.useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = React.useState<Tool | null>(null);

  // Load tools configuration
  React.useEffect(() => {
    const loadTools = async () => {
      try {
        const config = await window.electron.invoke<ToolsConfig>(IpcChannels.GET_TOOLS_CONFIG);
        setTools(config.tools);
      } catch (error) {
        console.error('Failed to load tools configuration:', error);
        setTools([]);
      }
    };

    loadTools();
  }, []);

  const executeToolByName = React.useCallback(
    async (name: string, params: Record<string, unknown>): Promise<ToolExecutionResponse> => {
      try {
        const response = await window.electron.invoke(IpcChannels.EXECUTE_TOOL, {
          tool: name,
          params,
        });

        return response;
      } catch (error) {
        console.error(`Error executing tool ${name}:`, error);
        return {
          error: {
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            code: 'EXECUTION_ERROR',
          },
        };
      }
    },
    []
  );

  const selectTool = React.useCallback((toolId: string) => {
    const tool = tools.find((t) => t.id === toolId);
    setSelectedTool(tool || null);
  }, [tools]);

  const clearSelectedTool = React.useCallback(() => {
    setSelectedTool(null);
  }, []);

  return {
    tools,
    selectedTool,
    executeToolByName,
    selectTool,
    clearSelectedTool,
  };
} 