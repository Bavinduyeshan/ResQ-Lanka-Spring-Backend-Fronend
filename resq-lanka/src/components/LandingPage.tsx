import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Phone, MapPin, Send, Cpu, Building, ArrowRight, Shield, 
  Zap, Search, Activity, CornerDownRight, HeartPulse, Info, HelpCircle, 
  Layers, Compass, Database, CheckCircle, Clock, Undo, Users, Network,
  AlertTriangle, Lock, LogIn, ChevronRight, BarChart3, Radio, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const disasterCommandHero = '/src/assets/images/boat.jpeg';

interface LandingPageProps {
  onEnterTerminal: () => void;
  onNewReportSubmitted: () => void;
}

const WORKFLOW_STEPS = [
  {
    num: "01",
    title: "Incident Reported",
    subtitle: "CITIZEN SIGNAL INTAKE",
    desc: "A citizen or field observer submits an emergency report with real-time district coordinates, disaster category (Flooding, Landslide, heavy cyclone), and estimated affected counts.",
    color: "from-red-500 to-rose-600",
    bgClass: "bg-red-50/50 text-red-700 border-red-200",
    icon: "ShieldAlert",
    badge: "Intake Active"
  },
  {
    num: "02",
    title: "Added to Dispatch Queue",
    subtitle: "STANDARD FIFO MEMORY STORAGE",
    desc: "Incoming signal vectors are instantaneously appended to the national crisis queue. Sequential First-In-First-Out handling guarantees zero dropped hazards or starvation of rural calls.",
    color: "from-blue-500 to-indigo-600",
    bgClass: "bg-blue-50/50 text-blue-700 border-blue-200",
    icon: "Layers",
    badge: "Order Preserved"
  },
  {
    num: "03",
    title: "Dynamic Heap Prioritization",
    subtitle: "DETERMINISTIC THREAT SORTING",
    desc: "Extreme events automatically bubble to the top of the command heap structure. High-danger index incidents instantly lock command attention, overriding standard entry sequences.",
    color: "from-rose-500 to-red-600",
    bgClass: "bg-rose-50/50 text-red-600 border-rose-200",
    icon: "Zap",
    badge: "Command Sort Active"
  },
  {
    num: "04",
    title: "Resource Allocation",
    subtitle: "LOGISTICAL ASSET COUPLING",
    desc: "The regional command core designates dedicated response units: emergency field ambulances, transport speedboats, heavy water pumps, and supply kits based on computed sector needs.",
    color: "from-indigo-500 to-blue-600",
    bgClass: "bg-indigo-50/50 text-indigo-700 border-indigo-200",
    icon: "Building",
    badge: "District Allocation"
  },
  {
    num: "05",
    title: "Route Optimization",
    subtitle: "DIJKSTRA GRAPH PATHFINDING",
    desc: "A secure shortest-path graph search calculates optimal evacuation pathways starting from local command camps, dynamically bypassing heavy rainfall overflows or landslide blockades.",
    color: "from-sky-500 to-blue-700",
    bgClass: "bg-sky-50/50 text-sky-700 border-sky-200",
    icon: "Compass",
    badge: "Route Calibrated"
  },
  {
    num: "06",
    title: "Emergency Dispatch",
    subtitle: "CRISIS CORPS DEPLOYMENT",
    desc: "Active response units (such as Suwa Seriya, Military Rescue teams) are mobilised along the computed routes, maintaining dual-channel secure handshakes with the command desks.",
    color: "from-teal-500 to-emerald-600",
    bgClass: "bg-emerald-50/50 text-teal-700 border-teal-200",
    icon: "Activity",
    badge: "Responder Grounding"
  },
  {
    num: "07",
    title: "Incident Resolution",
    subtitle: "LEDGER AUDIT RECORDING",
    desc: "When civil safety is restored, the incident is cleared and finalized. Summary statistics and dispatch latency indexes are moved into an immutable archival ledger stack for performance post-mortems.",
    color: "from-emerald-500 to-green-600",
    bgClass: "bg-emerald-50/50 text-emerald-700 border-emerald-200",
    icon: "CheckCircle",
    badge: "System Stabilised"
  }
];

const renderStepIcon = (iconName: string) => {
  switch (iconName) {
    case 'ShieldAlert': return <ShieldAlert className="w-8 h-8 md:w-10 md:h-10 text-red-600" />;
    case 'Layers': return <Layers className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />;
    case 'Zap': return <Zap className="w-8 h-8 md:w-10 md:h-10 text-red-505 text-red-500" />;
    case 'Building': return <Building className="w-8 h-8 md:w-10 md:h-10 text-indigo-600" />;
    case 'Compass': return <Compass className="w-8 h-8 md:w-10 md:h-10 text-sky-600" />;
    case 'Activity': return <Activity className="w-8 h-8 md:w-10 md:h-10 text-teal-600 animate-pulse" />;
    case 'CheckCircle': return <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-emerald-600" />;
    default: return <AlertTriangle className="w-8 h-8 md:w-10 md:h-10 text-slate-500" />;
  }
};

