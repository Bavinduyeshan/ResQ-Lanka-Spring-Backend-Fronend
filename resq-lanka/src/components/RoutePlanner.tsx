import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- Types ---
type IncidentStatus = 'ACTIVE' | 'PENDING' | 'RESOLVED' | 'CLOSED';

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

// --- GPS coordinates for every district ---
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

// --- Road adjacency graph (approximate km distances via main roads) ---
// Each entry: [districtA, districtB, distanceKm]
const ROAD_EDGES: [string, string, number][] = [
  ['Colombo',      'Gampaha',      35],
  ['Colombo',      'Kalutara',     42],
  ['Colombo',      'Kegalle',      75],
  ['Colombo',      'Ratnapura',    100],
  ['Gampaha',      'Kurunegala',   80],
  ['Gampaha',      'Puttalam',     120],
  ['Kalutara',     'Galle',        75],
  ['Kalutara',     'Ratnapura',    65],
  ['Galle',        'Matara',       45],
  ['Matara',       'Hambantota',   60],
  ['Hambantota',   'Monaragala',   100],
  ['Hambantota',   'Ampara',       155],
  ['Ratnapura',    'Kegalle',      55],
  ['Ratnapura',    'Nuwara Eliya', 90],
  ['Ratnapura',    'Monaragala',   130],
  ['Kegalle',      'Kandy',        50],
  ['Kegalle',      'Kurunegala',   65],
  ['Kandy',        'Matale',       30],
  ['Kandy',        'Nuwara Eliya', 75],
  ['Kandy',        'Kurunegala',   95],
  ['Kandy',        'Polonnaruwa',  130],
  ['Matale',       'Kurunegala',   70],
  ['Matale',       'Anuradhapura', 110],
  ['Nuwara Eliya', 'Badulla',      75],
  ['Nuwara Eliya', 'Ampara',       160],
  ['Badulla',      'Monaragala',   65],
  ['Badulla',      'Ampara',       95],
  ['Monaragala',   'Ampara',       90],
  ['Ampara',       'Batticaloa',   65],
  ['Batticaloa',   'Trincomalee',  110],
  ['Batticaloa',   'Polonnaruwa',  100],
  ['Trincomalee',  'Polonnaruwa',  100],
  ['Trincomalee',  'Anuradhapura', 180],
  ['Trincomalee',  'Mullaitivu',   90],
  ['Polonnaruwa',  'Anuradhapura', 100],
  ['Anuradhapura', 'Vavuniya',     70],
  ['Anuradhapura', 'Kurunegala',   100],
  ['Anuradhapura', 'Puttalam',     130],
  ['Anuradhapura', 'Mannar',       150],
  ['Vavuniya',     'Mullaitivu',   100],
  ['Vavuniya',     'Kilinochchi',  80],
  ['Vavuniya',     'Mannar',       110],
  ['Kilinochchi',  'Mullaitivu',   60],
  ['Kilinochchi',  'Jaffna',       70],
  ['Mannar',       'Jaffna',       140],
  ['Puttalam',     'Kurunegala',   80],
];

// Build adjacency map
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

// Dijkstra's algorithm
function dijkstra(start: string, end: string): { path: string[]; distanceKm: number } | null {
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();

  for (const d of ALL_DISTRICTS) dist.set(d, Infinity);
  dist.set(start, 0);
  prev.set(start, null);

  // Simple priority queue via sorted array (fine for 25 nodes)
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
      if (alt < dist.get(v)!) {
        dist.set(v, alt);
        prev.set(v, u);
      }
    }
  }

  if (dist.get(end) === Infinity) return null;

  // Reconstruct path
  const path: string[] = [];
  let cur: string | null | undefined = end;
  while (cur !== null && cur !== undefined) {
    path.unshift(cur);
    cur = prev.get(cur);
  }

  return { path, distanceKm: Math.round(dist.get(end)!) };
}

