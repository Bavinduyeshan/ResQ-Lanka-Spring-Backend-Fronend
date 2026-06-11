import React from 'react';
import { ShieldAlert, Users, Percent, Ambulance, Home, AlertOctagon, TrendingUp, Sparkles } from 'lucide-react';

interface ResourceStats {
  total: number;
  available: number;
  assigned: number;
}

interface ShelterStats {
  totalCapacity: number;
  totalOccupancy: number;
  occupancyRatePercent: number;
}

interface DistrictStat {
  incidentCount: number;
  affectedPeople: number;
}

interface DashboardStats {
  totalIncidents: number;
  activeIncidents: number;
  pendingIncidents: number;
  highPriorityTotal: number;
  resources: ResourceStats;
  shelters: ShelterStats;
  districtAnalytics: Record<string, DistrictStat>;
}

interface DashboardViewProps {
  stats: DashboardStats | null;
  onNavigateToTab: (tabName: string) => void;
}

export default function DashboardView({ stats, onNavigateToTab }: DashboardViewProps) {
  if (!stats) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-slate-500 font-medium">Aggregating emergency command statistics...</p>
      </div>
    );
  }

  // Prepare district analytics for SVG charting
  const districts = Object.keys(stats.districtAnalytics);
  const maxIncidents = districts.length > 0 
    ? Math.max(...districts.map(d => stats.districtAnalytics[d].incidentCount)) 
    : 1;

  // Resource status percentage
  const resourceAvailPercent = stats.resources.total > 0
    ? Math.round((stats.resources.available / stats.resources.total) * 100)
    : 0;

  return (
    <div className="space-y-8" id="dashboard-view-main">
      {/* Intro Welcome banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Sri Lanka Operations Command Centre</h2>
          <p className="text-slate-500 text-sm mt-1">Real-time database state synced with national emergency operations.</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Operations: LIVE
        </div>
      </div>

      {/* Analytics Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="dashboard-metric-cards">
        {/* Total Crises */}
        <div 
          onClick={() => onNavigateToTab('incidents')}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs cursor-pointer hover:border-blue-200 hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Incidents</span>
              <p className="text-4xl font-extrabold text-slate-800">{stats.totalIncidents}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 group-hover:bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center transition-colors">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 border-t border-slate-50 pt-3">
            <span className="font-bold text-blue-600">{stats.activeIncidents} Active</span>
            <span>•</span>
            <span className="font-bold text-amber-500">{stats.pendingIncidents} Pending</span>
          </div>
        </div>

        {/* High Threat Priority */}
        <div 
          onClick={() => onNavigateToTab('priority-queue')}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs cursor-pointer hover:border-red-200 hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority Red Zones</span>
              <p className="text-4xl font-extrabold text-red-600">{stats.highPriorityTotal}</p>
            </div>
            <div className="w-10 h-10 bg-red-50 group-hover:bg-red-100 text-red-600 rounded-xl flex items-center justify-center transition-colors">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 border-t border-slate-50 pt-3">
            <span className="text-red-600 font-semibold uppercase tracking-wider">Needs Immediate Action</span>
          </div>
        </div>

        {/* Resources mobilization */}
        <div 
          onClick={() => onNavigateToTab('resources')}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs cursor-pointer hover:border-slate-200 hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mobilized Resources</span>
              <p className="text-4xl font-extrabold text-slate-800">{stats.resources.total}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center transition-colors">
              <Ambulance className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1 border-t border-slate-50 pt-3">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Availability:</span>
              <span className="font-bold">{resourceAvailPercent}% Available</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-1 rounded-full transition-all duration-500" 
                style={{ width: `${resourceAvailPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Shelters occupation rate */}
        <div 
          onClick={() => onNavigateToTab('shelters')}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shelter Occupancy</span>
              <p className="text-4xl font-extrabold text-emerald-600">{stats.shelters.occupancyRatePercent}%</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 group-hover:bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center transition-colors">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1 border-t border-slate-50 pt-3">
            <div className="flex justify-between text-xs text-slate-500">
              <span>{stats.shelters.totalOccupancy} of {stats.shelters.totalCapacity} capacity utilized</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-1 rounded-full transition-all duration-500" 
                style={{ width: `${stats.shelters.occupancyRatePercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts section with SVG custom drawing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-charts-grid">
        {/* District-wise Analytics chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 col-span-2 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <TrendingUp className="text-sky-500 w-5 h-5" /> District-wise Incident Density
            </h3>
            <span className="text-xs bg-slate-100 px-3 py-1 rounded-full font-semibold text-slate-500 uppercase">Live Count</span>
          </div>

          {districts.length === 0 ? (
            <p className="text-slate-400 text-sm py-16 text-center">No reported incidents registered.</p>
          ) : (
            <div className="space-y-4">
              {districts.map(dist => {
                const count = stats.districtAnalytics[dist].incidentCount;
                const affected = stats.districtAnalytics[dist].affectedPeople;
                const percent = Math.max(10, Math.round((count / maxIncidents) * 100));

                return (
                  <div key={dist} className="space-y-1.5">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-700 font-semibold">{dist} District</span>
                      <div className="text-xs text-slate-500 space-x-2">
                        <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-bold">{count} incident{count > 1 ? 's' : ''}</span>
                        <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-bold">{affected.toLocaleString()} affected</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-50 h-3.5 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-linear-to-r from-sky-400 to-blue-500 h-3.5 rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Resource Allocation Breakdown & Key indicators */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
              <Users className="text-indigo-500 w-5 h-5" /> Emergency Resource Saturation
            </h3>

            {/* Simulated Doughnut SVG representation of allocated vs available */}
            <div className="flex justify-center my-6">
              <svg className="w-40 h-40 transform -rotate-95" viewBox="0 0 36 36">
                {/* Background track circle */}
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Available resource circle block */}
                <path
                  className="text-indigo-500"
                  strokeDasharray={`${resourceAvailPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <circle cx="18" cy="18" r="10" fill="white" />
                <text x="18" y="20.5" className="font-bold text-slate-800 text-xs" textAnchor="middle" transform="rotate(90 18 18)" style={{ fontSize: '5px' }}>
                  {resourceAvailPercent}%
                </text>
              </svg>
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-500"></span> Available Standby</span>
                <span className="font-bold text-slate-700">{stats.resources.available} units</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Dispatched Onsite</span>
                <span className="font-bold text-slate-700">{stats.resources.assigned} units</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-300"></span> Total Reserve Capacity</span>
                <span className="font-bold text-slate-700">{stats.resources.total} units</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigateToTab('resources')}
              className="w-full text-center py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              Allocate Mobile Rescue Pods
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