export default function LandingPage({ onEnterTerminal, onNewReportSubmitted }: LandingPageProps) {
  // Report Form state
  const [disasterType, setDisasterType] = useState('Flood');
  const [district, setDistrict] = useState('Colombo');
  const [severity, setSeverity] = useState(5);
  const [affectedPeople, setAffectedPeople] = useState(15);
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [description, setDescription] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Workflow slide state tracking
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0); // -1 = left, +1 = right

  const nextWorkflowStep = () => {
    setSlideDirection(1);
    setActiveStepIdx((prev) => (prev === WORKFLOW_STEPS.length - 1 ? 0 : prev + 1));
  };

  const prevWorkflowStep = () => {
    setSlideDirection(-1);
    setActiveStepIdx((prev) => (prev === 0 ? WORKFLOW_STEPS.length - 1 : prev - 1));
  };

  const selectWorkflowStep = (idx: number) => {
    setSlideDirection(idx > activeStepIdx ? 1 : -1);
    setActiveStepIdx(idx);
  };

  // Active Interactive Tab for Sandbox
  const [activeTab, setActiveTab] = useState<'simulator' | 'telemetry' | 'bases'>('simulator');

  // Dijkstra Sandbox selections
  const [simStart, setSimStart] = useState('Colombo');
  const [simDest, setSimDest] = useState('Badulla');
  const [simResult, setSimResult] = useState<{ path: string[]; distance: number } | null>(null);

  // Local Base Directory Search state
  const [selectedLookupDistrict, setSelectedLookupDistrict] = useState('Colombo');

  // Sri Lankan operational districts
  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matara', 'Galle', 
    'Jaffna', 'Trincomalee', 'Batticaloa', 'Kurunegala', 'Anuradhapura', 
    'Ratnapura', 'Badulla'
  ];

  const disasterTypes = ['Flood', 'Landslide', 'Cyclone', 'Drought', 'Fire', 'Tsunami', 'Heavy Rain'];

  // Geographical coordinates for a beautiful network visualization
  const nodeCoords: Record<string, { x: number; y: number; label: string }> = {
    'Jaffna': { x: 230, y: 35, label: 'JPL Jaffna' },
    'Anuradhapura': { x: 235, y: 120, label: 'ANP Central' },
    'Trincomalee': { x: 320, y: 125, label: 'TRN Port' },
    'Kurunegala': { x: 195, y: 195, label: 'KRG Hub' },
    'Batticaloa': { x: 345, y: 185, label: 'BTC Coast' },
    'Kandy': { x: 250, y: 210, label: 'KND Hills' },
    'Gampaha': { x: 155, y: 250, label: 'GMP Sector' },
    'Colombo': { x: 140, y: 280, label: 'DMC HQ Colombo' },
    'Badulla': { x: 310, y: 255, label: 'BDL Valley' },
    'Ratnapura': { x: 210, y: 290, label: 'RTP Basin' },
    'Kalutara': { x: 148, y: 315, label: 'KLT Sector' },
    'Galle': { x: 170, y: 345, label: 'GAL Port' },
    'Matara': { x: 210, y: 355, label: 'MTR South' }
  };

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

  // Simulating real-time telemetry stream
  const [simLogs, setSimLogs] = useState<string[]>([]);

  useEffect(() => {
    const sampleLogs = [
      '⚡ [ALERT] ResQ Lanka routing core synchronization verified. All 25 districts operational.',
      '📦 [HEAP Engine] Re-ranked emergency heap. Priority Flood Alert in Galle elevated.',
      '🚑 [DISPATCH] Suwa Seriya unit 209-A assigned to Kandy landslide quadrant.',
      '📡 [SENSORS] High precipitation registered in Ratnapura river basin. Monitoring active.',
      '🗺️ [Dijkstra] Calculated alternate evacuation path Kalutara ➔ Colombo ➔ Gampaha.',
      '🏠 [SHELTERS] Intake capacity updated: Anuradhapura Safe Hall has 250 spots active.',
      '🔒 [SECURITY] Command handshake established. Cryptographic hash verified.'
    ];

    setSimLogs([
      'ResQ Lanka Command System Initialized.',
      'Active network status: ONLINE and SECURE.'
    ]);

    const logInterval = setInterval(() => {
      const randomLog = sampleLogs[Math.floor(Math.random() * sampleLogs.length)];
      const dt = new Date();
      const timeStr = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}`;
      
      setSimLogs(prev => {
        const updated = [`[${timeStr}] ${randomLog}`, ...prev];
        return updated.slice(0, 8);
      });
    }, 4000);

    return () => clearInterval(logInterval);
  }, []);

  // Autoplay workflow slides with auto-reset upon manual selection
  useEffect(() => {
    const slideTimer = setInterval(() => {
      nextWorkflowStep();
    }, 8000);
    return () => clearInterval(slideTimer);
  }, [activeStepIdx]);

  // Dijkstra Algorithm for path calculation
  const calculateSimRoute = () => {
    if (simStart === simDest) {
      setSimResult({ path: [simStart], distance: 0 });
      return;
    }

    const graph: Record<string, Record<string, number>> = {};
    graphConnections.forEach(c => {
      if (!graph[c.u]) graph[c.u] = {};
      if (!graph[c.v]) graph[c.v] = {};
      graph[c.u][c.v] = c.w;
      graph[c.v][c.u] = c.w;
    });

    const distances: Record<string, number> = {};
    const prevs: Record<string, string | null> = {};
    const unvisited: string[] = [];

    Object.keys(nodeCoords).forEach(node => {
      distances[node] = Infinity;
      prevs[node] = null;
      unvisited.push(node);
    });
    distances[simStart] = 0;

    while (unvisited.length > 0) {
      unvisited.sort((a, b) => distances[a] - distances[b]);
      const current = unvisited.shift()!;

      if (current === simDest || distances[current] === Infinity) {
        break;
      }

      const neighbors = graph[current] || {};
      for (const n in neighbors) {
        if (unvisited.includes(n)) {
          const alternate = distances[current] + neighbors[n];
          if (alternate < distances[n]) {
            distances[n] = alternate;
            prevs[n] = current;
          }
        }
      }
    }

    if (distances[simDest] === Infinity) {
      setSimResult(null);
      return;
    }

    const path: string[] = [];
    let current: string | null = simDest;
    while (current !== null) {
      path.unshift(current);
      current = prevs[current];
    }

    setSimResult({ path, distance: distances[simDest] });
  };

  useEffect(() => {
    calculateSimRoute();
  }, [simStart, simDest]);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !reporterName || !reporterPhone) {
      setStatusMessage({ type: 'error', text: 'All mandatory fields marked with an asterisk must be filled before submission.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

    try {
      const res = await fetch(`${BASE_URL}/reports/emergency`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          disasterType,
          district,
          severity,
          affectedPeople,
          reporterName,
          reporterPhone,
          description
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to post emergency report');
      }

      setStatusMessage({
        type: 'success',
        text: 'ALERT RECEIVED SUCCESSFULLY. This report has been parsed, allocated a critical threat score, and securely enqueued into the priority dispatch engine.'
      });

      setReporterName('');
      setReporterPhone('');
      setDescription('');
      setSeverity(5);
      setAffectedPeople(15);

      onNewReportSubmitted();
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Connection interrupt. Please secure your network or dial our direct national emergency hotline: 117.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isNodeInSimPath = (nodeName: string) => {
    return simResult?.path.includes(nodeName) ?? false;
  };

  const isLineInSimPath = (u: string, v: string) => {
    if (!simResult) return false;
    const path = simResult.path;
    for (let i = 0; i < path.length - 1; i++) {
      if ((path[i] === u && path[i + 1] === v) || (path[i] === v && path[i + 1] === u)) {
        return true;
      }
    }
    return false;
  };

  const computedThreatRank = Math.round(severity * affectedPeople * 1.5);

  const getThreatRankLabel = (rank: number) => {
    if (rank < 50) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200/50', msg: 'Low Escalation Risk', label: 'ROUTINE DISPATCH' };
    if (rank < 200) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/50', msg: 'Medium Threat Level', label: 'COORDINATED RESPONSE' };
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200/50', msg: 'Critical Danger Priority', label: 'IMMEDIATE AIR & GROUND DISPATCH' };
  };

  const threatAttr = getThreatRankLabel(computedThreatRank);

  const districtResources: Record<string, { hospital: string; dmcBase: string; shelters: string; assets: string }> = {
    'Colombo': {
      hospital: 'National Hospital of Sri Lanka (NHSL), Colombo',
      dmcBase: 'DMC National Headquarters, Nelum Pokuna Rd, Colombo 07',
      shelters: 'Sugathadasa Indoor Stadium & Campbell Park Safe Shelter',
      assets: 'Heavy flood debris excavators, water rescue boats, Air Force helicopter standby'
    },
    'Kandy': {
      hospital: 'National Hospital Kandy (NHK), William Gopallawa Mawatha',
      dmcBase: 'Kandy Regional Emergency Suboffice, Getambe Ward',
      shelters: 'Trinity College relief hall & Getambe Community Center',
      assets: 'Landslide acoustic gear, mountain rescue scouts, high-altitude medical kits'
    },
    'Galle': {
      hospital: 'Karapitiya Teaching Hospital, Galle',
      dmcBase: 'Southern Province Coordination Sector, Galle Fort Complex',
      shelters: 'Galle International Stadium safe pavilions & Vidyaloka College',
      assets: 'Maritime rescue crafts, coastguard wave response corps, portable generators'
    },
    'Trincomalee': {
      hospital: 'General Hospital Trincomalee',
      dmcBase: 'East Coast Operations Hub, Trincomalee Harbor HQ',
      shelters: 'Trincomalee Town Hall shelter & St. Francis Relief Shelter',
      assets: 'Deep water diving units, naval logistics support vessels, heavy storm pumps'
    },
    'Anuradhapura': {
      hospital: 'Teaching Hospital Anuradhapura',
      dmcBase: 'North Central Drought response center, Town Sector',
      shelters: 'Anuradhapura Central College relief wings',
      assets: 'Water supply tankers, rapid agricultural logistics, mobile filtration kits'
    },
    'Badulla': {
      hospital: 'Provincial General Hospital Badulla',
      dmcBase: 'Sabaragamuwa Landslide Relief Zone Office',
      shelters: 'Badulla Central Grounds relief pavilions',
      assets: 'Terrain stabilizers, mountain medics, local transport tractors'
    },
    'Jaffna': {
      hospital: 'Teaching Hospital Jaffna, Hospital Road',
      dmcBase: 'Northern Peninsula Logistics Base, Jaffna District Secretariat',
      shelters: 'Jaffna Hindu College relief hall',
      assets: 'Storm tracking arrays, heavy debris trucks, public water dispensers'
    },
    'Ratnapura': {
      hospital: 'Provincial General Hospital Ratnapura',
      dmcBase: 'Basin Flood Monitoring Base, Kalu Ganga observation office',
      shelters: 'Ratnapura Town Hall & local temple relief wings',
      assets: 'Inflatable rescue boats, mud clearance machinery, extreme rain warning sirens'
    },
    'Batticaloa': {
      hospital: 'Batticaloa Teaching Hospital',
      dmcBase: 'Eastern Littoral Emergency Control Room, Main Street',
      shelters: 'Batticaloa Hindu College relief center',
      assets: 'Lagoon rescue speedboats, specialized medical squads, shelter drop-kits'
    },
    'Gampaha': {
      hospital: 'District General Hospital Gampaha',
      dmcBase: 'Sector Operations Sector Beta, Ja-Ela corridor',
      shelters: 'Gampaha Municipal Council safe space',
      assets: 'Debris clearing trucks, inflatable pontoons, first aid supply stocks'
    },
    'Kalutara': {
      hospital: 'District General Hospital Kalutara',
      dmcBase: 'Western Coastal Wave Observation sector, Kalutara North',
      shelters: 'Kalutara Maha Vidyalaya shelter',
      assets: 'Maritime rescue lifesavers, Suwa Seriya ambulances, fresh water containers'
    },
    'Matara': {
      hospital: 'District General Hospital Matara',
      dmcBase: 'Nilwala River flood coordination post, Matara Bypass',
      shelters: 'St. Thomas’ College relief shelter',
      assets: 'Basin warning sirens, rescue boats division, heavy dump trucks'
    }
  };

  const currentLookup = districtResources[selectedLookupDistrict] || districtResources['Colombo'];

  return (
    <div className="bg-white min-h-screen font-sans antialiased text-slate-800" id="landing-root">

      {/* PROFESSIONAL HERO SECTION */}
      <header className="relative bg-gradient-to-b from-slate-50 via-white to-blue-50/30 text-slate-800 overflow-hidden border-b border-slate-100" id="hero">
        {/* Subtle grid pattern background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-60"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 text-red-655 text-red-600 text-xs font-bold rounded-full uppercase tracking-wider">
                <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" /> Official National System
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-3.5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight" id="hero-title">
                ResQ Lanka
              </h1>

              <p className="text-red-605 text-red-600 uppercase font-bold text-xs tracking-widest font-mono">
                Smart Disaster Response & Emergency Coordination Platform
              </p>

              <p className="text-xl text-slate-755 text-slate-705 text-slate-700 leading-relaxed font-light" id="hero-subtitle">
                Empowering Emergency Response Through Intelligent Disaster Management, Resource Coordination, and Real-Time Incident Tracking.
              </p>

              <p className="text-sm text-slate-555 text-slate-500 leading-relaxed font-normal max-w-xl" id="hero-description">
                ResQ Lanka is a comprehensive disaster response platform designed to support emergency coordination, incident management, shelter allocation, resource deployment, and rescue route optimization across Sri Lanka.
              </p>

              <div className="flex flex-wrap gap-4 pt-4" id="hero-actions">
                <button
                  onClick={onEnterTerminal}
                  className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-md shadow-red-600/10 active:scale-95 inline-flex items-center gap-2 cursor-pointer animate-pulse"
                  id="btn-get-started"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#raise-alert"
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all inline-flex items-center gap-2 shadow-md hover:text-white"
                  id="btn-raise-alert-hero"
                >
                  Raise Alert
                </a>
                <a
                  href="#about"
                  className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border border-slate-200 inline-flex items-center gap-1 hover:text-slate-900"
                  id="btn-learn-more"
                >
                  Learn More
                </a>
              </div>
            </motion.div>

            {/* Dashboard-style Hero Image visualization */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, x: 25 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
              className="lg:col-span-5 w-full"
            >
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-white p-2.5">
                <div className="absolute top-2 left-4 text-[9px] text-slate-500 font-mono flex items-center gap-1.5 uppercase">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping inline-block"></span>
                  Live Vector Overlay
                </div>

                <div className="rounded-xl overflow-hidden bg-slate-100 aspect-[4/3] relative">
                  <img
                    src={disasterCommandHero}
                    alt="Modern emergency response dashboard with disaster management visualization."
                    className="w-full h-full object-cover opacity-95 hover:opacity-100 transition-opacity duration-500 select-none"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-200/40 via-transparent to-transparent pointer-events-none"></div>

                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-lg border border-slate-200 text-left shadow-md">
                    <p className="text-[10px] text-red-600 font-extrabold uppercase tracking-wider">COMMAND SIMULATOR ACTIVE</p>
                    <p className="text-[11px] text-slate-905 text-slate-800 font-medium mt-0.5">Automated Multi-sector Triage Priority Engine</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </header>

      {/* LIVE PLATFORM STATISTICS */}
      <section className="bg-slate-50 border-y border-slate-100 py-10" id="live-stats">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

            <div className="text-center md:text-left space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold block">CONNECTED HUBS</span>
              <p className="text-3xl font-black text-blue-900 font-mono tracking-tight" id="stat-districts">25 Districts</p>
              <span className="text-xs text-slate-550 block">National coverage integrated</span>
            </div>

            <div className="text-center md:text-left space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold block">STANDBY RESOURCES</span>
              <p className="text-3xl font-black text-red-650 font-mono tracking-tight text-red-600" id="stat-resources">100+ Assets</p>
              <span className="text-xs text-slate-550 block">Emergency services on-demand</span>
            </div>

            <div className="text-center md:text-left space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold block">EMERGENCY SHELTERS</span>
              <p className="text-3xl font-black text-blue-900 font-mono tracking-tight" id="stat-shelters">50+ Safe Zones</p>
              <span className="text-xs text-slate-550 block">Capacity logged in real-time</span>
            </div>

            <div className="text-center md:text-left space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold block">GRID RESILIENCE</span>
              <p className="text-3xl font-black text-emerald-600 font-mono tracking-tight" id="stat-monitoring">24/7 Live</p>
              <span className="text-xs text-slate-550 block">Active incident routing shield</span>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURED ACTION SECTION: INTENSIVE INCIDENT ENTAKER */}
      <section className="py-20 bg-white" id="raise-alert">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden text-left" id="distress-action-box">

            <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-850 text-white px-6 py-10 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-800 text-white text-[10px] font-extrabold uppercase rounded border border-red-500/30">
                  🚨 High Alert Dispatch Intake
                </div>
                <h2 className="text-2xl md:text-3.5xl font-black tracking-tight font-display text-white">
                  Raise Regional Disaster Distress Alert
                </h2>
                <p className="text-sm text-red-100 max-w-3xl leading-relaxed">
                  Submit an incident notification to report floods, landslides, cyclones, fires, accidents, or other emergencies.
                  This alert is deposited into the master FIFO Dispatch Intake Grid to maintain sequence integrity and ensure fair, orderly processing of incoming emergency requests.
                </p>
              </div>
            </div>

            <div className="p-6 md:p-10">

              {statusMessage && (
                <div className={`p-4 rounded-xl mb-6 text-xs font-sans border flex flex-col gap-1.5 ${
                  statusMessage.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-850' 
                    : 'bg-red-50 border-red-200 text-red-850'
                }`} id="status-notification-gateway">
                  <div className="flex items-center gap-1.5 font-extrabold">
                    {statusMessage.type === 'success' ? (
                      <span className="px-2 py-0.5 bg-emerald-100 rounded text-emerald-750 text-[10px] uppercase font-mono">INTAKE ACKNOWLEDGED</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-red-100 rounded text-red-700 text-[10px] uppercase font-mono">INTAKE DESYNC ERROR</span>
                    )}
                  </div>
                  <p className="font-medium text-slate-700 leading-relaxed">{statusMessage.text}</p>
                </div>
              )}

              <form onSubmit={handleSubmitReport} className="grid grid-cols-1 md:grid-cols-2 gap-8" id="citizen-intake-form">

                {/* Left fields */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Incident Type *
                    </label>
                    <select
                      value={disasterType}
                      onChange={(e) => setDisasterType(e.target.value)}
                      className="w-full text-xs font-semibold px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white focus:border-red-650 transition-colors"
                      id="select-disaster-category"
                    >
                      {disasterTypes.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      District Selection *
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full text-xs font-semibold px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white focus:border-red-650 transition-colors"
                      id="select-district-category"
                    >
                      {districts.map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                      <span>Severity Level</span>
                      <span className="font-mono text-red-600 font-extrabold">{severity} / 10</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={severity}
                      onChange={(e) => setSeverity(parseInt(e.target.value, 10) || 1)}
                      className="w-full accent-red-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      id="input-severity-range"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Affected Population *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={affectedPeople}
                      onChange={(e) => setAffectedPeople(parseInt(e.target.value, 10) || 1)}
                      className="w-full text-xs font-semibold px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white focus:border-red-650 transition-colors"
                      id="input-affected-people"
                    />
                  </div>

                </div>

                {/* Right fields */}
                <div className="space-y-5 flex flex-col justify-between">
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Reporter Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Contact person"
                          value={reporterName}
                          onChange={(e) => setReporterName(e.target.value)}
                          className="w-full text-xs font-semibold px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white focus:border-red-650 transition-colors"
                          id="input-reporter-name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact Mobile *</label>
                        <input
                          type="tel"
                          required
                          placeholder="Phone number"
                          value={reporterPhone}
                          onChange={(e) => setReporterPhone(e.target.value)}
                          className="w-full text-xs font-semibold px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white focus:border-red-650 transition-colors"
                          id="input-reporter-phone"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Emergency Indicators Description *</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Provide details about structural damage, immediate requirements, status of evacuation roads, etc."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full text-xs font-semibold px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white focus:border-red-650 transition-colors resize-none"
                        id="text-disaster-desc"
                      ></textarea>
                    </div>
                  </div>

                  {/* Calculated Heap Assessment and Quick Submission */}
                  <div className="space-y-4 pt-2">
                    <div className={`p-3.5 rounded-lg border text-xs flex items-center justify-between ${threatAttr.bg} ${threatAttr.text} ${threatAttr.border}`}>
                      <div>
                        <span className="font-bold uppercase tracking-wider block text-[10px]">HEAP-BASED STATUS</span>
                        <span className="font-semibold">{threatAttr.msg}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase block opacity-70">PRIORITY</span>
                        <span className="text-sm font-black font-mono">{computedThreatRank} pt</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-lg transition-all hover:shadow-lg hover:shadow-red-500/15 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                      id="btn-submit-alert"
                    >
                      <Send className="w-4 h-4" /> {isSubmitting ? 'ENQUEUING INCIDENT...' : 'Quick Alert Submission'}
                    </button>
                  </div>

                </div>

              </form>

            </div>

          </div>
        </div>
      </section>

      {/* SYSTEM WORKFLOW SECTION WITH VISUALLY AFFECTING CARD SLIDER */}
      <section className="py-20 bg-slate-50 border-y border-slate-100" id="workflow">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <div className="max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest block font-mono">SEQUENTIAL CRISIS PROCESSING</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight" id="workflow-title">
              How ResQ Lanka Works
            </h2>
            <div className="w-16 h-1.5 bg-red-600 mx-auto rounded-full"></div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Explore our automated computational pipeline that processes disaster signals from intake up to secure medical and field deployments.
            </p>
          </div>

          {/* Interactive Responsive Top Navigation Track */}
          <div className="mb-10 overflow-x-auto pb-4 scrollbar-thin">
            <div className="flex md:grid md:grid-cols-7 gap-2 min-w-[700px] px-2">
              {WORKFLOW_STEPS.map((step, idx) => {
                const isActive = idx === activeStepIdx;
                return (
                  <button
                    key={step.num}
                    onClick={() => selectWorkflowStep(idx)}
                    className={`flex-1 py-3.5 px-3 rounded-xl border transition-all text-center flex flex-col justify-between items-center gap-1.5 cursor-pointer select-none ${
                      isActive 
                        ? 'bg-white border-red-600 text-red-600 shadow-sm font-black scale-[1.03]' 
                        : 'bg-white/60 border-slate-200 hover:bg-white text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                        isActive ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {step.num}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold tracking-tight uppercase line-clamp-1">{step.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Animated Slide Container */}
          <div className="relative max-w-4xl mx-auto overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-lg p-6 md:p-10 flex flex-col justify-between min-h-[380px] text-left">

            {/* Slide decoration lines */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-red-500 via-rose-500 to-blue-600"></div>

            {/* Slider arrows */}
            <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
              <button
                onClick={prevWorkflowStep}
                className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-55 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Previous step"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextWorkflowStep}
                className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-55 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Next step"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Slide animation handler */}
            <div className="relative">
              <AnimatePresence mode="wait" custom={slideDirection}>
                <motion.div
                  key={activeStepIdx}
                  custom={slideDirection}
                  initial={{ opacity: 0, x: slideDirection * 150 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -slideDirection * 150 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
                >

                  {/* Left Column: Huge visual indicator */}
                  <div className="md:col-span-4 flex flex-col justify-center items-center md:items-start text-center md:text-left space-y-4">
                    <div className="relative flex items-center justify-center">
                      {/* Ambient background pulsing rings */}
                      <span className="absolute inset-0 rounded-full bg-red-100/40 blur-md scale-150 animate-pulse"></span>
                      <div className="relative w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
                        {renderStepIcon(WORKFLOW_STEPS[activeStepIdx].icon)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 font-mono tracking-widest block">SYSTEM METRIC</span>
                      <span className="text-6xl font-black text-slate-900 tracking-tighter leading-none animate-pulse">
                        {WORKFLOW_STEPS[activeStepIdx].num}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Detailed parameters */}
                  <div className="md:col-span-8 space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-red-50 text-red-600 font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider border border-red-200/50">
                          {WORKFLOW_STEPS[activeStepIdx].badge}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold tracking-widest font-mono uppercase">
                          {WORKFLOW_STEPS[activeStepIdx].subtitle}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                        {WORKFLOW_STEPS[activeStepIdx].title}
                      </h3>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed font-light">
                      {WORKFLOW_STEPS[activeStepIdx].desc}
                    </p>

                    <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0 animate-ping"></div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Dynamic Operations Flow</span>
                        <p className="text-[11px] text-slate-500 italic mt-0.5 leading-normal">
                          When an incident reaches this stage, the platform runs cryptographic compliance audits. Active commanders across the district receive instant updates on resource states.
                        </p>
                      </div>
                    </div>
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom step progress dots */}
            <div className="flex justify-center md:justify-start items-center gap-1.5 mt-8 border-t border-slate-100 pt-5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mr-2 font-mono">Tracker:</span>
              {WORKFLOW_STEPS.map((step, idx) => (
                <button
                  key={step.num}
                  onClick={() => selectWorkflowStep(idx)}
                  className={`w-3.5 h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === activeStepIdx ? 'w-8 bg-red-600' : 'bg-slate-205 hover:bg-slate-300'
                  }`}
                  aria-label={`Go to step ${step.num}`}
                ></button>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-widest block font-mono">NATIONAL DEFENSIBILITY FEATURES</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight" id="features-title">
              Our Core Command Modules
            </h2>
            <div className="w-16 h-1 px-1 bg-red-650 bg-red-650 rounded-full mx-auto"></div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Highly secure computational services serving district commanders with maximum operational availability.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            id="features-grid"
          >

            {/* Card 1 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 25 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
              whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.2 } }}
              className="bg-white p-6 rounded-xl border border-slate-200 hover:border-red-500/40 hover:shadow-lg transition-all text-left space-y-4 group cursor-pointer"
            >
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-md font-bold text-slate-900">🚨 Incident Management</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track and manage emergency incidents. Coordinate incoming logs with comprehensive map plotting and status logs.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 25 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
              whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.2 } }}
              className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-500/40 hover:shadow-lg transition-all text-left space-y-4 group cursor-pointer"
            >
              <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-md font-bold text-slate-900">⚡ Priority Management</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Rank emergencies using Heap-based prioritization. Ensure incidents involving higher impact or extreme severity bubble to the top.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 25 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
              whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.2 } }}
              className="bg-white p-6 rounded-xl border border-slate-200 hover:border-red-500/40 hover:shadow-lg transition-all text-left space-y-4 group cursor-pointer"
            >
              <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-md font-bold text-slate-900">🗺 Route Optimization</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Find shortest rescue routes using Dijkstra's Algorithm. Bypass geographical blocks and flood surges logically.
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 25 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
              whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.2 } }}
              className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-500/40 hover:shadow-lg transition-all text-left space-y-4 group cursor-pointer"
            >
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-md font-bold text-slate-900">🚑 Resource Coordination</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Manage ambulances, boats, fire trucks, and medical teams. Ensure high-fidelity response operations in real-time.
              </p>
            </motion.div>

            {/* Card 5 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 25 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
              whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.2 } }}
              className="bg-white p-6 rounded-xl border border-slate-200 hover:border-red-500/40 hover:shadow-lg transition-all text-left space-y-4 group cursor-pointer"
            >
              <div className="w-10 h-10 bg-red-50 text-red-650 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-md font-bold text-slate-900">🏠 Shelter Management</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Monitor shelter capacities and occupancy levels. Evacuate civilians systematically with automatic load balancing.
              </p>
            </motion.div>

            {/* Card 6 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 25 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
              whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.2 } }}
              className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-500/40 hover:shadow-lg transition-all text-left space-y-4 group cursor-pointer"
            >
              <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-md font-bold text-slate-900">📊 Reporting & Analytics</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generate operational reports and insights. Review metrics of success, dispatch latency, and survivor ratios.
              </p>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* DATA STRUCTURES PLAN & ALGORITHMS SHOWCASE */}
      <section className="py-20 bg-slate-50 border-y border-slate-100" id="algorithms">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest block font-mono">RIGOROUS COMPUTER SCIENCE BOUNDARIES</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight" id="algorithms-title">
              Powered by Advanced Data Structures &amp; Algorithms
            </h2>
            <div className="w-16 h-1 bg-red-650 rounded-full mx-auto"></div>
            <p className="text-sm text-slate-500 leading-relaxed">
              ResQ Lanka runs strict mathematical structures to calculate, verify, and resolve life-threatening crises.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            id="algorithms-grid"
          >

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
              whileHover={{ y: -5, scale: 1.015, transition: { duration: 0.2 } }}
              className="bg-white p-6 rounded-xl border border-slate-200/70 text-left space-y-3 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="w-9 h-9 bg-red-50 text-red-600 rounded-lg flex items-center justify-center font-bold text-xs font-mono">
                FIFO
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Queue</h3>
              <p className="text-xs text-slate-550 leading-relaxed">
                Incoming disaster requests are processed using FIFO scheduling. Ensures fair and orderly sequencing without dropouts.
              </p>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
              whileHover={{ y: -5, scale: 1.015, transition: { duration: 0.2 } }}
              className="bg-white p-6 rounded-xl border border-slate-200/70 text-left space-y-3 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="w-9 h-9 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center font-bold text-xs font-mono">
                HEAP
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Priority Queue (Heap)</h3>
              <p className="text-xs text-slate-550 leading-relaxed">
                Critical incidents receive immediate attention based on severity and affected population. Evaluates maximum priority state instantly.
              </p>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
              whileHover={{ y: -5, scale: 1.015, transition: { duration: 0.2 } }}
              className="bg-white p-6 rounded-xl border border-slate-200/70 text-left space-y-3 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="w-9 h-9 bg-red-50 text-red-550 rounded-lg flex items-center justify-center font-bold text-xs font-mono">
                LIFO
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Stack</h3>
              <p className="text-xs text-slate-550 leading-relaxed">
                System actions are recorded for history tracking and undo operations. Keeps an absolute log of operational rollback steps.
              </p>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
              whileHover={{ y: -5, scale: 1.015, transition: { duration: 0.2 } }}
              className="bg-white p-6 rounded-xl border border-slate-200/70 text-left space-y-3 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs font-mono">
                ADJ
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Graph</h3>
              <p className="text-xs text-slate-550 leading-relaxed">
                District connectivity and shortest-path calculations support rescue operations. Evaluates weights under extreme meteorological stresses.
              </p>
            </motion.div>

          </motion.div>

        </div>
      </section>

      {/* OPERATIONS SANDBOX TO LIVE DEMO ROUTING (PROVING STACK, HEAP, GRAPH ARE REAL) */}
      <section className="py-20 bg-white" id="sandbox">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-md">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-100 pb-6 mb-8 text-left">
              <div>
                <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded font-bold uppercase tracking-wider block w-fit font-mono">LIVE ALGORITHMIC PLAYGROUND</span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">Operations Simulation Sandbox</h2>
                <p className="text-sm text-slate-500 mt-1">Test emergency path calculations, and explore pre-registered live district resources dynamically.</p>
              </div>

              {/* Toggle controls */}
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-auto shrink-0 font-mono text-xs">
                <button
                  onClick={() => setActiveTab('simulator')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${activeTab === 'simulator' ? 'bg-white text-blue-900 shadow-2xs border border-slate-200/60' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Dijkstra Router
                </button>
                <button
                  onClick={() => setActiveTab('telemetry')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${activeTab === 'telemetry' ? 'bg-white text-blue-900 shadow-2xs border border-slate-200/60' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Live Feeds
                </button>
                <button
                  onClick={() => setActiveTab('bases')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${activeTab === 'bases' ? 'bg-white text-blue-900 shadow-2xs border border-slate-200/60' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  District Resources
                </button>
              </div>
            </div>

            {/* TAB 1: DIJKSTRA ROUTINNG VISUALS */}
            <AnimatePresence mode="wait">
              {activeTab === 'simulator' && (
                <motion.div
                  key="simulator"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left"
                  id="sandbox-simulator-view"
                >

                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-slate-50/70 p-6 rounded-xl border border-slate-100 space-y-4">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                        <Cpu className="text-red-600 w-4 h-4" /> Calculate Adjacency Pathway
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Dijkstra's search matches the absolute shortest geographic distance while factoring in road grid obstructions.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Start Station</label>
                        <select
                          value={simStart}
                          onChange={(e) => setSimStart(e.target.value)}
                          className="w-full text-xs font-semibold px-2 py-2 bg-white rounded border border-slate-200 outline-none"
                        >
                          {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Destination Station</label>
                        <select
                          value={simDest}
                          onChange={(e) => setSimDest(e.target.value)}
                          className="w-full text-xs font-semibold px-2 py-2 bg-white rounded border border-slate-200 outline-none"
                        >
                          {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {simResult ? (
                    <div className="bg-blue-50/50 border border-blue-150 p-6 rounded-xl space-y-4">
                      <span className="text-[9px] font-extrabold text-blue-700 bg-blue-100 px-2.5 py-1 rounded uppercase tracking-wider">DIJKSTRA MATRICES PROCESSED</span>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Total Path Distance</span>
                        <p className="text-3xl font-black text-slate-900">{simResult.distance} <span className="text-sm font-normal text-slate-500">km</span></p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Calculated Hop Chain</span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {simResult.path.map((item, idx) => (
                            <React.Fragment key={idx}>
                              <span className="text-xs font-semibold text-slate-800 bg-white px-2 py-1 rounded border border-slate-150 shadow-3xs">
                                {item}
                              </span>
                              {idx < simResult.path.length - 1 && <span className="text-slate-400 text-xs font-bold font-mono">&rarr;</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 text-red-800 text-xs p-4 rounded-xl font-bold border border-red-100">
                      Error: Unreachable grid bounds. Please check node connections.
                    </div>
                  )}
                </div>

                {/* SVG Visual topology */}
                <div className="lg:col-span-7 bg-slate-50 rounded-xl border border-slate-100 p-4 flex flex-col justify-center items-center relative overflow-hidden">
                  <span className="absolute top-4 left-4 text-[9px] text-slate-400 font-mono tracking-widest uppercase">ACTIVE TOPOLOGY MODEL</span>

                  <svg viewBox="0 0 500 400" className="w-full max-w-[430px] h-[320px]" xmlns="http://www.w3.org/2000/svg">
                    {/* Connections */}
                    {graphConnections.map((conn, idx) => {
                      const u = nodeCoords[conn.u];
                      const v = nodeCoords[conn.v];
                      if (!u || !v) return null;

                      const isHighlight = isLineInSimPath(conn.u, conn.v);

                      return (
                        <g key={idx}>
                          <line
                            x1={u.x}
                            y1={u.y}
                            x2={v.x}
                            y2={v.y}
                            stroke={isHighlight ? '#ef4444' : '#cbd5e1'}
                            strokeWidth={isHighlight ? 4.5 : 1.5}
                            strokeLinecap="round"
                            className="transition-all duration-300"
                          />
                        </g>
                      );
                    })}

                    {/* Nodes overlay circle */}
                    {Object.keys(nodeCoords).map(name => {
                      const node = nodeCoords[name];
                      const isActive = isNodeInSimPath(name);
                      const isStart = name === simStart;
                      const isDest = name === simDest;

                      let radius = 6;
                      let fillCol = 'fill-white stroke-slate-300';
                      let coreCol = 'fill-slate-400';

                      if (isStart) {
                        radius = 10;
                        fillCol = 'fill-red-50 stroke-red-600';
                        coreCol = 'fill-red-600';
                      } else if (isDest) {
                        radius = 10;
                        fillCol = 'fill-blue-50 stroke-blue-700';
                        coreCol = 'fill-blue-700';
                      } else if (isActive) {
                        radius = 8;
                        fillCol = 'fill-red-50 stroke-red-500';
                        coreCol = 'fill-red-500';
                      }

                      return (
                        <g key={name}>
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={radius}
                            className={`stroke-2 ${fillCol}`}
                          />
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={radius - 4}
                            className={coreCol}
                          />
                          <text
                            x={node.x}
                            y={node.y - 12}
                            fontSize={8.5}
                            fontWeight="bold"
                            textAnchor="middle"
                            fill={isStart || isDest ? '#0f172a' : '#64748b'}
                            className="font-sans select-none"
                          >
                            {name}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

              </motion.div>
            )}

            {/* TAB 2: TELEMETRY LOGGER */}
            {activeTab === 'telemetry' && (
              <motion.div
                key="telemetry"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-4 text-left font-mono text-xs"
                id="sandbox-telemetry-view"
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-bold text-slate-550 flex items-center gap-2">
                    <Activity className="text-red-600 w-4 h-4 animate-pulse" /> TELEMETRY LOG BUFFER
                  </span>
                  <span className="text-[9px] bg-red-100 text-red-700 px-2.5 py-0.5 rounded font-extrabold uppercase">STREAM LIVE</span>
                </div>

                <div className="bg-slate-900 rounded-xl p-6 text-slate-300 space-y-2 border border-slate-800 shadow-inner h-64 overflow-y-auto">
                  <p className="text-red-400 font-bold">// System active state handshakes. Output refreshed every 4 sec.</p>
                  {simLogs.map((log, idx) => (
                    <p key={idx} className={`${idx === 0 ? 'text-white font-bold' : 'text-slate-300/80'}`}>
                      {log}
                    </p>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 3: BASE RESOURCE LOOKUP */}
            {activeTab === 'bases' && (
              <motion.div
                key="bases"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left text-xs"
                id="sandbox-bases-view"
              >

                <div className="lg:col-span-4 bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-slate-800 flex items-center gap-2">
                      <Building className="text-blue-900 w-4.5 h-4.5" /> Regional Asset Registry
                    </h4>
                    <p className="text-slate-500 leading-normal">
                      Query coordinates to retrieve allocated ambulances, shelters, specialized water forces, and base secretariat buildings.
                    </p>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target District</label>
                      <select
                        value={selectedLookupDistrict}
                        onChange={(e) => setSelectedLookupDistrict(e.target.value)}
                        className="w-full font-semibold px-2.5 py-2 bg-white rounded border border-slate-200 text-slate-800 outline-none"
                      >
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 space-y-5">
                  <div className="border-b pb-3">
                    <span className="text-[9px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded border border-red-200/50 uppercase">
                      STATE REGULATORY DATA &bull; SECURE VERIFICATION
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1 font-display">
                      Ground Infrastructure Deployment Blueprint
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 leading-relaxed text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Stationed Hospital Hub</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{currentLookup.hospital}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Crisis Command Secretariat</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{currentLookup.dmcBase}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block font-sans">Active Safe Shelters</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{currentLookup.shelters}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block font-sans">Standby Debris &amp; Rescue Assets</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{currentLookup.assets}</p>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-20 bg-slate-50 border-t border-slate-100" id="about">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-widest block font-mono">INTELLIGENT COMMAND MISSION</span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight" id="about-title">
            About ResQ Lanka
          </h2>
          <div className="w-12 h-1 bg-red-600 mx-auto rounded-full"></div>

          <p className="text-slate-650 text-base leading-relaxed max-w-3xl mx-auto font-normal text-slate-600" id="about-content">
            ResQ Lanka is a disaster response and emergency coordination platform developed to improve emergency management through intelligent incident handling, resource optimization, shelter coordination, and shortest-path rescue planning.
          </p>

          <div className="flex justify-center gap-8 pt-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-750">
              <CheckCircle className="text-red-600 w-4.5 h-4.5" /> High Triage Accuracy
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-750">
              <CheckCircle className="text-blue-700 w-4.5 h-4.5" /> Real-time Adjacency Scaling
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-750">
              <CheckCircle className="text-emerald-600 w-4.5 h-4.5" /> Guaranteed Order (FIFO Structure)
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION SECTION */}
      <section className="py-20 bg-gradient-to-r from-blue-950 to-slate-950 text-white text-center relative overflow-hidden" id="cta">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="max-w-3xl mx-auto px-6 relative z-10 space-y-6">
          <h2 className="text-3xl md:text-4.5xl font-black text-white tracking-tight leading-tight" id="cta-title">
            Ready to Strengthen Emergency Response?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Gain immediate control of dispatch feeds, inspect registered active shelter occupancy status matrices, and handle incident приоритеты immediately.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              onClick={onEnterTerminal}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
              id="cta-register-now"
            >
              Register Now
            </button>
            <button
              onClick={onEnterTerminal}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-755 text-slate-200 hover:text-white border border-slate-750 font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
              id="cta-login-dashboard"
            >
              Login to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER SECTION */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 text-slate-400 text-center" id="footer-section">
        <div className="max-w-7xl mx-auto px-6 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-white font-extrabold text-xs">
              <span className="text-red-500">R</span>Q
            </div>
            <span className="font-extrabold text-white text-base tracking-tight font-display">ResQ Lanka</span>
          </div>

          <p className="text-xs text-red-500 font-bold tracking-widest uppercase font-mono max-w-lg mx-auto">
            Smart Disaster Response & Emergency Coordination Platform
          </p>

          <div className="w-24 h-0.5 bg-slate-800 mx-auto"></div>

          <p className="text-xs text-slate-500" id="footer-copyright">
            © 2026 ResQ Lanka. All Rights Reserved. &bull; Democratic Socialist Republic of Sri Lanka Emergency Administration.
          </p>
        </div>
      </footer>

    </div>
  );
}
