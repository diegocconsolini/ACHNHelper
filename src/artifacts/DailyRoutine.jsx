'use client';

import React, { useState, useEffect } from 'react';
import { AssetImg } from '../assetHelper';

const defaultTasks = [
  { id: 1, name: 'Hit rocks (6 rocks)', emoji: '🪨' },
  { id: 2, name: 'Shake trees (furniture + bells + wasps)', emoji: '🌳' },
  { id: 3, name: 'Find money spot & plant bell tree', emoji: '💰' },
  { id: 4, name: 'Dig up 4 fossils', emoji: '🦴' },
  { id: 5, name: 'Check Nook\'s Cranny items', emoji: '📦' },
  { id: 6, name: 'Check Able Sisters', emoji: '👕' },
  { id: 7, name: 'Talk to all villagers', emoji: '💬' },
  { id: 8, name: 'Check mail', emoji: '🎁' },
  { id: 9, name: 'Harvest fruit (if ready)', emoji: '🍑' },
  { id: 10, name: 'Check beach for shells/bottles', emoji: '🐚' },
  { id: 11, name: 'Pop balloons', emoji: '🎈' },
  { id: 12, name: 'Pull weeds', emoji: '🌿' },
  { id: 13, name: 'Check Dodo Airlines for visitors', emoji: '✈️' },
  { id: 14, name: 'Sell items at Nook\'s', emoji: '🏪' },
];

