export type ClientType = 'oseba' | 'podjetje';

export interface Client {
  id: string;
  name: string;
  company: string;
  type: ClientType;
  taxNumber: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  createdAt: string;
  note: string;
}

export interface ClientPayload extends Omit<Client, 'id'> {}
