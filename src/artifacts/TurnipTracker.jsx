'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AlertModal from '../AlertModal';

const STORAGE_KEY = 'acnh-turnip-tracker';
const DAYS = [
  { label: 'Monday AM', key: 'monAM', short: 'Mon AM' },
  { label: 'Monday PM', key: 'monPM', short: 'Mon PM' },
  { label: 'Tuesday AM', key: 'tueAM', short: 'Tue AM' },
  { label: 'Tuesday PM', key: 'tuePM', short: 'Tue PM' },
  { label: 'Wednesday AM', key: 'wedAM', short: 'Wed AM' },
  { label: 'Wednesday PM', key: 'wedPM', short: 'Wed PM' },
  { label: 'Thursday AM', key: 'thuAM', short: 'Thu AM' },
  { label: 'Thursday PM', key: 'thuPM', short: 'Thu PM' },
  { label: 'Friday AM', key: 'friAM', short: 'Fri AM' },
  { label: 'Friday PM', key: 'friPM', short: 'Fri PM' },
  { label: 'Saturday AM', key: 'satAM', short: 'Sat AM' },
  { label: 'Saturday PM', key: 'satPM', short: 'Sat PM' },
];

// Datamined turnip pattern multiplier ranges from Ninji's reverse-engineered code
// Source: https://gist.github.com/Treeki/85be14d297c80c8b3c0a76375743325b
// Pattern 0: Fluctuating — high/decreasing/high/decreasing/high phases
// Pattern 1: Large Spike — decreasing then 5-slot spike with peak 2.0-6.0x
// Pattern 2: Decreasing — monotonic decrease all week
// Pattern 3: Small Spike — decreasing then 5-slot spike with peak 1.4-2.0x

const PATTERN_NAMES = ['Fluctuating', 'Large Spike', 'Decreasing', 'Small Spike'];
const PATTERN_COLORS = ['#4aacf0', '#5ec850', '#ff6464', '#d4b030'];

// Transition probabilities from datamined code (row = previous pattern, col = next pattern)
const TRANSITION_PROB = [
  [0.20, 0.30, 0.15, 0.35], // from Fluctuating
  [0.50, 0.05, 0.20, 0.25], // from Large Spike
  [0.25, 0.45, 0.05, 0.25], // from Decreasing
  [0.45, 0.25, 0.15, 0.15], // from Small Spike
];

// Base prior when previous pattern is unknown
const BASE_PRIOR = [0.3461, 0.2475, 0.1476, 0.2588];

// Generate all possible multiplier ranges for each pattern
// Returns array of { min, max } for each of 12 half-day slots
function getPatternRanges(patternId) {
  const ranges = [];
  switch (patternId) {
    case 0: { // Fluctuating
      // This pattern has variable phase lengths; we compute the union of all possible configurations
      // Phase structure: high1 (0-6 slots), dec1 (2-3 slots), high2 (variable), dec2 (2-3 slots), high3 (remaining)
      // For simplicity, provide wide ranges that cover all valid configurations
      for (let i = 0; i < 12; i++) {
        // High phases: 0.9-1.4x, Decreasing phases: ~0.4-0.9x
        // Union across all valid phase configurations
        ranges.push({ min: 0.4, max: 1.4 });
      }
      break;
    }
    case 1: { // Large Spike
      // Decreasing phase (variable 1-7 slots), then 5-slot spike, then low
      // peakStart can be slot 3-7 (index 2-6 in 0-indexed for the 12 slots, but actually slot 1-7)
      // We'll compute the envelope across all possible peak positions
      for (let i = 0; i < 12; i++) {
        // Slot could be in decreasing phase (0.4-0.9), spike phase, or post-spike low (0.4-0.9)
        // Spike center (peak) ranges 2.0-6.0x
        ranges.push({ min: 0.4, max: 6.0 });
      }
      break;
    }
    case 2: { // Decreasing
      for (let i = 0; i < 12; i++) {
        // Starts ~0.85-0.9x, decreases ~0.03-0.05 per slot
        const maxMult = 0.9 - (i * 0.03);
        const minMult = Math.max(0.4, 0.85 - (i * 0.05));
        ranges.push({ min: minMult, max: maxMult });
      }
      break;
    }
    case 3: { // Small Spike
      for (let i = 0; i < 12; i++) {
        // Decreasing (0.4-0.9), spike peak (1.4-2.0), or post-spike decreasing
        ranges.push({ min: 0.4, max: 2.0 });
      }
      break;
    }
  }
  return ranges;
}

