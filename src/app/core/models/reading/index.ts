export interface ReadingResponse {
  id: string;
  meterId: string;
  meterSerialNumber?: string; // Hydrated in frontend
  readingValue?: number;
  value?: number; // Potential backend alias
  consumption?: number; // Potential backend alias
  readingDate: string;
}

export interface RegisterReadingRequest {
  meterId: string;
  currentReading: number;
}
