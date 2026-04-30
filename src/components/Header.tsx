import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { RotateCcw, Moon, Sun, LogIn, User as UserIcon, ChevronDown, ChevronUp, Filter, Maximize2, Minimize2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { loginWithGoogle, auth } from '../lib/firebase';
import { UDLLogo } from './UDLLogo';
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
  invTypes: string[];
  materials: string[];
  productTypes: string[];
  orderTypes: string[];
  isLiveData: boolean;
  isLoading: boolean;
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
  concentrateMode: boolean;
  setConcentrateMode: (v: boolean) => void;
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
  invTypes,
  materials,
  productTypes,
  orderTypes,
  isLiveData,
  isLoading,
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
  isSto, setIsSto,
  concentrateMode, setConcentrateMode
}) => {
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  // Sync filtersExpanded with concentrateMode for initial toggle
  const toggleConcentrate = () => {
    const next = !concentrateMode;
    setConcentrateMode(next);
    if (next) setFiltersExpanded(false);
    else setFiltersExpanded(true);
  };

  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false));
      }
    }
  };

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
    <div id="dashboard-header" className="flex flex-col border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 print:hidden transition-all duration-500 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80">
      <div className="px-6 py-4 flex flex-wrap justify-between items-center gap-4 relative">
        {/* Technical Top Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-accent/30 to-transparent" />
        
        <div className="flex items-center gap-5">
          <div 
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 hover:shadow-primary-accent/10 transition-all duration-300 active:scale-95 border border-slate-100 p-2.5"
            onClick={() => window.location.reload()}
            title="Reload Dashboard"
          >
             <UDLLogo className="h-full w-auto" hideText />
          </div>
          
          <div className={cn("transition-all duration-500 origin-left flex items-center gap-4", concentrateMode ? "opacity-30 scale-95 grayscale" : "opacity-100 scale-100")}>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tighter uppercase">Intelligent Dashboard</h1>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-widest",
                isLiveData 
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
              )}>
                {isLiveData ? "LIVE DATA" : "DEMO DATA"}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary-accent rounded-full animate-pulse" />
                <p className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-[0.2em]">Nashik & Maneck Nagar Cluster</p>
              </div>
              <p className="text-[9px] text-slate-300 dark:text-slate-600 font-mono tracking-widest">
                {dateBounds.min || '01-04-2026'} <span className="opacity-30">{" >> "}</span> {dateBounds.max || '30-04-2026'}
              </p>
            </div>
          </div>
        </div>
      </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 mr-4 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Current Time</span>
              <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">{new Date().toLocaleTimeString([], { hour12: false })}</span>
            </div>
          </div>

          <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-800/50">
            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl text-slate-400 hover:text-primary-accent hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-95"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={toggleConcentrate}
              className={cn(
                "p-2.5 rounded-xl transition-all active:scale-95",
                concentrateMode ? "text-amber-500 bg-white dark:bg-slate-800 shadow-sm" : "text-slate-400 hover:text-amber-500 hover:bg-white dark:hover:bg-slate-800"
              )}
              title="Focus Mode"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className={cn(
                "p-2.5 rounded-xl transition-all active:scale-95 relative",
                filtersExpanded ? "text-primary-accent bg-white dark:bg-slate-800 shadow-sm" : "text-slate-400 hover:text-primary-accent hover:bg-white dark:hover:bg-slate-800"
              )}
              title="Toggle Filters"
            >
              <Filter size={16} />
              {(plant !== 'ALL' || segment !== 'ALL' || customer !== 'ALL') && !filtersExpanded && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary-accent rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800 ml-1">
             <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary-accent transition-all border border-slate-100 dark:border-slate-800"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">{user.displayName?.split(' ')[0] || 'ADMIN'}</span>
                  <button onClick={handleLogout} className="text-[8px] font-mono font-bold text-danger hover:underline uppercase tracking-widest opacity-60">Logout</button>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-800 shadow-xl overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
                  {user.photoURL ? <img src={user.photoURL} alt="User" /> : <UserIcon size={16} className="m-2 text-slate-400" />}
                </div>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-1px] transition-all flex items-center gap-2"
              >
                <LogIn size={14} /> LOGIN
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {filtersExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-card-bg dark:bg-card-bg-dark"
          >
            <div id="filter-controls" className="px-6 pb-6 pt-2 flex flex-wrap gap-5 items-center bg-card-bg dark:bg-card-bg-dark border-t border-slate-100 dark:border-slate-800/50">
              <FilterGroup label="Plant">
                <select 
                  value={plant} 
                  disabled={isLoading}
                  onChange={(e) => setPlant(e.target.value)}
                  className="bg-page-bg dark:bg-page-bg-dark border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-[11px] text-primary-text dark:text-primary-text-dark cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all font-mono font-bold disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-tighter"
                >
                  <option value="ALL">All Plants</option>
                  <option value="INFA">Nashik (INFA)</option>
                  <option value="INFB">Maneck (INFB)</option>
                </select>
              </FilterGroup>

              <FilterGroup label="Invoice Type">
                <select 
                  value={invType} 
                  disabled={isLoading}
                  onChange={(e) => setInvType(e.target.value)}
                  className="bg-page-bg dark:bg-page-bg-dark border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-[11px] text-primary-text dark:text-primary-text-dark cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all font-mono font-bold disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-tighter"
                >
                  <option value="ALL">All Invoice Types</option>
                  {(invTypes || []).map(t => <option key={t} value={t}>{t.replace(' Invoice', '').toUpperCase()}</option>)}
                </select>
              </FilterGroup>

              <FilterGroup label="Segment">
                <select 
                  value={segment} 
                  disabled={isLoading}
                  onChange={(e) => setSegment(e.target.value)}
                  className="bg-page-bg dark:bg-page-bg-dark border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-[11px] text-primary-text dark:text-primary-text-dark cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all font-mono font-bold min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-tighter"
                >
                  <option value="ALL">All Segments</option>
                  {(segments || []).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </FilterGroup>

              <FilterGroup label="Customer">
                <select 
                  value={customer} 
                  disabled={isLoading}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="bg-page-bg dark:bg-page-bg-dark border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-[11px] text-primary-text dark:text-primary-text-dark cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all font-mono font-bold max-w-[150px] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-tighter"
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

              <FilterGroup label="Account Manager">
                <select 
                  value={accMgr} 
                  disabled={isLoading}
                  onChange={(e) => setAccMgr(e.target.value)}
                  className="bg-page-bg dark:bg-page-bg-dark border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-[11px] text-primary-text dark:text-primary-text-dark cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all font-mono font-bold min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-tighter"
                >
                  <option value="ALL">All Managers</option>
                  {(accMgrs || []).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </FilterGroup>

              <FilterGroup label="Material">
                <select 
                  value={material} 
                  disabled={isLoading}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="bg-page-bg dark:bg-page-bg-dark border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-[11px] text-primary-text dark:text-primary-text-dark cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all font-mono font-bold max-w-[150px] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-tighter"
                >
                  <option value="ALL">All Materials</option>
                  {(materials || []).map(m => <option key={m} value={m}>{String(m).substring(0, 20)}</option>)}
                </select>
              </FilterGroup>

              <FilterGroup label="Product Category">
                <select 
                  value={productType} 
                  disabled={isLoading}
                  onChange={(e) => setProductType(e.target.value)}
                  className="bg-page-bg dark:bg-page-bg-dark border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-[11px] text-primary-text dark:text-primary-text-dark cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all font-mono font-bold disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-tighter"
                >
                  <option value="ALL">All Categories</option>
                  {(productTypes || []).map(t => <option key={t} value={t}>{t === 'Produ' ? 'PRODUCTION' : t.toUpperCase()}</option>)}
                </select>
              </FilterGroup>

              <FilterGroup label="Order Type">
                <select 
                  value={orderType} 
                  disabled={isLoading}
                  onChange={(e) => setOrderType(e.target.value)}
                  className="bg-page-bg dark:bg-page-bg-dark border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-[11px] text-primary-text dark:text-primary-text-dark cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all font-mono font-bold disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-tighter"
                >
                  <option value="ALL">All Orders</option>
                  {(orderTypes || []).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </FilterGroup>

              <FilterGroup label="STO Filter">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 h-[32px]">
                   <button 
                    onClick={() => setIsSto(null)}
                    className={cn("px-3 rounded-md text-[9px] font-bold uppercase transition-all", isSto === null ? "bg-white dark:bg-slate-600 text-primary-accent shadow-sm" : "text-slate-400")}
                  >
                    Both
                  </button>
                  <button 
                    onClick={() => setIsSto(true)}
                    className={cn("px-3 rounded-md text-[9px] font-bold uppercase transition-all", isSto === true ? "bg-white dark:bg-slate-600 text-primary-accent shadow-sm" : "text-slate-400")}
                  >
                    STO
                  </button>
                  <button 
                    onClick={() => setIsSto(false)}
                    className={cn("px-3 rounded-md text-[9px] font-bold uppercase transition-all", isSto === false ? "bg-white dark:bg-slate-600 text-primary-accent shadow-sm" : "text-slate-400")}
                  >
                    Ext
                  </button>
                </div>
              </FilterGroup>

              <div className="flex gap-3">
                <FilterGroup label="Date Range">
                  <div className="flex items-center gap-2">
                    <input 
                      type="date" 
                      value={dateFrom}
                      disabled={isLoading}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="bg-page-bg dark:bg-page-bg-dark border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-[10px] text-primary-text dark:text-primary-text-dark cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-accent transition-all font-mono font-bold disabled:opacity-50" 
                    />
                    <span className="text-slate-300">/</span>
                    <input 
                      type="date" 
                      value={dateTo}
                      disabled={isLoading}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="bg-page-bg dark:bg-page-bg-dark border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-[10px] text-primary-text dark:text-primary-text-dark cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-accent transition-all font-mono font-bold disabled:opacity-50" 
                    />
                  </div>
                </FilterGroup>
              </div>

              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-5">
                <button
                  onClick={onResetFilters}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono font-bold text-secondary-text dark:text-secondary-text-dark hover:text-danger hover:bg-danger/10 rounded-lg transition-all border border-transparent uppercase tracking-widest"
                >
                  <RotateCcw size={12} />
                  RESET FILTERS
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filter Pills (for hidden drill-down or collapsed main filters) */}
      {(plant !== 'ALL' || invType !== 'ALL' || segment !== 'ALL' || customer !== 'ALL' || accMgr !== 'ALL' || material !== 'ALL' || productType !== 'ALL' || orderType !== 'ALL' || isSto !== null) && (
        <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-1.5 flex flex-wrap gap-2 items-center">
          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest mr-2 opacity-50">Applied Filters:</span>
          
          {plant !== 'ALL' && (
            <button 
              onClick={() => setPlant('ALL')}
              className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-primary-text dark:text-primary-text-dark rounded text-[9px] font-mono font-bold flex items-center gap-1.5 hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              PLANT:{plant} <span className="opacity-40">×</span>
            </button>
          )}

          {invType !== 'ALL' && (
            <button 
              onClick={() => setInvType('ALL')}
              className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-primary-text dark:text-primary-text-dark rounded text-[9px] font-mono font-bold flex items-center gap-1.5 hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              TYPE:{invType.substring(0, 3).toUpperCase()} <span className="opacity-40">×</span>
            </button>
          )}

          {segment !== 'ALL' && (
            <button 
              onClick={() => setSegment('ALL')}
              className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-primary-text dark:text-primary-text-dark rounded text-[9px] font-mono font-bold flex items-center gap-1.5 hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              SEG:{segment.substring(0, 10)} <span className="opacity-40">×</span>
            </button>
          )}

          {customer !== 'ALL' && (
            <button 
              onClick={() => setCustomer('ALL')}
              className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-primary-text dark:text-primary-text-dark rounded text-[9px] font-mono font-bold flex items-center gap-1.5 hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              CUST:{customer.substring(0, 10)} <span className="opacity-40">×</span>
            </button>
          )}

          {accMgr !== 'ALL' && (
            <button 
              onClick={() => setAccMgr('ALL')}
              className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-primary-text dark:text-primary-text-dark rounded text-[9px] font-mono font-bold flex items-center gap-1.5 hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              MGR:{accMgr.substring(0, 10)} <span className="opacity-40">×</span>
            </button>
          )}

          {material !== 'ALL' && (
            <button 
              onClick={() => setMaterial('ALL')}
              className="px-2 py-0.5 bg-primary-accent/10 text-primary-accent dark:bg-primary-accent-dark/20 dark:text-primary-accent-dark rounded text-[9px] font-mono font-bold flex items-center gap-1.5 hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer border border-primary-accent/20"
            >
              MAT:{material.substring(0, 10)} <span className="opacity-40">×</span>
            </button>
          )}

          {productType !== 'ALL' && (
            <button 
              onClick={() => setProductType('ALL')}
              className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-primary-text dark:text-primary-text-dark rounded text-[9px] font-mono font-bold flex items-center gap-1.5 hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              PROD:{productType.toUpperCase()} <span className="opacity-40">×</span>
            </button>
          )}

          {orderType !== 'ALL' && (
            <button 
              onClick={() => setOrderType('ALL')}
              className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-primary-text dark:text-primary-text-dark rounded text-[9px] font-mono font-bold flex items-center gap-1.5 hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              ORD:{orderType} <span className="opacity-40">×</span>
            </button>
          )}

          {isSto !== null && (
            <button 
              onClick={() => setIsSto(null)}
              className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-primary-text dark:text-primary-text-dark rounded text-[9px] font-mono font-bold flex items-center gap-1.5 hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              {isSto ? 'STO ONLY' : 'EXT SALES ONLY'} <span className="opacity-40">×</span>
            </button>
          )}
          
          <button 
            onClick={onResetFilters}
            className="text-[8px] font-mono font-bold text-danger hover:underline ml-2 uppercase tracking-widest opacity-60"
          >
            [CLEAR FILTERS]
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
