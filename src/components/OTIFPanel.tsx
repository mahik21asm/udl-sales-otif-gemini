import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { cn } from '../lib/utils';

interface OTIFGaugeProps {
  title: string;
  onTime: number;
  fail: number;
  accentColor: string;
}

const OTIFGauge: React.FC<OTIFGaugeProps> = ({ title, onTime, fail, accentColor }) => {
  const total = onTime + fail;
  const pct = total > 0 ? (onTime / total) * 100 : null;
  const statusColor = pct === null ? '#94a3b8' : pct >= 85 ? '#6ee7b7' : pct >= 70 ? '#fcd34d' : '#fda4af';
  const statusClass = pct === null ? 'border-l-slate-300 dark:border-l-slate-700' : pct >= 85 ? 'border-l-emerald-300' : pct >= 70 ? 'border-l-amber-300' : 'border-l-rose-300';
  const pillClass = pct === null ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' : pct >= 85 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : pct >= 70 ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400';
  const pillText = pct === null ? 'No Data' : pct >= 85 ? '✓ ON TRACK' : pct >= 70 ? '⚠ AT RISK' : '✕ CRITICAL';

  const data = total > 0 ? [onTime, fail] : [1];
  const colors = total > 0 ? [statusColor, 'rgba(0,0,0,0.05)'] : ['rgba(0,0,0,0.1)'];

  return (
    <div className={cn("bg-card-bg dark:bg-card-bg-dark rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-800 border-l-4 flex flex-col items-center transition-all duration-300 hover:shadow-md relative overflow-hidden", statusClass)}>
      {pct !== null && (
        <div className="absolute top-0 right-0 p-3 flex flex-col items-end gap-1">
          <div className="text-[9px] font-black text-secondary-text dark:text-secondary-text-dark uppercase tracking-widest opacity-60">Target: 85%</div>
        </div>
      )}
      <div className="w-full mb-6">
        <h4 className="text-[10px] font-black text-secondary-text dark:text-secondary-text-dark uppercase tracking-[0.15em] leading-none opacity-80 italic">{title}</h4>
      </div>
      
      <div className="relative w-44 h-44 flex items-center justify-center">
        <Doughnut 
          data={{
            labels: total > 0 ? ['On-Time', 'Failure'] : ['No Data'],
            datasets: [{
              data,
              backgroundColor: colors,
              borderColor: 'transparent',
              borderWidth: 0,
              hoverOffset: 6
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: '80%',
            plugins: {
              legend: { display: false },
              tooltip: { 
                enabled: total > 0,
                backgroundColor: '#1e293b',
                titleFont: { size: 12, weight: 'bold' },
                padding: 10,
                cornerRadius: 8
              }
            }
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black tracking-tighter" style={{ color: statusColor }}>
            {pct !== null ? `${pct.toFixed(1)}%` : 'N/A'}
          </span>
          {total > 0 && (
            <span className="text-[9px] text-secondary-text dark:text-secondary-text-dark font-black uppercase tracking-widest mt-1 opacity-60">Score</span>
          )}
        </div>
      </div>
 
      <div className="w-full mt-6 flex border-t border-slate-50 dark:border-slate-800 pt-5">
        <div className="flex-1 text-center border-r border-slate-50 dark:border-slate-800 px-1">
          <div className="text-xl font-black text-primary-text dark:text-primary-text-dark leading-none">{onTime}</div>
          <div className="text-[9px] text-secondary-text dark:text-secondary-text-dark font-extrabold uppercase tracking-widest mt-2 italic px-1">On-Time</div>
        </div>
        <div className="flex-1 text-center border-r border-slate-50 dark:border-slate-800 px-1">
          <div className="text-xl font-black text-primary-text dark:text-primary-text-dark leading-none">{fail}</div>
          <div className="text-[9px] text-secondary-text dark:text-secondary-text-dark font-extrabold uppercase tracking-widest mt-2 italic px-1">Failure</div>
        </div>
        <div className="flex-1 text-center px-1">
          <div className="text-xl font-black text-primary-text dark:text-primary-text-dark leading-none">{total}</div>
          <div className="text-[9px] text-secondary-text dark:text-secondary-text-dark font-extrabold uppercase tracking-widest mt-2 italic px-1">Total</div>
        </div>
      </div>

      <div className={cn("mt-6 px-4 py-1 rounded-lg text-[10px] font-black tracking-widest", pillClass)}>
        {pillText}
      </div>
    </div>
  );
};

interface OTIFPanelProps {
  infaOT: number;
  infaFail: number;
  infbOT: number;
  infbFail: number;
  combOT: number;
  combFail: number;
}

const OTIFPanel: React.FC<OTIFPanelProps> = ({ infaOT, infaFail, infbOT, infbFail, combOT, combFail }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <OTIFGauge title="INFA — UDL Nashik" onTime={infaOT} fail={infaFail} accentColor="#1a56db" />
      <OTIFGauge title="INFB — Maneck Nagar" onTime={infbOT} fail={infbFail} accentColor="#e3a008" />
      <OTIFGauge title="Combined — INFA + INFB" onTime={combOT} fail={combFail} accentColor="#6366f1" />
    </div>
  );
};

export default OTIFPanel;
