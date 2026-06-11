import React, { useState } from 'react';
import {
  ArrowDownToLine, Undo, RefreshCcw, Layers, AlertTriangle,
  Activity, Clock, ChevronRight, Zap, FileText, History,
  TrendingUp, Users, MapPin
} from 'lucide-react';
import { Incident, ActionHistory, EmergencyReport } from '../types';

interface DsaVisualizerProps {
  reportsQueue: EmergencyReport[];
  heapIncidents: Incident[];
  actionStack: ActionHistory[];
  onRefreshAll: () => void;
  onDequeueReport: () => Promise<void>;
  onExtractMaxHeap: () => Promise<void>;
  onTriggerUndo: () => Promise<void>;
}

// ─── Severity pill ─────────────────────────────────────────────────────────────
function SeverityBadge({ value }: { value: number }) {
  const color =
    value >= 8 ? 'bg-red-100 text-red-700 border-red-200'
    : value >= 5 ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-emerald-100 text-emerald-700 border-emerald-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-bold ${color}`}>
      S{value}
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function DsaVisualizer({
  reportsQueue,
  heapIncidents,
  actionStack,
  onRefreshAll,
  onDequeueReport,
  onExtractMaxHeap,
  onTriggerUndo,
}: DsaVisualizerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'heap' | 'queue' | 'stack'>('heap');

  const [simType, setSimType] = useState('Landslide');
  const [simDistrict, setSimDistrict] = useState('Kalutara');
  const [simSeverity, setSimSeverity] = useState(8);
  const [simAffected, setSimAffected] = useState(900);
  const [simReporter, setSimReporter] = useState('');

  const handleCreateSimulationReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const res = await fetch(`${BASE_URL}/reports/emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disasterType: simType,
          district: simDistrict,
          severity: simSeverity,
          affectedPeople: simAffected,
          reporterName: simReporter,
          reporterPhone: '0714455883',
          description: `Field report submitted from ${simDistrict}. Severity level ${simSeverity}, approximately ${simAffected} civilians affected.`,
        }),
      });
      if (res.ok) {
        onRefreshAll();
        setSimReporter('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const wrap =
    (fn: () => Promise<void>) => async () => {
      setIsProcessing(true);
      await fn();
      setIsProcessing(false);
    };

  // ── Tab meta ────────────────────────────────────────────────────────────────
  const tabs = [
    {
      key: 'heap' as const,
      label: 'Priority Queue',
      icon: Zap,
      count: heapIncidents.length,
      activeColor: 'border-indigo-600 text-indigo-700',
      dotColor: 'bg-indigo-500',
    },
    {
      key: 'queue' as const,
      label: 'Incoming Reports',
      icon: FileText,
      count: reportsQueue.length,
      activeColor: 'border-sky-600 text-sky-700',
      dotColor: 'bg-sky-500',
    },
    {
      key: 'stack' as const,
      label: 'Action History',
      icon: History,
      count: actionStack.length,
      activeColor: 'border-amber-600 text-amber-700',
      dotColor: 'bg-amber-500',
    },
  ];

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white px-6 py-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">Operations Engine</h2>
            <p className="text-xs text-slate-400 mt-0.5">Incident dispatch · Report intake · Action log</p>
          </div>
        </div>
        <button
          onClick={onRefreshAll}
          className="px-4 py-2 border border-slate-200 hover:bg-slate-50 bg-white text-slate-600 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <RefreshCcw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {tabs.map(({ key, label, icon: Icon, count, activeColor, dotColor }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === key
                ? 'bg-white shadow-sm text-slate-800'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${activeTab === key ? activeColor.split(' ')[1] : ''}`} />
            <span className="hidden sm:inline">{label}</span>
            {count > 0 && (
              <span className={`w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center ${activeTab === key ? dotColor : 'bg-slate-300'}`}>
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB: PRIORITY QUEUE
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'heap' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900">Active Incidents</h3>
              <p className="text-xs text-slate-400 mt-0.5">Ordered by severity × affected population</p>
            </div>
            <button
              onClick={wrap(onExtractMaxHeap)}
              disabled={isProcessing || heapIncidents.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors shrink-0"
            >
              <Layers className="w-3.5 h-3.5" /> Dispatch Top
            </button>
          </div>

          {heapIncidents.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-semibold text-sm">No active incidents.</p>
              <p className="text-xs mt-1">All clear at this time.</p>
            </div>
          ) : (
            <div className="p-5 space-y-3">
              {/* Flow strip */}
              <div className="flex items-center gap-1.5 flex-wrap px-3 py-2.5 bg-indigo-50 rounded-xl border border-indigo-100">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 mr-1">Order</span>
                {heapIncidents.map((incident, idx) => (
                  <React.Fragment key={incident.id}>
                    {idx > 0 && <ChevronRight className="w-3 h-3 text-indigo-300 shrink-0" />}
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        idx === 0 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {incident.disasterType}
                    </span>
                  </React.Fragment>
                ))}
              </div>

              {/* Cards */}
              {heapIncidents.map((inc, index) => {
                const score = inc.severity * inc.affectedPeople;
                const isTop = index === 0;
                return (
                  <div
                    key={inc.id}
                    className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      isTop ? 'bg-indigo-50/60 border-indigo-200' : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${isTop ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">{inc.disasterType}</span>
                          <SeverityBadge value={inc.severity} />
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400">
                          <MapPin className="w-3 h-3" />{inc.district}
                          {inc.location && <span>· {inc.location}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 pl-10 sm:pl-0">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span className="font-semibold text-slate-800">{inc.affectedPeople.toLocaleString()}</span>
                      </div>
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold ${isTop ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        <TrendingUp className="w-3 h-3" />
                        {score.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB: INCOMING REPORTS
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900">Pending Reports</h3>
                <p className="text-xs text-slate-400 mt-0.5">Processed in order of arrival (FIFO)</p>
              </div>
              <button
                onClick={wrap(onDequeueReport)}
                disabled={isProcessing || reportsQueue.length === 0}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors shrink-0"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" /> Process Next
              </button>
            </div>

            {reportsQueue.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-semibold text-sm">No pending reports.</p>
                <p className="text-xs mt-1">Submit a report using the form.</p>
              </div>
            ) : (
              <div className="p-5 space-y-3">
                {/* Queue strip */}
                <div className="flex items-center gap-1.5 overflow-x-auto p-3 bg-sky-50 rounded-xl border border-sky-100">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400 shrink-0 mr-1">Next →</span>
                  {reportsQueue.map((rep, idx) => (
                    <span
                      key={rep.id}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 ${
                        idx === 0 ? 'bg-sky-600 text-white' : 'bg-white text-sky-700 border border-sky-200'
                      }`}
                    >
                      {rep.disasterType}
                    </span>
                  ))}
                </div>

                {reportsQueue.map((rep, index) => (
                  <div
                    key={rep.id}
                    className="p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors flex flex-col sm:flex-row justify-between items-start gap-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${index === 0 ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {index === 0 ? 'Up Next' : `#${index + 1}`}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{rep.disasterType} — {rep.district}</span>
                        <SeverityBadge value={rep.severity} />
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{rep.description}</p>
                    </div>
                    <div className="text-xs text-slate-400 font-mono text-right shrink-0 space-y-0.5">
                      <p>Reporter: <strong className="text-slate-600">{rep.reporterName}</strong></p>
                      <p>Score: <strong className="text-slate-700">{rep.severity * rep.affectedPeople}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit form */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-4">
            <div>
              <h4 className="font-bold text-slate-800">Submit a Report</h4>
              <p className="text-xs text-slate-500 mt-0.5">Add a new emergency to the queue.</p>
            </div>

            <form onSubmit={handleCreateSimulationReport} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Disaster Type</label>
                <select
                  value={simType}
                  onChange={(e) => setSimType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-medium focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 transition"
                >
                  {['Flood', 'Landslide', 'Cyclone', 'Fire'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">District</label>
                <select
                  value={simDistrict}
                  onChange={(e) => setSimDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-medium focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 transition"
                >
                  {['Kalutara', 'Matara', 'Jaffna', 'Anuradhapura'].map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Severity</label>
                  <input
                    type="number" min="1" max="10"
                    value={simSeverity}
                    onChange={(e) => setSimSeverity(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Affected</label>
                  <input
                    type="number" min="1"
                    value={simAffected}
                    onChange={(e) => setSimAffected(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Reporter Name</label>
                <input
                  type="text" required
                  placeholder="e.g. Sunil"
                  value={simReporter}
                  onChange={(e) => setSimReporter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing || !simReporter}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                {isProcessing ? 'Submitting…' : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB: ACTION HISTORY
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'stack' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900">Action History</h3>
              <p className="text-xs text-slate-400 mt-0.5">Most recent action is at the top</p>
            </div>
            <button
              onClick={wrap(onTriggerUndo)}
              disabled={isProcessing || actionStack.length === 0}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors shrink-0"
            >
              <Undo className="w-3.5 h-3.5" /> Undo Last
            </button>
          </div>

          {actionStack.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-semibold text-sm">No actions recorded.</p>
            </div>
          ) : (
            <div className="p-5 space-y-2 max-h-[480px] overflow-y-auto">
              {actionStack.map((act, index) => (
                <div
                  key={act.id}
                  className={`p-4 rounded-xl border flex justify-between items-start gap-4 transition-all ${
                    index === 0 ? 'bg-amber-50/60 border-amber-200' : act.undone ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${index === 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {index === 0 ? 'Latest' : `−${index}`}
                      </span>
                      <span className="font-bold text-slate-800 text-xs uppercase tracking-tight">{act.actionType}</span>
                      {act.undone && (
                        <span className="text-[9px] font-bold bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded uppercase">Undone</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{act.description}</p>
                  </div>
                  <div className="text-right text-[11px] text-slate-400 font-mono flex flex-col items-end gap-0.5 shrink-0">
                    <span className="text-slate-600 font-semibold">{act.performedBy}</span>
                    <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}