import React, { useState } from 'react';

// Helper to determine phase name, hormone status, and symptoms based on cycle day (1-28)
const getDayDetails = (day) => {
  if (day >= 1 && day <= 5) {
    return {
      phase: 'menstrual',
      phaseName: '月經期 (Menstrual)',
      estrogen: '處於最低水平',
      progesterone: '處於最低水平',
      symptoms: ['經痛 / 下腹悶脹', '身體易疲倦、精力低落', '乳房脹痛感減輕', '膚質偏乾或敏感'],
      tips: '建議多休息、保暖，避免劇烈運動。適量補充鐵質（如紅肉、菠菜）與熱飲。',
      bgColor: 'rgba(91, 99, 122, 0.02)'
    };
  } else if (day >= 6 && day <= 13) {
    return {
      phase: 'follicular',
      phaseName: '濾泡期 (Follicular)',
      estrogen: '逐漸穩定上升',
      progesterone: '維持在極低水平',
      symptoms: ['精力逐漸恢復、心情愉快', '新陳代謝加快', '皮膚透亮、油脂分泌適中', '分泌物較為乾燥或稀薄'],
      tips: '身體能量最高峰！適合進行高強度運動或學習新事物。多攝取優質蛋白質與新鮮蔬菜。',
      bgColor: 'rgba(96, 120, 92, 0.02)'
    };
  } else if (day === 14) {
    return {
      phase: 'ovulation',
      phaseName: '排卵日 (Ovulation)',
      estrogen: '達到最高峰後急速下降',
      progesterone: '開始緩慢上升',
      symptoms: ['分泌物呈透明蛋清狀且拉絲', '下腹單側輕微抽痛（排卵痛）', '性慾上升', '精力充沛'],
      tips: '受孕機率最高的時期。若有避孕需求請務必做好防護措施。維持規律作息。',
      bgColor: 'rgba(219, 181, 127, 0.025)'
    };
  } else {
    return {
      phase: 'luteal',
      phaseName: '黃體期 / 經前期 (Luteal)',
      estrogen: '微幅回升後與黃體素一同下降',
      progesterone: '達到最高峰，隨後急速下降',
      symptoms: ['經前症候群 (PMS) 如易怒、憂鬱', '皮膚易出油、長青春痘', '乳房再度脹痛', '水腫與腹脹'],
      tips: '適合溫和運動（如瑜珈、散步）。多補充維生素 B6 與鎂以舒緩經前不適，維持飲食清淡。',
      bgColor: 'rgba(184, 107, 75, 0.02)'
    };
  }
};

