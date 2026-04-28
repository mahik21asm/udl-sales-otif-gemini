import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  DoughnutController,
  BarController,
  LineController
} from 'chart.js';
import { Chart, Doughnut, Bar } from 'react-chartjs-2';
import { DayData } from '../types';
import { cn } from '../lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  DoughnutController,
  BarController,
  LineController
);

interface ChartsSectionProps {
  days: DayData[];
  segmentData: { labels: string[]; data: number[] };
  accMgrData: { labels: string[]; data: number[] };
  paretoData: { labels: string[]; datasets: any[] };
  invData: { labels: string[]; data: number[] };
  prodNpdData: { labels: string[]; datasets: any[] };
  schPoData: { labels: string[]; datasets: any[] };
  topCustData: { labels: string[]; data: number[] };
  topMatData: { labels: string[]; data: number[] };
  splitData: { labels: string[]; data: number[] };
  plantFilter: string;
  darkMode: boolean;
  onDrillDown: (type: string, value: string) => void;
  renderKey: string | number;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({
  days,
  segmentData,
  accMgrData,
  paretoData,
  invData,
  prodNpdData,
  schPoData,
  topCustData,
  topMatData,
  splitData,
  plantFilter,
  darkMode,
  onDrillDown,
  renderKey
}) => {
  const textColor = darkMode ? '#8b949e' : '#6c757d'; // Use secondary text for axis/ticks
  const gridColor = darkMode ? '#334155' : '#f1f5f9';
  const titleColor = darkMode ? '#e1e1e1' : '#212529'; // Use primary text for titles
  // Daily Sales Trend Chart Config
  const cumSum = days.reduce((acc: number[], d) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : 0;
    const current = plantFilter === 'INFA' ? d.infa : plantFilter === 'INFB' ? d.infb : d.infa + d.infb;
    acc.push(Number((prev + current).toFixed(2)));
    return acc;
  }, []);

  const dailyDatasets = [];
  if (plantFilter !== 'INFB') {
    dailyDatasets.push({
      type: 'bar' as const,
      label: 'INFA',
      data: days.map(d => d.infa),
      backgroundColor: '#a5b4fccc',
      borderColor: '#a5b4fc',
      borderWidth: 1,
      borderRadius: 3,
      stack: 's'
    });
  }
  if (plantFilter !== 'INFA') {
    dailyDatasets.push({
      type: 'bar' as const,
      label: 'INFB',
      data: days.map(d => d.infb),
      backgroundColor: '#fbcfe8cc',
      borderColor: '#fbcfe8',
      borderWidth: 1,
      borderRadius: 3,
      stack: 's'
    });
  }
  dailyDatasets.push({
    type: 'line' as const,
    label: 'Cumulative',
    data: cumSum,
    borderColor: '#ef4444',
    borderWidth: 2,
    pointRadius: 3,
    pointHoverRadius: 5,
    backgroundColor: 'transparent',
    tension: 0.3,
    yAxisID: 'y2'
  });

  const dailyDataConfig = {
    labels: days.map(d => d.d),
    datasets: dailyDatasets
  };

