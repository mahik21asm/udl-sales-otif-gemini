import React from 'react';
import { cn } from '../lib/utils';
import { RotateCcw, Moon, Sun, LogIn, User as UserIcon, LogOut } from 'lucide-react';
import { loginWithGoogle, auth } from '../lib/firebase';
import { User, signOut } from 'firebase/auth';

interface FilterGroupProps {
  label: string;
  children: React.ReactNode;
}

const FilterGroup: React.FC<FilterGroupProps> = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] text-secondary-text dark:text-secondary-text-dark uppercase tracking-widest font-semibold">{label}</label>
    {children}
  </div>
);

interface HeaderProps {
  plant: string;
  setPlant: (v: string) => void;
  invType: string;
  setInvType: (v: string) => void;
  segment: string;
  setSegment: (v: string) => void;
  customer: string;
  setCustomer: (v: string) => void;
  accMgr: string;
  setAccMgr: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  segments: string[];
  customers: string[];
  accMgrs: string[];
  isLiveData: boolean;
  dateBounds: { min: string; max: string };
  lastUpdated: string | null;
  onResetFilters: () => void;
  onClearData: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  user: User | null;
  material: string;
  setMaterial: (v: string) => void;
  productType: string;
  setProductType: (v: string) => void;
  orderType: string;
  setOrderType: (v: string) => void;
  isSto: boolean | null;
  setIsSto: (v: boolean | null) => void;
}

