import React from 'react';
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  GitBranch,
  Building2,
  GraduationCap,
  Landmark,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Challenge, Project } from '../types';

interface ChallengeDetailModalProps {
  challenge: Challenge | null;
  project?: Project | null;
  onClose: () => void;
  onOpenProject?: (project: Project) => void;
}

export const ChallengeDetailModal: React.FC<ChallengeDetailModalProps> = ({
  challenge,
  project,
  onClose,
  onOpenProject
}) => {
  if (!challenge) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-left">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-900/90">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                {challenge.id}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {challenge.category}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                challenge.priority === 'Critical' ? 'bg-red-500/20 text-red-300' :
                challenge.priority === 'High' ? 'bg-amber-500/20 text-amber-300' :
                'bg-blue-500/20 text-blue-300'
              }`}>
                {challenge.priority} Priority
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                {challenge.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">{challenge.title}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{challenge.village}, {challenge.mandal}, {challenge.district}, Jharkhand</span>
              <span>•</span>
              <span>Reported on {new Date(challenge.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 font-semibold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-300">
          {/* Description */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Citizen Description & Ground Reality
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {challenge.description}
            </p>

            {challenge.media?.images && challenge.media.images.length > 0 && (
              <div className="mt-4 flex gap-3">
                {challenge.media.images.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="Ground proof"
                    referrerPolicy="no-referrer"
                    className="w-32 h-24 object-cover rounded-lg border border-slate-800"
                  />
                ))}
              </div>
            )}
          </div>

          {/* AI Analysis Dossier */}
          {challenge.aiAnalysis && (
            <div className="bg-slate-950 p-5 rounded-xl border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-indigo-400 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Gemini 3.8 Flash AI Analysis & Risk Score</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Engine: {challenge.aiAnalysis.modelUsed || 'gemini-3.8-flash'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Subcategory</div>
                  <div className="font-semibold text-white mt-0.5">{challenge.aiAnalysis.subcategory}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Citizens Affected (Est.)</div>
                  <div className="font-bold text-emerald-400 text-sm mt-0.5">
                    ~{challenge.aiAnalysis.citizensAffectedEstimate} People
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Safety Risk Level</div>
                  <div className="font-semibold text-rose-400 mt-0.5">{challenge.aiAnalysis.safetyRiskLevel}</div>
                </div>
              </div>

              {/* Routing Decision */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2 font-bold text-blue-400 mb-1">
                  <GitBranch className="w-4 h-4" />
                  <span>AI Routing: {challenge.aiAnalysis.routingTarget} ({challenge.aiAnalysis.routingConfidence}% Confidence)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {challenge.aiAnalysis.routingReason}
                </p>
                <div className="mt-2 text-slate-400">
                  Assigned Authority:{' '}
                  <span className="font-semibold text-white">{challenge.assignedTo?.name || 'Local Panchayat'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Semantic Duplicate Detection Status */}
          {challenge.duplicateInfo && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold uppercase tracking-wider text-slate-400">
                  Semantic Duplicate Search
                </span>
                <span className={`font-bold px-2 py-0.5 rounded ${
                  challenge.duplicateInfo.classification === 'Duplicate' ? 'bg-rose-500/20 text-rose-300' :
                  challenge.duplicateInfo.classification === 'Highly Similar' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {challenge.duplicateInfo.classification} ({challenge.duplicateInfo.similarityScore}% Match)
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {challenge.duplicateInfo.reasoning}
              </p>
            </div>
          )}

          {/* Connected R&D Project & Industry Collaboration if available */}
          {project && (
            <div className="bg-slate-950 p-5 rounded-xl border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-purple-400 uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4" />
                  <span>University R&D Project: {project.id}</span>
                </div>
                <span className="bg-purple-500/20 text-purple-300 font-semibold px-2 py-0.5 rounded">
                  {project.status}
                </span>
              </div>

              <div className="font-bold text-sm text-white">{project.proposal.proposedSolution}</div>
              <p className="text-slate-300 leading-relaxed">{project.proposal.problemAnalysis}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px]">
                <div>
                  <span className="text-slate-400">Lead Faculty:</span>{' '}
                  <span className="text-white font-semibold">{project.proposal.facultyMentorName}</span>
                </div>
                <div>
                  <span className="text-slate-400">Student Innovators:</span>{' '}
                  <span className="text-white font-semibold">{project.proposal.studentTeamNames.join(', ')}</span>
                </div>
              </div>

              {project.industrySupport && (
                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 mt-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Industry Partner: {project.industrySupport.industryName}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Funding: ₹{project.industrySupport.committedFundingInr.toLocaleString('en-IN')} • Mentor: {project.industrySupport.technicalMentorAssigned}
                    </div>
                  </div>
                  <span className="font-semibold text-amber-400 px-2 py-0.5 rounded bg-amber-500/20">
                    {project.industrySupport.prototypeStatus}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Panchayat Resolution Impact if resolved */}
          {challenge.impactMetrics && (
            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-2">
              <div className="font-bold text-emerald-400 uppercase tracking-wider">
                Resolution & Verified Impact
              </div>
              <p className="text-slate-300">{challenge.impactMetrics.impactSummary}</p>
              <div className="flex gap-4 pt-1 text-slate-400 text-[11px]">
                <span>Beneficiaries: <strong className="text-emerald-400">{challenge.impactMetrics.citizensBenefited} citizens</strong></span>
                <span>Cost: <strong className="text-white">₹{challenge.impactMetrics.actualCost?.toLocaleString('en-IN')}</strong></span>
                <span>Score: <strong className="text-purple-400">{challenge.impactMetrics.impactScore}/100</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/90">
          <span className="text-xs text-slate-500">
            CivicSolve Grid ID: {challenge.id}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
