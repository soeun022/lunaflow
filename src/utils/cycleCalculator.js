/**
 * LunaFlow Cycle Prediction Engine
 * Dependency-free Date arithmetic helper functions and cycle prediction calculations.
 */

// Helper: Format Date to YYYY-MM-DD
export function formatDate(date) {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

// Helper: Parse YYYY-MM-DD into a local Date object (avoiding timezone offset issues)
export function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Helper: Add days to a date string
export function addDays(dateStr, days) {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

// Helper: Get difference in days between two date strings (date2 - date1)
export function differenceInDays(dateStr1, dateStr2) {
  const d1 = parseDate(dateStr1);
  const d2 = parseDate(dateStr2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Group daily menstrual logs into contiguous menstrual periods.
 * @param {Object} logs - The logs dictionary (dateStr -> logData)
 * @returns {Array} List of periods: { startDate, endDate, length }
 */
export function extractActualPeriods(logs) {
  // Filter dates that have actual menstrual flow recorded
  const periodDates = Object.keys(logs)
    .filter(dateStr => logs[dateStr] && logs[dateStr].flow && logs[dateStr].flow !== 'none')
    .sort();

  if (periodDates.length === 0) return [];

  const periods = [];
  let currentPeriod = {
    startDate: periodDates[0],
    endDate: periodDates[0],
    length: 1
  };

  for (let i = 1; i < periodDates.length; i++) {
    const prevDate = periodDates[i - 1];
    const currDate = periodDates[i];
    const diff = differenceInDays(prevDate, currDate);

    // If consecutive days (diff is 1) or brief gap (e.g. 1 day gap where user forgot to log but it's the same period)
    if (diff <= 2) {
      currentPeriod.endDate = currDate;
      currentPeriod.length = differenceInDays(currentPeriod.startDate, currDate) + 1;
    } else {
      periods.push(currentPeriod);
      currentPeriod = {
        startDate: currDate,
        endDate: currDate,
        length: 1
      };
    }
  }
  periods.push(currentPeriod);
  return periods;
}

/**
 * Analyze logs and calculate cycle statistics and predictions.
 * @param {Object} logs - The logs dictionary
 * @param {number} defaultCycle - Default cycle length (typically 28)
 * @param {number} defaultPeriod - Default period length (typically 5)
 * @returns {Object} { avgCycleLength, avgPeriodLength, predictions: { periodRanges: [], fertileRanges: [], ovulationDates: [] } }
 */
export function calculateCycleStatsAndPredictions(logs, defaultCycle = 28, defaultPeriod = 5) {
  const actualPeriods = extractActualPeriods(logs);
  
  let avgPeriodLength = defaultPeriod;
  let avgCycleLength = defaultCycle;

  // 1. Calculate Average Period Length
  if (actualPeriods.length > 0) {
    const totalPeriodDays = actualPeriods.reduce((sum, p) => sum + p.length, 0);
    avgPeriodLength = Math.round((totalPeriodDays / actualPeriods.length) * 10) / 10;
  }

  // 2. Calculate Average Cycle Length (difference between successive period start dates)
  if (actualPeriods.length >= 2) {
    let totalCycleDays = 0;
    for (let i = 1; i < actualPeriods.length; i++) {
      totalCycleDays += differenceInDays(actualPeriods[i - 1].startDate, actualPeriods[i].startDate);
    }
    avgCycleLength = Math.round((totalCycleDays / (actualPeriods.length - 1)) * 10) / 10;
  }

  // Limit cycle calculations to reasonable ranges
  if (avgCycleLength < 20 || avgCycleLength > 45) avgCycleLength = defaultCycle;
  if (avgPeriodLength < 2 || avgPeriodLength > 14) avgPeriodLength = defaultPeriod;

  // Predictions
  const predictions = {
    periodRanges: [],     // { startDate, endDate }
    ovulationDates: [],   // date strings
    fertileRanges: []     // { startDate, endDate }
  };

  // If there are no actual periods logged, we cannot predict future cycles yet
  if (actualPeriods.length === 0) {
    return {
      avgCycleLength,
      avgPeriodLength,
      actualPeriods,
      predictions
    };
  }

  // Generate past cycles ovulation and fertile windows
  for (let i = 0; i < actualPeriods.length - 1; i++) {
    const currentStart = actualPeriods[i].startDate;
    const nextStart = actualPeriods[i + 1].startDate;
    const ovulationDay = addDays(nextStart, -14);
    
    // Safety check: ensure ovulation day belongs to the cycle start
    if (ovulationDay >= currentStart) {
      predictions.ovulationDates.push(ovulationDay);

      const fertileStart = addDays(ovulationDay, -5);
      const fertileEnd = addDays(ovulationDay, 1);
      predictions.fertileRanges.push({ startDate: fertileStart, endDate: fertileEnd });
    }
  }

  // Predict 6 future cycles based on the latest actual period start date
  const latestActualPeriod = actualPeriods[actualPeriods.length - 1];
  let currentStart = latestActualPeriod.startDate;

  // Generate 6 future cycles
  for (let i = 1; i <= 6; i++) {
    // Predicted start date for cycle (i)
    const nextStart = addDays(currentStart, Math.round(avgCycleLength));
    const nextEnd = addDays(nextStart, Math.round(avgPeriodLength) - 1);
    
    predictions.periodRanges.push({ startDate: nextStart, endDate: nextEnd });

    // Ovulation is 14 days prior to the NEXT cycle's start date
    const ovulationDay = addDays(nextStart, -14);
    predictions.ovulationDates.push(ovulationDay);

    // Fertile window is from 5 days before ovulation to 1 day after ovulation (total 7 days)
    const fertileStart = addDays(ovulationDay, -5);
    const fertileEnd = addDays(ovulationDay, 1);
    predictions.fertileRanges.push({ startDate: fertileStart, endDate: fertileEnd });

    currentStart = nextStart;
  }

  return {
    avgCycleLength: Math.round(avgCycleLength),
    avgPeriodLength: Math.round(avgPeriodLength),
    actualPeriods,
    predictions
  };
}

/**
 * Returns the cycle status of a specific date.
 * @param {string} dateStr - Target date in YYYY-MM-DD format
 * @param {Object} logs - The user logs
 * @param {Object} stats - The output of calculateCycleStatsAndPredictions
 * @returns {string} 'actual-period' | 'predicted-period' | 'ovulation' | 'fertile' | 'safe'
 */
export function getDayStatus(dateStr, logs, stats) {
  // 1. Check if actually bleeding
  if (logs[dateStr] && logs[dateStr].flow && logs[dateStr].flow !== 'none') {
    return 'actual-period';
  }

  // If we don't have predictions, everything else defaults to safe
  if (!stats || !stats.predictions) return 'safe';

  // 2. Check if predicted period
  const isInPredictedPeriod = stats.predictions.periodRanges.some(
    r => dateStr >= r.startDate && dateStr <= r.endDate
  );
  if (isInPredictedPeriod) return 'predicted-period';

  // 3. Check if ovulation day
  const isOvulationDay = stats.predictions.ovulationDates.includes(dateStr);
  if (isOvulationDay) return 'ovulation';

  // 4. Check if in fertile window
  const isInFertileWindow = stats.predictions.fertileRanges.some(
    r => dateStr >= r.startDate && dateStr <= r.endDate
  );
  if (isInFertileWindow) return 'fertile';

  // 5. Otherwise, safe period
  return 'safe';
}

/**
 * Get human-readable details about the current status on a given date.
 * Useful for the Header summaries.
 */
export function getCycleSummary(targetDateStr, logs, stats) {
  if (!stats || stats.actualPeriods.length === 0) {
    return {
      phase: 'welcoming',
      phaseName: '歡迎使用',
      daysDifference: 0,
      summary: '請點擊下方按鈕，記錄您的最近一次月經開始日，開啟月相追蹤。'
    };
  }

  const currentStatus = getDayStatus(targetDateStr, logs, stats);

  // Find where we are relative to cycles
  // Let's check if we are in an actual period
  if (currentStatus === 'actual-period') {
    const period = stats.actualPeriods.find(p => targetDateStr >= p.startDate && targetDateStr <= p.endDate);
    const dayNumber = period ? differenceInDays(period.startDate, targetDateStr) + 1 : 1;
    return {
      phase: 'actual-period',
      phaseName: '月經期',
      daysDifference: dayNumber,
      summary: `今天是您經期的第 ${dayNumber} 天。\n請注意腹部保暖，多休息。`
    };
  }

  if (currentStatus === 'predicted-period') {
    const period = stats.predictions.periodRanges.find(r => targetDateStr >= r.startDate && targetDateStr <= r.endDate);
    const dayNumber = period ? differenceInDays(period.startDate, targetDateStr) + 1 : 1;
    return {
      phase: 'predicted-period',
      phaseName: '預測經期',
      daysDifference: dayNumber,
      summary: `預估為您經期的第 ${dayNumber} 天。\n建議隨身攜帶生理用品。`
    };
  }

  if (currentStatus === 'ovulation') {
    return {
      phase: 'ovulation',
      phaseName: '排卵日',
      daysDifference: 0,
      summary: '此時受孕機率最高，若無懷孕計畫，請務必做好避孕措施。'
    };
  }

  if (currentStatus === 'fertile') {
    // Find ovulation day associated with this fertile range
    const rangeIndex = stats.predictions.fertileRanges.findIndex(r => targetDateStr >= r.startDate && targetDateStr <= r.endDate);
    let daysToOvulation = 0;
    if (rangeIndex !== -1 && stats.predictions.ovulationDates[rangeIndex]) {
      daysToOvulation = differenceInDays(targetDateStr, stats.predictions.ovulationDates[rangeIndex]);
    }
    return {
      phase: 'fertile',
      phaseName: '排卵期 (危險期)',
      daysDifference: daysToOvulation,
      summary: daysToOvulation > 0 
        ? `處於易孕排卵期。\n距離預估排卵日還有 ${daysToOvulation} 天。`
        : `處於易孕排卵期。\n預估排卵日已過 ${Math.abs(daysToOvulation)} 天。`
    };
  }

  // If in safe period, find how many days until the next period (actual or predicted) starts
  const allPeriodStarts = [
    ...stats.actualPeriods.map(p => p.startDate),
    ...stats.predictions.periodRanges.map(p => p.startDate)
  ].sort();

  const nextPeriodStart = allPeriodStarts.find(startDate => startDate > targetDateStr);
  if (nextPeriodStart) {
    const daysUntil = differenceInDays(targetDateStr, nextPeriodStart);
    return {
      phase: 'safe',
      phaseName: '安全期',
      daysDifference: daysUntil,
      summary: `距離下一次生理期來臨還有 ${daysUntil} 天。`
    };
  }

  return {
    phase: 'safe',
    phaseName: '安全期',
    daysDifference: 0,
    summary: '身體狀態良好，規律生活是維持生理週期健康的最佳方式。'
  };
}
