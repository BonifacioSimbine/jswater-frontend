export interface DashboardKpi {
  key: string;
  label: string;
  value: number;
  icon?: string;
  chipText?: string;
  chipType?: 'success' | 'neutral' | 'warning' | string;
}

export interface DashboardRecentReading {
  id: string;
  clientName: string;
  meterNumber: string;
  consumptionM3: number;
  readingDate: string; // ISO date
  status: string;
}

export interface DashboardAlertItem {
  type: 'warning' | 'info' | string;
  title: string;
  message: string;
}


export interface DashboardResponse {
  month: string;
  kpis?: DashboardKpi[];
  recentReadings?: DashboardRecentReading[];
  alerts?: DashboardAlertItem[];
  
  [key: string]: any;
}
