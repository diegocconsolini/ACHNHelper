'use client';

import React, { useState, useEffect } from 'react';
import AlertModal from '../AlertModal';

const STORAGE_KEY = 'acnh-turnip-tracker';
const DAYS = [
  { label: 'Monday AM', key: 'monAM' },
  { label: 'Monday PM', key: 'monPM' },
  { label: 'Tuesday AM', key: 'tueAM' },
  { label: 'Tuesday PM', key: 'tuePM' },
  { label: 'Wednesday AM', key: 'wedAM' },
  { label: 'Wednesday PM', key: 'wedPM' },
  { label: 'Thursday AM', key: 'thuAM' },
  { label: 'Thursday PM', key: 'thuPM' },
  { label: 'Friday AM', key: 'friAM' },
  { label: 'Friday PM', key: 'friPM' },
  { label: 'Saturday AM', key: 'satAM' },
  { label: 'Saturday PM', key: 'satPM' },
];

const TurnipTracker = () => {
  const [buyPrice, setBuyPrice] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [prices, setPrices] = useState({
    monAM: '', monPM: '', tueAM: '', tuePM: '', wedAM: '', wedPM: '',
    thuAM: '', thuPM: '', friAM: '', friPM: '', satAM: '', satPM: '',
  });
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

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
      }
    } catch (err) {
      console.error('Failed to load tracker data:', err);
    }
  };

  const saveData = async (buyP, priceData, historyData) => {
    try {
      const data = { buyPrice: buyP, prices: priceData, history: historyData };
      await window.storage.set(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save tracker data:', err);
    }
  };

  const handleBuyPriceChange = (e) => {
    const val = e.target.value;
    setBuyPrice(val);
    saveData(val, prices, history);
  };

  const handlePriceChange = (key, val) => {
    const newPrices = { ...prices, [key]: val };
    setPrices(newPrices);
    saveData(buyPrice, newPrices, history);
  };

  const getPatternPrediction = () => {
    const priceArray = DAYS.map(d => prices[d.key]).filter(p => p !== '');
    if (priceArray.length === 0) return { patterns: [], chart: [] };

    const nums = priceArray.map(Number);
    const buy = parseFloat(buyPrice) || 0;
    if (buy === 0) return { patterns: [], chart: [] };

    let fluctuating = 0, smallSpike = 0, largeSpike = 0, decreasing = 0;
    let maxPrice = Math.max(...nums), spikeFound = false;

    for (let i = 1; i < nums.length; i++) {
      if (nums[i] > nums[i - 1] && nums[i] > buy * 1.2) {
        spikeFound = true;
        if (maxPrice > buy * 1.6) largeSpike += 2;
        else smallSpike += 2;
      }
    }

    const isDecreasing = nums.every((n, i) => i === 0 || n <= nums[i - 1]);
    if (isDecreasing) {
      decreasing = 40;
    } else {
      fluctuating = Math.floor(nums.reduce((a, b, i) => a + Math.abs(b - (i === 0 ? buy : nums[i - 1])), 0) / nums.length);
      if (!spikeFound) fluctuating += 20;
      smallSpike = Math.max(smallSpike, 15);
      largeSpike = Math.max(largeSpike, 10);
    }

    const total = fluctuating + smallSpike + largeSpike + decreasing || 100;
    const patterns = [
      { name: 'Fluctuating', probability: Math.round((fluctuating / total) * 100) },
      { name: 'Small Spike', probability: Math.round((smallSpike / total) * 100) },
      { name: 'Large Spike', probability: Math.round((largeSpike / total) * 100) },
      { name: 'Decreasing', probability: Math.round((decreasing / total) * 100) },
    ].sort((a, b) => b.probability - a.probability);

    return { patterns, chart: nums, buy };
  };

  const getProfitInfo = (prediction) => {
    const { chart, buy } = prediction;
    if (chart.length === 0 || buy === 0) return null;
    const bestPrice = Math.max(...chart);
    const profitPerTurnip = bestPrice - buy;
    const totalProfit = profitPerTurnip * 4800;
    return { bestPrice, profitPerTurnip, totalProfit };
  };

  const saveToHistory = () => {
    if (!buyPrice || DAYS.every(d => !prices[d.key])) {
      setShowAlert(true); return;
    }
    const weekData = {
      date: new Date().toLocaleDateString(),
      buy: parseFloat(buyPrice),
      prices: { ...prices },
      pattern: getPatternPrediction().patterns[0]?.name || 'Unknown',
    };
    const newHistory = [weekData, ...history].slice(0, 8);
    setHistory(newHistory);
    saveData(buyPrice, prices, newHistory);
    setPrices(Object.fromEntries(DAYS.map(d => [d.key, ''])));
    setBuyPrice('');
  };

  const prediction = getPatternPrediction();
  const { patterns } = prediction;
  const profitInfo = getProfitInfo(prediction);
  const maxChartPrice = Math.max(...(prediction.chart || [0]));

  return (
    <div style={{
      width: '100%',
      background: '#0a1a10',
      color: '#c8e6c0',
      padding: '30px',
      fontFamily: '"DM Sans", sans-serif',
      borderRadius: '12px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
      `}</style>

      <h1 style={{ fontSize: '32px', marginBottom: '10px', fontFamily: '"Playfair Display", serif', color: '#5ec850' }}>
        Turnip Tracker 📈
      </h1>

      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#d4b030' }}>
          Buy Price (Sunday AM)
        </label>
        <input
          type="number"
          value={buyPrice}
          onChange={handleBuyPriceChange}
          placeholder="e.g., 92"
          style={{
            width: '120px',
            padding: '10px',
            background: 'rgba(12,28,14,0.95)',
            border: `2px solid #5ec850`,
            color: '#5ec850',
            fontSize: '16px',
            borderRadius: '6px',
            fontFamily: '"DM Mono", monospace',
          }}
        />
      </div>

      <div style={{ marginBottom: '30px', background: 'rgba(12,28,14,0.95)', padding: '20px', borderRadius: '8px', border: '1px solid #5ec850' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#4aacf0' }}>Weekly Prices</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px' }}>
          {DAYS.map((day) => (
            <div key={day.key}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: '#d4b030' }}>
                {day.label}
              </label>
              <input
                type="number"
                value={prices[day.key]}
                onChange={(e) => handlePriceChange(day.key, e.target.value)}
                placeholder="—"
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#0a1a10',
                  border: `1px solid #5ec850`,
                  color: '#5ec850',
                  fontSize: '14px',
                  borderRadius: '4px',
                  fontFamily: '"DM Mono", monospace',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {prediction.chart.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#4aacf0' }}>Price Chart</h2>
          <div style={{
            background: 'rgba(12,28,14,0.95)',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #5ec850',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '4px',
            height: '150px',
            position: 'relative',
          }}>
            {prediction.chart.map((price, i) => (
              <div key={i} style={{
                flex: 1,
                background: price > (parseFloat(buyPrice) || 0) ? '#5ec850' : '#d4b030',
                height: `${(price / maxChartPrice) * 100}%`,
                borderRadius: '3px',
                position: 'relative',
              }} title={`${DAYS[i]?.label}: ${price}`} />
            ))}
            <div style={{
              position: 'absolute',
              bottom: `${(parseFloat(buyPrice || 0) / maxChartPrice) * 100}%`,
              left: '0',
              right: '0',
              height: '2px',
              background: '#4aacf0',
              opacity: '0.7',
            }} />
          </div>
          <div style={{ fontSize: '12px', color: '#5a7a50', marginTop: '8px' }}>
            Blue line = buy price ({buyPrice})
          </div>
        </div>
      )}

      {patterns.length > 0 && (
        <div style={{ marginBottom: '30px', background: 'rgba(12,28,14,0.95)', padding: '20px', borderRadius: '8px', border: '1px solid #4aacf0' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#4aacf0' }}>Pattern Prediction</h2>
          {patterns.map((p) => (
            <div key={p.name} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px' }}>{p.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '200px',
                  height: '20px',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${p.probability}%`,
                    background: p.probability > 40 ? '#5ec850' : p.probability > 20 ? '#d4b030' : '#4aacf0',
                  }} />
                </div>
                <span style={{ fontSize: '14px', color: '#5ec850', fontFamily: '"DM Mono", monospace', minWidth: '45px' }}>
                  {p.probability}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {profitInfo && (
        <div style={{ marginBottom: '30px', background: 'rgba(12,28,14,0.95)', padding: '20px', borderRadius: '8px', border: '1px solid #d4b030' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#d4b030' }}>Profit Calculator</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#5a7a50', marginBottom: '5px' }}>Best Sell Price</div>
              <div style={{ fontSize: '24px', fontFamily: '"DM Mono", monospace', color: '#5ec850' }}>
                {profitInfo.bestPrice}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#5a7a50', marginBottom: '5px' }}>Profit per Turnip</div>
              <div style={{ fontSize: '24px', fontFamily: '"DM Mono", monospace', color: '#4aacf0' }}>
                {profitInfo.profitPerTurnip > 0 ? '+' : ''}{profitInfo.profitPerTurnip}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#5a7a50', marginBottom: '5px' }}>Total Profit (4800)</div>
              <div style={{ fontSize: '24px', fontFamily: '"DM Mono", monospace', color: '#d4b030' }}>
                {profitInfo.totalProfit > 0 ? '+' : ''}{profitInfo.totalProfit.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '30px', background: 'rgba(12,28,14,0.95)', padding: '20px', borderRadius: '8px', border: '1px solid #5ec850' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '12px', color: '#5ec850' }}>💡 Trading Tips</h2>
        <ul style={{ fontSize: '13px', lineHeight: '1.6', paddingLeft: '20px', color: '#5a7a50' }}>
          <li>Buy low on Sunday (typically 40-110 bells)</li>
          <li>Look for Large Spike patterns for maximum profit</li>
          <li>Check island visitors for better prices</li>
          <li>Turnips spoil after Saturday PM</li>
          <li>Time travel resets prices</li>
          <li>Average profit swing: 50-100+ bells per turnip</li>
        </ul>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={saveToHistory}
          style={{
            padding: '12px 20px',
            background: '#5ec850',
            border: 'none',
            color: '#0a1a10',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          ✓ Save Week to History
        </button>
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{
            padding: '12px 20px',
            background: '#4aacf0',
            border: 'none',
            color: '#0a1a10',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          📊 {showHistory ? 'Hide' : 'Show'} History
        </button>
      </div>

      {showHistory && history.length > 0 && (
        <div style={{ marginTop: '30px', background: 'rgba(12,28,14,0.95)', padding: '20px', borderRadius: '8px', border: '1px solid #4aacf0' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#4aacf0' }}>📈 History (Last 8 Weeks)</h2>
          {history.map((week, i) => (
            <div key={i} style={{
              marginBottom: '15px',
              padding: '15px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '6px',
              borderLeft: `4px solid ${week.pattern === 'Large Spike' ? '#5ec850' : week.pattern === 'Small Spike' ? '#d4b030' : '#4aacf0'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#5a7a50' }}>{week.date}</div>
                  <div style={{ fontSize: '14px', color: '#5ec850', fontFamily: '"DM Mono", monospace', marginTop: '4px' }}>
                    Buy: {week.buy} bells
                  </div>
                </div>
                <div style={{
                  fontSize: '13px',
                  padding: '6px 12px',
                  background: week.pattern === 'Large Spike' ? 'rgba(94,200,80,0.2)' : 'rgba(74,172,240,0.2)',
                  borderRadius: '4px',
                  color: week.pattern === 'Large Spike' ? '#5ec850' : '#4aacf0',
                }}>
                  {week.pattern}
                </div>
              </div>
            </div>
          ))}
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
