import React, { useRef, useState } from 'react';
import { Upload, RefreshCw, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';
import { SalesRecord } from '../types';
import { validateSalesData, ValidationError } from '../services/dataValidator';

interface UploadBannerProps {
  onDataLoaded: (data: SalesRecord[], fileName: string) => void;
  onReset: () => void;
  status: { type: 'neutral' | 'success' | 'error'; message: string };
}

const UploadBanner: React.FC<UploadBannerProps> = ({ onDataLoaded, onReset, status }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isErrorListExpanded, setIsErrorListExpanded] = useState(false);

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
    <div className="bg-card-bg dark:bg-card-bg-dark border-b border-slate-200 dark:border-slate-800 px-8 py-12 flex flex-col items-center text-center transition-colors duration-300">
      <div className="max-w-3xl w-full">
        <h2 className="text-3xl font-extrabold text-primary-text dark:text-primary-text-dark mb-2 tracking-tight">Import Data Dump</h2>
        <p className="text-secondary-text dark:text-secondary-text-dark mb-6 font-medium italic">Upload your SAP/ERP data dump (XLSX, XLS, CSV). We'll automatically map the columns to the dashboard.</p>
        <div className="mt-8 mb-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-left">
          {[
            { label: 'Plant/Unit', desc: 'INFA or INFB' },
            { label: 'Customer', desc: 'Sold-to party' },
            { label: 'Sales Value', desc: 'In Lacs (₹)' },
            { label: 'OTIF Data', desc: 'On-time vs Failure' },
            { label: 'Billing Date', desc: 'DD-MM-YYYY' },
            { label: 'Segment', desc: 'Business unit' }
          ].map(r => (
            <div key={r.label} className="bg-page-bg dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="text-[9px] font-black text-primary-accent dark:text-primary-accent-dark uppercase tracking-widest mb-1">{r.label}</div>
              <div className="text-[11px] text-secondary-text dark:text-secondary-text-dark font-bold">{r.desc}</div>
            </div>
          ))}
        </div>
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            "group flex flex-col items-center justify-center border-2 border-dashed rounded-3xl py-12 px-6 cursor-pointer transition-all w-full",
            isDragging 
              ? "bg-primary-accent-dark/10 dark:bg-primary-accent-dark/20 border-primary-accent-dark ring-8 ring-primary-accent-dark/5 shadow-inner" 
              : "bg-page-bg dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-primary-accent hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-primary-accent/5 shadow-sm"
          )}
        >
          <div className={cn(
            "w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-md border border-slate-100 dark:border-slate-700 mb-6 transition-all group-hover:scale-110 group-hover:rotate-3",
            isDragging ? "scale-110 rotate-3 border-indigo-200 dark:border-indigo-800" : ""
          )}>
            <Upload size={36} strokeWidth={2.5} />
          </div>
          
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-primary-text dark:text-primary-text-dark mb-2">Drag and drop files here</h3>
            <p className="text-secondary-text dark:text-secondary-text-dark text-sm font-medium">Supported formats: .XLSX, .XLS, .CSV (Max 250MB)</p>
          </div>

          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="bg-primary-accent text-white px-10 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-primary-accent/20 dark:shadow-none hover:opacity-90 hover:translate-y-[-1px] active:translate-y-[1px] transition-all"
          >
            Select Sales File
          </button>
          
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".xlsx,.xls,.csv" 
            className="hidden" 
            onChange={(e) => handleFile(e.target.files?.[0] as File)} 
          />
        </div>

        {/* Validation Errors Feedback */}
        {validationErrors.length > 0 && (
          <div className="mt-8 w-full bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
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
                <div className="mt-4 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs italic font-medium">
                  <AlertCircle size={14} />
                  Please correct these errors in your source file and try again.
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-between gap-10 items-start text-left">
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
                validationErrors.length > 0 ? "bg-danger" : "bg-slate-400"
              )} />
              <span className={cn("text-[13px] font-extrabold tracking-tight", 
                status.type === 'success' ? "text-emerald-700 dark:text-emerald-400" : 
                status.type === 'error' || validationErrors.length > 0 ? "text-danger dark:text-rose-400" : "text-secondary-text dark:text-secondary-text-dark"
              )}>
                {validationErrors.length > 0 ? "Validation Failed" : status.message}
              </span>
            </div>
            <button 
              onClick={handleResetWorkspace}
              className="mt-4 flex items-center gap-2 text-[10px] font-black text-primary-accent dark:text-primary-accent-dark uppercase tracking-widest hover:opacity-80 transition-all border-b border-primary-accent/20 dark:border-primary-accent/50 pb-0.5"
            >
              <RefreshCw size={10} />
              Reset Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadBanner;
