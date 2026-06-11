import React, { useState } from 'react';
import {
  Home, Plus, Search, Trash2, Edit2, X,
  ChevronUp, ChevronDown, Users, CheckCircle, AlertTriangle, XCircle, Wrench
} from 'lucide-react';
import { Shelter, ShelterStatus } from '../types';

interface SheltersManagerProps {
  shelters: Shelter[];
  onAddShelter: (data: any) => Promise<void>;
  onUpdateShelter: (id: number, data: any) => Promise<void>;
  onDeleteShelter: (id: number) => Promise<void>;
}

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Trincomalee', 'Batticaloa', 'Ampara',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle',
];

const STATUS_META: Record<ShelterStatus, { label: string; color: string; bg: string; border: string; Icon: React.ElementType }> = {
  OPEN:              { label: 'Open',              color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', Icon: CheckCircle },
  FULL:              { label: 'Full',              color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200',     Icon: AlertTriangle },
  UNDER_MAINTENANCE: { label: 'Under Maintenance', color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   Icon: Wrench },
  CLOSED:            { label: 'Closed',            color: 'text-slate-600',   bg: 'bg-slate-100',  border: 'border-slate-200',   Icon: XCircle },
};

const EMPTY_FORM = {
  shelterName: '',
  district: 'Colombo',
  address: '',
  capacity: 500,
  occupancy: 0,
  status: 'OPEN' as ShelterStatus,
  contactPerson: '',
  contactPhone: '',
};

export default function SheltersManager({ shelters, onAddShelter, onUpdateShelter, onDeleteShelter }: SheltersManagerProps) {
  const [searchQuery, setSearchQuery]           = useState('');
  const [filterDistrict, setFilterDistrict]     = useState('');
  const [filterStatus, setFilterStatus]         = useState('');

  // Modal state
  const [modalOpen, setModalOpen]               = useState(false);
  const [editingId, setEditingId]               = useState<number | null>(null);
  const [form, setForm]                         = useState({ ...EMPTY_FORM });
  const [saving, setSaving]                     = useState(false);

  // Inline occupancy edit per card
  const [occupancyEdit, setOccupancyEdit]       = useState<Record<number, string>>({});

  // ── helpers ────────────────────────────────────────────────
  const patchForm = (patch: Partial<typeof EMPTY_FORM>) =>
    setForm(prev => ({ ...prev, ...patch }));

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (s: Shelter) => {
    setEditingId(s.id);
    setForm({
      shelterName:   s.shelterName,
      district:      s.district,
      address:       s.address ?? '',
      capacity:      s.capacity,
      occupancy:     s.occupancy,
      status:        s.status,
      contactPerson: s.contactPerson ?? '',
      contactPhone:  s.contactPhone ?? '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId !== null) {
        await onUpdateShelter(editingId, form);
      } else {
        await onAddShelter(form);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this shelter from the registry?')) return;
    await onDeleteShelter(id);
  };

  // Quick status cycle
  const cycleStatus = async (s: Shelter) => {
    const order: ShelterStatus[] = ['OPEN', 'FULL', 'UNDER_MAINTENANCE', 'CLOSED'];
    const next = order[(order.indexOf(s.status) + 1) % order.length];
    await onUpdateShelter(s.id, { status: next });
  };

  // Inline occupancy commit
  const commitOccupancy = async (s: Shelter) => {
    const raw = occupancyEdit[s.id];
    if (raw === undefined) return;
    const val = Math.max(0, Math.min(s.capacity, parseInt(raw, 10) || 0));
    await onUpdateShelter(s.id, { occupancy: val });
    setOccupancyEdit(prev => { const n = { ...prev }; delete n[s.id]; return n; });
  };

  const nudgeOccupancy = async (s: Shelter, delta: number) => {
    const val = Math.max(0, Math.min(s.capacity, s.occupancy + delta));
    await onUpdateShelter(s.id, { occupancy: val });
  };

  // ── derived ────────────────────────────────────────────────
  const filtered = shelters.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || s.shelterName.toLowerCase().includes(q) ||
      s.district.toLowerCase().includes(q) || (s.address ?? '').toLowerCase().includes(q);
    const matchDistrict = !filterDistrict || s.district === filterDistrict;
    const matchStatus   = !filterStatus   || s.status   === filterStatus;
    return matchSearch && matchDistrict && matchStatus;
  });

  const totalCap  = shelters.reduce((a, s) => a + s.capacity, 0);
  const totalOcc  = shelters.reduce((a, s) => a + s.occupancy, 0);
  const openCount = shelters.filter(s => s.status === 'OPEN').length;
  const fullCount = shelters.filter(s => s.status === 'FULL').length;

  // ── render ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Relief Shelter Registry</h2>
          <p className="text-sm text-slate-500 mt-1">Track capacity, update occupancy, and manage shelter status.</p>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Register Shelter
        </button>
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Shelters',  value: shelters.length,               sub: 'registered',       color: 'text-blue-600'    },
          { label: 'Open',            value: openCount,                      sub: 'accepting intake',  color: 'text-emerald-600' },
          { label: 'At Capacity',     value: fullCount,                      sub: 'no vacancies',      color: 'text-red-600'     },
          { label: 'Occupancy Rate',  value: totalCap ? `${Math.round(totalOcc/totalCap*100)}%` : '—', sub: `${totalOcc.toLocaleString()} / ${totalCap.toLocaleString()}`, color: 'text-amber-600' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-extrabold mt-1 ${color}`}>{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search name, district, address…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-300 transition-colors"
          />
        </div>
        <select
          value={filterDistrict}
          onChange={e => setFilterDistrict(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none cursor-pointer"
        >
          <option value="">All Districts</option>
          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="FULL">Full</option>
          <option value="UNDER_MAINTENANCE">Under Maintenance</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* ── Cards grid ── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 text-slate-400">
          <Home className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No shelters match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(s => {
            const pct = s.capacity > 0 ? Math.min(100, Math.round((s.occupancy / s.capacity) * 100)) : 0;
            const meta = STATUS_META[s.status];
            const StatusIcon = meta.Icon;
            const isEditing = s.id in occupancyEdit;
            const barColor = pct >= 95 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-500' : 'bg-emerald-500';

            return (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">

                {/* Card header */}
                <div className="p-5 pb-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => cycleStatus(s)}
                      title="Click to cycle status"
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer transition-opacity hover:opacity-70 ${meta.color} ${meta.bg} ${meta.border}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {meta.label}
                    </button>
                    <h3 className="font-bold text-slate-800 text-base mt-2 leading-snug">{s.shelterName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">📍 {s.district}{s.address ? ` · ${s.address}` : ''}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(s)}
                      className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
                      title="Edit shelter"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors cursor-pointer"
                      title="Delete shelter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Occupancy bar */}
                <div className="px-5 pb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span className="font-semibold flex items-center gap-1"><Users className="w-3 h-3" /> Occupancy</span>
                    <span className="font-bold">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`h-2 rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>{s.occupancy.toLocaleString()} displaced</span>
                    <span>{(s.capacity - s.occupancy).toLocaleString()} available</span>
                  </div>
                </div>

                {/* Occupancy controls */}
                <div className="px-5 pb-4 mt-auto">
                  <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-2 border border-slate-100">
                    <button
                      onClick={() => nudgeOccupancy(s, -10)}
                      disabled={s.occupancy === 0 || s.status === 'CLOSED'}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
                      title="Remove 10"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {isEditing ? (
                      <input
                        type="number"
                        min={0}
                        max={s.capacity}
                        value={occupancyEdit[s.id]}
                        onChange={e => setOccupancyEdit(prev => ({ ...prev, [s.id]: e.target.value }))}
                        onBlur={() => commitOccupancy(s)}
                        onKeyDown={e => { if (e.key === 'Enter') commitOccupancy(s); if (e.key === 'Escape') setOccupancyEdit(prev => { const n = {...prev}; delete n[s.id]; return n; }); }}
                        autoFocus
                        className="flex-1 text-center text-sm font-bold text-slate-700 bg-white border border-blue-300 rounded-lg py-1 px-2 focus:outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => setOccupancyEdit(prev => ({ ...prev, [s.id]: String(s.occupancy) }))}
                        className="flex-1 text-center text-sm font-bold text-slate-700 py-1 hover:bg-white hover:border-slate-200 rounded-lg border border-transparent transition-all cursor-pointer"
                        title="Click to type exact number"
                      >
                        {s.occupancy.toLocaleString()} <span className="text-slate-400 font-normal text-xs">/ {s.capacity.toLocaleString()}</span>
                      </button>
                    )}

                    <button
                      onClick={() => nudgeOccupancy(s, 10)}
                      disabled={s.occupancy >= s.capacity || s.status === 'CLOSED'}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
                      title="Add 10"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center mt-1">Click number to type · ↑↓ to adjust by 10</p>
                </div>

                {/* Contact footer */}
                {s.contactPerson && (
                  <div className="px-5 py-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                    <span>👤 {s.contactPerson}</span>
                    {s.contactPhone && <span>📞 {s.contactPhone}</span>}
                  </div>
                )}
                <div className="px-5 py-2 border-t border-slate-50">
                  <span className="text-[10px] text-slate-300 font-mono">S-ID: DMC-S{s.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {editingId !== null ? 'Edit Shelter Details' : 'Register New Shelter'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editingId !== null ? `Modifying S-ID: DMC-S${editingId}` : 'Add a new relief camp to the registry'}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4 overflow-y-auto max-h-[70vh]">

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Shelter Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Kandy Central Relief Camp"
                  value={form.shelterName}
                  onChange={e => patchForm({ shelterName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:border-blue-300 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">District *</label>
                  <select
                    value={form.district}
                    onChange={e => patchForm({ district: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={e => patchForm({ status: e.target.value as ShelterStatus })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="OPEN">Open</option>
                    <option value="FULL">Full</option>
                    <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Address</label>
                <input
                  type="text"
                  placeholder="Street, town, locality…"
                  value={form.address}
                  onChange={e => patchForm({ address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:border-blue-300 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Max Capacity *</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={form.capacity}
                    onChange={e => patchForm({ capacity: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:border-blue-300 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Current Occupancy</label>
                  <input
                    type="number"
                    min={0}
                    max={form.capacity}
                    value={form.occupancy}
                    onChange={e => patchForm({ occupancy: Math.min(form.capacity, parseInt(e.target.value, 10) || 0) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:border-blue-300 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Mr. Perera"
                    value={form.contactPerson}
                    onChange={e => patchForm({ contactPerson: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:border-blue-300 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    placeholder="077xxxxxxx"
                    value={form.contactPhone}
                    onChange={e => patchForm({ contactPhone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:border-blue-300 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  {saving ? 'Saving…' : editingId !== null ? 'Save Changes' : 'Register Shelter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}