export default function Knowledge() {
  const [selectedInfographicDay, setSelectedInfographicDay] = useState(14);
  const [expandedCard, setExpandedCard] = useState(null);

  // Hormone chart SVG dimension parameters
  const chartWidth = 320;
  const chartHeight = 140;
  
  // Plotting hormone lines mathematically
  // Estrogen peak around day 13, secondary peak around day 22
  // We use Cosine interpolation (smoothstep style) to guarantee perfectly smooth derivative transitions at peaks and valleys.
  const getEstrogenY = (d) => {
    let val = 15;
    if (d < 13) {
      // Smooth rise from 15 to 88
      const t = (d - 1) / 12; // 0 to 1
      val = 15 + (1 - Math.cos(t * Math.PI)) * 0.5 * 73;
    } else if (d >= 13 && d < 17) {
      // Smooth drop from 88 to 32
      const t = (d - 13) / 4; // 0 to 1
      val = 88 - (1 - Math.cos(t * Math.PI)) * 0.5 * 56;
    } else if (d >= 17 && d < 22) {
      // Smooth secondary rise from 32 to 55
      const t = (d - 17) / 5; // 0 to 1
      val = 32 + (1 - Math.cos(t * Math.PI)) * 0.5 * 23;
    } else {
      // Smooth drop from 55 to 15
      const t = (d - 22) / 6; // 0 to 1
      val = 55 - (1 - Math.cos(t * Math.PI)) * 0.5 * 40;
    }
    return chartHeight - (val / 100) * (chartHeight - 30) - 15;
  };

  // Progesterone peak around day 21
  const getProgesteroneY = (d) => {
    let val = 10;
    if (d <= 14) {
      val = 10;
    } else if (d > 14 && d < 21) {
      // Smooth rise from 10 to 80
      const t = (d - 14) / 7; // 0 to 1
      val = 10 + (1 - Math.cos(t * Math.PI)) * 0.5 * 70;
    } else {
      // Smooth drop from 80 to 10
      const t = (d - 21) / 7; // 0 to 1
      val = 80 - (1 - Math.cos(t * Math.PI)) * 0.5 * 70;
    }
    return chartHeight - (val / 100) * (chartHeight - 30) - 15;
  };

  // Helper function to map cycle days (1-28) to X coordinates (10 to chartWidth - 10)
  const getX = (day) => 10 + ((day - 1) / 27) * (chartWidth - 20);

  // Generate path coordinates with high resolution (100 segments instead of 28 segments)
  let estrogenPath = `M 10,${getEstrogenY(1)}`;
  let progesteronePath = `M 10,${getProgesteroneY(1)}`;
  let estrogenAreaPath = `M 10,${chartHeight - 15} L 10,${getEstrogenY(1)}`;
  let progesteroneAreaPath = `M 10,${chartHeight - 15} L 10,${getProgesteroneY(1)}`;

  const steps = 100;
  for (let i = 1; i <= steps; i++) {
    const d = 1 + (i / steps) * 27; // Day from 1 to 28
    const x = getX(d);
    const ey = getEstrogenY(d);
    const py = getProgesteroneY(d);
    
    estrogenPath += ` L ${x},${ey}`;
    progesteronePath += ` L ${x},${py}`;
    estrogenAreaPath += ` L ${x},${ey}`;
    progesteroneAreaPath += ` L ${x},${py}`;
  }
  
  estrogenAreaPath += ` L ${chartWidth - 10},${chartHeight - 15} Z`;
  progesteroneAreaPath += ` L ${chartWidth - 10},${chartHeight - 15} Z`;

  const selectedDayDetails = getDayDetails(selectedInfographicDay);
  const activeX = getX(selectedInfographicDay);

  const phaseCards = [
    {
      id: 'p1',
      title: '月經期 (Day 1-5)',
      subtitle: '身體的冬季',
      summary: '雌激素與黃體素降至最低，子宮內膜開始剝落。',
      content: '此階段體力較低，容易感到疲倦或痛經。建議：\n1. 充足睡眠，避免熬夜與劇烈活動。\n2. 多補充富含鐵質與蛋白質的食物。\n3. 適時熱敷腹部，喝溫薑茶有助於舒緩。'
    },
    {
      id: 'p2',
      title: '濾泡期 (Day 6-13)',
      subtitle: '身體的春季',
      summary: '雌激素開始攀升，子宮內膜重新增厚。',
      content: '新陳代謝加快，心情也隨之轉晴，是體力與精神的最佳時期。建議：\n1. 適合進行肌力訓練等高強度運動。\n2. 可多攝取十字花科蔬菜（如花椰菜）幫助雌激素代謝。\n3. 工作與計畫執行的黃金期。'
    },
    {
      id: 'p3',
      title: '排卵期 (Day 14)',
      subtitle: '身體的夏季',
      summary: '雌激素達到頂點，卵泡破裂釋放卵子。',
      content: '受孕機率高，身體賀爾盟分泌旺盛，皮膚狀態極佳，散發自信魅力。建議：\n1. 若有避孕考量，應特別加強防護措施。\n2. 分泌物水狀拉絲屬正常生理現象。\n3. 適合多安排社交活動。'
    },
    {
      id: 'p4',
      title: '黃體期 / 經前期 (Day 15-28)',
      subtitle: '身體的秋季',
      summary: '黃體素主導，若無受孕則兩者在後期急速驟降。',
      content: '身體開始保水、出油，情緒容易波動，這就是所謂的經前症候群 (PMS)。建議：\n1. 飲食少油鹽避免水腫，適量補充碳水化合物。\n2. 進行溫和運動（如伸展、瑜珈）舒緩交慮。\n3. 提早做好肌膚清潔，預防經前痘痘。'
    }
  ];

  return (
    <div style={{ padding: '24px 16px 88px 16px', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px', marginTop: '24px' }}>
        <h1 style={{ fontSize: '21.5px', fontWeight: '700', color: 'var(--text-slate)', marginBottom: '4px' }}>月知識</h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-slate-light)', letterSpacing: '0.05em' }}>探索女性生理週期與身體奧秘</p>
      </div>

      {/* 1. 生理週期變化圖 Inline Card - Styled to match cycle history trend chart */}
      <div style={{
        background: 'var(--panel-bg)',
        border: '1px solid var(--panel-border)',
        borderRadius: '28px',
        padding: '22px 20px',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(91, 99, 122, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        
        <div>
          <h2 style={{ fontSize: '19.5px', fontWeight: '700', color: 'var(--text-slate)' }}>生理週期賀爾蒙變化</h2>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-start', fontSize: '12.5px', paddingLeft: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3px', backgroundColor: '#DBB57F', borderRadius: '2px', display: 'inline-block' }} />
            <span style={{ color: 'var(--text-slate)', fontWeight: '600' }}>雌激素 (Estrogen)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3px', backgroundColor: '#898BA1', borderRadius: '2px', display: 'inline-block' }} />
            <span style={{ color: 'var(--text-slate)', fontWeight: '600' }}>黃體素 (Progesterone)</span>
          </div>
        </div>

        {/* SVG Graphic Area */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.35)',
          border: '1px solid rgba(91, 99, 122, 0.06)',
          borderRadius: '20px',
          padding: '16px 12px 14px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Phase Labels on Top of the Chart */}
          <div style={{ 
            display: 'flex', 
            padding: '0 10px',
            fontSize: '10.5px', 
            fontWeight: '700',
            letterSpacing: '0.02em',
            marginBottom: '2px'
          }}>
            <div style={{ width: '16%', textAlign: 'center', color: '#898BA1' }}>月經期</div>
            <div style={{ width: '30%', textAlign: 'center', color: '#898BA1' }}>濾泡期</div>
            <div style={{ width: '8%', textAlign: 'center', color: '#898BA1' }}>排卵</div>
            <div style={{ width: '46%', textAlign: 'center', color: '#898BA1' }}>黃體期</div>
          </div>

          <div style={{ position: 'relative', width: '100%', height: `${chartHeight}px` }}>
            <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
              <defs>
                {/* Gradients to fill areas under hormone curves, matching the trend chart style */}
                <linearGradient id="estrogenGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#DBB57F" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#DBB57F" stopOpacity="0.00" />
                </linearGradient>
                <linearGradient id="progesteroneGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#898BA1" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#898BA1" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Shading zones */}
              {/* Day 1-5 (Menstrual) */}
              <rect x={getX(1)} y="5" width={getX(5) - getX(1)} height={chartHeight - 15} fill="rgba(91, 99, 122, 0.02)" />
              {/* Day 5-13.5 (Follicular) */}
              <rect x={getX(5)} y="5" width={getX(13.5) - getX(5)} height={chartHeight - 15} fill="rgba(96, 120, 92, 0.01)" />
              {/* Day 13.5-14.5 (Ovulation) */}
              <rect x={getX(13.5)} y="5" width={getX(14.5) - getX(13.5)} height={chartHeight - 15} fill="rgba(219, 181, 127, 0.08)" />
              {/* Day 14.5-28 (Luteal) */}
              <rect x={getX(14.5)} y="5" width={getX(28) - getX(14.5)} height={chartHeight - 15} fill="rgba(184, 107, 75, 0.01)" />

              {/* Grid Lines */}
              <line x1={getX(1)} y1={chartHeight - 15} x2={getX(28)} y2={chartHeight - 15} stroke="rgba(91, 99, 122, 0.08)" strokeWidth="1" />
              <line x1={getX(5)} y1="5" x2={getX(5)} y2={chartHeight - 10} stroke="rgba(91, 99, 122, 0.12)" strokeDasharray="3,3" />
              <line x1={getX(13.5)} y1="5" x2={getX(13.5)} y2={chartHeight - 10} stroke="rgba(91, 99, 122, 0.12)" strokeDasharray="3,3" />
              <line x1={getX(14.5)} y1="5" x2={getX(14.5)} y2={chartHeight - 10} stroke="rgba(91, 99, 122, 0.12)" strokeDasharray="3,3" />

              {/* Fill areas under the curves first */}
              <path d={estrogenAreaPath} fill="url(#estrogenGlow)" />
              <path d={progesteroneAreaPath} fill="url(#progesteroneGlow)" />

              {/* Draw curves on top */}
              <path d={estrogenPath} fill="none" stroke="#DBB57F" strokeWidth="3" strokeLinecap="round" />
              <path d={progesteronePath} fill="none" stroke="#898BA1" strokeWidth="2.5" strokeLinecap="round" />

              {/* Selected Day Indicator */}
              <line x1={activeX} y1="5" x2={activeX} y2={chartHeight - 10} stroke="var(--text-slate)" strokeWidth="1.5" />
            </svg>

            {/* Indicator Dots as perfect HTML circles to prevent SVG stretching and eliminate white borders */}
            {/* Indicator Dots as perfect HTML circles with glowing shadow halos */}
            <div style={{
              position: 'absolute',
              left: `${((10 + ((selectedInfographicDay - 1) / 27) * 300) / 320) * 100}%`,
              top: `${getEstrogenY(selectedInfographicDay)}px`,
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#DBB57F',
              boxShadow: '0 0 8px #DBB57F, 0 0 16px rgba(219, 181, 127, 0.55)',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute',
              left: `${((10 + ((selectedInfographicDay - 1) / 27) * 300) / 320) * 100}%`,
              top: `${getProgesteroneY(selectedInfographicDay)}px`,
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#898BA1',
              boxShadow: '0 0 8px #898BA1, 0 0 16px rgba(137, 139, 161, 0.55)',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }} />
          </div>

          {/* X-axis Labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-slate-muted)', fontWeight: '600', padding: '0 4px' }}>
            <span>第 1 天</span>
            <span>第 7 天</span>
            <span>第 14 天 (排卵)</span>
            <span>第 21 天</span>
            <span>第 28 天</span>
          </div>
        </div>

        {/* Interactive Slider Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-slate)' }}>拉動滑桿切換天數</span>
            <span style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-slate)', backgroundColor: 'rgba(91, 99, 122, 0.08)', padding: '2px 8px', borderRadius: '8px' }}>
              第 {selectedInfographicDay} 天
            </span>
          </div>
          
          <input 
            type="range" 
            min="1" 
            max="28" 
            className="custom-range-slider"
            value={selectedInfographicDay}
            onChange={(e) => setSelectedInfographicDay(parseInt(e.target.value))}
          />
        </div>

        {/* Dynamic Details Card for the Selected Day */}
        <div style={{
          background: 'rgba(253, 247, 242, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '20px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          border: '1px solid var(--panel-border)',
          transition: 'all 0.2s ease'
        }}>
          <div>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text-slate-light)', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>生理階段</span>
            <h4 style={{ fontSize: '16.5px', fontWeight: '700', color: 'var(--text-slate)' }}>{selectedDayDetails.phaseName}</h4>
          </div>

          <div style={{ display: 'flex', gap: '12px', fontSize: '13.5px' }}>
            <div style={{ flex: 1, padding: '8px 10px', background: 'rgba(91, 99, 122, 0.08)', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
              <span style={{ display: 'block', fontSize: '10.5px', fontWeight: '700', color: 'var(--text-slate-light)', marginBottom: '2px' }}>雌激素</span>
              <span style={{ color: '#DBB57F', fontWeight: '700' }}>{selectedDayDetails.estrogen}</span>
            </div>
            <div style={{ flex: 1, padding: '8px 10px', background: 'rgba(91, 99, 122, 0.08)', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
              <span style={{ display: 'block', fontSize: '10.5px', fontWeight: '700', color: 'var(--text-slate-light)', marginBottom: '2px' }}>黃體素</span>
              <span style={{ color: '#898BA1', fontWeight: '700' }}>{selectedDayDetails.progesterone}</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text-slate-light)', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>常見症狀</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {selectedDayDetails.symptoms.map((s, idx) => (
                <span 
                  key={idx} 
                  style={{
                    padding: '4px 10px',
                    background: 'rgba(91, 99, 122, 0.08)',
                    border: '1px solid var(--panel-border)',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    color: 'var(--text-slate)',
                    fontWeight: '600'
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(91, 99, 122, 0.06)', paddingTop: '10px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text-slate-light)', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>保養建議</span>
            <p style={{ fontSize: '13.5px', color: 'var(--text-slate)', lineHeight: '1.5', margin: 0 }}>
              {selectedDayDetails.tips}
            </p>
          </div>
        </div>

      </div>

      {/* 2. 四大生理階段指南 Accordions */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15.5px', fontWeight: '700', color: 'var(--text-slate)', marginBottom: '12px', paddingLeft: '4px' }}>
          四大生理階段指南
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {phaseCards.map(card => {
            const isExpanded = expandedCard === card.id;
            return (
              <div 
                key={card.id}
                style={{
                  background: 'var(--panel-bg)',
                  border: '1px solid var(--panel-border)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div 
                  onClick={() => setExpandedCard(isExpanded ? null : card.id)}
                  style={{
                    padding: '14px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '15.5px', fontWeight: '700', color: 'var(--text-slate)' }}>{card.title}</h4>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-slate-light)', display: 'block', marginTop: '2px' }}>{card.subtitle}</span>
                  </div>
                  <div style={{
                    color: 'var(--text-slate-light)',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                </div>
                
                {isExpanded && (
                  <div style={{
                    padding: '0 16px 16px 16px',
                    fontSize: '14.5px',
                    color: 'var(--text-slate)',
                    borderTop: '1px solid rgba(91, 99, 122, 0.05)',
                    lineHeight: '1.6'
                  }}>
                    <p style={{ fontWeight: '600', color: 'var(--text-slate-light)', margin: '10px 0 6px 0' }}>{card.summary}</p>
                    <p style={{ whiteSpace: 'pre-line', color: 'var(--text-slate)' }}>{card.content}</p>
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
