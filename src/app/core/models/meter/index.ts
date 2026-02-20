export interface MeterResponse {
  id: string;
  meterNumber: string; // Adjusted to match backend property
  clientId: string;
  clientName?: string;
  installationDate?: string;
}

export interface RegisterMeterRequest {
  meterNumber: string;
  clientId: string;
}
