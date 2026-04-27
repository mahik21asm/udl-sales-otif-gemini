import React, { useState } from 'react';
import { AggregatedData } from '../types';
import { cn } from '../lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface DataTableProps {
  data: AggregatedData[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [sortField, setSortField] = useState<keyof AggregatedData>('sales');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof AggregatedData) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const av = a[sortField];
    const bv = b[sortField];
    
    if (av === null) return 1;
    if (bv === null) return -1;
    
    if (av < bv) return sortOrder === 'asc' ? -1 : 1;
    if (av > bv) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const headers: { label: string; field: keyof AggregatedData; align?: 'left' | 'right' | 'center' }[] = [
    { label: 'Plant', field: 'plant' },
    { label: 'Customer', field: 'customer' },
    { label: 'Segment', field: 'segment' },
    { label: 'AM / Rep', field: 'accMgr' },
    { label: 'Type', field: 'invType' },
    { label: 'Sales ₹L', field: 'sales', align: 'right' },
    { label: 'Qty', field: 'qty', align: 'right' },
    { label: 'OTIF %', field: 'otif' },
    { label: 'On-Time', field: 'onTime', align: 'right' },
    { label: 'Failure', field: 'fail', align: 'right' },
  ];

  const getInvTypeClass = (type: string) => {
    switch (type) {
      case 'Domestic Invoice': return 'bg-sky-50 dark:bg-sky-900/20 text-sky-500 dark:text-sky-400 border border-sky-100 dark:border-sky-800';
      case 'Export Invoice': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800';
      case 'STO Invoice(Proforma)': return 'bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400 border border-purple-100 dark:border-purple-800';
      case 'Ret. Ord. Credit memo': return 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-800';
      default: return 'bg-sky-50 dark:bg-sky-800/20 text-sky-500 dark:text-sky-400';
    }
  };

  const getInvTypeLabel = (type: string) => {
    switch (type) {
      case 'Domestic Invoice': return 'DOM';
      case 'Export Invoice': return 'EXP';
      case 'STO Invoice(Proforma)': return 'STO';
      case 'Ret. Ord. Credit memo': return 'CR';
      default: return type.substring(0, 3).toUpperCase();
    }
  };

  return (
    <div className="bg-card-bg dark:bg-card-bg-dark rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-800 overflow-hidden p-6 transition-all duration-300 hover:shadow-md">
      <div className="mb-8 flex flex-col gap-1">
        <h3 className="text-[13px] font-black text-primary-text dark:text-primary-text-dark tracking-tight uppercase">Customer-wise Sales & OTIF Detail</h3>
        <p className="text-[10px] text-secondary-text dark:text-secondary-text-dark font-bold uppercase tracking-widest opacity-80 decoration-indigo-500/30 line-through-none">
          Click column headers to sort | All values in ₹ Lacs
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-page-bg/50 dark:bg-page-bg-dark/50 border-b border-slate-100 dark:border-slate-800">
              {headers.map((header) => (
                <th
                  key={header.field}
                  onClick={() => handleSort(header.field)}
                  className={cn(
                    "px-4 py-3.5 text-left text-[9px] uppercase font-black text-secondary-text dark:text-secondary-text-dark tracking-[0.15em] cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800 hover:text-primary-accent dark:hover:text-primary-accent-dark transition-all select-none group",
                    header.align === 'right' ? 'text-right' : ''
                  )}
                >
                  <div className={cn("flex items-center gap-1.5", header.align === 'right' ? 'justify-end' : '')}>
                    {header.label}
                    <div className={cn("transition-all", sortField === header.field ? "text-primary-accent dark:text-primary-accent-dark scale-110" : "opacity-0 group-hover:opacity-50")}>
                      {sortOrder === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {sortedData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-all group">
                <td className="px-4 py-3.5">
                  <span className={cn(
                    "inline-block px-2 py-0.5 rounded-md text-[9px] font-black tracking-tight",
                    row.plant === 'INFA' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30' : 'bg-pink-50 dark:bg-pink-900/20 text-pink-500 dark:text-pink-400 border border-pink-100 dark:border-pink-900/30'
                  )}>
                    {row.plant}
                  </span>
                </td>
                <td className="px-4 py-3.5 max-w-[220px] truncate font-bold text-primary-text dark:text-primary-text-dark group-hover:text-primary-accent dark:group-hover:text-primary-accent-dark transition-colors">
                  {row.customer}
                </td>
                <td className="px-4 py-3.5 text-secondary-text dark:text-secondary-text-dark font-medium italic opacity-80">
                  {row.segment || '—'}
                </td>
                <td className="px-4 py-3.5 text-secondary-text dark:text-secondary-text-dark font-bold uppercase text-[10px]">
                  {row.accMgr || 'Unassigned'}
                </td>
                <td className="px-4 py-3.5">
                  <span className={cn("inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight", getInvTypeClass(row.invType))}>
                    {getInvTypeLabel(row.invType)}
                  </span>
                </td>
                <td className={cn("px-4 py-3.5 font-black text-sm tabular-nums", row.sales >= 0 ? 'text-primary-text dark:text-primary-text-dark' : 'text-danger', "text-right")}>
                  ₹ {row.sales.toFixed(2)}
                </td>
                <td className="px-4 py-3.5 text-right text-secondary-text dark:text-secondary-text-dark font-bold tabular-nums">
                  {row.qty.toLocaleString()}
                </td>
                <td className="px-4 py-3.5 min-w-[140px]">
                  {row.otif !== null ? (
                    <div className="flex items-center gap-3">
                      <span className={cn("font-black min-w-[32px] text-[10px] tabular-nums", 
                        row.otif >= 85 ? 'text-emerald-500' : row.otif >= 70 ? 'text-amber-500' : 'text-rose-500'
                      )}>
                        {row.otif}%
                      </span>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-700 ease-out", 
                            row.otif >= 85 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : row.otif >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                          )}
                          style={{ width: `${row.otif}%` }}
                        />
                      </div>
                    </div>
                  ) : <span className="text-slate-300 dark:text-slate-700 font-medium italic">—</span>}
                </td>
                <td className="px-4 py-3.5 text-right text-emerald-600 dark:text-emerald-500 font-black tabular-nums">
                  {row.onTime}
                </td>
                <td className={cn("px-4 py-3.5 text-right font-black tabular-nums", row.fail > 0 ? 'text-rose-500 opacity-100 dark:text-rose-400' : 'text-slate-300 dark:text-slate-700 opacity-40')}>
                  {row.fail}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
