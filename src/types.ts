export type Plant = 'INFA' | 'INFB';

export interface SalesRecord {
  plant: string;
  customer: string;
  segment: string;
  invoiceType: string;
  salesLacs: number;
  quantity: number;
  onTime: number;
  failure: number;
  productType: string;
  orderType: string;
  billingDate: string;
  material: string;
  accountManager: string;
}

export interface DayData {
  d: string;
  infa: number;
  infb: number;
  ts?: number;
}

export interface AggregatedData {
  plant: string;
  customer: string;
  segment: string;
  accMgr: string;
  invType: string;
  sales: number;
  qty: number;
  onTime: number;
  fail: number;
  otif: number | null;
}
