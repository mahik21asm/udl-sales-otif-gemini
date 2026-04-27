import React from 'react';
import { motion } from 'motion/react';
import { cn, formatNumber } from '../lib/utils';

interface KPIProps {
  label: string;
  value: string | number;
  subValue: string;
  type: 'total' | 'infa' | 'infb' | 'otif' | 'warn' | 'cust';
  delta?: number;
}

const KPI_STYLES = {
  total: 'border-primary-accent/30 text-primary-accent bg-primary-accent/5 dark:bg-primary-accent-dark/20 dark:text-primary-accent-dark dark:border-primary-accent-dark/30',
  infa: 'border-blue-300/30 text-blue-500 bg-blue-50/50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-500/30',
  infb: 'border-pink-300/30 text-pink-500 bg-pink-50/50 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-500/30',
  otif: 'border-success/30 text-success bg-success/5 dark:bg-success/10 dark:text-success dark:border-success/30',
  warn: 'border-danger/30 text-danger bg-danger/5 dark:bg-danger/10 dark:text-danger dark:border-danger/30',
  cust: 'border-purple-300/30 text-purple-500 bg-purple-50/50 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-500/30',
};

const KPICard: React.FC<KPIProps> = ({ label, value, subValue, type, delta }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'bg-card-bg dark:bg-card-bg-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-lg hover:shadow-primary-accent/5 hover:translate-y-[-2px]',
      )}
    >
      <div className="flex items-center justify-between mb-3 min-h-[20px]">
        <div className="text-[10px] text-secondary-text dark:text-secondary-text-dark font-extrabold uppercase tracking-widest italic opacity-70">
          {label}
        </div>
        {delta !== undefined && delta !== 0 && (
          <div className={cn(
            "text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5",
            delta > 0 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
          )}>
            {delta > 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-black text-primary-text dark:text-primary-text-dark leading-tight tracking-tight">
        {value}
      </div>
      <div className="text-[11px] text-secondary-text dark:text-secondary-text-dark mt-2 font-bold flex items-center gap-1.5 uppercase tracking-wide">
        <span className={cn("px-1.5 py-0.5 rounded-md text-[9px] font-black", KPI_STYLES[type])}>
          STAT
        </span>
        {subValue}
      </div>
    </motion.div>
  );
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
  deltas
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <KPICard
        type="total"
        label="Total Sales Value"
        value={`₹ ${formatNumber(totalSales)}`}
        subValue="₹ Lacs"
        delta={deltas?.sales}
      />
      <KPICard
        type="infa"
        label="INFA — UDL Nashik"
        value={`₹ ${formatNumber(infaSales)}`}
        subValue={`${totalSales > 0 ? ((infaSales / totalSales) * 100).toFixed(1) : 0}% of total`}
      />
      <KPICard
        type="infb"
        label="INFB — Maneck Nagar"
        value={`₹ ${formatNumber(infbSales)}`}
        subValue={`${totalSales > 0 ? ((infbSales / totalSales) * 100).toFixed(1) : 0}% of total`}
      />
      <KPICard
        type="otif"
        label="Overall OTIF %"
        value={otifPct}
        subValue={`${onTimeCount} on-time / ${totalDeliveries}`}
        delta={deltas?.otif}
      />
      <KPICard
        type="warn"
        label="OTIF Failures"
        value={failures}
        subValue={`${totalDeliveries > 0 ? ((failures / totalDeliveries) * 100).toFixed(1) : 0}% failure rate`}
        delta={deltas?.failures}
      />
      <KPICard
        type="cust"
        label="Customers Billed"
        value={customers}
        subValue="Distinct sold-to parties"
      />
    </div>
  );
};

export default KPISection;
