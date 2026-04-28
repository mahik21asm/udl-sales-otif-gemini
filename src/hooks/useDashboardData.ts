import { useMemo } from 'react';
import { SalesRecord, AggregatedData, DayData } from '../types';

export function useDashboardData(
  records: SalesRecord[] = [],
  filters: {
    plant: string;
    invType: string;
    segment: string;
    customer: string;
    accMgr: string;
    dateFrom: string;
    dateTo: string;
  }
) {
  const filtered = useMemo(() => {
    if (!records) return [];
    return records.filter(r => {
      const matchPlant = filters.plant === 'ALL' || r.plant === filters.plant;
      const matchInv = filters.invType === 'ALL' || r.invoiceType === filters.invType;
      const matchSeg = filters.segment === 'ALL' || r.segment === filters.segment;
      const matchCust = filters.customer === 'ALL' || r.customer === filters.customer;
      const matchAcc = filters.accMgr === 'ALL' || r.accountManager === filters.accMgr;
      const rDate = r.billingDate;
      const matchDateFrom = !filters.dateFrom || rDate >= filters.dateFrom;
      const matchDateTo = !filters.dateTo || rDate <= filters.dateTo;
      
      return matchPlant && matchInv && matchSeg && matchCust && matchAcc && matchDateFrom && matchDateTo;
    });
  }, [records, filters]);

  // Period Comparison Logic
  const previousPeriod = useMemo(() => {
    if (!filters.dateFrom || !filters.dateTo) return [];
    const start = new Date(filters.dateFrom);
    const end = new Date(filters.dateTo);
    const duration = end.getTime() - start.getTime();
    
    const pEnd = new Date(start.getTime() - 86400000); // Day before current start
    const pStart = new Date(pEnd.getTime() - duration);
    
    const pStartStr = pStart.toISOString().split('T')[0];
    const pEndStr = pEnd.toISOString().split('T')[0];

    return records.filter(r => {
      const matchPlant = filters.plant === 'ALL' || r.plant === filters.plant;
      const matchInv = filters.invType === 'ALL' || r.invoiceType === filters.invType;
      const matchSeg = filters.segment === 'ALL' || r.segment === filters.segment;
      const matchCust = filters.customer === 'ALL' || r.customer === filters.customer;
      const matchAcc = filters.accMgr === 'ALL' || r.accountManager === filters.accMgr;
      return matchPlant && matchInv && matchSeg && matchCust && matchAcc && r.billingDate >= pStartStr && r.billingDate <= pEndStr;
    });
  }, [records, filters]);

  const kpis = useMemo(() => {
    const calc = (recs: SalesRecord[]) => {
      const totalSales = recs.reduce((sum, r) => sum + r.salesLacs, 0);
      const onTimeCount = recs.reduce((sum, r) => sum + r.onTime, 0);
      const failureCount = recs.reduce((sum, r) => sum + r.failure, 0);
      const totalDeliveries = onTimeCount + failureCount;
      const otifValue = totalDeliveries > 0 ? (onTimeCount / totalDeliveries) * 100 : 0;
      return { totalSales, onTimeCount, failureCount, totalDeliveries, otifValue };
    };

    const current = calc(filtered);
    const prev = calc(previousPeriod);

    const getDelta = (curr: number, prevVal: number) => {
      if (prevVal === 0) return 0;
      return ((curr - prevVal) / prevVal) * 100;
    };

    return {
      totalSales: current.totalSales,
      infaSales: filtered.filter(r => r.plant === 'INFA').reduce((sum, r) => sum + r.salesLacs, 0),
      infbSales: filtered.filter(r => r.plant === 'INFB').reduce((sum, r) => sum + r.salesLacs, 0),
      onTimeCount: current.onTimeCount,
      failureCount: current.failureCount,
      totalDeliveries: current.totalDeliveries,
      otifPct: current.totalDeliveries > 0 ? current.otifValue.toFixed(1) + '%' : '—',
      otifVal: current.otifValue,
      customers: new Set(filtered.map(r => r.customer)).size,
      deltas: {
        sales: getDelta(current.totalSales, prev.totalSales),
        otif: current.otifValue - prev.otifValue,
        failures: getDelta(current.failureCount, prev.failureCount)
      }
    };
  }, [filtered, previousPeriod]);

  const chartData = useMemo(() => {
    // Daily
    const dailyMap: Record<string, DayData & { ts: number }> = {};
    if (!filtered) return { days: [], segmentData: { labels: [], data: [] }, accMgrData: { labels: [], data: [] }, paretoData: { labels: [], datasets: [] }, invData: { labels: [], data: [] }, prodNpdData: { labels: [], datasets: [] }, schPoData: { labels: [], datasets: [] }, topCustData: { labels: [], data: [] }, topMatData: { labels: [], data: [] }, splitData: { labels: [], data: [] } };
    
    // Find absolute date range in filtered data
    let minTs = Infinity;
    let maxTs = -Infinity;
    
    filtered.forEach(r => {
      const d = new Date(r.billingDate);
      if (isNaN(d.getTime())) return;
      const ts = d.getTime();
      if (ts < minTs) minTs = ts;
      if (ts > maxTs) maxTs = ts;
    });

    if (minTs !== Infinity) {
      // Create continuous timeline from min to max
      const curr = new Date(minTs);
      const end = new Date(maxTs);
      while (curr <= end) {
        const dk = curr.toISOString().split('T')[0];
        // For display we'll still want the pretty date
        const displayDate = curr.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).replace(' ', '-');
        if (!dailyMap[dk]) dailyMap[dk] = { d: displayDate, infa: 0, infb: 0, ts: curr.getTime() };
        curr.setDate(curr.getDate() + 1);
      }
    }

    filtered.forEach(r => {
      const d = new Date(r.billingDate);
      if (isNaN(d.getTime())) return;
      const dk = r.billingDate.split('T')[0]; // billingDate is already YYYY-MM-DD
      if (dailyMap[dk]) {
        if (r.plant === 'INFA') dailyMap[dk].infa += r.salesLacs;
        else dailyMap[dk].infb += r.salesLacs;
      }
    });
    const days = Object.values(dailyMap).sort((a, b) => a.ts - b.ts);

    // Segment
    const segMap: Record<string, number> = {};
    filtered.forEach(r => {
      if (r.salesLacs > 0) segMap[r.segment] = (segMap[r.segment] || 0) + r.salesLacs;
    });
    const segmentData = {
      labels: Object.keys(segMap),
      data: Object.values(segMap).map(v => Number(v.toFixed(2)))
    };

    // Account Manager
    const accMap: Record<string, number> = {};
    filtered.forEach(r => {
      const mgr = r.accountManager || 'Unassigned';
      accMap[mgr] = (accMap[mgr] || 0) + r.salesLacs;
    });
    const accMgrData = {
      labels: Object.keys(accMap).sort((a, b) => accMap[b] - accMap[a]),
      data: Object.keys(accMap).sort((a, b) => accMap[b] - accMap[a]).map(k => Number(accMap[k].toFixed(2)))
    };

    // Pareto: Delivery Variance (Failure by Customer)
    const failMap: Record<string, number> = {};
    filtered.forEach(r => {
      if (r.failure > 0) failMap[r.customer] = (failMap[r.customer] || 0) + r.failure;
    });
    const totalFails = Object.values(failMap).reduce((a, b) => a + b, 0);
    const sortedFails = Object.entries(failMap).sort((a, b) => b[1] - a[1]);
    let runningSum = 0;
    const paretoLabels = sortedFails.map(f => f[0]).slice(0, 8);
    const paretoBarData = sortedFails.map(f => f[1]).slice(0, 8);
    const paretoLineData = sortedFails.slice(0, 8).map(f => {
      runningSum += f[1];
      return totalFails > 0 ? (runningSum / totalFails) * 100 : 0;
    });

    const paretoData = {
      labels: paretoLabels,
      datasets: [
        {
          type: 'bar' as const,
          label: 'Failures',
          data: paretoBarData,
          backgroundColor: '#fda4afcc',
          borderRadius: 4,
          yAxisID: 'y'
        },
        {
          type: 'line' as const,
          label: 'Cumulative %',
          data: paretoLineData,
          borderColor: '#f43f5e',
          borderWidth: 2,
          pointRadius: 4,
          yAxisID: 'y2'
        }
      ]
    };

    // Invoice Type
    const invMap: Record<string, number> = {};
    filtered.forEach(r => {
      invMap[r.invoiceType] = (invMap[r.invoiceType] || 0) + r.salesLacs;
    });
    const invData = {
      labels: Object.keys(invMap).sort((a, b) => invMap[b] - invMap[a]),
      data: Object.keys(invMap).sort((a, b) => invMap[b] - invMap[a]).map(k => Number(invMap[k].toFixed(2)))
    };

    // Prod vs NPD
    const prodTypes = ['Produ', 'NPD'];
    const prodNpdData = {
      labels: ['INFA', 'INFB'],
      datasets: prodTypes.map((t, idx) => ({
        label: t === 'Produ' ? 'Production' : t,
        data: ['INFA', 'INFB'].map(p => 
          Number(filtered.filter(r => r.plant === p && r.productType === t).reduce((s, r) => s + r.salesLacs, 0).toFixed(2))
        ),
        backgroundColor: idx === 0 ? '#1a56dbcc' : '#6366f1cc',
        borderRadius: 4
      }))
    };

    // Sch / PO / IU
    const orderTypes = ['SCH', 'PO', 'IU'];
    const schPoData = {
      labels: ['INFA', 'INFB'],
      datasets: orderTypes.map((t, idx) => ({
        label: t,
        data: ['INFA', 'INFB'].map(p => 
          Number(filtered.filter(r => r.plant === p && r.orderType === t).reduce((s, r) => s + r.salesLacs, 0).toFixed(2))
        ),
        backgroundColor: ['#0ea5e9cc','#10b981cc','#f59e0bcc','#f43f5ecc'][idx],
        borderRadius: 4
      }))
    };

    // Top 10 Customers
    const custSales: Record<string, number> = {};
    filtered.forEach(r => {
      const c = r.customer || 'Unknown';
      custSales[c] = (custSales[c] || 0) + r.salesLacs;
    });
    const topCusts = Object.entries(custSales).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const topCustData = { labels: topCusts.map(i => i[0]), data: topCusts.map(i => i[1]) };

    // Top 10 Materials
    const matSales: Record<string, number> = {};
    filtered.forEach(r => {
      if (r.material) matSales[r.material] = (matSales[r.material] || 0) + r.salesLacs;
    });
    const topMats = Object.entries(matSales).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const topMatData = { labels: topMats.map(i => i[0]), data: topMats.map(i => i[1]) };

    // STO vs External Split
    const splitMap = { STO: 0, External: 0 };
    filtered.forEach(r => {
      if (r.invoiceType.includes('STO')) splitMap.STO += r.salesLacs;
      else splitMap.External += r.salesLacs;
    });
    const splitData = {
      labels: ['External Sales', 'STO Inter-plant'],
      data: [Number(splitMap.External.toFixed(2)), Number(splitMap.STO.toFixed(2))]
    };

    return { days, segmentData, accMgrData, paretoData, invData, prodNpdData, schPoData, topCustData, topMatData, splitData };
  }, [filtered, filters.plant]);

  const aggregatedTableData = useMemo(() => {
    const map: Record<string, AggregatedData> = {};
    filtered.forEach(r => {
      const k = `${r.plant}||${r.customer}||${r.segment}||${r.invoiceType}||${r.accountManager}`;
      if (!map[k]) {
        map[k] = {
          plant: r.plant,
          customer: r.customer,
          segment: r.segment,
          accMgr: r.accountManager,
          invType: r.invoiceType,
          sales: 0, qty: 0, onTime: 0, fail: 0, otif: 0
        };
      }
      map[k].sales += r.salesLacs;
      map[k].qty += r.quantity;
      map[k].onTime += r.onTime;
      map[k].fail += r.failure;
    });

    return Object.values(map).map(r => {
      const tot = r.onTime + r.fail;
      return {
        ...r,
        sales: Number(r.sales.toFixed(2)),
        otif: tot > 0 ? Number(((r.onTime / tot) * 100).toFixed(1)) : null
      } as AggregatedData;
    });
  }, [filtered]);

  return { filtered, kpis, chartData, aggregatedTableData };
}
