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
import {
  ArrowDownToLine, Undo, RefreshCcw, Layers, AlertTriangle,
  Activity, Clock, ChevronRight, Zap, FileText, History,
  TrendingUp, Users, MapPin, Bot, X, Send, Loader2
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
- Active incidents (priority queue, highest first): ${
    heapIncidents.length === 0
      ? 'None'
      : heapIncidents
          .map(
            (i, idx) =>
              `#${idx + 1} ${i.disasterType} in ${i.district} — severity ${i.severity}, ${i.affectedPeople} affected, score ${i.severity * i.affectedPeople}`
          )
          .join('; ')
  }
- Pending reports queue (${reportsQueue.length} reports): ${
    reportsQueue.length === 0
      ? 'Empty'
      : reportsQueue
          .map((r, idx) => `#${idx + 1} Report-${r.id}: ${r.disasterType} in ${r.district}`)
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

Answer questions about the current operational state, priorities, and what coordinators should do next. Be concise and direct. Do not make up data beyond what is provided.
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
        {/* Header */}
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

        {/* Messages */}
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

        {/* Input */}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main panel */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
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

          {/* Info sidebar */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 flex flex-col gap-4">
            <h4 className="font-bold text-slate-800">How Prioritisation Works</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Each incident is ranked by a composite score. The highest-scoring incident is always dispatched first.
            </p>
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Priority Score</p>
              <p className="text-sm font-mono font-bold text-indigo-700">Severity × Affected</p>
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
                <strong className="text-slate-600">Dispatch Top</strong> marks the highest-priority incident as resolved and advances the queue.
              </p>
            </div>
          </div>
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

          {/* Info sidebar */}
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