export default function DailyRoutine() {
  const [tasks, setTasks] = useState([]);
  const [customTaskInput, setCustomTaskInput] = useState('');
  const [notes, setNotes] = useState('');
  const [streak, setStreak] = useState(0);
  const [weeklyData, setWeeklyData] = useState({});
  const [lastCompletedDate, setLastCompletedDate] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await window.storage.get('acnh-daily-routine');
        if (stored) {
          const data = JSON.parse(stored.value);
          const storedDate = data.lastDate;

          // Auto-reset if new day
          if (storedDate !== today) {
            // Save completion status for yesterday
            if (storedDate && data.tasks) {
              const completed = data.tasks.filter(t => t.completed).length;
              setWeeklyData(prev => ({
                ...prev,
                [storedDate]: completed === data.tasks.length ? 'full' : completed > 0 ? 'partial' : 'missed'
              }));
            }
            // Reset tasks for new day
            setTasks(defaultTasks.map(t => ({ ...t, completed: false, custom: false })));
            setNotes('');
            setLastCompletedDate(storedDate);
          } else {
            // Same day, load existing state
            setTasks(data.tasks || defaultTasks.map(t => ({ ...t, completed: false, custom: false })));
            setNotes(data.notes || '');
            setStreak(data.streak || 0);
            setWeeklyData(data.weeklyData || {});
            setLastCompletedDate(data.lastDate);
          }
        } else {
          // First time setup
          setTasks(defaultTasks.map(t => ({ ...t, completed: false, custom: false })));
        }
      } catch (e) {
        setTasks(defaultTasks.map(t => ({ ...t, completed: false, custom: false })));
      }
    };
    loadData();
  }, []);

  // Save data to storage
  useEffect(() => {
    const saveData = async () => {
      const completed = tasks.filter(t => t.completed).length;
      let newStreak = streak;

      // Update streak
      if (completed === tasks.length && tasks.length > 0) {
        if (lastCompletedDate === getYesterdayDate()) {
          newStreak = streak + 1;
        } else if (lastCompletedDate !== today) {
          newStreak = 1;
        }
      } else {
        if (lastCompletedDate === today && completed !== tasks.length) {
          newStreak = 0;
        }
      }

      setStreak(newStreak);

      const data = {
        lastDate: today,
        tasks: tasks,
        notes: notes,
        streak: newStreak,
        weeklyData: weeklyData
      };

      try {
        await window.storage.set('acnh-daily-routine', JSON.stringify(data));
      } catch (e) {
        console.error('Error saving data:', e);
      }
    };

    if (tasks.length > 0) {
      saveData();
    }
  }, [tasks, notes, today]);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addCustomTask = () => {
    if (customTaskInput.trim()) {
      const newId = Math.max(...tasks.map(t => t.id), 0) + 1;
      setTasks([...tasks, {
        id: newId,
        name: customTaskInput,
        emoji: '✅',
        completed: false,
        custom: true
      }]);
      setCustomTaskInput('');
    }
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const getYesterdayDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  const getWeekDates = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const weekDates = getWeekDates();

  const styles = {
    container: {
      width: '100%',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#0a1a10',
      fontFamily: '"DM Sans", sans-serif',
      color: '#c8e6c0',
      minHeight: '100vh'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      borderBottom: `2px solid ${'#5ec850'}`,
      paddingBottom: '15px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      margin: 0
    },
    date: {
      fontSize: '14px',
      color: '#5a7a50',
      marginTop: '5px'
    },
    progressSection: {
      marginBottom: '20px',
      backgroundColor: 'rgba(12,28,14,0.95)',
      padding: '15px',
      borderRadius: '8px'
    },
    progressBar: {
      width: '100%',
      height: '24px',
      backgroundColor: 'rgba(12,28,14,0.95)',
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '10px'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#5ec850',
      width: `${progressPercent}%`,
      transition: 'width 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 'bold',
      color: '#000'
    },
    progressText: {
      fontSize: '13px',
      color: '#5a7a50'
    },
    streakBadge: {
      display: 'inline-block',
      backgroundColor: '#d4b030',
      color: '#000',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: 'bold',
      marginRight: '15px'
    },
    taskContainer: {
      backgroundColor: 'rgba(12,28,14,0.95)',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px'
    },
    taskList: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px'
    },
    taskItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '10px',
      backgroundColor: 'rgba(94,200,80,0.1)',
      borderRadius: '6px',
      cursor: 'pointer',      outline: 'none',

      transition: 'background-color 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s, transform 0.2s',
      border: '1px solid rgba(94,200,80,0.3)'
    },
    taskItemCompleted: {
      backgroundColor: 'rgba(94,200,80,0.25)',
      borderColor: '#5ec850'
    },
    checkbox: {
      width: '18px',
      height: '18px',
      marginRight: '10px',
      cursor: 'pointer',      outline: 'none',

      accentColor: '#5ec850'
    },
    taskText: {
      flex: 1,
      fontSize: '13px'
    },
    taskTextCompleted: {
      textDecoration: 'line-through',
      color: '#5a7a50'
    },
    removeBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#5a7a50',
      cursor: 'pointer',      outline: 'none',

      fontSize: '16px',
      marginLeft: '8px',
      padding: 0
    },
    addTaskSection: {
      display: 'flex',
      gap: '8px',
      marginTop: '12px'
    },
    addTaskInput: {
      flex: 1,
      padding: '10px',
      backgroundColor: 'rgba(12,28,14,0.95)',
      border: `1px solid ${'#5ec850'}`,
      borderRadius: '6px',
      color: '#c8e6c0',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '13px'
    },
    addTaskBtn: {
      padding: '10px 16px',
      backgroundColor: '#5ec850',
      border: 'none',
      color: '#000',
      borderRadius: '6px',
      cursor: 'pointer',      outline: 'none',

      fontWeight: 'bold',
      fontSize: '13px'
    },
    weeklySection: {
      backgroundColor: 'rgba(12,28,14,0.95)',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px'
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: 'bold',
      marginBottom: '12px',
      color: '#5ec850'
    },
    weeklyGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '8px'
    },
    dayCell: {
      textAlign: 'center',
      padding: '10px',
      backgroundColor: 'rgba(12,28,14,0.95)',
      borderRadius: '6px',
      fontSize: '11px'
    },
    dayDot: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      margin: '6px auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    dotFull: {
      backgroundColor: '#5ec850',
      color: '#000'
    },
    dotPartial: {
      backgroundColor: '#d4b030',
      color: '#000'
    },
    dotMissed: {
      backgroundColor: '#666',
      color: '#000'
    },
    notesSection: {
      backgroundColor: 'rgba(12,28,14,0.95)',
      borderRadius: '8px',
      padding: '15px'
    },
    notesTextarea: {
      width: '100%',
      minHeight: '100px',
      padding: '10px',
      backgroundColor: 'rgba(12,28,14,0.95)',
      border: `1px solid ${'#5ec850'}`,
      borderRadius: '6px',
      color: '#c8e6c0',
      fontFamily: '"DM Mono", monospace',
      fontSize: '13px',
      resize: 'vertical',
      boxSizing: 'border-box'
    }
  };

  const getDateStatus = (date) => {
    if (date === today) return null;
    return weeklyData[date] || 'missed';
  };

  const getDotStyle = (status) => {
    if (!status) return { backgroundColor: '#4aacf0', color: '#000' }; // Today
    if (status === 'full') return { backgroundColor: '#5ec850', color: '#000' };
    if (status === 'partial') return { backgroundColor: '#d4b030', color: '#000' };
    return { backgroundColor: '#666', color: '#000' };
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📋 Daily Routine</h1>
          <p style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div>
          <span style={styles.streakBadge}>🔥 {streak} day streak</span>
        </div>
      </div>

      <div style={styles.progressSection}>
        <div style={styles.progressBar}>
          <div style={styles.progressFill}>{Math.round(progressPercent)}%</div>
        </div>
        <p style={styles.progressText}>{completedCount} of {tasks.length} tasks completed</p>
      </div>

      <div style={styles.taskContainer}>
        <h3 style={styles.sectionTitle}>Tasks</h3>
        <div style={styles.taskList}>
          {tasks.map(task => (
            <div
              key={task.id}
              style={{
                ...styles.taskItem,
                ...(task.completed ? styles.taskItemCompleted : {})
              }}
              onClick={() => toggleTask(task.id)}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => {}}
                style={styles.checkbox}
              />
              <span style={{...styles.taskText, ...(task.completed ? styles.taskTextCompleted : {}), display: 'inline-flex', alignItems: 'center', gap: '6px'}}>
                {task.id === 1 ? <AssetImg category="tools" name="shovel" size={24} /> :
                 task.id === 4 ? <AssetImg category="fossils" name="amber" size={24} /> :
                 <span>{task.emoji}</span>}
                {task.name}
              </span>
              {task.custom && (
                <button
                  style={styles.removeBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTask(task.id);
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={styles.addTaskSection}>
          <input
            type="text"
            placeholder="Add custom task..."
            value={customTaskInput}
            onChange={(e) => setCustomTaskInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomTask()}
            style={styles.addTaskInput}
          />
          <button onClick={addCustomTask} style={styles.addTaskBtn}>Add</button>
        </div>
      </div>

      <div style={styles.weeklySection}>
        <h3 style={styles.sectionTitle}>Weekly Overview</h3>
        <div style={styles.weeklyGrid}>
          {weekDates.map(date => {
            const status = getDateStatus(date);
            const isToday = date === today;
            return (
              <div key={date} style={styles.dayCell}>
                <div style={{...styles.dayDot, ...getDotStyle(status)}} title={isToday ? 'Today' : ''}>
                  {isToday ? '⭐' : (status === 'full' ? '✓' : status === 'partial' ? '◐' : '○')}
                </div>
                <div>{formatDate(date)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={styles.notesSection}>
        <h3 style={styles.sectionTitle}>Quick Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes for today..."
          style={styles.notesTextarea}
        />
      </div>
    </div>
  );
}
