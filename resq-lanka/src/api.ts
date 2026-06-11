// ============================================================
// api.ts — SL Disaster Management API Client
// Place this file at: src/api.ts
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// ─── Token helpers ───────────────────────────────────────────
export const getToken = (): string | null => localStorage.getItem("token");
export const setToken = (token: string) => localStorage.setItem("token", token);
export const clearToken = () => localStorage.removeItem("token");

// ─── Core fetch wrapper ──────────────────────────────────────
async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(error.message || `Request failed: ${res.status}`);
    }

    // Some endpoints return empty body (e.g. 204)
    const text = await res.text();
    return text ? JSON.parse(text) : ({} as T);
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
const put = <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) });
const patch = <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
const del = <T>(path: string) => request<T>(path, { method: "DELETE" });

// ============================================================
// TYPES
// ============================================================

// ─── Auth ────────────────────────────────────────────────────
export interface RegisterRequest {
    fullName: string;
    username: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    tokenType: string;
    userId: number;
    username: string;
    fullName: string;
    email: string;
    role: "USER" | "ADMIN" | "COORDINATOR";
}

export interface MessageResponse {
    message: string;
    success: boolean;
}

// ─── Incident ────────────────────────────────────────────────
export type IncidentStatus = "ACTIVE" | "RESOLVED" | "PENDING" | "CLOSED";

export interface IncidentRequest {
    disasterType: string;
    district: string;
    severity: number; // 1–10
    affectedPeople: number;
    description?: string;
    location?: string;
    status?: IncidentStatus;
}

export interface IncidentResponse {
    id: number;
    disasterType: string;
    district: string;
    severity: number;
    affectedPeople: number;
    priorityScore: number;
    status: IncidentStatus;
    description?: string;
    location?: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Resource ────────────────────────────────────────────────
export type ResourceType =
    | "AMBULANCE"
    | "FIRE_TRUCK"
    | "RESCUE_BOAT"
    | "MEDICAL_TEAM"
    | "HELICOPTER"
    | "FOOD_SUPPLY"
    | "WATER_SUPPLY"
    | "SHELTER_KIT";

export type ResourceStatus =
    | "AVAILABLE"
    | "ASSIGNED"
    | "MAINTENANCE"
    | "OUT_OF_SERVICE";

export interface ResourceRequest {
    name: string;
    type: ResourceType;
    status?: ResourceStatus;
    district?: string;
    quantity?: number;
    notes?: string;
}

export interface ResourceResponse {
    id: number;
    name: string;
    type: ResourceType;
    status: ResourceStatus;
    district?: string;
    quantity: number;
    assignedIncidentId?: number;
    assignedIncidentType?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ResourceAssignRequest {
    resourceId: number;
    incidentId: number;
}

// ─── Shelter ─────────────────────────────────────────────────
export type ShelterStatus = "OPEN" | "FULL" | "CLOSED" | "UNDER_MAINTENANCE";

export interface ShelterRequest {
    shelterName: string;
    district: string;
    address?: string;
    capacity: number;
    occupancy?: number;
    status?: ShelterStatus;
    contactPerson?: string;
    contactPhone?: string;
}

export interface ShelterResponse {
    id: number;
    shelterName: string;
    district: string;
    address?: string;
    capacity: number;
    occupancy: number;
    occupancyRate: number;
    status: ShelterStatus;
    contactPerson?: string;
    contactPhone?: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Route ───────────────────────────────────────────────────
export interface RouteRequest {
    source: string;
    destination: string;
}

export interface RouteSegment {
    from: string;
    to: string;
    distanceKm: number;
}

export interface RouteResponse {
    source: string;
    destination: string;
    path: string[];
    totalDistanceKm: number;
    numberOfStops: number;
    pathFound: boolean;
    message?: string;
    segments: RouteSegment[];
}

// ─── Dashboard ───────────────────────────────────────────────
export interface DashboardStats {
    totalIncidents: number;
    activeIncidents: number;
    highPriorityIncidents: number;
    resolvedIncidents: number;
    availableResources: number;
    totalResources: number;
    totalShelterCapacity: number;
    totalShelterOccupancy: number;
    shelterOccupancyRate: number;
    incidentsByDistrict: Record<string, number>;
    incidentsByType: Record<string, number>;
    resourcesByType: Record<string, number>;
    topPriorityIncidents: IncidentResponse[];
}

// ─── Action History ──────────────────────────────────────────
export type ActionType =
    | "INCIDENT_CREATE" | "INCIDENT_UPDATE" | "INCIDENT_DELETE"
    | "RESOURCE_CREATE" | "RESOURCE_UPDATE" | "RESOURCE_DELETE" | "RESOURCE_ASSIGN"
    | "SHELTER_CREATE" | "SHELTER_UPDATE" | "SHELTER_DELETE"
    | "USER_LOGIN" | "USER_LOGOUT";

export interface ActionHistory {
    id: number;
    actionType: ActionType;
    entityType?: string;
    entityId?: number;
    description?: string;
    performedBy?: string;
    previousState?: string;
    newState?: string;
    timestamp: string;
    undone: boolean;
}

export interface StackInfo {
    [key: string]: unknown;
}

// ============================================================
// AUTH API  →  /api/auth
// ============================================================
export const authApi = {
    register: (data: RegisterRequest) =>
        post<MessageResponse>("/auth/register", data),

    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const res = await post<AuthResponse>("/auth/login", data);
        setToken(res.token);
        return res;
    },

