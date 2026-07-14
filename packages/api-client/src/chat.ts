import type { ChatMessage } from '@finance-flow/shared-types';
import type { ApiClient } from './client';

export class ChatApi {
  constructor(private client: ApiClient) {}

  sendMessage(message: string, timezone?: string): Promise<ChatMessage> {
    return this.client.post<ChatMessage>('/chat', { message, timezone });
  }

  getMessages(take?: number): Promise<ChatMessage[]> {
    return this.client.get<ChatMessage[]>('/chat', take ? { limit: take } : undefined);
  }

  deleteMessage(id: number): Promise<void> {
    return this.client.delete<void>(`/chat/${id}`);
  }
}