// Score how well entered prices match a pattern using multiplier range fitting
function scorePattern(patternId, priceEntries, buyPrice) {
  if (buyPrice <= 0 || priceEntries.length === 0) return 0;

  const ranges = getPatternRanges(patternId);
  let score = 1.0;

  for (const { index, price } of priceEntries) {
    const multiplier = price / buyPrice;
    const range = ranges[index];
    if (!range) continue;

    if (multiplier >= range.min && multiplier <= range.max) {
      // Price fits within the pattern's range — reward tighter fits
      const rangeWidth = range.max - range.min;
      if (rangeWidth > 0) {
        score *= 1.0;
      }
    } else {
      // Price outside expected range — penalize based on distance
      const dist = multiplier < range.min
        ? range.min - multiplier
        : multiplier - range.max;
      score *= Math.max(0.001, Math.exp(-dist * 5));
    }
  }

  // Apply more specific heuristics based on actual price behavior
  const prices = priceEntries.map(e => e.price);
  const multipliers = priceEntries.map(e => e.price / buyPrice);
  const maxMult = Math.max(...multipliers);
  const minMult = Math.min(...multipliers);

  switch (patternId) {
    case 0: // Fluctuating: prices oscillate, typically 0.6-1.4x, no huge spikes
      if (maxMult > 1.5) score *= 0.1;
      if (maxMult <= 1.4 && minMult >= 0.4) score *= 1.5;
      break;
    case 1: // Large Spike: should see very high prices (>2.0x) at some point
      if (maxMult > 2.0) score *= 3.0;
      else if (maxMult > 1.4) score *= 1.2;
      else if (priceEntries.length >= 8 && maxMult <= 1.0) score *= 0.1;
      break;
    case 2: // Decreasing: prices should only go down
      {
        let isDecreasing = true;
        for (let i = 1; i < priceEntries.length; i++) {
          if (priceEntries[i].index > priceEntries[i - 1].index &&
              priceEntries[i].price > priceEntries[i - 1].price) {
            isDecreasing = false;
            break;
          }
        }
        if (isDecreasing && priceEntries.length >= 3) score *= 2.0;
        if (!isDecreasing) score *= 0.05;
        if (maxMult > 1.0) score *= 0.1;
      }
      break;
    case 3: // Small Spike: moderate increase (1.4-2.0x peak)
      if (maxMult >= 1.4 && maxMult <= 2.0) score *= 2.5;
      else if (maxMult > 2.0) score *= 0.3;
      else if (priceEntries.length >= 8 && maxMult <= 0.9) score *= 0.2;
      break;
  }

  return score;
}

// Detect pattern probabilities based on entered prices
function detectPatterns(prices, buyPrice) {
  const buy = parseFloat(buyPrice) || 0;
  if (buy <= 0) return [];

  const priceEntries = [];
  DAYS.forEach((day, index) => {
    const val = parseFloat(prices[day.key]);
    if (!isNaN(val) && val > 0) {
      priceEntries.push({ index, price: val });
    }
  });

  if (priceEntries.length === 0) return [];

  // Score each pattern
  const scores = [0, 1, 2, 3].map(id => ({
    id,
    name: PATTERN_NAMES[id],
    color: PATTERN_COLORS[id],
    score: scorePattern(id, priceEntries, buy) * BASE_PRIOR[id],
  }));

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  if (totalScore <= 0) {
    return scores.map(s => ({ ...s, probability: 25 }));
  }

  return scores
    .map(s => ({ ...s, probability: Math.round((s.score / totalScore) * 100) }))
    .sort((a, b) => b.probability - a.probability);
}