    logout: async (): Promise<MessageResponse> => {
        const res = await post<MessageResponse>("/auth/logout");
        clearToken();
        return res;
    },
};

// ============================================================
// INCIDENT API  →  /api/incidents
// ============================================================
export const incidentApi = {
    // CRUD
    getAll: () => get<IncidentResponse[]>("/incidents"),
    getById: (id: number) => get<IncidentResponse>(`/incidents/${id}`),
    create: (data: IncidentRequest) => post<IncidentResponse>("/incidents", data),
    update: (id: number, data: IncidentRequest) =>
        put<IncidentResponse>(`/incidents/${id}`, data),
    delete: (id: number) => del<MessageResponse>(`/incidents/${id}`),

    // Filter & Search
    filter: (params: {
        district?: string;
        status?: IncidentStatus;
        minSeverity?: number;
    }) => {
        const q = new URLSearchParams();
        if (params.district) q.set("district", params.district);
        if (params.status) q.set("status", params.status);
        if (params.minSeverity !== undefined)
            q.set("minSeverity", String(params.minSeverity));
        return get<IncidentResponse[]>(`/incidents/filter?${q}`);
    },

    searchByType: (type: string) =>
        get<IncidentResponse[]>(`/incidents/search?type=${encodeURIComponent(type)}`),

    // Priority Queue (Max-Heap)
    getPriorityQueue: () => get<IncidentResponse[]>("/incidents/priority-queue"),
    peekHighestPriority: () =>
        get<IncidentResponse | MessageResponse>("/incidents/priority-queue/peek"),
    extractHighestPriority: () =>
        post<IncidentResponse | MessageResponse>("/incidents/priority-queue/extract"),
    getPriorityQueueSize: () =>
        get<{ size: number }>("/incidents/priority-queue/size"),

    // FIFO Queue
    getQueue: () => get<IncidentResponse[]>("/incidents/queue"),
    dequeue: () =>
        post<IncidentResponse | MessageResponse>("/incidents/queue/dequeue"),
    peekQueue: () =>
        get<IncidentResponse | MessageResponse>("/incidents/queue/peek"),

    // Utility
    refreshHeap: () => post<MessageResponse>("/incidents/refresh-heap"),
};

// ============================================================
// RESOURCE API  →  /api/resources
// ============================================================
export const resourceApi = {
    getAll: () => get<ResourceResponse[]>("/resources"),
    getById: (id: number) => get<ResourceResponse>(`/resources/${id}`),
    create: (data: ResourceRequest) => post<ResourceResponse>("/resources", data),
    update: (id: number, data: ResourceRequest) =>
        put<ResourceResponse>(`/resources/${id}`, data),
    delete: (id: number) => del<MessageResponse>(`/resources/${id}`),

    assign: (data: ResourceAssignRequest) =>
        post<ResourceResponse>("/resources/assign", data),
    unassign: (id: number) =>
        post<ResourceResponse>(`/resources/${id}/unassign`),

    getByStatus: (status: ResourceStatus) =>
        get<ResourceResponse[]>(`/resources/status/${status}`),
    getByType: (type: ResourceType) =>
        get<ResourceResponse[]>(`/resources/type/${type}`),
    getByIncident: (incidentId: number) =>
        get<ResourceResponse[]>(`/resources/incident/${incidentId}`),
};

// ============================================================
// SHELTER API  →  /api/shelters
// ============================================================
export const shelterApi = {
    getAll: () => get<ShelterResponse[]>("/shelters"),
    getById: (id: number) => get<ShelterResponse>(`/shelters/${id}`),
    create: (data: ShelterRequest) => post<ShelterResponse>("/shelters", data),
    update: (id: number, data: ShelterRequest) =>
        put<ShelterResponse>(`/shelters/${id}`, data),
    delete: (id: number) => del<MessageResponse>(`/shelters/${id}`),

    updateOccupancy: (id: number, occupancy: number) =>
        patch<ShelterResponse>(`/shelters/${id}/occupancy`, { occupancy }),

    getByDistrict: (district: string) =>
        get<ShelterResponse[]>(`/shelters/district/${encodeURIComponent(district)}`),
    getAvailable: () => get<ShelterResponse[]>("/shelters/available"),
};

// ============================================================
// ROUTE API  →  /api/route
// ============================================================
export const routeApi = {
    findShortestPath: (data: RouteRequest) =>
        post<RouteResponse>("/route/shortest-path", data),
    getAllDistricts: () => get<string[]>("/route/districts"),
    getNeighbors: (district: string) =>
        get<RouteSegment[]>(`/route/neighbors/${encodeURIComponent(district)}`),
};

// ============================================================
// DASHBOARD API  →  /api/dashboard
// ============================================================
export const dashboardApi = {
    getStats: () => get<DashboardStats>("/dashboard/stats"),
};

// ============================================================
// ACTION HISTORY API  →  /api/actions
// ============================================================
export const actionApi = {
    getRecent: (limit = 20) =>
        get<ActionHistory[]>(`/actions/recent?limit=${limit}`),
    getStackInfo: () => get<StackInfo>("/actions/stack"),
    getStackHistory: () => get<ActionHistory[]>("/actions/stack/history"),
    peekLastAction: () =>
        get<ActionHistory | MessageResponse>("/actions/stack/peek"),
    undoLastAction: () =>
        post<ActionHistory | MessageResponse>("/actions/undo"),
    getStackSize: () => get<{ size: number }>("/actions/stack/size"),
};

// ============================================================
// REPORT API  →  /api/reports  (download helpers)
// ============================================================

/** Downloads a blob as a file in the browser */
function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

async function downloadReport(path: string, filename: string, mimeType: string) {
    const token = getToken();
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(`Report download failed: ${res.status}`);
    const blob = await res.blob();
    downloadBlob(new Blob([await blob.arrayBuffer()], { type: mimeType }), filename);
}

const today = () => new Date().toISOString().split("T")[0];

export const reportApi = {
    incidents: {
        downloadPdf: () =>
            downloadReport("/reports/incidents/pdf", `incidents_${today()}.pdf`, "application/pdf"),
        downloadCsv: () =>
            downloadReport("/reports/incidents/csv", `incidents_${today()}.csv`, "text/csv"),
        getJson: () => get<string>("/reports/incidents/json"),
    },
    resources: {
        downloadPdf: () =>
            downloadReport("/reports/resources/pdf", `resources_${today()}.pdf`, "application/pdf"),
        downloadCsv: () =>
            downloadReport("/reports/resources/csv", `resources_${today()}.csv`, "text/csv"),
    },
    shelters: {
        downloadPdf: () =>
            downloadReport("/reports/shelters/pdf", `shelters_${today()}.pdf`, "application/pdf"),
        downloadCsv: () =>
            downloadReport("/reports/shelters/csv", `shelters_${today()}.csv`, "text/csv"),
    },
};