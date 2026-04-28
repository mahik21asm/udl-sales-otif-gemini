import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, Check, AlertCircle, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface M365SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const M365SettingsModal: React.FC<M365SettingsModalProps> = ({ isOpen, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [sender, setSender] = useState('reports@example.com');
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  useEffect(() => {
    // Check connection status on load (simulated or fetch from backend)
    // For now, we'll keep it simple
  }, []);

  const handleConnectM365 = async () => {
    try {
      const res = await fetch('/api/auth/microsoft/url');
      const { url } = await res.json();
      
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        url,
        'microsoft_auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        alert("Popup blocked! Please allow popups to connect Microsoft 365.");
        return;
      }

      // Listen for message from popup
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'M365_AUTH_SUCCESS') {
          setIsConnected(true);
          setStatus({ type: 'success', message: 'Microsoft 365 Connected Successfully!' });
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to initiate connection.' });
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setStatus({ type: 'idle', message: 'Syncing with Outlook...' });
    
    try {
      const res = await fetch('/api/sync/m365', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender })
      });
      const data = await res.json();
      
      if (data.success) {
        setStatus({ type: 'success', message: `${data.message}. Dashboard updated.` });
        // In a real app, we might trigger a global data refresh here
        setTimeout(() => window.location.reload(), 2000); // Simple refresh for now
      } else {
        setStatus({ type: 'error', message: data.message || 'Sync failed.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Sync error. Please check connection.' });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Email Automation</h2>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">M365 & MS Graph Integration</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Connection Status */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                      )} />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {isConnected ? "Connected to Microsoft 365" : "Microsoft 365 Disconnected"}
                      </span>
                    </div>
                    {!isConnected && (
                      <button 
                        onClick={handleConnectM365}
                        className="text-[10px] font-black uppercase text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Connect <ExternalLink size={10} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Configuration */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Sender Filter</label>
                    <input 
                      type="email"
                      value={sender}
                      onChange={(e) => setSender(e.target.value)}
                      placeholder="reports@udlgroup.com"
                      className="w-full mt-1.5 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                    />
                    <p className="text-[9px] text-slate-400 mt-2 ml-1 leading-relaxed italic">
                      The dashboard will fetch the latest email from this address containing an Excel (.xlsx) file and refresh automatically.
                    </p>
                  </div>

                  <button
                    disabled={!isConnected || isSyncing}
                    onClick={handleSyncNow}
                    className={cn(
                      "w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all shadow-lg",
                      (!isConnected || isSyncing) 
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
                    )}
                  >
                    {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    {isSyncing ? "Syncing..." : "Sync Now"}
                  </button>
                </div>

                {/* Status Indicator */}
                <AnimatePresence>
                  {status.message && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={cn(
                        "p-3 rounded-xl flex items-center gap-3",
                        status.type === 'success' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                        status.type === 'error' ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                      )}
                    >
                      {status.type === 'success' ? <Check size={16} /> : 
                       status.type === 'error' ? <AlertCircle size={16} /> : <RefreshCw size={16} className="animate-spin" />}
                      <span className="text-[11px] font-bold">{status.message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
