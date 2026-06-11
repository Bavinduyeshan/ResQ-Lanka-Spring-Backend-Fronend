import React, { useState } from 'react';
import {
  ArrowDownToLine, Undo, RefreshCcw, Layers, AlertTriangle,
  Activity, Clock, ChevronRight, Zap, FileText, History,
  TrendingUp, Users, MapPin, Bot, X, Send, Loader2
} from 'lucide-react';
import { Incident, ActionHistory, EmergencyReport } from '../types';

interface DsaVisualizerProps {
  reportsQueue: EmergencyReport[];   // PENDING incidents submitted by public users
  heapIncidents: Incident[];         // ACTIVE incidents in the priority queue
  actionStack: ActionHistory[];
  onRefreshAll: () => void;
  onDequeueReport: () => Promise<void>;   // Promotes PENDING → ACTIVE (Process Next)
  onExtractMaxHeap: () => Promise<void>;  // Dispatches top ACTIVE incident
  onTriggerUndo: () => Promise<void>;
}

// ─── AI Assistant Panel ────────────────────────────────────────────────────────
function AiAssistant({
                       heapIncidents,
                       reportsQueue,
                       actionStack,
                       onClose,
                     }: {
  heapIncidents: Incident[];
  reportsQueue: EmergencyReport[];
  actionStack: ActionHistory[];
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: "I have full visibility into your current operations. Ask me anything — incident priorities, queue analysis, undo recommendations, or what to act on next.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const contextSummary = `
You are an AI operations assistant for a disaster response management system in Sri Lanka.

Current state:
- Active incidents in priority queue (highest priority first): ${
      heapIncidents.length === 0
          ? 'None'
          : heapIncidents
              .map(
                  (i, idx) =>
                      `#${idx + 1} ${i.disasterType} in ${i.district} — severity ${i.severity}, ${i.affectedPeople} affected, score ${i.severity * i.affectedPeople}`
              )
              .join('; ')
  }
- Pending public reports awaiting review (${reportsQueue.length} reports): ${
      reportsQueue.length === 0
          ? 'Empty'
          : reportsQueue
              .map((r, idx) => `#${idx + 1} Report-${r.id}: ${r.disasterType} in ${r.district}, severity ${r.severity}`)
              .join('; ')
  }
- Action history (${actionStack.length} entries, most recent first): ${
      actionStack.length === 0
          ? 'None'
          : actionStack
              .slice(0, 5)
              .map((a) => `${a.actionType} by ${a.performedBy}${a.undone ? ' [UNDONE]' : ''}`)
              .join('; ')
  }

Rules:
- Public-reported incidents start as PENDING and sit in the incoming queue until a coordinator processes them.
- Processing a report changes its status from PENDING to ACTIVE and moves it into the priority queue.
- Admin/coordinator-created incidents are ACTIVE immediately and appear only in the priority queue.
- The priority queue is ordered by severity × affected_people (highest first).

Answer questions about the current operational state, priorities, and what coordinators should do next. Be concise and direct.
`.trim();

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { role: 'user' as const, text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);
    try {
      const apiMessages = updated.map((m) => ({ role: m.role, content: m.text }));
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: contextSummary,
          messages: apiMessages,
        }),
      });
      const data = await res.json();
      const reply =
          data?.content?.find((b: { type: string }) => b.type === 'text')?.text ??
          'No response received.';
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden max-h-[80vh]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-indigo-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Operations Assistant</p>
                <p className="text-[10px] text-slate-400">Aware of current incident state</p>
              </div>
            </div>
            <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                      className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user'
                              ? 'bg-violet-600 text-white rounded-br-sm'
                              : 'bg-slate-100 text-slate-700 rounded-bl-sm'
                      }`}
                  >
                    {msg.text}
                  </div>
                </div>
            ))}
            {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 px-4 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-2 text-slate-400 text-sm">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
                  </div>
                </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 flex gap-2">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about priorities, queue, or next steps…"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
            />
            <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
  );
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

