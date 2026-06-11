// import React, { useEffect, useRef, useState } from 'react';
// import { MapContainer, TileLayer, useMap } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
//
// // --- Types ---
// type IncidentStatus = 'ACTIVE' | 'PENDING' | 'RESOLVED' | 'CLOSED';
//
// interface Incident {
//   id: number;
//   disasterType: string;
//   district: string;
//   location: string;
//   severity: number;
//   affectedPeople: number;
//   status: IncidentStatus;
//   description: string;
// }
//
// // --- GPS coordinates for every district ---
// const DISTRICT_COORDS: Record<string, [number, number]> = {
//   'Colombo':      [6.9271,  79.8612],
//   'Gampaha':      [7.0917,  79.9997],
//   'Kalutara':     [6.5854,  79.9607],
//   'Kandy':        [7.2906,  80.6337],
//   'Matale':       [7.4675,  80.6234],
//   'Nuwara Eliya': [6.9497,  80.7891],
//   'Galle':        [6.0535,  80.2210],
//   'Matara':       [5.9549,  80.5550],
//   'Hambantota':   [6.1429,  81.1212],
//   'Jaffna':       [9.6615,  80.0255],
//   'Kilinochchi':  [9.3803,  80.3770],
//   'Mannar':       [8.9810,  79.9044],
//   'Vavuniya':     [8.7514,  80.4971],
//   'Mullaitivu':   [9.2671,  80.8128],
//   'Trincomalee':  [8.5922,  81.2152],
//   'Batticaloa':   [7.7102,  81.6924],
//   'Ampara':       [7.2980,  81.6747],
//   'Kurunegala':   [7.4867,  80.3647],
//   'Puttalam':     [8.0362,  79.8283],
//   'Anuradhapura': [8.3114,  80.4037],
//   'Polonnaruwa':  [7.9403,  81.0188],
//   'Badulla':      [6.9934,  81.0550],
//   'Monaragala':   [6.8728,  81.3507],
//   'Ratnapura':    [6.6828,  80.3992],
//   'Kegalle':      [7.2513,  80.3464],
// };
//
// const ALL_DISTRICTS = Object.keys(DISTRICT_COORDS).sort();
//
// // --- Road adjacency graph (approximate km distances via main roads) ---
// // Each entry: [districtA, districtB, distanceKm]
// const ROAD_EDGES: [string, string, number][] = [
//   ['Colombo',      'Gampaha',      35],
//   ['Colombo',      'Kalutara',     42],
//   ['Colombo',      'Kegalle',      75],
//   ['Colombo',      'Ratnapura',    100],
//   ['Gampaha',      'Kurunegala',   80],
//   ['Gampaha',      'Puttalam',     120],
//   ['Kalutara',     'Galle',        75],
//   ['Kalutara',     'Ratnapura',    65],
//   ['Galle',        'Matara',       45],
//   ['Matara',       'Hambantota',   60],
//   ['Hambantota',   'Monaragala',   100],
//   ['Hambantota',   'Ampara',       155],
//   ['Ratnapura',    'Kegalle',      55],
//   ['Ratnapura',    'Nuwara Eliya', 90],
//   ['Ratnapura',    'Monaragala',   130],
//   ['Kegalle',      'Kandy',        50],
//   ['Kegalle',      'Kurunegala',   65],
//   ['Kandy',        'Matale',       30],
//   ['Kandy',        'Nuwara Eliya', 75],
//   ['Kandy',        'Kurunegala',   95],
//   ['Kandy',        'Polonnaruwa',  130],
//   ['Matale',       'Kurunegala',   70],
//   ['Matale',       'Anuradhapura', 110],
//   ['Nuwara Eliya', 'Badulla',      75],
//   ['Nuwara Eliya', 'Ampara',       160],
//   ['Badulla',      'Monaragala',   65],
//   ['Badulla',      'Ampara',       95],
//   ['Monaragala',   'Ampara',       90],
//   ['Ampara',       'Batticaloa',   65],
//   ['Batticaloa',   'Trincomalee',  110],
//   ['Batticaloa',   'Polonnaruwa',  100],
//   ['Trincomalee',  'Polonnaruwa',  100],
//   ['Trincomalee',  'Anuradhapura', 180],
//   ['Trincomalee',  'Mullaitivu',   90],
//   ['Polonnaruwa',  'Anuradhapura', 100],
//   ['Anuradhapura', 'Vavuniya',     70],
//   ['Anuradhapura', 'Kurunegala',   100],
//   ['Anuradhapura', 'Puttalam',     130],
//   ['Anuradhapura', 'Mannar',       150],
//   ['Vavuniya',     'Mullaitivu',   100],
//   ['Vavuniya',     'Kilinochchi',  80],
//   ['Vavuniya',     'Mannar',       110],
//   ['Kilinochchi',  'Mullaitivu',   60],
//   ['Kilinochchi',  'Jaffna',       70],
//   ['Mannar',       'Jaffna',       140],
//   ['Puttalam',     'Kurunegala',   80],
// ];
//
// // Build adjacency map
// function buildGraph(): Map<string, Map<string, number>> {
//   const graph = new Map<string, Map<string, number>>();
//   for (const d of ALL_DISTRICTS) graph.set(d, new Map());
//   for (const [a, b, w] of ROAD_EDGES) {
//     graph.get(a)!.set(b, w);
//     graph.get(b)!.set(a, w);
//   }
//   return graph;
// }
//
// const GRAPH = buildGraph();
//
// // Dijkstra's algorithm
// function dijkstra(start: string, end: string): { path: string[]; distanceKm: number } | null {
//   const dist = new Map<string, number>();
//   const prev = new Map<string, string | null>();
//   const visited = new Set<string>();
//
//   for (const d of ALL_DISTRICTS) dist.set(d, Infinity);
//   dist.set(start, 0);
//   prev.set(start, null);
//
//   // Simple priority queue via sorted array (fine for 25 nodes)
//   const queue: string[] = [...ALL_DISTRICTS];
//
//   while (queue.length > 0) {
//     queue.sort((a, b) => dist.get(a)! - dist.get(b)!);
//     const u = queue.shift()!;
//     if (visited.has(u)) continue;
//     visited.add(u);
//     if (u === end) break;
//
//     const neighbours = GRAPH.get(u);
//     if (!neighbours) continue;
//     for (const [v, weight] of neighbours) {
//       const alt = dist.get(u)! + weight;
//       if (alt < dist.get(v)!) {
//         dist.set(v, alt);
//         prev.set(v, u);
//       }
//     }
//   }
//
//   if (dist.get(end) === Infinity) return null;
//
//   // Reconstruct path
//   const path: string[] = [];
//   let cur: string | null | undefined = end;
//   while (cur !== null && cur !== undefined) {
//     path.unshift(cur);
//     cur = prev.get(cur);
//   }
//
//   return { path, distanceKm: Math.round(dist.get(end)!) };
// }
//
// // --- Status config ---
// const STATUS_CONFIG: Record<IncidentStatus, { color: string; pulse: boolean; label: string }> = {
//   ACTIVE:   { color: '#DC2626', pulse: true,  label: 'Active'   },
//   PENDING:  { color: '#D97706', pulse: true,  label: 'Pending'  },
//   RESOLVED: { color: '#16A34A', pulse: false, label: 'Resolved' },
//   CLOSED:   { color: '#94A3B8', pulse: false, label: 'Closed'   },
// };
//
// function markerRadius(severity: number): number {
//   return 8 + severity * 1.4;
// }
//
// const TYPE_ICON: Record<string, string> = {
//   Flood: '🌊', Landslide: '⛰️', Cyclone: '🌀',
//   Drought: '☀️', Fire: '🔥', Tsunami: '🌊', 'Heavy Rain': '🌧️',
// };
//
// function darken(hex: string): string {
//   const n = parseInt(hex.slice(1), 16);
//   const r = Math.max(0, (n >> 16) - 40);
//   const g = Math.max(0, ((n >> 8) & 0xff) - 40);
//   const b = Math.max(0, (n & 0xff) - 40);
//   return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
// }
//
// // ---- Map layer: incidents + path ----
// interface MapLayerProps {
//   incidents: Incident[];
//   pathResult: { path: string[]; distanceKm: number } | null;
//   fromDistrict: string;
//   toDistrict: string;
// }
//
// function MapLayer({ incidents, pathResult, fromDistrict, toDistrict }: MapLayerProps) {
//   const map = useMap();
//   const incidentLayerRef = useRef<L.LayerGroup | null>(null);
//   const pathLayerRef = useRef<L.LayerGroup | null>(null);
//   const styleRef = useRef<HTMLStyleElement | null>(null);
//
//   // Inject CSS once
//   useEffect(() => {
//     if (!styleRef.current) {
//       const style = document.createElement('style');
//       style.textContent = `
//         @keyframes leaflet-pulse {
//           0%   { transform: scale(1);   opacity: 1; }
//           70%  { transform: scale(2.8); opacity: 0; }
//           100% { transform: scale(1);   opacity: 0; }
//         }
//         .incident-pulse-ring {
//           border-radius: 50%;
//           position: absolute;
//           animation: leaflet-pulse 1.8s ease-out infinite;
//           pointer-events: none;
//         }
//         @keyframes dash-flow {
//           to { stroke-dashoffset: -24; }
//         }
//         .path-line-animated {
//           animation: dash-flow 0.6s linear infinite;
//         }
//       `;
//       document.head.appendChild(style);
//       styleRef.current = style;
//     }
//   }, []);
//
//   // Draw incident markers
//   useEffect(() => {
//     if (incidentLayerRef.current) {
//       incidentLayerRef.current.clearLayers();
//     } else {
//       incidentLayerRef.current = L.layerGroup().addTo(map);
//     }
//
//     const byDistrict: Record<string, Incident[]> = {};
//     for (const inc of incidents) {
//       if (!DISTRICT_COORDS[inc.district]) continue;
//       if (!byDistrict[inc.district]) byDistrict[inc.district] = [];
//       byDistrict[inc.district].push(inc);
//     }
//
//     for (const [district, distIncidents] of Object.entries(byDistrict)) {
//       const [lat, lng] = DISTRICT_COORDS[district];
//       const sorted = [...distIncidents].sort((a, b) => {
//         const ap = a.status === 'ACTIVE' ? 1000 : a.status === 'PENDING' ? 500 : 0;
//         const bp = b.status === 'ACTIVE' ? 1000 : b.status === 'PENDING' ? 500 : 0;
//         return (bp + b.severity) - (ap + a.severity);
//       });
//       const primary = sorted[0];
//       const cfg = STATUS_CONFIG[primary.status];
//       const radius = markerRadius(primary.severity);
//
//       if (cfg.pulse) {
//         const ringSize = radius * 2 + 16;
//         const pulseIcon = L.divIcon({
//           className: '',
//           html: `<div class="incident-pulse-ring" style="width:${ringSize}px;height:${ringSize}px;background:${cfg.color};opacity:0.5;margin-left:-${ringSize/2}px;margin-top:-${ringSize/2}px;"></div>`,
//           iconSize: [0, 0], iconAnchor: [0, 0],
//         });
//         L.marker([lat, lng], { icon: pulseIcon, interactive: false, zIndexOffset: -100 })
//           .addTo(incidentLayerRef.current!);
//       }
//
//       const circle = L.circleMarker([lat, lng], {
//         radius, fillColor: cfg.color, fillOpacity: 0.92,
//         color: darken(cfg.color), weight: 2,
//       }).addTo(incidentLayerRef.current!);
//
//       const popupRows = distIncidents.map(inc => {
//         const incCfg = STATUS_CONFIG[inc.status];
//         const score = inc.severity * inc.affectedPeople;
//         const icon = TYPE_ICON[inc.disasterType] ?? '⚠️';
//         return `<div style="border-top:1px solid #f1f5f9;padding:8px 0;${distIncidents.indexOf(inc)===0?'border-top:none;padding-top:0':''}">
//           <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
//             <span style="font-weight:600;font-size:13px">${icon} ${inc.disasterType}</span>
//             <span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:99px;background:${incCfg.color}22;color:${incCfg.color}">${inc.status}</span>
//           </div>
//           <div style="font-size:11px;color:#64748b;margin-bottom:2px">📍 ${inc.location}</div>
//           <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-top:6px">
//             <div style="background:#f8fafc;border-radius:6px;padding:4px 6px;text-align:center">
//               <div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase">Severity</div>
//               <div style="font-size:14px;font-weight:700;color:${incCfg.color}">${inc.severity}/10</div>
//             </div>
//             <div style="background:#f8fafc;border-radius:6px;padding:4px 6px;text-align:center">
//               <div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase">Affected</div>
//               <div style="font-size:13px;font-weight:700;color:#334155">${inc.affectedPeople.toLocaleString()}</div>
//             </div>
//             <div style="background:#f8fafc;border-radius:6px;padding:4px 6px;text-align:center">
//               <div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase">Score</div>
//               <div style="font-size:13px;font-weight:700;color:#2563eb">${score.toLocaleString()}</div>
//             </div>
//           </div>
//           <div style="font-size:11px;color:#94a3b8;margin-top:6px;font-style:italic">ID: DMC-${inc.id}</div>
//         </div>`;
//       }).join('');
//
//       circle.bindPopup(`
//         <div style="min-width:240px;max-width:280px;font-family:system-ui,sans-serif">
//           <div style="font-weight:700;font-size:14px;color:#1e293b;margin-bottom:8px;padding-bottom:8px;border-bottom:2px solid #f1f5f9">
//             📌 ${district}
//             ${distIncidents.length > 1 ? `<span style="font-size:11px;background:#dbeafe;color:#1d4ed8;padding:2px 7px;border-radius:99px;margin-left:6px;font-weight:600">${distIncidents.length} incidents</span>` : ''}
//           </div>
//           ${popupRows}
//         </div>`, { maxWidth: 300 });
//
//       const labelIcon = L.divIcon({
//         className: '',
//         html: `<div style="font-size:10px;font-weight:600;color:#1e293b;background:white;border:1px solid #e2e8f0;padding:1px 5px;border-radius:4px;white-space:nowrap;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,0.08);">${district}</div>`,
//         iconAnchor: [-radius - 4, 6],
//       });
//       L.marker([lat, lng], { icon: labelIcon, interactive: false, zIndexOffset: 200 })
//         .addTo(incidentLayerRef.current!);
//     }
//
//     const latlngs = incidents
//       .filter(i => DISTRICT_COORDS[i.district])
//       .map(i => DISTRICT_COORDS[i.district] as [number, number]);
//
//     if (latlngs.length > 0 && !pathResult) {
//       map.fitBounds(L.latLngBounds(latlngs), { padding: [48, 48], maxZoom: 10 });
//     }
//
//     return () => { incidentLayerRef.current?.clearLayers(); };
//   }, [incidents, map, pathResult]);
//
//   // Draw shortest path
//   useEffect(() => {
//     if (pathLayerRef.current) {
//       pathLayerRef.current.clearLayers();
//     } else {
//       pathLayerRef.current = L.layerGroup().addTo(map);
//     }
//
//     if (!pathResult || pathResult.path.length < 2) return;
//
//     const { path } = pathResult;
//     const latlngs = path
//       .filter(d => DISTRICT_COORDS[d])
//       .map(d => DISTRICT_COORDS[d] as [number, number]);
//
//     // Glow / shadow line (thicker, semi-transparent)
//     L.polyline(latlngs, {
//       color: '#1d4ed8',
//       weight: 10,
//       opacity: 0.18,
//     }).addTo(pathLayerRef.current!);
//
//     // Main solid line
//     L.polyline(latlngs, {
//       color: '#2563eb',
//       weight: 4,
//       opacity: 0.85,
//     }).addTo(pathLayerRef.current!);
//
//     // Animated dashed overlay (SVG renderer trick via className)
//     const dashed = L.polyline(latlngs, {
//       color: '#ffffff',
//       weight: 2,
//       opacity: 0.9,
//       dashArray: '8 16',
//     }).addTo(pathLayerRef.current!);
//
//     // Animate the dash via direct SVG manipulation
//     setTimeout(() => {
//       const el = (dashed as any)._path as SVGPathElement | undefined;
//       if (el) {
//         el.style.animation = 'dash-flow 0.8s linear infinite';
//       }
//     }, 100);
//
//     // Node markers along the path
//     path.forEach((district, idx) => {
//       const coords = DISTRICT_COORDS[district];
//       if (!coords) return;
//
//       const isEndpoint = idx === 0 || idx === path.length - 1;
//       const isFrom = idx === 0;
//
//       // Endpoint: larger coloured circle
//       if (isEndpoint) {
//         const endIcon = L.divIcon({
//           className: '',
//           html: `<div style="
//             width:20px;height:20px;border-radius:50%;
//             background:${isFrom ? '#16a34a' : '#dc2626'};
//             border:3px solid white;
//             box-shadow:0 0 0 2px ${isFrom ? '#16a34a' : '#dc2626'},0 2px 8px rgba(0,0,0,0.3);
//             display:flex;align-items:center;justify-content:center;
//             font-size:10px;
//           ">${isFrom ? '🟢' : '🔴'}</div>`,
//           iconSize: [20, 20],
//           iconAnchor: [10, 10],
//         });
//         L.marker(coords, { icon: endIcon, zIndexOffset: 500 })
//           .bindPopup(`<b>${isFrom ? '📍 FROM' : '🏁 TO'}: ${district}</b>`)
//           .addTo(pathLayerRef.current!);
//       } else {
//         // Waypoint: small white dot
//         L.circleMarker(coords, {
//           radius: 5,
//           fillColor: '#2563eb',
//           fillOpacity: 1,
//           color: 'white',
//           weight: 2,
//         }).bindTooltip(district, { permanent: false, direction: 'top' })
//           .addTo(pathLayerRef.current!);
//       }
//
//       // Step number label
//       const stepIcon = L.divIcon({
//         className: '',
//         html: `<div style="
//           font-size:9px;font-weight:800;color:white;
//           background:#2563eb;border-radius:99px;
//           padding:1px 5px;white-space:nowrap;
//           box-shadow:0 1px 4px rgba(0,0,0,0.2);
//           pointer-events:none;
//         ">${idx + 1}</div>`,
//         iconAnchor: [0, isEndpoint ? 24 : 18],
//       });
//       L.marker(coords, { icon: stepIcon, interactive: false, zIndexOffset: 600 })
//         .addTo(pathLayerRef.current!);
//     });
//
//     // Fit map to path
//     map.fitBounds(L.latLngBounds(latlngs), { padding: [60, 60], maxZoom: 10 });
//
//     return () => { pathLayerRef.current?.clearLayers(); };
//   }, [pathResult, map]);
//
//   return null;
// }
//
// // ---- Main component ----
// interface IncidentMapProps {
//   incidents?: Incident[];
//   height?: string;
// }
//
// export default function IncidentMap({ incidents = [], height = '520px' }: IncidentMapProps) {
//   const [fromDistrict, setFromDistrict] = useState('');
//   const [toDistrict, setToDistrict] = useState('');
//   const [pathResult, setPathResult] = useState<{ path: string[]; distanceKm: number } | null>(null);
//   const [noPath, setNoPath] = useState(false);
//
//   const activeCount   = incidents.filter(i => i.status === 'ACTIVE').length;
//   const pendingCount  = incidents.filter(i => i.status === 'PENDING').length;
//   const resolvedCount = incidents.filter(i => i.status === 'RESOLVED').length;
//
//   const handleFindPath = () => {
//     if (!fromDistrict || !toDistrict || fromDistrict === toDistrict) return;
//     const result = dijkstra(fromDistrict, toDistrict);
//     if (result) {
//       setPathResult(result);
//       setNoPath(false);
//     } else {
//       setPathResult(null);
//       setNoPath(true);
//     }
//   };
//
//   const handleClearPath = () => {
//     setPathResult(null);
//     setNoPath(false);
//     setFromDistrict('');
//     setToDistrict('');
//   };
//
//   return (
//     <div className="space-y-4">
//       {/* Header */}
//       <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h2 className="text-lg font-bold text-slate-800">Live Incident Map</h2>
//           <p className="text-sm text-slate-500 mt-0.5">
//             All declared incidents plotted on Sri Lanka · click a marker for details
//           </p>
//         </div>
//         <div className="flex flex-wrap gap-2 text-xs font-semibold">
//           <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full border border-red-100">
//             <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse inline-block" />
//             {activeCount} Active
//           </span>
//           <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
//             <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
//             {pendingCount} Pending
//           </span>
//           <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
//             <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
//             {resolvedCount} Resolved
//           </span>
//         </div>
//       </div>
//
//       {/* Shortest Path Planner */}
//       <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
//         <div className="flex items-center gap-2 mb-4">
//           <span className="text-base">🛣️</span>
//           <h3 className="text-sm font-bold text-slate-700">Shortest Route Finder</h3>
//           <span className="text-xs text-slate-400 font-medium">— Dijkstra's Algorithm</span>
//         </div>
//
//         <div className="flex flex-col sm:flex-row gap-3 items-end">
//           {/* FROM */}
//           <div className="flex-1">
//             <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
//               🟢 From District
//             </label>
//             <select
//               value={fromDistrict}
//               onChange={e => { setFromDistrict(e.target.value); setPathResult(null); setNoPath(false); }}
//               className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:border-blue-300 focus:outline-none transition-colors"
//             >
//               <option value="">Select origin...</option>
//               {ALL_DISTRICTS.map(d => (
//                 <option key={d} value={d} disabled={d === toDistrict}>{d}</option>
//               ))}
//             </select>
//           </div>
//
//           {/* Swap arrow */}
//           <button
//             onClick={() => { setFromDistrict(toDistrict); setToDistrict(fromDistrict); setPathResult(null); }}
//             className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 text-sm transition-colors shrink-0 mb-0"
//             title="Swap from/to"
//           >
//             ⇄
//           </button>
//
//           {/* TO */}
//           <div className="flex-1">
//             <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
//               🔴 To District
//             </label>
//             <select
//               value={toDistrict}
//               onChange={e => { setToDistrict(e.target.value); setPathResult(null); setNoPath(false); }}
//               className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:border-blue-300 focus:outline-none transition-colors"
//             >
//               <option value="">Select destination...</option>
//               {ALL_DISTRICTS.map(d => (
//                 <option key={d} value={d} disabled={d === fromDistrict}>{d}</option>
//               ))}
//             </select>
//           </div>
//
//           {/* Find button */}
//           <button
//             onClick={handleFindPath}
//             disabled={!fromDistrict || !toDistrict || fromDistrict === toDistrict}
//             className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed"
//           >
//             Find Route
//           </button>
//
//           {pathResult && (
//             <button
//               onClick={handleClearPath}
//               className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 text-sm font-medium rounded-xl transition-colors shrink-0 cursor-pointer"
//             >
//               Clear
//             </button>
//           )}
//         </div>
//
//         {/* Path result summary */}
//         {pathResult && (
//           <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
//             <div className="flex items-center justify-between flex-wrap gap-2">
//               <div className="flex items-center gap-2">
//                 <span className="text-blue-700 font-bold text-sm">Shortest Path Found</span>
//                 <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
//                   {pathResult.distanceKm} km
//                 </span>
//                 <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
//                   {pathResult.path.length} districts
//                 </span>
//               </div>
//             </div>
//             <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-slate-600">
//               {pathResult.path.map((d, i) => (
//                 <React.Fragment key={d}>
//                   <span className={`px-2 py-0.5 rounded-md font-semibold ${
//                     i === 0 ? 'bg-green-100 text-green-700' :
//                     i === pathResult.path.length - 1 ? 'bg-red-100 text-red-700' :
//                     'bg-slate-100 text-slate-600'
//                   }`}>{d}</span>
//                   {i < pathResult.path.length - 1 && (
//                     <span className="text-slate-300 font-bold">→</span>
//                   )}
//                 </React.Fragment>
//               ))}
//             </div>
//           </div>
//         )}
//
//         {noPath && (
//           <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700 font-medium">
//             ⚠️ No connected route found between {fromDistrict} and {toDistrict}.
//           </div>
//         )}
//       </div>
//
//       {/* Map */}
//       <div className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden" style={{ height }}>
//         {incidents.length === 0 && !pathResult ? (
//           <div className="flex items-center justify-center h-full bg-slate-50 text-slate-400 flex-col gap-2">
//             <span className="text-3xl">🗺️</span>
//             <p className="text-sm font-medium">No incidents declared yet.</p>
//             <p className="text-xs">Add an incident from the Crisis Registry to see it appear here.</p>
//           </div>
//         ) : (
//           <MapContainer
//             key="incident-map"
//             center={[7.8731, 80.7718]}
//             zoom={7}
//             style={{ width: '100%', height: '100%' }}
//             scrollWheelZoom
//           >
//             <TileLayer
//               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             />
//             <MapLayer
//               incidents={incidents}
//               pathResult={pathResult}
//               fromDistrict={fromDistrict}
//               toDistrict={toDistrict}
//             />
//           </MapContainer>
//         )}
//       </div>
//
//       {/* Legend */}
//       <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-6 text-xs text-slate-500">
//         <span className="font-semibold text-slate-700">Legend</span>
//         <span className="flex items-center gap-2">
//           <span className="w-3 h-3 rounded-full bg-red-600 inline-block ring-2 ring-red-300 animate-pulse" />
//           Active — blinking, red
//         </span>
//         <span className="flex items-center gap-2">
//           <span className="w-3 h-3 rounded-full bg-amber-500 inline-block ring-2 ring-amber-300 animate-pulse" />
//           Pending — blinking, amber
//         </span>
//         <span className="flex items-center gap-2">
//           <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
//           Resolved — solid green
//         </span>
//         <span className="flex items-center gap-2">
//           <span className="w-3 h-3 rounded-full bg-slate-400 inline-block" />
//           Closed — solid grey
//         </span>
//         <span className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
//           <span className="w-8 h-1 bg-blue-600 inline-block rounded" />
//           Shortest path route
//         </span>
//         <span className="ml-auto text-slate-400">Marker size = severity level</span>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  X, Users, Phone, MapPin, CheckCircle, AlertTriangle,
  XCircle, Wrench, Navigation, RotateCcw, Layers,
  ArrowRightLeft, Route, Home, ChevronRight,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type IncidentStatus = 'ACTIVE' | 'PENDING' | 'RESOLVED' | 'CLOSED';
