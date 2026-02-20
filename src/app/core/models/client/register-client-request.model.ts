export interface RegisterClientRequest {
  fullName: string;
  documentType: string;
  documentNumber: string;
  phoneNumber: string;
  // Endereço
  bairro: string;
  localidade: string;
  rua: string;
  numeroCasa?: string;
  referencia?: string;
}
