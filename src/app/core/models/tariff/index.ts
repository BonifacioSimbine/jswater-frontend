export interface TariffResponse {
  id: string;
  pricePerCubicMeter: number;
  validFrom: string; // yyyy-MM or date
  validTo?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface RegisterTariffRequest {
  pricePerCubicMeter: number;
  validFrom: string;
}

export interface DeactivateTariffRequest {
  endPeriod: string;
}