type ShelterStatus  = 'OPEN' | 'FULL' | 'CLOSED' | 'UNDER_MAINTENANCE';

interface Incident {
  id: number;
  disasterType: string;
  district: string;
  location: string;
  severity: number;
  affectedPeople: number;
  status: IncidentStatus;
  description: string;
}

interface Shelter {
  id: number;
  shelterName: string;
  district: string;
  address?: string;
  capacity: number;
  occupancy: number;
  occupancyRate?: number;
  status: ShelterStatus;
  contactPerson?: string;
  contactPhone?: string;
}

// ─── District coordinates ─────────────────────────────────────────────────────

const DISTRICT_COORDS: Record<string, [number, number]> = {
  'Colombo':      [6.9271,  79.8612],
  'Gampaha':      [7.0917,  79.9997],
  'Kalutara':     [6.5854,  79.9607],
  'Kandy':        [7.2906,  80.6337],
  'Matale':       [7.4675,  80.6234],
  'Nuwara Eliya': [6.9497,  80.7891],
  'Galle':        [6.0535,  80.2210],
  'Matara':       [5.9549,  80.5550],
  'Hambantota':   [6.1429,  81.1212],
  'Jaffna':       [9.6615,  80.0255],
  'Kilinochchi':  [9.3803,  80.3770],
  'Mannar':       [8.9810,  79.9044],
  'Vavuniya':     [8.7514,  80.4971],
  'Mullaitivu':   [9.2671,  80.8128],
  'Trincomalee':  [8.5922,  81.2152],
  'Batticaloa':   [7.7102,  81.6924],
  'Ampara':       [7.2980,  81.6747],
  'Kurunegala':   [7.4867,  80.3647],
  'Puttalam':     [8.0362,  79.8283],
  'Anuradhapura': [8.3114,  80.4037],
  'Polonnaruwa':  [7.9403,  81.0188],
  'Badulla':      [6.9934,  81.0550],
  'Monaragala':   [6.8728,  81.3507],
  'Ratnapura':    [6.6828,  80.3992],
  'Kegalle':      [7.2513,  80.3464],
};

