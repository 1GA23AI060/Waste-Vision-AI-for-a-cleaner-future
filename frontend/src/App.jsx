import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ReportWastePage from './pages/ReportWastePage';
import CollectionManagementPage from './pages/CollectionManagementPage';
import CollectionMapPage from './pages/CollectionMapPage';
import ReportDetailModal from './components/ReportDetailModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [isAdmin, setIsAdmin] = useState(true); // Demo mode starts as Admin/Officer for evaluation convenience
  const [selectedReport, setSelectedReport] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectReport = (report) => {
    setSelectedReport(report);
  };

  const handleCloseModal = () => {
    setSelectedReport(null);
  };

  const handleReportUpdated = (updatedReport) => {
    setSelectedReport(updatedReport);
    setRefreshKey((k) => k + 1);
  };

  const handleDataReset = () => {
    setSelectedReport(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDataReset={handleDataReset}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage setActiveTab={setActiveTab} key={`landing-${refreshKey}`} />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            setActiveTab={setActiveTab}
            onSelectReport={handleSelectReport}
            key={`dashboard-${refreshKey}`}
          />
        )}

        {activeTab === 'report' && (
          <ReportWastePage
            setActiveTab={setActiveTab}
            onSelectReport={handleSelectReport}
            key={`report-${refreshKey}`}
          />
        )}

        {activeTab === 'operations' && (
          <CollectionManagementPage
            onSelectReport={handleSelectReport}
            isAdmin={isAdmin}
            key={`operations-${refreshKey}`}
          />
        )}

        {activeTab === 'map' && (
          <CollectionMapPage
            onSelectReport={handleSelectReport}
            key={`map-${refreshKey}`}
          />
        )}
      </main>

      {/* Inspection & Operations Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={handleCloseModal}
          onUpdated={handleReportUpdated}
        />
      )}
    </div>
  );
}
