export interface InvoiceResponse {
  id: string;
  clientId: string;
  clientName?: string; // Often useful
  amount: number;
  totalAmount?: number; // Alias if backend uses this name
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  issueDate: string;
  dueDate: string;
  period: string; // yyyy-MM
  readingId?: string;
  bairro?: string; // Backend property name
  zone?: string; // Bairro/Zone
}

export interface ClientDebtSummaryResponse {
  clientId: string;
  totalOutstanding: number;
  currentMonthAmount: number;
  overdueAmount: number;
  amountToPayNow: number;
  remainingBalance: number;
}

export interface MonthlyBillingReportResponse {
  month: string;
  totalIssued: number;
  totalPaid: number;
  totalPending: number;
}

export interface TopDebtorResponse {
  clientId: string;
  clientName: string;
  totalDebt: number;
}

export interface ZoneDebtResponse {
  zone: string;
  totalDebt: number;
}

export interface GenerateInvoiceRequest {
  readingId: string;
}

export interface BillingDetailResponse {
  clientId: string;
  clientName: string;
  zone: string;
  month: string; // yyyy-MM
  previousReading: number;
  currentReading: number;
  consumption: number;
  invoiceAmount: number;
  outstandingDebt: number;
  fee: number;
  fine: number;
  amountToPay: number;
  difference: number;
}
