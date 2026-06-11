import React, { useState } from 'react';
import {
  Truck, ShieldPlus, Check, X, UserCheck, Search,
  Ambulance, Ship, Droplets, Package, Utensils,
  Flame, Wind, Stethoscope, Link2, Unlink2,
  AlertTriangle, CheckCircle, Wrench, XCircle, Edit2, Trash2,
  LayoutGrid, GitBranch
} from 'lucide-react';
import { Resource, Incident, ResourceType, ResourceStatus } from '../types';

interface ResourceManagementProps {
  resources: Resource[];
  incidents: Incident[];
  onAddResource: (data: any) => Promise<void>;
  onAssignResource: (resourceId: number, incidentId: number | null) => Promise<void>;
  onUpdateResource: (id: number, data: any) => Promise<void>;
  onDeleteResource: (id: number) => Promise<void>;
}

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matara', 'Galle',
  'Jaffna', 'Trincomalee', 'Batticaloa', 'Kurunegala', 'Anuradhapura',
  'Ratnapura', 'Badulla',
];

const RESOURCE_TYPES: ResourceType[] = [
  'AMBULANCE', 'FIRE_TRUCK', 'RESCUE_BOAT', 'MEDICAL_TEAM',
  'HELICOPTER', 'FOOD_SUPPLY', 'WATER_SUPPLY', 'SHELTER_KIT',
];

const TYPE_META: Record<ResourceType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  AMBULANCE:    { label: 'Ambulance',    icon: Ambulance,    color: 'text-red-600',    bg: 'bg-red-50'    },
  FIRE_TRUCK:   { label: 'Fire Truck',   icon: Flame,        color: 'text-orange-600', bg: 'bg-orange-50' },
  RESCUE_BOAT:  { label: 'Rescue Boat',  icon: Ship,         color: 'text-blue-600',   bg: 'bg-blue-50'   },
  MEDICAL_TEAM: { label: 'Medical Team', icon: Stethoscope,  color: 'text-pink-600',   bg: 'bg-pink-50'   },
  HELICOPTER:   { label: 'Helicopter',   icon: Wind,         color: 'text-violet-600', bg: 'bg-violet-50' },
  FOOD_SUPPLY:  { label: 'Food Supply',  icon: Utensils,     color: 'text-amber-600',  bg: 'bg-amber-50'  },
  WATER_SUPPLY: { label: 'Water Supply', icon: Droplets,     color: 'text-cyan-600',   bg: 'bg-cyan-50'   },
  SHELTER_KIT:  { label: 'Shelter Kit',  icon: Package,      color: 'text-teal-600',   bg: 'bg-teal-50'   },
};

const STATUS_META: Record<ResourceStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  AVAILABLE:      { label: 'Available',     color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle },
  ASSIGNED:       { label: 'Assigned',      color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200',    icon: Link2       },
  MAINTENANCE:    { label: 'Maintenance',   color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   icon: Wrench      },
  OUT_OF_SERVICE: { label: 'Out of Service',color: 'text-slate-600',   bg: 'bg-slate-100',  border: 'border-slate-200',   icon: XCircle     },
};

const EMPTY_FORM = {
  name: '',
  type: 'AMBULANCE' as ResourceType,
  status: 'AVAILABLE' as ResourceStatus,
  district: 'Colombo',
  quantity: 1,
  notes: '',
};

