import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  Recycle, 
  CheckCircle, 
  Clock, 
  Truck, 
  AlertTriangle, 
  Leaf, 
  Layers, 
  BarChart3, 
  ChevronRight,
  TrendingUp,
  Cpu,
  Biohazard,
  Package
} from 'lucide-react';
import { fetchStats } from '../api';

export default function LandingPage({ setActiveTab }) {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to load stats on landing page:', err))
      .finally(() => setLoadingStats(false));
  }, []);

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-emerald-900 via-forest-900 to-emerald-950 text-white rounded-3xl mx-2 sm:mx-6 mt-4 shadow-xl">
        {/* Subtle decorative background blur spots */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 rounded-full bg-lime-500/15 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-500/30 text-emerald-200 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-lime-400" />
            <span>Explainable AI-Assisted Waste Dispatch System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Smarter Waste Collection.<br />
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-200 to-lime-300 bg-clip-text text-transparent">
              Cleaner Communities.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-emerald-100/90 leading-relaxed font-normal">
            WasteVision unites civic engagement and intelligent operations. Report garbage overflow, hazardous spills, and illegal dumping with instant AI priority assessment and transparent collection tracking.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => setActiveTab('report')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
            >
              <Recycle className="w-5 h-5" />
              <span>Report Waste Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold backdrop-blur-sm transition-all text-sm"
            >
              <BarChart3 className="w-4 h-4 text-emerald-300" />
              <span>View Live Dashboard</span>
            </button>
          </div>
        </div>

        {/* Real Live Database Metrics Bar */}
        <div className="max-w-5xl mx-auto px-6 mt-14">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {loadingStats ? '...' : stats?.total_reports ?? 0}
              </div>
              <div className="text-xs text-emerald-200/80 font-medium mt-1">
                Total Tracked Reports
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">
                {loadingStats ? '...' : stats?.pending_reports ?? 0}
              </div>
              <div className="text-xs text-emerald-200/80 font-medium mt-1">
                Awaiting Collection
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-300">
                {loadingStats ? '...' : (stats?.critical_priority_reports ?? 0) + (stats?.high_priority_reports ?? 0)}
              </div>
              <div className="text-xs text-emerald-200/80 font-medium mt-1">
                High / Critical Urgency
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-lime-300">
                {loadingStats ? '...' : `${stats?.resolution_rate ?? 0}%`}
              </div>
              <div className="text-xs text-emerald-200/80 font-medium mt-1">
                Resolution Efficiency
              </div>
            </div>
          </div>
          <div className="text-center mt-2 text-[11px] text-emerald-300/70">
            • Metrics synced directly with SQLite production database
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-emerald-700 tracking-wider uppercase mb-2">
            Why WasteVision Matters
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Engineered for Fast Response &amp; Environmental Health
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Explainable Priority Engine
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Transparent, rule-based AI scoring accounts for reported severity, hazardous toxicity, drain blockages, sensitive proximity (schools/hospitals), and report wait times.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Interactive GIS Map
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Geolocated waste pins highlight hotspots dynamically. Municipal dispatchers see exactly where urgent cleanups are needed and plan optimal collection routes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-lime-50 text-lime-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Transparent Audit Timeline
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every status shift is logged in an immutable audit timeline—from citizen logging, collector dispatch, in-progress cleanup, to final facility transfer.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Workflow */}
      <section className="bg-slate-50 py-14 border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-bold text-emerald-700 tracking-wider uppercase mb-1">
              Operational Lifecycle
            </h2>
            <p className="text-2xl font-bold text-slate-900">
              From Citizen Report to Sustainable Disposal
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center relative">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                1
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">Citizen Notice</h4>
              <p className="text-xs text-slate-500">Citizen snaps a photo, marks category, and provides location.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center relative">
              <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                2
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">AI Priority Assessment</h4>
              <p className="text-xs text-slate-500">Rule engine evaluates chemical hazard, overflow, and sensitive zones.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center relative">
              <div className="w-9 h-9 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                3
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">Collector Dispatch</h4>
              <p className="text-xs text-slate-500">Hazmat, rapid response, or recycling teams assigned with ETAs.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center relative">
              <div className="w-9 h-9 rounded-full bg-forest-900 text-white font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                4
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">Closure &amp; Recycling</h4>
              <p className="text-xs text-slate-500">Waste cleared and diverted to composting or sorting plants.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Waste Category Guide */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h2 className="text-xs font-bold text-emerald-700 tracking-wider uppercase mb-1">
              Segregation Standards
            </h2>
            <p className="text-2xl font-bold text-slate-900">
              Waste Categories &amp; Proper Handling
            </p>
          </div>
          <button
            onClick={() => setActiveTab('report')}
            className="mt-4 md:mt-0 text-sm font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
          >
            Submit a report for any category <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            { name: 'Wet Waste', color: 'border-yellow-300 bg-yellow-50/50', icon: Leaf, desc: 'Kitchen scraps, organics, market leftovers' },
            { name: 'Dry Waste', color: 'border-slate-300 bg-slate-50/50', icon: Package, desc: 'Cardboard cartons, dry paper, packaging' },
            { name: 'Plastic', color: 'border-emerald-300 bg-emerald-50/50', icon: Recycle, desc: 'Bottles, polythene wrappers, containers' },
            { name: 'E-waste', color: 'border-blue-300 bg-blue-50/50', icon: Cpu, desc: 'Electronics, cables, batteries, displays' },
            { name: 'Hazardous', color: 'border-rose-300 bg-rose-50/50', icon: Biohazard, desc: 'Chemicals, paints, medical sharps, solvents' },
            { name: 'Other', color: 'border-purple-300 bg-purple-50/50', icon: Layers, desc: 'Foliage, mixed inert construction debris' },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.name} className={`p-4 rounded-xl border ${cat.color} text-center space-y-2`}>
                <div className="w-8 h-8 mx-auto rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">{cat.name}</h4>
                <p className="text-[11px] text-slate-500 leading-tight">{cat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 pt-8 mt-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Recycle className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-700">WasteVision</span>
            <span>– AI for a Cleaner Future</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>React + Vite</span>
            <span>•</span>
            <span>FastAPI + SQLite</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>Leaflet GIS</span>
          </div>
          <div>
            Built for Academic Demonstration &amp; Community Impact
          </div>
        </div>
      </footer>

    </div>
  );
}
