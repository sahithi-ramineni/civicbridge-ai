import React, { useState } from 'react';
import {
  Users,
  Cpu,
  Building2,
  GraduationCap,
  Landmark,
  ArrowRight,
  Droplets,
  Trash2,
  Truck,
  CheckCircle2,
  Search,
  Sparkles,
  GitBranch,
  ShieldCheck,
  TrendingUp,
  Award,
  ChevronRight,
  Filter,
  Layers,
  MapPin,
  Clock,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { Challenge, PlatformStats, UserRole } from '../types';

interface LandingPageProps {
  stats: PlatformStats | null;
  challenges: Challenge[];
  onOpenReport: () => void;
  onOpenAuth: () => void;
  onSelectRole: (role: UserRole) => void;
  onSelectChallenge: (challenge: Challenge) => void;
  onOpenDemoScenarios: () => void;
  onNavigateToExplore: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  stats,
  challenges,
  onOpenReport,
  onOpenAuth,
  onSelectRole,
  onSelectChallenge,
  onOpenDemoScenarios,
  onNavigateToExplore
}) => {
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredChallenges = challenges
    .filter(c => selectedCategory === 'All' || c.category === selectedCategory)
    .filter(c => 
      !searchQuery || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 6);

  const workflowSteps = [
    {
      step: 1,
      title: 'Citizen Reporting',
      badge: 'Multimodal Submission',
      desc: 'Citizen reports civic problem using Text, Photo, Video, or Voice audio in local languages.',
      icon: Users,
      color: 'blue'
    },
    {
      step: 2,
      title: 'AI Analysis & Duplicates',
      badge: 'Gemini 3.8 Flash',
      desc: 'AI classifies category, estimates affected citizens, checks duplicate database, and calculates priority.',
      icon: Cpu,
      color: 'indigo'
    },
    {
      step: 3,
      title: 'Intelligent Routing',
      badge: 'Panchayat or University',
      desc: 'Simple issues route to local Panchayat. Complex engineering/chemistry problems route to top universities.',
      icon: GitBranch,
      color: 'purple'
    },
    {
      step: 4,
      title: 'University & Student Teams',
      badge: 'R&D Innovation',
      desc: 'Faculty mentors and student teams design actionable engineering solution proposals.',
      icon: GraduationCap,
      color: 'violet'
    },
    {
      step: 5,
      title: 'Industry Collaboration',
      badge: 'CSR & Prototyping',
      desc: 'Industry partners (Tata Steel TSRDS, JSW, etc.) fund, fabricate, and test field prototypes.',
      icon: Building2,
      color: 'amber'
    },
    {
      step: 6,
      title: 'Govt Monitoring & Impact',
      badge: 'Resolution & Reimbursement',
      desc: 'State monitors project milestones, approves CSR compensation, and records citizen impact.',
      icon: Landmark,
      color: 'emerald'
    }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800/80">
        {/* Background glow accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Top Chip */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 mb-6 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-semibold text-emerald-400">Smart India Hackathon 2026</span>
              <span className="text-slate-500">•</span>
              <span>Problem Statement SIH26043</span>
            </div>

            {/* Prompt exact Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
              Report a Problem. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Connect the Right People.
              </span> <br className="hidden sm:inline" />
              Build the Solution.
            </h1>

            {/* Prompt exact Subheading */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
              CivicSolve uses AI to connect communities, Panchayats, universities, industries and government to solve real-world societal challenges.
            </p>

            {/* Main Action CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <button
                id="hero-btn-report"
                onClick={onOpenReport}
                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-lg shadow-blue-600/25 flex items-center gap-2 transition-all hover:translate-y-[-1px] active:translate-y-0"
              >
                <span>Report a Civic Problem</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                id="hero-btn-explore"
                onClick={onNavigateToExplore}
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-base flex items-center gap-2 transition-all"
              >
                <Search className="w-5 h-5 text-slate-400" />
                <span>Explore 150+ Challenges</span>
              </button>

              <button
                id="hero-btn-scenarios"
                onClick={onOpenDemoScenarios}
                className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-semibold text-base flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Judge Guided Demo</span>
              </button>
            </div>

            {/* 4 Role Portal Direct Access Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left max-w-4xl mx-auto">
              <div
                id="role-card-citizen"
                onClick={() => onSelectRole('citizen')}
                className="group p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                </div>
                <div className="font-semibold text-sm text-white">Citizen Portal</div>
                <div className="text-xs text-slate-400 line-clamp-1">Voice, photo, video complaints</div>
              </div>

              <div
                id="role-card-university"
                onClick={() => onSelectRole('university')}
                className="group p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
                </div>
                <div className="font-semibold text-sm text-white">University Portal</div>
                <div className="text-xs text-slate-400 line-clamp-1">R&D & Student Team Solvers</div>
              </div>

              <div
                id="role-card-industry"
                onClick={() => onSelectRole('industry')}
                className="group p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                </div>
                <div className="font-semibold text-sm text-white">Industry Portal</div>
                <div className="text-xs text-slate-400 line-clamp-1">CSR, Prototyping & Funding</div>
              </div>

              <div
                id="role-card-government"
                onClick={() => onSelectRole('government')}
                className="group p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div className="font-semibold text-sm text-white">Government Portal</div>
                <div className="text-xs text-slate-400 line-clamp-1">Panchayats & State Impact</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KEY PLATFORM STATISTICS */}
      <section className="py-12 bg-slate-900/60 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">{stats?.totalProblems || 150}+</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Total Challenges</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Synthetic Dataset (Jharkhand)</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {(stats?.citizensBenefited || 45600).toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Citizens Benefited</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Across 40+ rural blocks</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">6 Institutions</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Universities Linked</div>
              <div className="text-[11px] text-slate-500 mt-0.5">BIT Mesra, NIT, IIT ISM</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">7 Industry Labs</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Industry Partners</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Tata Steel, JSW, EcoTech</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400">
                ₹{((stats?.totalInvestmentInr || 5800000) / 100000).toFixed(1)} Lakhs
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Committed CSR R&D</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Prototypes & Deployments</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-400">
                {stats?.averageResolutionDays || 18} Days
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Avg Resolution</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Panchayat & University</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VISUAL INTERACTIVE WORKFLOW */}
      <section className="py-20 border-b border-slate-800/80 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">End-to-End Workflow</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              From Citizen Report to Real-World Impact
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              Citizen → AI Analysis → Duplicate Detection → AI Routing → Panchayat OR University → Solution Proposal → Industry Prototype → Government Monitoring → Implementation → Impact
            </p>
          </div>

          {/* Workflow Stepper Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {workflowSteps.map(item => {
              const Icon = item.icon;
              const isActive = activeWorkflowStep === item.step;
              return (
                <div
                  key={item.step}
                  onClick={() => setActiveWorkflowStep(item.step)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                    isActive
                      ? 'bg-slate-900 border-blue-500 ring-2 ring-blue-500/20 shadow-lg'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        Stage 0{item.step}
                      </span>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                    </div>
                    <div className="font-bold text-sm text-white mb-1">{item.title}</div>
                    <div className="text-[11px] font-medium text-blue-400 mb-2">{item.badge}</div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Active Stage Detailed Spotlight */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-blue-600/20 text-blue-400 font-semibold px-2.5 py-0.5 rounded text-xs">
                    Stage 0{activeWorkflowStep} Spotlight
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {workflowSteps[activeWorkflowStep - 1].badge}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {workflowSteps[activeWorkflowStep - 1].title}
                </h3>
                <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                  {workflowSteps[activeWorkflowStep - 1].desc}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={onOpenDemoScenarios}
                  className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow"
                >
                  <span>See Live Example</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THREE INITIAL SUPPORTED CATEGORIES */}
      <section className="py-20 bg-slate-900/40 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">Initial Supported Scope</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Primary Civic Challenge Categories
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              Approximately 50 synthetic records generated per category, intentionally featuring duplicate semantic variations to demonstrate AI matching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Water */}
            <div className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                  <Droplets className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">Water Solutions</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    50 Challenges
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                  Drinking water scarcity, fluoride & arsenic chemical contamination, broken handpumps, pipeline ruptures, and check dam hydrological siltation.
                </p>
                <div className="space-y-1.5 text-xs text-slate-400 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Panchayat: Handpump washers, pipe leaks, motor repair</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>University: Solar Nanofiltration, Fluoride adsorption</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setSelectedCategory('Water'); onNavigateToExplore(); }}
                className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Filter Water Challenges</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Waste Management */}
            <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">Waste Management</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    50 Challenges
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                  Market haat organic rot, single-use plastic clogging stormwater canals, biomedical hospital dumping, and fly-ash slurry soil contamination.
                </p>
                <div className="space-y-1.5 text-xs text-slate-400 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Panchayat: Tractor collection, drain desilting, bins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>University: Bio-drum composting, plastic-to-pavers</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setSelectedCategory('Waste Management'); onNavigateToExplore(); }}
                className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Filter Waste Challenges</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Roads & Infrastructure */}
            <div className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">Roads & Infrastructure</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    50 Challenges
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                  Collapsed culverts severing clinic ambulances, expansive clay slush tracks, broken solar streetlights endangering girls, dangerous craters.
                </p>
                <div className="space-y-1.5 text-xs text-slate-400 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Panchayat: LED streetlight repair, cold-patch asphalt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>University: Precast slag box culverts, geogrids</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setSelectedCategory('Roads & Infrastructure'); onNavigateToExplore(); }}
                className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Filter Roads Challenges</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LIVE CHALLENGES FEED & EXPLORER PREVIEW */}
      <section className="py-20 border-b border-slate-800/80 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Unified Challenge Database</div>
              <h2 className="text-3xl font-extrabold text-white">Recent Civic Challenges in Jharkhand</h2>
              <p className="text-sm text-slate-400 mt-1">Live challenges tracked from submission through resolution.</p>
            </div>

            {/* Category Filter Pills & Search */}
            <div className="flex flex-wrap items-center gap-2">
              {['All', 'Water', 'Waste Management', 'Roads & Infrastructure'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredChallenges.map(challenge => (
              <div
                key={challenge.id}
                onClick={() => onSelectChallenge(challenge)}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {challenge.id}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      challenge.priority === 'Critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      challenge.priority === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {challenge.priority} Priority
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-white line-clamp-2 mb-2 leading-snug">
                    {challenge.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {challenge.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{challenge.mandal}, {challenge.district}</span>
                    </span>
                    <span className="text-slate-500">{new Date(challenge.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      challenge.status.includes('Resolved') ? 'bg-emerald-500/20 text-emerald-300' :
                      challenge.status.includes('Panchayat') ? 'bg-sky-500/20 text-sky-300' :
                      'bg-purple-500/20 text-purple-300'
                    }`}>
                      {challenge.status}
                    </span>

                    <span className="text-xs text-blue-400 font-medium flex items-center gap-1 group-hover:underline">
                      <span>View Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={onNavigateToExplore}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm inline-flex items-center gap-2 transition-colors"
            >
              <span>View All 150+ Challenges with Filters</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. COLLABORATION ECOSYSTEM */}
      <section className="py-20 bg-slate-900/60 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">Multi-Stakeholder Quad-Helix</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              The CivicSolve Collaboration Grid
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              Connecting Jharkhand Panchayats, top technological universities, and industry CSR foundations under state government governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-2.5 text-purple-400 font-bold mb-3">
                <GraduationCap className="w-5 h-5" />
                <span>Partner Universities</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-800">
                  <div className="font-semibold text-white">Birla Institute of Technology (BIT Mesra)</div>
                  <div className="text-slate-400 text-[11px]">Water quality, nanomembranes & IoT telemetry</div>
                </li>
                <li className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-800">
                  <div className="font-semibold text-white">NIT Jamshedpur</div>
                  <div className="text-slate-400 text-[11px]">Precast geopolymer culverts & heavy structural engineering</div>
                </li>
                <li className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-800">
                  <div className="font-semibold text-white">IIT (ISM) Dhanbad</div>
                  <div className="text-slate-400 text-[11px]">Heavy metal adsorption & municipal solid waste pyrolysis</div>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-2.5 text-amber-400 font-bold mb-3">
                <Building2 className="w-5 h-5" />
                <span>Industry Partners</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-800">
                  <div className="font-semibold text-white">Tata Steel Rural Development Society</div>
                  <div className="text-slate-400 text-[11px]">Prototype fabrication, membrane vessels & ₹2.5L sponsorship</div>
                </li>
                <li className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-800">
                  <div className="font-semibold text-white">Jharkhand Rural Infrastructure Corp (JRIC)</div>
                  <div className="text-slate-400 text-[11px]">Precast concrete casting yard, cranes & road deployment</div>
                </li>
                <li className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-800">
                  <div className="font-semibold text-white">EcoTech Sustainable Waste Ltd</div>
                  <div className="text-slate-400 text-[11px]">Plastic extruders, hydraulic paver presses & SHG training</div>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-2.5 text-emerald-400 font-bold mb-3">
                <Landmark className="w-5 h-5" />
                <span>Governance & Panchayats</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-800">
                  <div className="font-semibold text-white">15 Gram Panchayats Active</div>
                  <div className="text-slate-400 text-[11px]">Ormanjhi, Kanke, Topchanchi, Mandu, Chandankiyari</div>
                </li>
                <li className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-800">
                  <div className="font-semibold text-white">Panchayat Escalation Protocol</div>
                  <div className="text-slate-400 text-[11px]">Unresolved complex challenges auto-escalated to Universities</div>
                </li>
                <li className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-800">
                  <div className="font-semibold text-white">State Innovation Reimbursement</div>
                  <div className="text-slate-400 text-[11px]">Govt reviews and reimburses 80% CSR prototype expenditure</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-12 bg-slate-950 border-t border-slate-800 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-slate-300 text-sm">CivicSolve — SIH26043 Working Prototype</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Synthetic Demo Dataset for Smart India Hackathon 2026. Not real complaints.
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Gemini 3.8 Flash</span>
            <span>•</span>
            <span>Government of Jharkhand Innovation Cell</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
