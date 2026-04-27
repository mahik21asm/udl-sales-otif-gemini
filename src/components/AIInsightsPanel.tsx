import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, RefreshCw, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';
import { getDashboardInsights, DashboardInsights } from '../services/gemini';

interface AIInsightsPanelProps {
  data: any;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ data }) => {
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await getDashboardInsights(data);
      setInsights(result);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card-bg dark:bg-card-bg-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-page-bg dark:bg-slate-800/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary-accent/10 dark:bg-primary-accent/20 rounded-lg text-primary-accent dark:text-primary-accent-dark">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-black text-primary-text dark:text-primary-text-dark uppercase tracking-tight">AI Executive Summary</h3>
            <p className="text-[10px] text-secondary-text dark:text-secondary-text-dark font-bold uppercase tracking-widest opacity-80">Powered by Gemini 3 Flash</p>
          </div>
        </div>
        
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-accent hover:opacity-90 text-white text-[11px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-accent/20 dark:shadow-none"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          {insights ? 'REFRESH INSIGHTS' : 'GENERATE INSIGHTS'}
        </button>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {!insights && !loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
                <TrendingUp size={24} />
              </div>
              <div className="max-w-xs">
                <h4 className="text-sm font-bold text-primary-text dark:text-primary-text-dark mb-1">Deep Intelligence Ready</h4>
                <p className="text-xs text-secondary-text dark:text-secondary-text-dark">Generate real-time business insights, risks, and recommendations using AI.</p>
              </div>
            </motion.div>
          ) : loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <Loader2 size={32} className="animate-spin text-indigo-600 mb-4" />
              <p className="text-sm font-bold text-slate-500 animate-pulse">Analyzing manufacturing trends and OTIF patterns...</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-primary-accent/5 dark:bg-primary-accent/5 p-4 rounded-xl border border-primary-accent/10 dark:border-primary-accent/10">
                <p className="text-sm text-primary-text dark:text-primary-text-dark leading-relaxed italic">
                  "{insights.summary}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb size={14} className="text-warning" />
                    <h4 className="text-[11px] font-black text-primary-text dark:text-primary-text-dark uppercase tracking-wider">Growth Recommendations</h4>
                  </div>
                  <ul className="space-y-3">
                    {insights.recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-3 text-xs text-secondary-text dark:text-secondary-text-dark group">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-page-bg dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-primary-accent group-hover:bg-primary-accent group-hover:text-white transition-colors">{i + 1}</span>
                        <span className="pt-0.5">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={14} className="text-danger" />
                    <h4 className="text-[11px] font-black text-primary-text dark:text-primary-text-dark uppercase tracking-wider">Identified Risk Areas</h4>
                  </div>
                  <div className="space-y-3">
                    {insights.risks.map((risk, i) => (
                      <div key={i} className="p-3 rounded-lg bg-page-bg dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                        <div className="w-1 mt-1.5 h-1 rounded-full bg-danger flex-shrink-0" />
                        <p className="text-xs text-secondary-text dark:text-secondary-text-dark">{risk}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIInsightsPanel;
