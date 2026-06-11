// import React, { useState } from 'react';
// import { ArrowDownToLine, Undo, RefreshCcw, Layers, Sparkles, AlertCircle, HeartCrack, HelpCircle, Code } from 'lucide-react';
// import { Incident, ActionHistory, EmergencyReport } from '../types';
//
// interface DsaVisualizerProps {
//   reportsQueue: EmergencyReport[];
//   heapIncidents: Incident[];
//   actionStack: ActionHistory[];
//   onRefreshAll: () => void;
//   onDequeueReport: () => Promise<void>;
//   onExtractMaxHeap: () => Promise<void>;
//   onTriggerUndo: () => Promise<void>;
// }
//
// export default function DsaVisualizer({
//   reportsQueue,
//   heapIncidents,
//   actionStack,
//   onRefreshAll,
//   onDequeueReport,
//   onExtractMaxHeap,
//   onTriggerUndo
// }: DsaVisualizerProps) {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [activeTab, setActiveTab] = useState<'heap' | 'queue' | 'stack'>('heap');
//
//   const [simType, setSimType] = useState('Landslide');
//   const [simDistrict, setSimDistrict] = useState('Kalutara');
//   const [simSeverity, setSimSeverity] = useState(8);
//   const [simAffected, setSimAffected] = useState(900);
//   const [simReporter, setSimReporter] = useState('Sangeeth');
//
//   const handleCreateSimulationReport = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsProcessing(true);
//     try {
//       const res = await fetch('/api/reports/emergency', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           disasterType: simType,
//           district: simDistrict,
//           severity: simSeverity,
//           affectedPeople: simAffected,
//           reporterName: simReporter,
//           reporterPhone: '0714455883',
//           description: `Simulated quick report for evaluating system FIFO ordering. Severity score ${simSeverity * simAffected}.`
//         })
//       });
//       if (res.ok) {
//         onRefreshAll();
//         // Reset defaults
//         setSimReporter('');
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setIsProcessing(false);
//     }
//   };
//
//   const handleDequeue = async () => {
//     setIsProcessing(true);
//     await onDequeueReport();
//     setIsProcessing(false);
//   };
//
//   const handleExtractHeap = async () => {
//     setIsProcessing(true);
//     await onExtractMaxHeap();
//     setIsProcessing(false);
//   };
//
//   const handleUndo = async () => {
//     setIsProcessing(true);
//     await onTriggerUndo();
//     setIsProcessing(false);
//   };
//
//   return (
//     <div className="space-y-6" id="dsa-algorithms-workspace">
//       {/* Header and Sync controls */}
//       <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
//         <div>
//           <h2 className="text-xl font-bold font-sans text-slate-800 flex items-center gap-2">
//             <Code className="text-blue-500 w-5.5 h-5.5" /> Coursework Algorithms Engine
//           </h2>
//           <p className="text-sm text-slate-500 mt-1">Interactive playground visualizing Heap calculations, FIFO enqueues, and LIFO rolls.</p>
//         </div>
//         <button
//           onClick={onRefreshAll}
//           className="px-4 py-2 border border-slate-200 hover:bg-slate-50 bg-white text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer"
//           id="btn-sync-heaps"
//         >
//           <RefreshCcw className="w-3.5 h-3.5" /> Recalculate States
//         </button>
//       </div>
//
//       {/* Segmented control tabs */}
//       <div className="flex border-b border-slate-200">
//         <button
//           onClick={() => setActiveTab('heap')}
//           className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === 'heap' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
//         >
//           Max Heap Tree (Priority Queue)
//         </button>
//         <button
//           onClick={() => setActiveTab('queue')}
//           className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === 'queue' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
//         >
//           Linked List FIFO (Citizen Queue)
//         </button>
//         <button
//           onClick={() => setActiveTab('stack')}
//           className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === 'stack' ? 'border-amber-600 text-amber-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
//         >
//           LIFO Stack Undo (Action Records)
//         </button>
//       </div>
//
//       {/* CONTENT TABS */}
//       {activeTab === 'heap' && (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="heap-tab-content">
//           <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
//             <div className="flex justify-between items-start border-b border-slate-50 pb-4">
//               <div>
//                 <h3 className="font-bold text-slate-800 text-lg">Max Heap Priority State</h3>
//                 <p className="text-xs text-slate-400 mt-0.5">Critical disasters ordered dynamically: Severity &times; Affected People</p>
//               </div>
//               <button
//                 onClick={handleExtractHeap}
//                 disabled={isProcessing || heapIncidents.length === 0}
//                 className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
//                 id="btn-extract-max"
//               >
//                 <Layers className="w-3.5 h-3.5" /> Extract Max Threat (Dispatch Relief)
//               </button>
//             </div>
//
//             {heapIncidents.length === 0 ? (
//               <div className="py-16 text-center text-slate-400">
//                 <p className="font-medium">All active alerts resolved! Max heap is pristine and empty.</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {/* Visual Binary Tree Representation like Nodes List */}
//                 <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
//                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Heap Tree Node Sequence representation</p>
//                   <div className="flex flex-wrap items-center gap-2">
//                     {heapIncidents.map((incident, idx) => (
//                       <React.Fragment key={incident.id}>
//                         {idx > 0 && <span className="text-slate-300 font-mono text-xs">&rarr;</span>}
//                         <div className={`px-3 py-2 rounded-lg border text-xs font-mono flex items-center gap-1.5 ${idx === 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold shadow-xs' : 'bg-white border-slate-200 text-slate-600'}`}>
//                           <span className="bg-slate-100 text-slate-500 rounded-sm px-1 text-[9px] font-bold">[{idx}]</span>
//                           {incident.disasterType} ({incident.severity*incident.affectedPeople})
//                         </div>
//                       </React.Fragment>
//                     ))}
//                   </div>
//                 </div>
//
//                 {/* Priority list displaying core formula equations */}
//                 <div className="space-y-2">
//                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Indexed Heap Order Breakdown</p>
//                   {heapIncidents.map((inc, index) => {
//                     const mathVal = inc.severity * inc.affectedPeople;
//                     return (
//                       <div
//                         key={inc.id}
//                         className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 transition-all ${index === 0 ? 'bg-indigo-50/50 border-indigo-100 font-medium' : 'bg-white border-slate-100'}`}
//                       >
//                         <div className="flex items-center gap-3">
//                           <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono flex items-center justify-center shrink-0">
//                             {index + 1}
//                           </span>
//                           <div>
//                             <h4 className="font-bold text-slate-800 text-sm">{inc.disasterType} in {inc.district}</h4>
//                             <p className="text-xs text-slate-400">Location: {inc.location}</p>
//                           </div>
//                         </div>
//
//                         <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
//                           <span>Severity: <strong className="text-slate-800">{inc.severity}</strong></span>
//                           <span>&times;</span>
//                           <span>Affected: <strong className="text-slate-800">{inc.affectedPeople.toLocaleString()}</strong></span>
//                           <span>=</span>
//                           <span className={`px-2 py-0.5 rounded font-bold ${index === 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'}`}>
//                             Priority {mathVal.toLocaleString()}
//                           </span>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}
//           </div>
//
//           {/* Side Explainer */}
//           <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
//             <div className="space-y-4">
//               <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-1 rounded">Coursework DSA Pillar</span>
//               <h4 className="font-bold text-slate-800 text-base">Custom Binary Max Heap</h4>
//               <p className="text-xs text-slate-500 leading-relaxed">
//                 Rather than treating all incoming disasters sequentially, emergency resources require sorted prioritization.
//                 Our custom backend Java/TypeScript Max Heap automatically bubbling-up high severity reports inside O(log N) complexity.
//               </p>
//               <div className="p-3.5 bg-white rounded-xl border border-slate-100 text-xs text-slate-600">
//                 <span className="font-semibold block text-slate-800 mb-1">Heap Formula Logic:</span>
//                 <code>Priority Score = (Severity Rating [1-10]) &times; (Number of Affected Civil Populations)</code>
//               </div>
//             </div>
//             <div className="pt-6 border-t border-slate-200 mt-6 shrink-0">
//               <p className="text-[10px] text-slate-400 leading-normal">
//                 Executing <strong>Extract Max</strong> triggers triage resolution, moving the peak incident to intermediate state "RESOLVED" and re-balancing remaining branch nodes.
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//
//       {/* FIFO Citizen reports Queue */}
//       {activeTab === 'queue' && (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="queue-tab-content">
//           <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
//             <div className="flex justify-between items-start border-b border-slate-50 pb-4_">
//               <div>
//                 <h3 className="font-bold text-slate-800 text-lg">FIFO Standby Emergency reports</h3>
//                 <p className="text-xs text-slate-400">Linked List Lineage of incoming alerts from field observers</p>
//               </div>
//               <button
//                 onClick={handleDequeue}
//                 disabled={isProcessing || reportsQueue.length === 0}
//                 className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-40 transition-colors"
//                 id="btn-trigger-dequeue"
//               >
//                 <ArrowDownToLine className="w-3.5 h-3.5" /> Dequeue oldest &amp; Promote to Incident
//               </button>
//             </div>
//
//             {reportsQueue.length === 0 ? (
//               <div className="py-16 text-center text-slate-400">
//                 <p className="font-medium">No standby alerts in FIFO queue. Operations lines are nominal.</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {/* Visual Linear Queue representation */}
//                 <div className="flex items-center gap-1 p-3 bg-blue-50/50 rounded-xl overflow-x-auto border border-blue-50">
//                   <span className="text-[10px] uppercase font-extrabold text-blue-700 rotate-270 shrink-0 select-none mr-2">DEQUEUE END</span>
//                   {reportsQueue.map((rep, idx) => (
//                     <div
//                       key={rep.id}
//                       className={`px-3 py-2 rounded-lg border text-xs font-semibold text-slate-700 font-mono shrink-0 ${idx === 0 ? 'bg-blue-100 border-blue-300 text-blue-800 font-bold' : 'bg-white border-slate-200'}`}
//                     >
//                       [{rep.id}] {rep.disasterType}
//                     </div>
//                   ))}
//                   <span className="text-[10px] uppercase font-extrabold text-slate-400 rotate-90 shrink-0 select-none ml-2">ENQUEUE END</span>
//                 </div>
//
//                 {/* Queue list details */}
//                 <div className="space-y-3">
//                   {reportsQueue.map((rep, index) => (
//                     <div
//                       key={rep.id}
//                       className="p-4 rounded-xl border border-slate-100 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
//                     >
//                       <div className="space-y-1">
//                         <div className="flex items-center gap-2">
//                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${index === 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
//                             {index === 0 ? 'FIRST IN (NEXT UP)' : `Position ${index + 1}`}
//                           </span>
//                           <span className="font-bold text-slate-800 text-sm">DMC-REQ-{rep.id}</span>
//                         </div>
//                         <h4 className="font-bold text-slate-700 text-sm">{rep.disasterType} in {rep.district}</h4>
//                         <p className="text-xs text-slate-500 line-clamp-1">{rep.description}</p>
//                       </div>
//
//                       <div className="text-xs text-slate-400 text-right font-mono self-stretch md:self-auto flex md:flex-col justify-between items-center md:items-end border-t md:border-t-0 border-slate-50 pt-2 md:pt-0">
//                         <span>Reporter: <strong>{rep.reporterName}</strong></span>
//                         <span>Severity score: <strong>{rep.severity * rep.affectedPeople}</strong></span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//
//           {/* Quick Enqueue Simulator Tool */}
//           <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
//             <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-1 rounded">Simulation Node</span>
//             <h4 className="font-bold text-slate-800 text-base">Enqueue Emergency Report</h4>
//
//             <form onSubmit={handleCreateSimulationReport} className="space-y-3 pt-2">
//               <div>
//                 <label className="block text-[10px] font-bold uppercase text-slate-400">Disaster Category</label>
//                 <select
//                   value={simType}
//                   onChange={(e) => setSimType(e.target.value)}
//                   className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs"
//                 >
//                   <option value="Flood">Flood</option>
//                   <option value="Landslide">Landslide</option>
//                   <option value="Cyclone">Cyclone</option>
//                   <option value="Fire">Fire</option>
//                 </select>
//               </div>
//
//               <div>
//                 <label className="block text-[10px] font-bold uppercase text-slate-400">Settle district</label>
//                 <select
//                   value={simDistrict}
//                   onChange={(e) => setSimDistrict(e.target.value)}
//                   className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs"
//                 >
//                   <option value="Kalutara">Kalutara District</option>
//                   <option value="Matara">Matara District</option>
//                   <option value="Jaffna">Jaffna District</option>
//                   <option value="Anuradhapura">Anuradhapura District</option>
//                 </select>
//               </div>
//
//               <div className="grid grid-cols-2 gap-2">
//                 <div>
//                   <label className="block text-[10px] font-bold uppercase text-slate-400">Severity (1-10)</label>
//                   <input
//                     type="number"
//                     min="1"
//                     max="10"
//                     value={simSeverity}
//                     onChange={(e) => setSimSeverity(parseInt(e.target.value, 10) || 1)}
//                     className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-[10px] font-bold uppercase text-slate-400">Affected Civilians</label>
//                   <input
//                     type="number"
//                     min="1"
//                     value={simAffected}
//                     onChange={(e) => setSimAffected(parseInt(e.target.value, 10) || 1)}
//                     className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs"
//                   />
//                 </div>
//               </div>
//
//               <div>
//                 <label className="block text-[10px] font-bold uppercase text-slate-400">Reporter Handle</label>
//                 <input
//                   type="text"
//                   required
//                   placeholder="e.g. Sunil"
//                   value={simReporter}
//                   onChange={(e) => setSimReporter(e.target.value)}
//                   className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs"
//                 />
//               </div>
//
//               <button
//                 type="submit"
//                 disabled={isProcessing || !simReporter}
//                 className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg mt-2 cursor-pointer"
//               >
//                 Push to FIFO Enqueue End
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//
//       {/* LIFO ACTION STACK & ROLLBACK UNDO */}
//       {activeTab === 'stack' && (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="stack-tab-content">
//           <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
//             <div className="flex justify-between items-start border-b border-slate-50 pb-4">
//               <div>
//                 <h3 className="font-bold text-slate-800 text-lg font-mono">LIFO Action Tracker Stack</h3>
//                 <p className="text-xs text-slate-400 mt-0.5">Chronological trace registry preserving state rollback capabilities</p>
//               </div>
//               <button
//                 onClick={handleUndo}
//                 disabled={isProcessing || actionStack.length === 0}
//                 className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-40 transition-colors"
//                 id="btn-trigger-undo"
//               >
//                 <Undo className="w-3.5 h-3.5 animate-pulse" /> Revert Last Command (Pop LIFO)
//               </button>
//             </div>
//
//             {actionStack.length === 0 ? (
//               <div className="py-16 text-center text-slate-400">
//                 <p className="font-medium">Audit logs pristine. No tracked coordinator actions recorded yet.</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {/* Visual Stack Blocks */}
//                 <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-2">
//                   {actionStack.map((act, index) => (
//                     <div
//                       key={act.id}
//                       className={`p-4 rounded-xl border flex justify-between items-start gap-4 transition-all ${index === 0 ? 'bg-amber-50/50 border-amber-200 ring-2 ring-amber-100' : 'bg-white border-slate-100'}`}
//                     >
//                       <div className="space-y-1">
//                         <div className="flex items-center gap-2">
//                           <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${index === 0 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
//                             {index === 0 ? 'TOP OF STACK (LIFO)' : `Stack Level -${index}`}
//                           </span>
//                           <span className="font-bold text-slate-800 text-xs">Action ID: {act.id}</span>
//                         </div>
//                         <h4 className="font-extrabold text-slate-700 text-sm uppercase font-mono tracking-tight">{act.actionType}</h4>
//                         <p className="text-xs text-slate-500 leading-normal">{act.description}</p>
//                       </div>
//
//                       <div className="text-right text-[11px] text-slate-400 font-mono flex flex-col items-end gap-1 shrink-0">
//                         <span>By: {act.performedBy}</span>
//                         <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
//                         {act.undone && (
//                           <span className="text-red-500 font-bold uppercase text-[9px] bg-red-50 px-1 py-0.5 rounded">Reverted</span>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//
//           {/* DSA Stack Explainer */}
//           <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
//             <div className="space-y-4">
//               <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-1 rounded">Coursework DSA Pillar</span>
//               <h4 className="font-bold text-slate-800 text-base">Last-In First-Out (LIFO) stack</h4>
//               <p className="text-xs text-slate-500 leading-relaxed">
//                 Human error during critical operations is common.
//                 Our platform tracks all major modifications (Incident creations, shelter updates, and resource assignments) in an audit logs stack.
//               </p>
//               <div className="bg-white p-3.5 rounded-xl border border-slate-100 text-xs text-slate-600">
//                 <span className="font-semibold block text-slate-800 mb-1">State Undo Engine:</span>
//                 Each stack frame stores complete serialized clones of preceding databases snapshots, enabling total restoration when popped!
//               </div>
//             </div>
//             <div className="text-center bg-amber-50 rounded-xl p-4 border border-amber-100">
//               <p className="text-xs text-amber-900 leading-relaxed">
//                 Click <strong>Revert Last Command</strong> to pop the top of stack, call backend restore queries, and reverse the action.
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