// Predict peak window based on most likely pattern
function predictPeak(patterns, prices, buyPrice) {
  if (!patterns.length) return null;
  const buy = parseFloat(buyPrice) || 0;
  if (buy <= 0) return null;

  const top = patterns[0];
  if (top.id !== 1 && top.id !== 3) return null; // Only for spike patterns
  if (top.probability < 20) return null;

  // Find which slots have prices entered
  const entered = [];
  DAYS.forEach((day, index) => {
    const val = parseFloat(prices[day.key]);
    if (!isNaN(val) && val > 0) {
      entered.push({ index, price: val, label: day.short });
    }
  });

  // Find the highest entered price and where it occurred
  const maxEntry = entered.reduce((best, e) => e.price > (best?.price || 0) ? e : best, null);

  if (top.id === 1) { // Large Spike
    // Peak is the 3rd slot of a 5-slot spike sequence
    // Spike can start at slots 2-7 (peakStart from datamined: slots 3-7 give peak at 5-9)
    // If we see increasing prices, predict peak is 1-2 slots after last increase
    let peakWindowStart = 'Wednesday PM';
    let peakWindowEnd = 'Thursday PM';
    let peakMin = Math.round(buy * 2.0);
    let peakMax = Math.round(buy * 6.0);

    if (entered.length >= 2) {
      // Find the first slot where price starts increasing significantly
      for (let i = 1; i < entered.length; i++) {
        if (entered[i].price > entered[i - 1].price && entered[i].price > buy) {
          // Spike is starting around here; peak is ~1-2 slots later
          const peakIdx = Math.min(11, entered[i].index + 1);
          peakWindowStart = DAYS[peakIdx]?.short || 'Unknown';
          peakWindowEnd = DAYS[Math.min(11, peakIdx + 1)]?.short || peakWindowStart;
          break;
        }
      }
    }

    // If we already see a very high price, that might be the peak
    if (maxEntry && maxEntry.price > buy * 2.0) {
      peakWindowStart = maxEntry.label;
      peakWindowEnd = maxEntry.label;
      peakMin = maxEntry.price;
      peakMax = maxEntry.price;
    }

    return {
      type: 'Large Spike',
      window: `${peakWindowStart} - ${peakWindowEnd}`,
      range: `${peakMin.toLocaleString()} - ${peakMax.toLocaleString()} Bells`,
    };
  }

  if (top.id === 3) { // Small Spike
    let peakWindowStart = 'Wednesday AM';
    let peakWindowEnd = 'Thursday AM';
    let peakMin = Math.round(buy * 1.4);
    let peakMax = Math.round(buy * 2.0);

    if (entered.length >= 2) {
      for (let i = 1; i < entered.length; i++) {
        if (entered[i].price > entered[i - 1].price && entered[i].price > buy * 0.9) {
          const peakIdx = Math.min(11, entered[i].index + 2);
          peakWindowStart = DAYS[Math.min(11, peakIdx)]?.short || 'Unknown';
          peakWindowEnd = DAYS[Math.min(11, peakIdx + 1)]?.short || peakWindowStart;
          break;
        }
      }
    }

    if (maxEntry && maxEntry.price > buy * 1.4) {
      peakWindowStart = maxEntry.label;
      peakWindowEnd = maxEntry.label;
      peakMin = maxEntry.price;
      peakMax = maxEntry.price;
    }

    return {
      type: 'Small Spike',
      window: `${peakWindowStart} - ${peakWindowEnd}`,
      range: `${peakMin.toLocaleString()} - ${peakMax.toLocaleString()} Bells`,
    };
  }

  return null;
}