// --- Status config ---
const STATUS_CONFIG: Record<IncidentStatus, { color: string; pulse: boolean; label: string }> = {
  ACTIVE:   { color: '#DC2626', pulse: true,  label: 'Active'   },
  PENDING:  { color: '#D97706', pulse: true,  label: 'Pending'  },
  RESOLVED: { color: '#16A34A', pulse: false, label: 'Resolved' },
  CLOSED:   { color: '#94A3B8', pulse: false, label: 'Closed'   },
};

function markerRadius(severity: number): number {
  return 8 + severity * 1.4;
}

const TYPE_ICON: Record<string, string> = {
  Flood: '🌊', Landslide: '⛰️', Cyclone: '🌀',
  Drought: '☀️', Fire: '🔥', Tsunami: '🌊', 'Heavy Rain': '🌧️',
};

function darken(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (n >> 16) - 40);
  const g = Math.max(0, ((n >> 8) & 0xff) - 40);
  const b = Math.max(0, (n & 0xff) - 40);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// ---- Map layer: incidents + path ----
interface MapLayerProps {
  incidents: Incident[];
  pathResult: { path: string[]; distanceKm: number } | null;
  fromDistrict: string;
  toDistrict: string;
}

function MapLayer({ incidents, pathResult, fromDistrict, toDistrict }: MapLayerProps) {
  const map = useMap();
  const incidentLayerRef = useRef<L.LayerGroup | null>(null);
  const pathLayerRef = useRef<L.LayerGroup | null>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  // Inject CSS once
  useEffect(() => {
    if (!styleRef.current) {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes leaflet-pulse {
          0%   { transform: scale(1);   opacity: 1; }
          70%  { transform: scale(2.8); opacity: 0; }
          100% { transform: scale(1);   opacity: 0; }
        }
        .incident-pulse-ring {
          border-radius: 50%;
          position: absolute;
          animation: leaflet-pulse 1.8s ease-out infinite;
          pointer-events: none;
        }
        @keyframes dash-flow {
          to { stroke-dashoffset: -24; }
        }
        .path-line-animated {
          animation: dash-flow 0.6s linear infinite;
        }
      `;
      document.head.appendChild(style);
      styleRef.current = style;
    }
  }, []);

  // Draw incident markers
  useEffect(() => {
    if (incidentLayerRef.current) {
      incidentLayerRef.current.clearLayers();
    } else {
      incidentLayerRef.current = L.layerGroup().addTo(map);
    }

    const byDistrict: Record<string, Incident[]> = {};
    for (const inc of incidents) {
      if (!DISTRICT_COORDS[inc.district]) continue;
      if (!byDistrict[inc.district]) byDistrict[inc.district] = [];
      byDistrict[inc.district].push(inc);
    }

    for (const [district, distIncidents] of Object.entries(byDistrict)) {
      const [lat, lng] = DISTRICT_COORDS[district];
      const sorted = [...distIncidents].sort((a, b) => {
        const ap = a.status === 'ACTIVE' ? 1000 : a.status === 'PENDING' ? 500 : 0;
        const bp = b.status === 'ACTIVE' ? 1000 : b.status === 'PENDING' ? 500 : 0;
        return (bp + b.severity) - (ap + a.severity);
      });
      const primary = sorted[0];
      const cfg = STATUS_CONFIG[primary.status];
      const radius = markerRadius(primary.severity);

      if (cfg.pulse) {
        const ringSize = radius * 2 + 16;
        const pulseIcon = L.divIcon({
          className: '',
          html: `<div class="incident-pulse-ring" style="width:${ringSize}px;height:${ringSize}px;background:${cfg.color};opacity:0.5;margin-left:-${ringSize/2}px;margin-top:-${ringSize/2}px;"></div>`,
          iconSize: [0, 0], iconAnchor: [0, 0],
        });
        L.marker([lat, lng], { icon: pulseIcon, interactive: false, zIndexOffset: -100 })
          .addTo(incidentLayerRef.current!);
      }

      const circle = L.circleMarker([lat, lng], {
        radius, fillColor: cfg.color, fillOpacity: 0.92,
        color: darken(cfg.color), weight: 2,
      }).addTo(incidentLayerRef.current!);

      const popupRows = distIncidents.map(inc => {
        const incCfg = STATUS_CONFIG[inc.status];
        const score = inc.severity * inc.affectedPeople;
        const icon = TYPE_ICON[inc.disasterType] ?? '⚠️';
        return `<div style="border-top:1px solid #f1f5f9;padding:8px 0;${distIncidents.indexOf(inc)===0?'border-top:none;padding-top:0':''}">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <span style="font-weight:600;font-size:13px">${icon} ${inc.disasterType}</span>
            <span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:99px;background:${incCfg.color}22;color:${incCfg.color}">${inc.status}</span>
          </div>
          <div style="font-size:11px;color:#64748b;margin-bottom:2px">📍 ${inc.location}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-top:6px">
            <div style="background:#f8fafc;border-radius:6px;padding:4px 6px;text-align:center">
              <div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase">Severity</div>
              <div style="font-size:14px;font-weight:700;color:${incCfg.color}">${inc.severity}/10</div>
            </div>
            <div style="background:#f8fafc;border-radius:6px;padding:4px 6px;text-align:center">
              <div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase">Affected</div>
              <div style="font-size:13px;font-weight:700;color:#334155">${inc.affectedPeople.toLocaleString()}</div>
            </div>
            <div style="background:#f8fafc;border-radius:6px;padding:4px 6px;text-align:center">
              <div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase">Score</div>
              <div style="font-size:13px;font-weight:700;color:#2563eb">${score.toLocaleString()}</div>
            </div>
          </div>
          <div style="font-size:11px;color:#94a3b8;margin-top:6px;font-style:italic">ID: DMC-${inc.id}</div>
        </div>`;
      }).join('');

      circle.bindPopup(`
        <div style="min-width:240px;max-width:280px;font-family:system-ui,sans-serif">
          <div style="font-weight:700;font-size:14px;color:#1e293b;margin-bottom:8px;padding-bottom:8px;border-bottom:2px solid #f1f5f9">
            📌 ${district}
            ${distIncidents.length > 1 ? `<span style="font-size:11px;background:#dbeafe;color:#1d4ed8;padding:2px 7px;border-radius:99px;margin-left:6px;font-weight:600">${distIncidents.length} incidents</span>` : ''}
          </div>
          ${popupRows}
        </div>`, { maxWidth: 300 });

      const labelIcon = L.divIcon({
        className: '',
        html: `<div style="font-size:10px;font-weight:600;color:#1e293b;background:white;border:1px solid #e2e8f0;padding:1px 5px;border-radius:4px;white-space:nowrap;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,0.08);">${district}</div>`,
        iconAnchor: [-radius - 4, 6],
      });
      L.marker([lat, lng], { icon: labelIcon, interactive: false, zIndexOffset: 200 })
        .addTo(incidentLayerRef.current!);
    }

    const latlngs = incidents
      .filter(i => DISTRICT_COORDS[i.district])
      .map(i => DISTRICT_COORDS[i.district] as [number, number]);

    if (latlngs.length > 0 && !pathResult) {
      map.fitBounds(L.latLngBounds(latlngs), { padding: [48, 48], maxZoom: 10 });
    }

    return () => { incidentLayerRef.current?.clearLayers(); };
  }, [incidents, map, pathResult]);

  // Draw shortest path
  useEffect(() => {
    if (pathLayerRef.current) {
      pathLayerRef.current.clearLayers();
    } else {
      pathLayerRef.current = L.layerGroup().addTo(map);
    }

    if (!pathResult || pathResult.path.length < 2) return;

    const { path } = pathResult;
    const latlngs = path
      .filter(d => DISTRICT_COORDS[d])
      .map(d => DISTRICT_COORDS[d] as [number, number]);

    // Glow / shadow line (thicker, semi-transparent)
    L.polyline(latlngs, {
      color: '#1d4ed8',
      weight: 10,
      opacity: 0.18,
    }).addTo(pathLayerRef.current!);

    // Main solid line
    L.polyline(latlngs, {
      color: '#2563eb',
      weight: 4,
      opacity: 0.85,
    }).addTo(pathLayerRef.current!);

    // Animated dashed overlay (SVG renderer trick via className)
    const dashed = L.polyline(latlngs, {
      color: '#ffffff',
      weight: 2,
      opacity: 0.9,
      dashArray: '8 16',
    }).addTo(pathLayerRef.current!);

    // Animate the dash via direct SVG manipulation
    setTimeout(() => {
      const el = (dashed as any)._path as SVGPathElement | undefined;
      if (el) {
        el.style.animation = 'dash-flow 0.8s linear infinite';
      }
    }, 100);

    // Node markers along the path
    path.forEach((district, idx) => {
      const coords = DISTRICT_COORDS[district];
      if (!coords) return;

      const isEndpoint = idx === 0 || idx === path.length - 1;
      const isFrom = idx === 0;

      // Endpoint: larger coloured circle
      if (isEndpoint) {
        const endIcon = L.divIcon({
          className: '',
          html: `<div style="
            width:20px;height:20px;border-radius:50%;
            background:${isFrom ? '#16a34a' : '#dc2626'};
            border:3px solid white;
            box-shadow:0 0 0 2px ${isFrom ? '#16a34a' : '#dc2626'},0 2px 8px rgba(0,0,0,0.3);
            display:flex;align-items:center;justify-content:center;
            font-size:10px;
          ">${isFrom ? '🟢' : '🔴'}</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        L.marker(coords, { icon: endIcon, zIndexOffset: 500 })
          .bindPopup(`<b>${isFrom ? '📍 FROM' : '🏁 TO'}: ${district}</b>`)
          .addTo(pathLayerRef.current!);
      } else {
        // Waypoint: small white dot
        L.circleMarker(coords, {
          radius: 5,
          fillColor: '#2563eb',
          fillOpacity: 1,
          color: 'white',
          weight: 2,
        }).bindTooltip(district, { permanent: false, direction: 'top' })
          .addTo(pathLayerRef.current!);
      }

      // Step number label
      const stepIcon = L.divIcon({
        className: '',
        html: `<div style="
          font-size:9px;font-weight:800;color:white;
          background:#2563eb;border-radius:99px;
          padding:1px 5px;white-space:nowrap;
          box-shadow:0 1px 4px rgba(0,0,0,0.2);
          pointer-events:none;
        ">${idx + 1}</div>`,
        iconAnchor: [0, isEndpoint ? 24 : 18],
      });
      L.marker(coords, { icon: stepIcon, interactive: false, zIndexOffset: 600 })
        .addTo(pathLayerRef.current!);
    });

    // Fit map to path
    map.fitBounds(L.latLngBounds(latlngs), { padding: [60, 60], maxZoom: 10 });

    return () => { pathLayerRef.current?.clearLayers(); };
  }, [pathResult, map]);

  return null;
}