//
// import React, { useState } from 'react';
// import { ArrowDownToLine, Undo, RefreshCcw, Layers, Sparkles, AlertCircle, HeartCrack, HelpCircle, Code } from 'lucide-react';
// import { Incident, ActionHistory, EmergencyReport } from '../types';
//
// interface DsaVisualizerProps {
//   reportsQueue: EmergencyReport[];
//   heapIncidents: Incident[];
//   actionStack: ActionHistory[];
//   onRefreshAll: () => void;
//   onDequeueReport: () => Promise<void>;
//   onExtractMaxHeap: () => Promise<void>;
//   onTriggerUndo: () => Promise<void>;
// }
//
// export default function DsaVisualizer({
//                                         reportsQueue,
//                                         heapIncidents,
//                                         actionStack,
//                                         onRefreshAll,
//                                         onDequeueReport,
//                                         onExtractMaxHeap,
//                                         onTriggerUndo
//                                       }: DsaVisualizerProps) {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [activeTab, setActiveTab] = useState<'heap' | 'queue' | 'stack'>('heap');
//
//   const [simType, setSimType] = useState('Landslide');
//   const [simDistrict, setSimDistrict] = useState('Kalutara');
//   const [simSeverity, setSimSeverity] = useState(8);
//   const [simAffected, setSimAffected] = useState(900);
//   const [simReporter, setSimReporter] = useState('Sangeeth');
//
//   const handleCreateSimulationReport = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsProcessing(true);
//     try {
//       const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
//       const res = await fetch(`${BASE_URL}/reports/emergency`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           disasterType: simType,
//           district: simDistrict,
//           severity: simSeverity,
//           affectedPeople: simAffected,
//           reporterName: simReporter,
//           reporterPhone: '0714455883',
//           description: `Simulated quick report for evaluating system FIFO ordering. Severity score ${simSeverity * simAffected}.`
//         })
//       });
//       if (res.ok) {
//         onRefreshAll();
//         // Reset defaults
//         setSimReporter('');
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setIsProcessing(false);
//     }
//   };
//
//   const handleDequeue = async () => {
//     setIsProcessing(true);
//     await onDequeueReport();
//     setIsProcessing(false);
//   };
//
//   const handleExtractHeap = async () => {
//     setIsProcessing(true);
//     await onExtractMaxHeap();
//     setIsProcessing(false);
//   };
//
//   const handleUndo = async () => {
//     setIsProcessing(true);
//     await onTriggerUndo();
//     setIsProcessing(false);
//   };
//
//   return (
//       <div className="space-y-6" id="dsa-algorithms-workspace">
//         {/* Header and Sync controls */}
//         <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
//           <div>
//             <h2 className="text-xl font-bold font-sans text-slate-800 flex items-center gap-2">
//               <Code className="text-blue-500 w-5.5 h-5.5" /> Coursework Algorithms Engine
//             </h2>
//             <p className="text-sm text-slate-500 mt-1">Interactive playground visualizing Heap calculations, FIFO enqueues, and LIFO rolls.</p>
//           </div>
//           <button
//               onClick={onRefreshAll}
//               className="px-4 py-2 border border-slate-200 hover:bg-slate-50 bg-white text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer"
//               id="btn-sync-heaps"
//           >
//             <RefreshCcw className="w-3.5 h-3.5" /> Recalculate States
//           </button>
//         </div>
//
//         {/* Segmented control tabs */}
//         <div className="flex border-b border-slate-200">
//           <button
//               onClick={() => setActiveTab('heap')}
//               className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === 'heap' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
//           >
//             Max Heap Tree (Priority Queue)
//           </button>
//           <button
//               onClick={() => setActiveTab('queue')}
//               className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === 'queue' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
//           >
//             Linked List FIFO (Citizen Queue)
//           </button>
//           <button
//               onClick={() => setActiveTab('stack')}
//               className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === 'stack' ? 'border-amber-600 text-amber-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
//           >
//             LIFO Stack Undo (Action Records)
//           </button>
//         </div>
//
//         {/* CONTENT TABS */}
//         {activeTab === 'heap' && (
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="heap-tab-content">
//               <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
//                 <div className="flex justify-between items-start border-b border-slate-50 pb-4">
//                   <div>
//                     <h3 className="font-bold text-slate-800 text-lg">Max Heap Priority State</h3>
//                     <p className="text-xs text-slate-400 mt-0.5">Critical disasters ordered dynamically: Severity &times; Affected People</p>
//                   </div>
//                   <button
//                       onClick={handleExtractHeap}
//                       disabled={isProcessing || heapIncidents.length === 0}
//                       className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
//                       id="btn-extract-max"
//                   >
//                     <Layers className="w-3.5 h-3.5" /> Extract Max Threat (Dispatch Relief)
//                   </button>
//                 </div>
//
//                 {heapIncidents.length === 0 ? (
//                     <div className="py-16 text-center text-slate-400">
//                       <p className="font-medium">All active alerts resolved! Max heap is pristine and empty.</p>
//                     </div>
//                 ) : (
//                     <div className="space-y-4">
//                       {/* Visual Binary Tree Representation like Nodes List */}
//                       <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
//                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Heap Tree Node Sequence representation</p>
//                         <div className="flex flex-wrap items-center gap-2">
//                           {heapIncidents.map((incident, idx) => (
//                               <React.Fragment key={incident.id}>
//                                 {idx > 0 && <span className="text-slate-300 font-mono text-xs">&rarr;</span>}
//                                 <div className={`px-3 py-2 rounded-lg border text-xs font-mono flex items-center gap-1.5 ${idx === 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold shadow-xs' : 'bg-white border-slate-200 text-slate-600'}`}>
//                                   <span className="bg-slate-100 text-slate-500 rounded-sm px-1 text-[9px] font-bold">[{idx}]</span>
//                                   {incident.disasterType} ({incident.severity*incident.affectedPeople})
//                                 </div>
//                               </React.Fragment>
//                           ))}
//                         </div>
//                       </div>
//
//                       {/* Priority list displaying core formula equations */}
//                       <div className="space-y-2">
//                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Indexed Heap Order Breakdown</p>
//                         {heapIncidents.map((inc, index) => {
//                           const mathVal = inc.severity * inc.affectedPeople;
//                           return (
//                               <div
//                                   key={inc.id}
//                                   className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 transition-all ${index === 0 ? 'bg-indigo-50/50 border-indigo-100 font-medium' : 'bg-white border-slate-100'}`}
//                               >
//                                 <div className="flex items-center gap-3">
//                           <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono flex items-center justify-center shrink-0">
//                             {index + 1}
//                           </span>
//                                   <div>
//                                     <h4 className="font-bold text-slate-800 text-sm">{inc.disasterType} in {inc.district}</h4>
//                                     <p className="text-xs text-slate-400">Location: {inc.location}</p>
//                                   </div>
//                                 </div>
//
//                                 <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
//                                   <span>Severity: <strong className="text-slate-800">{inc.severity}</strong></span>
//                                   <span>&times;</span>
//                                   <span>Affected: <strong className="text-slate-800">{inc.affectedPeople.toLocaleString()}</strong></span>
//                                   <span>=</span>
//                                   <span className={`px-2 py-0.5 rounded font-bold ${index === 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'}`}>
//                             Priority {mathVal.toLocaleString()}
//                           </span>
//                                 </div>
//                               </div>
//                           );
//                         })}
//                       </div>
//                     </div>
//                 )}
//               </div>
//
//               {/* Side Explainer */}
//               <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
//                 <div className="space-y-4">
//                   <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-1 rounded">Coursework DSA Pillar</span>
//                   <h4 className="font-bold text-slate-800 text-base">Custom Binary Max Heap</h4>
//                   <p className="text-xs text-slate-500 leading-relaxed">
//                     Rather than treating all incoming disasters sequentially, emergency resources require sorted prioritization.
//                     Our custom backend Java/TypeScript Max Heap automatically bubbling-up high severity reports inside O(log N) complexity.
//                   </p>
//                   <div className="p-3.5 bg-white rounded-xl border border-slate-100 text-xs text-slate-600">
//                     <span className="font-semibold block text-slate-800 mb-1">Heap Formula Logic:</span>
//                     <code>Priority Score = (Severity Rating [1-10]) &times; (Number of Affected Civil Populations)</code>
//                   </div>
//                 </div>
//                 <div className="pt-6 border-t border-slate-200 mt-6 shrink-0">
//                   <p className="text-[10px] text-slate-400 leading-normal">
//                     Executing <strong>Extract Max</strong> triggers triage resolution, moving the peak incident to intermediate state "RESOLVED" and re-balancing remaining branch nodes.
//                   </p>
//                 </div>
//               </div>
//             </div>
//         )}
//
//         {/* FIFO Citizen reports Queue */}
//         {activeTab === 'queue' && (
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="queue-tab-content">
//               <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
//                 <div className="flex justify-between items-start border-b border-slate-50 pb-4_">
//                   <div>
//                     <h3 className="font-bold text-slate-800 text-lg">FIFO Standby Emergency reports</h3>
//                     <p className="text-xs text-slate-400">Linked List Lineage of incoming alerts from field observers</p>
//                   </div>
//                   <button
//                       onClick={handleDequeue}
//                       disabled={isProcessing || reportsQueue.length === 0}
//                       className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-40 transition-colors"
//                       id="btn-trigger-dequeue"
//                   >
//                     <ArrowDownToLine className="w-3.5 h-3.5" /> Dequeue oldest &amp; Promote to Incident
//                   </button>
//                 </div>
//
//                 {reportsQueue.length === 0 ? (
//                     <div className="py-16 text-center text-slate-400">
//                       <p className="font-medium">No standby alerts in FIFO queue. Operations lines are nominal.</p>
//                     </div>
//                 ) : (
//                     <div className="space-y-4">
//                       {/* Visual Linear Queue representation */}
//                       <div className="flex items-center gap-1 p-3 bg-blue-50/50 rounded-xl overflow-x-auto border border-blue-50">
//                         <span className="text-[10px] uppercase font-extrabold text-blue-700 rotate-270 shrink-0 select-none mr-2">DEQUEUE END</span>
//                         {reportsQueue.map((rep, idx) => (
//                             <div
//                                 key={rep.id}
//                                 className={`px-3 py-2 rounded-lg border text-xs font-semibold text-slate-700 font-mono shrink-0 ${idx === 0 ? 'bg-blue-100 border-blue-300 text-blue-800 font-bold' : 'bg-white border-slate-200'}`}
//                             >
//                               [{rep.id}] {rep.disasterType}
//                             </div>
//                         ))}
//                         <span className="text-[10px] uppercase font-extrabold text-slate-400 rotate-90 shrink-0 select-none ml-2">ENQUEUE END</span>
//                       </div>
//
//                       {/* Queue list details */}
//                       <div className="space-y-3">
//                         {reportsQueue.map((rep, index) => (
//                             <div
//                                 key={rep.id}
//                                 className="p-4 rounded-xl border border-slate-100 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
//                             >
//                               <div className="space-y-1">
//                                 <div className="flex items-center gap-2">
//                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${index === 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
//                             {index === 0 ? 'FIRST IN (NEXT UP)' : `Position ${index + 1}`}
//                           </span>
//                                   <span className="font-bold text-slate-800 text-sm">DMC-REQ-{rep.id}</span>
//                                 </div>
//                                 <h4 className="font-bold text-slate-700 text-sm">{rep.disasterType} in {rep.district}</h4>
//                                 <p className="text-xs text-slate-500 line-clamp-1">{rep.description}</p>
//                               </div>
//
//                               <div className="text-xs text-slate-400 text-right font-mono self-stretch md:self-auto flex md:flex-col justify-between items-center md:items-end border-t md:border-t-0 border-slate-50 pt-2 md:pt-0">
//                                 <span>Reporter: <strong>{rep.reporterName}</strong></span>
//                                 <span>Severity score: <strong>{rep.severity * rep.affectedPeople}</strong></span>
//                               </div>
//                             </div>
//                         ))}
//                       </div>
//                     </div>
//                 )}
//               </div>
//
//               {/* Quick Enqueue Simulator Tool */}
//               <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
//                 <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-1 rounded">Simulation Node</span>
//                 <h4 className="font-bold text-slate-800 text-base">Enqueue Emergency Report</h4>
//
//                 <form onSubmit={handleCreateSimulationReport} className="space-y-3 pt-2">
//                   <div>
//                     <label className="block text-[10px] font-bold uppercase text-slate-400">Disaster Category</label>
//                     <select
//                         value={simType}
//                         onChange={(e) => setSimType(e.target.value)}
//                         className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs"
//                     >
//                       <option value="Flood">Flood</option>
//                       <option value="Landslide">Landslide</option>
//                       <option value="Cyclone">Cyclone</option>
//                       <option value="Fire">Fire</option>
//                     </select>
//                   </div>
//
//                   <div>
//                     <label className="block text-[10px] font-bold uppercase text-slate-400">Settle district</label>
//                     <select
//                         value={simDistrict}
//                         onChange={(e) => setSimDistrict(e.target.value)}
//                         className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs"
//                     >
//                       <option value="Kalutara">Kalutara District</option>
//                       <option value="Matara">Matara District</option>
//                       <option value="Jaffna">Jaffna District</option>
//                       <option value="Anuradhapura">Anuradhapura District</option>
//                     </select>
//                   </div>
//
//                   <div className="grid grid-cols-2 gap-2">
//                     <div>
//                       <label className="block text-[10px] font-bold uppercase text-slate-400">Severity (1-10)</label>
//                       <input
//                           type="number"
//                           min="1"
//                           max="10"
//                           value={simSeverity}
//                           onChange={(e) => setSimSeverity(parseInt(e.target.value, 10) || 1)}
//                           className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-[10px] font-bold uppercase text-slate-400">Affected Civilians</label>
//                       <input
//                           type="number"
//                           min="1"
//                           value={simAffected}
//                           onChange={(e) => setSimAffected(parseInt(e.target.value, 10) || 1)}
//                           className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs"
//                       />
//                     </div>
//                   </div>
//
//                   <div>
//                     <label className="block text-[10px] font-bold uppercase text-slate-400">Reporter Handle</label>
//                     <input
//                         type="text"
//                         required
//                         placeholder="e.g. Sunil"
//                         value={simReporter}
//                         onChange={(e) => setSimReporter(e.target.value)}
//                         className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs"
//                     />
//                   </div>
//
//                   <button
//                       type="submit"
//                       disabled={isProcessing || !simReporter}
//                       className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg mt-2 cursor-pointer"
//                   >
//                     Push to FIFO Enqueue End
//                   </button>
//                 </form>
//               </div>
//             </div>
//         )}
//
//         {/* LIFO ACTION STACK & ROLLBACK UNDO */}
//         {activeTab === 'stack' && (
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="stack-tab-content">
//               <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
//                 <div className="flex justify-between items-start border-b border-slate-50 pb-4">
//                   <div>
//                     <h3 className="font-bold text-slate-800 text-lg font-mono">LIFO Action Tracker Stack</h3>
//                     <p className="text-xs text-slate-400 mt-0.5">Chronological trace registry preserving state rollback capabilities</p>
//                   </div>
//                   <button
//                       onClick={handleUndo}
//                       disabled={isProcessing || actionStack.length === 0}
//                       className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-40 transition-colors"
//                       id="btn-trigger-undo"
//                   >
//                     <Undo className="w-3.5 h-3.5 animate-pulse" /> Revert Last Command (Pop LIFO)
//                   </button>
//                 </div>
//
//                 {actionStack.length === 0 ? (
//                     <div className="py-16 text-center text-slate-400">
//                       <p className="font-medium">Audit logs pristine. No tracked coordinator actions recorded yet.</p>
//                     </div>
//                 ) : (
//                     <div className="space-y-4">
//                       {/* Visual Stack Blocks */}
//                       <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-2">
//                         {actionStack.map((act, index) => (
//                             <div
//                                 key={act.id}
//                                 className={`p-4 rounded-xl border flex justify-between items-start gap-4 transition-all ${index === 0 ? 'bg-amber-50/50 border-amber-200 ring-2 ring-amber-100' : 'bg-white border-slate-100'}`}
//                             >
//                               <div className="space-y-1">
//                                 <div className="flex items-center gap-2">
//                           <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${index === 0 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
//                             {index === 0 ? 'TOP OF STACK (LIFO)' : `Stack Level -${index}`}
//                           </span>
//                                   <span className="font-bold text-slate-800 text-xs">Action ID: {act.id}</span>
//                                 </div>
//                                 <h4 className="font-extrabold text-slate-700 text-sm uppercase font-mono tracking-tight">{act.actionType}</h4>
//                                 <p className="text-xs text-slate-500 leading-normal">{act.description}</p>
//                               </div>
//
//                               <div className="text-right text-[11px] text-slate-400 font-mono flex flex-col items-end gap-1 shrink-0">
//                                 <span>By: {act.performedBy}</span>
//                                 <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
//                                 {act.undone && (
//                                     <span className="text-red-500 font-bold uppercase text-[9px] bg-red-50 px-1 py-0.5 rounded">Reverted</span>
//                                 )}
//                               </div>
//                             </div>
//                         ))}
//                       </div>
//                     </div>
//                 )}
//               </div>
//
//               {/* DSA Stack Explainer */}
//               <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
//                 <div className="space-y-4">
//                   <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-1 rounded">Coursework DSA Pillar</span>
//                   <h4 className="font-bold text-slate-800 text-base">Last-In First-Out (LIFO) stack</h4>
//                   <p className="text-xs text-slate-500 leading-relaxed">
//                     Human error during critical operations is common.
//                     Our platform tracks all major modifications (Incident creations, shelter updates, and resource assignments) in an audit logs stack.
//                   </p>
//                   <div className="bg-white p-3.5 rounded-xl border border-slate-100 text-xs text-slate-600">
//                     <span className="font-semibold block text-slate-800 mb-1">State Undo Engine:</span>
//                     Each stack frame stores complete serialized clones of preceding databases snapshots, enabling total restoration when popped!
//                   </div>
//                 </div>
//                 <div className="text-center bg-amber-50 rounded-xl p-4 border border-amber-100">
//                   <p className="text-xs text-amber-900 leading-relaxed">
//                     Click <strong>Revert Last Command</strong> to pop the top of stack, call backend restore queries, and reverse the action.
//                   </p>
//                 </div>
//               </div>
//             </div>
//         )}
//       </div>
//   );
// }