const ALL_DISTRICTS = Object.keys(DISTRICT_COORDS).sort();

// ─── Road graph ───────────────────────────────────────────────────────────────

const ROAD_EDGES: [string, string, number][] = [
  ['Colombo','Gampaha',35],['Colombo','Kalutara',42],['Colombo','Kegalle',75],
  ['Colombo','Ratnapura',100],['Gampaha','Kurunegala',80],['Gampaha','Puttalam',120],
  ['Kalutara','Galle',75],['Kalutara','Ratnapura',65],['Galle','Matara',45],
  ['Matara','Hambantota',60],['Hambantota','Monaragala',100],['Hambantota','Ampara',155],
  ['Ratnapura','Kegalle',55],['Ratnapura','Nuwara Eliya',90],['Ratnapura','Monaragala',130],
  ['Kegalle','Kandy',50],['Kegalle','Kurunegala',65],['Kandy','Matale',30],
  ['Kandy','Nuwara Eliya',75],['Kandy','Kurunegala',95],['Kandy','Polonnaruwa',130],
  ['Matale','Kurunegala',70],['Matale','Anuradhapura',110],['Nuwara Eliya','Badulla',75],
  ['Nuwara Eliya','Ampara',160],['Badulla','Monaragala',65],['Badulla','Ampara',95],
  ['Monaragala','Ampara',90],['Ampara','Batticaloa',65],['Batticaloa','Trincomalee',110],
  ['Batticaloa','Polonnaruwa',100],['Trincomalee','Polonnaruwa',100],
  ['Trincomalee','Anuradhapura',180],['Trincomalee','Mullaitivu',90],
  ['Polonnaruwa','Anuradhapura',100],['Anuradhapura','Vavuniya',70],
  ['Anuradhapura','Kurunegala',100],['Anuradhapura','Puttalam',130],
  ['Anuradhapura','Mannar',150],['Vavuniya','Mullaitivu',100],
  ['Vavuniya','Kilinochchi',80],['Vavuniya','Mannar',110],
  ['Kilinochchi','Mullaitivu',60],['Kilinochchi','Jaffna',70],['Mannar','Jaffna',140],
  ['Puttalam','Kurunegala',80],
];

