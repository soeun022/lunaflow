import React, { useState, useEffect } from 'react';
import { 
  CloseIcon, 
  FlowDropIcon, 
  SpottingIcon, 
  CrampsIcon, 
  HeadacheIcon, 
  MoodSwingsIcon, 
  FatigueIcon, 
  BreastTendernessIcon, 
  BloatingIcon, 
  AcneIcon, 
  TempIcon, 
  MucusIcon, 
  IntercourseIcon,
  PillIcon,
  ContraceptiveIcon,
  PlusIcon
} from './SvgIcons';
import { getDayStatus } from '../utils/cycleCalculator';

export default function DayDetailDrawer({ 
  dateStr, 
  logs, 
  stats, 
  onSave, 
  onDelete, 
  onClose 
}) {
  // Custom medications state
  const [customMeds, setCustomMeds] = useState(() => {
    return JSON.parse(localStorage.getItem('customMedications') || '[]');
  });
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [newMedName, setNewMedName] = useState('');

  const saveCustomMed = () => {
    const name = newMedName.trim();
    if (!name) return;
    if (customMeds.includes(name) || name === '避孕藥' || name === '止痛藥') {
      setIsAddingCustom(false);
      setNewMedName('');
      return;
    }
    const updated = [...customMeds, name];
    setCustomMeds(updated);
    localStorage.setItem('customMedications', JSON.stringify(updated));
    setIsAddingCustom(false);
    setNewMedName('');
  };

  const deleteCustomMed = (name) => {
    const updated = customMeds.filter(m => m !== name);
    setCustomMeds(updated);
    localStorage.setItem('customMedications', JSON.stringify(updated));
    
    // Remove from selected list
    setForm(prev => ({
      ...prev,
      medications: (prev.medications || []).filter(m => m !== `custom_${name}`)
    }));
  };

  // 1. Parse date for readable Chinese title
  const dateObj = new Date(dateStr + 'T00:00:00');
  const formattedTitle = `${dateObj.getMonth() + 1}月 ${dateObj.getDate()}日`;
  
  // Calculate cycle status (e.g. 經期, 安全期) for the title subtitle
  const cycleStatus = getDayStatus(dateStr, logs, stats);
  let statusText = '安全期';
  if (cycleStatus === 'actual-period') statusText = '月經期';
  else if (cycleStatus === 'predicted-period') statusText = '預測月經期';
  else if (cycleStatus === 'ovulation') statusText = '排卵日';
  else if (cycleStatus === 'fertile') statusText = '排卵期 (易孕期)';

  // 2. Initialize form state based on existing logs for this date
  const defaultState = {
    flow: 'none', // none, light, medium, heavy
    spotting: false,
    symptoms: [], // array of symptom strings
    medications: [], // array of medication strings ('contraceptive', 'painkiller')
    mucus: 'none', // none, dry, sticky, creamy, watery, egg-white
    temp: '',
    tempUnit: 'C', // C or F
    intercourse: 'none', // none, protected, unprotected
    notes: '' // free text notes
  };

  const [form, setForm] = useState(defaultState);

  useEffect(() => {
    if (logs[dateStr]) {
      setForm({
        flow: logs[dateStr].flow || 'none',
        spotting: !!logs[dateStr].spotting,
        symptoms: logs[dateStr].symptoms || [],
        medications: logs[dateStr].medications || [],
        mucus: logs[dateStr].mucus || 'none',
        temp: logs[dateStr].temp || '',
        tempUnit: logs[dateStr].tempUnit || 'C',
        intercourse: logs[dateStr].intercourse || 'none',
        notes: logs[dateStr].notes || ''
      });
    } else {
      setForm(defaultState);
    }
  }, [dateStr, logs]);

  // Lock background scroll when drawer is open to prevent scroll chain locks on iOS
  useEffect(() => {
    const rootEl = document.getElementById('root');
    if (rootEl) {
      const originalOverflow = rootEl.style.overflowY;
      rootEl.style.overflowY = 'hidden';
      return () => {
        rootEl.style.overflowY = originalOverflow;
      };
    }
  }, []);

  // Handlers
  const handleFlowSelect = (flowLevel) => {
    setForm(prev => ({ ...prev, flow: flowLevel }));
  };

  const handleSpottingToggle = () => {
    setForm(prev => ({ ...prev, spotting: !prev.spotting }));
  };

  const handleSymptomToggle = (symptom) => {
    setForm(prev => {
      const exists = prev.symptoms.includes(symptom);
      const newSymptoms = exists
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom];
      return { ...prev, symptoms: newSymptoms };
    });
  };

  const handleMedicationToggle = (med) => {
    setForm(prev => {
      const exists = prev.medications.includes(med);
      const newMeds = exists
        ? prev.medications.filter(m => m !== med)
        : [...prev.medications, med];
      return { ...prev, medications: newMeds };
    });
  };

  const handleMucusSelect = (type) => {
    setForm(prev => ({ ...prev, mucus: type }));
  };

  const handleTempChange = (e) => {
    setForm(prev => ({ ...prev, temp: e.target.value }));
  };

  const handleTempUnitToggle = (unit) => {
    setForm(prev => ({ ...prev, tempUnit: unit }));
  };

  const handleIntercourseSelect = (type) => {
    setForm(prev => ({ ...prev, intercourse: type }));
  };

  const handleNotesChange = (e) => {
    setForm(prev => ({ ...prev, notes: e.target.value }));
  };

  // Submit operations
  const handleSaveClick = () => {
    onSave(dateStr, form);
  };

  const handleDeleteClick = () => {
    onDelete(dateStr);
  };

  // Available symptoms with human readable Chinese label & SVG component name
  const availableSymptoms = [
    { id: 'cramps', label: '經痛', icon: CrampsIcon },
    { id: 'tenderness', label: '乳房脹痛', icon: BreastTendernessIcon },
    { id: 'headache', label: '頭痛', icon: HeadacheIcon },
    { id: 'mood', label: '情緒波動', icon: MoodSwingsIcon },
    { id: 'fatigue', label: '疲勞', icon: FatigueIcon },
    { id: 'bloating', label: '腹脹', icon: BloatingIcon },
    { id: 'acne', label: '青春痘', icon: AcneIcon }
  ];

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-date-info">
            <h2 className="drawer-date-title">{formattedTitle}</h2>
            <span className="drawer-date-status">{statusText}</span>
          </div>
          <button className="btn-close-drawer" onClick={onClose} aria-label="關閉">
            <CloseIcon size={20} />
          </button>
        </div>

        {/* 1. Menstrual Flow */}
        <div className="log-section">
          <h3 className="log-section-title">月經量</h3>
          <div className="flow-selector">
            {[
              { id: 'none', label: '無流血' },
              { id: 'light', label: '量少' },
              { id: 'medium', label: '量中' },
              { id: 'heavy', label: '量多' }
            ].map(item => {
              const isActive = form.flow === item.id;
              return (
                <button
                  key={item.id}
                  className={`flow-btn ${isActive ? 'flow-btn-active' : ''}`}
                  onClick={() => handleFlowSelect(item.id)}
                >
                  <FlowDropIcon size={22} level={item.id} active={isActive} />
                  <span className="flow-btn-label">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Spotting Toggle */}
        <div className="log-section">
          <div className="toggle-row">
            <div className="toggle-info">
              <SpottingIcon size={20} />
              <span className="toggle-label">點狀出血 (非經期出血)</span>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={form.spotting} 
                onChange={handleSpottingToggle} 
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* 3. Symptoms Multi-select */}
        <div className="log-section">
          <h3 className="log-section-title">症狀 (可複選)</h3>
          <div className="symptom-grid">
            {availableSymptoms.map(sym => {
              const IconComponent = sym.icon;
              const isActive = form.symptoms.includes(sym.id);
              return (
                <button
                  key={sym.id}
                  className={`symptom-card ${isActive ? 'symptom-card-active' : ''}`}
                  onClick={() => handleSymptomToggle(sym.id)}
                  style={{
                    backgroundColor: isActive ? 'rgba(91, 99, 122, 0.12)' : '',
                    borderColor: isActive ? 'var(--text-slate)' : ''
                  }}
                >
                  <IconComponent size={24} />
                  <span className="symptom-label">{sym.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3.5. Medications Multi-select */}
        <div className="log-section">
          <h3 className="log-section-title">服藥 (可複選)</h3>
          <div className="symptom-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              { id: 'contraceptive', label: '避孕藥', icon: ContraceptiveIcon },
              { id: 'painkiller', label: '止痛藥', icon: PillIcon },
              ...customMeds.map(name => ({ id: `custom_${name}`, label: name, icon: PillIcon, isCustom: true }))
            ].map(med => {
              const IconComponent = med.icon;
              const isActive = (form.medications || []).includes(med.id);
              return (
                <button
                  key={med.id}
                  className={`symptom-card ${isActive ? 'symptom-card-active' : ''}`}
                  onClick={() => handleMedicationToggle(med.id)}
                  style={{
                    backgroundColor: isActive ? 'rgba(91, 99, 122, 0.12)' : '',
                    borderColor: isActive ? 'var(--text-slate)' : '',
                    padding: '12px 10px',
                    position: 'relative'
                  }}
                >
                  <IconComponent size={22} color={isActive ? 'var(--text-slate)' : 'var(--text-slate-light)'} />
                  <span className="symptom-label">{med.label}</span>
                  
                  {/* Delete button for custom meds */}
                  {med.isCustom && (
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCustomMed(med.label);
                      }}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        padding: '2px',
                        color: 'var(--text-slate-light)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%'
                      }}
                      title="刪除此選項"
                    >
                      <CloseIcon size={12} />
                    </span>
                  )}
                </button>
              );
            })}
            
            {/* Inline add custom med toggle button */}
            {!isAddingCustom && (
              <button
                className="symptom-card"
                onClick={() => setIsAddingCustom(true)}
                style={{
                  padding: '12px 10px',
                  borderStyle: 'dashed',
                  backgroundColor: 'transparent',
                  borderColor: 'rgba(91, 99, 122, 0.3)'
                }}
              >
                <PlusIcon size={22} color="var(--text-slate-light)" />
                <span className="symptom-label" style={{ color: 'var(--text-slate-light)' }}>新增用藥</span>
              </button>
            )}
          </div>
          
          {/* Custom medication input container */}
          {isAddingCustom && (
            <div className="add-med-input-container" style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '10px' }}>
              <input 
                type="text" 
                placeholder="輸入藥物名稱..." 
                value={newMedName}
                onChange={e => setNewMedName(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: '1px solid rgba(91, 99, 122, 0.2)',
                  fontSize: '14.5px',
                  background: 'rgba(255, 255, 255, 0.45)',
                  outline: 'none',
                  color: 'var(--text-slate)'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveCustomMed();
                }}
                autoFocus
              />
              <button 
                onClick={saveCustomMed}
                style={{ 
                  padding: '8px 0', 
                  borderRadius: '12px', 
                  fontSize: '14.5px', 
                  fontWeight: '600',
                  width: '65px', 
                  textAlign: 'center',
                  background: 'var(--text-slate)',
                  color: 'var(--bg-cream)',
                  border: '1px solid var(--text-slate)',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                新增
              </button>
              <button 
                onClick={() => { setIsAddingCustom(false); setNewMedName(''); }}
                style={{ 
                  padding: '8px 0', 
                  borderRadius: '12px', 
                  fontSize: '14.5px', 
                  fontWeight: '600',
                  width: '65px', 
                  textAlign: 'center',
                  background: 'rgba(91, 99, 122, 0.05)',
                  color: 'var(--text-slate)',
                  border: '1px solid rgba(91, 99, 122, 0.1)',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                取消
              </button>
            </div>
          )}
        </div>

        {/* 4. Cervical Mucus Quality */}
        <div className="log-section">
          <h3 className="log-section-title">子宮頸黏液品質</h3>
          <div className="mucus-selector">
            {[
              { id: 'none', label: '無' },
              { id: 'dry', label: '乾燥' },
              { id: 'sticky', label: '黏稠' },
              { id: 'creamy', label: '乳狀' },
              { id: 'watery', label: '水狀' },
              { id: 'egg-white', label: '蛋白狀' }
            ].map(item => {
              const isActive = form.mucus === item.id;
              return (
                <button
                  key={item.id}
                  className={`mucus-btn ${isActive ? 'mucus-btn-active' : ''}`}
                  onClick={() => handleMucusSelect(item.id)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Basal Body Temperature */}
        <div className="log-section">
          <h3 className="log-section-title">基礎體溫</h3>
          <div className="input-number-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TempIcon size={20} />
              <input
                type="number"
                step="0.01"
                placeholder="---"
                className="input-num"
                value={form.temp}
                onChange={handleTempChange}
              />
            </div>
            <div className="temp-unit-toggle">
              <button
                className={`temp-unit-btn ${form.tempUnit === 'C' ? 'temp-unit-btn-active' : ''}`}
                onClick={() => handleTempUnitToggle('C')}
              >
                °C
              </button>
              <button
                className={`temp-unit-btn ${form.tempUnit === 'F' ? 'temp-unit-btn-active' : ''}`}
                onClick={() => handleTempUnitToggle('F')}
              >
                °F
              </button>
            </div>
          </div>
        </div>

        {/* 6. Intercourse */}
        <div className="log-section">
          <h3 className="log-section-title">性行為</h3>
          <div className="intercourse-options">
            {[
              { id: 'none', label: '無行為', type: 'none' },
              { id: 'protected', label: '有避孕', type: 'protected' },
              { id: 'unprotected', label: '無避孕', type: 'unprotected' }
            ].map(item => {
              const isActive = form.intercourse === item.id;
              return (
                <button
                  key={item.id}
                  className={`intercourse-btn ${isActive ? 'intercourse-btn-active' : ''}`}
                  onClick={() => handleIntercourseSelect(item.id)}
                >
                  <IntercourseIcon size={20} type={item.type} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. Notes / Remarks */}
        <div className="log-section">
          <h3 className="log-section-title">備註</h3>
          <textarea
            placeholder="寫點什麼吧..."
            value={form.notes || ''}
            onChange={handleNotesChange}
            style={{
              width: '100%',
              height: '80px',
              padding: '12px',
              borderRadius: '16px',
              border: '1px solid rgba(91, 99, 122, 0.15)',
              background: 'rgba(255, 255, 255, 0.4)',
              fontSize: '14.5px',
              color: 'var(--text-slate)',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
              lineHeight: '1.5'
            }}
          />
        </div>

        {/* Drawer Save/Cancel Footer */}
        <div className="drawer-footer">
          {logs[dateStr] && (
            <button className="btn-secondary" style={{ flex: '0.4', backgroundColor: 'rgba(91, 99, 122, 0.05)', color: 'rgba(91, 99, 122, 0.8)' }} onClick={handleDeleteClick}>
              清除紀錄
            </button>
          )}
          <button className="btn-primary" style={{ flex: '1' }} onClick={handleSaveClick}>
            儲存今日日誌
          </button>
        </div>

      </div>
    </div>
  );
}
