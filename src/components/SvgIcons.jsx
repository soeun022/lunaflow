import React from 'react';

// Common icon properties helper
const iconProps = (size = 24, color = 'currentColor') => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

// Arrow Left Icon
export const ChevronLeftIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg {...iconProps(size, color)}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

// Arrow Right Icon
export const ChevronRightIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg {...iconProps(size, color)}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

// Close / Cross Icon
export const CloseIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg {...iconProps(size, color)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

// Plus Icon
export const PlusIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg {...iconProps(size, color)}>
    <path d="M5 12h14M12 5v14" />
  </svg>
);

// Calendar Icon for Nav
export const CalendarIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg {...iconProps(size, color)}>
    <path d="M8 2v4M16 2v4M3 10h18" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
  </svg>
);

// Chart/Trends Icon for Nav
export const InsightsIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg {...iconProps(size, color)}>
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

// Log/Plus Pen Icon for Nav
export const LogIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg {...iconProps(size, color)}>
    <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

// Crescent Moon Icon for Knowledge Tab
export const CrescentIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg {...iconProps(size, color)}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);


// Flow Level SVG: Drop
export const FlowDropIcon = ({ size = 24, level = 'medium', active = false }) => {
  let scale = 0.7;
  let opacity = 0.5;
  
  if (level === 'light') { scale = 0.6; opacity = 0.6; }
  else if (level === 'medium') { scale = 0.85; opacity = 0.85; }
  else if (level === 'heavy') { scale = 1.1; opacity = 1.0; }
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={active ? 'currentColor' : 'none'} 
      stroke="currentColor" 
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: `scale(${scale})`, opacity: opacity, transition: 'all 0.2s ease' }}
    >
      <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13s-7 8.7-7 13a7 7 0 0 0 7 7z" />
    </svg>
  );
};

// Spotting Icon (Dashed Drop)
export const SpottingIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg {...iconProps(size, color)} strokeDasharray="3 3">
    <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13s-7 8.7-7 13a7 7 0 0 0 7 7z" />
  </svg>
);

// Symptoms Custom SVG Icons

// Cramps (Torso pain waves)
export const CrampsIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg {...iconProps(size, color)}>
    {/* Body outline segment */}
    <path d="M6 18c0-3 2-4 6-4s6 1 6 4" />
    {/* Pain radiation waves */}
    <path d="M12 18v-4" />
    <path d="M9 16c1-1 2-2 3-2s2 1 3 2" />
    <path d="M7 13a5 5 0 0 1 10 0" />
  </svg>
);

// Headache (Head with pulse waves)
export const HeadacheIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg {...iconProps(size, color)}>
    <path d="M16 14a4 4 0 0 1-8 0V9a4 4 0 1 1 8 0v5Z" />
    <path d="M12 21v-3" />
    {/* Pulse waves */}
    <path d="M4 8a8 8 0 0 1 2-4" />
    <path d="M20 8a8 8 0 0 0-2-4" />
  </svg>
);

// Mood Swings (Contrasting profiles / masks)
export const MoodSwingsIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg {...iconProps(size, color)}>
    {/* Calm / Happy curve */}
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    {/* Dual eyes */}
    <circle cx="9" cy="9" r="1.5" fill={color} />
    <circle cx="15" cy="9" r="1.5" fill={color} />
    {/* Outer boundary representing changing states */}
    <circle cx="12" cy="12" r="10" />
  </svg>
);

// Fatigue (Battery low)
export const FatigueIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg {...iconProps(size, color)}>
    <rect width="16" height="10" x="2" y="7" rx="2" />
    <path d="M20 11v2" />
    {/* Low energy line */}
    <path d="M6 11h2" />
  </svg>
);

// Breast Tenderness (Focus rings / target shape)
export const BreastTendernessIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg {...iconProps(size, color)}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" fill={color} />
  </svg>
);

// Bloating (Expanding arrow circles)
export const BloatingIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg {...iconProps(size, color)}>
    <circle cx="12" cy="12" r="6" />
    {/* Outward arrows */}
    <path d="m12 6 2 2M12 6l-2 2M12 6v4" />
    <path d="m12 18-2-2M12 18l2-2M12 18v-4" />
    <path d="m6 12 2 2M6 12l2-2M6 12h4" />
    <path d="m18 12-2 2M18 12l-2-2M18 12h-4" />
  </svg>
);

// Acne (Dotted face outline)
export const AcneIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg {...iconProps(size, color)}>
    <circle cx="12" cy="12" r="9" />
    {/* Dots representing acne */}
    <circle cx="8" cy="10" r="1" fill={color} />
    <circle cx="15" cy="11" r="1" fill={color} />
    <circle cx="10" cy="15" r="1.5" fill={color} />
    <circle cx="14" cy="16" r="1" fill={color} />
    <circle cx="12" cy="8" r="1" fill={color} />
  </svg>
);

// Basal Body Temperature (Thermometer)
export const TempIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg {...iconProps(size, color)}>
    <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
    <path d="M12 14v4" />
    <path d="M12 9h2" />
    <path d="M12 6h2" />
  </svg>
);

// Cervical Mucus (Smooth organic waves)
export const MucusIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg {...iconProps(size, color)}>
    <path d="M12 2c0 0-8 6-8 11.5a8 8 0 0 0 16 0C20 8 12 2 12 2Z" fill="none" />
    {/* Soft wavy inner curves indicating texture */}
    <path d="M8 12c2-1 4 1 6 0s2-2 2-2" />
    <path d="M7 15c3-1.5 5 1.5 7 0" />
  </svg>
);

// Intercourse Icon
export const IntercourseIcon = ({ size = 24, type = 'none', color = 'currentColor' }) => {
  if (type === 'protected') {
    return (
      <svg {...iconProps(size, color)}>
        {/* Heart */}
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        {/* Miniature Shield fully contained within the heart */}
        <path d="M12 7.5 L15.5 8.5 V11.5 C15.5 14 12 16 12 16 C12 16 8.5 14 8.5 11.5 V8.5 Z" opacity="0.9" fill="none" strokeWidth={1.5} />
      </svg>
    );
  }
  if (type === 'unprotected') {
    return (
      <svg {...iconProps(size, color)}>
        {/* Clean Outlined Heart without internal squiggles */}
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    );
  }
  // None (No Intercourse)
  return (
    <svg {...iconProps(size, color)}>
      {/* Heart */}
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      {/* Diagonal Ban line extending out of the top-left */}
      <path d="M1.5 1.5 l18.5 18.5" />
    </svg>
  );
};

// Pill Icon for Medication
export const PillIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg {...iconProps(size, color)}>
    <path d="m10.5 5.5 8 8a4.95 4.95 0 1 1-7 7l-8-8a4.95 4.95 0 1 1 7-7Z" />
    <path d="m8.5 10.5 5 5" />
  </svg>
);

// Contraceptive Icon (circle with horizontal line in the middle)
export const ContraceptiveIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg {...iconProps(size, color)}>
    <circle cx="12" cy="12" r="8" />
    <line x1="4" y1="12" x2="20" y2="12" />
  </svg>
);
