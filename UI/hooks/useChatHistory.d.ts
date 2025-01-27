import { Message } from '../types/chat';

export interface UseChatHistoryReturn {
    messages: Message[];
    addMessage: (chatId: string, message: Message) => Promise<void>;
    loadChat: (chatId: string) => void;
    initializeChat: (chatId: string) => void;
}

export function useChatHistory(): UseChatHistoryReturn; 