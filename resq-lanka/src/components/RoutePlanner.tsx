import React, { useState, useEffect, useCallback } from 'react';
import { Route, Navigation, MapPin, Sparkles } from 'lucide-react';

interface DijkstraResult {
  path: string[];
  distanceKm: number;
}

// All 25 Sri Lanka districts with relative geographic coordinates (viewBox 480x620)
const NODE_COORDS: Record<string, { x: number; y: number }> = {
  'Jaffna':        { x: 210, y: 28  },
  'Kilinochchi':   { x: 230, y: 68  },
  'Mannar':        { x: 128, y: 90  },
  'Vavuniya':      { x: 245, y: 108 },
  'Mullaitivu':    { x: 300, y: 78  },
  'Trincomalee':   { x: 340, y: 148 },
  'Anuradhapura':  { x: 210, y: 165 },
  'Puttalam':      { x: 120, y: 200 },
  'Kurunegala':    { x: 188, y: 238 },
  'Polonnaruwa':   { x: 305, y: 200 },
  'Batticaloa':    { x: 370, y: 255 },
  'Matale':        { x: 240, y: 268 },
  'Kandy':         { x: 218, y: 295 },
  'Kegalle':       { x: 175, y: 318 },
  'Ampara':        { x: 348, y: 310 },
  'Gampaha':       { x: 142, y: 348 },
  'Colombo':       { x: 110, y: 370 },
  'Nuwara Eliya':  { x: 255, y: 340 },
  'Badulla':       { x: 295, y: 348 },
  'Monaragala':    { x: 315, y: 388 },
  'Kalutara':      { x: 120, y: 400 },
  'Ratnapura':     { x: 188, y: 400 },
  'Galle':         { x: 145, y: 450 },
  'Matara':        { x: 195, y: 468 },
  'Hambantota':    { x: 270, y: 470 },
};

// 49 edges covering all major Sri Lanka road connections (distances in km)
const EDGES: [string, string, number][] = [
  ['Jaffna', 'Kilinochchi', 45],
  ['Jaffna', 'Mannar', 100],
  ['Kilinochchi', 'Mannar', 80],
  ['Kilinochchi', 'Vavuniya', 55],
  ['Kilinochchi', 'Mullaitivu', 60],
  ['Mullaitivu', 'Trincomalee', 115],
  ['Mullaitivu', 'Vavuniya', 80],
  ['Vavuniya', 'Anuradhapura', 55],
  ['Vavuniya', 'Trincomalee', 140],
  ['Mannar', 'Puttalam', 120],
  ['Mannar', 'Anuradhapura', 100],
  ['Anuradhapura', 'Puttalam', 90],
  ['Anuradhapura', 'Kurunegala', 95],
  ['Anuradhapura', 'Polonnaruwa', 110],
  ['Anuradhapura', 'Trincomalee', 106],
  ['Trincomalee', 'Polonnaruwa', 110],
  ['Trincomalee', 'Batticaloa', 110],
  ['Puttalam', 'Kurunegala', 75],
  ['Kurunegala', 'Matale', 65],
  ['Kurunegala', 'Kandy', 78],
  ['Kurunegala', 'Kegalle', 65],
  ['Kurunegala', 'Gampaha', 78],
  ['Polonnaruwa', 'Batticaloa', 90],
  ['Polonnaruwa', 'Matale', 75],
  ['Polonnaruwa', 'Ampara', 120],
  ['Batticaloa', 'Ampara', 50],
  ['Matale', 'Kandy', 26],
  ['Kandy', 'Nuwara Eliya', 75],
  ['Kandy', 'Kegalle', 42],
  ['Kandy', 'Badulla', 155],
  ['Kegalle', 'Gampaha', 55],
  ['Kegalle', 'Colombo', 70],
  ['Kegalle', 'Ratnapura', 55],
  ['Ampara', 'Badulla', 90],
  ['Ampara', 'Monaragala', 80],
  ['Gampaha', 'Colombo', 28],
  ['Colombo', 'Kalutara', 42],
  ['Colombo', 'Ratnapura', 101],
  ['Nuwara Eliya', 'Badulla', 95],
  ['Nuwara Eliya', 'Ratnapura', 80],
  ['Badulla', 'Monaragala', 65],
  ['Monaragala', 'Hambantota', 90],
  ['Ratnapura', 'Kalutara', 68],
  ['Ratnapura', 'Matara', 130],
  ['Ratnapura', 'Hambantota', 150],
  ['Kalutara', 'Galle', 72],
  ['Galle', 'Matara', 45],
  ['Matara', 'Hambantota', 65],
];

