import React, { useState, useEffect } from 'react';
import LunarHeader from './components/LunarHeader';
import Calendar from './components/Calendar';
import DayDetailDrawer from './components/DayDetailDrawer';
import Insights from './components/Insights';
import { CalendarIcon, InsightsIcon, LogIcon, PlusIcon } from './components/SvgIcons';
import { 
  formatDate, 
  calculateCycleStatsAndPredictions, 
  getCycleSummary, 
  parseDate 
} from './utils/cycleCalculator';

// Helper component to render logged details on the selected date
function LoggedDetailsSummary({ log, onEditClick }) {
  const symptomLabels = {
    cramps: '經痛',
    tenderness: '乳房脹痛',
    headache: '頭痛',
    mood: '情緒波動',
    fatigue: '疲勞',
    bloating: '腹脹',
    acne: '青春痘'
  };

  const mucusLabels = {
    dry: '乾燥',
    sticky: '黏稠',
    creamy: '乳狀',
    watery: '水狀',
    'egg-white': '蛋白狀'
  };

  const flowLabels = {
    light: '月經量：量少',
    medium: '月經量：量中',
    heavy: '月經量：量多'
  };

  const medLabels = {
    contraceptive: '服藥：避孕藥',
    painkiller: '服藥：止痛藥'
  };

  const items = [];
  
  if (log.flow && log.flow !== 'none') {
    items.push({
      label: flowLabels[log.flow],
      type: 'flow'
    });
  }
  
  if (log.spotting) {
    items.push({
      label: '點狀出血',
      type: 'spotting'
    });
  }

  if (log.symptoms && log.symptoms.length > 0) {
    log.symptoms.forEach(sym => {
      items.push({
        label: symptomLabels[sym] || sym,
        type: 'symptom'
      });
    });
  }

  if (log.medications && log.medications.length > 0) {
    log.medications.forEach(med => {
      const label = med.startsWith('custom_')
        ? `服藥：${med.substring(7)}`
        : (medLabels[med] || med);
      items.push({
        label,
        type: 'medication'
      });
    });
  }

  if (log.mucus && log.mucus !== 'none') {
    items.push({
      label: `黏液：${mucusLabels[log.mucus] || log.mucus}`,
      type: 'mucus'
    });
  }

  if (log.temp) {
    items.push({
      label: `體溫：${log.temp} °${log.tempUnit || 'C'}`,
      type: 'temp'
    });
  }

  if (log.intercourse && log.intercourse !== 'none') {
    const isProtected = log.intercourse === 'protected';
    items.push({
      label: isProtected ? '性行為 (有避孕)' : '性行為 (無避孕)',
      type: 'intercourse'
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '6px', 
        justifyContent: 'center',
        maxHeight: '110px',
        overflowY: 'auto',
        padding: '2px'
      }}>
        {items.map((item, idx) => (
          <div 
            key={idx} 
            style={{
              background: 'rgba(91, 99, 122, 0.06)',
              border: '1px solid rgba(91, 99, 122, 0.1)',
              borderRadius: '10px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: '600',
              color: 'var(--text-slate)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ 
              width: '5px', 
              height: '5px', 
              borderRadius: '50%', 
              backgroundColor: item.type === 'flow' ? '#5B637A' : (item.type === 'intercourse' || item.type === 'symptom' ? '#DBB57F' : '#B2ABB4')
            }} />
            {item.label}
          </div>
        ))}
      </div>
      
      {log.notes && (
        <div style={{ 
          padding: '10px 12px', 
          background: 'rgba(255, 255, 255, 0.22)', 
          border: '1px solid rgba(91, 99, 122, 0.06)',
          borderRadius: '14px',
          fontSize: '12px',
          color: 'var(--text-slate)',
          lineHeight: '1.5',
          textAlign: 'left',
          wordBreak: 'break-all',
          whiteSpace: 'pre-wrap',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <span style={{ fontWeight: '700', color: 'var(--text-slate-light)', display: 'block', marginBottom: '4px', fontSize: '11px' }}>備註</span>
          {log.notes}
        </div>
      )}
      
      <button className="btn-primary" onClick={onEditClick}>
        <LogIcon size={18} color="var(--bg-cream)" />
        <span>修改生理狀態</span>
      </button>
    </div>
  );
}

export default function App() {
  const todayStr = formatDate(new Date());

  // 1. Core States
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'insights' | 'settings'
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [logs, setLogs] = useState({});
  const [stats, setStats] = useState({
    avgCycleLength: 28,
    avgPeriodLength: 5,
    actualPeriods: [],
    predictions: { periodRanges: [], fertileRanges: [], ovulationDates: [] }
  });

  // 2. Load logs from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lunaflow_logs');
      if (stored) {
        const parsed = JSON.parse(stored);
        setLogs(parsed);
      }
    } catch (e) {
      console.error('Failed to load logs from localStorage:', e);
    }
  }, []);

  // 3. Keep calculations and stats synchronized whenever logs change
  useEffect(() => {
    const calculatedStats = calculateCycleStatsAndPredictions(logs);
    setStats(calculatedStats);
  }, [logs]);

  // 4. Save to LocalStorage helper
  const saveLogs = (newLogs) => {
    setLogs(newLogs);
    try {
      localStorage.setItem('lunaflow_logs', JSON.stringify(newLogs));
    } catch (e) {
      console.error('Failed to save logs to localStorage:', e);
    }
  };

  // 5. Drawer callbacks
  const handleDateSelect = (dateStr) => {
    if (selectedDate === dateStr) {
      setIsDrawerOpen(true);
    } else {
      setSelectedDate(dateStr);
    }
  };

  const handleSaveLog = (dateStr, data) => {
    const updatedLogs = { ...logs };
    // If flow is 'none' and no symptoms/mucus/temp/intercourse, delete key to keep storage clean
    const hasData = data.flow !== 'none' || 
                    data.spotting || 
                    data.symptoms.length > 0 || 
                    data.mucus !== 'none' || 
                    data.temp !== '' || 
                    data.intercourse !== 'none';

    if (hasData) {
      updatedLogs[dateStr] = data;
    } else {
      delete updatedLogs[dateStr];
    }
    
    saveLogs(updatedLogs);
    setIsDrawerOpen(false);
  };

  const handleDeleteLog = (dateStr) => {
    const updatedLogs = { ...logs };
    delete updatedLogs[dateStr];
    saveLogs(updatedLogs);
    setIsDrawerOpen(false);
  };

  // 6. Settings action handlers
  const handleClearAllData = () => {
    if (confirm('確定要清除所有生理期紀錄嗎？此動作無法復原。')) {
      saveLogs({});
      alert('已成功清除所有資料。');
    }
  };

  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify(logs, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'lunaflow_data_export.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (e) {
      alert('資料匯出失敗，請重試。');
    }
  };

  const handleImportData = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (typeof parsed === 'object' && parsed !== null) {
            saveLogs(parsed);
            alert('資料匯入成功！');
          } else {
            alert('檔案格式錯誤，請確保匯入正確的備份 JSON 檔案。');
          }
        } catch (error) {
          alert('解析檔案失敗，請確保是正確的 JSON 格式。');
        }
      };
    }
  };

  // Calculate dynamic cycle summary for the selected date
  const summarySelected = getCycleSummary(selectedDate, logs, stats);
  const summaryToday = getCycleSummary(todayStr, logs, stats);
  
  const selDateObj = parseDate(selectedDate);
  const selDateTitle = `${selDateObj.getMonth() + 1}月${selDateObj.getDate()}日`;
  const hasLog = !!logs[selectedDate];

  return (
    <>
      {/* Background glowing decorations */}
      <div className="ambient-bg">
        <div className="blob-1" />
        <div className="blob-2" />
      </div>

      {/* Main Tab Renderings */}
      {activeTab === 'calendar' && (
        <>
          <LunarHeader 
            summaryData={summaryToday} 
            cycleLength={stats.avgCycleLength} 
          />
          
          <Calendar 
            currentDateStr={todayStr}
            selectedDateStr={selectedDate}
            onDateSelect={handleDateSelect}
            logs={logs}
            stats={stats}
          />
          
          {/* Quick Add Button / Floating Action area */}
          <div className="quick-action-section">
            <div className="status-summary-card">
              <h3 className="status-title">
                {selDateTitle}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-slate-light)', marginBottom: '16px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                生理階段：{summarySelected.phaseName}。{"\n"}{summarySelected.summary}
              </p>
              
              {hasLog ? (
                <LoggedDetailsSummary 
                  log={logs[selectedDate]} 
                  onEditClick={() => setIsDrawerOpen(true)} 
                />
              ) : (
                <button className="btn-primary" onClick={() => setIsDrawerOpen(true)}>
                  <LogIcon size={18} color="var(--bg-cream)" />
                  <span>{selectedDate === todayStr ? '記錄今日生理狀態' : '記錄生理狀態'}</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'insights' && (
        <Insights logs={logs} stats={stats} />
      )}

      {activeTab === 'settings' && (
        <div className="insights-container">
          <h2 className="section-title">設定與備份</h2>
          
          <div className="insight-card-full">
            <h3 className="card-title" style={{ marginBottom: '8px' }}>資料隱私與安全性</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-slate-light)', lineHeight: '1.6' }}>
              LunaFlow 重視您的個人私密健康數據。本軟體不設遠端伺服器，**所有紀錄均儲存在您目前的手機或電腦瀏覽器 (LocalStorage) 中**，不會上傳至任何雲端。清除瀏覽器快取或重設手機瀏覽器可能會清除此數據，建議定期下載進行備份。
            </p>
          </div>

          <div className="insight-card-full" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 className="card-title">備份與移轉</h3>
            
            <button className="btn-secondary" onClick={handleExportData} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span>下載備份資料 (JSON)</span>
            </button>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-slate-light)' }}>
                匯入備份資料
              </span>
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportData}
                style={{
                  width: '100%',
                  fontSize: '12px',
                  fontFamily: 'var(--font-family)',
                  color: 'var(--text-slate)',
                  border: '1px solid var(--panel-border)',
                  padding: '8px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.4)'
                }}
              />
            </div>
          </div>

          <div className="insight-card-full" style={{ borderColor: 'rgba(91,99,122,0.3)' }}>
            <h3 className="card-title" style={{ color: 'var(--text-slate)', marginBottom: '8px' }}>危險操作</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-slate-light)', marginBottom: '14px' }}>
              此動作將永久刪除您儲存在此裝置上的所有月經記錄，此操作無法復原。
            </p>
            <button 
              className="btn-secondary" 
              onClick={handleClearAllData}
              style={{
                backgroundColor: 'rgba(91, 99, 122, 0.05)',
                color: 'rgba(91, 99, 122, 0.8)',
                border: '1px solid rgba(91, 99, 122, 0.2)'
              }}
            >
              清除所有紀錄
            </button>
          </div>

          <div style={{ textAlign: 'center', padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <img 
              src="/lunaflow_icon.png" 
              alt="LunaFlow Logo" 
              style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '16px', 
                boxShadow: '0 4px 12px rgba(91, 99, 122, 0.1)' 
              }} 
            />
            <span style={{ fontSize: '11px', color: 'var(--text-slate-muted)', fontWeight: '600' }}>
              LunaFlow 經期日誌 v1.0.0
            </span>
          </div>
        </div>
      )}

      {/* Slide-out Logger Drawer */}
      {isDrawerOpen && (
        <DayDetailDrawer 
          dateStr={selectedDate}
          logs={logs}
          stats={stats}
          onSave={handleSaveLog}
          onDelete={handleDeleteLog}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Navigation Tab Bar */}
      <nav className="bottom-nav">
        <button 
          className={`nav-tab ${activeTab === 'calendar' ? 'nav-tab-active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <CalendarIcon size={20} />
          <span>月曆</span>
        </button>
        
        <button 
          className={`nav-tab ${activeTab === 'insights' ? 'nav-tab-active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          <InsightsIcon size={20} />
          <span>趨勢</span>
        </button>
        
        <button 
          className={`nav-tab ${activeTab === 'settings' ? 'nav-tab-active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          {/* Using LogIcon for settings or we can use custom SVG inline gear */}
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>設定</span>
        </button>
      </nav>
    </>
  );
}
