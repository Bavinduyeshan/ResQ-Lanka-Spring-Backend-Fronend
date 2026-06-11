import React, { useState } from 'react';
import { Home, Plus, Users, ShieldAlert, CheckCircle, Search, HelpCircle, UserPlus, Trash2 } from 'lucide-react';
import { Shelter, ShelterStatus } from '../types';

interface SheltersManagerProps {
  shelters: Shelter[];
  onAddShelter: (data: any) => Promise<void>;
  onUpdateShelter: (id: number, data: any) => Promise<void>;
  onDeleteShelter: (id: number) => Promise<void>;
}

export default function SheltersManager({ shelters, onAddShelter, onUpdateShelter, onDeleteShelter }: SheltersManagerProps) {
  const [filterSelDistrict, setFilterSelDistrict] = useState('');
  const [shelterName, setShelterName] = useState('');
  const [district, setDistrict] = useState('Colombo');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState(500);
  const [occupancy, setOccupancy] = useState(0);
  const [status, setStatus] = useState<ShelterStatus>('OPEN');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matara', 'Galle', 
    'Jaffna', 'Trincomalee', 'Batticaloa', 'Kurunegala', 'Anuradhapura', 
    'Ratnapura', 'Badulla'
  ];

  const triggerAddShelter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shelterName || !capacity) return;

    await onAddShelter({
      shelterName,
      district,
      address,
      capacity,
      occupancy,
      status,
      contactPerson,
      contactPhone
    });

    // Clear state
    setShelterName('');
    setAddress('');
    setCapacity(500);
    setOccupancy(0);
    setContactPerson('');
    setContactPhone('');
    setIsFormOpen(false);
  };

// After (fixed):
  const handleUpdateOccupancy = async (shelter: Shelter, diff: number) => {
    const newOcc = Math.max(0, Math.min(shelter.capacity, shelter.occupancy + diff));
    await onUpdateShelter(shelter.id, { occupancy: newOcc });
  };
  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this rescue shelter?')) {
      await onDeleteShelter(id);
    }
  };

  const filteredShelters = shelters.filter(s => {
    const matchesSearch = s.shelterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = filterSelDistrict ? s.district === filterSelDistrict : true;
    return matchesSearch && matchesDistrict;
  });

  return (
    <div className="space-y-6" id="shelters-manager-panel">
      {/* Search Header Panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800">Shelter Management &amp; Occupancy</h2>
          <p className="text-sm text-slate-500 mt-1">Track physical capacities, update displaced occupancy, and organize intake registers.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          id="btn-register-shelter"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm cursor-pointer transition-all self-start sm:self-auto shrink-0"
        >
          <Home className="w-4 h-4" /> Declare Relief Shelter
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4" id="shelter-filter-bar">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search relief camp, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white"
          />
        </div>

        <div>
          <select
            value={filterSelDistrict}
            onChange={(e) => setFilterSelDistrict(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:bg-white cursor-pointer"
          >
            <option value="">Filter: All Sri Lankan Districts</option>
            {districts.map(dm => (
              <option key={dm} value={dm}>{dm}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Shelter grid and Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4" id="shelter-listings">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider pb-2 border-b border-slate-100">Regional Camps Status</h3>

          {filteredShelters.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
              <p>No registers matched district queries.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredShelters.map(she => {
                const occupancyPercent = she.capacity > 0 
                  ? Math.min(100, Math.round((she.occupancy / she.capacity) * 100))
                  : 0;

                let stateBadge = 'bg-slate-100 text-slate-600';
                if (she.status === 'OPEN') stateBadge = 'bg-green-50 text-green-700 font-bold';
                else if (she.status === 'FULL') stateBadge = 'bg-red-50 text-red-700 font-bold';
                else if (she.status === 'UNDER_MAINTENANCE') stateBadge = 'bg-amber-50 text-amber-700';

                return (
                  <div 
                    key={she.id}
                    className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${stateBadge}`}>
                            {she.status}
                          </span>
                          <h4 className="font-bold text-slate-700 text-base mt-2 font-sans leading-normal">{she.shelterName}</h4>
                          <p className="text-xs text-slate-400 mt-1 font-mono">District: {she.district}</p>
                        </div>
                        <button
                          onClick={() => handleDelete(she.id)}
                          className="p-1 text-slate-300 hover:text-red-500 rounded hover:bg-slate-50 transition-all cursor-pointer shrink-0"
                          id={`btn-del-shelter-${she.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-xs text-slate-500 font-semibold">
                          <span>Occupancy Capacity:</span>
                          <span>{she.occupancy} / {she.capacity} displaced</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${occupancyPercent >= 90 ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${occupancyPercent}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 mt-4 space-y-1">
                        <p>Address: <span className="font-medium text-slate-500">{she.address}</span></p>
                        {she.contactPerson && (
                          <p>Contacts: <span className="font-semibold text-slate-600">{she.contactPerson} ({she.contactPhone})</span></p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-3 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">S-ID: DMC-S{she.id}</span>
                      
                      {she.status !== 'CLOSED' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUpdateOccupancy(she, -50)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded cursor-pointer"
                          >
                            -50
                          </button>
                          <button
                            onClick={() => handleUpdateOccupancy(she, 50)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded cursor-pointer animate-pulse"
                          >
                            +50 Intake
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Shelter Enlistment Form */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 h-fit" id="shelter-sidebar-form">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide pb-2 border-b border-slate-200 flex items-center gap-1.5 mb-4">
            <Home className="text-blue-500 w-4 h-4" /> Relief Shelter Enrolment
          </h3>

          <form onSubmit={triggerAddShelter} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Relief Center Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Kandy Central Relief"
                value={shelterName}
                onChange={(e) => setShelterName(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-800"
              />
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
                <label className="block text-xs font-semibold text-slate-600 mb-1">State Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ShelterStatus)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-800"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="FULL">FULL</option>
                  <option value="UNDER_MAINTENANCE">UNDER MAINTENANCE</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Max Capacity *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Current Occupany</label>
                <input
                  type="number"
                  min="0"
                  value={occupancy}
                  onChange={(e) => setOccupancy(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Physical Address Address</label>
              <input
                type="text"
                placeholder="Village lane, Town square..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Silva"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="077xxxxxxx"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl mt-4 cursor-pointer"
            >
              Expose Shelter Capacity to Grid
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
