'use client';

import React, { useState, useEffect } from 'react';
import { AssetImg } from '../assetHelper';

const KanbanCard = ({ project, getStatusColor, getPriorityColor, getDaysElapsed, moveProject, deleteProject }) => (
  <div style={{
    background: 'rgba(12,28,14,0.95)',
    border: `2px solid ${getStatusColor(project.status)}`,
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#5ec850', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {project.species} <AssetImg category="other" name={`red-${project.species.toLowerCase()} plant`} size={18} />
        </div>
        <div style={{ fontSize: '13px', color: '#d4b030', marginBottom: '6px' }}>
          Target: {project.color}
        </div>
        <div style={{ fontSize: '12px', color: '#5a7a50', marginBottom: '4px' }}>
          Parents: {project.parents || 'TBD'}
        </div>
        <div style={{ fontSize: '11px', color: '#5a7a50', marginBottom: '6px', fontFamily: '"DM Mono", monospace' }}>
          Days: {getDaysElapsed(project.startDate)}
        </div>
        {project.notes && (
          <div style={{ fontSize: '11px', color: '#5a7a50', fontStyle: 'italic', marginBottom: '4px' }}>
            "{project.notes}"
          </div>
        )}
      </div>
      <div style={{
        background: getPriorityColor(project.priority),
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 'bold',
        marginLeft: '8px'
      }}>
        {project.priority}
      </div>
    </div>
    <div style={{ display: 'flex', gap: '6px', marginTop: '10px', fontSize: '11px' }}>
      {project.status !== 'Planned' && (
        <button onClick={() => moveProject(project.id, 'Planned')} style={{
          background: 'transparent',
          border: '1px solid #4aacf0',
          color: '#4aacf0',
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: 'pointer',
          flex: 1
        }}>← Back</button>
      )}
      {project.status !== 'Complete' && (
        <button onClick={() => moveProject(project.id, project.status === 'Waiting' ? 'Complete' : 'In Progress')} style={{
          background: 'transparent',
          border: '1px solid #5ec850',
          color: '#5ec850',
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: 'pointer',
          flex: 1
        }}>
          {project.status === 'Waiting' ? '✓ Done' : 'Next →'}
        </button>
      )}
      <button onClick={() => deleteProject(project.id)} style={{
        background: 'transparent',
        border: '1px solid #ff6b6b',
        color: '#ff6b6b',
        padding: '4px 8px',
        borderRadius: '4px',
        cursor: 'pointer'
      }}>✕</button>
    </div>
  </div>
);

const KanbanColumn = ({ status, projects: columnProjects, getStatusColor, getPriorityColor, getDaysElapsed, moveProject, deleteProject }) => (
  <div style={{
    background: 'rgba(12,28,14,0.6)',
    border: `2px solid ${getStatusColor(status)}`,
    borderRadius: '8px',
    padding: '16px',
    minHeight: '500px',
    flex: 1
  }}>
    <div style={{
      fontSize: '14px',
      fontWeight: 'bold',
      color: getStatusColor(status),
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      {status}
      <span style={{
        background: getStatusColor(status),
        color: '#0a1a10',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {columnProjects.length}
      </span>
    </div>
    {columnProjects.map(project => (
      <KanbanCard
        key={project.id}
        project={project}
        getStatusColor={getStatusColor}
        getPriorityColor={getPriorityColor}
        getDaysElapsed={getDaysElapsed}
        moveProject={moveProject}
        deleteProject={deleteProject}
      />
    ))}
  </div>
);

const IslandFlowerMap = () => {
  const [projects, setProjects] = useState([]);
  const [wateringLog, setWateringLog] = useState([]);
  const [activeTab, setActiveTab] = useState('kanban');
  const [newProjectForm, setNewProjectForm] = useState({
    species: 'Rose',
    color: 'Blue',
    parents: '',
    notes: '',
    priority: 'Medium'
  });

  const FLOWER_SPECIES = [
    'Rose', 'Tulip', 'Pansy', 'Cosmos', 'Lily', 'Hyacinth', 'Windflower', 'Mum'
  ];

  const HYBRID_COLORS = {
    Rose: ['Red', 'White', 'Yellow', 'Orange', 'Pink', 'Purple', 'Blue', 'Black', 'Gold'],
    Tulip: ['Red', 'White', 'Yellow', 'Orange', 'Pink', 'Purple'],
    Pansy: ['Red', 'White', 'Yellow', 'Orange', 'Blue', 'Purple'],
    Cosmos: ['Red', 'White', 'Yellow', 'Orange', 'Pink', 'Black'],
    Lily: ['Red', 'White', 'Yellow', 'Orange', 'Pink', 'Black'],
    Hyacinth: ['Red', 'White', 'Blue', 'Purple', 'Pink'],
    Windflower: ['Red', 'White', 'Orange', 'Pink', 'Blue', 'Purple'],
    Mum: ['Red', 'White', 'Yellow', 'Orange', 'Pink', 'Purple', 'Green']
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const projectsResult = await window.storage.get('acnh_breeding_projects');
        const wateringResult = await window.storage.get('acnh_watering_log');
        if (projectsResult) setProjects(JSON.parse(projectsResult.value));
        if (wateringResult) setWateringLog(JSON.parse(wateringResult.value));
      } catch (e) {
        console.error('Error loading data:', e);
      }
    };
    loadData();
  }, []);

  const saveProjects = async (updatedProjects) => {
    setProjects(updatedProjects);
    await window.storage.set('acnh_breeding_projects', JSON.stringify(updatedProjects));
  };

  const saveWateringLog = async (updatedLog) => {
    setWateringLog(updatedLog);
    await window.storage.set('acnh_watering_log', JSON.stringify(updatedLog));
  };

  const addProject = () => {
    const today = new Date().toISOString().split('T')[0];
    const newProject = {
      id: Date.now(),
      ...newProjectForm,
      status: 'Planned',
      startDate: today,
      daysElapsed: 0
    };
    saveProjects([...projects, newProject]);
    setNewProjectForm({
      species: 'Rose',
      color: 'Blue',
      parents: '',
      notes: '',
      priority: 'Medium'
    });
  };

  const moveProject = (projectId, newStatus) => {
    const updated = projects.map(p =>
      p.id === projectId ? { ...p, status: newStatus } : p
    );
    saveProjects(updated);
  };

  const updateProject = (projectId, updates) => {
    const updated = projects.map(p =>
      p.id === projectId ? { ...p, ...updates } : p
    );
    saveProjects(updated);
  };

  const deleteProject = (projectId) => {
    saveProjects(projects.filter(p => p.id !== projectId));
  };

  const toggleWateringLog = (projectId, today) => {
    const logKey = `${projectId}_${today}`;
    const updated = wateringLog.includes(logKey)
      ? wateringLog.filter(k => k !== logKey)
      : [...wateringLog, logKey];
    saveWateringLog(updated);
  };

  const getDaysElapsed = (startDate) => {
    const start = new Date(startDate);
    const now = new Date();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  };

  const getPriorityColor = (priority) => {
    const colors = { High: '#ff6b6b', Medium: '#d4b030', Low: '#7e8d8f' };
    return colors[priority] || '#d4b030';
  };

  const getStatusColor = (status) => {
    const colors = {
      Planned: '#4aacf0',
      'In Progress': '#d4b030',
      Waiting: '#9b6ba8',
      Complete: '#5ec850'
    };
    return colors[status] || '#5ec850';
  };

  const today = new Date().toISOString().split('T')[0];
  const activeProjects = projects.filter(p => p.status !== 'Complete');
  const longestProject = activeProjects.length > 0
    ? activeProjects.reduce((max, p) => getDaysElapsed(p.startDate) > getDaysElapsed(max.startDate) ? p : max)
    : null;
  const successRate = projects.length > 0 ? ((projects.filter(p => p.status === 'Complete').length / projects.length) * 100).toFixed(1) : 0;
  const speciesBreakdown = FLOWER_SPECIES.map(species => ({
    species,
    count: projects.filter(p => p.species === species).length
  })).filter(s => s.count > 0);

  const statuses = ['Planned', 'In Progress', 'Waiting', 'Complete'];

  return (
    <div style={{
      background: '#0a1a10',
      color: '#c8e6c0',
      fontFamily: '"DM Sans", sans-serif',
      padding: '24px',
      minHeight: '100vh',
      width: '100%'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <div style={{
        fontSize: '28px',
        fontFamily: '"Playfair Display", serif',
        fontWeight: 'bold',
        color: '#5ec850',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <AssetImg category="other" name="red-windflower plant" size={28} /> Island Flower Map
      </div>
      <div style={{ fontSize: '13px', color: '#5a7a50', marginBottom: '20px' }}>
        Breeding Operations Tracker
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        borderBottom: '1px solid rgba(94,200,80,0.3)',
        paddingBottom: '12px'
      }}>
        {['kanban', 'watering', 'summary'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? '#5ec850' : 'transparent',
              color: activeTab === tab ? '#0a1a10' : '#5a7a50',
              border: activeTab === tab ? 'none' : '1px solid rgba(94, 200, 80, 0.2)',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              transition: 'all 0.3s ease'
            }}
          >
            {tab === 'kanban' ? '📋 Kanban' : tab === 'watering' ? '💧 Watering' : '📊 Summary'}
          </button>
        ))}
      </div>

      {activeTab === 'kanban' && (
        <div style={{
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            background: 'rgba(12,28,14,0.95)',
            border: '1px solid rgba(212,176,48,0.3)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#d4b030', marginBottom: '12px' }}>
              ➕ New Breeding Project
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              <select
                value={newProjectForm.species}
                onChange={(e) => setNewProjectForm({ ...newProjectForm, species: e.target.value })}
                style={{
                  background: 'rgba(20,40,22,0.8)',
                  border: '1px solid #5ec850',
                  color: '#5ec850',
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                {FLOWER_SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={newProjectForm.color}
                onChange={(e) => setNewProjectForm({ ...newProjectForm, color: e.target.value })}
                style={{
                  background: 'rgba(20,40,22,0.8)',
                  border: '1px solid #5ec850',
                  color: '#5ec850',
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                {HYBRID_COLORS[newProjectForm.species].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                type="text"
                placeholder="Parent flowers"
                value={newProjectForm.parents}
                onChange={(e) => setNewProjectForm({ ...newProjectForm, parents: e.target.value })}
                style={{
                  background: 'rgba(20,40,22,0.8)',
                  border: '1px solid #5ec850',
                  color: '#5ec850',
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
              <input
                type="text"
                placeholder="Notes"
                value={newProjectForm.notes}
                onChange={(e) => setNewProjectForm({ ...newProjectForm, notes: e.target.value })}
                style={{
                  background: 'rgba(20,40,22,0.8)',
                  border: '1px solid #5ec850',
                  color: '#5ec850',
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
              <select
                value={newProjectForm.priority}
                onChange={(e) => setNewProjectForm({ ...newProjectForm, priority: e.target.value })}
                style={{
                  background: 'rgba(20,40,22,0.8)',
                  border: '1px solid #5ec850',
                  color: '#5ec850',
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <button
                onClick={addProject}
                style={{
                  background: '#5ec850',
                  color: '#0a1a10',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Create Project
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '16px',
            minHeight: '600px',
            animation: 'fadeIn 0.3s ease'
          }}>
            {statuses.map(status => (
              <KanbanColumn
                key={status}
                status={status}
                projects={projects.filter(p => p.status === status)}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
                getDaysElapsed={getDaysElapsed}
                moveProject={moveProject}
                deleteProject={deleteProject}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'watering' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{
            background: 'rgba(12,28,14,0.95)',
            border: '1px solid rgba(74,172,240,0.3)',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#4aacf0', marginBottom: '12px' }}>
              💧 Daily Watering Checklist — {today}
            </div>
            {activeProjects.length === 0 ? (
              <div style={{ color: '#5a7a50', fontSize: '12px' }}>No active projects yet. Create one to start watering!</div>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {activeProjects.map(project => {
                  const isWatered = wateringLog.includes(`${project.id}_${today}`);
                  return (
                    <div
                      key={project.id}
                      onClick={() => toggleWateringLog(project.id, today)}
                      style={{
                        background: isWatered ? 'rgba(94,200,80,0.2)' : 'rgba(20,40,22,0.8)',
                        border: `1px solid ${isWatered ? '#5ec850' : '#7e8d8f'}`,
                        borderRadius: '6px',
                        padding: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        background: isWatered ? '#5ec850' : 'rgba(94,200,80,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isWatered ? '#0a1a10' : '#5ec850',
                        fontWeight: 'bold'
                      }}>
                        {isWatered ? '✓' : ''}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#5ec850' }}>
                          {project.species} - {project.color}
                        </div>
                        <div style={{ fontSize: '11px', color: '#5a7a50' }}>
                          Status: {project.status}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'summary' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{
              background: 'rgba(12,28,14,0.95)',
              border: '1px solid rgba(94,200,80,0.3)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{ fontSize: '11px', color: '#5a7a50', marginBottom: '8px' }}>Active Projects</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#5ec850', fontFamily: '"DM Mono", monospace' }}>
                {activeProjects.length}
              </div>
            </div>
            <div style={{
              background: 'rgba(12,28,14,0.95)',
              border: '1px solid rgba(212,176,48,0.3)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{ fontSize: '11px', color: '#5a7a50', marginBottom: '8px' }}>Success Rate</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#d4b030', fontFamily: '"DM Mono", monospace' }}>
                {successRate}%
              </div>
            </div>
            <div style={{
              background: 'rgba(12,28,14,0.95)',
              border: '1px solid rgba(74,172,240,0.3)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{ fontSize: '11px', color: '#5a7a50', marginBottom: '8px' }}>Total Projects</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4aacf0', fontFamily: '"DM Mono", monospace' }}>
                {projects.length}
              </div>
            </div>
          </div>

          {longestProject && (
            <div style={{
              background: 'rgba(12,28,14,0.95)',
              border: '1px solid rgba(155,107,168,0.3)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#9b6ba8', marginBottom: '8px' }}>
                ⏱️ Longest Running Project
              </div>
              <div style={{ fontSize: '12px', color: '#d4b030' }}>
                {longestProject.species} - {longestProject.color}
              </div>
              <div style={{ fontSize: '11px', color: '#5a7a50' }}>
                {getDaysElapsed(longestProject.startDate)} days
              </div>
            </div>
          )}

          {speciesBreakdown.length > 0 && (
            <div style={{
              background: 'rgba(12,28,14,0.95)',
              border: '1px solid rgba(160,160,160,0.3)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#d4b030', marginBottom: '12px' }}>
                📊 Projects by Species
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {speciesBreakdown.map(({ species, count }) => (
                  <div key={species} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#5a7a50' }}>
                    <span>{species}</span>
                    <span style={{ color: '#5ec850', fontWeight: 'bold' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default IslandFlowerMap;
