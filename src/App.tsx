import React, { useState, useEffect } from 'react';
import {
  UserRole,
  User,
  Challenge,
  Project,
  University,
  Industry,
  PlatformStats,
  AppNotification
} from './types';
import {
  fetchStats,
  fetchChallenges,
  fetchProjects,
  fetchUniversities,
  fetchIndustries,
  fetchNotifications,
  loginUser
} from './utils/api';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { CitizenPortal } from './components/CitizenPortal';
import { UniversityPortal } from './components/UniversityPortal';
import { IndustryPortal } from './components/IndustryPortal';
import { GovernmentPortal } from './components/GovernmentPortal';
import { ExplorePage } from './components/ExplorePage';
import { ChallengeDetailModal } from './components/ChallengeDetailModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { DemoScenarioModal } from './components/DemoScenarioModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('citizen');
  const [activeView, setActiveView] = useState<'home' | 'portal' | 'explore'>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Platform Data
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isDemoScenarioOpen, setIsDemoScenarioOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Load initial app data
  useEffect(() => {
    loadAllData();
    // Default to citizen demo user
    loginUser({ role: 'citizen', isDemo: true }).then(res => {
      setCurrentUser(res.user);
    }).catch(console.error);
  }, []);

  const loadAllData = async () => {
    try {
      const [sData, cData, pData, uData, iData, nData] = await Promise.all([
        fetchStats(),
        fetchChallenges(),
        fetchProjects(),
        fetchUniversities(),
        fetchIndustries(),
        fetchNotifications()
      ]);
      setStats(sData);
      setChallenges(cData);
      setProjects(pData);
      setUniversities(uData);
      setIndustries(iData);
      setNotifications(nData);
    } catch (err) {
      console.error('Error loading platform data', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle switching roles via Judge switcher
  const handleRoleChange = async (newRole: UserRole) => {
    setCurrentRole(newRole);
    setActiveView('portal');
    try {
      const res = await loginUser({ role: newRole, isDemo: true });
      setCurrentUser(res.user);
    } catch (err) {
      console.error('Role change login error', err);
    }
  };

  // Handle Scenario Launch
  const handleLaunchScenario = (scenarioId: string) => {
    if (scenarioId === 'scenario-water') {
      const waterChallenge = challenges.find(c => c.id === 'CH-JH-2026-000001') || challenges[0];
      if (waterChallenge) {
        setSelectedChallenge(waterChallenge);
      }
    } else if (scenarioId === 'scenario-panchayat') {
      const panchayatCh = challenges.find(c => c.assignedTo?.type === 'Panchayat') || challenges[1];
      if (panchayatCh) {
        setSelectedChallenge(panchayatCh);
      }
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Primary Navigation Bar */}
      <Navbar
        currentRole={currentRole}
        activeView={activeView}
        onSelectRole={handleRoleChange}
        onSelectView={setActiveView}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenDemoScenarios={() => setIsDemoScenarioOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
      />

      {/* Main Viewport Container */}
      <main className="flex-1">
        {loading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            <div className="text-base font-bold text-white">Loading CivicSolve Platform...</div>
            <p className="text-xs text-slate-400 mt-1">
              Synchronizing 150+ statewide challenges and AI classification engine
            </p>
          </div>
        ) : (
          <>
            {activeView === 'home' && (
              <LandingPage
                stats={stats}
                onExploreClick={() => setActiveView('explore')}
                onReportClick={() => {
                  setCurrentRole('citizen');
                  setActiveView('portal');
                }}
                onSelectRole={handleRoleChange}
              />
            )}

            {activeView === 'explore' && (
              <ExplorePage
                challenges={challenges}
                onSelectChallenge={(ch) => setSelectedChallenge(ch)}
                onOpenReport={() => {
                  setCurrentRole('citizen');
                  setActiveView('portal');
                }}
              />
            )}

            {activeView === 'portal' && (
              <>
                {currentRole === 'citizen' && (
                  <CitizenPortal
                    currentUser={currentUser}
                    stats={stats}
                    onSelectChallenge={(ch) => setSelectedChallenge(ch)}
                    onRefreshData={loadAllData}
                  />
                )}

                {currentRole === 'university' && (
                  <UniversityPortal
                    currentUser={currentUser}
                    challenges={challenges}
                    universities={universities}
                    onSelectChallenge={(ch) => setSelectedChallenge(ch)}
                    onRefreshData={loadAllData}
                  />
                )}

                {currentRole === 'industry' && (
                  <IndustryPortal
                    currentUser={currentUser}
                    onRefreshData={loadAllData}
                  />
                )}

                {currentRole === 'government' && (
                  <GovernmentPortal
                    currentUser={currentUser}
                    stats={stats}
                    challenges={challenges}
                    projects={projects}
                    universities={universities}
                    onSelectChallenge={(ch) => setSelectedChallenge(ch)}
                    onRefreshData={loadAllData}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Global Modals & Drawers */}
      <ChallengeDetailModal
        challenge={selectedChallenge}
        project={projects.find(p => p.challengeId === selectedChallenge?.id)}
        onClose={() => setSelectedChallenge(null)}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onRefreshNotifications={loadAllData}
        onSelectChallengeId={(id) => {
          const ch = challenges.find(c => c.id === id);
          if (ch) setSelectedChallenge(ch);
          setIsNotificationsOpen(false);
        }}
      />

      <DemoScenarioModal
        isOpen={isDemoScenarioOpen}
        onClose={() => setIsDemoScenarioOpen(false)}
        onSelectRole={handleRoleChange}
        onSelectScenario={handleLaunchScenario}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setCurrentRole(user.role);
          setActiveView('portal');
        }}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">CivicSolve</span>
            <span>• Smart India Hackathon 2026 (SIH26043)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDemoScenarioOpen(true)}
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              Demo Walkthroughs
            </button>
            <span>•</span>
            <span>Government of Jharkhand Quad-Helix Collaborative Grid</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
