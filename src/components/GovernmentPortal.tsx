import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Building2,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  DollarSign,
  FileCheck,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Layers,
  MapPin
} from 'lucide-react';
import {
  Challenge,
  Project,
  University,
  PlatformStats,
  User
} from '../types';
import {
  fetchAnalytics,
  panchayatAcceptChallenge,
  panchayatResolveChallenge,
  panchayatEscalateChallenge,
  approveCompensation
} from '../utils/api';

interface GovernmentPortalProps {
  currentUser: User | null;
  stats: PlatformStats | null;
  challenges: Challenge[];
  projects: Project[];
  universities: University[];
  onSelectChallenge: (challenge: Challenge) => void;
  onRefreshData: () => void;
}

export const GovernmentPortal: React.FC<GovernmentPortalProps> = ({
  currentUser,
  stats,
  challenges,
  projects,
  universities,
  onSelectChallenge,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'panchayats' | 'compensation' | 'analytics' | 'impact'>('panchayats');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(false);

  // Escalation Modal State
  const [escalatingChallenge, setEscalatingChallenge] = useState<Challenge | null>(null);
  const [escalationReason, setEscalationReason] = useState<string>('Heavy fluoride and chemical toxicity detected in water samples exceeding Panchayat local repair capacity; requires advanced membrane filtration R&D.');
  const [selectedUnivId, setSelectedUnivId] = useState<string>(universities[0]?.id || 'UNIV-001');
  const [isEscalating, setIsEscalating] = useState<boolean>(false);

  // Resolve Modal State
  const [resolvingChallenge, setResolvingChallenge] = useState<Challenge | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('Replaced broken suction washer and motor capacitor; water flow restored and verified.');
  const [resolutionCost, setResolutionCost] = useState<number>(18500);
  const [isResolving, setIsResolving] = useState<boolean>(false);

  // Panchayat filter
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const data = await fetchAnalytics();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching analytics', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Panchayat Challenges
  const panchayatChallenges = challenges.filter(c => 
    c.assignedTo?.type === 'Panchayat' || c.aiAnalysis?.routingTarget === 'Panchayat' || c.status.includes('Panchayat')
  ).filter(c => 
    (selectedDistrict === 'All' || c.district === selectedDistrict) &&
    (!searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Actions
  const handlePanchayatAccept = async (challengeId: string) => {
    try {
      await panchayatAcceptChallenge(challengeId);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePanchayatResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingChallenge) return;
    setIsResolving(true);
    try {
      await panchayatResolveChallenge(resolvingChallenge.id, resolutionNotes, resolutionCost);
      setResolvingChallenge(null);
      onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsResolving(false);
    }
  };

  const handlePanchayatEscalate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalatingChallenge) return;
    setIsEscalating(true);
    try {
      await panchayatEscalateChallenge(escalatingChallenge.id, escalationReason, selectedUnivId);
      setEscalatingChallenge(null);
      onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsEscalating(false);
    }
  };

  const handleApproveReimbursement = async (projectId: string) => {
    try {
      await approveCompensation(projectId);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const uniqueDistricts = Array.from(new Set(challenges.map(c => c.district))).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow">
            <Landmark className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Government of Jharkhand — State Innovation Cell
              </h1>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded border border-emerald-500/30">
                Urban & Rural Development
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Administrator: <span className="text-white font-medium">{currentUser?.name || 'Shri R. K. Choudhary, IAS'}</span> • Statewide Monitoring Grid
            </p>
          </div>
        </div>

        {/* Live Statewide Overview Pills */}
        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div className="text-center px-2">
            <div className="text-lg font-bold text-blue-400">{stats?.totalProblems || 150}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Issues</div>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="text-center px-2">
            <div className="text-lg font-bold text-emerald-400">{stats?.problemsResolved || 38}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Resolved</div>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="text-center px-2">
            <div className="text-lg font-bold text-purple-400">{projects.length}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Univ R&D</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('panchayats')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'panchayats'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Panchayat Operations & Escalations ({panchayatChallenges.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('compensation')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'compensation'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>CSR Subsidy & Reimbursements ({projects.filter(p => p.industrySupport).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Statewide Analytics & Charts</span>
        </button>

        <button
          onClick={() => setActiveTab('impact')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'impact'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Citizen Impact Dossiers</span>
        </button>
      </div>

      {/* TAB 1: PANCHAYAT OPERATIONS & ESCALATION PROTOCOL */}
      {activeTab === 'panchayats' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search panchayat issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400">District:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                <option value="All">All Districts</option>
                {uniqueDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {panchayatChallenges.slice(0, 10).map(challenge => (
              <div
                key={challenge.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                      {challenge.id}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      challenge.status.includes('Resolved') ? 'bg-emerald-500/20 text-emerald-300' :
                      challenge.status.includes('Escalated') ? 'bg-amber-500/20 text-amber-300' :
                      'bg-sky-500/20 text-sky-300'
                    }`}>
                      {challenge.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white mb-1.5 line-clamp-2">{challenge.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">{challenge.description}</p>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between mb-3">
                    <span>Location: {challenge.village}, {challenge.district}</span>
                    <span>Panchayat: {challenge.assignedTo?.name || 'Ormanjhi'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectChallenge(challenge)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    View Details
                  </button>

                  <div className="flex items-center gap-1.5">
                    {challenge.status !== 'Panchayat Resolved' && (
                      <>
                        <button
                          onClick={() => setResolvingChallenge(challenge)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px] font-semibold flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Resolve</span>
                        </button>

                        {/* ESCALATE BUTTON */}
                        <button
                          onClick={() => {
                            setEscalatingChallenge(challenge);
                            const matched = universities.find(u => 
                              challenge.category === 'Water' ? u.shortName === 'BIT Mesra' :
                              challenge.category === 'Roads & Infrastructure' ? u.shortName === 'NIT JSR' :
                              u.shortName === 'IIT ISM'
                            ) || universities[0];
                            setSelectedUnivId(matched.id);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white text-[11px] font-semibold flex items-center gap-1"
                          title="If local panchayat lacks technical capability, escalate to university"
                        >
                          <ArrowUpRight className="w-3 h-3" />
                          <span>Escalate to University</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CSR COMPENSATION APPROVAL */}
      {activeTab === 'compensation' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white">Jharkhand CSR Innovation Subsidy Approvals</h3>
              <p className="text-xs text-slate-400 mt-1">
                State approves 80% reimbursement for verified university-industry hardware prototypes.
              </p>
            </div>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-semibold px-2.5 py-1 rounded">
              Policy #JH-CSR-2026
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Project ID</th>
                  <th className="py-3 px-4">Proposed Solution</th>
                  <th className="py-3 px-4">University</th>
                  <th className="py-3 px-4">Industry Partner</th>
                  <th className="py-3 px-4">80% Subsidy Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {projects.filter(p => p.industrySupport).map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">{p.id}</td>
                    <td className="py-3 px-4 font-medium text-white max-w-xs truncate">{p.proposal.proposedSolution}</td>
                    <td className="py-3 px-4">{p.universityName}</td>
                    <td className="py-3 px-4">{p.industrySupport?.industryName}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      ₹{p.industrySupport?.governmentCompensationInr.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-semibold ${
                        p.industrySupport?.compensationStatus === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {p.industrySupport?.compensationStatus || 'Pending Review'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.industrySupport?.compensationStatus !== 'Approved' ? (
                        <button
                          onClick={() => handleApproveReimbursement(p.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs shadow"
                        >
                          Approve 80% Subsidy
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Disbursed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STATEWIDE ANALYTICS & CHARTS */}
      {activeTab === 'analytics' && analyticsData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Breakdown Bar Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
                <span>Challenges by Category</span>
                <span className="text-xs text-slate-400 font-normal">Synthetic 150 Dataset</span>
              </h3>
              <div className="space-y-4">
                {analyticsData.categoryDistribution.map((item: any) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>{item.name}</span>
                      <span className="font-bold text-white">{item.count} issues</span>
                    </div>
                    <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(item.count / 150) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Routing Distribution */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
                <span>AI Problem Routing Distribution</span>
                <span className="text-xs text-slate-400 font-normal">Panchayat vs University</span>
              </h3>
              <div className="space-y-4">
                {analyticsData.routingDistribution.map((item: any) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>{item.name}</span>
                      <span className="font-bold text-white">{item.value} issues ({Math.round((item.value / 150) * 100)}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(item.value / 150) * 100}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">
              Monthly Resolutions vs Incoming Submissions (Jharkhand Statewide)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {analyticsData.monthlyResolutions.map((m: any) => (
                <div key={m.month} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-xs font-semibold text-slate-400 mb-1">{m.month}</div>
                  <div className="text-lg font-bold text-emerald-400">{m.resolved}</div>
                  <div className="text-[10px] text-slate-500">Resolved ({m.submitted} New)</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CITIZEN IMPACT DOSSIERS */}
      {activeTab === 'impact' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="text-2xl font-extrabold text-emerald-400 mb-1">45,640+</div>
              <div className="text-xs font-bold text-white uppercase tracking-wider mb-2">Verified Citizens Benefited</div>
              <p className="text-xs text-slate-400">
                Direct community beneficiaries from restored water lines, culvert reconstructions, and organic composters.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="text-2xl font-extrabold text-cyan-400 mb-1">15 Gram Panchayats</div>
              <div className="text-xs font-bold text-white uppercase tracking-wider mb-2">Local Governance Coverage</div>
              <p className="text-xs text-slate-400">
                Ormanjhi, Kanke, Topchanchi, Mandu, Chandankiyari, and surrounding blocks actively participating.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="text-2xl font-extrabold text-purple-400 mb-1">89 / 100</div>
              <div className="text-xs font-bold text-white uppercase tracking-wider mb-2">Civic Impact Score</div>
              <p className="text-xs text-slate-400">
                Composite state index calculated from turnaround time, citizen feedback satisfaction, and durability.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ESCALATION MODAL */}
      {escalatingChallenge && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Escalate Challenge to University</h3>
              </div>
              <button
                onClick={() => setEscalatingChallenge(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePanchayatEscalate} className="space-y-4 mt-4 text-xs text-slate-300">
              <div>
                <span className="text-slate-400 block mb-1">Challenge:</span>
                <div className="font-semibold text-white bg-slate-950 p-2 rounded border border-slate-800">
                  {escalatingChallenge.title}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Reason for Panchayat Escalation *
                </label>
                <textarea
                  rows={3}
                  required
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs leading-relaxed focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Target University (AI Recommended) *
                </label>
                <select
                  value={selectedUnivId}
                  onChange={(e) => setSelectedUnivId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs"
                >
                  {universities.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.shortName})</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEscalatingChallenge(null)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEscalating}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl flex items-center gap-1.5"
                >
                  {isEscalating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                  <span>Confirm Escalation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE MODAL */}
      {resolvingChallenge && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Resolve Panchayat Challenge</h3>
              </div>
              <button
                onClick={() => setResolvingChallenge(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePanchayatResolve} className="space-y-4 mt-4 text-xs text-slate-300">
              <div>
                <span className="text-slate-400 block mb-1">Challenge:</span>
                <div className="font-semibold text-white bg-slate-950 p-2 rounded border border-slate-800">
                  {resolvingChallenge.title}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Resolution Notes & Verification *
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs leading-relaxed focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Actual Panchayat Cost Incurred (INR)
                </label>
                <input
                  type="number"
                  value={resolutionCost}
                  onChange={(e) => setResolutionCost(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingChallenge(null)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResolving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center gap-1.5"
                >
                  {isResolving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Mark Resolved</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
