import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  User, 
  Sparkles, 
  RefreshCw, 
  Check, 
  Clock, 
  FileText, 
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Navigation,
  AlertCircle
} from 'lucide-react';
import { PriorityBadge, StatusBadge, CategoryBadge } from './Badges';
import { updateReport, fetchReportById, getReportImageUrl } from '../api';
import { hasValidCoordinates, hasMeaningfulAddress, getGoogleMapsDirectionsUrl } from '../utils/geo';

const QUICK_COLLECTORS = [
  'Ramesh Kumar (Hazmat Team)',
  'Anita Sen (Rapid Response)',
  'Vikram Patil (Recyclables)',
  'Suresh Gowda (General)',
];

export default function ReportDetailModal({ report: initialReport, onClose, onUpdated }) {
  const [report, setReport] = useState(initialReport);
  const [status, setStatus] = useState(initialReport.status);
  const [collector, setCollector] = useState(initialReport.assigned_collector || '');
  const [eta, setEta] = useState(initialReport.estimated_collection_date || '');
  const [notes, setNotes] = useState(initialReport.internal_notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state if initialReport changes
  useEffect(() => {
    setReport(initialReport);
    setStatus(initialReport.status);
    setCollector(initialReport.assigned_collector || '');
    setEta(initialReport.estimated_collection_date || '');
    setNotes(initialReport.internal_notes || '');
  }, [initialReport]);

  const handleSave = async (recalc = false) => {
    setIsSaving(true);
    setErrorMsg('');
    try {
      const payload = {
        status,
        assigned_collector: collector.trim() || null,
        estimated_collection_date: eta.trim() || null,
        internal_notes: notes.trim() || null,
        recalculate_priority: recalc
      };

      const updated = await updateReport(report.report_id, payload, 'Dispatcher Admin');
      setReport(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update report');
    } finally {
      setIsSaving(false);
      setIsRecalculating(false);
    }
  };

  const handleRecalculate = () => {
    setIsRecalculating(true);
    handleSave(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-800 to-forest-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-700/60 rounded-lg text-emerald-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm tracking-wide text-emerald-200 font-bold">
                  {report.report_id}
                </span>
                {report.is_demo && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-600/40 text-emerald-100 border border-emerald-500/30">
                    Demo Data
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Report Inspection &amp; Operations
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-emerald-700/50 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Report details updated and persisted successfully!</span>
            </div>
          )}

          {/* Top Quick Status & Priority Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Current Status
              </span>
              <StatusBadge status={report.status} />
              <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Updated: {new Date(report.updated_at).toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Waste Category &amp; Severity
              </span>
              <div className="flex items-center gap-2">
                <CategoryBadge category={report.category} />
                <span className="text-xs text-slate-500">
                  User: <strong className="text-slate-700">{report.reported_severity}</strong>
                </span>
              </div>
            </div>

            <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  AI Priority Engine
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  {report.priority_score}/100
                </span>
              </div>
              <PriorityBadge priority={report.calculated_priority} score={report.priority_score} />
            </div>
          </div>

          {/* Core Info & Photo Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Description & Location */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Report Description
                </label>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed">
                  {report.description}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Location &amp; Navigation
                </label>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  {hasMeaningfulAddress(report) ? (
                    <div className="flex items-start gap-2 text-sm font-medium text-slate-800">
                      <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{report.location_address}</span>
                    </div>
                  ) : hasValidCoordinates(report) ? (
                    <div className="flex items-start gap-2 text-sm font-medium text-slate-800">
                      <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span className="font-mono text-xs">GPS: {parseFloat(report.latitude).toFixed(6)}, {parseFloat(report.longitude).toFixed(6)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Location unavailable</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                    {hasValidCoordinates(report) ? (
                      <span className="text-slate-500 font-mono text-[11px]">
                        Lat: {parseFloat(report.latitude).toFixed(4)}, Lng: {parseFloat(report.longitude).toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">No GPS coordinates recorded (Address lookup)</span>
                    )}

                    {getGoogleMapsDirectionsUrl(report) ? (
                      <a 
                        href={getGoogleMapsDirectionsUrl(report)}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Get Directions</span>
                        <ExternalLink className="w-3 h-3 text-emerald-200" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed opacity-60"
                        title="Location unavailable for this report"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Directions Unavailable</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Explainable AI Reason Breakdown */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Explainable AI Score Breakdown
                  </label>
                  <button
                    onClick={handleRecalculate}
                    disabled={isRecalculating || isSaving}
                    className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                    title="Recalculate priority based on aging time and location clustering"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRecalculating ? 'animate-spin' : ''}`} />
                    Recalculate Score
                  </button>
                </div>
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1.5">
                  {report.priority_reasons && report.priority_reasons.length > 0 ? (
                    report.priority_reasons.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-emerald-950">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">Standard algorithmic baseline score applied.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Photo Preview & Verification */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Visual Evidence / Uploaded Photo
                </label>
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center min-h-[220px] max-h-[260px] relative group">
                  {report.image_url ? (
                    <img 
                      src={getReportImageUrl(report.image_url)} 
                      alt="Waste Report Evidence"
                      className="w-full h-full object-cover max-h-[260px]"
                    />
                  ) : (
                    <div className="text-center p-6 text-slate-400">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                      <p className="text-xs">No photograph attached with this report.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Audit Timeline */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Status Timeline &amp; Audit Trail
                </label>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 max-h-[160px] overflow-y-auto space-y-3">
                  {report.timeline && report.timeline.length > 0 ? (
                    report.timeline.map((event, idx) => (
                      <div key={idx} className="flex items-start gap-3 relative">
                        {idx < report.timeline.length - 1 && (
                          <div className="absolute left-2.5 top-5 bottom-0 w-0.5 bg-slate-200 -z-10" />
                        )}
                        <div className="w-5 h-5 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-emerald-700" />
                        </div>
                        <div className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">{event.status}</span>
                            <span className="text-slate-400 font-normal">by {event.actor}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {event.note && (
                            <p className="text-slate-600 mt-0.5 italic">{event.note}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400">Initial report logged.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Operations & Dispatch Form (Admin Controls) */}
          <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                Dispatch &amp; Operations Management
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Changes persist directly to SQLite database
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Change Status */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Collection Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              {/* Collector Assignment */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Assign Collector
                </label>
                <input
                  type="text"
                  value={collector}
                  onChange={(e) => setCollector(e.target.value)}
                  placeholder="e.g. Ramesh Kumar (Hazmat Team)"
                  className="w-full text-sm rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Estimated Collection Date/Time */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Estimated Collection Time
                </label>
                <input
                  type="text"
                  value={eta}
                  onChange={(e) => setEta(e.target.value)}
                  placeholder="e.g. Today, 5:30 PM"
                  className="w-full text-sm rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Quick Collector Selection Chips */}
            <div>
              <span className="text-[11px] font-medium text-slate-500 mr-2">Quick Collector Presets:</span>
              <div className="inline-flex flex-wrap gap-1.5 mt-1">
                {QUICK_COLLECTORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCollector(c)}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-colors"
                  >
                    + {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Internal Notes */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Internal Dispatch Note
              </label>
              <textarea
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add special instructions, vehicle numbers, or recycling destination notes..."
                className="w-full text-sm rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-500/20 shadow-md shadow-emerald-600/10 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving Updates...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Operations Update
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
