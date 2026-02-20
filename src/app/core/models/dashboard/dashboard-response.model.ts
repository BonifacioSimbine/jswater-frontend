export interface DashboardResponse {
  totalActiveClients: number;
  totalMeters: number;
  totalPendingInvoices: number;
  totalDebt: number;
  expectedRevenue: number;
  collectedRevenue: number;
  topDebtors: TopDebtor[];
  debtByZone: ZoneDebt[];
}

export interface TopDebtor {
  clientId: string;
  clientName: string;
  totalDebt: number;
}

export interface ZoneDebt {
  zone: string;
  totalDebt: number;
}
