import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Upload, 
  MapPin, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle, 
  Camera, 
  X, 
  LocateFixed, 
  Leaf, 
  Package, 
  Recycle, 
  Cpu, 
  Biohazard, 
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { submitReport, calculatePriorityPreview } from '../api';
import { PriorityBadge } from '../components/Badges';

const CATEGORIES = [
  { id: 'Wet', label: 'Wet Waste', icon: Leaf, desc: 'Kitchen scraps, food waste, organics' },
  { id: 'Dry', label: 'Dry Waste', icon: Package, desc: 'Paper, cardboard cartons, dry wood' },
  { id: 'Plastic', label: 'Plastic', icon: Recycle, desc: 'Single-use bottles, wrappers, bags' },
  { id: 'E-waste', label: 'E-waste', icon: Cpu, desc: 'Gadgets, batteries, wires, screens' },
  { id: 'Hazardous', label: 'Hazardous', icon: Biohazard, desc: 'Chemicals, paints, medical, sharps' },
  { id: 'Other', label: 'Other', icon: HelpCircle, desc: 'Foliage, mixed construction debris' },
];

const SEVERITIES = [
  { id: 'Low', label: 'Low', desc: 'Minor aesthetic issue / small litter' },
  { id: 'Medium', label: 'Medium', desc: 'Standard bin full / moderate volume' },
  { id: 'High', label: 'High', desc: 'Spilling / blocking path / odor' },
  { id: 'Critical', label: 'Critical', desc: 'Toxic / biohazard / major road blockage' },
];

export default function ReportWastePage({ setActiveTab, onSelectReport }) {
  const [category, setCategory] = useState('Plastic');
  const [description, setDescription] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [reportedSeverity, setReportedSeverity] = useState('Medium');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Form submission state
  const [submitting, setSubmitting] = useState(false);
  const [createdReport, setCreatedReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Real-time AI Priority Preview
  const [aiPreview, setAiPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Fetch real-time AI score when form fields change (debounced)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (category && reportedSeverity) {
        setPreviewLoading(true);
        try {
          const preview = await calculatePriorityPreview({
            category,
            reported_severity: reportedSeverity,
            description: description || 'Waste accumulated at site',
            location_address: locationAddress || '',
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
          });
          setAiPreview(preview);
        } catch (e) {
          // ignore background preview error
        } finally {
          setPreviewLoading(false);
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [category, reportedSeverity, description, locationAddress, latitude, longitude]);

  // Handle Photo Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removePhoto = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  // Browser Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        if (!locationAddress) {
          setLocationAddress(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        }
      },
      (err) => {
        // Fallback demo coordinates (Bangalore civic center)
        setLatitude('12.9716');
        setLongitude('77.5946');
        if (!locationAddress) {
          setLocationAddress('Cubbon Park Civic Center, Bangalore');
        }
      }
    );
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!description.trim() || description.length < 5) {
      setErrorMessage('Please provide a descriptive explanation (at least 5 characters).');
      return;
    }

    if (!locationAddress.trim() || locationAddress.length < 3) {
      setErrorMessage('Please provide a specific street address or landmark.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('description', description.trim());
      formData.append('location_address', locationAddress.trim());
      formData.append('reported_severity', reportedSeverity);
      if (latitude) formData.append('latitude', latitude);
      if (longitude) formData.append('longitude', longitude);
      if (selectedFile) formData.append('image', selectedFile);

      const savedReport = await submitReport(formData);
      setCreatedReport(savedReport);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit report. Please check your network and fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setDescription('');
    setLocationAddress('');
    setLatitude('');
    setLongitude('');
    setReportedSeverity('Medium');
    removePhoto();
    setCreatedReport(null);
    setErrorMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
          <Recycle className="w-4 h-4 text-emerald-600" />
          <span>Community Reporting Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Report Waste or Overflow
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Submit garbage issues with instant AI priority calculation and direct dispatch dispatching.
        </p>
      </div>

      {/* Success Modal / Banner */}
      {createdReport && (
        <div className="p-6 bg-emerald-50 border-2 border-emerald-300 rounded-3xl shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-950">
                  Waste Report Submitted Successfully!
                </h3>
                <span className="font-mono text-xs font-bold text-emerald-800">
                  Report Tracking ID: {createdReport.report_id}
                </span>
              </div>
            </div>
            <button
              onClick={handleResetForm}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-white px-3 py-1.5 rounded-xl border border-emerald-200"
            >
              Submit Another
            </button>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Assigned AI Priority:</span>
              <div className="mt-1">
                <PriorityBadge priority={createdReport.calculated_priority} score={createdReport.priority_score} />
              </div>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Category &amp; Location:</span>
              <span className="font-bold text-slate-800 mt-1 block truncate">
                {createdReport.category} • {createdReport.location_address}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Collection Status:</span>
              <span className="font-bold text-amber-600 mt-1 block">
                {createdReport.status} (Queued for Dispatch)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-100/60"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => {
                onSelectReport(createdReport);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md shadow-emerald-700/20"
            >
              <span>View Full Report Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Submission Form */}
      {!createdReport && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-8">
          
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Step 1: Category Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                1. Select Waste Category <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400">Determines recycling path</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isSelected ? 'text-emerald-950' : 'text-slate-800'}`}>
                        {cat.label}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {cat.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Severity Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
              2. Reported Urgency / Severity <span className="text-rose-500">*</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SEVERITIES.map((sev) => {
                const isSelected = reportedSeverity === sev.id;
                return (
                  <button
                    key={sev.id}
                    type="button"
                    onClick={() => setReportedSeverity(sev.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? sev.id === 'Critical'
                          ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 text-rose-900 font-bold'
                          : sev.id === 'High'
                          ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-900 font-bold'
                          : 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold">{sev.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{sev.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                3. Problem Description <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                AI scans for keywords like "overflow", "odor", "block", "school", "chemicals"
              </span>
            </div>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Garbage bins overflowing onto the road near primary school entrance, blocking the pedestrian sidewalk and attracting pests..."
              className="w-full text-sm rounded-2xl border border-slate-300 px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Step 4: Location & Optional Coordinates */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                4. Location &amp; Coordinates <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
              >
                <LocateFixed className="w-3.5 h-3.5 text-emerald-600" />
                <span>Use Current Location / GPS</span>
              </button>
            </div>

            <div>
              <input
                type="text"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="Street address, landmark, or area name (e.g. 100ft Road Indiranagar, Opp. Gate 2)"
                className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-500 block mb-1">Optional Latitude</label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 12.9784"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-700 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Optional Longitude</label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 77.6408"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-700 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Step 5: Photo Upload with Preview */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
              5. Photo Evidence (Optional)
            </label>

            {!previewUrl ? (
              <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer block bg-slate-50/50 hover:bg-emerald-50/20 transition-all">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Camera className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-700 block">
                  Click or drag photo here to upload
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Supports JPG, PNG, WEBP (Saved locally in backend storage)
                </span>
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-64 flex items-center justify-center">
                <img src={previewUrl} alt="Preview" className="max-h-64 object-contain" />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Real-time Explainable AI Preview Card */}
          {aiPreview && (
            <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Live AI Priority Preview
                </span>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={aiPreview.priority} score={aiPreview.score} />
                </div>
              </div>

              <div className="space-y-1 pt-1">
                {aiPreview.breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-xs text-emerald-900">
                    <span className="text-emerald-500">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-forest-700 hover:from-emerald-500 hover:to-forest-600 text-white font-bold text-sm shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting to WasteVision Dispatch...</span>
                </>
              ) : (
                <>
                  <Recycle className="w-4 h-4" />
                  <span>Submit Waste Report</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
