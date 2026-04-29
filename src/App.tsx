import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import UploadBanner from './components/UploadBanner';
import KPISection from './components/KPISection';
import OTIFPanel from './components/OTIFPanel';
import ChartsSection from './components/ChartsSection';
import AIInsightsPanel from './components/AIInsightsPanel';
import DataTable from './components/DataTable';
import { GeminiChat } from './components/GeminiChat';
import { SAMPLE_RAW } from './lib/sampleData';
import { useDashboardData } from './hooks/useDashboardData';
import { SalesRecord } from './types';
import { motion, AnimatePresence } from 'motion/react';
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
            setLastUpdated(new Date().toLocaleString('en-IN', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit',
              hour12: true 
            }));
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
        // Logged out - show sample data as demo
        setIsLoading(false);
        setRecords(SAMPLE_RAW);
        setIsLiveData(false);
        setUploadStatus({
          type: 'neutral',
          message: 'Demo Mode: Showing Sample Sales Data. Login to use private cloud storage.'
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

  useEffect(() => {
    if (isLiveData && !lastUpdated) {
      setLastUpdated(new Date().toLocaleString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      }));
    }
  }, [isLiveData, lastUpdated]);

  const handleDataLoaded = async (newRecords: SalesRecord[], fileName: string) => {
    setRecords(newRecords);
    setIsLiveData(true);
    setLastUpdated(new Date().toLocaleString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    }));

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
      if (confirm("Clear persistent cloud data and return to sample?")) {
        try {
          await clearSalesRecords();
        } catch (err: any) {
          console.error(err);
        }
      }
    }
    setRecords(SAMPLE_RAW);
    setIsLiveData(false);
    setUploadStatus({
      type: 'neutral',
      message: 'Loaded: Sample Sales Register Data · Apr 2026'
    });
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
        isLiveData={isLiveData}
        dateBounds={dateBounds}
        lastUpdated={lastUpdated}
        onResetFilters={handleResetFilters}
        onClearData={handleClearData}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        user={user}
      />

      <UploadBanner 
        onDataLoaded={handleDataLoaded} 
        onReset={handleReset} 
        status={uploadStatus} 
      />

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
        />

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
              onDrillDown={handleChartDrillDown}
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
    </div>
  );
}