function buildGraph(): Map<string, Map<string, number>> {
  const graph = new Map<string, Map<string, number>>();
  for (const d of ALL_DISTRICTS) graph.set(d, new Map());
  for (const [a, b, w] of ROAD_EDGES) {
    graph.get(a)!.set(b, w);
    graph.get(b)!.set(a, w);
  }
  return graph;
}

const GRAPH = buildGraph();

function dijkstra(start: string, end: string): { path: string[]; distanceKm: number } | null {
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();
  for (const d of ALL_DISTRICTS) dist.set(d, Infinity);
  dist.set(start, 0);
  prev.set(start, null);
  const queue: string[] = [...ALL_DISTRICTS];
  while (queue.length > 0) {
    queue.sort((a, b) => dist.get(a)! - dist.get(b)!);
    const u = queue.shift()!;
    if (visited.has(u)) continue;
    visited.add(u);
    if (u === end) break;
    const neighbours = GRAPH.get(u);
    if (!neighbours) continue;
    for (const [v, weight] of neighbours) {
      const alt = dist.get(u)! + weight;
      if (alt < dist.get(v)!) { dist.set(v, alt); prev.set(v, u); }
    }
  }
  if (dist.get(end) === Infinity) return null;
  const path: string[] = [];
  let cur: string | null | undefined = end;
  while (cur !== null && cur !== undefined) { path.unshift(cur); cur = prev.get(cur); }
  return { path, distanceKm: Math.round(dist.get(end)!) };
}

