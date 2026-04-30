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
    { label: 'Cluster', field: 'plant' },
    { label: 'Customer Name', field: 'customer' },
    { label: 'Segment', field: 'segment' },
    { label: 'Account Mgr', field: 'accMgr' },
    { label: 'Type', field: 'invType' },
    { label: 'Revenue (₹ Lacs)', field: 'sales', align: 'right' },
    { label: 'Quantity', field: 'qty', align: 'right' },
    { label: 'OTIF Progress', field: 'otif' },
    { label: 'On-Time', field: 'onTime', align: 'right' },
    { label: 'Delayed', field: 'fail', align: 'right' },
  ];

  /* Improved styles for Recipe 1: Technical Dashboard */
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
      default: {
        const label = String(type || '');
        return label.substring(0, 3).toUpperCase();
      }
    }
  };

  const headerClass = "px-4 py-4 text-left font-serif italic text-[11px] uppercase text-secondary-text dark:text-secondary-text-dark tracking-[0.1em] border-r border-slate-100 dark:border-slate-800 last:border-r-0 opacity-50";
  const cellClass = "px-4 py-4 border-r border-slate-50 dark:border-slate-800 last:border-r-0";

  return (
    <div id="data-table" className="bg-card-bg dark:bg-card-bg-dark rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-slate-200 dark:border-slate-800 overflow-hidden p-0 transition-all duration-300 hover:shadow-2xl">
      <div className="p-8 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-primary-text dark:text-primary-text-dark tracking-tighter uppercase mb-1">Sales Records</h3>
        <p className="text-[10px] text-secondary-text dark:text-secondary-text-dark font-mono font-bold uppercase tracking-[0.2em] opacity-40">
          UDL ANALYTICS LAYER &nbsp;•&nbsp; RECORDS_{sortedData.length.toString().padStart(4, '0')}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              {headers.map((header) => (
                <th
                  key={header.field}
                  onClick={() => handleSort(header.field)}
                  className={cn(
                    headerClass,
                    "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none group",
                    header.align === 'right' ? 'text-right' : ''
                  )}
                >
                  <div className={cn("flex items-center gap-2", header.align === 'right' ? 'justify-end' : '')}>
                    {header.label}
                    <div className={cn("transition-all", sortField === header.field ? "text-primary-accent opacity-100" : "opacity-0")}>
                      {sortOrder === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {sortedData.map((row, idx) => (
              <tr key={idx} className="hover:bg-primary-accent/[0.02] transition-colors group border-b border-slate-50 dark:border-slate-900 last:border-b-0">
                <td className={cellClass}>
                  <span className={cn(
                    "inline-block px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-tighter",
                    row.plant === 'INFA' ? 'bg-blue-500/10 text-blue-500' : 'bg-pink-500/10 text-pink-500'
                  )}>
                    {row.plant}
                  </span>
                </td>
                <td className={cn(cellClass, "max-w-[200px] truncate font-bold text-slate-700 dark:text-slate-300")}>
                  {row.customer}
                </td>
                <td className={cn(cellClass, "text-secondary-text dark:text-secondary-text-dark font-mono text-[9px] uppercase tracking-wider opacity-70")}>
                  {row.segment || 'UNDEFINED'}
                </td>
                <td className={cn(cellClass, "text-secondary-text dark:text-secondary-text-dark font-mono text-[9px] uppercase")}>
                  {row.accMgr || 'UNASSIGNED'}
                </td>
                <td className={cellClass}>
                  <span className={cn("inline-block px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-tighter", getInvTypeClass(row.invType))}>
                    {getInvTypeLabel(row.invType)}
                  </span>
                </td>
                <td className={cn(cellClass, "text-right font-mono font-bold tabular-nums")}>
                  {row.sales.toFixed(2)}
                </td>
                <td className={cn(cellClass, "text-right text-slate-400 font-mono tabular-nums")}>
                  {row.qty.toLocaleString()}
                </td>
                <td className={cn(cellClass, "min-w-[150px]")}>
                  {row.otif !== null ? (
                    <div className="flex items-center gap-3">
                      <span className={cn("font-mono font-black min-w-[35px] text-[10px] tabular-nums", 
                        row.otif >= 85 ? 'text-emerald-500' : row.otif >= 70 ? 'text-amber-500' : 'text-rose-500'
                      )}>
                        {row.otif.toFixed(1)}%
                      </span>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800/50 rounded-full h-1 overflow-hidden">
                        <div 
                          className={cn("h-full transition-all duration-1000", 
                            row.otif >= 85 ? 'bg-emerald-500' : row.otif >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                          )}
                          style={{ width: `${row.otif}%` }}
                        />
                      </div>
                    </div>
                  ) : <span className="text-slate-300 dark:text-slate-700 italic">OFFLINE</span>}
                </td>
                <td className={cn(cellClass, "text-right text-emerald-500 font-mono font-bold tabular-nums")}>
                  {row.onTime}
                </td>
                <td className={cn(cellClass, "text-right font-mono font-bold tabular-nums", row.fail > 0 ? 'text-rose-500' : 'text-slate-300 dark:text-slate-800 opacity-20')}>
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
