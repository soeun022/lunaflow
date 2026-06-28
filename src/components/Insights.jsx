import React, { useState } from 'react';
import { extractActualPeriods, differenceInDays, getDayStatus, formatDate } from '../utils/cycleCalculator';

export default function Insights({ logs, stats }) {
  const [activeCycleDetail, setActiveCycleDetail] = useState(null);
  const [expandedYears, setExpandedYears] = useState({
    [new Date().getFullYear()]: true
  });

  const toggleYear = (yr) => {
    setExpandedYears(prev => ({
      ...prev,
      [yr]: !prev[yr]
    }));
  };

  const actualPeriods = stats?.actualPeriods || [];
  
  // Sort reverse chronological (newest first)
  const historyPeriods = [...actualPeriods].reverse();

  const todayStr = formatDate(new Date());

  const formatDateMD = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const getDayBefore = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const addDays = (dateStr, days) => {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const cycles = [];
  
  // 1. Add current ongoing cycle
  if (historyPeriods.length > 0) {
    const latestPeriod = historyPeriods[0];
    const ongoingDays = differenceInDays(latestPeriod.startDate, todayStr) + 1;
    const cycleLength = Math.max(stats.avgCycleLength || 28, ongoingDays);
    
    cycles.push({
      isOngoing: true,
      startDate: latestPeriod.startDate,
      length: cycleLength,
      title: `目前的月經週期：${ongoingDays} 天`,
      subtitle: `${formatDateMD(latestPeriod.startDate)}已開始`
    });
  }

  // 2. Add completed past cycles
  for (let i = 0; i < historyPeriods.length - 1; i++) {
    const newerPeriod = historyPeriods[i];
    const olderPeriod = historyPeriods[i + 1];
    const cycleLength = differenceInDays(olderPeriod.startDate, newerPeriod.startDate);
    
    cycles.push({
      isOngoing: false,
      startDate: olderPeriod.startDate,
      length: cycleLength,
      title: `${cycleLength} 天`,
      subtitle: `${formatDateMD(olderPeriod.startDate)} - ${formatDateMD(getDayBefore(newerPeriod.startDate))}`
    });
  }

  // Group cycles by year
  const cyclesByYear = {};
  cycles.forEach(cycle => {
    const year = new Date(cycle.startDate + 'T00:00:00').getFullYear();
    if (!cyclesByYear[year]) {
      cyclesByYear[year] = [];
    }
    cyclesByYear[year].push(cycle);
  });

  const years = Object.keys(cyclesByYear).map(Number).sort((a, b) => b - a);

  // If logs are empty, show a neat empty state guiding the user
  if (historyPeriods.length === 0) {
    return (
      <div className="insights-container">
        <h2 className="section-title">數據趨勢</h2>
        <div className="insight-card-full" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            {/* Draw a custom SVG analytics graph placeholder */}
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--text-slate)" strokeWidth="1.5">
              <path d="M3 3v18h18" strokeLinecap="round" />
              <rect x="6" y="9" width="3" height="9" rx="1" fill="rgba(91, 99, 122, 0.15)" stroke="var(--text-slate)" strokeWidth="1.5" />
              <rect x="12" y="5" width="3" height="13" rx="1" fill="rgba(219, 181, 127, 0.15)" stroke="var(--accent-gold)" strokeWidth="1.5" />
              <rect x="18" y="12" width="3" height="6" rx="1" fill="rgba(91, 99, 122, 0.1)" stroke="var(--neutral-mist)" strokeWidth="1.5" />
            </svg>
          </div>
          <h3 className="card-title" style={{ marginBottom: '8px', fontSize: '16px' }}>尚未累積足夠數據</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-slate-light)', lineHeight: '1.6' }}>
            請在月曆上選擇日期，並點擊下方「記錄今日生理狀態」按鈕，開始輸入您的月經來潮日。系統將在有記錄後，為您分析平均長度與歷史規律性。
          </p>
        </div>
      </div>
    );
  }

  const formatDateYMD = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const formatDateMDOnly = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const getCycleDetails = (c) => {
    if (c.isOngoing) {
      const period = stats.actualPeriods.find(p => p.startDate === c.startDate);
      const periodEnd = period ? period.endDate : addDays(c.startDate, (stats.avgPeriodLength || 5) - 1);
      
      // Find the first predicted ovulation date that occurs after this cycle's start date
      const ovulationDate = stats.predictions.ovulationDates.find(d => d > c.startDate) || addDays(c.startDate, 14);
      
      // Find the first predicted fertile range that starts after or on this cycle's start date
      const fertileRange = stats.predictions.fertileRanges.find(r => r.startDate >= c.startDate) || {
        startDate: addDays(ovulationDate, -5),
        endDate: addDays(ovulationDate, 1)
      };
      
      return {
        periodStart: c.startDate,
        periodEnd: periodEnd,
        ovulationDate: ovulationDate,
        fertileStart: fertileRange.startDate,
        fertileEnd: fertileRange.endDate,
        isPredicted: true
      };
    } else {
      const nextCycleStart = addDays(c.startDate, c.length);
      const period = stats.actualPeriods.find(p => p.startDate === c.startDate);
      const periodEnd = period ? period.endDate : addDays(c.startDate, (stats.avgPeriodLength || 5) - 1);
      const ovulationDate = addDays(nextCycleStart, -14);
      const fertileStart = addDays(ovulationDate, -5);
      const fertileEnd = addDays(ovulationDate, 1);
      return {
        periodStart: c.startDate,
        periodEnd: periodEnd,
        ovulationDate: ovulationDate,
        fertileStart: fertileStart,
        fertileEnd: fertileEnd,
        isPredicted: false
      };
    }
  };

  if (activeCycleDetail) {
    const details = getCycleDetails(activeCycleDetail);
    
    // Find menstrual length for the active cycle
    const period = stats.actualPeriods.find(p => p.startDate === activeCycleDetail.startDate);
    const periodLength = period ? period.length : (stats.avgPeriodLength || 5);
    
    return (
      <div className="insights-container" style={{ animation: 'fadeIn 0.25s ease-out' }}>
        {/* Back Button & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => setActiveCycleDetail(null)}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-slate)',
              transition: 'transform 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(-3px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <h2 className="section-title" style={{ margin: 0 }}>週期詳情</h2>
        </div>

        {/* Cycle Overview Card */}
        <div className="history-cycle-card" style={{ marginBottom: '20px', cursor: 'default' }}>
          <div className="history-cycle-header" style={{ borderBottom: '1px solid rgba(91, 99, 122, 0.08)', paddingBottom: '10px', marginBottom: '8px' }}>
            <div className="history-cycle-meta">
              <h4 className="history-cycle-title" style={{ fontSize: '18px' }}>{activeCycleDetail.title}</h4>
              <span className="history-cycle-dates" style={{ fontSize: '13px' }}>{activeCycleDetail.subtitle}</span>
            </div>
            {activeCycleDetail.isOngoing && (
              <span style={{
                background: 'rgba(91, 99, 122, 0.1)',
                color: 'var(--text-slate)',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '700'
              }}>
                進行中
              </span>
            )}
          </div>
          
          {/* Dots chain */}
          <div className="history-cycle-dots" style={{ gap: '6px' }}>
            {Array.from({ length: activeCycleDetail.length }).map((_, dayIdx) => {
              const dDateStr = addDays(activeCycleDetail.startDate, dayIdx);
              const dStatus = getDayStatus(dDateStr, logs, stats);
              
              let statusClass = 'dot-safe';
              if (dStatus === 'actual-period') statusClass = 'dot-actual';
              else if (dStatus === 'predicted-period') statusClass = 'dot-predicted';
              else if (dStatus === 'ovulation') statusClass = 'dot-ovulation';
              else if (dStatus === 'fertile') statusClass = 'dot-fertile';
              
              return (
                <span 
                  key={dayIdx} 
                  className={`cycle-status-dot ${statusClass}`} 
                  style={{ width: '10px', height: '10px' }}
                  title={`第 ${dayIdx + 1} 天: ${dDateStr}`}
                />
              );
            })}
          </div>
        </div>

        {/* Menstrual & Cycle Length Columns (Only for completed cycles) */}
        {!activeCycleDetail.isOngoing && (() => {
          const periodStatus = (periodLength >= 3 && periodLength <= 7) ? '正常' : '不正常';
          const cycleStatus = (activeCycleDetail.length >= 21 && activeCycleDetail.length <= 35) ? '正常' : '不正常';

          return (
            <div className="insight-grid-2" style={{ marginBottom: '20px' }}>
              <div className="stat-box">
                <span className="stat-lbl">月經長度</span>
                <span className="stat-val" style={{ fontSize: '20px', fontWeight: '800' }}>{periodLength} 天</span>
                <span className="stat-sub" style={{ 
                  color: 'var(--text-slate)',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {periodStatus}
                  <span style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    backgroundColor: periodStatus === '正常' ? '#60785C' : '#B86B4B',
                    display: 'inline-block'
                  }} />
                </span>
              </div>
              <div className="stat-box">
                <span className="stat-lbl">週期長度</span>
                <span className="stat-val" style={{ fontSize: '20px', fontWeight: '800' }}>{activeCycleDetail.length} 天</span>
                <span className="stat-sub" style={{ 
                  color: 'var(--text-slate)',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {cycleStatus}
                  <span style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    backgroundColor: cycleStatus === '正常' ? '#60785C' : '#B86B4B',
                    display: 'inline-block'
                  }} />
                </span>
              </div>
            </div>
          );
        })()}

        {/* Details timeline card */}
        <div className="insight-card-full" style={{ padding: '20px 16px' }}>
          <h3 className="card-title" style={{ marginBottom: '18px', fontSize: '16px' }}>週期事件分析</h3>
          
          <div className="cycle-timeline-list">
            
            {/* 1. Period */}
            <div className="timeline-item-detail">
              <div className="timeline-icon-wrapper" style={{ backgroundColor: 'rgba(91, 99, 122, 0.1)' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#5B637A' }} />
              </div>
              <div className="timeline-content-detail">
                <span className="timeline-lbl-detail">經期時間</span>
                <span className="timeline-val-detail">
                  {formatDateYMD(details.periodStart)} – {formatDateMDOnly(details.periodEnd)}
                </span>
                <span className="timeline-desc-detail">
                  {details.isPredicted ? '預計經期長度：' : '經期長度：'} 共 {differenceInDays(details.periodStart, details.periodEnd) + 1} 天
                </span>
              </div>
            </div>

            {/* 2. Fertile Window */}
            <div className="timeline-item-detail">
              <div className="timeline-icon-wrapper" style={{ backgroundColor: 'rgba(219, 181, 127, 0.15)' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#DBB57F' }} />
              </div>
              <div className="timeline-content-detail">
                <span className="timeline-lbl-detail">排卵期 (危險期)</span>
                <span className="timeline-val-detail">
                  {formatDateYMD(details.fertileStart)} – {formatDateMDOnly(details.fertileEnd)}
                </span>
                <span className="timeline-desc-detail">
                  此期間受孕機率高，若無避孕規劃請多加留意。
                </span>
              </div>
            </div>

            {/* 3. Ovulation Day */}
            <div className="timeline-item-detail">
              <div className="timeline-icon-wrapper" style={{ backgroundColor: 'rgba(219, 181, 127, 0.25)', border: '1px solid #DBB57F' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#DBB57F' }} />
              </div>
              <div className="timeline-content-detail">
                <span className="timeline-lbl-detail">預估排卵日</span>
                <span className="timeline-val-detail">
                  {formatDateYMD(details.ovulationDate)}
                </span>
                <span className="timeline-desc-detail">
                  卵子排出的日子，為此週期中受孕機率最高的一天。
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Generate bar heights for last 10 periods (max height 60px)
  const chartPeriods = [...actualPeriods].slice(-10); // Last 10 chronological
  const maxLength = Math.max(...chartPeriods.map(p => p.length), 7); // minimum divisor of 7 for scale

  return (
    <div className="insights-container">
      <h2 className="section-title">數據趨勢</h2>

      {/* Grid statistics cards */}
      <div className="insight-grid-2">
        <div className="stat-box">
          <span className="stat-lbl">平均月經長度</span>
          <span className="stat-val">{stats.avgPeriodLength} 天</span>
          <span className="stat-sub">正常範圍：3 - 7 天</span>
        </div>
        <div className="stat-box">
          <span className="stat-lbl">平均週期長度</span>
          <span className="stat-val">{stats.avgCycleLength} 天</span>
          <span className="stat-sub">正常範圍：21 - 35 天</span>
        </div>
      </div>

      {/* 2. Visual Period Length Bar Chart */}
      <div className="insight-card-full">
        <h3 className="card-title">近 10 次經期長度對比</h3>
        <div className="bar-chart">
          {chartPeriods.map((period, index) => {
            const heightPercent = (period.length / maxLength) * 80; // Scale height
            // Format start date label e.g., 6/12
            const d = new Date(period.startDate + 'T00:00:00');
            const dateLabel = `${d.getMonth() + 1}/${d.getDate()}`;
            
            return (
              <div key={index} className="bar-column">
                <div 
                  className="bar-rect" 
                  style={{ 
                    height: `${Math.max(15, heightPercent)}px`,
                    backgroundColor: index === chartPeriods.length - 1 ? 'var(--text-slate)' : 'var(--panel-taupe)'
                  }} 
                />
                <span className="bar-lbl" style={{ fontWeight: '700' }}>{period.length}天</span>
                <span className="bar-lbl">{dateLabel}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2.5. Visual Cycle Length Trend Chart */}
      <div className="insight-card-full">
        <h3 className="card-title">近 10 次月經週期趨勢</h3>
        {(() => {
          const completedCyclesChronological = cycles.filter(c => !c.isOngoing).reverse();
          const chartCycles = completedCyclesChronological.slice(-10);
          const maxCycleLength = Math.max(...chartCycles.map(c => c.length), 35);
          const minCycleLength = Math.min(...chartCycles.map(c => c.length), 21);
          
          if (chartCycles.length > 0) {
            // SVG setup
            const width = 500;
            const height = 160;
            const paddingLeft = 40;
            const paddingRight = 40;
            const paddingTop = 30;
            const paddingBottom = 30;
            const chartWidth = width - paddingLeft - paddingRight;
            const chartHeight = height - paddingTop - paddingBottom;
            const bottomY = height - paddingBottom;
            
            // Map values to coordinates
            const rangeMin = Math.max(0, minCycleLength - 3);
            const rangeMax = maxCycleLength + 3;
            const rangeDiff = rangeMax - rangeMin || 1;
            
            const points = chartCycles.map((cycle, index) => {
              const x = chartCycles.length === 1
                ? width / 2
                : paddingLeft + index * (chartWidth / (chartCycles.length - 1));
              const y = bottomY - ((cycle.length - rangeMin) / rangeDiff) * chartHeight;
              
              const d = new Date(cycle.startDate + 'T00:00:00');
              const dateLabel = `${d.getMonth() + 1}/${d.getDate()}`;
              
              return { x, y, length: cycle.length, dateLabel };
            });
            
            // Build Bezier path commands
            let linePath = '';
            let areaPath = '';
            
            if (points.length >= 2) {
              linePath = `M ${points[0].x} ${points[0].y}`;
              for (let i = 0; i < points.length - 1; i++) {
                const curr = points[i];
                const next = points[i + 1];
                const cp1x = curr.x + (next.x - curr.x) / 2;
                const cp1y = curr.y;
                const cp2x = curr.x + (next.x - curr.x) / 2;
                const cp2y = next.y;
                linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
              }
              areaPath = linePath + ` L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
            }
            
            return (
              <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginTop: '12px' }}>
                <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
                  <defs>
                    <linearGradient id="gold-area-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1={paddingLeft} y1={bottomY} x2={width - paddingRight} y2={bottomY} stroke="rgba(91, 99, 122, 0.08)" strokeWidth="1.5" />
                  <line x1={paddingLeft} y1={bottomY - chartHeight / 2} x2={width - paddingRight} y2={bottomY - chartHeight / 2} stroke="rgba(91, 99, 122, 0.04)" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1={paddingLeft} y1={bottomY - chartHeight} x2={width - paddingRight} y2={bottomY - chartHeight} stroke="rgba(91, 99, 122, 0.04)" strokeWidth="1" strokeDasharray="3,3" />
                  
                  {/* Fading area gradient */}
                  {areaPath && <path d={areaPath} fill="url(#gold-area-gradient)" />}
                  
                  {/* Smooth Bezier line */}
                  {linePath && (
                    <path 
                      d={linePath} 
                      fill="none" 
                      stroke="var(--accent-gold)" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  )}
                  
                  {/* Circular data points and text labels */}
                  {points.map((pt, idx) => (
                    <g key={idx}>
                      {/* Value label */}
                      <text 
                        x={pt.x} 
                        y={pt.y - 12} 
                        textAnchor="middle" 
                        fontSize="11px" 
                        fontWeight="800" 
                        fill="var(--text-slate)"
                      >
                        {pt.length}天
                      </text>
                      
                      {/* Point dot */}
                      <circle 
                        cx={pt.x} 
                        cy={pt.y} 
                        r="5" 
                        fill="var(--accent-gold)" 
                        stroke="#F7E3D0" 
                        strokeWidth="2" 
                      />
                      
                      {/* Date label */}
                      <text 
                        x={pt.x} 
                        y={height - 8} 
                        textAnchor="middle" 
                        fontSize="10px" 
                        fontWeight="600" 
                        fill="var(--text-slate-light)"
                      >
                        {pt.dateLabel}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            );
          } else {
            return (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-slate-muted)', fontSize: '13px' }}>
                需要至少兩次生理期紀錄，以計算並分析週期長度趨勢。
              </div>
            );
          }
        })()}
      </div>

      {/* 3. Detailed History List */}
      <div className="insight-card-full">
        <h3 className="card-title" style={{ marginBottom: '16px' }}>生理期歷史紀錄</h3>
        
        {/* Dot Legend */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '20px', fontSize: '11px', fontWeight: '700', color: 'var(--text-slate-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#5B637A' }} />
            <span>經期</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(91, 99, 122, 0.25)', border: '0.8px dashed #5B637A' }} />
            <span>預測經期</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#DBB57F' }} />
            <span>排卵日</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(219, 181, 127, 0.6)' }} />
            <span>排卵期</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(178, 171, 180, 0.22)' }} />
            <span>安全期</span>
          </div>
        </div>

        <div className="history-list-modern">
          {years.map(yr => {
            const isExpanded = !!expandedYears[yr];
            const yrCycles = cyclesByYear[yr] || [];
            
            return (
              <div key={yr} style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Clickable Year Divider Toggle */}
                <div 
                  className="history-year-divider"
                  onClick={() => toggleYear(yr)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                    margin: '20px 0 10px 0'
                  }}
                >
                  <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-slate)' }}>
                    {yr}
                  </span>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="var(--text-slate-light)" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{ 
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', 
                      transition: 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)' 
                    }}
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
                
                {/* Expanded Year Cycles */}
                {isExpanded && (
                  <div style={{ animation: 'fadeIn 0.22s ease-out' }}>
                    {yrCycles.map((cycle, cIdx) => (
                      <div 
                        key={cIdx}
                        className="history-cycle-card"
                        onClick={() => setActiveCycleDetail(cycle)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="history-cycle-header">
                          <div className="history-cycle-meta">
                            <h4 className="history-cycle-title">{cycle.title}</h4>
                            <span className="history-cycle-dates">{cycle.subtitle}</span>
                          </div>
                          <div className="history-cycle-chevron">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-slate-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                          </div>
                        </div>
                        
                        {/* Dot chain for days in this cycle */}
                        <div className="history-cycle-dots">
                          {Array.from({ length: cycle.length }).map((_, dayIdx) => {
                            const dDateStr = addDays(cycle.startDate, dayIdx);
                            const dStatus = getDayStatus(dDateStr, logs, stats);
                            
                            let statusClass = 'dot-safe';
                            if (dStatus === 'actual-period') statusClass = 'dot-actual';
                            else if (dStatus === 'predicted-period') statusClass = 'dot-predicted';
                            else if (dStatus === 'ovulation') statusClass = 'dot-ovulation';
                            else if (dStatus === 'fertile') statusClass = 'dot-fertile';
                            
                            return (
                              <span 
                                key={dayIdx} 
                                className={`cycle-status-dot ${statusClass}`} 
                                title={`第 ${dayIdx + 1} 天: ${dDateStr}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
