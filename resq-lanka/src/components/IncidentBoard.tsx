import React, { useState } from 'react';
import { Search, Plus, Filter, Edit, Trash2, CheckCircle, Eye, AlertTriangle, X } from 'lucide-react';
import { Incident, IncidentStatus } from '../types';

interface IncidentBoardProps {
  incidents: Incident[];
  onAddIncident: (data: any) => Promise<void>;
  onUpdateIncident: (id: number, data: any) => Promise<void>;
  onDeleteIncident: (id: number) => Promise<void>;
}

export default function IncidentBoard({ incidents, onAddIncident, onUpdateIncident, onDeleteIncident }: IncidentBoardProps) {
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);

  // Fields for adding/editing
  const [disasterType, setDisasterType] = useState('Flood');
  const [district, setDistrict] = useState('Colombo');
  const [severity, setSeverity] = useState(7);
  const [affectedPeople, setAffectedPeople] = useState(1500);
  const [status, setStatus] = useState<IncidentStatus>('ACTIVE');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matara', 'Galle', 
    'Jaffna', 'Trincomalee', 'Batticaloa', 'Kurunegala', 'Anuradhapura', 
    'Ratnapura', 'Badulla'
  ];

  const disasterTypes = ['Flood', 'Landslide', 'Cyclone', 'Drought', 'Fire', 'Tsunami', 'Heavy Rain'];

  // Handle opening form for Create
  const openCreateForm = () => {
    setEditingIncident(null);
    setDisasterType('Flood');
    setDistrict('Colombo');
    setSeverity(7);
    setAffectedPeople(1500);
    setStatus('ACTIVE');
    setDescription('');
    setLocation('');
    setIsFormOpen(true);
  };

  // Handle opening form for Edit
  const openEditForm = (inc: Incident) => {
    setEditingIncident(inc);
    setDisasterType(inc.disasterType);
    setDistrict(inc.district);
    setSeverity(inc.severity);
    setAffectedPeople(inc.affectedPeople);
    setStatus(inc.status);
    setDescription(inc.description);
    setLocation(inc.location);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      disasterType,
      district,
      severity,
      affectedPeople,
      status,
      description,
      location
    };

    if (editingIncident) {
      await onUpdateIncident(editingIncident.id, payload);
    } else {
      await onAddIncident(payload);
    }
    setIsFormOpen(false);
  };

  const handleQuickResolve = async (inc: Incident) => {
    await onUpdateIncident(inc.id, { status: 'RESOLVED' });
  };

  // Derived filtered incidents
  const filteredIncidents = incidents.filter(i => {
    const matchesSearch = i.disasterType.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          i.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = filterDistrict ? i.district.toLowerCase() === filterDistrict.toLowerCase() : true;
    const matchesSeverity = filterSeverity ? i.severity >= parseInt(filterSeverity, 10) : true;
    const matchesStatus = filterStatus ? i.status === filterStatus : true;
    return matchesSearch && matchesDistrict && matchesSeverity && matchesStatus;
  });

  return (
    <div className="space-y-6" id="incident-board-view">
      {/* Search and Header Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800">Crisis Incident Registry</h2>
          <p className="text-sm text-slate-500 mt-1">Create, update, search, and allocate priority triage metrics.</p>
        </div>
        <button
          onClick={openCreateForm}
          id="btn-trigger-new-incident"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm cursor-pointer transition-all shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Declare Crisis Alert
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-4" id="incident-filter-panel">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search incident/details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white"
          />
        </div>

        <div>
          <select
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white cursor-pointer"
          >
            <option value="">All Sri Lanka Districts</option>
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white cursor-pointer"
          >
            <option value="">Severity: Any</option>
            <option value="9">CRITICAL Severity (9+)</option>
            <option value="7">HIGH Severity (7+)</option>
            <option value="5">MEDIUM Severity (5+)</option>
            <option value="1">LOW Severity (1+)</option>
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white cursor-pointer"
          >
            <option value="">Status: All States</option>
            <option value="ACTIVE">ACTIVE Alerts</option>
            <option value="PENDING">PENDING Alerts</option>
            <option value="RESOLVED">RESOLVED Cases</option>
            <option value="CLOSED">CLOSED Archive</option>
          </select>
        </div>
      </div>

      {/* Grid of Incidents */}
      {filteredIncidents.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 text-slate-400">
          <p className="text-base font-medium">No active incident declarations match your current search context.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="incidents-grid-list">
          {filteredIncidents.map(inc => {
            const calculatedPriority = inc.severity * inc.affectedPeople;
            
            // Setup style variables
            let severityColor = 'bg-slate-50 text-slate-700 border-slate-200';
            if (inc.severity >= 9) severityColor = 'bg-red-50 text-red-700 border-red-200';
            else if (inc.severity >= 7) severityColor = 'bg-amber-50 text-amber-700 border-amber-200';
            else if (inc.severity >= 4) severityColor = 'bg-yellow-50 text-yellow-700 border-yellow-200';

            let statusBadge = 'bg-slate-100 text-slate-600';
            if (inc.status === 'ACTIVE') statusBadge = 'bg-red-50 text-red-600 font-bold';
            else if (inc.status === 'PENDING') statusBadge = 'bg-amber-50 text-amber-600';
            else if (inc.status === 'RESOLVED') statusBadge = 'bg-emerald-50 text-emerald-600';

            return (
              <div 
                key={inc.id}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${severityColor}`}>
                        Severity {inc.severity}/10
                      </span>
                      <h3 className="font-bold text-slate-800 text-lg mt-2 font-mono">{inc.disasterType} &mdash; {inc.district}</h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Location: {inc.location}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase ${statusBadge}`}>
                      {inc.status}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 mb-6 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 line-clamp-3">
                    {inc.description}
                  </p>

                  {/* Priority analytics */}
                  <div className="grid grid-cols-2 gap-4 mb-6 border-b border-slate-50 pb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Affected Population</span>
                      <p className="text-base font-extrabold text-slate-700">{inc.affectedPeople.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Calculated Priority Score</span>
                      <p className="text-base font-extrabold text-blue-600">{calculatedPriority.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-medium text-slate-400">ID: DMC-{inc.id}</span>
                  <div className="flex gap-2 shrink-0">
                    {inc.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleQuickResolve(inc)}
                        title="Quick Mark Resolved"
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => openEditForm(inc)}
                      title="Edit details"
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteIncident(inc.id)}
                      title="Delete Entry"
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Intake / Update Drawer Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 border border-slate-100 shadow-2xl relative">
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg border border-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold text-slate-800 mb-6">
              {editingIncident ? `Modify Crisis Incident [DMC-${editingIncident.id}]` : 'Declare Actionable Crisis Alert'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Disaster Type Category</label>
                <select
                  value={disasterType}
                  onChange={(e) => setDisasterType(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm"
                >
                  {disasterTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm"
                  >
                    {districts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Specific Area / Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Town Square"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Severity Scale (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={severity}
                    onChange={(e) => setSeverity(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Affected People Count</label>
                  <input
                    type="number"
                    min="1"
                    value={affectedPeople}
                    onChange={(e) => setAffectedPeople(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm"
                  />
                </div>
              </div>

              {editingIncident && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Fulfillment Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as IncidentStatus)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm"
                  >
                    <option value="ACTIVE">ACTIVE (Awaiting Command)</option>
                    <option value="PENDING">PENDING (In Progress)</option>
                    <option value="RESOLVED">RESOLVED (Action Complete)</option>
                    <option value="CLOSED">CLOSED (Archived)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description Brief</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize crisis factors, environmental dynamics, urgent medical requirements..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm resize-none"
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold cursor-pointer transition-colors"
                >
                  {editingIncident ? 'Save Changes' : 'Declare Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
