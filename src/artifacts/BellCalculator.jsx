'use client';

import React, { useState, useEffect } from 'react';

export default function BellCalculator() {
  const [activeTab, setActiveTab] = useState('selling');
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQty, setItemQty] = useState('1');
  const [loans, setLoans] = useState({});
  const [targetDays, setTargetDays] = useState('30');
  const [dailyIncome, setDailyIncome] = useState({});

  const loanData = {
    tent: { name: 'Tent → House', cost: 98000 },
    exp1: { name: '1st Expansion', cost: 198000 },
    exp2: { name: '2nd Expansion', cost: 348000 },
    exp3: { name: '3rd Expansion', cost: 548000 },
    exp4: { name: '4th Expansion', cost: 758000 },
    exp5: { name: '5th Expansion', cost: 1248000 },
    exp6: { name: '6th Expansion', cost: 2498000 },
    storage: { name: 'Storage Upgrade', cost: 500000 },
  };

  const incomeCategories = {
    moneyTrees: { label: 'Money Trees', default: 50000 },
    moneyRock: { label: 'Money Rock', default: 16100 },
    fossils: { label: 'Fossils', default: 30000 },
    shells: { label: 'Shells', default: 20000 },
    hotItem: { label: 'Hot Item Selling', default: 40000 },
    fruitSales: { label: 'Fruit Selling', default: 25000 },
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const itemsData = await window.storage.get('acnh-bell-calc-items');
      const loansData = await window.storage.get('acnh-bell-calc-loans');
      const incomeData = await window.storage.get('acnh-bell-calc-income');

      if (itemsData) setItems(JSON.parse(itemsData.value));
      if (loansData) setLoans(JSON.parse(loansData.value));
      if (incomeData) setDailyIncome(JSON.parse(incomeData.value));
    } catch (e) {
      console.log('Storage not available');
    }
  };

  const saveItems = async (newItems) => {
    setItems(newItems);
    try {
      await window.storage.set('acnh-bell-calc-items', JSON.stringify(newItems));
    } catch (e) {
      console.error('Error saving:', e);
    }
  };

  const saveLoans = async (newLoans) => {
    setLoans(newLoans);
    try {
      await window.storage.set('acnh-bell-calc-loans', JSON.stringify(newLoans));
    } catch (e) {
      console.error('Error saving:', e);
    }
  };

  const saveDailyIncome = async (newIncome) => {
    setDailyIncome(newIncome);
    try {
      await window.storage.set('acnh-bell-calc-income', JSON.stringify(newIncome));
    } catch (e) {
      console.error('Error saving:', e);
    }
  };

  const addItem = (name, price, qty = 1) => {
    const newItems = [
      ...items,
      { id: Date.now(), name, price: parseInt(price) || 0, qty: parseInt(qty) || 1 },
    ];
    saveItems(newItems);
    if (name === itemName) {
      setItemName('');
      setItemPrice('');
      setItemQty('1');
    }
  };

  const removeItem = (id) => {
    saveItems(items.filter((item) => item.id !== id));
  };

  const clearAllItems = () => {
    saveItems([]);
  };

  const toggleLoan = (key) => {
    const newLoans = { ...loans, [key]: !loans[key] };
    saveLoans(newLoans);
  };

  const updateIncomeValue = (key, value) => {
    const newIncome = { ...dailyIncome, [key]: parseInt(value) || 0 };
    saveDailyIncome(newIncome);
  };

  const sellingTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const remainingLoans = Object.entries(loanData)
    .filter(([key]) => !loans[key])
    .reduce((sum, [, data]) => sum + data.cost, 0);
  const dailyTotal = Object.entries(incomeCategories).reduce(
    (sum, [key]) => sum + (dailyIncome[key] || incomeCategories[key].default),
    0
  );
  const weeklyTotal = dailyTotal * 7;
  const monthlyTotal = dailyTotal * 30;
  const daysNeeded = targetDays ? Math.ceil(remainingLoans / dailyTotal) : 0;

  const styles = {
    container: {
      width: '100%',
      backgroundColor: '#0a1a10',
      color: '#c8e6c0',
      fontFamily: '"DM Sans", sans-serif',
      padding: '20px',
      borderRadius: '12px',
      margin: '0 auto',
    },
    header: {
      fontSize: '28px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#5ec850',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    tabContainer: {
      display: 'flex',
      gap: '8px',
      marginBottom: '20px',
      borderBottom: '2px solid rgba(94, 200, 80, 0.3)',
    },
    tab: (active) => ({
      padding: '10px 16px',
      backgroundColor: 'transparent',
      color: active ? '#5ec850' : '#5a7a50',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: active ? 'bold' : 'normal',
      borderBottom: active ? '3px solid #5ec850' : 'none',
      transition: 'all 0.2s',
    }),
    card: {
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '12px',
      border: '1px solid rgba(94, 200, 80, 0.2)',
    },
    input: {
      backgroundColor: 'rgba(12, 28, 14, 0.5)',
      color: '#c8e6c0',
      border: '1px solid rgba(94, 200, 80, 0.3)',
      padding: '8px 12px',
      borderRadius: '6px',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '14px',
    },
    button: {
      backgroundColor: '#5ec850',
      color: '#0a1a10',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      transition: 'all 0.2s',
    },
    buttonSmall: {
      backgroundColor: 'rgba(94, 200, 80, 0.3)',
      color: '#5ec850',
      border: '1px solid #5ec850',
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      transition: 'all 0.2s',
    },
    row: {
      display: 'flex',
      gap: '10px',
      marginBottom: '10px',
      alignItems: 'center',
    },
    total: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#d4b030',
      marginTop: '16px',
      padding: '12px',
      backgroundColor: 'rgba(212, 176, 48, 0.1)',
      borderRadius: '6px',
      border: '1px solid rgba(212, 176, 48, 0.3)',
    },
    itemRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px',
      backgroundColor: 'rgba(94, 200, 80, 0.05)',
      borderRadius: '4px',
      marginBottom: '8px',
    },
    label: {
      fontSize: '12px',
      color: '#5a7a50',
      marginTop: '10px',
      marginBottom: '4px',
      display: 'block',
    },
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer',
      accentColor: '#5ec850',
    },
  };

  return (
    <div style={styles.container}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');`}
      </style>

      <div style={styles.header}>
        💰 Bell Calculator
      </div>

      <div style={styles.tabContainer}>
        <button
          style={styles.tab(activeTab === 'selling')}
          onClick={() => setActiveTab('selling')}
        >
          💵 Selling
        </button>
        <button
          style={styles.tab(activeTab === 'loan')}
          onClick={() => setActiveTab('loan')}
        >
          🏠 Loan Payoff
        </button>
        <button
          style={styles.tab(activeTab === 'income')}
          onClick={() => setActiveTab('income')}
        >
          📈 Income Planner
        </button>
      </div>

      {activeTab === 'selling' && (
        <div>
          <div style={styles.card}>
            <label style={styles.label}>Item Name</label>
            <input
              style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }}
              type="text"
              placeholder="e.g., Sea Bass, Fossil"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />

            <label style={styles.label}>Sell Price per Unit</label>
            <input
              style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }}
              type="number"
              placeholder="0"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
            />

            <label style={styles.label}>Quantity</label>
            <input
              style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }}
              type="number"
              placeholder="1"
              value={itemQty}
              onChange={(e) => setItemQty(e.target.value)}
            />

            <div style={{ ...styles.row, marginTop: '12px' }}>
              <button
                style={styles.button}
                onClick={() =>
                  addItem(itemName, itemPrice, itemQty)
                }
              >
                Add Item
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', color: '#5a7a50'}}>Quick Add:</span>
            <div style={styles.row}>
              <button
                style={styles.buttonSmall}
                onClick={() => addItem('Hot Item', Math.floor((itemPrice ? parseInt(itemPrice) : 0) * 2), 1)}
              >
                🔥 Hot Item (2x)
              </button>
              <button
                style={styles.buttonSmall}
                onClick={() => addItem('Flick Bugs', Math.floor((itemPrice ? parseInt(itemPrice) : 0) * 1.5), 1)}
              >
                🐛 Flick Bugs (1.5x)
              </button>
              <button
                style={styles.buttonSmall}
                onClick={() => addItem('CJ Fish', Math.floor((itemPrice ? parseInt(itemPrice) : 0) * 1.5), 1)}
              >
                🐠 CJ Fish (1.5x)
              </button>
            </div>
          </div>

          {items.length > 0 && (
            <div style={styles.card}>
              {items.map((item) => (
                <div key={item.id} style={styles.itemRow}>
                  <span>
                    <strong>{item.name}</strong> x{item.qty} @ {item.price.toLocaleString()}
                  </span>
                  <span style={{ color: '#d4b030', fontWeight: 'bold' }}>
                    {(item.price * item.qty).toLocaleString()}
                  </span>
                  <button
                    style={{ ...styles.buttonSmall, padding: '4px 8px' }}
                    onClick={() => removeItem(item.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                style={{ ...styles.buttonSmall, width: '100%', marginTop: '12px' }}
                onClick={clearAllItems}
              >
                Clear All
              </button>
            </div>
          )}

          <div style={styles.total}>
            Total Earnings: {sellingTotal.toLocaleString()} 🪙
          </div>
        </div>
      )}

      {activeTab === 'loan' && (
        <div>
          <div style={styles.card}>
            <label style={styles.label}>Days to Pay Off</label>
            <input
              style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }}
              type="number"
              placeholder="30"
              value={targetDays}
              onChange={(e) => setTargetDays(e.target.value)}
            />
          </div>

          <div style={styles.card}>
            <span style={{ fontSize: '12px', color: '#5a7a50'}}>Check off completed loans:</span>
            {Object.entries(loanData).map(([key, data]) => (
              <div key={key} style={{ ...styles.row, marginTop: '10px' }}>
                <input
                  style={styles.checkbox}
                  type="checkbox"
                  checked={loans[key] || false}
                  onChange={() => toggleLoan(key)}
                />
                <span style={{ flex: 1 }}>{data.name}</span>
                <span style={{ color: '#d4b030', fontWeight: 'bold' }}>
                  {data.cost.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div style={styles.total}>
            Remaining Debt: {remainingLoans.toLocaleString()} 🪙
          </div>

          {remainingLoans > 0 && dailyTotal > 0 && (
            <div style={styles.card}>
              <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                <strong>Daily Target:</strong> {(remainingLoans / parseInt(targetDays || 1)).toLocaleString()} 🪙/day
              </div>
              <div style={{ fontSize: '14px', color: '#5ec850' }}>
                Days to pay off at current rate: <strong>{daysNeeded}</strong> days
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'income' && (
        <div>
          <div style={styles.card}>
            <span style={{ fontSize: '12px', color: '#5a7a50'}}>Daily income sources (bells):</span>
            {Object.entries(incomeCategories).map(([key, data]) => (
              <div key={key} style={{ marginTop: '12px' }}>
                <label style={{ ...styles.label, marginTop: '0' }}>
                  {data.label}
                </label>
                <input
                  style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }}
                  type="number"
                  placeholder={data.default.toString()}
                  value={dailyIncome[key] || ''}
                  onChange={(e) => updateIncomeValue(key, e.target.value || data.default)}
                />
              </div>
            ))}
          </div>

          <div style={styles.card}>
            <div style={{ ...styles.total, marginTop: '0', backgroundColor: 'rgba(74, 172, 240, 0.1)', borderColor: 'rgba(74, 172, 240, 0.3)', color: '#4aacf0' }}>
              Daily: {dailyTotal.toLocaleString()} 🪙
            </div>
            <div style={{ ...styles.total, backgroundColor: 'rgba(74, 172, 240, 0.1)', borderColor: 'rgba(74, 172, 240, 0.3)', color: '#4aacf0' }}>
              Weekly: {weeklyTotal.toLocaleString()} 🪙
            </div>
            <div style={{ ...styles.total, backgroundColor: 'rgba(74, 172, 240, 0.1)', borderColor: 'rgba(74, 172, 240, 0.3)', color: '#4aacf0' }}>
              Monthly: {monthlyTotal.toLocaleString()} 🪙
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
