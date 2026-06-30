import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './SvgIcons';
import { formatDate, getDayStatus } from '../utils/cycleCalculator';

export default function Calendar({ 
  currentDateStr, 
  onDateSelect, 
  selectedDateStr, 
  onBatchSavePeriod,
  logs, 
  stats 
}) {
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'year'
  
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0-indexed

  // Format month/year label
  const monthLabel = `${year}年 ${month + 1}月`;

  // Get total days in the current month
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Get weekday of the 1st day of the month (0 = Sun, 6 = Sat)
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Gesture selection states & refs
  const [selectedDates, setSelectedDates] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const isSelectingRef = useRef(false);
  const selectedDatesRef = useRef([]);
  const anchorDateRef = useRef(null);       // The date where long press started
  const longPressTimerRef = useRef(null);
  const lastHoverDateRef = useRef(null);    // Last date the pointer was over (to avoid redundant updates)
  const touchStartCoordsRef = useRef({ x: 0, y: 0 });
  const wasSelectingRef = useRef(false);
  const daysGridRef = useRef(null);         // Ref to the days-grid div for non-passive touch listener

  // Helper: compute all dates between two dates (inclusive), sorted chronologically
  const getDateRange = (dateStrA, dateStrB) => {
    const a = new Date(dateStrA + 'T00:00:00');
    const b = new Date(dateStrB + 'T00:00:00');
    const start = a <= b ? a : b;
    const end = a <= b ? b : a;
    const range = [];
    const cur = new Date(start);
    while (cur <= end) {
      range.push(formatDate(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return range;
  };

  // Central handler: update selection to the range from anchor to hoverDate
  const updateSelectionRange = (hoverDate) => {
    if (!anchorDateRef.current || hoverDate === lastHoverDateRef.current) return;
    lastHoverDateRef.current = hoverDate;
    const range = getDateRange(anchorDateRef.current, hoverDate);
    selectedDatesRef.current = range;
    setSelectedDates(range);
  };

  // Global mouseup / touchend listener to safely terminate dragging gestures
  useEffect(() => {
    const handleGlobalRelease = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      
      if (isSelectingRef.current) {
        isSelectingRef.current = false;
        wasSelectingRef.current = true;
        
        // Wait a tiny bit to clear wasSelectingRef so click event handler can consume it
        setTimeout(() => {
          wasSelectingRef.current = false;
        }, 150);

        if (selectedDatesRef.current.length > 0) {
          setShowConfirmModal(true);
        }
      }
    };

    window.addEventListener('mouseup', handleGlobalRelease);
    window.addEventListener('touchend', handleGlobalRelease);
    return () => {
      window.removeEventListener('mouseup', handleGlobalRelease);
      window.removeEventListener('touchend', handleGlobalRelease);
    };
  }, []);

  // Non-passive touchmove listener on the grid to prevent iOS scroll during drag selection
  useEffect(() => {
    const gridEl = daysGridRef.current;
    if (!gridEl) return;

    const onGridTouchMove = (e) => {
      if (isSelectingRef.current && e.cancelable) {
        e.preventDefault();
      }
    };

    gridEl.addEventListener('touchmove', onGridTouchMove, { passive: false });
    return () => {
      gridEl.removeEventListener('touchmove', onGridTouchMove, { passive: false });
    };
  }, []);

  // Handle Navigation actions based on mode
  const handlePrev = () => {
    if (viewMode === 'month') {
      setViewDate(new Date(year, month - 1, 1));
    } else {
      setViewDate(new Date(year - 1, month, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setViewDate(new Date(year, month + 1, 1));
    } else {
      setViewDate(new Date(year + 1, month, 1));
    }
  };

  // Check if viewing current year/month relative to today's date
  const isCurrentViewToday = 
    year === today.getFullYear() && 
    (viewMode === 'year' || month === today.getMonth());

  const handleResetToToday = () => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  // Generate blank calendar cell placeholders before the 1st day
  const emptyCells = Array.from({ length: firstDayIndex }, (_, i) => i);

  // Generate month days: 1 to totalDays
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  const handleDayClick = (day) => {
    // If we just finished a drag selection, bypass standard single tap selection
    if (wasSelectingRef.current || selectedDates.length > 0) {
      return;
    }
    const clickDate = new Date(year, month, day);
    const dateStr = formatDate(clickDate);
    onDateSelect(dateStr);
  };

  const handleMouseDown = (e, dateStr) => {
    if (e.button !== 0) return; // Only left click
    
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    
    touchStartCoordsRef.current = { x: e.clientX, y: e.clientY };
    
    longPressTimerRef.current = setTimeout(() => {
      isSelectingRef.current = true;
      anchorDateRef.current = dateStr;
      lastHoverDateRef.current = dateStr;
      selectedDatesRef.current = [dateStr];
      setSelectedDates([dateStr]);
      if (navigator.vibrate) {
        try { navigator.vibrate(50); } catch (err) {}
      }
    }, 500);
  };

  const handleMouseEnter = (dateStr) => {
    if (isSelectingRef.current) {
      updateSelectionRange(dateStr);
    }
  };

  const handleTouchStart = (e, dateStr) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    
    const touch = e.touches[0];
    touchStartCoordsRef.current = { x: touch.clientX, y: touch.clientY };
    
    longPressTimerRef.current = setTimeout(() => {
      isSelectingRef.current = true;
      anchorDateRef.current = dateStr;
      lastHoverDateRef.current = dateStr;
      selectedDatesRef.current = [dateStr];
      setSelectedDates([dateStr]);
      if (navigator.vibrate) {
        try { navigator.vibrate(50); } catch (err) {}
      }
    }, 500);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    
    if (!isSelectingRef.current) {
      // Check if finger moved too far (scroll cancellation)
      const dist = Math.hypot(touch.clientX - touchStartCoordsRef.current.x, touch.clientY - touchStartCoordsRef.current.y);
      if (dist > 12) {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
      }
      return;
    }
    
    // Note: scroll prevention is handled by the non-passive native listener on daysGridRef
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const cell = el?.closest('.day-cell');
    if (cell) {
      const hoveredDate = cell.getAttribute('data-date');
      if (hoveredDate) {
        updateSelectionRange(hoveredDate);
      }
    }
  };

  const handleConfirmBatch = () => {
    if (onBatchSavePeriod) {
      onBatchSavePeriod(selectedDates);
    }
    setSelectedDates([]);
    selectedDatesRef.current = [];
    setShowConfirmModal(false);
  };

  const handleCancelBatch = () => {
    setSelectedDates([]);
    selectedDatesRef.current = [];
    setShowConfirmModal(false);
  };

  const getFormattedSelectedRange = () => {
    if (selectedDates.length === 0) return '';
    
    // Sort dates chronologically
    const sorted = [...selectedDates].sort((a, b) => new Date(a) - new Date(b));
    
    // Convert to readable Chinese format (e.g. 6月25日)
    const formatDateLabel = (dStr) => {
      const dObj = new Date(dStr + 'T00:00:00');
      return `${dObj.getMonth() + 1}月${dObj.getDate()}日`;
    };
    
    if (sorted.length === 1) {
      return formatDateLabel(sorted[0]);
    }
    
    // Check if range is continuous
    let isContinuous = true;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1] + 'T00:00:00');
      const curr = new Date(sorted[i] + 'T00:00:00');
      const diffTime = Math.abs(curr - prev);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays !== 1) {
        isContinuous = false;
        break;
      }
    }
    
    if (isContinuous) {
      return `${formatDateLabel(sorted[0])} ~ ${formatDateLabel(sorted[sorted.length - 1])} (共 ${sorted.length} 天)`;
    } else {
      // Non-continuous: list them or summarize
      if (sorted.length <= 3) {
        return sorted.map(d => formatDateLabel(d)).join('、 ');
      } else {
        return `${formatDateLabel(sorted[0])} 等共 ${sorted.length} 個日期`;
      }
    }
  };

  return (
    <section className="calendar-section">
      <div className="calendar-card">
        
        {/* Navigation & Mode Toggle Header */}
        <div className="calendar-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <h3 className="calendar-title" style={{ minWidth: '100px' }}>
            {viewMode === 'month' ? monthLabel : `${year}年`}
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            {/* View Mode Toggle Segmented Control */}
            <div className="view-mode-toggle">
              <button 
                className={`btn-toggle ${viewMode === 'month' ? 'active' : ''}`}
                onClick={() => setViewMode('month')}
              >
                月
              </button>
              <button 
                className={`btn-toggle ${viewMode === 'year' ? 'active' : ''}`}
                onClick={() => setViewMode('year')}
              >
                年
              </button>
            </div>

            <div className="nav-buttons" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {!isCurrentViewToday && (
                <button className="btn-today-reset" onClick={handleResetToToday} style={{ marginRight: '4px' }}>
                  {viewMode === 'month' ? '回到當月' : '回到今年'}
                </button>
              )}
              <button className="btn-icon-nav" onClick={handlePrev} aria-label="上一個">
                <ChevronLeftIcon size={18} />
              </button>
              <button className="btn-icon-nav" onClick={handleNext} aria-label="下一個">
                <ChevronRightIcon size={18} />
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'month' ? (
          <>
            {/* Month View Weekday Labels */}
            <div className="weekdays-grid">
              {['日', '一', '二', '三', '四', '五', '六'].map((dayName, idx) => (
                <span key={idx} className="weekday-lbl">
                  {dayName}
                </span>
              ))}
            </div>

            {/* Month View Days Grid */}
            <div className="days-grid" ref={daysGridRef} onTouchMove={handleTouchMove}>
              {/* Render blank space for padding */}
              {emptyCells.map(cell => (
                <div key={`empty-${cell}`} className="day-cell day-cell-empty" />
              ))}

              {/* Render real days */}
              {days.map(day => {
                const thisDate = new Date(year, month, day);
                const dateStr = formatDate(thisDate);
                const status = getDayStatus(dateStr, logs, stats);
                
                const isToday = dateStr === currentDateStr;
                const isSelected = dateStr === selectedDateStr;
                
                // Build custom class names based on status and selection
                let statusClass = 'day-cell-safe';
                if (status === 'actual-period') statusClass = 'day-cell-period day-cell-actual';
                else if (status === 'predicted-period') statusClass = 'day-cell-period day-cell-predicted';
                else if (status === 'ovulation') statusClass = 'day-cell-ovulation';
                else if (status === 'fertile') statusClass = 'day-cell-fertile';
                
                const isBatchSelected = selectedDates.includes(dateStr);

                const cellClass = `
                  day-cell 
                  ${statusClass} 
                  ${isToday ? 'day-cell-today' : ''} 
                  ${isSelected ? 'day-cell-selected' : ''}
                  ${isBatchSelected ? 'day-cell-batch-selected' : ''}
                `.trim();

                // Detect if logs exist for dot indicators
                const hasPeriodLog = logs[dateStr] && logs[dateStr].flow && logs[dateStr].flow !== 'none';
                const hasIntercourseLog = logs[dateStr] && logs[dateStr].intercourse && logs[dateStr].intercourse !== 'none';
                const hasSymptomLog = logs[dateStr] && (
                  (logs[dateStr].symptoms && logs[dateStr].symptoms.length > 0) ||
                  logs[dateStr].spotting ||
                  logs[dateStr].temp ||
                  (logs[dateStr].mucus && logs[dateStr].mucus !== 'none')
                );

                return (
                  <button 
                    key={`day-${day}`} 
                    className={cellClass}
                    data-date={dateStr}
                    onMouseDown={(e) => handleMouseDown(e, dateStr)}
                    onMouseEnter={() => handleMouseEnter(dateStr)}
                    onTouchStart={(e) => handleTouchStart(e, dateStr)}
                    onClick={() => handleDayClick(day)}
                  >
                    {day}
                    
                    {/* Dot Indicators */}
                    <div className="day-indicators">
                      {hasSymptomLog && <span className="indicator-dot dot-symptom" />}
                      {hasIntercourseLog && (
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          /* Year View Grid - 12 Mini Months */
          <div className="year-grid">
            {Array.from({ length: 12 }, (_, mIdx) => {
              const mTotalDays = new Date(year, mIdx + 1, 0).getDate();
              const mFirstDayIndex = new Date(year, mIdx, 1).getDay();
              
              const mEmptyCells = Array.from({ length: mFirstDayIndex }, (_, i) => i);
              const mDays = Array.from({ length: mTotalDays }, (_, i) => i + 1);
              const mName = `${mIdx + 1}月`;

              return (
                <div 
                  key={`mini-month-${mIdx}`} 
                  className="mini-month-card"
                  onClick={() => {
                    setViewDate(new Date(year, mIdx, 1));
                    setViewMode('month');
                  }}
                >
                  <h4 className="mini-month-title">{mName}</h4>
                  
                  <div className="mini-weekdays-grid">
                    {['日', '一', '二', '三', '四', '五', '六'].map((lbl, i) => (
                      <span key={i}>{lbl}</span>
                    ))}
                  </div>
                  
                  <div className="mini-days-grid" onClick={(e) => e.stopPropagation()}>
                    {mEmptyCells.map(c => (
                      <div key={`mini-empty-${c}`} className="mini-day-cell-empty" />
                    ))}
                    {mDays.map(d => {
                      const dDate = new Date(year, mIdx, d);
                      const dDateStr = formatDate(dDate);
                      const dStatus = getDayStatus(dDateStr, logs, stats);
                      
                      const isToday = dDateStr === currentDateStr;
                      const isSelected = dDateStr === selectedDateStr;
                      
                      let statusClass = 'mini-day-cell-safe';
                      if (dStatus === 'actual-period') statusClass = 'day-cell-period day-cell-actual';
                      else if (dStatus === 'predicted-period') statusClass = 'day-cell-period day-cell-predicted';
                      else if (dStatus === 'ovulation') statusClass = 'day-cell-ovulation';
                      else if (dStatus === 'fertile') statusClass = 'day-cell-fertile';
                      
                      const cellClass = `
                        mini-day-cell 
                        ${statusClass}
                        ${isToday ? 'mini-day-cell-today' : ''}
                        ${isSelected ? 'mini-day-cell-selected' : ''}
                      `.trim();

                      return (
                        <button
                          key={`mini-day-${d}`}
                          className={cellClass}
                          onClick={() => onDateSelect(dDateStr)}
                          title={dDateStr}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-color-dot" style={{ backgroundColor: '#5B637A' }} />
            <span>月經期</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-dot" style={{ backgroundColor: 'rgba(91, 99, 122, 0.25)', border: '1px dashed #5B637A' }} />
            <span>預測經期</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-dot" style={{ backgroundColor: '#DBB57F' }} />
            <span>排卵日</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-dot" style={{ backgroundColor: 'rgba(219, 181, 127, 0.22)' }} />
            <span>排卵期 (危險期)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-dot" style={{ backgroundColor: 'rgba(178, 171, 180, 0.2)' }} />
            <span>安全期</span>
          </div>
          <div className="legend-item">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="3.5" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '2.5px' }}>
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            <span>有性行為</span>
          </div>
        </div>

      </div>

      {showConfirmModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-content animate-pop">
            <h3 className="confirm-modal-title">設定為月經期</h3>
            <p className="confirm-modal-text">
              您已選取以下日期：
              <span className="confirm-date-range">{getFormattedSelectedRange()}</span>
              確定要將這些日期設定為月經期嗎？
              <br />
              （經血量將自動預設為「量中」）
            </p>
            <div className="confirm-modal-actions">
              <button className="btn-confirm-cancel" onClick={handleCancelBatch}>
                取消
              </button>
              <button className="btn-confirm-ok" onClick={handleConfirmBatch}>
                確定
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
