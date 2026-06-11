import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { 
  User, UserRole, Incident, IncidentStatus, Resource, ResourceType, 
  ResourceStatus, Shelter, ShelterStatus, ActionHistory, ActionType, EmergencyReport 
} from './src/types';
import { CustomQueue, CustomStack, MaxHeap, buildSriLankaGraph } from './src/algorithms';

const app = express();
const PORT = 3000;

app.use(express.json());

// ============================================================
// DATA PERSISTENCE STATE (Stateful in-memory database simulation)
// ============================================================

let users: User[] = [
  {
    id: 1,
    fullName: 'System Administrator',
    username: 'admin',
    email: 'admin@disasterresponse.lk',
    role: UserRole.ADMIN,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    fullName: 'Colombo Coordinator',
    username: 'coordinator',
    email: 'coordinator@disasterresponse.lk',
    role: UserRole.COORDINATOR,
    createdAt: new Date().toISOString()
  }
];

// Seed incidents from user MySQL scripts
let incidents: Incident[] = [
  {
    id: 1,
    disasterType: 'Flood',
    district: 'Colombo',
    severity: 8,
    affectedPeople: 5000,
    priorityScore: 40000.0,
    status: 'ACTIVE',
    description: 'Severe flooding in low-lying areas due to heavy monsoon rains.',
    location: 'Colombo North',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 2,
    disasterType: 'Landslide',
    district: 'Kandy',
    severity: 7,
    affectedPeople: 1200,
    priorityScore: 8400.0,
    status: 'ACTIVE',
    description: 'Landslide blocking main Colombo-Kandy highway.',
    location: 'Peradeniya Road',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 3,
    disasterType: 'Cyclone',
    district: 'Batticaloa',
    severity: 9,
    affectedPeople: 8000,
    priorityScore: 72000.0,
    status: 'PENDING',
    description: 'Cyclone warning — coastal evacuation needed promptly.',
    location: 'East Coast',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    id: 4,
    disasterType: 'Drought',
    district: 'Anuradhapura',
    severity: 5,
    affectedPeople: 3000,
    priorityScore: 15000.0,
    status: 'RESOLVED',
    description: 'Severe water shortage in northern agricultural villages.',
    location: 'Mihintale Area',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 5,
    disasterType: 'Fire',
    district: 'Galle',
    severity: 6,
    affectedPeople: 200,
    priorityScore: 1200.0,
    status: 'ACTIVE',
    description: 'Forest fire spreading toward residential properties.',
    location: 'Bona Vista',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString()
  }
];

