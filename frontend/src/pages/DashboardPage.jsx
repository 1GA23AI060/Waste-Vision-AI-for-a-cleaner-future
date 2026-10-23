import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  PlusCircle, 
  RefreshCw, 
  Filter, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Layers,
  MapPin,
  Calendar,
  Sparkles,
  Search
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { fetchStats, fetchReports } from '../api';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../components/Badges';

export default function DashboardPage({ setActiveTab, onSelectReport }) {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters for recent table
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsData, reportsData] = await Promise.all([
        fetchStats(),
        fetchReports({
          status: statusFilter,
          category: categoryFilter,
          priority: priorityFilter,
          search: searchQuery
        })
      ]);
      setStats(statsData);
      setReports(reportsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter, priorityFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Smart Waste Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Live DB
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time urban collection telemetry, AI priority distribution, and operational metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
            title="Refresh database metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Waste</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Reports */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
              Total Reports
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {loading ? '...' : stats?.total_reports ?? 0}
            </div>
            <span className="text-[11px] text-slate-400">Database total</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Collections */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-600 block uppercase tracking-wider">
              Pending Pickups
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
              {loading ? '...' : stats?.pending_reports ?? 0}
            </div>
            <span className="text-[11px] text-slate-400">Awaiting dispatch</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* High/Critical Priority */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-600 block uppercase tracking-wider">
              High / Critical
            </span>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">
              {loading ? '...' : (stats?.critical_priority_reports ?? 0) + (stats?.high_priority_reports ?? 0)}
            </div>
            <span className="text-[11px] text-rose-500 font-medium">Urgent attention</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Resolved Reports */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-600 block uppercase tracking-wider">
              Resolved Reports
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
              {loading ? '...' : stats?.resolved_reports ?? 0}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">
              {stats?.resolution_rate ?? 0}% closure rate
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-800">
                Reports by Waste Category
              </h2>
            </div>
            <span className="text-xs text-slate-400">Database Distribution</span>
          </div>

          <div className="h-64 w-full">
            {stats?.category_distribution && stats.category_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.category_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" name="Reports" radius={[6, 6, 0, 0]}>
                    {stats.category_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading category chart data...
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
                <PieIcon className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-800">
                Reports by Collection Status
              </h2>
            </div>
            <span className="text-xs text-slate-400">Workflow Progress</span>
          </div>

          <div className="h-64 w-full">
            {stats?.status_distribution && stats.status_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.status_distribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {stats.status_distribution.map((entry, index) => (
                      <Cell key={`cell-status-${index}`} fill={entry.color || '#3b82f6'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(val) => <span className="text-xs text-slate-600 font-medium">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading status chart data...
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Reports Table with Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Controls Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Waste Reports
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {reports.length} report{reports.length === 1 ? '' : 's'} matching current criteria
            </p>
          </div>

          {/* Filter Dropdowns and Search Input */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search ID, address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 bg-white pl-8 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Categories</option>
              <option value="Wet">Wet</option>
              <option value="Dry">Dry</option>
              <option value="Plastic">Plastic</option>
              <option value="E-waste">E-waste</option>
              <option value="Hazardous">Hazardous</option>
              <option value="Other">Other</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">AI Priority</th>
                <th className="py-3 px-4">Logged</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <tr 
                    key={report.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onSelectReport(report)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {report.report_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <CategoryBadge category={report.category} />
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-700 font-medium" title={report.location_address}>
                      {report.location_address}
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={report.calculated_priority} score={report.priority_score} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(report.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReport(report);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                      >
                        <span>Details</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <p className="font-medium text-sm">No waste reports found matching these filters.</p>
                    <button
                      onClick={() => {
                        setStatusFilter('All');
                        setCategoryFilter('All');
                        setPriorityFilter('All');
                        setSearchQuery('');
                      }}
                      className="mt-2 text-xs text-emerald-600 hover:underline font-semibold"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