  const dailyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { position: 'top' as const, labels: { usePointStyle: true, padding: 14, font: { size: 10, weight: 'bold' }, color: textColor } },
      tooltip: { 
        backgroundColor: '#1e293b',
        padding: 10,
        cornerRadius: 8,
        callbacks: { label: (c: any) => `${c.dataset.label}: ₹${c.parsed.y?.toFixed(2)}L` } 
      }
    },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { 
          font: { size: 9 }, 
          color: textColor,
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 15
        } 
      },
      y: { beginAtZero: true, ticks: { callback: (v: any) => `₹${v}L`, font: { size: 9 }, color: textColor }, grid: { color: gridColor } },
      y2: { beginAtZero: true, position: 'right' as const, ticks: { callback: (v: any) => `₹${v}L`, font: { size: 9 }, color: textColor }, grid: { display: false } }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Row: Daily Trend, Segment, and Revenue Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ChartCard 
          title="Daily Sales Trend — INFA vs INFB (₹ Lacs)" 
          subtitle="Stacked bar view"
          className="lg:col-span-2"
        >
          <div key={`daily-${renderKey}`} className="h-full">
            <Chart type="bar" data={dailyDataConfig as any} options={dailyOptions as any} />
          </div>
        </ChartCard>
        
        <ChartCard title="Sales by Segment" subtitle="Click to filter">
          <div key={`segment-${renderKey}`} className="h-full flex items-center justify-center">
            <Doughnut 
              data={{
                labels: segmentData.labels,
                datasets: [{
                  data: segmentData.data,
                  backgroundColor: ['#a5b4fccc','#93c5fdcc','#6ee7b7cc','#fcd34dcc','#fda4afcc','#d8b4fecc','#67e8f9cc','#fb923ccc'],
                  borderColor: darkMode ? '#1e293b' : '#fff',
                  borderWidth: 2
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                onHover: (event, chartElement) => {
                  (event.native?.target as HTMLElement).style.cursor = chartElement.length ? 'pointer' : 'default';
                },
                onClick: (e, elements) => {
                  if (elements.length > 0) {
                    const idx = elements[0].index;
                    onDrillDown('segment', segmentData.labels[idx]);
                  }
                },
                plugins: {
                  legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12, font: { size: 9, weight: 'bold' }, color: textColor } },
                  tooltip: {
                    backgroundColor: '#1e293b',
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                      label: (c: any) => {
                        const total = segmentData.data.reduce((a, b) => a + b, 0);
                        return ` ₹${c.parsed.toFixed(2)}L (${((c.parsed / total) * 100).toFixed(1)}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </ChartCard>

        <ChartCard title="Revenue Split" subtitle="STO vs External">
          <div key={`split-${renderKey}`} className="h-full flex items-center justify-center">
            <Doughnut 
              data={{
                labels: splitData.labels,
                datasets: [{
                  data: splitData.data,
                  backgroundColor: ['#10b981cc', '#f59e0bcc'],
                  borderColor: darkMode ? '#1e293b' : '#fff',
                  borderWidth: 2
                }]
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                  legend: { position: 'bottom', labels: { usePointStyle: true, font: { size: 9, weight: 'bold' }, color: textColor } },
                  tooltip: { backgroundColor: '#1e293b' }
                }
              }}
            />
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Sales by Account Manager" subtitle="₹ Lacs — performance view">
          <div key={`mgr-${renderKey}`} className="h-full">
            <Bar 
              data={{
              labels: accMgrData.labels,
              datasets: [{
                data: accMgrData.data,
                backgroundColor: '#93c5fdcc',
                borderRadius: 4
              }]
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              onHover: (event, chartElement) => {
                (event.native?.target as HTMLElement).style.cursor = chartElement.length ? 'pointer' : 'default';
              },
              onClick: (e, elements) => {
                if (elements.length > 0) {
                  const idx = elements[0].index;
                  onDrillDown('accMgr', accMgrData.labels[idx]);
                }
              },
              plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b' } },
              scales: { x: { grid: { display: false }, ticks: { font: { size: 9 }, color: textColor } }, y: { beginAtZero: true, grid: { color: gridColor }, ticks: { font: { size: 9 }, color: textColor } } }
            }}
          />
          </div>
        </ChartCard>
        <ChartCard title="Delivery Variance Pareto" subtitle="Failure count by customer">
          <div key={`pareto-${renderKey}`} className="h-full">
            <Chart 
              type="bar"
              data={paretoData as any}
            options={{
              responsive: true, maintainAspectRatio: false,
              onHover: (event, chartElement) => {
                (event.native?.target as HTMLElement).style.cursor = chartElement.length ? 'pointer' : 'default';
              },
              onClick: (e, elements) => {
                if (elements.length > 0) {
                  const idx = elements[0].index;
                  onDrillDown('customer', paretoData.labels[idx]);
                }
              },
              plugins: { 
                legend: { position: 'top', labels: { usePointStyle: true, font: { size: 9, weight: 'bold' }, color: textColor } },
                tooltip: { backgroundColor: '#1e293b' }
              },
              scales: { 
                x: { grid: { display: false }, ticks: { font: { size: 8 }, color: textColor } }, 
                y: { beginAtZero: true, grid: { color: gridColor }, ticks: { font: { size: 9 }, color: textColor } },
                y2: { position: 'right' as const, beginAtZero: true, max: 100, ticks: { callback: (v: any) => `${v}%`, font: { size: 9 }, color: textColor }, grid: { display: false } }
              }
            } as any}
          />
          </div>
        </ChartCard>
      </div>

      {/* Middle Row: Invoice Type, Product Type, Order Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChartCard title="Sales by Invoice Type" subtitle="Click to filter">
          <div key={`inv-${renderKey}`} className="h-full">
            <Bar 
              data={{
              labels: invData.labels.map(l => l.replace(' Invoice', '').replace('(Proforma)', '(Proto)')),
              datasets: [{
                data: invData.data,
                backgroundColor: ['#93c5fdcc','#d8b4fecc','#6ee7b7cc','#fda4afcc'],
                borderRadius: 4
              }]
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              onHover: (event, chartElement) => {
                (event.native?.target as HTMLElement).style.cursor = chartElement.length ? 'pointer' : 'default';
              },
              onClick: (e, elements) => {
                if (elements.length > 0) {
                  const idx = elements[0].index;
                  onDrillDown('invType', invData.labels[idx]);
                }
              },
              plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', callbacks: { label: (c: any) => `₹${c.parsed.y.toFixed(2)}L` } } },
              scales: { x: { grid: { display: false }, ticks: { font: { size: 9 }, color: textColor } }, y: { beginAtZero: true, grid: { color: gridColor }, ticks: { callback: (v: any) => `₹${v}L`, font: { size: 9 }, color: textColor } } }
            }}
          />
          </div>
        </ChartCard>
        <ChartCard title="Product Type — Prod vs NPD" subtitle="₹ Lacs by plant">
           <div key={`prodnpd-${renderKey}`} className="h-full">
             <Bar 
              data={prodNpdData}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { 
                legend: { position: 'top', labels: { usePointStyle: true, font: { size: 9, weight: 'bold' }, color: textColor } },
                tooltip: { backgroundColor: '#1e293b' }
              },
              scales: { x: { grid: { display: false }, ticks: { color: textColor, font: { size: 9 } } }, y: { beginAtZero: true, grid: { color: gridColor }, ticks: { callback: (v: any) => `₹${v}L`, font: { size: 9 }, color: textColor } } }
            }}
          />
          </div>
        </ChartCard>
        <ChartCard title="Order Type — SCH / PO / IU" subtitle="₹ Lacs by plant">
           <div key={`ordtype-${renderKey}`} className="h-full">
             <Bar 
              data={schPoData}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { 
                legend: { position: 'top', labels: { usePointStyle: true, font: { size: 9, weight: 'bold' }, color: textColor } },
                tooltip: { backgroundColor: '#1e293b' }
              },
              scales: { x: { grid: { display: false }, ticks: { color: textColor, font: { size: 9 } } }, y: { beginAtZero: true, grid: { color: gridColor }, ticks: { callback: (v: any) => `₹${v}L`, font: { size: 9 }, color: textColor } } }
            }}
          />
          </div>
        </ChartCard>
      </div>

      {/* Bottom Row: Top Customers and Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <ChartCard title="Top 10 Customers by Sales Value" subtitle="Click customer to filter">
          <div key={`cust-${renderKey}`} className="h-full">
            <Bar 
              data={{
              labels: topCustData.labels.map(l => {
                const label = String(l || '');
                return label.substring(0, 25) + (label.length > 25 ? '...' : '');
              }),
              datasets: [{
                data: topCustData.data,
                backgroundColor: ['#a5b4fccc', '#93c5fdcc', '#6ee7b7cc', '#fcd34dcc', '#fda4afcc', '#d8b4fecc', '#67e8f9cc', '#fb923ccc', '#f9a8d4cc', '#99f6e4cc'],
                borderRadius: 4
              }]
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              onHover: (event, chartElement) => {
                (event.native?.target as HTMLElement).style.cursor = chartElement.length ? 'pointer' : 'default';
              },
              onClick: (e, elements) => {
                if (elements.length > 0) {
                  const idx = elements[0].index;
                  onDrillDown('customer', topCustData.labels[idx]);
                }
              },
              indexAxis: 'y',
              plugins: { 
                legend: { display: false }, 
                tooltip: { backgroundColor: '#1e293b' } 
              },
              scales: { 
                x: { beginAtZero: true, grid: { color: gridColor }, ticks: { font: { size: 9 }, color: textColor } }, 
                y: { grid: { display: false }, ticks: { font: { size: 9 }, color: textColor } } 
              }
            }}
          />
          </div>
        </ChartCard>
        <ChartCard title="Top 10 Materials by Sales Value" subtitle="₹ Lacs — filtered view">
          <div key={`mat-${renderKey}`} className="h-full">
            <Bar 
              data={{
              labels: topMatData.labels.map(l => {
                const label = String(l || '');
                return label.substring(0, 25) + (label.length > 25 ? '...' : '');
              }),
              datasets: [{
                data: topMatData.data,
                backgroundColor: ['#a5b4fccc', '#fcd34dcc', '#6ee7b7cc', '#fda4afcc', '#d8b4fecc', '#67e8f9cc', '#fb923ccc', '#f9a8d4cc', '#99f6e4cc', '#c7d2fecc'],
                borderRadius: 4
              }]
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              indexAxis: 'y',
              plugins: { 
                legend: { display: false },
                tooltip: { backgroundColor: '#1e293b' }
              },
              scales: { 
                x: { beginAtZero: true, grid: { color: gridColor }, ticks: { font: { size: 9 }, color: textColor } }, 
                y: { grid: { display: false }, ticks: { font: { size: 9 }, color: textColor } } 
              }
            }}
          />
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

const ChartCard: React.FC<{ 
  title: string; 
  subtitle: string; 
  children: React.ReactNode; 
  className?: string; 
}> = ({ title, subtitle, children, className }) => (
  <div className={cn(
    "bg-card-bg dark:bg-card-bg-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-md",
    className
  )}>
    <div className="mb-6 flex flex-col gap-1">
      <h3 className="text-[13px] font-black text-primary-text dark:text-primary-text-dark tracking-tight uppercase">{title}</h3>
      <p className="text-[10px] text-secondary-text dark:text-secondary-text-dark font-bold uppercase tracking-widest opacity-80">{subtitle}</p>
    </div>
    <div className="h-[250px]">
      {children}
    </div>
  </div>
);

export default ChartsSection;