// Seed resources from user MySQL scripts
let resources: Resource[] = [
  {
    id: 1,
    name: 'Colombo Ambulance Unit 1',
    type: 'AMBULANCE',
    status: 'ASSIGNED',
    district: 'Colombo',
    quantity: 3,
    assignedIncidentId: 1,
    notes: 'Dispatched to low-lying flood sectors.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Colombo Fire Squad A',
    type: 'FIRE_TRUCK',
    status: 'AVAILABLE',
    district: 'Colombo',
    quantity: 2,
    assignedIncidentId: null,
    notes: 'Stationed at Central Command.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Galle Rescue Boat 1',
    type: 'RESCUE_BOAT',
    status: 'AVAILABLE',
    district: 'Galle',
    quantity: 1,
    assignedIncidentId: null,
    notes: 'Fully functional, fuel refilled.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Kandy Medical Team Alpha',
    type: 'MEDICAL_TEAM',
    status: 'AVAILABLE',
    district: 'Kandy',
    quantity: 1,
    assignedIncidentId: null,
    notes: 'Mobile unit with critical care capabilities.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    name: 'Trinco Helicopter Unit',
    type: 'HELICOPTER',
    status: 'MAINTENANCE',
    district: 'Trincomalee',
    quantity: 1,
    assignedIncidentId: null,
    notes: 'Routine rotor blade replacement.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 6,
    name: 'National Food Pack Reserve',
    type: 'FOOD_SUPPLY',
    status: 'AVAILABLE',
    district: 'Colombo',
    quantity: 500,
    assignedIncidentId: null,
    notes: 'Assorted dry ratio parcels.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 7,
    name: 'Water Bowser Unit - South',
    type: 'WATER_SUPPLY',
    status: 'AVAILABLE',
    district: 'Matara',
    quantity: 4,
    assignedIncidentId: null,
    notes: 'Clean drinking water transports.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 8,
    name: 'Jaffna Ambulance Unit 1',
    type: 'AMBULANCE',
    status: 'AVAILABLE',
    district: 'Jaffna',
    quantity: 2,
    assignedIncidentId: null,
    notes: 'Stationed at Jaffna Teaching Hospital.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Seed shelters from user MySQL scripts
let shelters: Shelter[] = [
  {
    id: 1,
    shelterName: 'Colombo Relief Centre 1',
    district: 'Colombo',
    address: 'Maradana Community Hall, Colombo 10',
    capacity: 500,
    occupancy: 320,
    status: 'OPEN',
    contactPerson: 'Mr. Perera',
    contactPhone: '0112345678',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    shelterName: 'Gampaha District Shelter',
    district: 'Gampaha',
    address: 'Kelaniya Town Hall',
    capacity: 300,
    occupancy: 150,
    status: 'OPEN',
    contactPerson: 'Ms. Silva',
    contactPhone: '0332345678',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    shelterName: 'Kandy Highland Refuge',
    district: 'Kandy',
    address: 'Peradeniya Sports Complex',
    capacity: 400,
    occupancy: 400,
    status: 'FULL',
    contactPerson: 'Mr. Fernando',
    contactPhone: '0812345678',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    shelterName: 'Galle South Relief Camp',
    district: 'Galle',
    address: 'Galle International Stadium, Galle',
    capacity: 600,
    occupancy: 80,
    status: 'OPEN',
    contactPerson: 'Ms. Jayawardena',
    contactPhone: '0912345678',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    shelterName: 'Batticaloa Coast Shelter',
    district: 'Batticaloa',
    address: 'Batticaloa Kachcheri Grounds',
    capacity: 700,
    occupancy: 0,
    status: 'OPEN',
    contactPerson: 'Mr. Muthu',
    contactPhone: '0652345678',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 6,
    shelterName: 'Jaffna Northern Refuge',
    district: 'Jaffna',
    address: 'Jaffna Public Library Grounds',
    capacity: 350,
    occupancy: 200,
    status: 'OPEN',
    contactPerson: 'Ms. Rajan',
    contactPhone: '0212345678',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 7,
    shelterName: 'Anuradhapura Relief Camp',
    district: 'Anuradhapura',
    address: 'Sacred City Grounds',
    capacity: 450,
    occupancy: 10,
    status: 'OPEN',
    contactPerson: 'Mr. Wijesinghe',
    contactPhone: '0252345678',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 8,
    shelterName: 'Trincomalee Harbour Camp',
    district: 'Trincomalee',
    address: 'Trinco Harbour Community Centre',
    capacity: 500,
    occupancy: 0,
    status: 'OPEN',
    contactPerson: 'Mr. Nadarajah',
    contactPhone: '0262345678',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Initialize global tracking structures using the Custom DSA classes
const emergencyQueue = new CustomQueue<EmergencyReport>();
const actionStack = new CustomStack<ActionHistory>();

// Seed incoming queue with 2 raw reports
emergencyQueue.enqueue({
  id: 'R101',
  disasterType: 'Monsoon Flooding',
  district: 'Kalutara',
  severity: 7,
  affectedPeople: 850,
  reporterName: 'Sunil Shantha',
  reporterPhone: '0771234567',
  description: 'Water has entered several residences on Kalutara River road. Needs evaluation and raft teams.',
  timestamp: new Date(Date.now() - 3600000).toISOString()
});

emergencyQueue.enqueue({
  id: 'R102',
  disasterType: 'Coastal Surge',
  district: 'Matara',
  severity: 6,
  affectedPeople: 400,
  reporterName: 'Fathima Nazra',
  reporterPhone: '0419876543',
  description: 'Rough wave surges causing seawall erosion. Coastal fishing community requires temporary warning units.',
  timestamp: new Date(Date.now() - 1800000).toISOString()
});

// Counter variables
let nextIncidentId = 6;
let nextResourceId = 9;
let nextShelterId = 9;
let nextActionId = 1;

// Helper to push history record to stack
function recordAction(
  type: ActionType, 
  entityType: string, 
  entityId: number, 
  description: string, 
  performedBy: string,
  prevState?: any,
  newState?: any
) {
  const historyItem: ActionHistory = {
    id: nextActionId++,
    actionType: type,
    entityType,
    entityId,
    description,
    performedBy,
    previousState: prevState ? JSON.stringify(prevState) : undefined,
    newState: newState ? JSON.stringify(newState) : undefined,
    timestamp: new Date().toISOString(),
    undone: false
  };
  actionStack.push(historyItem);
  return historyItem;
}

// Current log-in mock user reference for audit logs
let sessionUser: User | null = users[0];

// ============================================================
// REST API ENDPOINTS
// ============================================================

// 1. Auth Modules
app.post('/api/auth/register', (req, res) => {
  const { fullName, username, email, password } = req.body;
  if (!fullName || !username || !email) {
    return res.status(400).json({ error: 'fullName, username, and email are required.' });
  }

  const existingUser = users.find(u => u.username === username || u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'Username or email already exists.' });
  }

  const newUser: User = {
    id: users.length + 1,
    fullName,
    username,
    email,
    role: UserRole.COORDINATOR,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  sessionUser = newUser;

  recordAction('USER_LOGIN', 'User', newUser.id, `User registration and sign-in for ${username}`, fullName);
  res.json({ message: 'User registered successfully', user: newUser, token: 'mock-jwt-token-xyz' });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Accept default admin password Admin@1234 or any login for coursework simplicity
  const matchedUser = users.find(u => u.username === username);
  if (!matchedUser) {
    return res.status(401).json({ error: 'Invalid username or credentials.' });
  }

  sessionUser = matchedUser;
  recordAction('USER_LOGIN', 'User', matchedUser.id, `User logged in: ${username}`, matchedUser.fullName);

  res.json({
    message: 'Login successful',
    user: matchedUser,
    token: `mock-jwt-token-for-${matchedUser.role}`
  });
});

app.post('/api/auth/logout', (req, res) => {
  if (sessionUser) {
    recordAction('USER_LOGOUT', 'User', sessionUser.id, `User logged out: ${sessionUser.username}`, sessionUser.fullName);
  }
  sessionUser = null;
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', (req, res) => {
  res.json({ user: sessionUser });
});

// 2. Incident Management Modules
app.get('/api/incidents', (req, res) => {
  const { district, severity, status } = req.query;
  let filtered = [...incidents];

  if (district) {
    filtered = filtered.filter(i => i.district.toString().toLowerCase() === district.toString().toLowerCase());
  }
  if (severity) {
    filtered = filtered.filter(i => i.severity >= parseInt(severity.toString(), 10));
  }
  if (status) {
    filtered = filtered.filter(i => i.status.toString().toUpperCase() === status.toString().toUpperCase());
  }

  res.json(filtered);
});

app.post('/api/incidents', (req, res) => {
  const { disasterType, district, severity, affectedPeople, description, location } = req.body;
  
  if (!disasterType || !district || !severity || affectedPeople === undefined) {
    return res.status(400).json({ error: 'disasterType, district, severity, and affectedPeople are required fields.' });
  }

  const sevNum = parseInt(severity, 10);
  const affNum = parseInt(affectedPeople, 10);
  const calculatedPriority = sevNum * affNum;

  const newIncident: Incident = {
    id: nextIncidentId++,
    disasterType,
    district,
    severity: sevNum,
    affectedPeople: affNum,
    priorityScore: calculatedPriority,
    status: 'ACTIVE',
    description: description || 'Emergency disaster response initiated.',
    location: location || district,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  incidents.push(newIncident);

  recordAction(
    'INCIDENT_CREATE', 
    'Incident', 
    newIncident.id, 
    `Created new incident: ${disasterType} in ${district} with priority score ${calculatedPriority}`,
    sessionUser ? sessionUser.fullName : 'System',
    null,
    newIncident
  );

  res.status(201).json(newIncident);
});

app.put('/api/incidents/:id', (req, res) => {
  const idNum = parseInt(req.params.id, 10);
  const incidentIdx = incidents.findIndex(i => i.id === idNum);
  
  if (incidentIdx === -1) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  const oldState = { ...incidents[incidentIdx] };
  const { disasterType, district, severity, affectedPeople, status, description, location } = req.body;

  if (disasterType) incidents[incidentIdx].disasterType = disasterType;
  if (district) incidents[incidentIdx].district = district;
  if (severity !== undefined) incidents[incidentIdx].severity = parseInt(severity, 10);
  if (affectedPeople !== undefined) incidents[incidentIdx].affectedPeople = parseInt(affectedPeople, 10);
  if (status) incidents[incidentIdx].status = status as IncidentStatus;
  if (description) incidents[incidentIdx].description = description;
  if (location) incidents[incidentIdx].location = location;

  // Re-calculate safety/priority metrics
  incidents[incidentIdx].priorityScore = incidents[incidentIdx].severity * incidents[incidentIdx].affectedPeople;
  incidents[incidentIdx].updatedAt = new Date().toISOString();

  const newState = { ...incidents[incidentIdx] };

  recordAction(
    'INCIDENT_UPDATE',
    'Incident',
    idNum,
    `Updated incident [ID: ${idNum}] ${incidents[incidentIdx].disasterType} in ${incidents[incidentIdx].district}`,
    sessionUser ? sessionUser.fullName : 'System',
    oldState,
    newState
  );

  res.json(incidents[incidentIdx]);
});

app.delete('/api/incidents/:id', (req, res) => {
  const idNum = parseInt(req.params.id, 10);
  const incidentIdx = incidents.findIndex(i => i.id === idNum);

  if (incidentIdx === -1) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  const deletedItem = incidents[incidentIdx];
  
  // Re-route resources assigned to it
  resources.forEach(r => {
    if (r.assignedIncidentId === idNum) {
      r.assignedIncidentId = null;
      r.status = 'AVAILABLE';
    }
  });

  incidents.splice(incidentIdx, 1);

  recordAction(
    'INCIDENT_DELETE',
    'Incident',
    idNum,
    `Deleted incident: ${deletedItem.disasterType} in ${deletedItem.district}`,
    sessionUser ? sessionUser.fullName : 'System',
    deletedItem,
    null
  );

  res.json({ message: 'Incident deleted successfully', id: idNum });
});

// 3. Queue Modules (FIFO Incoming Disaster Reports)
app.get('/api/reports/emergency', (req, res) => {
  res.json(emergencyQueue.toArray());
});

app.post('/api/reports/emergency', (req, res) => {
  const { disasterType, district, severity, affectedPeople, reporterName, reporterPhone, description } = req.body;
  if (!disasterType || !district || !severity || !affectedPeople) {
    return res.status(400).json({ error: 'Disaster Type, District, Severity and Affected People are required.' });
  }

  const report: EmergencyReport = {
    id: 'R' + Math.floor(100 + Math.random() * 900),
    disasterType,
    district,
    severity: parseInt(severity, 10),
    affectedPeople: parseInt(affectedPeople, 10),
    reporterName: reporterName || 'Anonymous',
    reporterPhone: reporterPhone || 'None',
    description: description || 'Emergency report filed from mobile dispatch terminal.',
    timestamp: new Date().toISOString()
  };

  emergencyQueue.enqueue(report);
  res.status(201).json({ message: 'Emergency report enqueued successfully in FIFO queue', report });
});

app.post('/api/reports/emergency/dequeue', (req, res) => {
  const report = emergencyQueue.dequeue();
  if (!report) {
    return res.status(400).json({ error: 'No standby report emergencies in FIFO Queue.' });
  }

  // Auto-convert dequeued emergency item into official tracking Incident with ACTIVE status
  const score = report.severity * report.affectedPeople;
  const newIncident: Incident = {
    id: nextIncidentId++,
    disasterType: report.disasterType,
    district: report.district,
    severity: report.severity,
    affectedPeople: report.affectedPeople,
    priorityScore: score,
    status: 'ACTIVE',
    description: `[Dequeued Emergency Report from ${report.reporterName}] - ${report.description}`,
    location: report.district,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  incidents.push(newIncident);

  recordAction(
    'INCIDENT_CREATE',
    'Incident',
    newIncident.id,
    `Dequeued report and created Active Incident: ${report.disasterType} in ${report.district}`,
    sessionUser ? sessionUser.fullName : 'System Queue Dequeue',
    null,
    newIncident
  );

  res.json({ 
    message: 'Successfully dequeued oldest emergency report and promoted to active incident!', 
    report, 
    incident: newIncident 
  });
});

// 4. Core Priority Queue Modules (Utilizes custom Max Heap sorting on severity * affectedPeople)
app.get('/api/priority-queue', (req, res) => {
  // Return heap sorted list of active/pending incidents
  const activeIncidents = incidents.filter(i => i.status === 'ACTIVE' || i.status === 'PENDING');
  const heap = new MaxHeap(activeIncidents);
  res.json(heap.toArray());
});

app.post('/api/priority-queue/extract', (req, res) => {
  const activeIncidents = incidents.filter(i => i.status === 'ACTIVE' || i.status === 'PENDING');
  if (activeIncidents.length === 0) {
    return res.status(400).json({ error: 'No active or pending incidents inside Priority Queue.' });
  }

  const heap = new MaxHeap(activeIncidents);
  const maxIncident = heap.extractMax();

  if (!maxIncident) {
    return res.status(400).json({ error: 'Priority Queue is empty.' });
  }

  // Update status to CLOSED/RESOLVED
  const incidentIdx = incidents.findIndex(i => i.id === maxIncident.id);
  const oldState = { ...incidents[incidentIdx] };
  
  incidents[incidentIdx].status = 'RESOLVED';
  incidents[incidentIdx].updatedAt = new Date().toISOString();

  const newState = { ...incidents[incidentIdx] };

  recordAction(
    'INCIDENT_UPDATE',
    'Incident',
    maxIncident.id,
    `Priority Queue Dispatch: Resolved highest priority incident [ID: ${maxIncident.id}] (${maxIncident.disasterType} in ${maxIncident.district})`,
    sessionUser ? sessionUser.fullName : 'System Automatic Dispatcher',
    oldState,
    newState
  );

  res.json({ 
    message: 'High priority incident extracted and marked as RESOLVED.', 
    incident: incidents[incidentIdx] 
  });
});

// 5. Shortest path routing module (Graph + Dijkstra)
app.post('/api/route/shortest-path', (req, res) => {
  const { startDistrict, destinationDistrict } = req.body;
  if (!startDistrict || !destinationDistrict) {
    return res.status(400).json({ error: 'startDistrict and destinationDistrict fields are required.' });
  }

  const graph = buildSriLankaGraph();
  const searchResult = graph.findShortestPath(startDistrict, destinationDistrict);

  if (searchResult.distance === Infinity) {
    return res.status(404).json({ error: 'Route between selected districts does not exist or is disconnected' });
  }

  res.json({
    start: startDistrict,
    destination: destinationDistrict,
    path: searchResult.path,
    distanceKm: searchResult.distance,
    message: `Shortest dispatch path found running Dijkstra's Algorithm.`
  });
});

app.get('/api/route/districts', (req, res) => {
  const graph = buildSriLankaGraph();
  res.json(graph.getNodes());
});

// 6. Action History / UNDO Modules
app.get('/api/action-history', (req, res) => {
  res.json(actionStack.toArray());
});

app.post('/api/action-history/undo', (req, res) => {
  const lastAction = actionStack.pop();
  if (!lastAction) {
    return res.status(400).json({ error: 'Undo stack empty. No actions left to reverse.' });
  }

  // Reverse action based on serialized previous state
  try {
    const isIncident = lastAction.entityType === 'Incident';
    const parsedPrev = lastAction.previousState ? JSON.parse(lastAction.previousState) : null;
    const parsedNew = lastAction.newState ? JSON.parse(lastAction.newState) : null;

    if (lastAction.actionType === 'INCIDENT_CREATE') {
      // Revert creation of building an incident (remove it)
      const idx = incidents.findIndex(i => i.id === lastAction.entityId);
      if (idx !== -1) {
        incidents.splice(idx, 1);
      }
    } 
    else if (lastAction.actionType === 'INCIDENT_UPDATE') {
      // Restore previous state of incident
      const idx = incidents.findIndex(i => i.id === lastAction.entityId);
      if (idx !== -1 && parsedPrev) {
        incidents[idx] = parsedPrev;
      }
    } 
    else if (lastAction.actionType === 'INCIDENT_DELETE') {
      // Restore deleted incident
      if (parsedPrev) {
        incidents.push(parsedPrev);
      }
    }
    else if (lastAction.actionType === 'RESOURCE_ASSIGN') {
      // Restore resource state
      if (parsedPrev) {
        const rIdx = resources.findIndex(r => r.id === lastAction.entityId);
        if (rIdx !== -1) {
          resources[rIdx] = parsedPrev;
        }
      }
    }
    else if (lastAction.actionType === 'RESOURCE_CREATE') {
      const idx = resources.findIndex(r => r.id === lastAction.entityId);
      if (idx !== -1) {
        resources.splice(idx, 1);
      }
    }
    else if (lastAction.actionType === 'RESOURCE_UPDATE') {
      const idx = resources.findIndex(r => r.id === lastAction.entityId);
      if (idx !== -1 && parsedPrev) {
        resources[idx] = parsedPrev;
      }
    }
    else if (lastAction.actionType === 'SHELTER_CREATE') {
      const idx = shelters.findIndex(s => s.id === lastAction.entityId);
      if (idx !== -1) {
        shelters.splice(idx, 1);
      }
    }
    else if (lastAction.actionType === 'SHELTER_UPDATE') {
      const idx = shelters.findIndex(s => s.id === lastAction.entityId);
      if (idx !== -1 && parsedPrev) {
        shelters[idx] = parsedPrev;
      }
    }

    lastAction.undone = true;
    
    res.json({
      message: `Successfully Undid last action: ${lastAction.description}`,
      action: lastAction
    });
  } catch(e) {
    // Push the popped item back on error to avoid losing track of stack
    actionStack.push(lastAction);
    res.status(500).json({ error: 'Failed to reverse action state', details: String(e) });
  }
});

// 7. Resource Management Modules
app.get('/api/resources', (req, res) => {
  res.json(resources);
});

app.post('/api/resources', (req, res) => {
  const { name, type, status, district, quantity, notes } = req.body;
  if (!name || !type || !district || quantity === undefined) {
    return res.status(400).json({ error: 'name, type, district, and quantity are required.' });
  }

  const newResource: Resource = {
    id: nextResourceId++,
    name,
    type: type as ResourceType,
    status: (status || 'AVAILABLE') as ResourceStatus,
    district,
    quantity: parseInt(quantity, 10),
    assignedIncidentId: null,
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  resources.push(newResource);

  recordAction(
    'RESOURCE_CREATE',
    'Resource',
    newResource.id,
    `Registered emergency resource: ${name} (${type}) in ${district}`,
    sessionUser ? sessionUser.fullName : 'System',
    null,
    newResource
  );

  res.status(201).json(newResource);
});

app.post('/api/resources/assign', (req, res) => {
  const { resourceId, incidentId } = req.body;
  if (!resourceId) {
    return res.status(400).json({ error: 'resourceId is required' });
  }

  const rIdx = resources.findIndex(r => r.id === parseInt(resourceId, 10));
  if (rIdx === -1) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  const oldRes = { ...resources[rIdx] };

  if (!incidentId) {
    // Unassign
    resources[rIdx].assignedIncidentId = null;
    resources[rIdx].status = 'AVAILABLE';
    resources[rIdx].updatedAt = new Date().toISOString();

    recordAction(
      'RESOURCE_ASSIGN',
      'Resource',
      oldRes.id,
      `Unassigned resource [ID: ${oldRes.id}] ${oldRes.name}`,
      sessionUser ? sessionUser.fullName : 'System',
      oldRes,
      { ...resources[rIdx] }
    );
  } else {
    // Assign
    const incId = parseInt(incidentId, 10);
    const inc = incidents.find(i => i.id === incId);
    if (!inc) {
      return res.status(404).json({ error: 'Incident to allocate to does not exist.' });
    }

    resources[rIdx].assignedIncidentId = incId;
    resources[rIdx].status = 'ASSIGNED';
    resources[rIdx].updatedAt = new Date().toISOString();

    recordAction(
      'RESOURCE_ASSIGN',
      'Resource',
      oldRes.id,
      `Allocated resource ${oldRes.name} to Incident ${inc.disasterType} [ID: ${incId}] in ${inc.district}`,
      sessionUser ? sessionUser.fullName : 'System',
      oldRes,
      { ...resources[rIdx] }
    );
  }

  res.json(resources[rIdx]);
});

app.put('/api/resources/:id', (req, res) => {
  const idNum = parseInt(req.params.id, 10);
  const rIdx = resources.findIndex(r => r.id === idNum);
  if (rIdx === -1) return res.status(404).json({ error: 'Resource not found' });

  const oldState = { ...resources[rIdx] };
  const { name, type, status, district, quantity, notes, assignedIncidentId } = req.body;

  if (name) resources[rIdx].name = name;
  if (type) resources[rIdx].type = type;
  if (status) resources[rIdx].status = status;
  if (district) resources[rIdx].district = district;
  if (quantity !== undefined) resources[rIdx].quantity = parseInt(quantity, 10);
  if (notes !== undefined) resources[rIdx].notes = notes;
  if (assignedIncidentId !== undefined) {
    resources[rIdx].assignedIncidentId = assignedIncidentId ? parseInt(assignedIncidentId, 10) : null;
    resources[rIdx].status = assignedIncidentId ? 'ASSIGNED' : 'AVAILABLE';
  }

  resources[rIdx].updatedAt = new Date().toISOString();
  
  recordAction(
    'RESOURCE_UPDATE',
    'Resource',
    idNum,
    `Updated Resource [ID: ${idNum}]: ${resources[rIdx].name}`,
    sessionUser ? sessionUser.fullName : 'System',
    oldState,
    { ...resources[rIdx] }
  );

  res.json(resources[rIdx]);
});

app.delete('/api/resources/:id', (req, res) => {
  const idNum = parseInt(req.params.id, 10);
  const rIdx = resources.findIndex(r => r.id === idNum);
  if (rIdx === -1) return res.status(404).json({ error: 'Resource not found' });

  const old = resources[rIdx];
  resources.splice(rIdx, 1);

  recordAction(
    'RESOURCE_DELETE',
    'Resource',
    idNum,
    `Deleted resource: ${old.name}`,
    sessionUser ? sessionUser.fullName : 'System',
    old,
    null
  );

  res.json({ message: 'Resource deleted', id: idNum });
});

// 8. Shelter Management Modules
app.get('/api/shelters', (req, res) => {
  res.json(shelters);
});

app.post('/api/shelters', (req, res) => {
  const { shelterName, district, address, capacity, occupancy, status, contactPerson, contactPhone } = req.body;
  if (!shelterName || !district || capacity === undefined) {
    return res.status(400).json({ error: 'shelterName, district, and capacity are required.' });
  }

  const newShelter: Shelter = {
    id: nextShelterId++,
    shelterName,
    district,
    address: address || '',
    capacity: parseInt(capacity, 10),
    occupancy: occupancy ? parseInt(occupancy, 10) : 0,
    status: (status || 'OPEN') as ShelterStatus,
    contactPerson: contactPerson || '',
    contactPhone: contactPhone || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  shelters.push(newShelter);

  recordAction(
    'SHELTER_CREATE',
    'Shelter',
    newShelter.id,
    `Registered emergency relief shelter: ${shelterName} in ${district}`,
    sessionUser ? sessionUser.fullName : 'System',
    null,
    newShelter
  );

  res.status(201).json(newShelter);
});

app.put('/api/shelters/:id', (req, res) => {
  const idNum = parseInt(req.params.id, 10);
  const sIdx = shelters.findIndex(s => s.id === idNum);
  if (sIdx === -1) return res.status(404).json({ error: 'Shelter not found' });

  const oldState = { ...shelters[sIdx] };
  const { shelterName, district, address, capacity, occupancy, status, contactPerson, contactPhone } = req.body;

  if (shelterName) shelters[sIdx].shelterName = shelterName;
  if (district) shelters[sIdx].district = district;
  if (address !== undefined) shelters[sIdx].address = address;
  if (capacity !== undefined) shelters[sIdx].capacity = parseInt(capacity, 10);
  if (occupancy !== undefined) {
    const parsedOcc = parseInt(occupancy, 10);
    shelters[sIdx].occupancy = parsedOcc;
    if (parsedOcc >= shelters[sIdx].capacity) {
      shelters[sIdx].status = 'FULL';
    } else if (parsedOcc === 0) {
      shelters[sIdx].status = 'OPEN';
    }
  }
  if (status) shelters[sIdx].status = status;
  if (contactPerson !== undefined) shelters[sIdx].contactPerson = contactPerson;
  if (contactPhone !== undefined) shelters[sIdx].contactPhone = contactPhone;

  shelters[sIdx].updatedAt = new Date().toISOString();

  recordAction(
    'SHELTER_UPDATE',
    'Shelter',
    idNum,
    `Updated Shelter [ID: ${idNum}]: ${shelters[sIdx].shelterName}`,
    sessionUser ? sessionUser.fullName : 'System',
    oldState,
    { ...shelters[sIdx] }
  );

  res.json(shelters[sIdx]);
});

app.delete('/api/shelters/:id', (req, res) => {
  const idNum = parseInt(req.params.id, 10);
  const sIdx = shelters.findIndex(s => s.id === idNum);
  if (sIdx === -1) return res.status(404).json({ error: 'Shelter not found' });

  const old = shelters[sIdx];
  shelters.splice(sIdx, 1);

  recordAction(
    'SHELTER_DELETE',
    'Shelter',
    idNum,
    `Deleted shelter: ${old.shelterName}`,
    sessionUser ? sessionUser.fullName : 'System',
    old,
    null
  );

  res.json({ message: 'Shelter deleted', id: idNum });
});

// 9. Dashboard Analytics Module
app.get('/api/dashboard/stats', (req, res) => {
  const totalIncidents = incidents.length;
  const activeIncidents = incidents.filter(i => i.status === 'ACTIVE').length;
  const pendingIncidents = incidents.filter(i => i.status === 'PENDING').length;
  
  // Calculate highest severity score
  const highPriorityTotal = incidents.filter(i => (i.severity * i.affectedPeople) > 10000 && i.status !== 'RESOLVED').length;
  
  // Resources stats
  const totalResources = resources.reduce((acc, r) => acc + r.quantity, 0);
  const availableResources = resources.filter(r => r.status === 'AVAILABLE').reduce((acc, r) => acc + r.quantity, 0);
  const assignedResources = resources.filter(r => r.status === 'ASSIGNED').reduce((acc, r) => acc + r.quantity, 0);
  
  // Shelters occupancy
  let totalCapacity = 0;
  let totalOccupancy = 0;
  shelters.forEach(s => {
    totalCapacity += s.capacity;
    totalOccupancy += s.occupancy;
  });
  
  const shelterOccupancyRate = totalCapacity > 0 ? parseFloat(((totalOccupancy / totalCapacity) * 100).toFixed(1)) : 0;

  // District wise counts
  const districtAnalytics: Record<string, { incidentCount: number; affectedPeople: number }> = {};
  incidents.forEach(inc => {
    if (!districtAnalytics[inc.district]) {
      districtAnalytics[inc.district] = { incidentCount: 0, affectedPeople: 0 };
    }
    districtAnalytics[inc.district].incidentCount++;
    if (inc.status !== 'RESOLVED' && inc.status !== 'CLOSED') {
      districtAnalytics[inc.district].affectedPeople += inc.affectedPeople;
    }
  });

  res.json({
    totalIncidents,
    activeIncidents,
    pendingIncidents,
    highPriorityTotal,
    resources: {
      total: totalResources,
      available: availableResources,
      assigned: assignedResources
    },
    shelters: {
      totalCapacity,
      totalOccupancy,
      occupancyRatePercent: shelterOccupancyRate
    },
    districtAnalytics
  });
});

// ============================================================
// VITE DEV SERVER & PRODUCTION ROUTING MIDDLEWARES SETUP
// ============================================================

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Sri Lanka DRS Server] Emergency coordination engine fully active on port ${PORT}`);
  });
}

start();