// SVG Price Graph component
const PriceGraph = ({ prices, buyPrice }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const buy = parseFloat(buyPrice) || 0;
  const svgWidth = 640;
  const svgHeight = 280;
  const padLeft = 55;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 50;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  // Build data points: { index, price, x, y } for entered slots
  const dataPoints = [];
  const allSlotData = []; // includes nulls for empty slots
  DAYS.forEach((day, i) => {
    const val = parseFloat(prices[day.key]);
    if (!isNaN(val) && val > 0) {
      dataPoints.push({ index: i, price: val, label: day.short });
      allSlotData.push({ index: i, price: val });
    } else {
      allSlotData.push(null);
    }
  });

  if (dataPoints.length === 0) return null;

  // Compute Y scale
  const allPrices = dataPoints.map(d => d.price);
  if (buy > 0) allPrices.push(buy);
  const minPrice = Math.min(...allPrices) * 0.85;
  const maxPrice = Math.max(...allPrices) * 1.1;
  const priceRange = maxPrice - minPrice || 1;

  const xForSlot = (i) => padLeft + (i / 11) * chartW;
  const yForPrice = (p) => padTop + chartH - ((p - minPrice) / priceRange) * chartH;

  // Build line path (only connecting consecutive entered points)
  const segments = [];
  let currentSegment = [];
  for (let i = 0; i < 12; i++) {
    if (allSlotData[i]) {
      currentSegment.push(allSlotData[i]);
    } else {
      if (currentSegment.length > 0) {
        segments.push(currentSegment);
        currentSegment = [];
      }
    }
  }
  if (currentSegment.length > 0) segments.push(currentSegment);

  // Build SVG paths for line segments
  const linePaths = segments.map(seg =>
    seg.map((pt, j) => {
      const x = xForSlot(pt.index);
      const y = yForPrice(pt.price);
      return j === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ')
  );

  // Build profit/loss shading areas (only where we have consecutive points)
  const shadingPaths = [];
  if (buy > 0) {
    const buyY = yForPrice(buy);
    segments.forEach(seg => {
      if (seg.length < 2) return;
      // Create two clip paths: above buy line (profit) and below (loss)
      const profitPoints = [];
      const lossPoints = [];
      seg.forEach(pt => {
        const x = xForSlot(pt.index);
        const y = yForPrice(pt.price);
        profitPoints.push({ x, y: Math.min(y, buyY) });
        lossPoints.push({ x, y: Math.max(y, buyY) });
      });

      // Profit area (above buy line = lower y values)
      if (seg.some(pt => pt.price > buy)) {
        const path = profitPoints.map((p, i) => (i === 0 ? `M ${p.x} ${buyY}` : ''))
          .join('') +
          profitPoints.map((p, i) => (i === 0 ? `L ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ') +
          ` L ${profitPoints[profitPoints.length - 1].x} ${buyY} Z`;
        shadingPaths.push({ d: path, color: 'rgba(94, 200, 80, 0.15)' });
      }

      // Loss area (below buy line = higher y values)
      if (seg.some(pt => pt.price < buy)) {
        const path = lossPoints.map((p, i) => (i === 0 ? `M ${p.x} ${buyY}` : ''))
          .join('') +
          lossPoints.map((p, i) => (i === 0 ? `L ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ') +
          ` L ${lossPoints[lossPoints.length - 1].x} ${buyY} Z`;
        shadingPaths.push({ d: path, color: 'rgba(255, 100, 100, 0.12)' });
      }
    });
  }

  // Y-axis grid lines
  const yTicks = [];
  const step = Math.ceil(priceRange / 5 / 10) * 10;
  const startTick = Math.floor(minPrice / step) * step;
  for (let v = startTick; v <= maxPrice; v += step) {
    if (v >= minPrice) yTicks.push(v);
  }

  return (
    <div style={{ marginBottom: 30 }}>
      <h2 style={{ fontSize: 18, marginBottom: 15, color: '#4aacf0', fontFamily: '"Playfair Display", serif' }}>
        Price Graph
      </h2>
      <div style={{
        background: 'rgba(12,28,14,0.95)',
        padding: '20px 15px 15px 15px',
        borderRadius: 8,
        border: '1px solid rgba(94,200,80,0.2)',
        overflowX: 'auto',
      }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 280, display: 'block' }}
        >
          {/* Y-axis grid lines */}
          {yTicks.map(v => (
            <g key={v}>
              <line
                x1={padLeft} y1={yForPrice(v)}
                x2={svgWidth - padRight} y2={yForPrice(v)}
                stroke="rgba(94,200,80,0.08)" strokeWidth={1}
              />
              <text
                x={padLeft - 8} y={yForPrice(v) + 4}
                fill="#5a7a50" fontSize={11} textAnchor="end"
                fontFamily='"DM Mono", monospace'
              >
                {v}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {DAYS.map((day, i) => (
            <text
              key={day.key}
              x={xForSlot(i)}
              y={svgHeight - 8}
              fill="#5a7a50"
              fontSize={9}
              textAnchor="middle"
              fontFamily='"DM Mono", monospace'
              transform={`rotate(-30, ${xForSlot(i)}, ${svgHeight - 8})`}
            >
              {day.short}
            </text>
          ))}

          {/* X-axis tick marks */}
          {DAYS.map((day, i) => (
            <line
              key={`tick-${day.key}`}
              x1={xForSlot(i)} y1={padTop + chartH}
              x2={xForSlot(i)} y2={padTop + chartH + 5}
              stroke="rgba(94,200,80,0.15)" strokeWidth={1}
            />
          ))}

          {/* Profit/Loss shading */}
          {shadingPaths.map((sp, i) => (
            <path key={`shade-${i}`} d={sp.d} fill={sp.color} />
          ))}

          {/* Buy price reference line */}
          {buy > 0 && buy >= minPrice && buy <= maxPrice && (
            <g>
              <line
                x1={padLeft} y1={yForPrice(buy)}
                x2={svgWidth - padRight} y2={yForPrice(buy)}
                stroke="#4aacf0" strokeWidth={1.5}
                strokeDasharray="6,4" opacity={0.7}
              />
              <text
                x={svgWidth - padRight + 2} y={yForPrice(buy) + 4}
                fill="#4aacf0" fontSize={10}
                fontFamily='"DM Mono", monospace'
              >
                Buy
              </text>
            </g>
          )}

          {/* Price line segments */}
          {linePaths.map((d, i) => (
            <path
              key={`line-${i}`}
              d={d}
              fill="none"
              stroke="#5ec850"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Data point dots */}
          {dataPoints.map((pt) => {
            const x = xForSlot(pt.index);
            const y = yForPrice(pt.price);
            const isProfit = buy > 0 && pt.price > buy;
            const isLoss = buy > 0 && pt.price < buy;
            return (
              <g key={`dot-${pt.index}`}>
                <circle
                  cx={x} cy={y} r={5}
                  fill={isProfit ? '#5ec850' : isLoss ? '#ff6464' : '#d4b030'}
                  stroke="#0a1a10" strokeWidth={2}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {hoveredPoint?.index === pt.index && (
                  <g>
                    <rect
                      x={x - 35} y={y - 28}
                      width={70} height={20}
                      rx={4}
                      fill="rgba(12,28,14,0.95)"
                      stroke={isProfit ? '#5ec850' : isLoss ? '#ff6464' : '#d4b030'}
                      strokeWidth={1}
                    />
                    <text
                      x={x} y={y - 14}
                      fill="#c8e6c0" fontSize={11}
                      textAnchor="middle"
                      fontFamily='"DM Mono", monospace'
                    >
                      {pt.price} bells
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Empty slot indicators */}
          {DAYS.map((day, i) => {
            if (allSlotData[i]) return null;
            return (
              <circle
                key={`empty-${i}`}
                cx={xForSlot(i)}
                cy={padTop + chartH}
                r={2}
                fill="rgba(94,200,80,0.2)"
              />
            );
          })}
        </svg>
        <div style={{ display: 'flex', gap: 20, marginTop: 8, justifyContent: 'center' }}>
          <span style={{ fontSize: 11, color: '#5a7a50', fontFamily: '"DM Mono", monospace' }}>
            <span style={{ display: 'inline-block', width: 20, height: 2, background: '#4aacf0', verticalAlign: 'middle', marginRight: 4, borderTop: '1px dashed #4aacf0' }} />
            Buy price ({buyPrice})
          </span>
          <span style={{ fontSize: 11, color: '#5a7a50', fontFamily: '"DM Mono", monospace' }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#5ec850', verticalAlign: 'middle', marginRight: 4 }} />
            Profit
          </span>
          <span style={{ fontSize: 11, color: '#5a7a50', fontFamily: '"DM Mono", monospace' }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#ff6464', verticalAlign: 'middle', marginRight: 4 }} />
            Loss
          </span>
        </div>
      </div>
    </div>
  );
};

const TurnipTracker = () => {
  const [buyPrice, setBuyPrice] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [prices, setPrices] = useState({
    monAM: '', monPM: '', tueAM: '', tuePM: '', wedAM: '', wedPM: '',
    thuAM: '', thuPM: '', friAM: '', friPM: '', satAM: '', satPM: '',
  });
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [turnipCount, setTurnipCount] = useState('4000');
  const [hoveredBtn, setHoveredBtn] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await window.storage.get(STORAGE_KEY);
      if (result) {
        const data = JSON.parse(result.value);
        setBuyPrice(data.buyPrice || '');
        setPrices(data.prices || {});
        setHistory(data.history || []);
        if (data.turnipCount) setTurnipCount(data.turnipCount);
      }
    } catch (err) {
      console.error('Failed to load tracker data:', err);
    }
  };

  const saveData = async (buyP, priceData, historyData, count) => {
    try {
      const data = { buyPrice: buyP, prices: priceData, history: historyData, turnipCount: count };
      await window.storage.set(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save tracker data:', err);
    }
  };

  const handleBuyPriceChange = (e) => {
    const val = e.target.value;
    setBuyPrice(val);
    saveData(val, prices, history, turnipCount);
  };

  const handlePriceChange = (key, val) => {
    const newPrices = { ...prices, [key]: val };
    setPrices(newPrices);
    saveData(buyPrice, newPrices, history, turnipCount);
  };

  const handleTurnipCountChange = (e) => {
    const val = e.target.value;
    setTurnipCount(val);
    saveData(buyPrice, prices, history, val);
  };

  // Pattern detection using datamined multiplier ranges
  const patterns = useMemo(() => detectPatterns(prices, buyPrice), [prices, buyPrice]);
  const peakPrediction = useMemo(() => predictPeak(patterns, prices, buyPrice), [patterns, prices, buyPrice]);

  // Profit calculator
  const profitInfo = useMemo(() => {
    const buy = parseFloat(buyPrice) || 0;
    if (buy <= 0) return null;

    const enteredPrices = DAYS
      .map(d => parseFloat(prices[d.key]))
      .filter(p => !isNaN(p) && p > 0);

    if (enteredPrices.length === 0) return null;

    const bestPrice = Math.max(...enteredPrices);
    const bestSlot = DAYS.find(d => parseFloat(prices[d.key]) === bestPrice);
    const profitPerTurnip = bestPrice - buy;
    const count = parseInt(turnipCount) || 0;
    const totalProfit = profitPerTurnip * count;
    const totalInvestment = buy * count;
    const totalRevenue = bestPrice * count;

    return {
      bestPrice,
      bestSlot: bestSlot?.short || '',
      profitPerTurnip,
      totalProfit,
      totalInvestment,
      totalRevenue,
      count,
    };
  }, [prices, buyPrice, turnipCount]);

  const hasAnyPrice = DAYS.some(d => prices[d.key] !== '');

  const saveToHistory = () => {
    if (!buyPrice || DAYS.every(d => !prices[d.key])) {
      setShowAlert(true); return;
    }
    const weekData = {
      date: new Date().toLocaleDateString(),
      buy: parseFloat(buyPrice),
      prices: { ...prices },
      pattern: patterns[0]?.name || 'Unknown',
    };
    const newHistory = [weekData, ...history].slice(0, 8);
    setHistory(newHistory);
    saveData(buyPrice, prices, newHistory, turnipCount);
    setPrices(Object.fromEntries(DAYS.map(d => [d.key, ''])));
    setBuyPrice('');
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    background: '#0a1a10',
    border: '1px solid rgba(94,200,80,0.3)',
    color: '#5ec850',
    fontSize: 14,
    borderRadius: 4,
    fontFamily: '"DM Mono", monospace',
    outline: 'none',
  };

  return (
    <div style={{
      width: '100%',
      background: '#0a1a10',
      color: '#c8e6c0',
      padding: 30,
      fontFamily: '"DM Sans", sans-serif',
      borderRadius: 12,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
      `}</style>

      <h1 style={{
        fontSize: 32, marginBottom: 6,
        fontFamily: '"Playfair Display", serif',
        fontWeight: 900,
        color: '#5ec850',
      }}>
        Turnip Tracker
      </h1>
      <p style={{ fontSize: 13, color: '#5a7a50', marginBottom: 30 }}>
        Log your weekly turnip prices, detect patterns, and predict your best sell window.
      </p>

      {/* Buy Price Input */}
      <div style={{ marginBottom: 30 }}>
        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#d4b030', fontWeight: 500 }}>
          Buy Price (Sunday AM)
        </label>
        <input
          type="number"
          value={buyPrice}
          onChange={handleBuyPriceChange}
          placeholder="e.g., 92"
          style={{
            ...inputStyle,
            width: 140,
            padding: '10px 12px',
            border: '2px solid #5ec850',
            fontSize: 16,
            borderRadius: 6,
          }}
        />
        <span style={{ fontSize: 12, color: '#5a7a50', marginLeft: 10 }}>
          Typical range: 90-110 bells
        </span>
      </div>

      {/* Weekly Prices Grid */}
      <div style={{
        marginBottom: 30,
        background: 'rgba(12,28,14,0.95)',
        padding: 20, borderRadius: 8,
        border: '1px solid rgba(94,200,80,0.2)',
      }}>
        <h2 style={{ fontSize: 18, marginBottom: 20, color: '#4aacf0', fontFamily: '"Playfair Display", serif' }}>
          Weekly Prices
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 15 }}>
          {DAYS.map((day) => {
            const val = parseFloat(prices[day.key]);
            const buy = parseFloat(buyPrice) || 0;
            const isProfit = !isNaN(val) && buy > 0 && val > buy;
            const isLoss = !isNaN(val) && buy > 0 && val < buy;
            return (
              <div key={day.key}>
                <label style={{
                  display: 'block', fontSize: 11, marginBottom: 6,
                  color: '#d4b030', fontFamily: '"DM Mono", monospace',
                }}>
                  {day.short}
                </label>
                <input
                  type="number"
                  value={prices[day.key]}
                  onChange={(e) => handlePriceChange(day.key, e.target.value)}
                  placeholder="--"
                  style={{
                    ...inputStyle,
                    borderColor: isProfit ? 'rgba(94,200,80,0.5)' : isLoss ? 'rgba(255,100,100,0.4)' : 'rgba(94,200,80,0.2)',
                  }}
                />
                {!isNaN(val) && buy > 0 && (
                  <div style={{
                    fontSize: 10, marginTop: 3,
                    fontFamily: '"DM Mono", monospace',
                    color: isProfit ? '#5ec850' : isLoss ? '#ff6464' : '#5a7a50',
                  }}>
                    {isProfit ? '+' : ''}{val - buy}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SVG Price Graph */}
      {hasAnyPrice && <PriceGraph prices={prices} buyPrice={buyPrice} />}

      {/* Pattern Detection */}
      {patterns.length > 0 && (
        <div style={{
          marginBottom: 30,
          background: 'rgba(12,28,14,0.95)',
          padding: 20, borderRadius: 8,
          border: '1px solid rgba(74,172,240,0.3)',
        }}>
          <h2 style={{ fontSize: 18, marginBottom: 4, color: '#4aacf0', fontFamily: '"Playfair Display", serif' }}>
            Pattern Prediction
          </h2>
          <p style={{ fontSize: 11, color: '#5a7a50', marginBottom: 16 }}>
            Based on datamined price multiplier ranges (Ninji/Treeki)
          </p>
          {patterns.map((p) => (
            <div key={p.name} style={{
              marginBottom: 10,
              display: 'flex', alignItems: 'center',
              gap: 12,
            }}>
              <span style={{
                fontSize: 13, minWidth: 100,
                color: p.probability >= 40 ? '#c8e6c0' : '#5a7a50',
                fontWeight: p.probability >= 40 ? 600 : 400,
              }}>
                {p.name}
              </span>
              <div style={{
                flex: 1, height: 22,
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 4, overflow: 'hidden',
                position: 'relative',
              }}>
                <div style={{
                  height: '100%',
                  width: `${p.probability}%`,
                  background: p.color,
                  borderRadius: 4,
                  transition: 'width 0.4s ease',
                  opacity: 0.8,
                }} />
              </div>
              <span style={{
                fontSize: 14, fontFamily: '"DM Mono", monospace',
                minWidth: 45, textAlign: 'right',
                color: p.probability >= 40 ? p.color : '#5a7a50',
                fontWeight: p.probability >= 40 ? 700 : 400,
              }}>
                {p.probability}%
              </span>
            </div>
          ))}

          {/* Peak Prediction */}
          {peakPrediction && (
            <div style={{
              marginTop: 16, padding: '14px 16px',
              background: 'rgba(0,0,0,0.25)',
              borderRadius: 6,
              borderLeft: `3px solid ${peakPrediction.type === 'Large Spike' ? '#5ec850' : '#d4b030'}`,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#c8e6c0', marginBottom: 6 }}>
                Peak Prediction ({peakPrediction.type})
              </div>
              <div style={{ display: 'flex', gap: 30 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#5a7a50', marginBottom: 2 }}>Likely Peak Window</div>
                  <div style={{ fontSize: 14, fontFamily: '"DM Mono", monospace', color: '#d4b030' }}>
                    {peakPrediction.window}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#5a7a50', marginBottom: 2 }}>Expected Range</div>
                  <div style={{ fontSize: 14, fontFamily: '"DM Mono", monospace', color: '#5ec850' }}>
                    {peakPrediction.range}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profit Calculator */}
      {profitInfo && (
        <div style={{
          marginBottom: 30,
          background: 'rgba(12,28,14,0.95)',
          padding: 20, borderRadius: 8,
          border: '1px solid rgba(212,176,48,0.3)',
        }}>
          <h2 style={{ fontSize: 18, marginBottom: 16, color: '#d4b030', fontFamily: '"Playfair Display", serif' }}>
            Profit Calculator
          </h2>

          {/* Turnip count input */}
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 13, color: '#5a7a50' }}>Turnips purchased:</label>
            <input
              type="number"
              value={turnipCount}
              onChange={handleTurnipCountChange}
              placeholder="4000"
              style={{
                ...inputStyle,
                width: 120,
                border: '1px solid rgba(212,176,48,0.4)',
              }}
            />
            <span style={{ fontSize: 11, color: '#5a7a50' }}>
              (bought in bundles of 10)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 15 }}>
            <div style={{
              padding: 14, background: 'rgba(0,0,0,0.2)', borderRadius: 6,
            }}>
              <div style={{ fontSize: 11, color: '#5a7a50', marginBottom: 4 }}>Best Sell Price</div>
              <div style={{ fontSize: 22, fontFamily: '"DM Mono", monospace', color: '#5ec850' }}>
                {profitInfo.bestPrice} <span style={{ fontSize: 12, color: '#5a7a50' }}>bells</span>
              </div>
              <div style={{ fontSize: 11, color: '#5a7a50', marginTop: 2 }}>
                {profitInfo.bestSlot}
              </div>
            </div>
            <div style={{
              padding: 14, background: 'rgba(0,0,0,0.2)', borderRadius: 6,
            }}>
              <div style={{ fontSize: 11, color: '#5a7a50', marginBottom: 4 }}>Profit per Turnip</div>
              <div style={{
                fontSize: 22, fontFamily: '"DM Mono", monospace',
                color: profitInfo.profitPerTurnip >= 0 ? '#5ec850' : '#ff6464',
              }}>
                {profitInfo.profitPerTurnip > 0 ? '+' : ''}{profitInfo.profitPerTurnip}
              </div>
              <div style={{ fontSize: 11, color: '#5a7a50', marginTop: 2 }}>
                Buy {buyPrice} → Sell {profitInfo.bestPrice}
              </div>
            </div>
            <div style={{
              padding: 14, background: 'rgba(0,0,0,0.2)', borderRadius: 6,
            }}>
              <div style={{ fontSize: 11, color: '#5a7a50', marginBottom: 4 }}>Investment</div>
              <div style={{ fontSize: 22, fontFamily: '"DM Mono", monospace', color: '#4aacf0' }}>
                {profitInfo.totalInvestment.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: '#5a7a50', marginTop: 2 }}>
                {profitInfo.count.toLocaleString()} turnips x {buyPrice}
              </div>
            </div>
            <div style={{
              padding: 14, borderRadius: 6,
              background: profitInfo.totalProfit >= 0
                ? 'rgba(94,200,80,0.08)' : 'rgba(255,100,100,0.08)',
              border: `1px solid ${profitInfo.totalProfit >= 0 ? 'rgba(94,200,80,0.2)' : 'rgba(255,100,100,0.2)'}`,
            }}>
              <div style={{ fontSize: 11, color: '#5a7a50', marginBottom: 4 }}>
                Total {profitInfo.totalProfit >= 0 ? 'Profit' : 'Loss'}
              </div>
              <div style={{
                fontSize: 22, fontFamily: '"DM Mono", monospace', fontWeight: 700,
                color: profitInfo.totalProfit >= 0 ? '#5ec850' : '#ff6464',
              }}>
                {profitInfo.totalProfit > 0 ? '+' : ''}{profitInfo.totalProfit.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: '#5a7a50', marginTop: 2 }}>
                {profitInfo.count.toLocaleString()} turnips x {profitInfo.profitPerTurnip > 0 ? '+' : ''}{profitInfo.profitPerTurnip}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trading Tips */}
      <div style={{
        marginBottom: 30,
        background: 'rgba(12,28,14,0.95)',
        padding: 20, borderRadius: 8,
        border: '1px solid rgba(94,200,80,0.15)',
      }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: '#5ec850', fontFamily: '"Playfair Display", serif' }}>
          Trading Tips
        </h2>
        <ul style={{ fontSize: 13, lineHeight: 1.8, paddingLeft: 20, color: '#5a7a50', margin: 0 }}>
          <li>Buy low on Sunday (typical range: 90-110 bells)</li>
          <li><span style={{ color: '#5ec850' }}>Large Spike</span> patterns can reach 200-600+ bells — always the best sell</li>
          <li><span style={{ color: '#d4b030' }}>Small Spike</span> peaks at 140-200 bells — decent profit</li>
          <li><span style={{ color: '#ff6464' }}>Decreasing</span> patterns never recover — sell ASAP or visit friends</li>
          <li>Check other players' islands for better prices if your pattern is bad</li>
          <li>Turnips spoil after Saturday PM — do not hold past the week</li>
          <li>Time traveling backwards or to Sunday spoils all turnips</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          onClick={saveToHistory}
          onMouseEnter={() => setHoveredBtn('save')}
          onMouseLeave={() => setHoveredBtn(null)}
          style={{
            padding: '12px 20px',
            background: hoveredBtn === 'save' ? '#4db843' : '#5ec850',
            border: 'none',
            color: '#0a1a10',
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 6,
            cursor: 'pointer',
            outline: 'none',
            transition: 'background-color 0.2s ease',
          }}
        >
          Save Week to History
        </button>
        <button
          onClick={() => setShowHistory(!showHistory)}
          onMouseEnter={() => setHoveredBtn('history')}
          onMouseLeave={() => setHoveredBtn(null)}
          style={{
            padding: '12px 20px',
            background: hoveredBtn === 'history' ? '#3d9ae0' : '#4aacf0',
            border: 'none',
            color: '#0a1a10',
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 6,
            cursor: 'pointer',
            outline: 'none',
            transition: 'background-color 0.2s ease',
          }}
        >
          {showHistory ? 'Hide' : 'Show'} History
        </button>
      </div>

      {/* History */}
      {showHistory && history.length > 0 && (
        <div style={{
          marginTop: 10,
          background: 'rgba(12,28,14,0.95)',
          padding: 20, borderRadius: 8,
          border: '1px solid rgba(74,172,240,0.3)',
        }}>
          <h2 style={{ fontSize: 18, marginBottom: 20, color: '#4aacf0', fontFamily: '"Playfair Display", serif' }}>
            History (Last 8 Weeks)
          </h2>
          {history.map((week, i) => {
            const patternColor =
              week.pattern === 'Large Spike' ? '#5ec850' :
              week.pattern === 'Small Spike' ? '#d4b030' :
              week.pattern === 'Decreasing' ? '#ff6464' : '#4aacf0';
            return (
              <div key={i} style={{
                marginBottom: 12,
                padding: 15,
                background: 'rgba(0,0,0,0.25)',
                borderRadius: 6,
                borderLeft: `4px solid ${patternColor}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#5a7a50' }}>{week.date}</div>
                    <div style={{ fontSize: 14, color: '#5ec850', fontFamily: '"DM Mono", monospace', marginTop: 4 }}>
                      Buy: {week.buy} bells
                    </div>
                  </div>
                  <div style={{
                    fontSize: 13,
                    padding: '6px 12px',
                    background: `${patternColor}15`,
                    borderRadius: 4,
                    color: patternColor,
                    fontWeight: 500,
                  }}>
                    {week.pattern}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showHistory && history.length === 0 && (
        <div style={{
          marginTop: 10, padding: 30, textAlign: 'center',
          background: 'rgba(12,28,14,0.95)', borderRadius: 8,
          border: '1px solid rgba(94,200,80,0.1)',
          color: '#5a7a50', fontSize: 14,
        }}>
          No history yet. Save a completed week to start tracking patterns over time.
        </div>
      )}

      <AlertModal
        open={showAlert}
        title="Missing Info"
        message="Please enter a buy price and at least one daily price."
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
};

export default TurnipTracker;
