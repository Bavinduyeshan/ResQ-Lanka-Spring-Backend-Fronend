import React, { useState, useCallback } from 'react';
import { Route, Navigation, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// ============================================================
// Uses OSRM public API for real road routing — no key needed.
// npm install leaflet react-leaflet
// npm install -D @types/leaflet
// ============================================================

const DISTRICT_COORDS: Record<string, [number, number]> = {
  'Colombo':       [6.9271,  79.8612],
  'Gampaha':       [7.0917,  79.9997],
  'Kalutara':      [6.5854,  79.9607],
  'Kandy':         [7.2906,  80.6337],
  'Matale':        [7.4675,  80.6234],
  'Nuwara Eliya':  [6.9497,  80.7891],
  'Galle':         [6.0535,  80.2210],
  'Matara':        [5.9549,  80.5550],
  'Hambantota':    [6.1429,  81.1212],
  'Jaffna':        [9.6615,  80.0255],
  'Kilinochchi':   [9.3803,  80.3770],
  'Mannar':        [8.9810,  79.9044],
  'Vavuniya':      [8.7514,  80.4971],
  'Mullaitivu':    [9.2671,  80.8128],
  'Trincomalee':   [8.5922,  81.2152],
  'Batticaloa':    [7.7102,  81.6924],
  'Ampara':        [7.2980,  81.6747],
  'Kurunegala':    [7.4867,  80.3647],
  'Puttalam':      [8.0362,  79.8283],
  'Anuradhapura':  [8.3114,  80.4037],
  'Polonnaruwa':   [7.9403,  81.0188],
  'Badulla':       [6.9934,  81.0550],
  'Monaragala':    [6.8728,  81.3507],
  'Ratnapura':     [6.6828,  80.3992],
  'Kegalle':       [7.2513,  80.3464],
};

const EDGES: [string, string, number][] = [
  ['Jaffna','Kilinochchi',45],['Jaffna','Mannar',100],['Kilinochchi','Mannar',80],
  ['Kilinochchi','Vavuniya',55],['Kilinochchi','Mullaitivu',60],['Mullaitivu','Trincomalee',115],
  ['Mullaitivu','Vavuniya',80],['Vavuniya','Anuradhapura',55],['Vavuniya','Trincomalee',140],
  ['Mannar','Puttalam',120],['Mannar','Anuradhapura',100],['Anuradhapura','Puttalam',90],
  ['Anuradhapura','Kurunegala',95],['Anuradhapura','Polonnaruwa',110],['Anuradhapura','Trincomalee',106],
  ['Trincomalee','Polonnaruwa',110],['Trincomalee','Batticaloa',110],['Puttalam','Kurunegala',75],
  ['Kurunegala','Matale',65],['Kurunegala','Kandy',78],['Kurunegala','Kegalle',65],
  ['Kurunegala','Gampaha',78],['Polonnaruwa','Batticaloa',90],['Polonnaruwa','Matale',75],
  ['Polonnaruwa','Ampara',120],['Batticaloa','Ampara',50],['Matale','Kandy',26],
  ['Kandy','Nuwara Eliya',75],['Kandy','Kegalle',42],['Kandy','Badulla',155],
  ['Kegalle','Gampaha',55],['Kegalle','Colombo',70],['Kegalle','Ratnapura',55],
  ['Ampara','Badulla',90],['Ampara','Monaragala',80],['Gampaha','Colombo',28],
  ['Colombo','Kalutara',42],['Colombo','Ratnapura',101],['Nuwara Eliya','Badulla',95],
  ['Nuwara Eliya','Ratnapura',80],['Badulla','Monaragala',65],['Monaragala','Hambantota',90],
  ['Ratnapura','Kalutara',68],['Ratnapura','Matara',130],['Ratnapura','Hambantota',150],
  ['Kalutara','Galle',72],['Galle','Matara',45],['Matara','Hambantota',65],
];

type Graph = Record<string, [string, number][]>;
interface DijkstraResult { path: string[]; totalKm: number; }

function buildGraph(): Graph {
  const g: Graph = {};
  for (const n of Object.keys(DISTRICT_COORDS)) g[n] = [];
  for (const [u, v, w] of EDGES) { g[u].push([v, w]); g[v].push([u, w]); }
  return g;
}

function runDijkstra(graph: Graph, start: string, end: string): DijkstraResult | null {
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();
  for (const n of Object.keys(DISTRICT_COORDS)) { dist[n] = Infinity; prev[n] = null; }
  dist[start] = 0;
  const pq: [number, string][] = [[0, start]];
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [, u] = pq.shift()!;
    if (visited.has(u)) continue;
    visited.add(u);
    if (u === end) break;
    for (const [v, w] of graph[u]) {
      if (!visited.has(v) && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w; prev[v] = u;
        pq.push([dist[v], v]);
      }
    }
  }
  if (dist[end] === Infinity) return null;
  const path: string[] = [];
  let cur: string | null = end;
  while (cur) { path.unshift(cur); cur = prev[cur]; }
  return { path, totalKm: dist[end] };
}

