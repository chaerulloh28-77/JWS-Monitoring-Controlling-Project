/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AuthUser,
  ProjectItem,
  ConstructionPlanItem,
  ActiveTab,
  AttachedDocument
} from './types';
import {
  getStoredAuthUser,
  setStoredAuthUser,
  getStoredProjects,
  saveProjects,
  getStoredConstructionPlans,
  saveConstructionPlans,
  getLastSyncTime,
  exportDataAsJson
} from './services/storage';

import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { ProjectList } from './components/ProjectList';
import { ConstructionPlan } from './components/ConstructionPlan';
import { GisMapOverview } from './components/GisMapOverview';
import { AnalyticsView } from './components/AnalyticsView';
import { PdfViewerModal } from './components/PdfViewerModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredAuthUser());

  // App data state
  const [projects, setProjects] = useState<ProjectItem[]>(() => getStoredProjects());
  const [plans, setPlans] = useState<ConstructionPlanItem[]>(() => getStoredConstructionPlans());
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => getLastSyncTime());

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activePdfDocument, setActivePdfDocument] = useState<AttachedDocument | null>(null);

  // Group filter state per view tab ('GOV' | 'INTERNAL' | 'ALL')
  const [projectGroupFilter, setProjectGroupFilter] = useState<'GOV' | 'INTERNAL' | 'ALL'>('GOV');
  const [constructionGroupFilter, setConstructionGroupFilter] = useState<'GOV' | 'INTERNAL' | 'ALL'>('GOV');
  const [gisGroupFilter, setGisGroupFilter] = useState<'GOV' | 'INTERNAL' | 'ALL'>('GOV');
  const [analyticsGroupFilter, setAnalyticsGroupFilter] = useState<'GOV' | 'INTERNAL' | 'ALL'>('GOV');

  const handleTabChangeWithGroup = (tab: ActiveTab, group?: 'GOV' | 'INTERNAL' | 'ALL') => {
    setActiveTab(tab);
    if (group) {
      if (tab === 'projects') setProjectGroupFilter(group);
      if (tab === 'construction') setConstructionGroupFilter(group);
      if (tab === 'gis_map') setGisGroupFilter(group);
      if (tab === 'analytics') setAnalyticsGroupFilter(group);
    }
  };

  // Trigger modal states from dashboard shortcuts
  const [isProjectAddModalOpen, setIsProjectAddModalOpen] = useState(false);
  const [isPlanAddModalOpen, setIsPlanAddModalOpen] = useState(false);
  const [editingProjectTarget, setEditingProjectTarget] = useState<ProjectItem | null>(null);

  const handleEditProjectTarget = (project: ProjectItem) => {
    setEditingProjectTarget(project);
    setActiveTab('projects');
  };

  // Real-time telemetry simulation state
  const [isRealtimeActive, setIsRealtimeActive] = useState(true);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (type: ToastMessage['type'], title: string, message: string) => {
      const newToast: ToastMessage = {
        id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type,
        title,
        message
      };
      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync background real-time ticker
  useEffect(() => {
    if (!isRealtimeActive) return;

    const interval = setInterval(() => {
      setLastSyncTime(new Date().toISOString());
    }, 15000);

    return () => clearInterval(interval);
  }, [isRealtimeActive]);

  // Auth Handlers
  const handleLoginSuccess = (user: AuthUser) => {
    setStoredAuthUser(user);
    setCurrentUser(user);
    showToast('success', 'Otentikasi Berhasil', `Selamat datang kembali, ${user.name}!`);
  };

  const handleLogout = () => {
    setStoredAuthUser(null);
    setCurrentUser(null);
    showToast('info', 'Sesi Berakhir', 'Anda telah keluar dari Portal Proyek JWS.');
  };

  // Project CRUD Handlers
  const handleSaveProject = (savedProject: ProjectItem) => {
    let updated: ProjectItem[] = [];
    const index = projects.findIndex((p) => p.id === savedProject.id);
    if (index >= 0) {
      updated = projects.map((p) => (p.id === savedProject.id ? savedProject : p));
      showToast('success', 'Proyek Diperbarui', `Paket ${savedProject.projectId} berhasil disimpan.`);
    } else {
      updated = [savedProject, ...projects];
      showToast('success', 'Proyek Ditambahkan', `Paket baru ${savedProject.projectId} siap dipantau.`);
    }
    setProjects(updated);
    saveProjects(updated);
    setLastSyncTime(new Date().toISOString());
  };

  const handleDeleteProject = (id: string) => {
    const target = projects.find((p) => p.id === id);
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    saveProjects(updated);
    setLastSyncTime(new Date().toISOString());
    showToast('error', 'Proyek Dihapus', `Data proyek ${target?.projectId || ''} telah dihapus.`);
  };

  // Construction Plan CRUD Handlers
  const handleSavePlan = (savedPlan: ConstructionPlanItem) => {
    let updated: ConstructionPlanItem[] = [];
    const index = plans.findIndex((pl) => pl.id === savedPlan.id);
    if (index >= 0) {
      updated = plans.map((pl) => (pl.id === savedPlan.id ? savedPlan : pl));
      showToast('success', 'Rencana Diperbarui', `Rencana konstruksi ISP ${savedPlan.namaIsp} berhasil disimpan.`);
    } else {
      updated = [savedPlan, ...plans];
      showToast('success', 'Rencana Ditambahkan', `Rencana konstruksi ISP ${savedPlan.namaIsp} tersimpan.`);
    }
    setPlans(updated);
    saveConstructionPlans(updated);
    setLastSyncTime(new Date().toISOString());
  };

  const handleDeletePlan = (id: string) => {
    const target = plans.find((pl) => pl.id === id);
    const updated = plans.filter((pl) => pl.id !== id);
    setPlans(updated);
    saveConstructionPlans(updated);
    setLastSyncTime(new Date().toISOString());
    showToast('error', 'Rencana Dihapus', `Rencana konstruksi ${target?.namaIsp || ''} telah dihapus.`);
  };

  const handleRefreshData = () => {
    setProjects(getStoredProjects());
    setPlans(getStoredConstructionPlans());
    setLastSyncTime(new Date().toISOString());
    showToast('info', 'Data Disegarkan', 'Database sinkronisasi lapangan telah diperbarui.');
  };

  const handleExportData = () => {
    exportDataAsJson();
    showToast('success', 'Database Dicadangkan', 'Berkas JSON ekspor cadangan berhasil diunduh.');
  };

  const handleDataReset = () => {
    setProjects(getStoredProjects());
    setPlans(getStoredConstructionPlans());
    setLastSyncTime(new Date().toISOString());
    showToast('warning', 'Demo Reset', 'Data proyek dan rencana dikembalikan ke setelan awal 2026.');
  };

  // If user is not authenticated, show professional login page
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen app-bg bg-[#05040d] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Bar adhering to Top Bar Contract */}
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        onRefreshData={handleRefreshData}
        onExportData={handleExportData}
        lastSyncTime={lastSyncTime}
        isRealtimeActive={isRealtimeActive}
        onToggleRealtime={() => {
          setIsRealtimeActive((prev) => !prev);
          showToast(
            'info',
            'Status Streaming Berubah',
            !isRealtimeActive ? 'Sinkronisasi real-time diaktifkan' : 'Sinkronisasi real-time dijeda'
          );
        }}
      />

      {/* Main Workspace: Left Sidebar + Central Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Menu */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChangeWithGroup}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          projectCount={projects.length}
          constructionCount={plans.length}
          projectGroupFilter={projectGroupFilter}
          constructionGroupFilter={constructionGroupFilter}
          gisGroupFilter={gisGroupFilter}
          analyticsGroupFilter={analyticsGroupFilter}
          onOpenNewProject={() => {
            setActiveTab('projects');
            setIsProjectAddModalOpen(true);
          }}
          onOpenNewConstruction={() => {
            setActiveTab('construction');
            setIsPlanAddModalOpen(true);
          }}
        />

        {/* Central Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 cyber-grid">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* View Switching */}
            {activeTab === 'overview' && (
              <DashboardOverview
                projects={projects}
                plans={plans}
                onNavigateTab={setActiveTab}
                onOpenNewProject={() => {
                  setActiveTab('projects');
                  setIsProjectAddModalOpen(true);
                }}
                onOpenNewPlan={() => {
                  setActiveTab('construction');
                  setIsPlanAddModalOpen(true);
                }}
                onEditProject={handleEditProjectTarget}
                onDeleteProject={handleDeleteProject}
              />
            )}

            {activeTab === 'projects' && (
              <ProjectList
                projects={projects}
                onSaveProject={handleSaveProject}
                onDeleteProject={handleDeleteProject}
                isAddModalOpen={isProjectAddModalOpen}
                setIsAddModalOpen={setIsProjectAddModalOpen}
                externalEditingProject={editingProjectTarget}
                setExternalEditingProject={setEditingProjectTarget}
                mainGroupFilter={projectGroupFilter}
                onMainGroupFilterChange={setProjectGroupFilter}
              />
            )}

            {activeTab === 'construction' && (
              <ConstructionPlan
                plans={plans}
                projects={projects}
                onSavePlan={handleSavePlan}
                onDeletePlan={handleDeletePlan}
                onViewPdf={(doc) => setActivePdfDocument(doc)}
                isAddModalOpen={isPlanAddModalOpen}
                setIsAddModalOpen={setIsPlanAddModalOpen}
                onShowToast={showToast}
                mainGroupFilter={constructionGroupFilter}
                onMainGroupFilterChange={setConstructionGroupFilter}
              />
            )}

            {activeTab === 'gis_map' && (
              <GisMapOverview
                projects={projects}
                plans={plans}
                onSelectProject={handleEditProjectTarget}
                onDeleteProject={handleDeleteProject}
                onOpenNewProject={() => {
                  setActiveTab('projects');
                  setIsProjectAddModalOpen(true);
                }}
                onOpenNewPlan={() => {
                  setActiveTab('construction');
                  setIsPlanAddModalOpen(true);
                }}
                mainGroupFilter={gisGroupFilter}
                onMainGroupFilterChange={setGisGroupFilter}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                projects={projects}
                plans={plans}
                onDataReset={handleDataReset}
                isRealtime={isRealtimeActive}
                onToggleRealtime={() => setIsRealtimeActive((prev) => !prev)}
                onOpenNewProject={() => {
                  setActiveTab('projects');
                  setIsProjectAddModalOpen(true);
                }}
                onOpenNewPlan={() => {
                  setActiveTab('construction');
                  setIsPlanAddModalOpen(true);
                }}
                onEditProject={handleEditProjectTarget}
                onDeleteProject={handleDeleteProject}
                mainGroupFilter={analyticsGroupFilter}
                onMainGroupFilterChange={setAnalyticsGroupFilter}
              />
            )}
          </div>
        </main>
      </div>

      {/* PDF Document Viewer Modal */}
      <PdfViewerModal
        document={activePdfDocument}
        onClose={() => setActivePdfDocument(null)}
      />

      {/* Toast Notification Stack */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
