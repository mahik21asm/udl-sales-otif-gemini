import { SalesRecord, DayData } from '../types';

export const SAMPLE_RAW: SalesRecord[] = [
  // April 2026 Data
  { plant: 'INFA', customer: 'Reliance Industries Ltd', segment: 'Industrial', invoiceType: 'Domestic Invoice', salesLacs: 45.2, quantity: 1200, onTime: 1, failure: 0, productType: 'Produ', orderType: 'SCH', billingDate: '2026-04-01', material: 'Steel Coil A', accountManager: 'Amit Sharma' },
  { plant: 'INFB', customer: 'Tata Motors', segment: 'Automotive', invoiceType: 'Domestic Invoice', salesLacs: 32.8, quantity: 800, onTime: 0, failure: 1, productType: 'Produ', orderType: 'PO', billingDate: '2026-04-02', material: 'Chassis Part X', accountManager: 'Rahul Verma' },
  { plant: 'INFA', customer: 'Samsung Electronics', segment: 'Tech', invoiceType: 'Export Invoice', salesLacs: 88.5, quantity: 2500, onTime: 1, failure: 0, productType: 'NPD', orderType: 'SCH', billingDate: '2026-04-05', material: 'Memory Module V', accountManager: 'Sumit Gupta' },
  { plant: 'INFB', customer: 'Adani Group', segment: 'Energy', invoiceType: 'Domestic Invoice', salesLacs: 56.0, quantity: 1500, onTime: 1, failure: 0, productType: 'Produ', orderType: 'IU', billingDate: '2026-04-10', material: 'Turbine Blade', accountManager: 'Priya Rai' },
  { plant: 'INFA', customer: 'Larsen & Toubro', segment: 'Construction', invoiceType: 'Domestic Invoice', salesLacs: 22.4, quantity: 600, onTime: 1, failure: 0, productType: 'Produ', orderType: 'PO', billingDate: '2026-04-15', material: 'Girders', accountManager: 'Deepak Singh' },
  { plant: 'INFB', customer: 'Wipro', segment: 'Tech', invoiceType: 'Domestic Invoice', salesLacs: 12.5, quantity: 300, onTime: 0, failure: 1, productType: 'Produ', orderType: 'SCH', billingDate: '2026-04-20', material: 'Server Rack', accountManager: 'Sumit Gupta' },
  { plant: 'INFA', customer: 'ITC Limited', segment: 'Consumer', invoiceType: 'Domestic Invoice', salesLacs: 67.2, quantity: 1800, onTime: 1, failure: 0, productType: 'Produ', orderType: 'PO', billingDate: '2026-04-25', material: 'Packaging Roll', accountManager: 'Amit Sharma' },
  // April 28 Data - The missing ones
  { plant: 'INFA', customer: 'Maruti Suzuki', segment: 'Automotive', invoiceType: 'Domestic Invoice', salesLacs: 42.1, quantity: 1100, onTime: 1, failure: 0, productType: 'Produ', orderType: 'SCH', billingDate: '2026-04-28', material: 'Sheet Metal', accountManager: 'Rahul Verma' },
  { plant: 'INFB', customer: 'Mahindra & Mahindra', segment: 'Automotive', invoiceType: 'Domestic Invoice', salesLacs: 35.5, quantity: 950, onTime: 1, failure: 0, productType: 'Produ', orderType: 'PO', billingDate: '2026-04-28', material: 'Axle Unit', accountManager: 'Priya Rai' },
  { plant: 'INFA', customer: 'Godrej', segment: 'Consumer', invoiceType: 'Domestic Invoice', salesLacs: 15.8, quantity: 450, onTime: 0, failure: 1, productType: 'NPD', orderType: 'IU', billingDate: '2026-04-28', material: 'Appliance Panel', accountManager: 'Deepak Singh' },
  { plant: 'INFA', customer: 'Hero MotoCorp', segment: 'Automotive', invoiceType: 'Domestic Invoice', salesLacs: 28.3, quantity: 700, onTime: 1, failure: 0, productType: 'Produ', orderType: 'SCH', billingDate: '2026-04-28', material: 'Frame Joint', accountManager: 'Amit Sharma' },
  // April 29 Data - Adding more entries to ensure visibility
  { plant: 'INFA', customer: 'Reliance Industries Ltd', segment: 'Industrial', invoiceType: 'Domestic Invoice', salesLacs: 55.4, quantity: 1400, onTime: 1, failure: 0, productType: 'Produ', orderType: 'PO', billingDate: '2026-04-29', material: 'Steel Plate B', accountManager: 'Amit Sharma' },
  { plant: 'INFB', customer: 'Toyota', segment: 'Automotive', invoiceType: 'Domestic Invoice', salesLacs: 45.1, quantity: 1200, onTime: 1, failure: 0, productType: 'Produ', orderType: 'SCH', billingDate: '2026-04-29', material: 'Engine Block', accountManager: 'Rahul Verma' },
  { plant: 'INFA', customer: 'Apple', segment: 'Tech', invoiceType: 'Export Invoice', salesLacs: 120.5, quantity: 3000, onTime: 1, failure: 0, productType: 'Produ', orderType: 'PO', billingDate: '2026-04-29', material: 'Enclosure G', accountManager: 'Sumit Gupta' }
];

export const SAMPLE_DAYS_RAW: DayData[] = []; // Not used directly if useDashboardData calculates days
