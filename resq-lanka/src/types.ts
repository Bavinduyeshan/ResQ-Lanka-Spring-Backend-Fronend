export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  COORDINATOR = 'COORDINATOR'
}

export interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export type IncidentStatus = 'ACTIVE' | 'RESOLVED' | 'PENDING' | 'CLOSED';

export interface Incident {
  id: number;
  disasterType: string;
  district: string;
  severity: number; // 1 to 10
  affectedPeople: number;
  priorityScore: number; // severity * affectedPeople
  status: IncidentStatus;
  description: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export type ResourceType = 
  | 'AMBULANCE' 
  | 'FIRE_TRUCK' 
  | 'RESCUE_BOAT' 
  | 'MEDICAL_TEAM' 
  | 'HELICOPTER' 
  | 'FOOD_SUPPLY' 
  | 'WATER_SUPPLY' 
  | 'SHELTER_KIT';

export type ResourceStatus = 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'OUT_OF_SERVICE';

export interface Resource {
  id: number;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  district: string;
  quantity: number;
  assignedIncidentId: number | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ShelterStatus = 'OPEN' | 'FULL' | 'CLOSED' | 'UNDER_MAINTENANCE';

export interface Shelter {
  id: number;
  shelterName: string;
  district: string;
  address: string;
  capacity: number;
  occupancy: number;
  status: ShelterStatus;
  contactPerson?: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export type ActionType =
  | 'INCIDENT_CREATE'
  | 'INCIDENT_UPDATE'
  | 'INCIDENT_DELETE'
  | 'RESOURCE_CREATE'
  | 'RESOURCE_UPDATE'
  | 'RESOURCE_DELETE'
  | 'RESOURCE_ASSIGN'
  | 'SHELTER_CREATE'
  | 'SHELTER_UPDATE'
  | 'SHELTER_DELETE'
  | 'USER_LOGIN'
  | 'USER_LOGOUT';

export interface ActionHistory {
  id: number;
  actionType: ActionType;
  entityType?: string;
  entityId?: number;
  description: string;
  performedBy: string;
  previousState?: string; // JSON string
  newState?: string; // JSON string
  timestamp: string;
  undone: boolean;
}

// Emergency request reports that enter the FIFO Queue before becoming official Incidents
export interface EmergencyReport {
  id: string; // Temporary ID in queue
  disasterType: string;
  district: string;
  severity: number;
  affectedPeople: number;
  reporterName: string;
  reporterPhone: string;
  description: string;
  timestamp: string;
}