const GRAPH = buildGraph();
const ALL_DISTRICTS = Object.keys(DISTRICT_COORDS).sort();

// Decode Google-encoded polyline from OSRM response
function decodePolyline(encoded: string): [number, number][] {
  const coords: [number, number][] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coords.push([lat / 1e5, lng / 1e5]);
  }
  return coords;
}

// Fetch real road geometry from OSRM for the full multi-stop path
async function fetchRoadRoute(path: string[]): Promise<[number, number][]> {
  // Build coordinate string: lng,lat;lng,lat;...
  const coords = path
    .map(d => {
      const [lat, lng] = DISTRICT_COORDS[d];
      return `${lng},${lat}`;
    })
    .join(';');

  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=polyline`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('OSRM request failed');
  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes?.[0]) throw new Error('No route from OSRM');
  return decodePolyline(data.routes[0].geometry);
}

// Auto-fit map to given positions
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  React.useEffect(() => {
    if (positions.length > 1) map.fitBounds(positions, { padding: [48, 48] });
  }, [positions, map]);
  return null;
}

export default function RoutePlanner() {
  const [startDistrict, setStartDistrict] = useState('Colombo');
  const [destDistrict, setDestDistrict]   = useState('Jaffna');
  const [dijkstraResult, setDijkstraResult] = useState<DijkstraResult | null>(null);
  const [roadGeometry, setRoadGeometry]   = useState<[number, number][]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errorMsg, setErrorMsg]           = useState('');

  const handleCalculate = useCallback(async () => {
    if (startDistrict === destDistrict) {
      setErrorMsg('Start and destination must be different.');
      return;
    }
    setErrorMsg('');
    setIsCalculating(true);
    setRoadGeometry([]);
    setDijkstraResult(null);

    // Step 1: run Dijkstra to get the district path
    const res = runDijkstra(GRAPH, startDistrict, destDistrict);
    if (!res) {
      setErrorMsg('No route found.');
      setIsCalculating(false);
      return;
    }
    setDijkstraResult(res);

    // Step 2: fetch real road geometry from OSRM for that path
    try {
      const geometry = await fetchRoadRoute(res.path);
      setRoadGeometry(geometry);
    } catch {
      // Fall back to straight lines if OSRM fails
      setRoadGeometry(res.path.map(d => DISTRICT_COORDS[d]));
      setErrorMsg('Road routing unavailable — showing straight lines.');
    }

    setIsCalculating(false);
  }, [startDistrict, destDistrict]);

  const handleReset = () => {
    setDijkstraResult(null);
    setRoadGeometry([]);
    setErrorMsg('');
  };

  const pathSet = new Set(dijkstraResult?.path ?? []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Route className="text-blue-500 w-5 h-5" />
          Sri Lanka Route Planner
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Dijkstra's shortest path · real road routing via OSRM · OpenStreetMap tiles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Control Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-blue-500" /> Routing
          </p>

          {errorMsg && (
            <div className="p-2.5 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Start district
              </label>
              <select
                value={startDistrict}
                onChange={e => { setStartDistrict(e.target.value); handleReset(); }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:bg-white cursor-pointer"
              >
                {ALL_DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Destination district
              </label>
              <select
                value={destDistrict}
                onChange={e => { setDestDistrict(e.target.value); handleReset(); }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:bg-white cursor-pointer"
              >
                {ALL_DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <button
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isCalculating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Routing on real roads…</>
                : <><Route className="w-4 h-4" /> Find shortest path</>}
            </button>

            {dijkstraResult && (
              <button
                onClick={handleReset}
                className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
              >
                Reset map
              </button>
            )}
          </div>

          {/* Result */}
          {dijkstraResult && (
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 space-y-3">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                Optimal route
              </span>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Graph distance</p>
                <p className="text-3xl font-extrabold text-blue-600 leading-none mt-0.5">
                  {dijkstraResult.totalKm}
                  <span className="text-sm font-normal text-slate-400 ml-1.5">km</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-2 pb-1.5 border-b border-slate-100">
                  {dijkstraResult.path.length} stops
                </p>
                <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
                  {dijkstraResult.path.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-medium">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-auto pt-3 border-t border-slate-100 flex flex-wrap gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block" />Start</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />End</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />Via</span>
          </div>
        </div>

        {/* Leaflet Map */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-100 shadow-sm overflow-hidden" style={{ height: '580px' }}>
          <MapContainer
            center={[7.8731, 80.7718]}
            zoom={7}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Fit bounds to road geometry once loaded */}
            {roadGeometry.length > 1 && <FitBounds positions={roadGeometry} />}

            {/* Real road polyline from OSRM */}
            {roadGeometry.length > 1 && (
              <>
                {/* White outline for contrast */}
                <Polyline
                  positions={roadGeometry}
                  pathOptions={{ color: '#fff', weight: 7, opacity: 0.6 }}
                />
                {/* Blue route line */}
                <Polyline
                  positions={roadGeometry}
                  pathOptions={{ color: '#2563EB', weight: 4, opacity: 0.9 }}
                />
              </>
            )}

            {/* District markers */}
            {Object.entries(DISTRICT_COORDS).map(([name, pos]) => {
              const isStart  = name === startDistrict;
              const isDest   = name === destDistrict;
              const isVia    = pathSet.has(name) && !isStart && !isDest;
              const hasRoute = dijkstraResult !== null;

              const fillColor = isStart ? '#16A34A' : isDest ? '#DC2626' : isVia ? '#2563EB' : '#94A3B8';
              const strokeColor = isStart ? '#14532D' : isDest ? '#7F1D1D' : isVia ? '#1E3A8A' : '#64748B';
              const radius = isStart || isDest ? 11 : isVia ? 8 : 5;
              const fillOpacity = hasRoute ? (isStart || isDest || isVia ? 1 : 0.25) : 0.75;

              return (
                <CircleMarker
                  key={name}
                  center={pos}
                  radius={radius}
                  pathOptions={{ color: strokeColor, weight: isStart || isDest ? 2 : 1, fillColor, fillOpacity }}
                >
                  <Popup>
                    <strong style={{ fontSize: 13 }}>{name}</strong>
                    {isStart && <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 600 }}>Start</div>}
                    {isDest  && <div style={{ fontSize: 11, color: '#DC2626', fontWeight: 600 }}>Destination</div>}
                    {isVia   && dijkstraResult && (
                      <div style={{ fontSize: 11, color: '#2563EB' }}>
                        Stop {dijkstraResult.path.indexOf(name) + 1} of {dijkstraResult.path.length}
                      </div>
                    )}
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}