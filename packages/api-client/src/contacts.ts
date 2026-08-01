import type { Contact } from '@finance-flow/shared-types';
import type { ApiClient } from './client';

export class ContactsApi {
  constructor(private client: ApiClient) {}

  getAll(params?: Record<string, string | number | undefined>): Promise<Contact[]> {
    return this.client.get<Contact[]>('/contacts', params);
  }

  getById(id: number): Promise<Contact> {
    return this.client.get<Contact>(`/contacts/${id}`);
  }

  sendRequest(dto: { addresseeId: number }): Promise<Contact> {
    return this.client.post<Contact>('/contacts', dto);
  }

  accept(id: number): Promise<Contact> {
    return this.client.patch<Contact>(`/contacts/${id}/accept`);
  }

  reject(id: number): Promise<Contact> {
    return this.client.patch<Contact>(`/contacts/${id}/reject`);
  }

  getPendingSent(): Promise<Contact[]> {
    return this.client.get<Contact[]>('/contacts/pending/sent');
  }

  getPendingReceived(): Promise<Contact[]> {
    return this.client.get<Contact[]>('/contacts/pending/received');
  }

  remove(id: number): Promise<void> {
    return this.client.delete<void>(`/contacts/${id}`);
  }
}
