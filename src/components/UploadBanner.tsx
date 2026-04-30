import React, { useRef, useState } from 'react';
import { Upload, RefreshCw, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { SalesRecord } from '../types';
import { validateSalesData, ValidationError } from '../services/dataValidator';

interface UploadBannerProps {
  onDataLoaded: (data: SalesRecord[], fileName: string) => void;
  onReset: () => void;
  status: { type: 'neutral' | 'success' | 'error' | 'loading'; message: string };
}

const UploadBanner: React.FC<UploadBannerProps> = ({ onDataLoaded, onReset, status }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isErrorListExpanded, setIsErrorListExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleFile = (file: File) => {
    if (!file) return;
    setValidationErrors([]); // Clear old errors
    
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      onDataLoaded([], ''); // Trigger error state via parent if needed or just show logic
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
        // Find sheet
        const sheetName = workbook.SheetNames.find(n => n.toLowerCase().includes('sales register')) || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        const result = validateSalesData(json);

        if (result.isValid) {
          onDataLoaded(result.records, file.name);
        } else {
          setValidationErrors(result.errors);
          setIsErrorListExpanded(true);
        }
      } catch (err: any) {
        console.error(err);
        setValidationErrors([{ message: "Failed to process file. Ensure it is a valid Excel or CSV document." }]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleResetWorkspace = () => {
    setValidationErrors([]);
    onReset();
  };

  return (
    <div id="upload-banner" className={cn(
      "bg-card-bg dark:bg-card-bg-dark border-b border-slate-200 dark:border-slate-800 transition-all duration-500 relative overflow-hidden",
      isMinimized ? "py-4 px-8" : "px-8 py-10"
    )}>
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-accent/5 blur-[100px] pointer-events-none" />
      
      {/* Minimize Toggle */}
      <div className="absolute top-4 right-6 z-20">
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="flex items-center gap-2 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-primary-accent dark:hover:text-primary-accent-dark transition-all border border-slate-100 dark:border-slate-800 hover:border-primary-accent rounded-lg bg-white dark:bg-slate-900 shadow-sm"
        >
          {isMinimized ? (
            <><RefreshCw size={12} className="animate-spin-slow" /> EXPAND SETTINGS</>
          ) : (
            <><EyeOff size={12} /> COLLAPSE SETTINGS</>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.div 
            key="minimized"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex items-center justify-between w-full max-w-7xl mx-auto relative z-10"
          >
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-primary-accent flex items-center justify-center text-white shadow-lg shadow-primary-accent/10">
                <Upload size={18} />
              </div>
              <div className="text-left">
                <h2 className="text-xs font-black text-slate-900 dark:text-white tracking-widest uppercase mb-0.5">Settings Minimized</h2>
                <div className="flex items-center gap-2">
                  <div className={cn("w-1.5 h-1.5 rounded-full", status.type === 'success' ? 'bg-success animate-pulse' : 'bg-primary-accent')} />
                  <p className="text-[10px] text-slate-400 font-mono italic tracking-tight">{status.message}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={handleResetWorkspace}
                className="px-4 py-1.5 text-[10px] font-bold text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-all border border-transparent hover:border-danger/20 uppercase tracking-widest"
              >
                CLEAR WORKSPACE
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="expanded"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-4xl w-full mx-auto relative z-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tighter">Sales Data Upload</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px] leading-relaxed uppercase tracking-wide opacity-80">
                    Upload your SAP/ERP sales registers to generate intelligent insights. Supported plants: Nashik (INFA) and Maneck Nagar (INFB).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Plant Identifier', value: 'INFA / INFB' },
                    { label: 'Column Context', value: 'Auto-Mapped' },
                    { label: 'Validation Layer', value: 'Strict Type_Check' },
                    { label: 'Sync Status', value: 'Cloud_Enabled' }
                  ].map(r => (
                    <div key={r.label} className="border-l border-slate-200 dark:border-slate-800 pl-4 py-1">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{r.label}</div>
                      <div className="text-[11px] text-slate-900 dark:text-white font-mono font-bold italic uppercase">{r.value}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-slate-900/5 transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
                  >
                    Select File
                  </button>
                   <button 
                    onClick={handleResetWorkspace}
                    className="px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-400 border border-slate-100 dark:border-slate-800 hover:text-danger hover:border-danger hover:bg-danger/5 transition-all"
                  >
                    Clear Board
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  className={cn(
                    "flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-10 cursor-pointer transition-all aspect-square",
                    isDragging 
                      ? "bg-primary-accent/5 border-primary-accent scale-[1.02] shadow-2xl" 
                      : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-primary-accent hover:bg-white dark:hover:bg-slate-900/80 transition-all group"
                  )}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-sm border border-slate-100 dark:border-slate-700 mb-6 transition-all group-hover:scale-110 group-hover:text-primary-accent group-hover:rotate-6",
                    isDragging ? "scale-110 rotate-6 text-primary-accent border-primary-accent/30" : ""
                  )}>
                    <Upload size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-2">Drag & Drop File</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono italic">XLSX, XLS, CSV | AUTOMATIC PARSE</p>
                  </div>
                </div>
              </div>
            </div>

            <input 
              ref={fileInputRef}
              type="file" 
              accept=".xlsx,.xls,.csv" 
              className="hidden" 
              onChange={(e) => handleFile(e.target.files?.[0] as File)} 
            />

            {/* Validation Errors Feedback */}
            {validationErrors.length > 0 && (
              <div className="mt-8 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                <div 
                  className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-colors"
                  onClick={() => setIsErrorListExpanded(!isErrorListExpanded)}
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="text-rose-600 dark:text-rose-400" size={20} />
                    <span className="font-bold text-rose-800 dark:text-rose-300">
                      Data Validation Failed — {validationErrors.length} issues identified
                    </span>
                  </div>
                  {isErrorListExpanded ? <ChevronUp size={18} className="text-rose-400" /> : <ChevronDown size={18} className="text-rose-400" />}
                </div>
                
                {isErrorListExpanded && (
                  <div className="px-6 pb-6 text-left border-t border-rose-100 dark:border-rose-900/30">
                    <ul className="mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {validationErrors.map((err, i) => (
                        <li key={i} className="text-sm py-2 border-b border-rose-100/50 dark:border-rose-900/10 last:border-0 flex gap-3">
                          <span className="font-black text-[10px] bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded h-fit mt-0.5">
                            {err.row ? `ROW ${err.row}` : 'HDR'}
                          </span>
                          <div>
                            <p className="text-rose-900 dark:text-rose-200 font-bold leading-tight">
                              {err.column ? `${err.column}: ` : ''}{err.message}
                            </p>
                            {err.value !== undefined && (
                              <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-0.5 italic">
                                Found value: "{String(err.value)}"
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-between gap-10 items-start text-left w-full">
              <div className="flex-1 min-w-[200px]">
                <div className="text-[10px] font-black text-secondary-text dark:text-secondary-text-dark uppercase tracking-widest mb-2 opacity-80 italic">Data Validation</div>
                <p className="text-[12px] text-secondary-text dark:text-secondary-text-dark leading-relaxed font-semibold">Automatic schema detection and type checking active for INFA/INFB manufacturing datasets.</p>
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="text-[10px] font-black text-secondary-text dark:text-secondary-text-dark uppercase tracking-widest mb-2 opacity-80 italic">Status Summary</div>
                <div className="flex items-center gap-2.5 mt-1.5">
                  <div className={cn("w-2.5 h-2.5 rounded-full", 
                    status.type === 'success' ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]" : 
                    status.type === 'error' ? "bg-danger shadow-[0_0_12px_rgba(220,53,69,0.7)]" : 
                    status.type === 'loading' ? "bg-primary-accent animate-pulse shadow-[0_0_12px_rgba(37,99,235,0.7)]" :
                    validationErrors.length > 0 ? "bg-danger" : "bg-slate-400"
                  )} />
                  <span className={cn("text-[13px] font-extrabold tracking-tight", 
                    status.type === 'success' ? "text-emerald-700 dark:text-emerald-400" : 
                    status.type === 'error' || validationErrors.length > 0 ? "text-danger dark:text-rose-400" : 
                    status.type === 'loading' ? "text-primary-accent dark:text-primary-accent-dark" :
                    "text-secondary-text dark:text-secondary-text-dark"
                  )}>
                    {validationErrors.length > 0 ? "Validation Failed" : status.message}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadBanner;
