import * as XLSX from 'xlsx';
import { SalesRecord } from '../types';

export interface ValidationError {
  row?: number;
  column?: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  records: SalesRecord[];
  errors: ValidationError[];
}

const REQUIRED_HEADERS = [
  'Location Code',
  'Sold-To-Party',
  'Sales Value in Lacs',
  'On Time',
  'Failure',
  'Billing Date'
];

export const validateSalesData = (json: any[][]): ValidationResult => {
  const errors: ValidationError[] = [];
  const records: SalesRecord[] = [];

  if (json.length < 2) {
    return { isValid: false, records: [], errors: [{ message: "The uploaded file appears to be empty or missing data." }] };
  }

  // 1. Identify Header Row & Mapping
  let headerIdx = -1;
  for (let i = 0; i < Math.min(json.length, 50); i++) { // Increased range to offset ERP noise
    const row = json[i].map(c => String(c || '').trim().toLowerCase());
    // Look for key columns to identify header row - using includes for partial matches
    const hasLocation = row.some(c => c.includes('location') || c.includes('plant') || c.includes('site') || c.includes('unit') || c.includes('site code'));
    const hasCustomer = row.some(c => c.includes('customer') || c.includes('client') || c.includes('sold-to') || c.includes('party'));
    
    if (hasLocation && hasCustomer) {
      headerIdx = i;
      break;
    }
  }

  if (headerIdx === -1) {
    return { 
      isValid: false, 
      records: [], 
      errors: [{ message: "Required headers not found. Please ensure your Excel file includes columns like 'Plant', 'Customer', 'Value', and 'Date'." }] 
    };
  }

  const headers = json[headerIdx].map(h => String(h || '').trim());
  
  const getCol = (...names: string[]) => {
    // 1st pass: Exact matches (case-insensitive)
    for (const name of names) {
      const idx = headers.findIndex(h => h.toLowerCase() === name.toLowerCase());
      if (idx !== -1) return idx;
    }
    // 2nd pass: Word matches or specific partial matches
    for (const name of names) {
      const idx = headers.findIndex(h => {
        const val = h.toLowerCase();
        const search = name.toLowerCase();
        // If searching for "ot", we want it as a separate word or exact
        if (search === 'ot') {
          return val === 'ot' || val.split(/\s+/).includes('ot');
        }
        return val.includes(search);
      });
      if (idx !== -1) return idx;
    }
    return -1;
  };

  // Check for missing mandatory headers
  const mandatoryCols = [
    { name: 'Location Code', variants: ["Location", "Plant", "Site", "Unit"] },
    { name: 'Customer', variants: ["Customer", "Party", "Client"] },
    { name: 'Sales Value', variants: ["Sales", "Value", "Amount", "Revenue", "Lacs"] },
    { name: 'On Time', variants: ["On Time", "OT", "On-Time"] },
    { name: 'Failure', variants: ["Failure", "Fail", "Variance"] },
    { name: 'Billing Date', variants: ["Date", "Period", "Billing", "Day", "Month"] }
  ];

  const missingHeaders = mandatoryCols.filter(col => getCol(...col.variants) === -1);
  if (missingHeaders.length > 0) {
    return {
      isValid: false,
      records: [],
      errors: [{ message: `Missing required columns: ${missingHeaders.map(h => h.name).join(', ')}` }]
    };
  }

  const COL_MAP = {
    plant: getCol("Location Code", "Plant", "Site", "Unit", "Location"),
    customer: getCol("Sold-To-Party", "Customer Name", "Customer", "Client", "Party"),
    segment: getCol("Segment Description", "Segment", "Sector", "Industry", "SBU"),
    invType: getCol("Invoice description", "Invoice Type", "Doc Type", "Billing Type", "Invoice Type"),
    salesL: getCol("Sales Value in Lacs", "Sales Value", "Value", "Amount", "Revenue", "INR"),
    qty: getCol("Quantity", "Qty", "Volume", "Weight"),
    onTime: getCol("On Time", "OT count", "OT", "On-Time"),
    fail: getCol("Failure", "Fail count", "Failure Count", "Variance", "Delay"),
    prodNPD: getCol("Prod/NPD", "Prod", "Product Type", "Category", "New Product"),
    schPO: getCol("Sch/PO", "Order Type", "Purchase Order", "Sales Order Type"),
    billDate: getCol("Billing Date", "Date", "Invoice Date", "Period", "Billing"),
    material: getCol("Material Description", "Material", "Product", "Item Description", "SKU"),
    accMgr: getCol("Account Manager", "Sales Rep", "Sales Person", "AM", "Owner", "Account Manager")
  };

  // 2. Row-level Validation
  json.slice(headerIdx + 1).forEach((row, idx) => {
    const rowNum = headerIdx + idx + 2; // 1-based index for user feedback
    
    // Skip empty rows
    if (row.every(cell => cell === null || cell === undefined || cell === '')) return;

    const plantRaw = String(row[COL_MAP.plant] || '').trim().toUpperCase();
    let plant: string = 'INFA';
    if (plantRaw.includes('INFB') || plantRaw.includes('B') || plantRaw.includes('MANECK') || plantRaw.includes('UNIT 2')) {
      plant = 'INFB';
    } else if (plantRaw.includes('INFA') || plantRaw.includes('A') || plantRaw.includes('NASHIK') || plantRaw.includes('UNIT 1')) {
      plant = 'INFA';
    }
    
    // Sales Value validation
    let salesVal = parseFloat(String(row[COL_MAP.salesL] || '0').replace(/,/g, ''));
    if (isNaN(salesVal)) salesVal = 0;

    // OTIF Data validation
    const parseNum = (val: any) => {
      if (val === undefined || val === null || val === '') return 0;
      const n = parseInt(String(val).replace(/,/g, ''));
      return isNaN(n) ? 0 : n;
    };
    
    const onTime = parseNum(row[COL_MAP.onTime]);
    const failure = parseNum(row[COL_MAP.fail]);

    // Date validation
    let bDate = row[COL_MAP.billDate];
    let billingDateStr = '';
    
    try {
      if (bDate instanceof Date) {
        billingDateStr = bDate.toISOString().split('T')[0];
      } else if (typeof bDate === 'number') {
        const dt = XLSX.SSF.parse_date_code(bDate);
        billingDateStr = `${dt.y}-${String(dt.m).padStart(2, '0')}-${String(dt.d).padStart(2, '0')}`;
      } else if (bDate) {
        const d = new Date(bDate);
        if (isNaN(d.getTime())) throw new Error("Invalid format");
        billingDateStr = d.toISOString().split('T')[0];
      }
    } catch (e) {
      errors.push({ row: rowNum, column: 'Billing Date', message: 'Invalid date format.', value: bDate });
    }

    if (true) {
      records.push({
        plant,
        customer: String(row[COL_MAP.customer] || '—').trim(),
        segment: String(row[COL_MAP.segment] || 'Other').trim(),
        invoiceType: String(row[COL_MAP.invType] || 'Other').trim(),
        salesLacs: isNaN(salesVal) ? 0 : salesVal,
        quantity: parseInt(String(row[COL_MAP.qty] || 0)) || 0,
        onTime: isNaN(onTime) ? 0 : onTime,
        failure: isNaN(failure) ? 0 : failure,
        productType: String(row[COL_MAP.prodNPD] || 'Produ').trim(),
        orderType: String(row[COL_MAP.schPO] || 'PO').trim(),
        billingDate: billingDateStr || new Date().toISOString().split('T')[0],
        material: String(row[COL_MAP.material] || '').trim(),
        accountManager: String(COL_MAP.accMgr !== -1 ? (row[COL_MAP.accMgr] || 'Unassigned') : 'Unassigned').trim(),
      });
    }
  });

  // Limit errors to first 10 for better UX
  const finalErrors = errors.slice(0, 10);
  if (errors.length > 10) {
    finalErrors.push({ message: `...and ${errors.length - 10} more errors found.` });
  }

  return {
    isValid: records.length > 0,
    records,
    errors: finalErrors
  };
};