type Graph = Record<string, [string, number][]>;

function buildGraph(): Graph {
  const g: Graph = {};
  for (const name of Object.keys(NODE_COORDS)) g[name] = [];
  for (const [u, v, w] of EDGES) {
    g[u].push([v, w]);
    g[v].push([u, w]);
  }
  return g;
}

function dijkstra(graph: Graph, start: string, end: string): DijkstraResult | null {
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();

  for (const n of Object.keys(NODE_COORDS)) {
    dist[n] = Infinity;
    prev[n] = null;
  }
  dist[start] = 0;

  const pq: [number, string][] = [[0, start]];

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift()!;
    if (visited.has(u)) continue;
    visited.add(u);
    if (u === end) break;
    for (const [v, w] of graph[u]) {
      if (!visited.has(v) && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        prev[v] = u;
        pq.push([dist[v], v]);
      }
    }
  }

  if (dist[end] === Infinity) return null;

  const path: string[] = [];
  let cur: string | null = end;
  while (cur) {
    path.unshift(cur);
    cur = prev[cur];
  }

  return { path, distanceKm: dist[end] };
}

const GRAPH = buildGraph();
const ALL_DISTRICTS = Object.keys(NODE_COORDS).sort();

export default function RoutePlanner() {
  const [startDistrict, setStartDistrict] = useState('Colombo');
  const [destDistrict, setDestDistrict] = useState('Jaffna');
  const [result, setResult] = useState<DijkstraResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Track path edges as a Set of "A|B" strings for fast lookup
  const pathEdges = new Set<string>();
  const pathNodes = new Set<string>();
  if (result) {
    for (const n of result.path) pathNodes.add(n);
    for (let i = 0; i < result.path.length - 1; i++) {
      pathEdges.add(result.path[i] + '|' + result.path[i + 1]);
      pathEdges.add(result.path[i + 1] + '|' + result.path[i]);
    }
  }

  const isEdgeInPath = (u: string, v: string) =>
      pathEdges.has(u + '|' + v);

  const handleCalculate = useCallback(() => {
    if (startDistrict === destDistrict) {
      setErrorMessage('Start and destination must be different districts.');
      setResult(null);
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    // Simulate async (swap for real API call if needed)
    setTimeout(() => {
      const res = dijkstra(GRAPH, startDistrict, destDistrict);
      if (!res) {
        setErrorMessage('No route found between selected districts.');
        setResult(null);
      } else {
        setResult(res);
      }
      setIsLoading(false);
    }, 150);
  }, [startDistrict, destDistrict]);

  const handleStartChange = (val: string) => {
    setStartDistrict(val);
    setResult(null);
    setErrorMessage('');
  };

  const handleDestChange = (val: string) => {
    setDestDistrict(val);
    setResult(null);
    setErrorMessage('');
  };

  return (
      <div className="space-y-5" id="dijkstra-router-view">
        {/* Header */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Route className="text-blue-500 w-5 h-5" />
              Sri Lanka Route Planner
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Shortest path across all 25 districts using Dijkstra's algorithm.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Control Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-3">
                <Navigation className="w-3.5 h-3.5 text-blue-500" /> Routing
              </p>

              {errorMessage && (
                  <div className="mb-3 p-2.5 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs">
                    {errorMessage}
                  </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Start district
                  </label>
                  <select
                      value={startDistrict}
                      onChange={(e) => handleStartChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:bg-white cursor-pointer"
                  >
                    {ALL_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Destination district
                  </label>
                  <select
                      value={destDistrict}
                      onChange={(e) => handleDestChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:bg-white cursor-pointer"
                  >
                    {ALL_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <button
                    onClick={handleCalculate}
                    disabled={isLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Route className="w-4 h-4" />
                  {isLoading ? 'Calculating…' : 'Find shortest path'}
                </button>
              </div>
            </div>

            {/* Result */}
            {result && (
                <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 space-y-3">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                Optimal route
              </span>

                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Total distance</p>
                    <p className="text-3xl font-extrabold text-blue-600 leading-none mt-0.5">
                      {result.distanceKm}
                      <span className="text-sm font-normal text-slate-400 ml-1.5">km</span>
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-2 pb-1.5 border-b border-slate-100">
                      Route — {result.path.length} districts
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {result.path.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0 font-mono">
                        {idx + 1}
                      </span>
                            <span className="font-medium">{step}</span>
                            {idx < result.path.length - 1 && (
                                <span className="text-slate-300 text-xs">→</span>
                            )}
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
            )}
          </div>

          {/* Map Canvas */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 relative overflow-hidden">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-white/90 border border-slate-100 text-[9px] font-bold text-slate-400 uppercase rounded-full backdrop-blur-sm">
              <Sparkles className="text-amber-400 w-3 h-3" />
              All 25 districts · Geographic scale
            </div>

            {/* Legend */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 px-3 py-1.5 bg-white/90 border border-slate-100 rounded-full text-[9px] font-semibold uppercase tracking-wide backdrop-blur-sm">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-600 inline-block" /> Start
            </span>
              <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block" /> End
            </span>
              <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> Via
            </span>
            </div>

            <svg
                viewBox="0 0 480 520"
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
            >
              {/* Edges */}
              {EDGES.map(([u, v, w], idx) => {
                const nu = NODE_COORDS[u];
                const nv = NODE_COORDS[v];
                if (!nu || !nv) return null;
                const inPath = isEdgeInPath(u, v);
                const mx = (nu.x + nv.x) / 2;
                const my = (nu.y + nv.y) / 2;
                return (
                    <g key={idx}>
                      <line
                          x1={nu.x} y1={nu.y}
                          x2={nv.x} y2={nv.y}
                          stroke={inPath ? '#2563EB' : '#CBD5E1'}
                          strokeWidth={inPath ? 2.5 : 1}
                          strokeLinecap="round"
                      />
                      <rect
                          x={mx - 11} y={my - 6}
                          width={22} height={12}
                          rx={2}
                          fill={inPath ? '#DBEAFE' : 'white'}
                          stroke={inPath ? '#93C5FD' : '#E2E8F0'}
                          strokeWidth={0.5}
                      />
                      <text
                          x={mx} y={my + 3.5}
                          fill={inPath ? '#1D4ED8' : '#94A3B8'}
                          fontSize={7}
                          fontWeight="600"
                          textAnchor="middle"
                      >
                        {w}
                      </text>
                    </g>
                );
              })}

              {/* Nodes */}
              {Object.entries(NODE_COORDS).map(([name, { x, y }]) => {
                const isStart = name === startDistrict;
                const isDest  = name === destDistrict;
                const isVia   = pathNodes.has(name) && !isStart && !isDest;

                let outerFill   = 'white';
                let outerStroke = '#CBD5E1';
                let innerFill   = '#94A3B8';
                let strokeWidth = 1;

                if (isStart) {
                  outerFill = '#DCFCE7'; outerStroke = '#16A34A';
                  innerFill = '#16A34A'; strokeWidth = 1.5;
                } else if (isDest) {
                  outerFill = '#FEE2E2'; outerStroke = '#DC2626';
                  innerFill = '#DC2626'; strokeWidth = 1.5;
                } else if (isVia) {
                  outerFill = '#DBEAFE'; outerStroke = '#2563EB';
                  innerFill = '#2563EB'; strokeWidth = 1.2;
                }

                // Smart label placement to avoid map edges
                let tx = x, ty = y - 12, anchor: 'middle' | 'start' | 'end' = 'middle';
                if (x < 90)       { tx = x + 12; ty = y + 3; anchor = 'start'; }
                else if (x > 390) { tx = x - 12; ty = y + 3; anchor = 'end'; }
                else if (y < 45)  { ty = y + 17; }

                const fontWeight = isStart || isDest || isVia ? '600' : '400';
                const fillColor  = isStart || isDest || isVia ? '#1E293B' : '#64748B';

                return (
                    <g key={name}>
                      <circle cx={x} cy={y} r={8} fill={outerFill} stroke={outerStroke} strokeWidth={strokeWidth} />
                      <circle cx={x} cy={y} r={3} fill={innerFill} />
                      <text
                          x={tx} y={ty}
                          textAnchor={anchor}
                          fontSize={9}
                          fontWeight={fontWeight}
                          fill={fillColor}
                      >
                        {name}
                      </text>
                    </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
  );
}