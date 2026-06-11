import React, { useState } from 'react';
import { FileText, Download, Code, FileSpreadsheet, Sparkles, LayoutList, Building, AlertCircle } from 'lucide-react';
import { Incident, Resource, Shelter } from '../types';

interface ReportsCentreProps {
  incidents: Incident[];
  resources: Resource[];
  shelters: Shelter[];
}

export default function ReportsCentre({ incidents, resources, shelters }: ReportsCentreProps) {
  const [selectedReport, setSelectedReport] = useState<'incidents' | 'resources' | 'shelters'>('incidents');

  // Trigger real CSV download
  const downloadCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = '';

    if (selectedReport === 'incidents') {
      filename = 'SL_Incident_Report.csv';
      headers = ['ID', 'Type', 'District', 'Severity', 'Affected', 'Priority Score', 'Status', 'Description', 'Created'];
      rows = incidents.map(i => [
        `DMC-${i.id}`,
        i.disasterType,
        i.district,
        i.severity.toString(),
        i.affectedPeople.toString(),
        (i.severity * i.affectedPeople).toString(),
        i.status,
        `"${i.description.replace(/"/g, '""')}"`,
        i.createdAt
      ]);
    } else if (selectedReport === 'resources') {
      filename = 'SL_Resource_Inventory.csv';
      headers = ['ID', 'Name', 'Type', 'Status', 'District Base', 'Quantity Capacity', 'notes'];
      rows = resources.map(r => [
        `R-ID-${r.id}`,
        r.name,
        r.type,
        r.status,
        r.district,
        r.quantity.toString(),
        `"${r.notes?.replace(/"/g, '""') || ''}"`
      ]);
    } else if (selectedReport === 'shelters') {
      filename = 'SL_Shelters_Occupancy.csv';
      headers = ['ID', 'Name', 'District', 'Physical Address', 'Max Capacity', 'Current Occupancy', 'Occupancy Rate %', 'Status'];
      rows = shelters.map(s => {
        const rate = s.capacity > 0 ? Math.round((s.occupancy / s.capacity) * 100) : 0;
        return [
          `S-ID-${s.id}`,
          s.shelterName,
          s.district,
          `"${s.address.replace(/"/g, '""')}"`,
          s.capacity.toString(),
          s.occupancy.toString(),
          `${rate}%`,
          s.status
        ];
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  };

  // Trigger real JSON download
  const downloadJSON = () => {
    let dataToExport: any = {};
    let filename = '';

    if (selectedReport === 'incidents') {
      dataToExport = incidents;
      filename = 'SL_Incidents_Payload.json';
    } else if (selectedReport === 'resources') {
      dataToExport = resources;
      filename = 'SL_Resources_Payload.json';
    } else if (selectedReport === 'shelters') {
      dataToExport = shelters;
      filename = 'SL_Shelters_Payload.json';
    }

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataToExport, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  return (
    <div className="space-y-6" id="reports-and-exports-view">
      {/* Header card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800 flex items-center gap-2">
            <FileText className="text-blue-500 w-5.5 h-5.5" /> Emergency Operations Reporting Suite
          </h2>
          <p className="text-sm text-slate-500 mt-1">Compile comprehensive logs, extract schemas, and export physical datasets instantly.</p>
        </div>
      </div>

      {/* Selectors and Control desk */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Switch panel */}
        <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs h-fit" id="report-type-selector-box">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Select Logs Context</p>
          
          <button
            onClick={() => setSelectedReport('incidents')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${selectedReport === 'incidents' ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
          >
            <AlertCircle className="w-4 h-4" /> Incident Declarations Log ({incidents.length})
          </button>

          <button
            onClick={() => setSelectedReport('resources')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${selectedReport === 'resources' ? 'bg-indigo-50 border border-indigo-200 text-indigo-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
          >
            <LayoutList className="w-4 h-4" /> Resources Dispatch Ledger ({resources.length})
          </button>

          <button
            onClick={() => setSelectedReport('shelters')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${selectedReport === 'shelters' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
          >
            <Building className="w-4 h-4" /> Shelter Capacity Ledger ({shelters.length})
          </button>

          <div className="border-t border-slate-100 pt-5 mt-4 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bulk Data Export</span>
            <div className="flex gap-2">
              <button
                onClick={downloadCSV}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg inline-flex items-center justify-center gap-1 cursor-pointer transition-colors"
                id="btn-export-csv"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> CSV Sheet
              </button>
              <button
                onClick={downloadJSON}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg inline-flex items-center justify-center gap-1 cursor-pointer transition-colors"
                id="btn-export-json"
              >
                <Code className="w-3.5 h-3.5" /> JSON Schema
              </button>
            </div>
          </div>
        </div>

        {/* Live table Preview */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between" id="report-preview-log">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Live Data Registry Stream</h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded">
                <Sparkles className="w-3 h-3 text-amber-500" /> Compiled &bull; Real Time
              </span>
            </div>

            <div className="overflow-x-auto">
              {selectedReport === 'incidents' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-2.5">ID</th>
                      <th>Category</th>
                      <th>District</th>
                      <th>Severity</th>
                      <th>Affected</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map(inc => (
                      <tr key={inc.id} className="border-b border-slate-50 font-mono text-slate-600 hover:bg-slate-50/50">
                        <td className="py-2.5 font-bold text-blue-600">DMC-{inc.id}</td>
                        <td className="font-sans text-slate-800 font-semibold">{inc.disasterType}</td>
                        <td className="font-sans font-medium">{inc.district}</td>
                        <td className="font-bold">{inc.severity}/10</td>
                        <td>{inc.affectedPeople.toLocaleString()}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${inc.status === 'ACTIVE' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                            {inc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedReport === 'resources' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-2.5">Unit ID</th>
                      <th>Resource Descriptor</th>
                      <th>Classification</th>
                      <th>Status</th>
                      <th>Base Area</th>
                      <th>Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map(res => (
                      <tr key={res.id} className="border-b border-slate-50 font-mono text-slate-600 hover:bg-slate-50/50">
                        <td className="py-2.5 font-bold text-blue-600">DMC-R{res.id}</td>
                        <td className="font-sans text-slate-800 font-semibold">{res.name}</td>
                        <td>{res.type}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${res.status === 'AVAILABLE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {res.status}
                          </span>
                        </td>
                        <td className="font-sans">{res.district}</td>
                        <td className="font-bold">{res.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedReport === 'shelters' && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-2.5">S-ID</th>
                      <th>Rescue Centre</th>
                      <th>District Base</th>
                      <th className="text-right">Max Capacity</th>
                      <th className="text-right">Occupancy</th>
                      <th>Operational Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shelters.map(she => (
                      <tr key={she.id} className="border-b border-slate-50 font-mono text-slate-600 hover:bg-slate-50/50">
                        <td className="py-2.5 font-bold text-blue-600">DMC-S{she.id}</td>
                        <td className="font-sans text-slate-800 font-semibold">{she.shelterName}</td>
                        <td className="font-sans">{she.district}</td>
                        <td className="text-right font-bold">{she.capacity}</td>
                        <td className="text-right font-bold text-amber-600">{she.occupancy}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${she.status === 'OPEN' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {she.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
