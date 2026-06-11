import React, { useState } from 'react';
import { Truck, ShieldPlus, Check, X, Info, HelpCircle, UserCheck } from 'lucide-react';
import { Resource, Incident, ResourceType, ResourceStatus } from '../types';

interface ResourceManagementProps {
  resources: Resource[];
  incidents: Incident[];
  onAddResource: (data: any) => Promise<void>;
  onAssignResource: (resourceId: number, incidentId: number | null) => Promise<void>;
  onUpdateResource: (id: number, data: any) => Promise<void>;
  onDeleteResource: (id: number) => Promise<void>;
}

export default function ResourceManagement({
  resources,
  incidents,
  onAddResource,
  onAssignResource,
  onUpdateResource,
  onDeleteResource
}: ResourceManagementProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<ResourceType>('AMBULANCE');
  const [status, setStatus] = useState<ResourceStatus>('AVAILABLE');
  const [district, setDistrict] = useState('Colombo');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const [allocatingResourceId, setAllocatingResourceId] = useState<number | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('');

  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matara', 'Galle', 
    'Jaffna', 'Trincomalee', 'Batticaloa', 'Kurunegala', 'Anuradhapura', 
    'Ratnapura', 'Badulla'
  ];

  const resourceTypes: ResourceType[] = [
    'AMBULANCE', 'FIRE_TRUCK', 'RESCUE_BOAT', 'MEDICAL_TEAM', 
    'HELICOPTER', 'FOOD_SUPPLY', 'WATER_SUPPLY', 'SHELTER_KIT'
  ];

  const triggerAddResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity) return;

    await onAddResource({
      name,
      type,
      status,
      district,
      quantity,
      notes
    });

    // Reset Form
    setName('');
    setType('AMBULANCE');
    setStatus('AVAILABLE');
    setDistrict('Colombo');
    setQuantity(1);
    setNotes('');
    setIsFormOpen(false);
  };

  const handleStartAllocation = (res: Resource) => {
    setAllocatingResourceId(res.id);
    setSelectedIncidentId(res.assignedIncidentId ? res.assignedIncidentId.toString() : '');
  };

  const handleConfirmAllocation = async (resId: number) => {
    const incId = selectedIncidentId ? parseInt(selectedIncidentId, 10) : null;
    await onAssignResource(resId, incId);
    setAllocatingResourceId(null);
  };

  return (
    <div className="space-y-6" id="resources-management-view">
      {/* Header Panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800">Operational Resources Desk</h2>
          <p className="text-sm text-slate-500 mt-1">Register logistics reserves, route rescue boats, and assign medic squads.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          id="btn-add-resource"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm cursor-pointer transition-all self-start sm:self-auto shrink-0"
        >
          <ShieldPlus className="w-4 h-4" /> Enlist Logistic Pod
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resources Cards Column */}
        <div className="md:col-span-2 space-y-4" id="resources-listing-area">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider pb-2 border-b border-slate-100">Live Logistics Grid</h3>
          
          {resources.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
              <p>No resources registered.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resources.map(res => {
                let badgeStyle = 'bg-slate-100 text-slate-700';
                if (res.status === 'AVAILABLE') badgeStyle = 'bg-green-50 text-green-700 font-bold';
                else if (res.status === 'ASSIGNED') badgeStyle = 'bg-red-50 text-red-700';
                else if (res.status === 'MAINTENANCE') badgeStyle = 'bg-amber-50 text-amber-700';

                const assignedInc = incidents.find(i => i.id === res.assignedIncidentId);

                return (
                  <div 
                    key={res.id}
                    className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}>
                            {res.status}
                          </span>
                          <h4 className="font-bold text-slate-700 text-base mt-2 font-mono">{res.name}</h4>
                        </div>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 rounded px-2 py-1 font-mono">
                          QTY: {res.quantity}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 mt-2 space-y-1">
                        <p>Sector District: <strong className="text-slate-600">{res.district}</strong></p>
                        {res.notes && <p className="italic font-light">Notes: "{res.notes}"</p>}
                      </div>

                      {assignedInc ? (
                        <div className="mt-4 p-3 bg-red-50 border border-red-100 text-[11px] text-red-800 rounded-lg">
                          <strong>Active Assignment:</strong> Dispatch-allocated to incident [ID: {assignedInc.id}] {assignedInc.disasterType} in {assignedInc.district}.
                        </div>
                      ) : (
                        <div className="mt-4 p-3 bg-green-50/50 border border-green-50 text-[11px] text-green-800 rounded-lg">
                          <strong>Standby Alert:</strong> Ready for route commands.
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-3 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">R-ID: DMC-{res.id}</span>
                      
                      {allocatingResourceId === res.id ? (
                        <div className="flex items-center gap-1">
                          <select
                            value={selectedIncidentId}
                            onChange={(e) => setSelectedIncidentId(e.target.value)}
                            className="px-2 py-1 bg-slate-50 border border-slate-200 text-slate-800 text-[11px] rounded"
                          >
                            <option value="">Awaiting Dispatch (Standby)</option>
                            {incidents.filter(i => i.status === 'ACTIVE' || i.status === 'PENDING').map(i => (
                              <option key={i.id} value={i.id}>[ID: {i.id}] {i.disasterType} &bull; {i.district}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleConfirmAllocation(res.id)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                            id={`btn-confirm-${res.id}`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartAllocation(res)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <UserCheck className="w-3 h-3" /> Allocate Route
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Enlist / Create Section */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 h-fit" id="resources-sidebar-panel">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide pb-2 border-b border-slate-200 flex items-center gap-1.5 mb-4">
            <Truck className="text-blue-500 w-4 h-4" /> Logistics Enlist Form
          </h3>

          <form onSubmit={triggerAddResourceSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Resource Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Galle Rescue Pod Bravo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Utility Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ResourceType)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-800"
                >
                  {resourceTypes.map(rt => (
                    <option key={rt} value={rt}>{rt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">State Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ResourceStatus)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-800"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                  <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">District Base</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-800"
                >
                  {districts.map(dm => (
                    <option key={dm} value={dm}>{dm}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Notes Brief</label>
              <textarea
                rows={3}
                placeholder="Dispatches protocols..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-800 resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl mt-4 cursor-pointer"
            >
              Enlist Logistic Unit onto Registry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
