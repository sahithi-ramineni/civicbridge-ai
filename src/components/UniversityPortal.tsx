import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  CheckCircle2,
  Clock,
  Building2,
  PlusCircle,
  FileText,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  CheckSquare,
  Award
} from 'lucide-react';
import {
  Challenge,
  Project,
  University,
  Faculty,
  Student,
  User
} from '../types';
import {
  fetchProjects,
  fetchFaculty,
  fetchStudents,
  submitSolutionProposal,
  updateProjectStatus
} from '../utils/api';

interface UniversityPortalProps {
  currentUser: User | null;
  challenges: Challenge[];
  universities: University[];
  onSelectChallenge: (challenge: Challenge) => void;
  onRefreshData: () => void;
}

export const UniversityPortal: React.FC<UniversityPortalProps> = ({
  currentUser,
  challenges,
  universities,
  onSelectChallenge,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'recommended' | 'active-projects' | 'students-faculty'>('recommended');
  const [projects, setProjects] = useState<Project[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Proposal Modal State
  const [selectedChallengeForProposal, setSelectedChallengeForProposal] = useState<Challenge | null>(null);
  const [proposedSolution, setProposedSolution] = useState<string>('');
  const [problemAnalysis, setProblemAnalysis] = useState<string>('');
  const [techRequired, setTechRequired] = useState<string>('Solar PV, Nanofiltration Membrane, IoT Telemetry, SS304 Enclosure');
  const [requiredResources, setRequiredResources] = useState<string>('Spectrophotometer, Water Testing Lab, Fabrication Workshop');
  const [estimatedCost, setEstimatedCost] = useState<number>(250000);
  const [timelineWeeks, setTimelineWeeks] = useState<number>(6);
  const [expectedImpact, setExpectedImpact] = useState<string>('Provides 2,500 L/day WHO-compliant potable drinking water to 1,200 school children and villagers.');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('FAC-001');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(['STU-001', 'STU-002']);
  const [isSubmittingProposal, setIsSubmittingProposal] = useState<boolean>(false);

  // Find user's university or default to BIT Mesra
  const currentUniv = universities.find(u => 
    u.name.toLowerCase().includes(currentUser?.organization?.toLowerCase() || '')
  ) || universities[0];

  useEffect(() => {
    loadUniversityData();
  }, [currentUniv?.id]);

  const loadUniversityData = async () => {
    setLoading(true);
    try {
      const [pData, fData, sData] = await Promise.all([
        fetchProjects(),
        fetchFaculty(currentUniv?.id),
        fetchStudents(currentUniv?.id)
      ]);
      setProjects(pData);
      setFacultyList(fData);
      setStudentList(sData);
    } catch (err) {
      console.error('Error loading university data', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter challenges routed to this university or matching its domain
  const recommendedChallenges = challenges.filter(c => 
    c.assignedTo?.type === 'University' && 
    (c.assignedTo?.id === currentUniv?.id || !c.assignedTo?.id || c.category === 'Water' || c.status === 'Panchayat Escalated')
  );

  const activeProjects = projects.filter(p => p.universityId === currentUniv?.id);

  // Handle Proposal Open
  const handleOpenProposal = (challenge: Challenge) => {
    setSelectedChallengeForProposal(challenge);
    if (challenge.category === 'Water') {
      setProposedSolution(`Solar-Powered Nanofiltration & Activated Alumina De-fluoridation Kiosk for ${challenge.village}`);
      setProblemAnalysis('Fluoride and heavy turbidity levels exceed BIS 10500 limits. Standard chlorination is insufficient; requires combined adsorption and 0.001-micron membrane filtration.');
      setTechRequired('Solar PV, Activated Alumina, Hollow Fiber Nanofiltration, ESP32 IoT Sensor');
      setEstimatedCost(280000);
    } else if (challenge.category === 'Waste Management') {
      setProposedSolution(`Continuous Aerated Rotary Bio-Drum Composter with Plastic Extrusion Pilot for ${challenge.mandal}`);
      setProblemAnalysis('High moisture organic perishables rot rapidly at village haats. Automated thermophilic aeration accelerates digestion from 45 days to 8 days with zero foul odor.');
      setTechRequired('Geared Motor, Carbon-Nitrogen Ratio Monitor, Shredder, Hydraulic Press');
      setEstimatedCost(220000);
    } else {
      setProposedSolution(`Precast Blast Furnace Slag Geopolymer Box Culvert System for ${challenge.mandal}`);
      setProblemAnalysis('Erosion and flash floods wash out sub-base. Utilizing industrial slag and high-strength geopolymer binder achieves 45 MPa compressive strength within 72 hours.');
      setTechRequired('Geopolymer Precast Mold, Slag Binder, Reinforced Concrete, Geo-textile');
      setEstimatedCost(350000);
    }
  };

  // Submit Proposal
  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeForProposal) return;

    setIsSubmittingProposal(true);
    try {
      const facultyObj = facultyList.find(f => f.id === selectedFacultyId) || facultyList[0];
      const studentNames = studentList
        .filter(s => selectedStudentIds.includes(s.id))
        .map(s => s.name);

      await submitSolutionProposal({
        challengeId: selectedChallengeForProposal.id,
        universityId: currentUniv.id,
        proposal: {
          proposedSolution,
          problemAnalysis,
          technologyRequired: techRequired.split(',').map(s => s.trim()),
          requiredResources: requiredResources.split(',').map(s => s.trim()),
          estimatedCost,
          expectedTimelineWeeks: timelineWeeks,
          expectedImpact,
          prototypeRequirement: 'Field deployable pilot skid assembly.',
          facultyMentorId: facultyObj?.id || 'FAC-001',
          facultyMentorName: facultyObj?.name || 'Prof. (Dr.) A. K. Sharma',
          studentTeamIds: selectedStudentIds,
          studentTeamNames: studentNames.length > 0 ? studentNames : ['Student Innovation Cell'],
          technicalRequirements: 'Weather-proof, low maintenance, village operator friendly.'
        }
      });

      setSelectedChallengeForProposal(null);
      await loadUniversityData();
      onRefreshData();
      setActiveTab('active-projects');
    } catch (err) {
      console.error('Error submitting proposal', err);
      alert('Failed to submit proposal');
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  // Toggle milestone completion
  const handleCompleteMilestone = async (projectId: string, milestoneId: string) => {
    try {
      await updateProjectStatus(projectId, {
        status: 'Prototype Development',
        completedMilestoneId: milestoneId
      });
      await loadUniversityData();
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {currentUniv?.name || 'Birla Institute of Technology, Mesra'}
              </h1>
              <span className="bg-purple-500/20 text-purple-300 text-xs font-semibold px-2 py-0.5 rounded border border-purple-500/30">
                Partner University
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Logged in as: <span className="text-white font-medium">{currentUser?.name || 'Prof. (Dr.) A. K. Sharma'}</span> • {currentUser?.department || 'Department of Civil & Environmental Engineering'}
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div className="text-center px-2">
            <div className="text-lg font-bold text-purple-400">{recommendedChallenges.length}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Recommended</div>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="text-center px-2">
            <div className="text-lg font-bold text-emerald-400">{activeProjects.length}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Active R&D</div>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="text-center px-2">
            <div className="text-lg font-bold text-amber-400">{studentList.length}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Students</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('recommended')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'recommended'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI-Recommended Challenges ({recommendedChallenges.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('active-projects')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'active-projects'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Active Projects & Milestones ({activeProjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('students-faculty')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'students-faculty'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Faculty Mentors & Student Teams</span>
        </button>
      </div>

      {/* TAB 1: RECOMMENDED CHALLENGES */}
      {activeTab === 'recommended' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>
                These civic challenges require technical research, chemical filtration, or civil engineering, matching {currentUniv.shortName}'s lab facilities.
              </span>
            </div>
            <span className="font-semibold text-purple-300">Auto-Matched by AI</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recommendedChallenges.slice(0, 8).map(challenge => (
              <div
                key={challenge.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      {challenge.id}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      challenge.priority === 'Critical' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {challenge.priority} Priority
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-white mb-2 line-clamp-2">
                    {challenge.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                    {challenge.description}
                  </p>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 mb-4 text-[11px] text-slate-300">
                    <div className="font-semibold text-purple-400 mb-1">AI Routing Justification:</div>
                    <p className="text-slate-400 line-clamp-2">
                      {challenge.aiAnalysis?.routingReason || 'High technical complexity; exceeds local panchayat resources.'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {challenge.village}, {challenge.district}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectChallenge(challenge)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Dossier
                    </button>
                    <button
                      onClick={() => handleOpenProposal(challenge)}
                      className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1 shadow"
                    >
                      <span>Propose Solution</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE PROJECTS & MILESTONES */}
      {activeTab === 'active-projects' && (
        <div className="space-y-6">
          {activeProjects.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <div className="text-base font-bold text-white">No active projects yet</div>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Accept a challenge from the "AI-Recommended Challenges" tab to create your team's first engineering solution proposal.
              </p>
            </div>
          ) : (
            activeProjects.map(proj => (
              <div key={proj.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                        {proj.id}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                        {proj.category}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        {proj.status}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white">{proj.proposal.proposedSolution}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Responding to Challenge: <span className="text-slate-300 font-medium">{proj.challengeTitle}</span> ({proj.district})
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <div className="text-xs text-slate-400">Budget & Timeline:</div>
                    <div className="text-sm font-bold text-emerald-400">
                      ₹{proj.proposal.estimatedCost.toLocaleString('en-IN')} • {proj.proposal.expectedTimelineWeeks} Weeks
                    </div>
                  </div>
                </div>

                {/* Team & Faculty Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-b border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400">Faculty Mentor:</span>{' '}
                    <span className="text-white font-semibold">{proj.proposal.facultyMentorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Student Team:</span>{' '}
                    <span className="text-white font-semibold">{proj.proposal.studentTeamNames.join(', ')}</span>
                  </div>
                </div>

                {/* Industry Collaboration Banner if present */}
                {proj.industrySupport ? (
                  <div className="my-4 p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2 font-bold text-amber-300">
                        <Building2 className="w-4 h-4" />
                        <span>Industry Partner: {proj.industrySupport.industryName}</span>
                      </div>
                      <p className="text-slate-300 mt-1">
                        Committed Funding: <span className="font-semibold text-emerald-400">₹{proj.industrySupport.committedFundingInr.toLocaleString('en-IN')}</span> • Resources: {proj.industrySupport.resourcesProvided}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-center font-semibold">
                      Prototype: {proj.industrySupport.prototypeStatus}
                    </span>
                  </div>
                ) : (
                  <div className="my-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Awaiting Industry CSR collaboration & prototyping support.</span>
                    <span className="text-amber-400 font-semibold">Seeking Partner</span>
                  </div>
                )}

                {/* Milestones Stepper */}
                <div className="pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Project Execution Milestones
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {proj.milestones.map((m, idx) => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                          m.completed
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[11px] text-slate-400">M0{idx + 1}</span>
                            {m.completed ? (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Done</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">Due: {m.dueDate}</span>
                            )}
                          </div>
                          <div className="font-semibold text-white mb-1">{m.title}</div>
                          <p className="text-[11px] text-slate-400">{m.description}</p>
                        </div>

                        {!m.completed && (
                          <button
                            onClick={() => handleCompleteMilestone(proj.id, m.id)}
                            className="mt-3 w-full py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[11px] transition-colors"
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: FACULTY MENTORS & STUDENT TEAMS */}
      {activeTab === 'students-faculty' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Faculty List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              <span>Available Faculty Mentors</span>
            </h3>
            <div className="space-y-3">
              {facultyList.map(f => (
                <div key={f.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="font-bold text-white text-sm">{f.name}</div>
                  <div className="text-purple-400 text-xs mt-0.5">{f.designation} • {f.department}</div>
                  <div className="text-slate-400 text-[11px] mt-1">Specialization: {f.specialization}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Innovators */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span>Registered Student Innovators ({studentList.length})</span>
            </h3>
            <div className="space-y-3">
              {studentList.map(s => (
                <div key={s.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-sm">{s.name}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{s.program} • {s.department} (Year {s.yearOfStudy})</div>
                    <div className="text-[11px] text-blue-400 mt-1">Skills: {s.skills.join(', ')}</div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Ready
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PROPOSAL MODAL */}
      {selectedChallengeForProposal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-left">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div>
                <h2 className="text-xl font-bold text-white">Submit Solution Proposal</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Challenge: <span className="text-white font-medium">{selectedChallengeForProposal.title}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedChallengeForProposal(null)}
                className="text-slate-400 hover:text-white p-2 font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs text-slate-300">
              <div>
                <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1">
                  Proposed Solution Title *
                </label>
                <input
                  type="text"
                  required
                  value={proposedSolution}
                  onChange={(e) => setProposedSolution(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1">
                  Technical Problem Analysis *
                </label>
                <textarea
                  rows={3}
                  required
                  value={problemAnalysis}
                  onChange={(e) => setProblemAnalysis(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Technology & Engineering Required
                  </label>
                  <input
                    type="text"
                    value={techRequired}
                    onChange={(e) => setTechRequired(e.target.value)}
                    placeholder="e.g. Nanofiltration, ESP32, Solar PV"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Required Lab & Workshop Resources
                  </label>
                  <input
                    type="text"
                    value={requiredResources}
                    onChange={(e) => setRequiredResources(e.target.value)}
                    placeholder="e.g. Spectrophotometer, Welding Yard"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Estimated R&D & Prototype Cost (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Expected Timeline (Weeks) *
                  </label>
                  <input
                    type="number"
                    required
                    value={timelineWeeks}
                    onChange={(e) => setTimelineWeeks(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Expected Impact on Local Community
                </label>
                <input
                  type="text"
                  value={expectedImpact}
                  onChange={(e) => setExpectedImpact(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Assign Faculty Mentor *
                  </label>
                  <select
                    value={selectedFacultyId}
                    onChange={(e) => setSelectedFacultyId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {facultyList.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Select Student Team Members *
                  </label>
                  <div className="space-y-1 max-h-24 overflow-y-auto bg-slate-950 p-2 rounded-xl border border-slate-800">
                    {studentList.map(s => (
                      <label key={s.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(s.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudentIds([...selectedStudentIds, s.id]);
                            } else {
                              setSelectedStudentIds(selectedStudentIds.filter(id => id !== s.id));
                            }
                          }}
                          className="rounded border-slate-700 text-purple-600 focus:ring-0"
                        />
                        <span>{s.name} ({s.department})</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedChallengeForProposal(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProposal}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingProposal ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Submit to Grid for Industry Support</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
