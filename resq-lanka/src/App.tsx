import { useState, useEffect } from 'react';
import {
  ShieldAlert, LogOut, Home, Route,
  BookOpen, Layers, Users, FileText, Cpu
} from 'lucide-react';
import { User, Incident, Resource, Shelter, ActionHistory, EmergencyReport } from './types';

// ─── API client ───────────────────────────────────────────────
import {
  authApi, incidentApi, resourceApi, shelterApi,
  routeApi, dashboardApi, actionApi,
  getToken, clearToken,
  DashboardStats, IncidentResponse, ResourceResponse, ShelterResponse,
} from './api';

import LandingPage from './components/LandingPage';
import AuthTerminal from './components/AuthTerminal';
import DashboardView from './components/DashboardView';
import IncidentBoard from './components/IncidentBoard';
import DsaVisualizer from './components/DsaVisualizer';
import RoutePlanner from './components/RoutePlanner';
import ResourceManagement from './components/ResourceManagement';
import SheltersManager from './components/SheltersManager';
import ReportsCentre from './components/ReportsCentre';

// ─── Shape adapters (backend → frontend types) ─────────────────
// The backend returns camelCase which already matches our types.
// These pass-throughs make intent explicit and allow future mapping.
const toIncident = (r: IncidentResponse): Incident => ({
  id: r.id,
  disasterType: r.disasterType,
  district: r.district,
  severity: r.severity,
  affectedPeople: r.affectedPeople,
  priorityScore: r.priorityScore,
  status: r.status,
  description: r.description ?? '',
  location: r.location ?? '',
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
});

const toResource = (r: ResourceResponse): Resource => ({
  id: r.id,
  name: r.name,
  type: r.type,
  status: r.status,
  district: r.district ?? '',
  quantity: r.quantity,
  assignedIncidentId: r.assignedIncidentId ?? null,
  notes: r.notes,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
});

const toShelter = (s: ShelterResponse): Shelter => ({
  id: s.id,
  shelterName: s.shelterName,
  district: s.district,
  address: s.address ?? '',
  capacity: s.capacity,
  occupancy: s.occupancy,
  status: s.status,
  contactPerson: s.contactPerson,
  contactPhone: s.contactPhone,
  createdAt: s.createdAt,
  updatedAt: s.updatedAt,
});