export default function ResourceManagement({
                                             resources,
                                             incidents,
                                             onAddResource,
                                             onAssignResource,
                                             onUpdateResource,
                                             onDeleteResource,
                                           }: ResourceManagementProps) {
  const [tab, setTab] = useState<'all' | 'allocated'>('all');

  // Filters (all tab)
  const [search, setSearch]               = useState('');
  const [filterType, setFilterType]       = useState('');
  const [filterStatus, setFilterStatus]   = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');

  // Add / edit modal
  const [modalOpen, setModalOpen]         = useState(false);
  const [editingId, setEditingId]         = useState<number | null>(null);
  const [form, setForm]                   = useState({ ...EMPTY_FORM });
  const [saving, setSaving]               = useState(false);

  // Inline allocation
  const [allocatingId, setAllocatingId]   = useState<number | null>(null);
  const [selectedIncId, setSelectedIncId] = useState('');

  // ── helpers ────────────────────────────────
  const patch = (p: Partial<typeof EMPTY_FORM>) => setForm(prev => ({ ...prev, ...p }));

  const openCreate = () => { setEditingId(null); setForm({ ...EMPTY_FORM }); setModalOpen(true); };
  const openEdit   = (r: Resource) => {
    setEditingId(r.id);
    setForm({ name: r.name, type: r.type, status: r.status, district: r.district, quantity: r.quantity, notes: r.notes ?? '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      editingId !== null ? await onUpdateResource(editingId, form) : await onAddResource(form);
      setModalOpen(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this resource from the registry?')) return;
    await onDeleteResource(id);
  };

  const startAlloc = (r: Resource) => {
    setAllocatingId(r.id);
    setSelectedIncId(r.assignedIncidentId ? String(r.assignedIncidentId) : '');
  };

  const confirmAlloc = async (id: number) => {
    await onAssignResource(id, selectedIncId ? parseInt(selectedIncId, 10) : null);
    setAllocatingId(null);
  };

  const cycleStatus = async (r: Resource) => {
    const order: ResourceStatus[] = ['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'OUT_OF_SERVICE'];
    const next = order[(order.indexOf(r.status) + 1) % order.length];
    await onUpdateResource(r.id, { status: next });
  };

  // ── derived ────────────────────────────────
  const filteredAll = resources.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.name.toLowerCase().includes(q) || r.district.toLowerCase().includes(q);
    return matchSearch
        && (!filterType     || r.type     === filterType)
        && (!filterStatus   || r.status   === filterStatus)
        && (!filterDistrict || r.district === filterDistrict);
  });

  const allocated = resources.filter(r => r.assignedIncidentId != null);

  const availCount = resources.filter(r => r.status === 'AVAILABLE').length;
  const assignedCount = resources.filter(r => r.status === 'ASSIGNED').length;

  // ── card renderer ──────────────────────────
  const ResourceCard = ({ r }: { r: Resource }) => {
    const tMeta = TYPE_META[r.type] ?? TYPE_META.AMBULANCE;
    const sMeta = STATUS_META[r.status] ?? STATUS_META.AVAILABLE;
    const TypeIcon   = tMeta.icon;
    const StatusIcon = sMeta.icon;
    const assignedInc = incidents.find(i => i.id === r.assignedIncidentId);
    const isAlloc = allocatingId === r.id;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">

          {/* Card header */}
          <div className="p-5 pb-3 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Status badge — clickable to cycle */}
                <button
                    onClick={() => cycleStatus(r)}
                    title="Click to cycle status"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer transition-opacity hover:opacity-70 ${sMeta.color} ${sMeta.bg} ${sMeta.border}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {sMeta.label}
                </button>
                {/* Type badge */}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${tMeta.color} ${tMeta.bg}`}>
                <TypeIcon className="w-3 h-3" />
                  {tMeta.label}
              </span>
              </div>
              <h3 className="font-bold text-slate-800 text-base mt-2 leading-snug">{r.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">📍 {r.district}</p>
            </div>

            {/* Quantity pill + actions */}
            <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-[11px] font-bold bg-slate-100 text-slate-600 rounded-lg px-2.5 py-1">
              ×{r.quantity}
            </span>
              <div className="flex gap-1">
                <button
                    onClick={() => openEdit(r)}
                    className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
                    title="Edit resource"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors cursor-pointer"
                    title="Delete resource"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          {r.notes && (
              <div className="px-5 pb-3">
                <p className="text-[11px] text-slate-400 italic">"{r.notes}"</p>
              </div>
          )}

          {/* Assignment zone */}
          <div className="px-5 pb-4 mt-auto">
            {assignedInc ? (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-800">
                  <p className="font-bold mb-0.5 flex items-center gap-1"><Link2 className="w-3 h-3" /> Assigned to Incident</p>
                  <p className="text-blue-700">[ID: {assignedInc.id}] {assignedInc.disasterType} · {assignedInc.district}</p>
                </div>
            ) : (
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-[11px] text-emerald-700">
                  <p className="font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> On standby — not assigned</p>
                </div>
            )}

            {/* Allocate controls */}
            <div className="mt-3">
              {isAlloc ? (
                  <div className="flex items-center gap-2">
                    <select
                        value={selectedIncId}
                        onChange={e => setSelectedIncId(e.target.value)}
                        className="flex-1 px-2.5 py-2 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl focus:outline-none focus:border-blue-300"
                    >
                      <option value="">Unassign (standby)</option>
                      {incidents.filter(i => i.status === 'ACTIVE' || i.status === 'PENDING').map(i => (
                          <option key={i.id} value={i.id}>[{i.id}] {i.disasterType} · {i.district}</option>
                      ))}
                    </select>
                    <button
                        onClick={() => confirmAlloc(r.id)}
                        className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => setAllocatingId(null)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
              ) : (
                  <button
                      onClick={() => startAlloc(r)}
                      className="w-full py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-600 hover:text-blue-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Allocate Incident
                  </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-2 border-t border-slate-50">
            <span className="text-[10px] text-slate-300 font-mono">R-ID: DMC-{r.id}</span>
          </div>
        </div>
    );
  };

  // ── render ────────────────────────────────
  return (
      <div className="space-y-6">

        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Operational Resources Desk</h2>
            <p className="text-sm text-slate-500 mt-1">Register logistics, assign resources to incidents, and track deployment status.</p>
          </div>
          <button
              onClick={openCreate}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <ShieldPlus className="w-4 h-4" /> Add Resource
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Resources',  value: resources.length,   sub: 'registered',       color: 'text-blue-600'    },
            { label: 'Available',        value: availCount,          sub: 'ready to deploy',   color: 'text-emerald-600' },
            { label: 'Assigned',         value: assignedCount,       sub: 'active incidents',  color: 'text-blue-500'    },
            { label: 'Allocations',      value: allocated.length,    sub: 'incident links',    color: 'text-violet-600'  },
          ].map(({ label, value, sub, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
                <p className={`text-2xl font-extrabold mt-1 ${color}`}>{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
              </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
          <button
              onClick={() => setTab('all')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  tab === 'all'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <LayoutGrid className="w-4 h-4" /> All Resources
          </button>
          <button
              onClick={() => setTab('allocated')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  tab === 'allocated'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <GitBranch className="w-4 h-4" /> Allocated to Incidents
            {allocated.length > 0 && (
                <span className="ml-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {allocated.length}
            </span>
            )}
          </button>
        </div>

        {/* ── TAB: All Resources ── */}
        {tab === 'all' && (
            <>
              {/* Filters */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                  <input
                      type="text"
                      placeholder="Search name or district…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-blue-300 transition-colors"
                  />
                </div>
                <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="">All Types</option>
                  {RESOURCE_TYPES.map(t => <option key={t} value={t}>{TYPE_META[t].label}</option>)}
                </select>
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
                <select
                    value={filterDistrict}
                    onChange={e => setFilterDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="">All Districts</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Cards */}
              {filteredAll.length === 0 ? (
                  <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 text-slate-400">
                    <Truck className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No resources match your filters.</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredAll.map(r => <ResourceCard key={r.id} r={r} />)}
                  </div>
              )}
            </>
        )}

        {/* ── TAB: Allocated to Incidents ── */}
        {tab === 'allocated' && (
            <>
              {allocated.length === 0 ? (
                  <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 text-slate-400">
                    <GitBranch className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No resources are currently allocated to any incident.</p>
                  </div>
              ) : (
                  <div className="space-y-4">
                    {/* Group by incident */}
                    {Array.from(new Set(allocated.map(r => r.assignedIncidentId))).map(incId => {
                      const inc = incidents.find(i => i.id === incId);
                      const incResources = allocated.filter(r => r.assignedIncidentId === incId);
                      return (
                          <div key={incId} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            {/* Incident header row */}
                            <div className="px-6 py-4 bg-blue-50 border-b border-blue-100 flex items-center justify-between gap-4">
                              <div>
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Incident</span>
                                <h4 className="font-bold text-blue-900 text-base mt-0.5">
                                  {inc ? `[ID: ${inc.id}] ${inc.disasterType} · ${inc.district}` : `Incident #${incId}`}
                                </h4>
                                {inc?.status && (
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
                                        inc.status === 'ACTIVE' ? 'bg-red-100 text-red-700' :
                                            inc.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                'bg-slate-100 text-slate-600'
                                    }`}>{inc.status}</span>
                                )}
                              </div>
                              <span className="text-sm font-bold text-blue-600 bg-white border border-blue-200 px-3 py-1.5 rounded-xl">
                        {incResources.length} resource{incResources.length !== 1 ? 's' : ''}
                      </span>
                            </div>

                            {/* Resources for this incident */}
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                              {incResources.map(r => {
                                const tMeta = TYPE_META[r.type] ?? TYPE_META.AMBULANCE;
                                const sMeta = STATUS_META[r.status] ?? STATUS_META.AVAILABLE;
                                const TypeIcon = tMeta.icon;
                                const isAlloc = allocatingId === r.id;
                                return (
                                    <div key={r.id} className="bg-slate-50 rounded-xl border border-slate-100 p-4 flex flex-col gap-3">
                                      <div className="flex items-start justify-between gap-2">
                                        <div>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${tMeta.color} ${tMeta.bg}`}>
                                  <TypeIcon className="w-3 h-3" />
                                  {tMeta.label}
                                </span>
                                          <p className="font-bold text-slate-800 text-sm mt-1.5">{r.name}</p>
                                          <p className="text-[11px] text-slate-400">📍 {r.district} · ×{r.quantity}</p>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                          <button
                                              onClick={() => openEdit(r)}
                                              className="p-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-500 border border-slate-200 transition-colors cursor-pointer"
                                              title="Edit"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>

                                      {r.notes && <p className="text-[10px] text-slate-400 italic">"{r.notes}"</p>}

                                      {/* Re-allocate / unassign controls */}
                                      {isAlloc ? (
                                          <div className="flex items-center gap-2">
                                            <select
                                                value={selectedIncId}
                                                onChange={e => setSelectedIncId(e.target.value)}
                                                className="flex-1 px-2 py-1.5 bg-white border border-slate-200 text-slate-800 text-xs rounded-lg focus:outline-none"
                                            >
                                              <option value="">Unassign (standby)</option>
                                              {incidents.filter(i => i.status === 'ACTIVE' || i.status === 'PENDING').map(i => (
                                                  <option key={i.id} value={i.id}>[{i.id}] {i.disasterType} · {i.district}</option>
                                              ))}
                                            </select>
                                            <button onClick={() => confirmAlloc(r.id)} className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer">
                                              <Check className="w-3 h-3" />
                                            </button>
                                            <button onClick={() => setAllocatingId(null)} className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg cursor-pointer">
                                              <X className="w-3 h-3" />
                                            </button>
                                          </div>
                                      ) : (
                                          <div className="flex gap-2">
                                            <button
                                                onClick={() => startAlloc(r)}
                                                className="flex-1 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-600 hover:text-blue-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
                                            >
                                              <UserCheck className="w-3 h-3" /> Reallocate
                                            </button>
                                            <button
                                                onClick={async () => { await onAssignResource(r.id, null); }}
                                                className="py-1.5 px-3 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                                                title="Unassign"
                                            >
                                              <Unlink2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                      )}

                                      <span className="text-[10px] text-slate-300 font-mono">R-ID: DMC-{r.id}</span>
                                    </div>
                                );
                              })}
                            </div>
                          </div>
                      );
                    })}
                  </div>
              )}
            </>
        )}

        {/* ── Add / Edit Modal ── */}
        {modalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">

                <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      {editingId !== null ? 'Edit Resource' : 'Register New Resource'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {editingId !== null ? `Modifying R-ID: DMC-${editingId}` : 'Add a new logistics unit to the registry'}
                    </p>
                  </div>
                  <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 cursor-pointer transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4 overflow-y-auto max-h-[70vh]">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Resource Name *</label>
                    <input
                        required
                        type="text"
                        placeholder="e.g. Galle Rescue Boat Alpha"
                        value={form.name}
                        onChange={e => patch({ name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:border-blue-300 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Type *</label>
                      <select
                          value={form.type}
                          onChange={e => patch({ type: e.target.value as ResourceType })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none cursor-pointer"
                      >
                        {RESOURCE_TYPES.map(t => <option key={t} value={t}>{TYPE_META[t].label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                      <select
                          value={form.status}
                          onChange={e => patch({ status: e.target.value as ResourceStatus })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none cursor-pointer"
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="OUT_OF_SERVICE">Out of Service</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">District *</label>
                      <select
                          value={form.district}
                          onChange={e => patch({ district: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:outline-none cursor-pointer"
                      >
                        {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Quantity *</label>
                      <input
                          required
                          type="number"
                          min={1}
                          value={form.quantity}
                          onChange={e => patch({ quantity: parseInt(e.target.value, 10) || 1 })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:border-blue-300 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Notes</label>
                    <textarea
                        rows={3}
                        placeholder="Dispatch protocols, special notes…"
                        value={form.notes}
                        onChange={e => patch({ notes: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:bg-white focus:border-blue-300 focus:outline-none transition-colors resize-none"
                    />
                  </div>

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
                      {saving ? 'Saving…' : editingId !== null ? 'Save Changes' : 'Register Resource'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}