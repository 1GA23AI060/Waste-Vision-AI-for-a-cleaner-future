import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Map as MapIcon, 
  MapPin, 
  Filter, 
  Sparkles, 
  Eye, 
  AlertTriangle, 
  Layers, 
  Info, 
  Calendar, 
  UserCheck, 
  Navigation, 
  ExternalLink, 
  CheckCircle2, 
  Grid, 
  Compass, 
  Slash,
  AlertCircle
} from 'lucide-react';
import { fetchReports } from '../api';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../components/Badges';
import { hasValidCoordinates, hasMeaningfulAddress, getGoogleMapsDirectionsUrl } from '../utils/geo';

// Helper component to safely recenter map and invalidate size on mount / data change
function MapController({ center, reportsCount }) {
  const map = useMap();

  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, map.getZoom());
    }
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map, center, reportsCount]);

  return null;
}

// Custom crisp SVG map marker icon based on priority level
function createPriorityMarkerIcon(priority) {
  let color = '#10B981';
  let badgeLabel = 'L';
  const p = (priority || '').toLowerCase();

  if (p === 'critical') {
    color = '#DC2626'; // Red
    badgeLabel = 'C';
  } else if (p === 'high') {
    color = '#EA580C'; // Orange
    badgeLabel = 'H';
  } else if (p === 'medium') {
    color = '#CA8A04'; // Yellow-Amber
    badgeLabel = 'M';
  }

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
      ">
        <span style="
          transform: rotate(45deg);
          color: #ffffff;
          font-weight: 800;
          font-size: 12px;
          font-family: system-ui, -apple-system, sans-serif;
        ">${badgeLabel}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export default function CollectionMapPage({ onSelectReport }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('split'); // 'split' (Map + List) or 'cards' (Full Location & Directions Grid)

  useEffect(() => {
    fetchReports({
      priority: priorityFilter,
      status: statusFilter,
    })
      .then((data) => setReports(data))
      .catch((err) => console.error('Failed to load map reports:', err))
      .finally(() => setLoading(false));
  }, [priorityFilter, statusFilter]);

  // Separate reports with coordinates vs address-only vs unavailable
  const mappedReports = useMemo(() => {
    return reports.filter((r) => hasValidCoordinates(r));
  }, [reports]);

  // Default center based on first geocoded report or city baseline
  const centerLat = mappedReports.length > 0 ? parseFloat(mappedReports[0].latitude) : 12.9716;
  const centerLng = mappedReports.length > 0 ? parseFloat(mappedReports[0].longitude) : 77.5946;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Collection Map &amp; Navigation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Live GIS
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time geospatial locations, priority pins, and one-click Google Maps driving directions for municipal collection routes.
          </p>
        </div>

        {/* Priority Legend */}
        <div className="flex items-center gap-3 text-xs bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs self-start sm:self-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600" />
            <span className="font-semibold text-slate-700">Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-600" />
            <span className="font-semibold text-slate-700">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="font-semibold text-slate-700">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700">Low</span>
          </div>
        </div>
      </div>

      {/* Filter and View Switcher Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            Filter Reports:
          </span>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High Only</option>
            <option value="Medium">Medium Only</option>
            <option value="Low">Low Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* View Switcher: Split Map/List vs Full Location Cards */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl p-0.5 bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'split'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map &amp; Directions</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Location Cards ({reports.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Interactive Leaflet Map (8 cols on desktop) */}
          <div className="lg:col-span-8 h-[600px] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200/90 shadow-md relative">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span>Loading report coordinates &amp; map tiles...</span>
              </div>
            ) : (
              <MapContainer
                key={`map-${centerLat}-${centerLng}-${mappedReports.length}`}
                center={[centerLat, centerLng]}
                zoom={13}
                scrollWheelZoom={true}
                className="w-full h-full"
                style={{ height: '100%', width: '100%' }}
              >
                <MapController center={[centerLat, centerLng]} reportsCount={mappedReports.length} />
                
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {mappedReports.map((report) => {
                  const directionsUrl = getGoogleMapsDirectionsUrl(report);
                  const latNum = parseFloat(report.latitude);
                  const lngNum = parseFloat(report.longitude);

                  return (
                    <Marker
                      key={report.id}
                      position={[latNum, lngNum]}
                      icon={createPriorityMarkerIcon(report.calculated_priority)}
                    >
                      <Popup className="custom-leaflet-popup">
                        <div className="p-1 space-y-2.5 max-w-[260px]">
                          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                            <span className="font-mono font-bold text-xs text-slate-900">
                              {report.report_id}
                            </span>
                            <PriorityBadge priority={report.calculated_priority} score={report.priority_score} showScore={false} />
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <CategoryBadge category={report.category} />
                            <StatusBadge status={report.status} />
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-tight">
                            {report.description}
                          </p>

                          <div className="text-[11px] text-slate-700 font-medium flex items-start gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="truncate">{report.location_address}</span>
                          </div>

                          {/* Action Buttons in Popup */}
                          <div className="pt-1 space-y-1.5">
                            {directionsUrl ? (
                              <a
                                href={directionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                              >
                                <Navigation className="w-3.5 h-3.5" />
                                <span>Get Directions (Google Maps)</span>
                                <ExternalLink className="w-3 h-3 text-emerald-200" />
                              </a>
                            ) : (
                              <button
                                disabled
                                className="w-full py-1.5 px-2 bg-slate-100 text-slate-400 font-medium text-xs rounded-lg border border-slate-200 cursor-not-allowed flex items-center justify-center gap-1"
                                title="Location unavailable"
                              >
                                <Navigation className="w-3.5 h-3.5" />
                                <span>Location Unavailable</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onSelectReport(report)}
                              className="w-full py-1 px-2 text-slate-700 hover:text-emerald-800 hover:bg-slate-50 font-semibold text-xs rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect Details</span>
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            )}
          </div>

          {/* Location & Directions Sidebar List (4 cols on desktop) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4 flex flex-col h-[600px]">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  Report Locations &amp; Directions
                </h3>
                <span className="text-xs text-slate-400 font-medium font-mono">
                  {reports.length} Total
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Click "Get Directions" to open real driving &amp; transit routes via Google Maps.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {reports.length > 0 ? (
                reports.map((report) => {
                  const hasCoords = hasValidCoordinates(report);
                  const hasAddr = hasMeaningfulAddress(report);
                  const directionsUrl = getGoogleMapsDirectionsUrl(report);

                  return (
                    <div
                      key={report.id}
                      className="p-3.5 rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-xs transition-all bg-white space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {report.report_id}
                        </span>
                        <PriorityBadge priority={report.calculated_priority} score={report.priority_score} showScore={false} />
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <CategoryBadge category={report.category} />
                        <StatusBadge status={report.status} />
                      </div>

                      {/* Location text or Location Unavailable */}
                      <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        {hasAddr ? (
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="font-medium line-clamp-2">{report.location_address}</span>
                          </div>
                        ) : hasCoords ? (
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="font-mono text-[11px] text-slate-600">
                              GPS: {parseFloat(report.latitude).toFixed(4)}, {parseFloat(report.longitude).toFixed(4)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>Location unavailable</span>
                          </div>
                        )}

                        {hasCoords && (
                          <div className="mt-1 pt-1 border-t border-slate-200/50 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                            <span>Lat: {parseFloat(report.latitude).toFixed(4)}, Lng: {parseFloat(report.longitude).toFixed(4)}</span>
                            <span className="text-emerald-700 font-semibold">Geotagged</span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons: Get Directions & Inspect */}
                      <div className="flex items-center gap-2 pt-0.5">
                        {directionsUrl ? (
                          <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Get Directions</span>
                            <ExternalLink className="w-3 h-3 text-emerald-200" />
                          </a>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed opacity-60"
                            title="Location unavailable for this report"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Directions Unavailable</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onSelectReport(report)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-emerald-800 hover:bg-slate-100 border border-slate-200 transition-colors"
                          title="Inspect full report details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                  <span>No reports found matching current filters.</span>
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* Full Location Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.map((report) => {
            const hasCoords = hasValidCoordinates(report);
            const hasAddr = hasMeaningfulAddress(report);
            const directionsUrl = getGoogleMapsDirectionsUrl(report);

            return (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {report.report_id}
                    </span>
                    <PriorityBadge priority={report.calculated_priority} score={report.priority_score} />
                  </div>

                  <div className="flex items-center gap-2">
                    <CategoryBadge category={report.category} />
                    <StatusBadge status={report.status} />
                  </div>

                  <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                    {report.description}
                  </p>

                  {/* Location Box */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Target Destination
                    </span>
                    {hasAddr ? (
                      <div className="flex items-start gap-1.5 text-slate-800 font-medium">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{report.location_address}</span>
                      </div>
                    ) : hasCoords ? (
                      <div className="flex items-start gap-1.5 text-slate-800 font-medium">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-mono text-xs">
                          {parseFloat(report.latitude).toFixed(6)}, {parseFloat(report.longitude).toFixed(6)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Location unavailable</span>
                      </div>
                    )}

                    {hasCoords && (
                      <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>Lat: {parseFloat(report.latitude).toFixed(4)}, Lng: {parseFloat(report.longitude).toFixed(4)}</span>
                        <span className="text-emerald-700 font-bold">GPS Verified</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2.5">
                  {directionsUrl ? (
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Get Directions</span>
                      <ExternalLink className="w-3 h-3 text-emerald-200" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed opacity-60"
                      title="Location unavailable for this report"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Location Unavailable</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectReport(report)}
                    className="py-2 px-3 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
