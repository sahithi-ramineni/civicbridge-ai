import React, { useState, useEffect } from 'react';
import {
  Building2,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  Award,
  AlertCircle
} from 'lucide-react';
import {
  Project,
  Industry,
  User
} from '../types';
import {
  fetchProjects,
  fetchIndustries,
  offerIndustrySupport
} from '../utils/api';

interface IndustryPortalProps {
  currentUser: User | null;
  onRefreshData: () => void;
}

export const IndustryPortal: React.FC<IndustryPortalProps> = ({
  currentUser,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'available' | 'active-collabs' | 'compensation'>('available');
  const [projects, setProjects] = useState<Project[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Offer Support Modal State
  const [selectedProjectForSupport, setSelectedProjectForSupport] = useState<Project | null>(null);
  const [supportTypes, setSupportTypes] = useState<string[]>(['Prototype Development', 'Funding', 'Technical Mentoring']);
  const [committedFunding, setCommittedFunding] = useState<number>(250000);
  const [resourcesProvided, setResourcesProvided] = useState<string>('Precision fabrication workshop, SS304 skid enclosure, mobile water testing van.');
  const [mentorName, setMentorName] = useState<string>(currentUser?.name || 'Er. Vikram Sengupta');
  const [isSubmittingSupport, setIsSubmittingSupport] = useState<boolean>(false);

  // Active industry
  const currentIndustry = industries.find(i => 
    i.name.toLowerCase().includes(currentUser?.organization?.toLowerCase() || '')
  ) || industries[0];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projData, indData] = await Promise.all([
        fetchProjects(),
        fetchIndustries()
      ]);
      setProjects(projData);
      setIndustries(indData);
    } catch (err) {
      console.error('Error loading industry data', err);
    } finally {
      setLoading(false);
    }
  };

  // Projects seeking support vs collaborating
  const seekingSupport = projects.filter(p => !p.industrySupport);
  const activeCollaborations = projects.filter(p => p.industrySupport?.industryId === currentIndustry?.id || p.industrySupport);

  const availableSupportTypes = [
    'Prototype Development',
    'Technology Support',
    'Infrastructure Access',
    'Technical Mentoring',
    'Funding / CSR Grant',
    'Testing & Lab Validation',
    'Manufacturing & Assembly',
    'Field Deployment Support'
  ];

  const handleOpenSupport = (proj: Project) => {
    setSelectedProjectForSupport(proj);
    setCommittedFunding(Math.round(proj.proposal.estimatedCost * 0.9));
  };

  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForSupport || !currentIndustry) return;

    setIsSubmittingSupport(true);
    try {
      await offerIndustrySupport({
        projectId: selectedProjectForSupport.id,
        industryId: currentIndustry.id,
        supportTypes,
        resourcesProvided,
        committedFundingInr: committedFunding,
        technicalMentorAssigned: mentorName
      });

      setSelectedProjectForSupport(null);
      await loadData();
      onRefreshData();
      setActiveTab('active-collabs');
    } catch (err) {
      console.error('Error attaching support', err);
      alert('Failed to submit support');
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center text-white font-bold text-xl shadow">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {currentIndustry?.name || 'Tata Steel Rural Development Society (TSRDS)'}
              </h1>
              <span className="bg-amber-500/20 text-amber-300 text-xs font-semibold px-2 py-0.5 rounded border border-amber-500/30">
                Industry Partner
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Representative: <span className="text-white font-medium">{currentUser?.name || 'Er. Vikram Sengupta'}</span> • {currentUser?.department || 'Rural Technology & Prototyping Division'}
            </p>
          </div>
        </div>

        {/* CSR Contribution Pill */}
        <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div className="text-center px-2">
            <div className="text-lg font-bold text-amber-400">
              ₹{((currentIndustry?.totalContributionInr || 2450000) / 100000).toFixed(1)}L
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total CSR R&D</div>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="text-center px-2">
            <div className="text-lg font-bold text-emerald-400">
              {activeCollaborations.length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Prototypes</div>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="text-center px-2">
            <div className="text-lg font-bold text-cyan-400">80%</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Govt Rebate</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('available')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'available'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Available University Proposals ({seekingSupport.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('active-collabs')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'active-collabs'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Active Prototyping Collaborations ({activeCollaborations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('compensation')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'compensation'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Government CSR Reimbursement Status</span>
        </button>
      </div>

      {/* TAB 1: AVAILABLE PROPOSALS SEEKING PARTNERS */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between">
            <span>
              The following solutions have been proposed by partner university engineering teams and are ready for industry CSR backing and prototype fabrication.
            </span>
            <span className="font-semibold text-amber-300">Open for Sponsorship</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {seekingSupport.map(proj => (
              <div
                key={proj.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      {proj.id}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      {proj.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-white mb-2 line-clamp-2">
                    {proj.proposal.proposedSolution}
                  </h3>

                  <div className="text-xs text-slate-400 mb-3">
                    University: <span className="text-white font-semibold">{proj.universityName}</span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                    {proj.proposal.problemAnalysis}
                  </p>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 mb-4 text-xs space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Est. Cost:</span>
                      <span className="text-emerald-400 font-bold">₹{proj.proposal.estimatedCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Est. Timeline:</span>
                      <span className="text-white font-medium">{proj.proposal.expectedTimelineWeeks} Weeks</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Tech Needed:</span>
                      <span className="text-amber-400 font-medium">{proj.proposal.technologyRequired.slice(0, 2).join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Faculty: {proj.proposal.facultyMentorName}
                  </span>

                  <button
                    onClick={() => handleOpenSupport(proj)}
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                  >
                    <span>Offer Prototyping Support</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE PROTOTYPING COLLABORATIONS */}
      {activeTab === 'active-collabs' && (
        <div className="space-y-6">
          {activeCollaborations.map(proj => (
            <div key={proj.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      {proj.id}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      {proj.universityName}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      {proj.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white">{proj.proposal.proposedSolution}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    District: {proj.district} • Challenge: {proj.challengeTitle}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <div className="text-xs text-slate-400">Committed CSR Sponsorship:</div>
                  <div className="text-base font-bold text-emerald-400">
                    ₹{proj.industrySupport?.committedFundingInr.toLocaleString('en-IN') || '2,50,000'}
                  </div>
                </div>
              </div>

              {/* Support Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Assigned Technical Mentor:</span>
                  <span className="text-white font-semibold">{proj.industrySupport?.technicalMentorAssigned}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Prototyping Facility:</span>
                  <span className="text-white font-semibold">{proj.industrySupport?.resourcesProvided}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Prototype Progress:</span>
                  <span className="text-amber-400 font-bold">{proj.industrySupport?.prototypeStatus}</span>
                </div>
              </div>

              {/* Prototype Stepper Visual */}
              <div className="pt-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Fabrication & Pilot Testing Stages
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['CAD/Design', 'Component Sourcing', 'Assembly & Fab', 'Field Pilot'].map((stg, i) => (
                    <div
                      key={stg}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center text-xs"
                    >
                      <div className="font-bold text-slate-300">Stage {i + 1}</div>
                      <div className="text-amber-400 text-[11px] mt-0.5">{stg}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: GOVERNMENT CSR REIMBURSEMENT STATUS */}
      {activeTab === 'compensation' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-base font-bold text-white">Government CSR Compensation Grid</h3>
            <p className="text-xs text-slate-400 mt-1">
              Under Jharkhand State Innovation Policy, 80% of verified prototype development and manufacturing costs are reimbursed to industry partners upon milestone certification.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Project ID</th>
                  <th className="py-3 px-4">Solution Title</th>
                  <th className="py-3 px-4">Industry Committed</th>
                  <th className="py-3 px-4">Govt 80% Rebate</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {activeCollaborations.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-amber-400 font-semibold">{p.id}</td>
                    <td className="py-3 px-4 font-medium text-white">{p.proposal.proposedSolution}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      ₹{p.industrySupport?.committedFundingInr.toLocaleString('en-IN')}
                    </td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OFFER SUPPORT MODAL */}
      {selectedProjectForSupport && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-left">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div>
                <h2 className="text-xl font-bold text-white">Offer Prototyping Support</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Project: <span className="text-white font-medium">{selectedProjectForSupport.proposal.proposedSolution}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedProjectForSupport(null)}
                className="text-slate-400 hover:text-white p-2 font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitSupport} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs text-slate-300">
              <div>
                <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-2">
                  Select Support Types Provided *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableSupportTypes.map(st => (
                    <label key={st} className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={supportTypes.includes(st)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSupportTypes([...supportTypes, st]);
                          } else {
                            setSupportTypes(supportTypes.filter(s => s !== st));
                          }
                        }}
                        className="rounded border-slate-700 text-amber-600 focus:ring-0"
                      />
                      <span className="text-xs text-slate-200">{st}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Committed CSR / R&D Funding (INR) *
                </label>
                <input
                  type="number"
                  required
                  value={committedFunding}
                  onChange={(e) => setCommittedFunding(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  * 80% eligible for Govt of Jharkhand Innovation Subsidy upon testing completion.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Resources & Facilities Provided *
                </label>
                <textarea
                  rows={3}
                  required
                  value={resourcesProvided}
                  onChange={(e) => setResourcesProvided(e.target.value)}
                  placeholder="e.g. Fabrication workshop, tooling machinery, mobile water testing lab"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Assigned Technical Industry Mentor *
                </label>
                <input
                  type="text"
                  required
                  value={mentorName}
                  onChange={(e) => setMentorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProjectForSupport(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSupport}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingSupport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Confirm Collaboration Partnership</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
