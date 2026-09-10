import React from 'react';
import {
  PlayCircle,
  Sparkles,
  Users,
  GraduationCap,
  Building2,
  Landmark,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  GitBranch
} from 'lucide-react';
import { UserRole } from '../types';

interface DemoScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: UserRole) => void;
  onSelectScenario: (scenarioId: string) => void;
}

export const DemoScenarioModal: React.FC<DemoScenarioModalProps> = ({
  isOpen,
  onClose,
  onSelectRole,
  onSelectScenario
}) => {
  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'scenario-water',
      badge: 'Full Quad-Helix Flow',
      title: '1. School Drinking Water Crisis in Ormanjhi',
      description:
        'Citizen reports yellow water with fluoride contamination near school. AI routes to BIT Mesra → Team proposes Solar Nanofiltration → Tata Steel TSRDS sponsors ₹2.5L → Govt approves 80% CSR rebate → 1,200 students benefited.',
      category: 'Water',
      initialRole: 'citizen' as UserRole,
      steps: [
        { role: 'Citizen', action: 'Reports drinking water crisis via voice/photo (CH-JH-2026-000001)' },
        { role: 'AI Engine', action: 'Gemini analyzes priority (Critical) & routes to BIT Mesra' },
        { role: 'University', action: 'BIT Mesra faculty & students submit Nanofiltration Proposal' },
        { role: 'Industry', action: 'Tata Steel TSRDS offers ₹2,50,000 + fabrication workshop' },
        { role: 'Government', action: 'Govt approves ₹2,00,000 (80%) CSR innovation compensation' }
      ]
    },
    {
      id: 'scenario-panchayat',
      badge: 'Fast Civic Resolution',
      title: '2. Broken Street Light in Ward 4 (Panchayat Path)',
      description:
        'Citizen reports flickering/broken solar streetlight endangering girls after dark. AI routes to local Gram Panchayat → Panchayat technician replaces LED luminaire & battery within 48 hours.',
      category: 'Roads & Infrastructure',
      initialRole: 'government' as UserRole,
      steps: [
        { role: 'Citizen', action: 'Submits broken street light report' },
        { role: 'AI Engine', action: 'Detects routine civil repair → Routes to Panchayat' },
        { role: 'Panchayat', action: 'Panchayat accepts and dispatches electrical supervisor' },
        { role: 'Resolution', action: 'Resolved in 48 hours for ₹4,500; impact verified' }
      ]
    },
    {
      id: 'scenario-escalation',
      badge: 'Escalation Protocol',
      title: '3. Culvert Collapse in Ghatshila (Panchayat → University Escalation)',
      description:
        'Panchayat inspects collapsed culvert washed out by monsoon floods. Because hydraulic scour and structural load exceed local masonry skills, Panchayat uses the "Escalate to University" protocol → AI matches NIT Jamshedpur → Precast Slag Box Culvert designed.',
      category: 'Roads & Infrastructure',
      initialRole: 'government' as UserRole,
      steps: [
        { role: 'Panchayat', action: 'Panchayat logs technical deficit: "Erosion exceeds local capacity"' },
        { role: 'Escalation', action: 'Triggers 1-click escalation to University' },
        { role: 'NIT JSR', action: 'Structural Engineering cell designs precast box culvert' },
        { role: 'JRIC', action: 'Jharkhand Rural Infra Corp provides casting molds & crane' }
      ]
    },
    {
      id: 'scenario-duplicate',
      badge: 'AI Semantic Detection',
      title: '4. Live AI Duplicate & Similarity Detection',
      description:
        'Experience how CivicSolve prevents duplicate problem spam. Simulates typing "School water yellow dirty handpump" and watch the AI engine match CH-JH-2026-000001 with 92% similarity rating.',
      category: 'AI NLP',
      initialRole: 'citizen' as UserRole,
      steps: [
        { role: 'Citizen', action: 'Enters problem title & description in report form' },
        { role: 'AI Engine', action: 'Scans 150+ challenges in unified dataset via semantic overlap' },
        { role: 'Result', action: 'Flags 92% Duplicate match with full dossier preview' }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-left">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white">SIH Judge Guided Demo Scenarios</h2>
              <span className="bg-amber-500/20 text-amber-300 text-xs font-semibold px-2 py-0.5 rounded border border-amber-500/30">
                SIH26043 Evaluation
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any workflow scenario below to walk through the exact problem-solving lifecycle across stakeholders.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 font-semibold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {scenarios.map(sc => (
              <div
                key={sc.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-blue-500/20 text-blue-300 text-[11px] font-semibold px-2 py-0.5 rounded">
                      {sc.badge}
                    </span>
                    <span className="text-slate-400 text-[11px]">{sc.category}</span>
                  </div>

                  <h3 className="font-bold text-sm text-white mb-2">{sc.title}</h3>
                  <p className="text-slate-300 text-xs leading-relaxed mb-4">{sc.description}</p>

                  <div className="space-y-1.5 border-t border-slate-900 pt-3 mb-4">
                    {sc.steps.map((st, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px]">
                        <span className="font-bold text-blue-400 shrink-0">{st.role}:</span>
                        <span className="text-slate-400">{st.action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Switch to: <strong className="text-white capitalize">{sc.initialRole}</strong>
                  </span>

                  <button
                    onClick={() => {
                      onSelectRole(sc.initialRole);
                      onSelectScenario(sc.id);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow transition-all"
                  >
                    <span>Launch Scenario</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/90 text-xs text-slate-400">
          <span>
            Tip: You can switch roles at any time using the <strong>Judge Demo Switcher</strong> in the top header.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