// ---- Main component ----
interface IncidentMapProps {
  incidents?: Incident[];
  height?: string;
}

export default function IncidentMap({ incidents = [], height = '520px' }: IncidentMapProps) {
  const [fromDistrict, setFromDistrict] = useState('');
  const [toDistrict, setToDistrict] = useState('');
  const [pathResult, setPathResult] = useState<{ path: string[]; distanceKm: number } | null>(null);
  const [noPath, setNoPath] = useState(false);

  const activeCount   = incidents.filter(i => i.status === 'ACTIVE').length;
  const pendingCount  = incidents.filter(i => i.status === 'PENDING').length;
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED').length;

  const handleFindPath = () => {
    if (!fromDistrict || !toDistrict || fromDistrict === toDistrict) return;
    const result = dijkstra(fromDistrict, toDistrict);
    if (result) {
      setPathResult(result);
      setNoPath(false);
    } else {
      setPathResult(null);
      setNoPath(true);
    }
  };

  const handleClearPath = () => {
    setPathResult(null);
    setNoPath(false);
    setFromDistrict('');
    setToDistrict('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Live Incident Map</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            All declared incidents plotted on Sri Lanka · click a marker for details
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full border border-red-100">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse inline-block" />
            {activeCount} Active
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
            {pendingCount} Pending
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            {resolvedCount} Resolved
          </span>
        </div>
      </div>

      {/* Shortest Path Planner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">🛣️</span>
          <h3 className="text-sm font-bold text-slate-700">Shortest Route Finder</h3>
          <span className="text-xs text-slate-400 font-medium">— Dijkstra's Algorithm</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-end">
          {/* FROM */}
          <div className="flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              🟢 From District
            </label>
            <select
              value={fromDistrict}
              onChange={e => { setFromDistrict(e.target.value); setPathResult(null); setNoPath(false); }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:border-blue-300 focus:outline-none transition-colors"
            >
              <option value="">Select origin...</option>
              {ALL_DISTRICTS.map(d => (
                <option key={d} value={d} disabled={d === toDistrict}>{d}</option>
              ))}
            </select>
          </div>

          {/* Swap arrow */}
          <button
            onClick={() => { setFromDistrict(toDistrict); setToDistrict(fromDistrict); setPathResult(null); }}
            className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 text-sm transition-colors shrink-0 mb-0"
            title="Swap from/to"
          >
            ⇄
          </button>

          {/* TO */}
          <div className="flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              🔴 To District
            </label>
            <select
              value={toDistrict}
              onChange={e => { setToDistrict(e.target.value); setPathResult(null); setNoPath(false); }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white focus:border-blue-300 focus:outline-none transition-colors"
            >
              <option value="">Select destination...</option>
              {ALL_DISTRICTS.map(d => (
                <option key={d} value={d} disabled={d === fromDistrict}>{d}</option>
              ))}
            </select>
          </div>

          {/* Find button */}
          <button
            onClick={handleFindPath}
            disabled={!fromDistrict || !toDistrict || fromDistrict === toDistrict}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            Find Route
          </button>

          {pathResult && (
            <button
              onClick={handleClearPath}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 text-sm font-medium rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Path result summary */}
        {pathResult && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-blue-700 font-bold text-sm">Shortest Path Found</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                  {pathResult.distanceKm} km
                </span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                  {pathResult.path.length} districts
                </span>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-slate-600">
              {pathResult.path.map((d, i) => (
                <React.Fragment key={d}>
                  <span className={`px-2 py-0.5 rounded-md font-semibold ${
                    i === 0 ? 'bg-green-100 text-green-700' :
                    i === pathResult.path.length - 1 ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>{d}</span>
                  {i < pathResult.path.length - 1 && (
                    <span className="text-slate-300 font-bold">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {noPath && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700 font-medium">
            ⚠️ No connected route found between {fromDistrict} and {toDistrict}.
          </div>
        )}
      </div>

      {/* Map */}
      <div className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden" style={{ height }}>
        {incidents.length === 0 && !pathResult ? (
          <div className="flex items-center justify-center h-full bg-slate-50 text-slate-400 flex-col gap-2">
            <span className="text-3xl">🗺️</span>
            <p className="text-sm font-medium">No incidents declared yet.</p>
            <p className="text-xs">Add an incident from the Crisis Registry to see it appear here.</p>
          </div>
        ) : (
          <MapContainer
            key="incident-map"
            center={[7.8731, 80.7718]}
            zoom={7}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapLayer
              incidents={incidents}
              pathResult={pathResult}
              fromDistrict={fromDistrict}
              toDistrict={toDistrict}
            />
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-6 text-xs text-slate-500">
        <span className="font-semibold text-slate-700">Legend</span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600 inline-block ring-2 ring-red-300 animate-pulse" />
          Active — blinking, red
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block ring-2 ring-amber-300 animate-pulse" />
          Pending — blinking, amber
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
          Resolved — solid green
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-400 inline-block" />
          Closed — solid grey
        </span>
        <span className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
          <span className="w-8 h-1 bg-blue-600 inline-block rounded" />
          Shortest path route
        </span>
        <span className="ml-auto text-slate-400">Marker size = severity level</span>
      </div>
    </div>
  );
}