function haversineKm([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function nearestShelters(district: string, shelters: Shelter[], n = 3): (Shelter & { distKm: number })[] {
  const origin = DISTRICT_COORDS[district];
  if (!origin) return [];
  return shelters
      .map(s => ({ ...s, distKm: DISTRICT_COORDS[s.district] ? haversineKm(origin, DISTRICT_COORDS[s.district]) : 9999 }))
      .sort((a, b) => a.distKm - b.distKm)
      .slice(0, n);
}

function darken(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (n >> 16) - 40);
  const g = Math.max(0, ((n >> 8) & 0xff) - 40);
  const b = Math.max(0, (n & 0xff) - 40);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<IncidentStatus, { color: string; pulse: boolean; label: string; tailwind: string }> = {
  ACTIVE:   { color: '#DC2626', pulse: true,  label: 'Active',   tailwind: 'bg-red-100 text-red-700 border-red-200'     },
  PENDING:  { color: '#D97706', pulse: true,  label: 'Pending',  tailwind: 'bg-amber-100 text-amber-700 border-amber-200' },
  RESOLVED: { color: '#16A34A', pulse: false, label: 'Resolved', tailwind: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  CLOSED:   { color: '#94A3B8', pulse: false, label: 'Closed',   tailwind: 'bg-slate-100 text-slate-600 border-slate-200'   },
};

const SHELTER_STATUS_META: Record<ShelterStatus, {
  color: string; bg: string; label: string; dot: string;
  tailwindColor: string; tailwindBg: string; tailwindBorder: string;
}> = {
  OPEN:              { color: '#15803d', bg: '#f0fdf4', label: 'Open',        dot: '#16a34a', tailwindColor: 'text-emerald-700', tailwindBg: 'bg-emerald-50',  tailwindBorder: 'border-emerald-200' },
  FULL:              { color: '#b91c1c', bg: '#fef2f2', label: 'Full',        dot: '#dc2626', tailwindColor: 'text-red-700',     tailwindBg: 'bg-red-50',      tailwindBorder: 'border-red-200'     },
  UNDER_MAINTENANCE: { color: '#92400e', bg: '#fffbeb', label: 'Maintenance', dot: '#d97706', tailwindColor: 'text-amber-700',  tailwindBg: 'bg-amber-50',    tailwindBorder: 'border-amber-200'   },
  CLOSED:            { color: '#475569', bg: '#f8fafc', label: 'Closed',      dot: '#94a3b8', tailwindColor: 'text-slate-600',  tailwindBg: 'bg-slate-100',   tailwindBorder: 'border-slate-200'   },
};

const TYPE_ICON: Record<string, string> = {
  Flood: '🌊', Landslide: '⛰️', Cyclone: '🌀', Drought: '☀️',
  Fire: '🔥', Tsunami: '🌊', 'Heavy Rain': '🌧️',
};

function markerRadius(severity: number): number { return 8 + severity * 1.4; }

const OPEN_SHELTER_EVENT = 'dmc:open-shelter';

// ─── Shelter Detail Modal ─────────────────────────────────────────────────────

function ShelterDetailModal({
                              shelter, distKm, onClose,
                            }: {
  shelter: Shelter & { distKm?: number };
  distKm?: number;
  onClose: () => void;
}) {
  const meta    = SHELTER_STATUS_META[shelter.status];
  const pct     = shelter.capacity > 0 ? Math.min(100, Math.round((shelter.occupancy / shelter.capacity) * 100)) : 0;
  const avail   = shelter.capacity - shelter.occupancy;
  const barColor = pct >= 95 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-400' : 'bg-emerald-500';

  const StatusIcon =
      shelter.status === 'OPEN'              ? CheckCircle :
          shelter.status === 'FULL'              ? AlertTriangle :
              shelter.status === 'UNDER_MAINTENANCE' ? Wrench : XCircle;

  return (
      <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Sheet slides up on mobile, centered modal on desktop */}
        <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border-0 sm:border border-slate-100 overflow-hidden">

          {/* Drag handle – mobile only */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 pt-4 sm:pt-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl shrink-0">
                🏠
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-base leading-snug">{shelter.shelterName}</h2>
                <p className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                  <MapPin className="w-3 h-3" />
                  {shelter.district}{shelter.address ? ` · ${shelter.address}` : ''}
                </p>
              </div>
            </div>
            <button
                onClick={onClose}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 py-5 space-y-5">

            {/* Status + distance */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${meta.tailwindColor} ${meta.tailwindBg} ${meta.tailwindBorder}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {meta.label}
            </span>
              {(distKm !== undefined && distKm > 0) && (
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                ~{distKm} km from incident
              </span>
              )}
            </div>

            {/* Occupancy bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Occupancy
              </span>
                <span className="text-sm font-black text-slate-700 tabular-nums">{pct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                    className={`h-2.5 rounded-full transition-all duration-700 ${barColor}`}
                    style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[11px] text-slate-400">
                <span>{shelter.occupancy.toLocaleString()} displaced</span>
                <span className={`font-semibold ${avail > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {avail > 0 ? `${avail.toLocaleString()} available` : 'No space left'}
              </span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: 'Capacity',  value: shelter.capacity.toLocaleString(),  color: 'text-slate-800'   },
                { label: 'Occupied',  value: shelter.occupancy.toLocaleString(), color: 'text-slate-700'   },
                { label: 'Free beds', value: avail.toLocaleString(),             color: avail > 0 ? 'text-emerald-600' : 'text-red-500' },
              ].map(({ label, value, color }) => (
                  <div key={label} className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                    <p className={`text-xl font-black ${color} tabular-nums`}>{value}</p>
                  </div>
              ))}
            </div>

            {/* Contact info */}
            {(shelter.contactPerson || shelter.contactPhone) && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
                  {shelter.contactPerson && (
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-sm">👤</div>
                        <span className="font-semibold">{shelter.contactPerson}</span>
                      </div>
                  )}
                  {shelter.contactPhone && (
                      <a href={`tel:${shelter.contactPhone}`} className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:underline">
                        <Phone className="w-4 h-4" />
                        {shelter.contactPhone}
                      </a>
                  )}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-300 font-mono">S-ID: DMC-S{shelter.id}</span>
              <span className="text-[10px] text-slate-300">Relief Shelter Registry</span>
            </div>
          </div>
        </div>
      </div>
  );
}

// ─── Map Layer ────────────────────────────────────────────────────────────────

interface MapLayerProps {
  incidents: Incident[];
  shelters: Shelter[];
  pathResult: { path: string[]; distanceKm: number } | null;
  fromDistrict: string;
  toDistrict: string;
  nearestCount: number;
  onOpenShelter: (shelter: Shelter, distKm: number) => void;
}

function MapLayer({ incidents, shelters, pathResult, nearestCount, onOpenShelter }: MapLayerProps) {
  const map = useMap();
  const incidentLayerRef = useRef<L.LayerGroup | null>(null);
  const shelterLayerRef  = useRef<L.LayerGroup | null>(null);
  const pathLayerRef     = useRef<L.LayerGroup | null>(null);
  const styleRef         = useRef<HTMLStyleElement | null>(null);
  const onOpenShelterRef = useRef(onOpenShelter);
  useEffect(() => { onOpenShelterRef.current = onOpenShelter; }, [onOpenShelter]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { shelterId, distKm } = (e as CustomEvent<{ shelterId: number; distKm: number }>).detail;
      const found = shelters.find(s => s.id === shelterId);
      if (found) onOpenShelterRef.current(found, distKm);
    };
    document.addEventListener(OPEN_SHELTER_EVENT, handler);
    return () => document.removeEventListener(OPEN_SHELTER_EVENT, handler);
  }, [shelters]);

  useEffect(() => {
    if (!styleRef.current) {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes leaflet-pulse {
          0%   { transform: scale(1);   opacity: 0.8; }
          70%  { transform: scale(2.8); opacity: 0;   }
          100% { transform: scale(1);   opacity: 0;   }
        }
        .incident-pulse-ring {
          border-radius: 50%;
          position: absolute;
          animation: leaflet-pulse 2s ease-out infinite;
          pointer-events: none;
        }
        @keyframes dash-flow { to { stroke-dashoffset: -24; } }
        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          box-shadow: 0 4px 24px rgba(0,0,0,0.12) !important;
          border: 1px solid #f1f5f9 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          font-family: system-ui, -apple-system, sans-serif !important;
        }
        .leaflet-popup-tip-container { display: none; }
        .shelter-btn {
          width: 100%;
          text-align: left;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 12px;
          margin-bottom: 6px;
          cursor: pointer;
          display: block;
          font-family: system-ui, sans-serif;
          transition: background 0.15s, border-color 0.15s;
        }
        .shelter-btn:hover { background: #eff6ff; border-color: #bfdbfe; }
        .shelter-btn:last-child { margin-bottom: 0; }
      `;
      document.head.appendChild(style);
      styleRef.current = style;
    }
  }, []);

  function buildShelterBtnHtml(s: Shelter & { distKm: number }): string {
    const sm    = SHELTER_STATUS_META[s.status];
    const pct   = s.capacity > 0 ? Math.min(100, Math.round((s.occupancy / s.capacity) * 100)) : 0;
    const avail = s.capacity - s.occupancy;
    const barC  = pct >= 95 ? '#ef4444' : pct >= 75 ? '#f59e0b' : '#22c55e';
    return `
      <button class="shelter-btn"
        onclick="document.dispatchEvent(new CustomEvent('${OPEN_SHELTER_EVENT}',{detail:{shelterId:${s.id},distKm:${s.distKm}}}))"
      >
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <span style="font-weight:700;font-size:12px;color:#1e293b">🏠 ${s.shelterName}</span>
          <span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:99px;background:${sm.bg};color:${sm.color};border:1px solid ${sm.color}33">${sm.label}</span>
        </div>
        <div style="font-size:10px;color:#94a3b8;margin-bottom:5px">📍 ${s.district}${s.distKm > 0 ? ` · ~${s.distKm} km away` : ''}</div>
        <div style="background:#e2e8f0;border-radius:99px;height:4px;overflow:hidden;margin-bottom:3px">
          <div style="width:${pct}%;height:100%;background:${barC};border-radius:99px"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:9px;color:#94a3b8">
          <span>${pct}% · ${s.occupancy.toLocaleString()}/${s.capacity.toLocaleString()}</span>
          <span style="color:${avail>0?'#16a34a':'#dc2626'};font-weight:600">${avail>0?avail.toLocaleString()+' free':'Full'}</span>
        </div>
        <div style="margin-top:5px;font-size:9px;color:#6366f1;font-weight:700">Tap to view details →</div>
      </button>`;
  }

  // Draw incidents + shelters
  useEffect(() => {
    if (incidentLayerRef.current) incidentLayerRef.current.clearLayers();
    else incidentLayerRef.current = L.layerGroup().addTo(map);

    if (shelterLayerRef.current) shelterLayerRef.current.clearLayers();
    else shelterLayerRef.current = L.layerGroup().addTo(map);

    // Incident markers
    const byDistrict: Record<string, Incident[]> = {};
    for (const inc of incidents) {
      if (!DISTRICT_COORDS[inc.district]) continue;
      byDistrict[inc.district] = [...(byDistrict[inc.district] ?? []), inc];
    }

    for (const [district, distIncs] of Object.entries(byDistrict)) {
      const [lat, lng] = DISTRICT_COORDS[district];
      const sorted  = [...distIncs].sort((a, b) => {
        const ap = a.status === 'ACTIVE' ? 1000 : a.status === 'PENDING' ? 500 : 0;
        const bp = b.status === 'ACTIVE' ? 1000 : b.status === 'PENDING' ? 500 : 0;
        return (bp + b.severity) - (ap + a.severity);
      });
      const primary = sorted[0];
      const cfg = STATUS_CONFIG[primary.status];
      const radius = markerRadius(primary.severity);

      if (cfg.pulse) {
        const rs = radius * 2 + 16;
        L.marker([lat, lng], {
          icon: L.divIcon({
            className: '',
            html: `<div class="incident-pulse-ring" style="width:${rs}px;height:${rs}px;background:${cfg.color};margin-left:-${rs/2}px;margin-top:-${rs/2}px;"></div>`,
            iconSize: [0, 0], iconAnchor: [0, 0],
          }),
          interactive: false, zIndexOffset: -100,
        }).addTo(incidentLayerRef.current!);
      }

      const circle = L.circleMarker([lat, lng], {
        radius, fillColor: cfg.color, fillOpacity: 0.92,
        color: darken(cfg.color), weight: 2.5,
      }).addTo(incidentLayerRef.current!);

      const popupRows = distIncs.map((inc, i) => {
        const icfg  = STATUS_CONFIG[inc.status];
        const icon  = TYPE_ICON[inc.disasterType] ?? '⚠️';
        const score = inc.severity * inc.affectedPeople;
        return `
          <div style="${i > 0 ? 'border-top:1px solid #f1f5f9;margin-top:10px;padding-top:10px' : ''}">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">
              <span style="font-weight:700;font-size:13px;color:#0f172a">${icon} ${inc.disasterType}</span>
              <span style="font-size:9px;font-weight:700;padding:2px 8px;border-radius:99px;background:${icfg.color}22;color:${icfg.color}">${icfg.label}</span>
            </div>
            <div style="font-size:11px;color:#64748b;margin-bottom:8px;display:flex;align-items:center;gap:4px">
              📍 ${inc.location}
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px">
              <div style="background:#f8fafc;border-radius:8px;padding:6px;text-align:center">
                <div style="font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;margin-bottom:2px">Severity</div>
                <div style="font-size:16px;font-weight:800;color:${icfg.color}">${inc.severity}/10</div>
              </div>
              <div style="background:#f8fafc;border-radius:8px;padding:6px;text-align:center">
                <div style="font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;margin-bottom:2px">Affected</div>
                <div style="font-size:14px;font-weight:700;color:#334155">${inc.affectedPeople.toLocaleString()}</div>
              </div>
              <div style="background:#f8fafc;border-radius:8px;padding:6px;text-align:center">
                <div style="font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;margin-bottom:2px">Score</div>
                <div style="font-size:14px;font-weight:700;color:#2563eb">${score.toLocaleString()}</div>
              </div>
            </div>
            <div style="font-size:10px;color:#cbd5e1;margin-top:6px;font-family:monospace">ID: DMC-${inc.id}</div>
          </div>`;
      }).join('');

      const nearby = nearestShelters(district, shelters, nearestCount);
      const shelterHtml = nearby.length === 0
          ? `<p style="font-size:11px;color:#94a3b8;font-style:italic">No shelters registered.</p>`
          : nearby.map(s => buildShelterBtnHtml(s)).join('');

      circle.bindPopup(`
        <div style="min-width:270px;max-width:310px;padding:16px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;padding-bottom:10px;border-bottom:2px solid #f1f5f9">
            <span style="font-weight:800;font-size:15px;color:#0f172a">📌 ${district}</span>
            ${distIncs.length > 1 ? `<span style="font-size:11px;background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:99px;font-weight:700">${distIncs.length} incidents</span>` : ''}
          </div>
          ${popupRows}
          <div style="border-top:2px solid #f1f5f9;margin-top:12px;padding-top:12px">
            <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:#6366f1;margin-bottom:8px">
              🏠 Nearest relief shelters
            </div>
            ${shelterHtml}
          </div>
        </div>`, { maxWidth: 330 });

      L.marker([lat, lng], {
        icon: L.divIcon({
          className: '',
          html: `<div style="font-size:10px;font-weight:700;color:#1e293b;background:white;border:1px solid #e2e8f0;padding:2px 6px;border-radius:5px;white-space:nowrap;pointer-events:none;box-shadow:0 1px 4px rgba(0,0,0,0.08)">${district}</div>`,
          iconAnchor: [-(radius + 6), 6],
        }),
        interactive: false, zIndexOffset: 200,
      }).addTo(incidentLayerRef.current!);
    }

    // Standalone shelter markers
    const shelterByDist: Record<string, Shelter[]> = {};
    for (const s of shelters) {
      if (!DISTRICT_COORDS[s.district]) continue;
      shelterByDist[s.district] = [...(shelterByDist[s.district] ?? []), s];
    }

    for (const [district, dShelters] of Object.entries(shelterByDist)) {
      const [lat, lng] = DISTRICT_COORDS[district];
      const rep  = dShelters.find(s => s.status === 'OPEN') ?? dShelters[0];
      const meta = SHELTER_STATUS_META[rep.status];

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="width:24px;height:24px;border-radius:7px;background:${meta.bg};border:2px solid ${meta.dot};display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,0.15);position:relative;">
            🏠
            ${dShelters.length > 1 ? `<div style="position:absolute;top:-5px;right:-5px;width:14px;height:14px;background:#6366f1;color:white;border-radius:99px;font-size:8px;font-weight:800;display:flex;align-items:center;justify-content:center;border:1.5px solid white">${dShelters.length}</div>` : ''}
          </div>`,
        iconSize: [24, 24], iconAnchor: [12, 12],
      });

      const allRows = dShelters.map((s, i) => {
        const sm    = SHELTER_STATUS_META[s.status];
        const pct   = s.capacity > 0 ? Math.min(100, Math.round((s.occupancy / s.capacity) * 100)) : 0;
        const avail = s.capacity - s.occupancy;
        const barC  = pct >= 95 ? '#ef4444' : pct >= 75 ? '#f59e0b' : '#22c55e';
        return `
          <button class="shelter-btn" style="margin-top:${i > 0 ? '6px' : '0'}"
            onclick="document.dispatchEvent(new CustomEvent('${OPEN_SHELTER_EVENT}',{detail:{shelterId:${s.id},distKm:0}}))"
          >
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
              <span style="font-weight:700;font-size:12px;color:#1e293b">${s.shelterName}</span>
              <span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:99px;background:${sm.bg};color:${sm.color};border:1px solid ${sm.color}33">${sm.label}</span>
            </div>
            ${s.address ? `<div style="font-size:10px;color:#94a3b8;margin-bottom:4px">📍 ${s.address}</div>` : ''}
            <div style="background:#e2e8f0;border-radius:99px;height:4px;overflow:hidden;margin-bottom:3px">
              <div style="width:${pct}%;height:100%;background:${barC};border-radius:99px"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:9px;color:#94a3b8">
              <span>${pct}% · ${s.occupancy.toLocaleString()}/${s.capacity.toLocaleString()}</span>
              <span style="color:${avail>0?'#16a34a':'#dc2626'};font-weight:600">${avail>0?avail.toLocaleString()+' free':'Full'}</span>
            </div>
            <div style="margin-top:5px;font-size:9px;color:#6366f1;font-weight:700">Tap for full details →</div>
          </button>`;
      }).join('');

      L.marker([lat + 0.04, lng + 0.04], { icon, zIndexOffset: 300 })
          .bindPopup(`
          <div style="min-width:260px;max-width:300px;padding:16px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;padding-bottom:10px;border-bottom:2px solid #f1f5f9">
              <span style="font-size:20px">🏠</span>
              <div>
                <div style="font-weight:800;font-size:14px;color:#0f172a">${district} shelters</div>
                ${dShelters.length > 1 ? `<div style="font-size:10px;color:#6366f1;font-weight:700;margin-top:1px">${dShelters.length} facilities registered</div>` : ''}
              </div>
            </div>
            ${allRows}
          </div>`, { maxWidth: 320 })
          .addTo(shelterLayerRef.current!);
    }

    const latlngs = incidents.filter(i => DISTRICT_COORDS[i.district]).map(i => DISTRICT_COORDS[i.district] as [number, number]);
    if (latlngs.length > 0 && !pathResult) map.fitBounds(L.latLngBounds(latlngs), { padding: [48, 48], maxZoom: 10 });

    return () => { incidentLayerRef.current?.clearLayers(); shelterLayerRef.current?.clearLayers(); };
  }, [incidents, shelters, map, pathResult, nearestCount]);

  // Path layer
  useEffect(() => {
    if (pathLayerRef.current) pathLayerRef.current.clearLayers();
    else pathLayerRef.current = L.layerGroup().addTo(map);
    if (!pathResult || pathResult.path.length < 2) return;

    const latlngs = pathResult.path.filter(d => DISTRICT_COORDS[d]).map(d => DISTRICT_COORDS[d] as [number, number]);
    L.polyline(latlngs, { color: '#1d4ed8', weight: 12, opacity: 0.12 }).addTo(pathLayerRef.current!);
    L.polyline(latlngs, { color: '#2563eb', weight: 4.5, opacity: 0.9 }).addTo(pathLayerRef.current!);
    const dashed = L.polyline(latlngs, { color: '#ffffff', weight: 2, opacity: 0.9, dashArray: '8 16' }).addTo(pathLayerRef.current!);
    setTimeout(() => {
      const el = (dashed as any)._path as SVGPathElement | undefined;
      if (el) el.style.animation = 'dash-flow 0.8s linear infinite';
    }, 100);

    pathResult.path.forEach((district, idx) => {
      const coords = DISTRICT_COORDS[district];
      if (!coords) return;
      const isFrom = idx === 0;
      const isTo   = idx === pathResult.path.length - 1;
      if (isFrom || isTo) {
        L.marker(coords, {
          icon: L.divIcon({
            className: '',
            html: `<div style="width:22px;height:22px;border-radius:50%;background:${isFrom?'#16a34a':'#dc2626'};border:3px solid white;box-shadow:0 0 0 2px ${isFrom?'#16a34a':'#dc2626'},0 2px 10px rgba(0,0,0,0.3);"></div>`,
            iconSize: [22, 22], iconAnchor: [11, 11],
          }), zIndexOffset: 500,
        }).bindPopup(`<b>${isFrom ? '📍 From' : '🏁 To'}: ${district}</b>`).addTo(pathLayerRef.current!);
      } else {
        L.circleMarker(coords, { radius: 5, fillColor: '#2563eb', fillOpacity: 1, color: 'white', weight: 2 })
            .bindTooltip(district, { permanent: false, direction: 'top' })
            .addTo(pathLayerRef.current!);
      }
      L.marker(coords, {
        icon: L.divIcon({
          className: '',
          html: `<div style="font-size:9px;font-weight:800;color:white;background:#2563eb;border-radius:99px;padding:1px 6px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.2);pointer-events:none">${idx + 1}</div>`,
          iconAnchor: [0, isFrom || isTo ? 26 : 20],
        }),
        interactive: false, zIndexOffset: 600,
      }).addTo(pathLayerRef.current!);
    });

    map.fitBounds(L.latLngBounds(latlngs), { padding: [60, 60], maxZoom: 10 });
    return () => { pathLayerRef.current?.clearLayers(); };
  }, [pathResult, map]);

  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface IncidentMapProps {
  incidents?: Incident[];
  shelters?: Shelter[];
  height?: string;
}

export default function IncidentMap({ incidents = [], shelters = [], height = '520px' }: IncidentMapProps) {
  const [fromDistrict, setFromDistrict] = useState('');
  const [toDistrict,   setToDistrict]   = useState('');
  const [pathResult,   setPathResult]   = useState<{ path: string[]; distanceKm: number } | null>(null);
  const [noPath,       setNoPath]       = useState(false);
  const [nearestCount, setNearestCount] = useState(3);
  const [routePanelOpen, setRoutePanelOpen] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState<(Shelter & { distKm?: number }) | null>(null);
  const [selectedShelterDistKm, setSelectedShelterDistKm] = useState<number | undefined>();

  const handleOpenShelter = (shelter: Shelter, distKm: number) => {
    setSelectedShelter(shelter);
    setSelectedShelterDistKm(distKm > 0 ? distKm : undefined);
  };

  const activeCount      = incidents.filter(i => i.status === 'ACTIVE').length;
  const pendingCount     = incidents.filter(i => i.status === 'PENDING').length;
  const resolvedCount    = incidents.filter(i => i.status === 'RESOLVED').length;
  const shelterOpenCount = shelters.filter(s => s.status === 'OPEN').length;

  const handleFindPath = () => {
    if (!fromDistrict || !toDistrict || fromDistrict === toDistrict) return;
    const result = dijkstra(fromDistrict, toDistrict);
    if (result) { setPathResult(result); setNoPath(false); }
    else        { setPathResult(null);   setNoPath(true);  }
  };

  const handleClearPath = () => {
    setPathResult(null); setNoPath(false); setFromDistrict(''); setToDistrict('');
  };

  const handleSwap = () => {
    setFromDistrict(toDistrict); setToDistrict(fromDistrict); setPathResult(null); setNoPath(false);
  };

  return (
      <div className="space-y-4">

        {/* Shelter modal */}
        {selectedShelter && (
            <ShelterDetailModal
                shelter={selectedShelter}
                distKm={selectedShelterDistKm}
                onClose={() => setSelectedShelter(null)}
            />
        )}

        {/* ── Header ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-800">Live Incident Map</h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 ml-0 sm:ml-10.5">
                Sri Lanka · tap a marker for details & nearest shelters
              </p>
            </div>

            {/* Status pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { count: activeCount,      label: 'Active',   cls: 'bg-red-50 text-red-700 border-red-100',     dot: 'bg-red-500 animate-pulse'     },
                { count: pendingCount,     label: 'Pending',  cls: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-400 animate-pulse'  },
                { count: resolvedCount,    label: 'Resolved', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500'        },
                { count: shelterOpenCount, label: 'Shelters', cls: 'bg-indigo-50 text-indigo-700 border-indigo-100', dot: 'bg-indigo-400'            },
              ].map(({ count, label, cls, dot }) => (
                  <span key={label} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold border ${cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dot} inline-block`} />
                <span className="tabular-nums">{count}</span>
                <span className="hidden sm:inline">{label}</span>
              </span>
              ))}
            </div>
          </div>

          {/* Shelter count selector */}
          <div className="px-5 sm:px-6 py-3 border-t border-slate-50 flex items-center gap-3 flex-wrap bg-slate-50/50">
          <span className="text-xs font-semibold text-slate-500 shrink-0 flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5" /> Show nearest
          </span>
            <div className="flex gap-1.5">
              {[2, 3, 5].map(n => (
                  <button
                      key={n}
                      onClick={() => setNearestCount(n)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          nearestCount === n
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                      }`}
                  >
                    {n} shelters
                  </button>
              ))}
            </div>
            <span className="text-xs text-slate-400 hidden sm:block">per incident popup</span>
          </div>
        </div>

        {/* ── Route Finder ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Collapsible header */}
          <button
              onClick={() => setRoutePanelOpen(p => !p)}
              className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Route className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-700">Shortest Route Finder</p>
                <p className="text-xs text-slate-400 mt-0.5">Dijkstra's algorithm · road network</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {pathResult && (
                  <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                {pathResult.distanceKm} km
              </span>
              )}
              <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${routePanelOpen ? 'rotate-90' : ''}`} />
            </div>
          </button>

          {/* Expanded panel */}
          {routePanelOpen && (
              <div className="px-5 sm:px-6 pb-5 border-t border-slate-100">
                <div className="pt-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                  {/* From */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Origin district
                    </label>
                    <select
                        value={fromDistrict}
                        onChange={e => { setFromDistrict(e.target.value); setPathResult(null); setNoPath(false); }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:border-blue-300 focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="">Select origin…</option>
                      {ALL_DISTRICTS.map(d => <option key={d} value={d} disabled={d === toDistrict}>{d}</option>)}
                    </select>
                  </div>

                  {/* Swap button */}
                  <button
                      onClick={handleSwap}
                      className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-blue-200 text-slate-400 hover:text-blue-600 transition-all cursor-pointer self-end sm:self-auto"
                      title="Swap origin and destination"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>

                  {/* To */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Destination district
                    </label>
                    <select
                        value={toDistrict}
                        onChange={e => { setToDistrict(e.target.value); setPathResult(null); setNoPath(false); }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:border-blue-300 focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="">Select destination…</option>
                      {ALL_DISTRICTS.map(d => <option key={d} value={d} disabled={d === fromDistrict}>{d}</option>)}
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 sm:shrink-0">
                    <button
                        onClick={handleFindPath}
                        disabled={!fromDistrict || !toDistrict || fromDistrict === toDistrict}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Find route
                    </button>
                    {(pathResult || noPath) && (
                        <button
                            onClick={handleClearPath}
                            className="p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition-colors cursor-pointer"
                            title="Clear route"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                    )}
                  </div>
                </div>

                {/* Path result */}
                {pathResult && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <span className="font-bold text-sm text-blue-800">Route found</span>
                        <span className="text-xs bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-bold">{pathResult.distanceKm} km</span>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-0.5 rounded-full font-bold">{pathResult.path.length} districts</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        {pathResult.path.map((d, i) => (
                            <React.Fragment key={d}>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                          i === 0 ? 'bg-emerald-100 text-emerald-700' :
                              i === pathResult.path.length - 1 ? 'bg-red-100 text-red-700' :
                                  'bg-white text-slate-600 border border-slate-200'
                      }`}>{d}</span>
                              {i < pathResult.path.length - 1 && <ChevronRight className="w-3 h-3 text-blue-300 shrink-0" />}
                            </React.Fragment>
                        ))}
                      </div>
                    </div>
                )}

                {noPath && (
                    <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-amber-800 font-medium">
                        No connected road route found between <strong>{fromDistrict}</strong> and <strong>{toDistrict}</strong>.
                      </p>
                    </div>
                )}
              </div>
          )}
        </div>

        {/* ── Map ── */}
        <div className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden" style={{ height }}>
          {incidents.length === 0 && shelters.length === 0 && !pathResult ? (
              <div className="flex items-center justify-center h-full bg-slate-50 text-slate-400 flex-col gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-3xl shadow-sm">🗺️</div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-500">No incidents declared yet</p>
                  <p className="text-xs text-slate-400 mt-1">Add an incident from the Crisis Registry to see it here</p>
                </div>
              </div>
          ) : (
              <MapContainer
                  key="incident-map"
                  center={[7.8731, 80.7718]}
                  zoom={7}
                  style={{ width: '100%', height: '100%' }}
                  scrollWheelZoom
                  zoomControl={false}
              >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapLayer
                    incidents={incidents}
                    shelters={shelters}
                    pathResult={pathResult}
                    fromDistrict={fromDistrict}
                    toDistrict={toDistrict}
                    nearestCount={nearestCount}
                    onOpenShelter={handleOpenShelter}
                />
              </MapContainer>
          )}
        </div>

        {/* ── Legend ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-[11px] text-slate-500">
            <span className="font-bold text-xs text-slate-600 mr-1">Legend</span>

            <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-red-300 animate-pulse inline-block" />
            Active
          </span>
            <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-300 animate-pulse inline-block" />
            Pending
          </span>
            <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Resolved
          </span>
            <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
            Closed
          </span>

            <span className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-slate-200">
            <span className="text-base leading-none">🏠</span>
            Shelter — tap for details
          </span>
            <span className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-slate-200">
            <span className="w-7 h-1 bg-blue-600 inline-block rounded" />
            Shortest path
          </span>
            <span className="ml-auto text-slate-400 hidden md:block">Marker size = severity</span>
          </div>
        </div>
      </div>
  );
}