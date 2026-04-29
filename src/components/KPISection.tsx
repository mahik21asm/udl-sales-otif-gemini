import React from 'react';
import { motion } from 'motion/react';
import { cn, formatNumber } from '../lib/utils';
import { Maximize2 } from 'lucide-react';

interface KPIProps {
  label: string;
  value: string | number;
  subValue: string;
  type: 'total' | 'infa' | 'infb' | 'otif' | 'warn' | 'cust';
  delta?: number;
  onZoom?: () => void;
}

const KPICard: React.FC<KPIProps> = ({ label, value, subValue, type, delta, onZoom }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        'bg-card-bg dark:bg-card-bg-dark rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-xl hover:shadow-primary-accent/5 hover:translate-y-[-2px] relative overflow-hidden group',
      )}
    >
      {/* Technical accent lines */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-slate-50 dark:bg-slate-800/50" />
      <div className={cn(
        "absolute top-0 left-0 h-[3px] transition-all duration-500 group-hover:w-full", 
        KPI_STYLE_BARS[type]
      )} style={{ width: '40px' }} />
      
      <div className="flex items-center justify-between mb-4 min-h-[22px]">
        <div className="flex flex-col gap-0.5">
          <div className="text-[10px] text-secondary-text dark:text-secondary-text-dark font-bold uppercase tracking-[0.12em] opacity-60">
            {label}
          </div>
          <div className="text-[8px] font-mono text-slate-400 opacity-40 italic tracking-tighter">
            SYS_RT_{type.toUpperCase()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {delta !== undefined && delta !== 0 && (
            <div className={cn(
              "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5",
              delta > 0 ? "text-emerald-500 bg-emerald-500/5" : "text-rose-500 bg-rose-500/5"
            )}>
              {delta > 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
            </div>
          )}
          <button 
            onClick={onZoom}
            className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary-accent transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="View Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="text-4xl font-mono font-bold text-primary-text dark:text-primary-text-dark leading-none tracking-tighter mb-4">
        {value}
      </div>

      <div className="text-[10px] text-secondary-text dark:text-secondary-text-dark font-bold flex items-center justify-between uppercase tracking-[0.15em] border-t border-slate-50 dark:border-slate-800/50 pt-3">
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full", KPI_STYLE_DOTS[type])} />
          <span className="opacity-70 group-hover:opacity-100 transition-opacity">
            {subValue}
          </span>
        </div>
      </div>

      {/* Decorative matrix dots */}
      <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-10 transition-opacity">
        <div className="w-0.5 h-0.5 bg-slate-400" />
        <div className="w-0.5 h-0.5 bg-slate-400" />
      </div>
    </motion.div>
  );
};

const KPI_STYLE_BARS = {
  total: 'bg-primary-accent',
  infa: 'bg-blue-500',
  infb: 'bg-pink-500',
  otif: 'bg-success',
  warn: 'bg-danger',
  cust: 'bg-purple-500',
};

const KPI_STYLE_DOTS = {
  total: 'bg-primary-accent shadow-[0_0_8px_rgba(37,99,235,0.5)]',
  infa: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]',
  infb: 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]',
  otif: 'bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]',
  warn: 'bg-danger shadow-[0_0_8px_rgba(220,53,69,0.5)]',
  cust: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]',
};

interface KPISectionProps {
  totalSales: number;
  infaSales: number;
  infbSales: number;
  otifPct: string;
  failures: number;
  customers: number;
  onTimeCount: number;
  totalDeliveries: number;
  deltas?: {
    sales: number;
    otif: number;
    failures: number;
  };
  onZoom: (kpi: any) => void;
}

const KPISection: React.FC<KPISectionProps> = ({
  totalSales,
  infaSales,
  infbSales,
  otifPct,
  failures,
  customers,
  onTimeCount,
  totalDeliveries,
  deltas,
  onZoom
}) => {
  return (
    <div id="kpi-section" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <KPICard
        type="total"
        label="Total Sales Value"
        value={`₹ ${formatNumber(totalSales)}`}
        subValue="₹ Lacs"
        delta={deltas?.sales}
        onZoom={() => onZoom({ type: 'total', label: 'Total Sales Value', value: `₹ ${formatNumber(totalSales)}`, subValue: '₹ Lacs', delta: deltas?.sales })}
      />
      <KPICard
        type="infa"
        label="INFA — UDL Nashik"
        value={`₹ ${formatNumber(infaSales)}`}
        subValue={`${totalSales > 0 ? ((infaSales / totalSales) * 100).toFixed(1) : 0}% of total`}
        onZoom={() => onZoom({ type: 'infa', label: 'INFA — UDL Nashik', value: `₹ ${formatNumber(infaSales)}`, subValue: `${totalSales > 0 ? ((infaSales / totalSales) * 100).toFixed(1) : 0}% of total` })}
      />
      <KPICard
        type="infb"
        label="INFB — Maneck Nagar"
        value={`₹ ${formatNumber(infbSales)}`}
        subValue={`${totalSales > 0 ? ((infbSales / totalSales) * 100).toFixed(1) : 0}% of total`}
        onZoom={() => onZoom({ type: 'infb', label: 'INFB — Maneck Nagar', value: `₹ ${formatNumber(infbSales)}`, subValue: `${totalSales > 0 ? ((infbSales / totalSales) * 100).toFixed(1) : 0}% of total` })}
      />
      <KPICard
        type="otif"
        label="Overall OTIF %"
        value={otifPct}
        subValue={`${onTimeCount} on-time / ${totalDeliveries}`}
        delta={deltas?.otif}
        onZoom={() => onZoom({ type: 'otif', label: 'Overall OTIF %', value: otifPct, subValue: `${onTimeCount} on-time / ${totalDeliveries}`, delta: deltas?.otif })}
      />
      <KPICard
        type="warn"
        label="OTIF Failures"
        value={failures}
        subValue={`${totalDeliveries > 0 ? ((failures / totalDeliveries) * 100).toFixed(1) : 0}% failure rate`}
        delta={deltas?.failures}
        onZoom={() => onZoom({ type: 'warn', label: 'OTIF Failures', value: failures, subValue: `${totalDeliveries > 0 ? ((failures / totalDeliveries) * 100).toFixed(1) : 0}% failure rate`, delta: deltas?.failures })}
      />
      <KPICard
        type="cust"
        label="Customers Billed"
        value={customers}
        subValue="Distinct sold-to parties"
        onZoom={() => onZoom({ type: 'cust', label: 'Customers Billed', value: customers, subValue: 'Distinct sold-to parties' })}
      />
    </div>
  );
};

export default KPISection;