// ─── Dashboard shape adapter ──────────────────────────────────
// DashboardView expects a slightly different shape than the backend returns.
// We normalise here so the component stays untouched.
function adaptDashboardStats(raw: DashboardStats) {
  const assignedResources = raw.totalResources - raw.availableResources;
  const districtAnalytics: Record<string, { incidentCount: number; affectedPeople: number }> = {};

  Object.entries(raw.incidentsByDistrict ?? {}).forEach(([district, count]) => {
    districtAnalytics[district] = {
      incidentCount: Number(count),
      affectedPeople: 0, // backend doesn't return this in dashboard; we leave 0
    };
  });

  return {
    totalIncidents: raw.totalIncidents,
    activeIncidents: raw.activeIncidents,
    pendingIncidents: raw.totalIncidents - raw.activeIncidents - raw.resolvedIncidents,
    highPriorityTotal: raw.highPriorityIncidents,
    resources: {
      total: raw.totalResources,
      available: raw.availableResources,
      assigned: assignedResources,
    },
    shelters: {
      totalCapacity: raw.totalShelterCapacity,
      totalOccupancy: raw.totalShelterOccupancy,
      occupancyRatePercent: Math.round(raw.shelterOccupancyRate),
    },
    districtAnalytics,
  };
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<
      'dashboard' | 'incidents' | 'dsa' | 'routes' | 'resources' | 'shelters' | 'reports'
  >('dashboard');
  const [viewState, setViewState] = useState<'landing' | 'auth' | 'app'>('landing');

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [emergencyReportsQueue, setEmergencyReportsQueue] = useState<EmergencyReport[]>([]);
  const [heapIncidents, setHeapIncidents] = useState<Incident[]>([]);
  const [actionStack, setActionStack] = useState<ActionHistory[]>([]);

  const [isSidebarOpen] = useState(true);

  // ─── Data sync ────────────────────────────────────────────────
  const syncWorkspaceData = async () => {
    try {
      const [
        incData,
        resData,
        sheData,
        statsData,
        queueData,
        heapData,
        actionsData,
      ] = await Promise.allSettled([
        incidentApi.getAll(),
        resourceApi.getAll(),
        shelterApi.getAll(),
        dashboardApi.getStats(),
        incidentApi.getQueue(),          // FIFO queue of incidents
        incidentApi.getPriorityQueue(),  // Max-heap priority queue
        actionApi.getRecent(30),
      ]);

      if (incData.status === 'fulfilled')
        setIncidents(incData.value.map(toIncident));

      if (resData.status === 'fulfilled')
        setResources(resData.value.map(toResource));

      if (sheData.status === 'fulfilled')
        setShelters(sheData.value.map(toShelter));

      if (statsData.status === 'fulfilled')
        setDashboardStats(adaptDashboardStats(statsData.value));

      // FIFO queue — the backend returns IncidentResponse[] for /incidents/queue
      // We adapt them to EmergencyReport shape for DsaVisualizer
      if (queueData.status === 'fulfilled') {
        const adapted: EmergencyReport[] = queueData.value.map((inc) => ({
          id: String(inc.id),
          disasterType: inc.disasterType,
          district: inc.district,
          severity: inc.severity,
          affectedPeople: inc.affectedPeople,
          reporterName: inc.description?.split(' ')[0] ?? 'Unknown',
          reporterPhone: '',
          description: inc.description ?? '',
          timestamp: inc.createdAt,
        }));
        setEmergencyReportsQueue(adapted);
      }

      if (heapData.status === 'fulfilled')
        setHeapIncidents(heapData.value.map(toIncident));

      if (actionsData.status === 'fulfilled')
        setActionStack(actionsData.value as unknown as ActionHistory[]);
    } catch (err) {
      console.error('Sync error:', err);
    }
  };

  // On mount: if a token already exists, try to sync immediately
  useEffect(() => {
    if (getToken()) {
      syncWorkspaceData().then(() => {
        // Only switch to app view if we actually got data
        setViewState('app');
      });
    }
  }, []);

  useEffect(() => {
    if (viewState === 'app') {
      syncWorkspaceData();
    }
  }, [viewState]);

  // ─── Auth ─────────────────────────────────────────────────────
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setViewState('app');
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearToken();
      setCurrentUser(null);
      setViewState('landing');
    }
  };

  // ─── Incidents ────────────────────────────────────────────────
  const handleAddIncident = async (payload: any) => {
    try {
      await incidentApi.create(payload);
      await syncWorkspaceData();
    } catch (err) { console.error(err); }
  };

  const handleUpdateIncident = async (id: number, payload: any) => {
    try {
      await incidentApi.update(id, payload);
      await syncWorkspaceData();
    } catch (err) { console.error(err); }
  };

  const handleDeleteIncident = async (id: number) => {
    try {
      await incidentApi.delete(id);
      await syncWorkspaceData();
    } catch (err) { console.error(err); }
  };

  // ─── DSA operations ──────────────────────────────────────────
  const handleDequeueReport = async () => {
    try {
      const data = await incidentApi.dequeue();
      if ('id' in data) {
        alert(`SUCCESS: Dequeued incident #${(data as any).id} — ${(data as any).disasterType}`);
      } else {
        alert((data as any).message ?? 'Queue is empty');
      }
      await syncWorkspaceData();
    } catch (err: any) {
      alert(err.message || 'Queue error');
    }
  };

  const handleExtractHeapMax = async () => {
    try {
      const data = await incidentApi.extractHighestPriority();
      if ('id' in data) {
        alert(`HEAP SUCCESS: Extracted peak-priority incident #${(data as any).id}`);
      } else {
        alert((data as any).message ?? 'Heap is empty');
      }
      await syncWorkspaceData();
    } catch (err: any) {
      alert(err.message || 'Heap error');
    }
  };

  const handleTriggerUndo = async () => {
    try {
      const data = await actionApi.undoLastAction();
      if ('id' in data) {
        alert(`STACK REVERT: Action #${(data as any).id} (${(data as any).actionType}) reverted.`);
      } else {
        alert((data as any).message ?? 'Nothing to undo');
      }
      await syncWorkspaceData();
    } catch (err: any) {
      alert(err.message || 'Undo error');
    }
  };

  // ─── Resources ───────────────────────────────────────────────
  const handleAddResource = async (payload: any) => {
    try {
      await resourceApi.create(payload);
      await syncWorkspaceData();
    } catch (err) { console.error(err); }
  };

  const handleAssignResource = async (resId: number, incId: number | null) => {
    try {
      if (incId) {
        await resourceApi.assign({ resourceId: resId, incidentId: incId });
      } else {
        await resourceApi.unassign(resId);
      }
      await syncWorkspaceData();
    } catch (err) { console.error(err); }
  };

  const handleUpdateResource = async (id: number, payload: any) => {
    try {
      await resourceApi.update(id, payload);
      await syncWorkspaceData();
    } catch (err) { console.error(err); }
  };

  const handleDeleteResource = async (id: number) => {
    try {
      await resourceApi.delete(id);
      await syncWorkspaceData();
    } catch (err) { console.error(err); }
  };

  // ─── Shelters ────────────────────────────────────────────────
  const handleAddShelter = async (payload: any) => {
    try {
      await shelterApi.create(payload);
      await syncWorkspaceData();
    } catch (err) { console.error(err); }
  };

  const handleUpdateShelter = async (id: number, payload: any) => {
    try {
      // If only occupancy is being updated, use the dedicated endpoint
      if (Object.keys(payload).length === 1 && 'occupancy' in payload) {
        await shelterApi.updateOccupancy(id, payload.occupancy);
      } else {
        await shelterApi.update(id, payload);
      }
      await syncWorkspaceData();
    } catch (err) { console.error(err); }
  };

  const handleDeleteShelter = async (id: number) => {
    try {
      await shelterApi.delete(id);
      await syncWorkspaceData();
    } catch (err) { console.error(err); }
  };

  // ─── Public report submission (LandingPage) ───────────────────
  // LandingPage calls /api/reports/emergency which doesn't exist in our backend.
  // We map it to a regular incident creation so it still works.
  // The LandingPage component uses fetch directly — intercept via Vite proxy or
  // add a note to proxy /api/reports/emergency → /api/incidents on the backend.
  // No changes needed here; the proxy config in vite.config.ts handles it.

  // ─── Render ───────────────────────────────────────────────────
  return (
      <div
          className="min-h-screen bg-slate-50 font-sans flex flex-col selection:bg-blue-600 selection:text-white"
          id="main-app-container"
      >
        {/* Top Navigation */}
        <nav
            className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xs"
            id="main-navbar"
        >
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-red-600 to-blue-600 rounded-xl opacity-15 blur-xs"></div>
              <div className="relative w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-950 font-black text-base shadow-xs border border-slate-200">
                <span className="bg-gradient-to-r from-red-600 via-rose-500 to-blue-600 bg-clip-text text-transparent">RQ</span>
              </div>
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 tracking-tight text-base uppercase bg-gradient-to-r from-red-600 via-rose-600 to-blue-800 bg-clip-text text-transparent">
                ResQ Lanka
              </h1>
              <p className="text-[9px] text-slate-500 font-mono font-bold tracking-wider">
                SECURE NATIONAL DISASTER RESPONSE SHIELD
              </p>
            </div>
          </div>

          {viewState === 'landing' && (
              <div className="hidden md:flex items-center gap-6 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider bg-slate-100/80 backdrop-blur-md px-6 py-2.5 rounded-full border border-slate-200 shadow-xs">
                <a href="#hero" className="hover:text-red-600 transition-colors">Home</a>
                <a href="#raise-alert" className="hover:text-red-600 transition-colors">Raise Alert</a>
                <a href="#workflow" className="hover:text-red-600 transition-colors">How It Works</a>
                <a href="#features" className="hover:text-red-600 transition-colors">Core Modules</a>
                <a href="#sandbox" className="hover:text-red-600 transition-colors">Sandbox</a>
                <a href="#about" className="hover:text-red-600 transition-colors">About</a>
              </div>
          )}

          {viewState === 'app' && currentUser ? (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-800">{currentUser.fullName}</p>
                  <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                {currentUser.role}
              </span>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all uppercase"
                    id="btn-trigger-logout"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
          ) : (
              <div className="flex gap-4">
                {viewState === 'landing' ? (
                    <button
                        onClick={() => setViewState('auth')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors uppercase tracking-wider cursor-pointer"
                        id="btn-goto-signin"
                    >
                      Sign In
                    </button>
                ) : (
                    <button
                        onClick={() => setViewState('landing')}
                        className="px-4 py-2 hover:bg-slate-50 text-slate-600 border border-slate-200 font-medium text-xs rounded-xl transition-all uppercase tracking-wider cursor-pointer"
                        id="btn-goto-landing"
                    >
                      Public Center
                    </button>
                )}
              </div>
          )}
        </nav>

        {/* Views */}
        {viewState === 'landing' && (
            <LandingPage
                onEnterTerminal={() => setViewState('auth')}
                onNewReportSubmitted={() => {}}
            />
        )}

        {viewState === 'auth' && (
            <AuthTerminal
                onLoginSuccess={handleLoginSuccess}
                onBackToLanding={() => setViewState('landing')}
            />
        )}

        {viewState === 'app' && currentUser && (
            <div className="flex-1 flex" id="coordination-desktop-workspace">
              {/* Sidebar */}
              <aside
                  className={`w-64 bg-white border-r border-slate-100 p-5 space-y-2 shrink-0 ${isSidebarOpen ? 'block' : 'hidden'} lg:block`}
                  id="app-workspace-sidebar"
              >
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-3 mb-4">
                  Command Workspace
                </p>

                {(
                    [
                      { tab: 'dashboard', label: 'Dashboard', Icon: BookOpen },
                      { tab: 'incidents', label: 'Incidents', Icon: ShieldAlert },
                      { tab: 'dsa', label: 'Core DSA Playground', Icon: Cpu },
                      { tab: 'routes', label: 'GPS Map', Icon: Route },
                      { tab: 'resources', label: 'Resources', Icon: Users },
                      { tab: 'shelters', label: 'Relief Shelters', Icon: Home },
                      { tab: 'reports', label: 'Reports', Icon: FileText },
                    ] as const
                ).map(({ tab, label, Icon }) => (
                    <button
                        key={tab}
                        onClick={() => setCurrentTab(tab)}
                        className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors text-left cursor-pointer ${
                            currentTab === tab
                                ? 'bg-blue-50 text-blue-700 font-extrabold'
                                : 'hover:bg-slate-50 text-slate-500'
                        }`}
                    >
                      <Icon className="w-4 h-4" /> {label}
                    </button>
                ))}
              </aside>

              {/* Main content */}
              <main
                  className="flex-1 p-6 md:p-8 max-w-6xl mx-auto overflow-y-auto"
                  id="app-workspace-content"
              >
                {currentTab === 'dashboard' && (
                    <DashboardView
                        stats={dashboardStats}
                        onNavigateToTab={(tabName: any) => setCurrentTab(tabName)}
                    />
                )}

                {currentTab === 'incidents' && (
                    <IncidentBoard
                        incidents={incidents}
                        onAddIncident={handleAddIncident}
                        onUpdateIncident={handleUpdateIncident}
                        onDeleteIncident={handleDeleteIncident}
                    />
                )}

                {currentTab === 'dsa' && (
                    <DsaVisualizer
                        reportsQueue={emergencyReportsQueue}
                        heapIncidents={heapIncidents}
                        actionStack={actionStack}
                        onRefreshAll={syncWorkspaceData}
                        onDequeueReport={handleDequeueReport}
                        onExtractMaxHeap={handleExtractHeapMax}
                        onTriggerUndo={handleTriggerUndo}
                    />
                )}

                {currentTab === 'routes' && (
                    <RoutePlanner
                        incidents={incidents}
                        shelters={shelters}
                    />
                )}

                {currentTab === 'resources' && (
                    <ResourceManagement
                        resources={resources}
                        incidents={incidents}
                        onAddResource={handleAddResource}
                        onAssignResource={handleAssignResource}
                        onUpdateResource={handleUpdateResource}
                        onDeleteResource={handleDeleteResource}
                    />
                )}

                {currentTab === 'shelters' && (
                    <SheltersManager
                        shelters={shelters}
                        onAddShelter={handleAddShelter}
                        onUpdateShelter={handleUpdateShelter}
                        onDeleteShelter={handleDeleteShelter}
                    />
                )}

                {currentTab === 'reports' && (
                    <ReportsCentre
                        incidents={incidents}
                        resources={resources}
                        shelters={shelters}
                    />
                )}
              </main>
            </div>
        )}

        <footer
            className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 mt-auto"
            id="main-footer"
        >
          <p>© 2026 Sri Lanka Joint Disaster Operations &amp; Algorithms Division. All rights reserved.</p>
        </footer>
      </div>
  );
}