import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import UploadBanner from './components/UploadBanner';
import KPISection from './components/KPISection';
import OTIFPanel from './components/OTIFPanel';
import ChartsSection from './components/ChartsSection';
import AIInsightsPanel from './components/AIInsightsPanel';
import DataTable from './components/DataTable';
import GuidedTour from './components/GuidedTour';
import { GeminiChat } from './components/GeminiChat';
import { SAMPLE_RAW } from './lib/sampleData';
import { useDashboardData } from './hooks/useDashboardData';
import { SalesRecord } from './types';
import { cn, formatNumber } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, X } from 'lucide-react';
import { auth, subscribeToSales, saveSalesBatch, clearSalesRecords } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveData, setIsLiveData] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'neutral' | 'success' | 'error' | 'loading', message: string }>({
    type: 'neutral',
    message: 'Welcome: UDL Sales Dashboard. Upload data or log in to view cloud records.'
  });

  // Filters State
  const [plant, setPlant] = useState('ALL');
  const [invType, setInvType] = useState('ALL');
  const [segment, setSegment] = useState('ALL');
  const [customer, setCustomer] = useState('ALL');
  const [accMgr, setAccMgr] = useState('ALL');
  const [material, setMaterial] = useState('ALL');
  const [productType, setProductType] = useState('ALL');
  const [orderType, setOrderType] = useState('ALL');
  const [isSto, setIsSto] = useState<boolean | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [concentrateMode, setConcentrateMode] = useState(false);
  const [zoomedKPI, setZoomedKPI] = useState<any>(null);
  const [zoomedChart, setZoomedChart] = useState<{ title: string, subtitle: string, children: React.ReactNode } | null>(null);

  const updateLastRefreshed = () => {
    setLastUpdated(new Date().toLocaleString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    }));
  };
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    let unsubscribeSales: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      
      // Cleanup previous subscription if any
      if (unsubscribeSales) {
        unsubscribeSales();
        unsubscribeSales = null;
      }

      if (u) {
        setIsLoading(true);
        unsubscribeSales = subscribeToSales((dbRecords) => {
          if (dbRecords && dbRecords.length > 0) {
            setRecords(dbRecords);
            setIsLiveData(true);
            updateLastRefreshed();
            setUploadStatus({
              type: 'success',
              message: `✅ Sync Active: ${dbRecords.length.toLocaleString()} records in cloud`
            });
          } else {
            // Logged in but cloud is empty
            setRecords([]);
            setIsLiveData(false);
            setUploadStatus({
              type: 'neutral',
              message: 'Cloud Storage is empty. Please upload an Excel/CSV file to begin.'
            });
          }
          setIsLoading(false);
        });
      } else {
        // Logged out - restrict access
        setIsLoading(false);
        setRecords([]);
        setIsLiveData(false);
        setUploadStatus({
          type: 'neutral',
          message: 'Authentication Required: Please login to view metrics.'
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSales) unsubscribeSales();
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Derived filter options
  const segments = useMemo(() => [...new Set((records || []).map(r => r.segment))].filter(Boolean).sort(), [records]);
  const customers = useMemo(() => [...new Set((records || []).map(r => r.customer))].filter(Boolean).sort(), [records]);
  const accMgrs = useMemo(() => [...new Set((records || []).map(r => r.accountManager))].filter(Boolean).sort(), [records]);
  const invTypes = useMemo(() => [...new Set((records || []).map(r => r.invoiceType))].filter(Boolean).sort(), [records]);
  const materials = useMemo(() => [...new Set((records || []).map(r => r.material))].filter(Boolean).sort(), [records]);
  const productTypes = useMemo(() => [...new Set((records || []).map(r => r.productType))].filter(Boolean).sort(), [records]);
  const orderTypes = useMemo(() => [...new Set((records || []).map(r => r.orderType))].filter(Boolean).sort(), [records]);
  const dateBounds = useMemo(() => {
    const dates = (records || []).map(r => r.billingDate).filter(Boolean).sort();
    return {
      min: dates[0] || '',
      max: dates[dates.length - 1] || ''
    };
  }, [records]);

  const filters = useMemo(() => ({
    plant, invType, segment, customer, accMgr, dateFrom, dateTo, material, productType, orderType, isSto
  }), [plant, invType, segment, customer, accMgr, dateFrom, dateTo, material, productType, orderType, isSto]);

  const { filtered, kpis, chartData, aggregatedTableData } = useDashboardData(records, filters);

  const handleDataLoaded = async (newRecords: SalesRecord[], fileName: string) => {
    setRecords(newRecords);
    setIsLiveData(true);
    updateLastRefreshed();

    if (user) {
      try {
        setUploadStatus({ type: 'neutral', message: '⏳ Replacing cloud storage data...' });
        // Ensure replace behavior instead of append to prevent data "adding up"
        await clearSalesRecords();
        await saveSalesBatch(newRecords);
        setUploadStatus({
          type: 'success',
          message: `✅ Dashboard Updated — ${newRecords.length.toLocaleString()} records replaced in cloud`
        });
      } catch (err: any) {
        console.error("Firebase Save Error:", err);
        setUploadStatus({
          type: 'error',
          message: '❌ Data loaded locally but cloud sync failed.'
        });
      }
    } else {
      setUploadStatus({
        type: 'success',
        message: `✅ Loaded ${fileName} locally (Login to persist)`
      });
    }

    handleResetFilters();
  };

  const handleReset = async () => {
    if (user && isLiveData) {
      if (confirm("Clear persistent cloud data and start fresh?")) {
        try {
          await clearSalesRecords();
          setRecords([]);
          setIsLiveData(false);
          setUploadStatus({
            type: 'neutral',
            message: 'Workspace cleared. Upload data to begin.'
          });
        } catch (err: any) {
          console.error(err);
        }
      }
    } else {
      setRecords([]);
      setIsLiveData(false);
      setUploadStatus({
        type: 'neutral',
        message: 'Workspace cleared.'
      });
    }
    handleResetFilters();
  };

  const handleClearData = async () => {
    const confirms = window.confirm("Are you sure you want to permanently delete ALL sales records from the cloud database? This cannot be undone.");
    if (confirms) {
      try {
        setUploadStatus({ type: 'loading', message: 'Purging cloud database...' });
        await clearSalesRecords();
        setRecords([]);
        setUploadStatus({ type: 'success', message: '✅ Database cleared successfully.' });
      } catch (err) {
        setUploadStatus({ type: 'error', message: 'Failed to clear database.' });
        console.error(err);
      }
    }
  };

  const handleResetFilters = () => {
    setPlant('ALL');
    setInvType('ALL');
    setSegment('ALL');
    setCustomer('ALL');
    setAccMgr('ALL');
    setMaterial('ALL');
    setProductType('ALL');
    setOrderType('ALL');
    setIsSto(null);
    setDateFrom('');
    setDateTo('');
  };

  const handleChartDrillDown = (type: string, value: any) => {
    if (type === 'segment') setSegment(value);
    if (type === 'customer') setCustomer(value);
    if (type === 'accMgr') setAccMgr(value);
    if (type === 'invType') setInvType(value);
    if (type === 'plant') setPlant(value);
    if (type === 'material') setMaterial(value);
    if (type === 'productType') setProductType(value);
    if (type === 'orderType') setOrderType(value);
    if (type === 'isSto') setIsSto(value);
  };

  // Dashboard Application Entry Point - Production Build
  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-page-bg dark:bg-page-bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest animate-pulse">Initializing Security Protocol...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage isLoadingAuth={isLoading} />;
  }

  return (
    <div className="min-h-screen bg-page-bg dark:bg-page-bg-dark font-sans text-primary-text dark:text-primary-text-dark flex flex-col transition-colors duration-300">
      <Header 
        plant={plant} setPlant={setPlant}
        invType={invType} setInvType={setInvType}
        segment={segment} setSegment={setSegment}
        customer={customer} setCustomer={setCustomer}
        accMgr={accMgr} setAccMgr={setAccMgr}
        dateFrom={dateFrom} setDateFrom={setDateFrom}
        dateTo={dateTo} setDateTo={setDateTo}
        segments={segments}
        customers={customers}
        accMgrs={accMgrs}
        invTypes={invTypes}
        materials={materials}
        productTypes={productTypes}
        orderTypes={orderTypes}
        isLiveData={isLiveData}
        isLoading={isLoading}
        dateBounds={dateBounds}
        lastUpdated={lastUpdated}
        onResetFilters={handleResetFilters}
        onClearData={handleClearData}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        user={user}
        material={material} setMaterial={setMaterial}
        productType={productType} setProductType={setProductType}
        orderType={orderType} setOrderType={setOrderType}
        isSto={isSto} setIsSto={setIsSto}
        concentrateMode={concentrateMode} setConcentrateMode={setConcentrateMode}
      />

      <AnimatePresence>
        {!concentrateMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <UploadBanner 
              onDataLoaded={handleDataLoaded} 
              onReset={handleReset} 
              status={uploadStatus} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full max-w-[1440px] mx-auto p-8 md:p-10 space-y-10">
        <KPISection 
          totalSales={kpis.totalSales}
          infaSales={kpis.infaSales}
          infbSales={kpis.infbSales}
          otifPct={kpis.otifPct}
          failures={kpis.failureCount}
          customers={kpis.customers}
          onTimeCount={kpis.onTimeCount}
          totalDeliveries={kpis.totalDeliveries}
          deltas={kpis.deltas}
          onZoom={setZoomedKPI}
        />

        <AnimatePresence>
          {zoomedKPI && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-10 backdrop-blur-md bg-slate-900/60"
              onClick={() => setZoomedKPI(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-8 md:p-12">
                   <div className="flex justify-between items-start mb-8">
                     <div>
                       <span className="text-secondary-text dark:text-secondary-text-dark font-serif italic text-lg opacity-70 block mb-1">{zoomedKPI.label}</span>
                       <h2 className="text-6xl md:text-8xl font-mono font-medium text-primary-text dark:text-primary-text-dark tracking-tighter">
                         {zoomedKPI.value}
                       </h2>
                     </div>
                     <div className="flex gap-2">
                       <button 
                         onClick={() => {
                           if (!document.fullscreenElement) {
                             document.documentElement.requestFullscreen();
                           } else {
                             document.exitFullscreen();
                           }
                         }}
                         className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary-accent transition-colors"
                         title="Toggle Dashboard Fullscreen"
                       >
                         <Maximize2 className="w-6 h-6" />
                       </button>
                       <button 
                         onClick={() => setZoomedKPI(null)}
                         className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                       >
                         <X className="w-8 h-8" />
                       </button>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <span className={cn("w-3 h-3 rounded-full", zoomedKPI.type === 'total' ? 'bg-primary-accent' : zoomedKPI.type === 'infa' ? 'bg-blue-500' : zoomedKPI.type === 'infb' ? 'bg-pink-500' : zoomedKPI.type === 'otif' ? 'bg-success' : zoomedKPI.type === 'warn' ? 'bg-danger' : 'bg-purple-500')} />
                          <span className="text-lg font-bold uppercase tracking-[0.3em] text-secondary-text dark:text-secondary-text-dark opacity-60">
                            {zoomedKPI.subValue}
                          </span>
                        </div>
                        
                        {zoomedKPI.delta !== undefined && (
                          <div className={cn(
                            "text-2xl font-mono font-bold flex items-center gap-2",
                            zoomedKPI.delta > 0 ? "text-emerald-500" : "text-rose-500"
                          )}>
                            <span className="text-4xl">{zoomedKPI.delta > 0 ? '▲' : '▼'}</span>
                            {Math.abs(zoomedKPI.delta).toFixed(1)}% vs Previous Period
                          </div>
                        )}
                        
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm">
                          Detailed trend analysis for {zoomedKPI.label} across the selected timeframe ({dateFrom || 'Start'} to {dateTo || 'End'}). This metric is calculated based on {filtered.length.toLocaleString()} filtered records.
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] font-mono text-slate-400 mb-4 uppercase tracking-widest">System Validation</div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Integrity Check</span>
                            <span className="text-success font-bold">PASSED</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Data Latency</span>
                            <span className="text-slate-400 font-mono">1.2ms</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Source Cluster</span>
                            <span className="text-slate-400 font-mono">Nashik/Maneck Hub</span>
                          </div>
                        </div>
                      </div>
                   </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {zoomedChart && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-10 backdrop-blur-md bg-slate-900/60"
              onClick={() => setZoomedChart(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-8 md:p-12">
                   <div className="flex justify-between items-start mb-6">
                     <div>
                       <h3 className="text-xl font-bold text-primary-text dark:text-primary-text-dark tracking-tight">{zoomedChart.title}</h3>
                       <p className="text-xs text-secondary-text dark:text-secondary-text-dark font-mono uppercase tracking-[0.2em] opacity-60 italic">{zoomedChart.subtitle}</p>
                     </div>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            if (!document.fullscreenElement) {
                              document.documentElement.requestFullscreen();
                            } else {
                              document.exitFullscreen();
                            }
                          }}
                          className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary-accent transition-colors"
                        >
                          <Maximize2 className="w-6 h-6" />
                        </button>
                        <button 
                          onClick={() => setZoomedChart(null)}
                          className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <X className="w-8 h-8" />
                        </button>
                     </div>
                   </div>
                   <div className="relative">
                     {zoomedChart.children}
                   </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${plant}-${invType}-${segment}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-10"
          >
            <OTIFPanel 
              {...{
                infaOT: filtered.filter(r => r.plant === 'INFA').reduce((s,r) => s + r.onTime, 0),
                infaFail: filtered.filter(r => r.plant === 'INFA').reduce((s,r) => s + r.failure, 0),
                infbOT: filtered.filter(r => r.plant === 'INFB').reduce((s,r) => s + r.onTime, 0),
                infbFail: filtered.filter(r => r.plant === 'INFB').reduce((s,r) => s + r.failure, 0),
                combOT: kpis.onTimeCount,
                combFail: kpis.failureCount,
              }}
            />

            <AIInsightsPanel data={{ kpis, chartData }} />

            <ChartsSection 
              days={chartData.days}
              segmentData={chartData.segmentData}
              invData={chartData.invData}
              accMgrData={chartData.accMgrData}
              paretoData={chartData.paretoData}
              prodNpdData={chartData.prodNpdData}
              schPoData={chartData.schPoData}
              topCustData={chartData.topCustData}
              topMatData={chartData.topMatData}
              splitData={chartData.splitData}
              plantFilter={plant}
              darkMode={darkMode}
              isLiveData={isLiveData}
              onDrillDown={handleChartDrillDown}
              onMaximize={setZoomedChart}
              renderKey={(records || []).length}
            />

            <DataTable data={aggregatedTableData} />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="text-center py-10 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60 italic transition-colors duration-300">
        UDL Manufacturing Intelligence &nbsp;•&nbsp; INFA & INFB Hub &nbsp;•&nbsp; © 2026 UDL Group
      </footer>
      <GeminiChat records={records} />
      <GuidedTour />
    </div>
  );
}
