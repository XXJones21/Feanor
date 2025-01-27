import { Tool } from '../types/chat';

export interface UseToolsReturn {
    tools: Tool[];
    executeToolByName: (name: string, params: Record<string, unknown>) => Promise<unknown>;
}

export function useTools(): UseToolsReturn; 