const Header: React.FC<HeaderProps> = ({
  plant, setPlant,
  invType, setInvType,
  segment, setSegment,
  customer, setCustomer,
  accMgr, setAccMgr,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  segments,
  customers,
  accMgrs,
  isLiveData,
  dateBounds,
  lastUpdated,
  onResetFilters,
  onClearData,
  darkMode,
  toggleDarkMode,
  user,
  material, setMaterial,
  productType, setProductType,
  orderType, setOrderType,
  isSto, setIsSto
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 print:hidden transition-colors duration-300">
      <div className="bg-card-bg dark:bg-card-bg-dark px-6 py-4 flex flex-wrap justify-between items-center gap-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 bg-primary-accent dark:bg-primary-accent-dark rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-accent/10 dark:shadow-none uppercase font-black text-xs cursor-pointer hover:scale-105 transition-transform"
            onClick={handlePrint}
            title="Print Report"
          >
             DS
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-primary-text dark:text-primary-text-dark tracking-tight flex items-center gap-2">
              UDL Sales & OTIF Dashboard
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                isLiveData ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-primary-accent/10 text-primary-accent dark:bg-primary-accent-dark/30 dark:text-primary-accent-dark"
              )}>
                {isLiveData ? "Live" : "Sample"}
              </span>
            </h1>
            <div className="flex flex-col">
              <p className="text-[11px] text-secondary-text dark:text-secondary-text-dark mt-0.5 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {dateBounds.min || 'Apr 2026'} - {dateBounds.max || 'Apr 2026'}
              </p>
              {lastUpdated && (
                <p className="text-[9px] text-secondary-text dark:text-secondary-text-dark font-bold uppercase tracking-wider mt-0.5 opacity-80">
                  Last Refreshed: {lastUpdated}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-5 items-center">
          <FilterGroup label="Plant">
            <select 
              value={plant} 
              onChange={(e) => setPlant(e.target.value)}
              className="bg-page-bg dark:bg-page-bg-dark border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-primary-text dark:text-primary-text-dark cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all font-medium"
            >
              <option value="ALL">All Plants</option>
              <option value="INFA">INFA — UDL Nashik</option>
              <option value="INFB">INFB — Maneck Nagar</option>
            </select>
          </FilterGroup>

          <FilterGroup label="Invoice Type">
            <select 
              value={invType} 
              onChange={(e) => setInvType(e.target.value)}
              className="bg-page-bg dark:bg-page-bg-dark border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-primary-text dark:text-primary-text-dark cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all font-medium"
            >
              <option value="ALL">All Types</option>
              <option value="Domestic Invoice">Domestic</option>
              <option value="Export Invoice">Export</option>
              <option value="STO Invoice(Proforma)">STO / Proforma</option>
              <option value="Ret. Ord. Credit memo">Credit Memo</option>
            </select>
          </FilterGroup>

          <FilterGroup label="Segment">
            <select 
              value={segment} 
              onChange={(e) => setSegment(e.target.value)}
              className="bg-page-bg dark:bg-page-bg-dark border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-primary-text dark:text-primary-text-dark cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all font-medium min-w-[140px]"
            >
              <option value="ALL">All Segments</option>
              {(segments || []).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </FilterGroup>

          <FilterGroup label="Customer">
            <select 
              value={customer} 
              onChange={(e) => setCustomer(e.target.value)}
              className="bg-page-bg dark:bg-page-bg-dark border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-primary-text dark:text-primary-text-dark cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all font-medium max-w-[150px]"
            >
              <option value="ALL">All Customers</option>
              {(customers || []).map(c => {
                const label = String(c || '');
                return (
                  <option key={c} value={c}>
                    {label.substring(0, 30)}{label.length > 30 ? '...' : ''}
                  </option>
                );
              })}
            </select>
          </FilterGroup>

          <FilterGroup label="AM / Rep">
            <select 
              value={accMgr} 
              onChange={(e) => setAccMgr(e.target.value)}
              className="bg-page-bg dark:bg-page-bg-dark border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-primary-text dark:text-primary-text-dark cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all font-medium max-w-[150px]"
            >
              <option value="ALL">All AMs</option>
              {(accMgrs || []).map(am => <option key={am} value={am}>{am}</option>)}
            </select>
          </FilterGroup>

          <div className="flex gap-3">
            <FilterGroup label="From">
              <input 
                type="date" 
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-page-bg dark:bg-page-bg-dark border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-primary-text dark:text-primary-text-dark cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all font-medium" 
              />
            </FilterGroup>
            <FilterGroup label="To">
              <input 
                type="date" 
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-page-bg dark:bg-page-bg-dark border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-primary-text dark:text-primary-text-dark cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all font-medium" 
              />
            </FilterGroup>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-5">
            <button
              onClick={onResetFilters}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-secondary-text dark:text-secondary-text-dark hover:text-primary-accent dark:hover:text-primary-accent-dark hover:bg-primary-accent/10 dark:hover:bg-primary-accent-dark/20 rounded-lg transition-all border border-transparent hover:border-primary-accent/20 dark:hover:border-primary-accent-dark/30"
              title="Clear all filters"
            >
              <RotateCcw size={14} />
              Reset
            </button>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-page-bg dark:bg-slate-800 text-secondary-text dark:text-secondary-text-dark hover:bg-primary-accent hover:text-white dark:hover:bg-primary-accent-dark transition-all shadow-sm"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-primary-text dark:text-primary-text-dark uppercase tracking-tight">{user.displayName || 'Cloud User'}</span>
                  <div className="flex gap-2">
                    <button onClick={onClearData} className="text-[9px] font-bold text-slate-400 hover:text-danger uppercase transition-colors">Clear DB</button>
                    <button onClick={handleLogout} className="text-[9px] font-bold text-danger uppercase hover:underline">Logout</button>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary-accent/10 dark:bg-primary-accent/20 border border-primary-accent/20 dark:border-primary-accent/30 flex items-center justify-center overflow-hidden">
                  {user.photoURL ? <img src={user.photoURL} alt="User" /> : <UserIcon size={14} className="text-primary-accent dark:text-primary-accent-dark" />}
                </div>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-2 bg-primary-accent hover:opacity-90 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-accent/20 dark:shadow-none transition-all"
              >
                <LogIn size={14} />
                Login to Sync
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Pills (for hidden drill-down filters) */}
      {(material !== 'ALL' || productType !== 'ALL' || orderType !== 'ALL' || isSto !== null) && (
        <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-2 flex flex-wrap gap-2 items-center">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2">Active Drill-down:</span>
          
          {material !== 'ALL' && (
            <button 
              onClick={() => setMaterial('ALL')}
              className="px-2 py-1 bg-primary-accent/10 text-primary-accent dark:bg-primary-accent-dark/20 dark:text-primary-accent-dark rounded-md text-[10px] font-bold flex items-center gap-1.5 hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer"
            >
              Material: {material} <span className="opacity-60">×</span>
            </button>
          )}

          {productType !== 'ALL' && (
            <button 
              onClick={() => setProductType('ALL')}
              className="px-2 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md text-[10px] font-bold flex items-center gap-1.5 hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer"
            >
              Type: {productType === 'Produ' ? 'Production' : productType} <span className="opacity-60">×</span>
            </button>
          )}

          {orderType !== 'ALL' && (
            <button 
              onClick={() => setOrderType('ALL')}
              className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md text-[10px] font-bold flex items-center gap-1.5 hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer"
            >
              Order: {orderType} <span className="opacity-60">×</span>
            </button>
          )}

          {isSto !== null && (
            <button 
              onClick={() => setIsSto(null)}
              className="px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md text-[10px] font-bold flex items-center gap-1.5 hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer"
            >
              Mode: {isSto ? 'STO Only' : 'External Only'} <span className="opacity-60">×</span>
            </button>
          )}
          
          <button 
            onClick={() => { setMaterial('ALL'); setProductType('ALL'); setOrderType('ALL'); setIsSto(null); }}
            className="text-[9px] font-bold text-danger hover:underline ml-2 uppercase"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
