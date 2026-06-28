import React from 'react';

/**
 * Renders a dynamic, beautiful SVG moon phase based on the cycle day.
 * Uses the designated palette colors:
 * - Lit part: Warm gold (#DBB57F) with a soft radial glow
 * - Dark part: Muted gray-blue (#5B637A) or semi-transparent overlay
 */
const MoonPhaseSvg = ({ cycleDay, cycleLength = 28 }) => {
  // Normalize day to 28-day scale
  const normalizedDay = Math.min(Math.max(1, cycleDay), cycleLength);
  const ratio = (normalizedDay - 1) / cycleLength; // 0.0 to 1.0

  // Determine phase code & drawing shapes
  // We will draw a circle of radius 30 (cx=40, cy=40)
  // Base circle is filled with dark slate (#5B637A)
  // Overlaid crescent is drawn in Gold (#DBB57F)
  
  // To draw the moon phases elegantly, we can use an SVG path with two arcs.
  // One arc defines the boundary circle, and the other arc curves inside depending on the phase.
  let moonPath = "";
  let description = "";

  if (ratio < 0.05 || ratio >= 0.95) {
    // New Moon (新月): fully dark, just a thin gold outline
    description = { zh: "新月", en: "(New Moon)" };
    moonPath = ""; // No lit overlay path
  } else if (ratio >= 0.05 && ratio < 0.22) {
    // Waxing Crescent (眉月): thin sliver on the right
    description = { zh: "眉月", en: "(Waxing Crescent)" };
    // Arc from top to bottom, then curve back to top
    moonPath = "M 40,10 A 30,30 0 0 1 40,70 A 15,30 0 0 1 40,10 Z";
  } else if (ratio >= 0.22 && ratio < 0.28) {
    // First Quarter (上弦月): right half lit
    description = { zh: "上弦月", en: "(First Quarter)" };
    moonPath = "M 40,10 A 30,30 0 0 1 40,70 L 40,10 Z";
  } else if (ratio >= 0.28 && ratio < 0.45) {
    // Waxing Gibbous (盈凸月): mostly lit on the right
    description = { zh: "盈凸月", en: "(Waxing Gibbous)" };
    // Curve bulges leftward
    moonPath = "M 40,10 A 30,30 0 0 1 40,70 A 15,30 0 0 0 40,10 Z";
  } else if (ratio >= 0.45 && ratio < 0.55) {
    // Full Moon (滿月): fully gold and glowing
    description = { zh: "滿月", en: "(Full Moon)" };
    moonPath = "M 40,10 A 30,30 0 1 1 39.9,10 Z";
  } else if (ratio >= 0.55 && ratio < 0.72) {
    // Waning Gibbous (虧凸月): mostly lit on the left
    description = { zh: "虧凸月", en: "(Waning Gibbous)" };
    moonPath = "M 40,10 A 30,30 0 0 0 40,70 A 15,30 0 0 1 40,10 Z";
  } else if (ratio >= 0.72 && ratio < 0.78) {
    // Third Quarter (下弦月): left half lit
    description = { zh: "下弦月", en: "(Third Quarter)" };
    moonPath = "M 40,10 A 30,30 0 0 0 40,70 L 40,10 Z";
  } else {
    // Waning Crescent (殘月): thin sliver on the left
    description = { zh: "殘月", en: "(Waning Crescent)" };
    moonPath = "M 40,10 A 30,30 0 0 0 40,70 A 15,30 0 0 0 40,10 Z";
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', width: '100%' }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        {/* Base Moon Circle (Dark Side) */}
        <circle cx="40" cy="40" r="30" fill="#5B637A" opacity="0.3" stroke="#5B637A" strokeWidth="1" />
        
        {/* Lit Overlay (Gold Side) - Flat Color Block */}
        {moonPath && (
          <path d={moonPath} fill="#DBB57F" />
        )}
        
        {/* Ring outline */}
        <circle cx="40" cy="40" r="31" fill="none" stroke="#D5CCC5" strokeWidth="1.5" opacity="0.6" />
      </svg>
      <span style={{ 
        fontSize: '9px', 
        fontWeight: '700', 
        color: 'var(--text-slate-muted)', 
        letterSpacing: '0.02em',
        textAlign: 'center',
        lineHeight: '1.2',
        marginTop: '2px',
        display: 'block'
      }}>
        {description.zh}
        <br />
        {description.en}
      </span>
    </div>
  );
};

export default function LunarHeader({ summaryData, cycleLength = 28 }) {
  const { phase, phaseName, daysDifference, summary } = summaryData;

  // Approximate moon phase day
  // If we are in menstrual period or follicular phase, day is 1 to 14.
  // If we are in luteal/PMS phase, day is 14 to 28.
  let approximateMoonDay = 1;
  if (phase === 'actual-period' || phase === 'predicted-period') {
    approximateMoonDay = Math.max(1, daysDifference);
  } else if (phase === 'ovulation') {
    approximateMoonDay = 14;
  } else if (phase === 'fertile') {
    // fertile is around ovulation day (14)
    approximateMoonDay = 14 + daysDifference;
  } else if (phase === 'safe') {
    // safe is either pre-ovulatory (day 6-9) or post-ovulatory (day 17-28)
    // we use a reasonable estimate based on daysDifference (which is days until next cycle starts)
    const cycleDayEst = cycleLength - daysDifference;
    approximateMoonDay = Math.max(1, cycleDayEst);
  }

  // Get status color card border styling
  let cardBorderColor = 'var(--panel-border)';
  if (phase === 'actual-period' || phase === 'predicted-period') {
    cardBorderColor = 'rgba(91, 99, 122, 0.4)';
  } else if (phase === 'fertile' || phase === 'ovulation') {
    cardBorderColor = 'rgba(219, 181, 127, 0.5)';
  }

  return (
    <header className="header-container">
      <img 
        src="/lunaflow_icon.png" 
        alt="LunaFlow Icon" 
        style={{ 
          width: '34px', 
          height: '34px', 
          borderRadius: '10px', 
          marginBottom: '6px', 
          boxShadow: '0 4px 12px rgba(91, 99, 122, 0.08)' 
        }} 
      />
      <h1 className="brand-title">LunaFlow</h1>
      <p className="brand-subtitle">經期日誌</p>
      
      <div className="lunar-card" style={{ borderColor: cardBorderColor }}>
        <div className="lunar-art">
          <MoonPhaseSvg cycleDay={approximateMoonDay} cycleLength={cycleLength} />
        </div>
        
        <div className="lunar-info">
          <span className="cycle-day">
            {phase === 'welcoming' ? 'Welcome' : `週期第 ${Math.max(1, Math.round(approximateMoonDay))} 天`}
          </span>
          <h2 className="cycle-phase-name">{phaseName}</h2>
          <p className="cycle-summary-text">{summary}</p>
        </div>
      </div>
    </header>
  );
}
