import React, { useState } from 'react';
import { 
  Recycle, 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  Map, 
  Home, 
  RotateCcw, 
  ShieldCheck, 
  User, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';
import { resetDemoData } from '../api';

export default function Navbar({ activeTab, setActiveTab, onDataReset, isAdmin, setIsAdmin }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (!window.confirm('Reset the database to clean demo records? This will restore 9 standard test reports.')) {
      return;
    }
    setIsResetting(true);
    try {
      await resetDemoData();
      if (onDataReset) onDataReset();
      alert('Demo database reset successfully with 9 fresh records!');
    } catch (err) {
      alert('Failed to reset data: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const navItems = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'report', label: 'Report Waste', icon: PlusCircle, highlight: true },
    { id: 'operations', label: 'Operations & Dispatch', icon: ClipboardList },
    { id: 'map', label: 'Collection Map', icon: Map },
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => handleTabClick('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-forest-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <Recycle className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-800 to-forest-900 bg-clip-text text-transparent">
                  WasteVision
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                AI for a Cleaner Future
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              if (item.highlight) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-500/20'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Mode Toggle & Demo Reset */}
          <div className="hidden lg:flex items-center space-x-2.5">
            {/* Admin / Citizen Mode Toggle */}
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                isAdmin 
                  ? 'bg-purple-50 border-purple-300 text-purple-800 shadow-xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Toggle Officer/Admin dispatch permissions"
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Admin Mode</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Citizen Mode</span>
                </>
              )}
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Reset Demo Records to initial sample state"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden xl:inline">Reset Demo</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className={`p-1.5 rounded-lg border text-xs font-medium ${
                isAdmin ? 'bg-purple-50 border-purple-300 text-purple-800' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              {isAdmin ? 'Admin' : 'User'}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top duration-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-emerald-800 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5 text-emerald-600" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset Demo Seed Records</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
