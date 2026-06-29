import type { ChatMessage } from '@finance-flow/shared-types';
import type { ApiClient } from './client';

export class ChatApi {
  constructor(private client: ApiClient) {}

  sendMessage(message: string): Promise<ChatMessage> {
    return this.client.post<ChatMessage>('/chat', { message });
  }

  getMessages(take?: number): Promise<ChatMessage[]> {
    const query = take ? `?take=${take}` : '';
    return this.client.get<ChatMessage[]>(`/chat${query}`);
  }

  deleteMessage(id: number): Promise<void> {
    return this.client.delete<void>(`/chat/${id}`);
  }
}