import React, { useState } from 'react';
import { ArrowDownToLine, Undo, RefreshCcw, Layers, AlertTriangle, Activity, Clock } from 'lucide-react';
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

export default function DsaVisualizer({
  reportsQueue,
  heapIncidents,
  actionStack,
  onRefreshAll,
  onDequeueReport,
  onExtractMaxHeap,
  onTriggerUndo
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
      const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
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
          description: `Field report submitted from ${simDistrict}. Severity level ${simSeverity}, approximately ${simAffected} civilians affected.`
        })
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

  const handleDequeue = async () => {
    setIsProcessing(true);
    await onDequeueReport();
    setIsProcessing(false);
  };

  const handleExtractHeap = async () => {
    setIsProcessing(true);
    await onExtractMaxHeap();
    setIsProcessing(false);
  };

  const handleUndo = async () => {
    setIsProcessing(true);
    await onTriggerUndo();
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-blue-500 w-5 h-5" /> Operations Engine
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage incident priorities, incoming reports, and action history.</p>
        </div>
        <button
          onClick={onRefreshAll}
          className="px-4 py-2 border border-slate-200 hover:bg-slate-50 bg-white text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
        >
          <RefreshCcw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('heap')}
          className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === 'heap' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Priority Queue
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === 'queue' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Incoming Reports
        </button>
        <button
          onClick={() => setActiveTab('stack')}
          className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${activeTab === 'stack' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Action History
        </button>
      </div>

      {/* PRIORITY QUEUE TAB */}
      {activeTab === 'heap' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Active Incidents by Priority</h3>
                <p className="text-xs text-slate-400 mt-0.5">Ordered by severity and number of people affected</p>
              </div>
              <button
                onClick={handleExtractHeap}
                disabled={isProcessing || heapIncidents.length === 0}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Layers className="w-3.5 h-3.5" /> Dispatch Top Incident
              </button>
            </div>

            {heapIncidents.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <AlertTriangle className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No active incidents at this time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Visual order strip */}
                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Priority Order</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {heapIncidents.map((incident, idx) => (
                      <React.Fragment key={incident.id}>
                        {idx > 0 && <span className="text-slate-300 font-mono text-xs">→</span>}
                        <div className={`px-3 py-2 rounded-lg border text-xs font-mono flex items-center gap-1.5 ${idx === 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-white border-slate-200 text-slate-600'}`}>
                          <span className="bg-slate-100 text-slate-500 rounded-sm px-1 text-[9px] font-bold">#{idx + 1}</span>
                          {incident.disasterType}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Incident list */}
                <div className="space-y-2">
                  {heapIncidents.map((inc, index) => {
                    const score = inc.severity * inc.affectedPeople;
                    return (
                      <div
                        key={inc.id}
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${index === 0 ? 'bg-indigo-50/50 border-indigo-100' : 'bg-white border-slate-100'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{inc.disasterType} — {inc.district}</h4>
                            <p className="text-xs text-slate-400">{inc.location}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>Severity <strong className="text-slate-800">{inc.severity}</strong></span>
                          <span>·</span>
                          <span><strong className="text-slate-800">{inc.affectedPeople.toLocaleString()}</strong> affected</span>
                          <span className={`px-2 py-0.5 rounded font-bold ${index === 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'}`}>
                            Score {score.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Side info */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col gap-4">
            <h4 className="font-bold text-slate-800 text-base">How Priority Works</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Each incident is ranked by a combined score based on its severity rating and the number of civilians affected. The highest-scoring incident always appears at the top and is dispatched first.
            </p>
            <div className="p-3.5 bg-white rounded-xl border border-slate-100 text-xs text-slate-600">
              <span className="font-semibold block text-slate-800 mb-1">Priority Score</span>
              Severity (1–10) × Number of people affected
            </div>
            <div className="mt-auto pt-4 border-t border-slate-200">
              <p className="text-[11px] text-slate-400 leading-normal">
                Clicking <strong>Dispatch Top Incident</strong> marks the highest priority incident as resolved and moves to the next.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* INCOMING REPORTS TAB */}
      {activeTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Pending Reports</h3>
                <p className="text-xs text-slate-400">Reports are processed in the order they were received</p>
              </div>
              <button
                onClick={handleDequeue}
                disabled={isProcessing || reportsQueue.length === 0}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" /> Process Next Report
              </button>
            </div>

            {reportsQueue.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No pending reports. All clear.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Visual queue strip */}
                <div className="flex items-center gap-1 p-3 bg-blue-50/50 rounded-xl overflow-x-auto border border-blue-50">
                  <span className="text-[10px] uppercase font-extrabold text-blue-700 shrink-0 mr-2">NEXT →</span>
                  {reportsQueue.map((rep, idx) => (
                    <div
                      key={rep.id}
                      className={`px-3 py-2 rounded-lg border text-xs font-semibold shrink-0 ${idx === 0 ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white border-slate-200 text-slate-700'}`}
                    >
                      {rep.disasterType}
                    </div>
                  ))}
                </div>

                {/* Report list */}
                <div className="space-y-3">
                  {reportsQueue.map((rep, index) => (
                    <div
                      key={rep.id}
                      className="p-4 rounded-xl border border-slate-100 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${index === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            {index === 0 ? 'Up Next' : `#${index + 1}`}
                          </span>
                          <span className="font-bold text-slate-800 text-sm">Report #{rep.id}</span>
                        </div>
                        <h4 className="font-bold text-slate-700 text-sm">{rep.disasterType} — {rep.district}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{rep.description}</p>
                      </div>
                      <div className="text-xs text-slate-400 text-right font-mono flex md:flex-col justify-between items-end gap-1">
                        <span>Reporter: <strong>{rep.reporterName}</strong></span>
                        <span>Score: <strong>{rep.severity * rep.affectedPeople}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit new report */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
            <h4 className="font-bold text-slate-800 text-base">Submit a Report</h4>
            <p className="text-xs text-slate-500">Add a new emergency report to the queue.</p>

            <form onSubmit={handleCreateSimulationReport} className="space-y-3 pt-1">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Disaster Type</label>
                <select
                  value={simType}
                  onChange={(e) => setSimType(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs"
                >
                  <option value="Flood">Flood</option>
                  <option value="Landslide">Landslide</option>
                  <option value="Cyclone">Cyclone</option>
                  <option value="Fire">Fire</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">District</label>
                <select
                  value={simDistrict}
                  onChange={(e) => setSimDistrict(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs"
                >
                  <option value="Kalutara">Kalutara</option>
                  <option value="Matara">Matara</option>
                  <option value="Jaffna">Jaffna</option>
                  <option value="Anuradhapura">Anuradhapura</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Severity (1–10)</label>
                  <input
                    type="number" min="1" max="10"
                    value={simSeverity}
                    onChange={(e) => setSimSeverity(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">People Affected</label>
                  <input
                    type="number" min="1"
                    value={simAffected}
                    onChange={(e) => setSimAffected(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Reporter Name</label>
                <input
                  type="text" required
                  placeholder="e.g. Sunil"
                  value={simReporter}
                  onChange={(e) => setSimReporter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing || !simReporter}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg mt-1 cursor-pointer transition-colors"
              >
                Submit Report
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ACTION HISTORY TAB */}
      {activeTab === 'stack' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Action History</h3>
                <p className="text-xs text-slate-400 mt-0.5">A log of all coordinator actions. Undo reverses the most recent one.</p>
              </div>
              <button
                onClick={handleUndo}
                disabled={isProcessing || actionStack.length === 0}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors"
              >
                <Undo className="w-3.5 h-3.5" /> Undo Last Action
              </button>
            </div>

            {actionStack.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No actions recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {actionStack.map((act, index) => (
                  <div
                    key={act.id}
                    className={`p-4 rounded-xl border flex justify-between items-start gap-4 ${index === 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-100'}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${index === 0 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {index === 0 ? 'Most Recent' : `−${index}`}
                        </span>
                        <span className="font-bold text-slate-800 text-xs uppercase tracking-tight">{act.actionType}</span>
                      </div>
                      <p className="text-xs text-slate-500">{act.description}</p>
                    </div>
                    <div className="text-right text-[11px] text-slate-400 font-mono flex flex-col items-end gap-1 shrink-0">
                      <span>{act.performedBy}</span>
                      <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
                      {act.undone && (
                        <span className="text-red-500 font-bold text-[9px] bg-red-50 px-1 py-0.5 rounded uppercase">Undone</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Side info */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col gap-4">
            <h4 className="font-bold text-slate-800 text-base">About Undo</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every significant action — creating incidents, updating shelters, assigning resources — is recorded here. Use Undo to reverse the most recent action if a mistake was made.
            </p>
            <div className="mt-auto p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-xs text-amber-900 leading-relaxed">
                <strong>Undo Last Action</strong> reverses only the most recent entry. Actions marked "Undone" have already been reversed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}