// ─── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
    ACTIVE:  'bg-blue-100 text-blue-700 border-blue-200',
    RESOLVED:'bg-emerald-100 text-emerald-700 border-emerald-200',
    CLOSED:  'bg-slate-100 text-slate-500 border-slate-200',
  };
  return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-bold ${styles[status] ?? styles.CLOSED}`}>
      {status}
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
  const [showAI, setShowAI] = useState(false);

  const handleProcessNext = async () => {
    setIsProcessing(true);
    await onDequeueReport();   // backend: PENDING → ACTIVE, adds to heap
    setIsProcessing(false);
  };

  const wrap = (fn: () => Promise<void>) => async () => {
    setIsProcessing(true);
    await fn();
    setIsProcessing(false);
  };

  const tabs = [
    {
      key: 'heap' as const,
      label: 'Priority Queue',
      icon: Zap,
      count: heapIncidents.length,
      activeColor: 'text-indigo-700',
      dotColor: 'bg-indigo-500',
    },
    {
      key: 'queue' as const,
      label: 'Incoming Reports',
      icon: FileText,
      count: reportsQueue.length,
      activeColor: 'text-sky-700',
      dotColor: 'bg-sky-500',
    },
    {
      key: 'stack' as const,
      label: 'Action History',
      icon: History,
      count: actionStack.length,
      activeColor: 'text-amber-700',
      dotColor: 'bg-amber-500',
    },
  ];

  return (
      <div className="space-y-5">
        {showAI && (
            <AiAssistant
                heapIncidents={heapIncidents}
                reportsQueue={reportsQueue}
                actionStack={actionStack}
                onClose={() => setShowAI(false)}
            />
        )}

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
          <div className="flex items-center gap-2">
            <button
                onClick={() => setShowAI(true)}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            >
              <Bot className="w-3.5 h-3.5" /> Ask AI
            </button>
            <button
                onClick={onRefreshAll}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 bg-white text-slate-600 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
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
                <Icon className={`w-3.5 h-3.5 ${activeTab === key ? activeColor : ''}`} />
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
          TAB: PRIORITY QUEUE  (ACTIVE incidents only)
      ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'heap' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900">Active Incidents</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ACTIVE status only · ordered by severity × affected population
                    </p>
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
                      <p className="text-xs mt-1">Process incoming reports to populate this queue.</p>
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
                                    <StatusBadge status="ACTIVE" />
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

              {/* Info sidebar */}
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 flex flex-col gap-4">
                <h4 className="font-bold text-slate-800">How Prioritisation Works</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Only <strong className="text-slate-700">ACTIVE</strong> incidents appear here. Admin/coordinator-created incidents enter as ACTIVE immediately. Public-reported incidents start as PENDING and are promoted to ACTIVE when processed from Incoming Reports.
                </p>
                <div className="bg-white rounded-xl border border-slate-200 p-3.5 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Priority Score</p>
                  <p className="text-sm font-mono font-bold text-indigo-700">Severity × Affected</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-2 text-xs text-slate-500">
                  <p className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">Flow</p>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded font-bold text-[10px]">Public report</span>
                    <span className="text-slate-300">→</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded font-bold text-[10px]">PENDING queue</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded font-bold text-[10px]">Process Next</span>
                    <span className="text-slate-300">→</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-bold text-[10px]">ACTIVE here</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded font-bold text-[10px]">Admin/Coord</span>
                    <span className="text-slate-300">→</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-bold text-[10px]">ACTIVE here</span>
                  </div>
                </div>
                {heapIncidents.length > 0 && (
                    <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-3.5 space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Top Incident</p>
                      <p className="text-sm font-bold text-indigo-900">{heapIncidents[0].disasterType} — {heapIncidents[0].district}</p>
                      <p className="text-xs text-indigo-700">Score: <strong>{(heapIncidents[0].severity * heapIncidents[0].affectedPeople).toLocaleString()}</strong></p>
                    </div>
                )}
                <div className="mt-auto pt-4 border-t border-slate-200">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    <strong className="text-slate-600">Dispatch Top</strong> marks the highest-priority incident as resolved and removes it from the queue.
                  </p>
                </div>
              </div>
            </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
          TAB: INCOMING REPORTS  (PENDING public submissions only)
      ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'queue' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900">Incoming Public Reports</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      PENDING status only · submitted by public users · processed FIFO
                    </p>
                  </div>
                  <button
                      onClick={handleProcessNext}
                      disabled={isProcessing || reportsQueue.length === 0}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors shrink-0"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    {isProcessing ? 'Processing…' : 'Process Next'}
                  </button>
                </div>

                {reportsQueue.length === 0 ? (
                    <div className="py-20 text-center text-slate-400">
                      <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                      <p className="font-semibold text-sm">No pending public reports.</p>
                      <p className="text-xs mt-1">All reports have been reviewed and activated.</p>
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

                      {/* What Process Next does — inline hint */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl text-[11px] text-amber-700 font-medium">
                        <ArrowDownToLine className="w-3.5 h-3.5 shrink-0" />
                        Processing a report changes its status from <StatusBadge status="PENDING" /> to <StatusBadge status="ACTIVE" /> and adds it to the Priority Queue.
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
                                <StatusBadge status="PENDING" />
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

              {/* Info sidebar */}
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 flex flex-col gap-4">
                <h4 className="font-bold text-slate-800">About Incoming Reports</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  This queue contains <strong className="text-slate-700">public-submitted reports only</strong>. They arrive as <strong className="text-amber-700">PENDING</strong> and must be reviewed by a coordinator before entering the active response pipeline.
                </p>

                <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-2 text-xs">
                  <p className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">What happens on Process Next</p>
                  <ol className="space-y-1.5 text-slate-500 list-none">
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                      The first report in line is dequeued (FIFO).
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                      Its status changes from <strong className="text-amber-700">PENDING</strong> → <strong className="text-blue-700">ACTIVE</strong>.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                      It is inserted into the Priority Queue with its computed score.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                      It disappears from this list.
                    </li>
                  </ol>
                </div>

                <div className="bg-amber-50 rounded-xl border border-amber-100 p-3.5 text-xs text-amber-700 leading-relaxed">
                  <strong>Note:</strong> Incidents created directly by admins or coordinators are <strong>ACTIVE</strong> from the start and never appear here.
                </div>

                {reportsQueue.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Awaiting review</p>
                      <p className="text-2xl font-black text-sky-600">{reportsQueue.length}</p>
                    </div>
                )}
              </div>
            </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
          TAB: ACTION HISTORY
      ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'stack' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
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

              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 flex flex-col gap-4">
                <h4 className="font-bold text-slate-800">About the Action Log</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Every significant coordinator action is stored here — incident creation, shelter updates, resource assignments. Use Undo to reverse the most recent action if a mistake was made.
                </p>
                <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 space-y-2">
                  <p className="text-xs font-bold text-amber-800">Undo behaviour</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Only the most recent non-undone action can be reversed. Actions already marked Undone cannot be re-undone.
                  </p>
                </div>
                {actionStack.filter((a) => !a.undone).length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Undoable actions</p>
                      <p className="text-xl font-black text-amber-600">{actionStack.filter((a) => !a.undone).length}</p>
                    </div>
                )}
              </div>
            </div>
        )}
      </div>
  );
}