import React from 'react';
import { motion } from 'motion/react';
import { LogIn, ShieldCheck, Zap, BarChart3, Globe } from 'lucide-react';
import { loginWithGoogle } from '../lib/firebase';
import { UDLLogo } from './UDLLogo';
import { cn } from '../lib/utils';

interface LoginPageProps {
  isLoadingAuth: boolean;
}

export default function LoginPage({ isLoadingAuth }: LoginPageProps) {
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0A0A0A] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-primary-accent/30">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-accent/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="bg-white dark:bg-[#111111] rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-200/60 dark:border-white/5 overflow-hidden">
          <div className="p-10 md:p-14 text-center">
            {/* Logo Section */}
            <div className="flex justify-center mb-10">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(118,83,65,0.12)] border border-slate-100 flex items-center justify-center"
              >
                <UDLLogo className="h-28 w-auto" />
              </motion.div>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tighter mb-4">
              Sales Command Center
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-10 max-w-[280px] mx-auto">
              Unified Data Layer for Uni Deritend Ltd. analytics and performance monitoring.
            </p>

            <div className="space-y-4">
              <button
                onClick={handleLogin}
                disabled={isLoadingAuth}
                className={cn(
                  "w-full group relative flex items-center justify-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 px-6 rounded-2xl font-bold uppercase tracking-[0.15em] text-[11px] shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] hover:shadow-2xl hover:translate-y-[-2px]",
                  isLoadingAuth && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoadingAuth ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    Enter Command Center
                  </>
                )}
              </button>

              <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-white/5 mt-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <ShieldCheck size={14} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Secure</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Globe size={14} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Global</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                    <Zap size={14} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Realtime</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-white/[0.02] px-10 py-6 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tighter">Secure Enterprise Access</span>
            <span className="text-[10px] font-mono font-bold text-slate-300 dark:text-slate-600">UDL NETWORK</span>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-400 dark:text-slate-600 text-[10px] uppercase font-bold tracking-[0.2em] italic">
          Authorized Personnel Only &nbsp;•&nbsp; System ID: {Math.random().toString(36).substring(7).toUpperCase()}
        </p>
      </motion.div>
    </div>
  );
}
