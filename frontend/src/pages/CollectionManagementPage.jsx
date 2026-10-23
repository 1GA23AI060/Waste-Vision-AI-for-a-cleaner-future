import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  RefreshCw, 
  ArrowUpDown, 
  UserCheck, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Truck, 
  ShieldAlert, 
  ArrowRight,
  Eye,
  Edit3
} from 'lucide-react';
import { fetchReports, updateReport } from '../api';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../components/Badges';

export default function CollectionManagementPage({ onSelectReport, isAdmin }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [priority, setPriority] = useState('All');
  const [sortBy, setSortBy] = useState('priority_high'); // priority_high, newest, oldest, priority_low

  // Inline Quick Update State
  const [updatingId, setUpdatingId] = useState(null);

  const loadReports = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchReports({
        status,
        category,
        priority,
        search,
        sort_by: sortBy
      });
      setReports(data);
    } catch (err) {
      console.error('Failed to load operations reports:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [status, category, priority, search, sortBy]);

  const handleQuickStatusChange = async (report, newStatus) => {
    setUpdatingId(report.report_id);
    try {
      const updated = await updateReport(
        report.report_id, 
        { status: newStatus },
        'Dispatcher Quick Action'
      );
      setReports((prev) => prev.map((r) => r.report_id === updated.report_id ? updated : r));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Waste Operations &amp; Dispatch
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
              Operations Center
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Assign pickup drivers, monitor collection timelines, and manage civic reports.
          </p>
        </div>

        <button
          onClick={() => loadReports(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Sync Operations</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Box */}
          <div className="relative lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search ID, location, driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 bg-slate-50/50 pl-9 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-xs rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Categories</option>
            <option value="Wet">Wet Waste</option>
            <option value="Dry">Dry Waste</option>
            <option value="Plastic">Plastic</option>
            <option value="E-waste">E-waste</option>
            <option value="Hazardous">Hazardous</option>
            <option value="Other">Other</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="text-xs rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="priority_high">Sort: Priority (Highest First)</option>
            <option value="priority_low">Sort: Priority (Lowest First)</option>
            <option value="newest">Sort: Newest Logged</option>
            <option value="oldest">Sort: Oldest Awaiting</option>
          </select>

        </div>
      </div>

      {/* Reports Grid / Cards View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reports.length > 0 ? (
          reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-800">
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
              </div>

              {/* Card Middle: Location & Assignment */}
              <div className="p-5 bg-slate-50/50 space-y-2 text-xs flex-1">
                <div className="flex items-start gap-1.5 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="truncate" title={report.location_address}>{report.location_address}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-medium text-slate-700 truncate max-w-[150px]">
                      {report.assigned_collector || 'Unassigned'}
                    </span>
                  </div>
                  {report.estimated_collection_date && (
                    <span className="text-[11px] text-slate-400">
                      ETA: {report.estimated_collection_date}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: Actions */}
              <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                {/* Fast status cycler */}
                <select
                  value={report.status}
                  disabled={updatingId === report.report_id}
                  onChange={(e) => handleQuickStatusChange(report, e.target.value)}
                  className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>

                <button
                  onClick={() => onSelectReport(report)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect &amp; Manage</span>
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Operations Records Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No reports match your selected search keyword or filter combination.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
