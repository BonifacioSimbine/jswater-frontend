import { ClientStatus } from './client-status.model';

export interface ClientResponse {
  id: string;
  fullName: string;
  document: string;
  phoneNumber?: string;
  status: ClientStatus;
  bairro?: string;
  localidade?: string;
  rua?: string;
  referencia?: string;
}
