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
  const statusColor = pct === null ? '#94a3b8' : pct >= 85 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#ef4444';
  const statusClass = pct === null ? 'border-t-slate-300 dark:border-t-slate-700' : pct >= 85 ? 'border-t-emerald-500' : pct >= 70 ? 'border-t-amber-500' : 'border-t-rose-500';
  const pillClass = pct === null ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' : pct >= 85 ? 'bg-emerald-500/10 text-emerald-500' : pct >= 70 ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500';
  const pillText = pct === null ? 'DATA_WAIT' : pct >= 85 ? 'ON_TRACK' : pct >= 70 ? 'AT_RISK' : 'CRITICAL';

  const data = total > 0 ? [onTime, fail] : [1];
  const colors = total > 0 ? [statusColor, 'rgba(0,0,0,0.03)'] : ['rgba(0,0,0,0.05)'];

  return (
    <div className={cn("bg-card-bg dark:bg-card-bg-dark rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200 dark:border-slate-800 border-t-[4px] flex flex-col items-center transition-all duration-300 hover:shadow-xl relative overflow-hidden group", statusClass)}>
      <div className="w-full flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1">
          <h4 className="text-[10px] font-bold text-secondary-text dark:text-secondary-text-dark uppercase tracking-[0.2em] opacity-80">{title}</h4>
          <div className="text-[8px] font-mono text-slate-400 opacity-40 italic tracking-tighter">UDL_OTIF_ENGINE_V2</div>
        </div>
        <div className={cn("px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-widest", pillClass)}>
          {pillText}
        </div>
      </div>
      
      <div className="relative w-40 h-40 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-slate-50 dark:border-slate-800/30" />
        <Doughnut 
          data={{
            labels: total > 0 ? ['On-Time', 'Failure'] : ['No Data'],
            datasets: [{
              data,
              backgroundColor: colors,
              borderColor: 'transparent',
              borderWidth: 0,
              hoverOffset: 0
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: '85%',
            plugins: {
              legend: { display: false },
              tooltip: { enabled: total > 0 }
            }
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-mono font-bold tracking-tighter transition-all duration-500 group-hover:scale-110" style={{ color: statusColor }}>
            {pct !== null ? `${pct.toFixed(1)}%` : '—'}
          </span>
          <span className="text-[8px] text-slate-400 font-mono uppercase tracking-[0.3em] mt-1">OTIF_EFF</span>
        </div>
      </div>
 
      <div className="w-full mt-8 grid grid-cols-3 gap-2 border-t border-slate-50 dark:border-slate-800/50 pt-6">
        <div className="text-center">
          <div className="text-lg font-mono font-bold text-primary-text dark:text-primary-text-dark">{onTime}</div>
          <div className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">SUCCESS</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-mono font-bold text-primary-text dark:text-primary-text-dark">{fail}</div>
          <div className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">FAILURE</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-mono font-bold text-primary-text dark:text-primary-text-dark">{total}</div>
          <div className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">TOTAL</div>
        </div>
      </div>

      {/* Background technical decoration */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-slate-50 dark:bg-slate-800/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
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
