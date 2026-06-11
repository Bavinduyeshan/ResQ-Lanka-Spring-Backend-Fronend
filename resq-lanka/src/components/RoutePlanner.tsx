import React, { useState, useEffect } from 'react';
import { Route, Navigation, MapPin, Sparkles, RefreshCcw, HelpCircle } from 'lucide-react';

interface DijkstraResult {
  start: string;
  destination: string;
  path: string[];
  distanceKm: number;
  message: string;
}

export default function RoutePlanner() {
  const [districts, setDistricts] = useState<string[]>([]);
  const [startDistrict, setStartDistrict] = useState('Colombo');
  const [destDistrict, setDestDistrict] = useState('Badulla');
  const [routingResult, setRoutingResult] = useState<DijkstraResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Settle geographical plotting coordinates for districts to draw a gorgeous SVG network map of Sri Lanka!
  // Relative placement coordinates inside a 600x450 clean viewport box
  const nodeCoords: Record<string, { x: number; y: number; label: string }> = {
    'Jaffna': { x: 280, y: 40, label: 'JPL Jaffna' },
    'Anuradhapura': { x: 290, y: 150, label: 'ANP Central' },
    'Trincomalee': { x: 390, y: 155, label: 'TRN Port' },
    'Kurunegala': { x: 240, y: 240, label: 'KRG Hub' },
    'Batticaloa': { x: 420, y: 230, label: 'BTC Coast' },
    'Kandy': { x: 310, y: 260, label: 'KND Hills' },
    'Gampaha': { x: 190, y: 310, label: 'GMP Sector' },
    'Colombo': { x: 170, y: 340, label: 'DMC HQ Colombo' },
    'Badulla': { x: 380, y: 310, label: 'BDL Valley' },
    'Ratnapura': { x: 260, y: 350, label: 'RTP Basin' },
    'Kalutara': { x: 180, y: 380, label: 'KLT Sector' },
    'Galle': { x: 210, y: 415, label: 'GAL Port' },
    'Matara': { x: 260, y: 425, label: 'MTR South' }
  };

  // Pre-seed the connections list to draw network links
  const graphConnections = [
    { u: 'Colombo', v: 'Gampaha', w: 30 },
    { u: 'Colombo', v: 'Kalutara', w: 43 },
    { u: 'Colombo', v: 'Ratnapura', w: 101 },
    { u: 'Gampaha', v: 'Kurunegala', w: 78 },
    { u: 'Gampaha', v: 'Kandy', w: 85 },
    { u: 'Kurunegala', v: 'Anuradhapura', w: 110 },
    { u: 'Kurunegala', v: 'Kandy', w: 42 },
    { u: 'Kalutara', v: 'Galle', w: 75 },
    { u: 'Galle', v: 'Matara', w: 45 },
    { u: 'Matara', v: 'Ratnapura', w: 140 },
    { u: 'Ratnapura', v: 'Badulla', w: 120 },
    { u: 'Kandy', v: 'Badulla', w: 115 },
    { u: 'Kandy', v: 'Anuradhapura', w: 138 },
    { u: 'Anuradhapura', v: 'Jaffna', w: 196 },
    { u: 'Anuradhapura', v: 'Trincomalee', w: 106 },
    { u: 'Trincomalee', v: 'Batticaloa', w: 135 },
    { u: 'Batticaloa', v: 'Badulla', w: 125 },
    { u: 'Jaffna', v: 'Trincomalee', w: 230 }
  ];

  const fetchDistricts = async () => {
    try {
      const res = await fetch('/api/route/districts');
      if (res.ok) {
        const data = await res.json();
        setDistricts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const calculateOptimalRoute = async () => {
    if (startDistrict === destDistrict) {
      setErrorMessage('Start and Destination districts cannot be identical.');
      setRoutingResult(null);
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/route/shortest-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDistrict, destinationDistrict: destDistrict })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Dijkstra computations failed');
      }

      setRoutingResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Route planning disconnected.');
      setRoutingResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, []);

  // Check if a link is part of the computed shortest path to highlight it
  const isLinkInShortestPath = (u: string, v: string) => {
    if (!routingResult || !routingResult.path) return false;
    const path = routingResult.path;
    for (let i = 0; i < path.length - 1; i++) {
      if ((path[i] === u && path[i + 1] === v) || (path[i] === v && path[i + 1] === u)) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="space-y-6" id="dijkstra-router-view">
      {/* Search Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800 flex items-center gap-2">
            <Route className="text-blue-500 w-5.5 h-5.5" /> GPS Dijkstra Shortest Path Planner
          </h2>
          <p className="text-sm text-slate-500 mt-1">Select dispatch sectors to calculate lowest latency travel distances and route sequences.</p>
        </div>
      </div>

      {/* Selectors and Results Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selectors Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-3 flex items-center gap-2 uppercase tracking-wide">
              <Navigation className="text-blue-500 w-4 h-4" /> Routing Sectors
            </h3>

            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-200 text-xs">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Start dispatch Area *</label>
              <select
                value={startDistrict}
                onChange={(e) => setStartDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white cursor-pointer"
              >
                {districts.map(d => (
                  <option key={d} value={d}>{d} Sector</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Destination Target *</label>
              <select
                value={destDistrict}
                onChange={(e) => setDestDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white cursor-pointer"
              >
                {districts.map(d => (
                  <option key={d} value={d}>{d} Sector</option>
                ))}
              </select>
            </div>

            <button
              onClick={calculateOptimalRoute}
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              id="btn-trigger-dijkstra"
            >
              <Route className="w-4 h-4" /> {isLoading ? 'Calculating Algorithm...' : 'Compute Shortest Path'}
            </button>
          </div>

          {/* Computed Results card */}
          {routingResult && (
            <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl space-y-4 mt-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md">
                Dijkstra optimal Output
              </span>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Route Distance</span>
                <p className="text-3xl font-extrabold text-blue-600">{routingResult.distanceKm} <span className="text-base font-normal text-slate-500">kilometers</span></p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block pb-1 border-b border-slate-100">Step Sequence ({routingResult.path.length} sectors)</span>
                <div className="flex flex-col gap-2">
                  {routingResult.path.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                      {idx < routingResult.path.length - 1 && <span className="text-slate-400 font-mono">&rarr;</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Graphical Map canvas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs lg:col-span-2 relative">
          <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-400 uppercase rounded-full">
            <Sparkles className="text-amber-500 w-3 h-3" /> Topology Network Blueprint (Scale: Sri Lanka Geography)
          </div>

          <div className="flex justify-center items-center py-6">
            <svg 
              className="w-full max-w-[500px] h-[480px] bg-slate-50/50 rounded-2xl border border-slate-100" 
              viewBox="0 0 550 480"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Draw connected routes (undirected edges) */}
              {graphConnections.map((conn, idx) => {
                const uNode = nodeCoords[conn.u];
                const vNode = nodeCoords[conn.v];
                if (!uNode || !vNode) return null;

                const isOptimal = isLinkInShortestPath(conn.u, conn.v);

                return (
                  <g key={idx}>
                    <line
                      x1={uNode.x}
                      y1={uNode.y}
                      x2={vNode.x}
                      y2={vNode.y}
                      stroke={isOptimal ? '#0284c7' : '#cbd5e1'}
                      strokeWidth={isOptimal ? 4 : 1.5}
                      strokeLinecap="round"
                    />
                    {/* Tiny distance tag on line middle */}
                    <rect
                      x={(uNode.x + vNode.x) / 2 - 12}
                      y={(uNode.y + vNode.y) / 2 - 7}
                      width={24}
                      height={14}
                      rx={3}
                      fill={isOptimal ? '#e0f2fe' : 'white'}
                      stroke={isOptimal ? '#0284c7' : '#e2e8f0'}
                      strokeWidth={0.5}
                    />
                    <text
                      x={(uNode.x + vNode.x) / 2}
                      y={(uNode.y + vNode.y) / 2 + 3}
                      fill={isOptimal ? '#0369a1' : '#64748b'}
                      fontSize={8}
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {conn.w}
                    </text>
                  </g>
                );
              })}

              {/* Draw district node points */}
              {Object.keys(nodeCoords).map((name) => {
                const node = nodeCoords[name];
                const isStart = name === startDistrict;
                const isDest = name === destDistrict;
                const isStep = routingResult?.path.includes(name);

                let outerColor = 'stroke-slate-300 fill-white';
                let innerColor = 'fill-slate-400';
                
                if (isStart) {
                  outerColor = 'stroke-green-500 fill-green-50';
                  innerColor = 'fill-green-600';
                } else if (isDest) {
                  outerColor = 'stroke-red-500 fill-red-50';
                  innerColor = 'fill-red-600';
                } else if (isStep) {
                  outerColor = 'stroke-blue-500 fill-blue-50';
                  innerColor = 'fill-blue-600';
                }

                return (
                  <g key={name} className="cursor-pointer group">
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={10}
                      className={`transition-colors duration-200 stroke-2 ${outerColor}`}
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={4}
                      className={innerColor}
                    />
                    {/* Node Label tags */}
                    <rect
                      x={node.x - 35}
                      y={node.y - 25}
                      width={70}
                      height={14}
                      rx={3}
                      fill="#1e293b"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    <text
                      x={node.x}
                      y={node.y - 15}
                      textAnchor="middle"
                      fill="#1e293b"
                      fontSize={8}
                      fontWeight="bold"
                      className="drop-shadow-xs"
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
    </div>
  );
}
