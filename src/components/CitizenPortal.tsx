import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  PlusCircle,
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Camera,
  Video,
  Mic,
  MicOff,
  Sparkles,
  GitBranch,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { Challenge, User, DuplicateDetectionResult, AIAnalysisResult } from '../types';
import { submitChallenge, checkDuplicateProblems, checkAiAnalysis } from '../utils/api';

interface CitizenPortalProps {
  currentUser: User | null;
  challenges: Challenge[];
  onSelectChallenge: (challenge: Challenge) => void;
  onRefreshData: () => void;
  initialOpenReportModal?: boolean;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  currentUser,
  challenges,
  onSelectChallenge,
  onRefreshData,
  initialOpenReportModal = false
}) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(initialOpenReportModal);
  const [activeTab, setActiveTab] = useState<'my-reports' | 'track-id'>('my-reports');
  const [trackInputId, setTrackInputId] = useState<string>('');
  const [trackedChallenge, setTrackedChallenge] = useState<Challenge | null>(null);

  // Form State for New Problem
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('Water');
  const [district, setDistrict] = useState<string>(currentUser?.district || 'Ranchi');
  const [mandal, setMandal] = useState<string>(currentUser?.mandal || 'Ormanjhi');
  const [village, setVillage] = useState<string>(currentUser?.village || 'Ormanjhi Tola 1');
  const [exactLocation, setExactLocation] = useState<string>('Near Upgraded Middle School, Main Road');
  const [language, setLanguage] = useState<string>('English');
  const [contactName, setContactName] = useState<string>(currentUser?.name || 'Sunita Devi');
  const [contactPhone, setContactPhone] = useState<string>(currentUser?.mobile || '+91 94311 82910');

  // Media simulation & Audio recorder
  const [mediaImage, setMediaImage] = useState<string | null>(null);
  const [mediaVideo, setMediaVideo] = useState<string | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Live Duplicate & AI State
  const [duplicateResult, setDuplicateResult] = useState<DuplicateDetectionResult | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState<boolean>(false);
  const [aiPreview, setAiPreview] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<Challenge | null>(null);

  const districts = [
    'Ranchi', 'Dhanbad', 'East Singhbhum', 'Bokaro', 'Hazaribagh', 'Ramgarh',
    'Palamu', 'Deoghar', 'Giridih', 'Dumka', 'West Singhbhum', 'Seraikela Kharsawan',
    'Chatra', 'Godda', 'Gumla', 'Jamtara', 'Khunti', 'Koderma', 'Latehar',
    'Lohardaga', 'Pakur', 'Sahebganj', 'Simdega'
  ];

  // Citizen's reported list (filter by user or show top relevant)
  const myReports = challenges.filter(c => 
    c.submittedBy?.userId === currentUser?.id || 
    c.submittedBy?.name === currentUser?.name ||
    c.mandal.toLowerCase() === (currentUser?.mandal || 'ormanjhi').toLowerCase()
  );

  // Audio Recording Handlers
  const startRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setAudioBlobUrl(url);
          // If description was blank, provide transcribed audio sample
          if (!description) {
            setDescription('Voice Note Transcribed: "Humare gaon ke school ke paas jo handpump hai usse peela aur ganda paani nikal raha hai, bachhe bimar pad rahe hain."');
          }
        };

        mediaRecorderRef.current.start();
        setIsRecordingAudio(true);
        setRecordingSeconds(0);
        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      } else {
        // Fallback simulation
        setIsRecordingAudio(true);
        setRecordingSeconds(0);
        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      }
    } catch (err) {
      console.warn('Microphone permission fallback', err);
      // Simulation mode
      setIsRecordingAudio(true);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    clearInterval(timerRef.current);
    setIsRecordingAudio(false);
    if (!audioBlobUrl) {
      setAudioBlobUrl('simulated-voice-note.mp3');
      if (!description) {
        setDescription('Voice Note Transcribed: "Humare gaon ke school ke paas jo handpump hai usse peela aur ganda paani nikal raha hai, bachhe bimar pad rahe hain."');
      }
    }
  };

  // Run Semantic Duplicate Check
  const handleRunDuplicateCheck = async () => {
    if (!title && !description) return;
    setIsCheckingDuplicate(true);
    try {
      const result = await checkDuplicateProblems({
        title,
        description,
        category,
        district
      });
      setDuplicateResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  // Run AI Preview Analysis
  const handleRunAiPreview = async () => {
    if (!title && !description) return;
    setIsAnalyzingAi(true);
    try {
      const preview = await checkAiAnalysis({
        title,
        description,
        categoryHint: category,
        village,
        mandal,
        district
      });
      setAiPreview(preview);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  // Handle Submission
  const handleSubmitProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setIsSubmitting(true);
    try {
      const payload: Partial<Challenge> = {
        title,
        description,
        category: category as any,
        state: 'Jharkhand',
        district,
        mandal,
        village,
        location: `${exactLocation}, ${village}, ${mandal}, ${district}`,
        latitude: 23.3441 + (Math.random() - 0.5) * 0.1,
        longitude: 85.3096 + (Math.random() - 0.5) * 0.1,
        submittedBy: {
          name: contactName,
          mobile: contactPhone,
          userId: currentUser?.id || 'USR-CITIZEN-01'
        },
        preferredLanguage: language,
        media: {
          images: mediaImage ? [mediaImage] : [
            'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80'
          ],
          videoUrl: mediaVideo || undefined,
          audioUrl: audioBlobUrl || undefined
        }
      };

      const newChallenge = await submitChallenge(payload);
      setSubmissionSuccess(newChallenge);
      onRefreshData();
    } catch (err) {
      console.error('Error submitting challenge', err);
      alert('Failed to submit challenge. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Form
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setMediaImage(null);
    setMediaVideo(null);
    setAudioBlobUrl(null);
    setDuplicateResult(null);
    setAiPreview(null);
    setSubmissionSuccess(null);
    setIsReportModalOpen(false);
  };

  // Handle Track ID
  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackInputId) return;
    const found = challenges.find(c => 
      c.id.toLowerCase().trim() === trackInputId.toLowerCase().trim()
    );
    setTrackedChallenge(found || null);
  };

  // Tracking Stage Definition for Timeline
  const allStages = [
    { key: 'Submitted', label: 'Problem Submitted', desc: 'Received in CivicSolve grid' },
    { key: 'AI Analyzed', label: 'AI Analyzed & Priority', desc: 'Gemini priority & risk scoring' },
    { key: 'Routed', label: 'Intelligently Routed', desc: 'Assigned to Panchayat or University' },
    { key: 'Accepted', label: 'Accepted by Entity', desc: 'Panchayat or University in progress' },
    { key: 'Solution Proposed', label: 'Solution Proposed', desc: 'Student team & faculty design' },
    { key: 'Industry Collaborating', label: 'Industry Support', desc: 'CSR funding & prototype fabrication' },
    { key: 'Testing', label: 'Testing & Validation', desc: 'Lab & field pilot testing' },
    { key: 'Resolved', label: 'Resolved & Deployed', desc: 'Commissioned with verified citizen impact' }
  ];

  const getStageIndex = (status: string) => {
    if (status.includes('Resolved')) return 7;
    if (status.includes('Testing')) return 6;
    if (status.includes('Industry')) return 5;
    if (status.includes('Solution') || status.includes('Proposal')) return 4;
    if (status.includes('Accepted') || status.includes('In Progress')) return 3;
    if (status.includes('Escalated') || status.includes('Routed')) return 2;
    if (status.includes('Analyzed')) return 1;
    return 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Profile & Welcome Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow">
            {currentUser?.name ? currentUser.name.charAt(0) : 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {currentUser?.name || 'Sunita Devi'}
              </h1>
              <span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-2 py-0.5 rounded border border-blue-500/30">
                Verified Citizen
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>
                {currentUser?.village || 'Ormanjhi Tola 1'}, {currentUser?.mandal || 'Ormanjhi'}, {currentUser?.district || 'Ranchi'}, Jharkhand
              </span>
            </p>
          </div>
        </div>

        {/* Primary CTA */}
        <button
          id="citizen-btn-report-now"
          onClick={() => { resetForm(); setIsReportModalOpen(true); }}
          className="w-full md:w-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Report a Civic Problem</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 mb-6">
        <button
          id="citizen-tab-my-reports"
          onClick={() => setActiveTab('my-reports')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'my-reports'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          My Reported Problems ({myReports.length})
        </button>

        <button
          id="citizen-tab-track-id"
          onClick={() => setActiveTab('track-id')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'track-id'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Track by Challenge ID
        </button>
      </div>

      {/* TAB 1: MY REPORTS */}
      {activeTab === 'my-reports' && (
        <div>
          {myReports.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <div className="text-base font-bold text-white">No challenges reported yet</div>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Use the "Report a Civic Problem" button to voice issues regarding water supply, garbage accumulation, or broken roads.
              </p>
              <button
                onClick={() => { resetForm(); setIsReportModalOpen(true); }}
                className="mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Your First Report</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myReports.map((challenge) => (
                <div
                  key={challenge.id}
                  onClick={() => onSelectChallenge(challenge)}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        {challenge.id}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        challenge.priority === 'Critical' ? 'bg-red-500/20 text-red-300' :
                        challenge.priority === 'High' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {challenge.priority}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-white line-clamp-2 mb-2">
                      {challenge.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {challenge.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{challenge.mandal}, {challenge.district}</span>
                      </span>
                      <span>{new Date(challenge.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        challenge.status.includes('Resolved') ? 'bg-emerald-500/20 text-emerald-300' :
                        challenge.status.includes('Panchayat') ? 'bg-sky-500/20 text-sky-300' :
                        'bg-purple-500/20 text-purple-300'
                      }`}>
                        {challenge.status}
                      </span>
                      <span className="text-xs text-blue-400 font-medium flex items-center gap-1">
                        Track Progress <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TRACK BY CHALLENGE ID */}
      {activeTab === 'track-id' && (
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleTrackSubmit} className="flex gap-2 mb-8">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                id="input-track-id"
                type="text"
                placeholder="Enter Challenge ID (e.g. CH-JH-2026-000001)"
                value={trackInputId}
                onChange={(e) => setTrackInputId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl"
            >
              Track Problem
            </button>
          </form>

          {trackedChallenge ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-blue-400">{trackedChallenge.id}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      {trackedChallenge.category}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">{trackedChallenge.title}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Location: {trackedChallenge.village}, {trackedChallenge.mandal}, {trackedChallenge.district}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Current Status:</div>
                  <div className="text-sm font-bold text-emerald-400">{trackedChallenge.status}</div>
                </div>
              </div>

              {/* Visual Step Timeline */}
              <div className="py-8">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
                  Resolution Progress & Milestone Tracking
                </div>

                <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
                  {allStages.map((stage, idx) => {
                    const currentIdx = getStageIndex(trackedChallenge.status);
                    const isCompleted = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={stage.key} className="relative flex items-start gap-4">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                          isCompleted
                            ? 'bg-blue-600 text-white ring-4 ring-slate-950'
                            : 'bg-slate-800 text-slate-500 ring-4 ring-slate-950'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-3.5 h-3.5" />}
                        </div>

                        <div className="flex-1 pt-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${isCurrent ? 'text-blue-400' : isCompleted ? 'text-white' : 'text-slate-500'}`}>
                              {stage.label}
                            </span>
                            {isCurrent && (
                              <span className="bg-blue-500/20 text-blue-300 text-[10px] font-semibold px-1.5 py-0.2 rounded animate-pulse">
                                Active Stage
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{stage.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => onSelectChallenge(trackedChallenge)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>Open Full Dossier</span>
                </button>
              </div>
            </div>
          ) : (
            trackInputId && (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                No challenge found matching "{trackInputId}". Please verify the Challenge ID.
              </div>
            )
          )}
        </div>
      )}

      {/* REPORT CIVIC PROBLEM MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">Report a Civic Problem</h2>
                  <span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-2 py-0.5 rounded">
                    Multimodal
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  AI will categorize, detect duplicates, and route to the local Panchayat or research University.
                </p>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
              {submissionSuccess ? (
                <div className="text-center py-8 space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/10">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-extrabold text-white">Problem Successfully Submitted!</h3>
                    <p className="text-sm text-slate-300 mt-1">
                      Assigned Unique ID:{' '}
                      <span className="font-mono text-blue-400 font-bold text-base">
                        {submissionSuccess.id}
                      </span>
                    </p>
                  </div>

                  {/* AI Analysis Dossier Card */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-left max-w-xl mx-auto space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                        AI Categorization & Priority
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        submissionSuccess.priority === 'Critical' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {submissionSuccess.priority} Priority
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-white">
                      {submissionSuccess.aiAnalysis?.subcategory || submissionSuccess.category}
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-xs font-bold text-blue-400 mb-1 flex items-center gap-1.5">
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>AI Routing Decision: {submissionSuccess.assignedTo?.type}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {submissionSuccess.aiAnalysis?.routingReason}
                      </p>
                      <div className="text-[11px] text-slate-400 mt-2">
                        Assigned To:{' '}
                        <span className="font-semibold text-white">
                          {submissionSuccess.assignedTo?.name || 'Local Authority'}
                        </span>
                      </div>
                    </div>

                    {/* Duplicate Status */}
                    {submissionSuccess.duplicateInfo && (
                      <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-900">
                        <span>Duplicate Check Classification:</span>
                        <span className="font-semibold text-emerald-400">
                          {submissionSuccess.duplicateInfo.classification} ({submissionSuccess.duplicateInfo.similarityScore}% overlap)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center gap-3 pt-4">
                    <button
                      onClick={() => {
                        onSelectChallenge(submissionSuccess);
                        setIsReportModalOpen(false);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                    >
                      Track Challenge Progress
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                    >
                      Report Another Problem
                    </button>
                  </div>
                </div>
              ) : (
                <form id="form-report-problem" onSubmit={handleSubmitProblem} className="space-y-6">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      1. Select Category *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {['Water', 'Waste Management', 'Roads & Infrastructure'].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`p-3 rounded-xl border text-xs font-semibold transition-all text-center ${
                            category === cat
                              ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      2. Problem Title *
                    </label>
                    <input
                      id="input-problem-title"
                      type="text"
                      required
                      placeholder="e.g. Broken handpump producing yellow contaminated water near Middle School"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        3. Detailed Description *
                      </label>
                      <span className="text-[11px] text-slate-500">Provide details on affected people and location</span>
                    </div>
                    <textarea
                      id="input-problem-desc"
                      rows={4}
                      required
                      placeholder="Describe the issue: when did it start, how many households are affected, any children sick, or emergency access blocked..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>

                  {/* LIVE AI DUPLICATE CHECK & PREVIEW BUTTONS */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>AI Duplicate Detection & Analysis Preview</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleRunDuplicateCheck}
                        disabled={isCheckingDuplicate || !title}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium flex items-center gap-1 disabled:opacity-50"
                      >
                        {isCheckingDuplicate ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                        <span>Check Duplicate Database</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRunAiPreview}
                        disabled={isAnalyzingAi || !title}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/30 border border-indigo-500/40 hover:bg-indigo-600/50 text-xs text-indigo-300 font-medium flex items-center gap-1 disabled:opacity-50"
                      >
                        {isAnalyzingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <GitBranch className="w-3.5 h-3.5" />}
                        <span>Preview Routing</span>
                      </button>
                    </div>
                  </div>

                  {/* DUPLICATE DETECTION RESULT CARD */}
                  {duplicateResult && (
                    <div className={`p-4 rounded-xl border ${
                      duplicateResult.classification === 'Duplicate'
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                        : duplicateResult.classification === 'Highly Similar'
                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                        : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Duplicate Status: {duplicateResult.classification} ({duplicateResult.similarityScore}% Similarity)</span>
                        </div>
                        {duplicateResult.matchedChallengeId && (
                          <span className="font-mono text-xs font-semibold bg-black/40 px-2 py-0.5 rounded">
                            Matched: {duplicateResult.matchedChallengeId}
                          </span>
                        )}
                      </div>

                      <p className="text-xs leading-relaxed text-slate-200">
                        {duplicateResult.reasoning}
                      </p>

                      {duplicateResult.matchedChallengeTitle && (
                        <div className="mt-2 text-xs text-slate-300 bg-slate-900/60 p-2 rounded">
                          <span className="font-semibold text-white">Existing Problem:</span> "{duplicateResult.matchedChallengeTitle}" ({duplicateResult.matchedChallengeLocation})
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI PREVIEW RESULT CARD */}
                  {aiPreview && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-400 uppercase">
                          AI Predicted Priority: {aiPreview.priority}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Est. Citizens Affected: ~{aiPreview.citizensAffectedEstimate}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300">
                        <span className="font-semibold text-blue-400">Routing Target: {aiPreview.routingTarget}</span> ({aiPreview.routingConfidence}% confidence)
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {aiPreview.routingReason}
                      </p>
                    </div>
                  )}

                  {/* MULTIMODAL UPLOADS: Photo, Video, Voice Recording */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      4. Multimodal Attachments (Photo, Video, Voice)
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Photo Upload */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-2">
                          <Camera className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-semibold text-white">Attach Photo</div>
                        <p className="text-[11px] text-slate-500 mb-2">JPG, PNG up to 10MB</p>
                        <button
                          type="button"
                          onClick={() => setMediaImage('https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80')}
                          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                        >
                          {mediaImage ? 'Photo Attached ✓' : '+ Sample Photo'}
                        </button>
                      </div>

                      {/* Video Upload */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-2">
                          <Video className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-semibold text-white">Attach Video</div>
                        <p className="text-[11px] text-slate-500 mb-2">MP4 short clip</p>
                        <button
                          type="button"
                          onClick={() => setMediaVideo('https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4')}
                          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                        >
                          {mediaVideo ? 'Video Attached ✓' : '+ Sample Video'}
                        </button>
                      </div>

                      {/* Voice Recording with MediaRecorder */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                          isRecordingAudio ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          <Mic className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-semibold text-white">
                          {isRecordingAudio ? `Recording (${recordingSeconds}s)...` : 'Voice Complaint'}
                        </div>
                        <p className="text-[11px] text-slate-500 mb-2">Speak in Hindi/Santhali</p>
                        {isRecordingAudio ? (
                          <button
                            type="button"
                            onClick={stopRecording}
                            className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
                          >
                            Stop & Transcribe
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={startRecording}
                            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                          >
                            {audioBlobUrl ? 'Audio Recorded ✓' : 'Record Audio'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Location Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">District *</label>
                      <select
                        id="select-district"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        {districts.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Mandal / Block *</label>
                      <input
                        type="text"
                        value={mandal}
                        onChange={(e) => setMandal(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Village / Tola *</label>
                      <input
                        type="text"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Exact Landmark / Street Address</label>
                    <input
                      type="text"
                      value={exactLocation}
                      onChange={(e) => setExactLocation(e.target.value)}
                      placeholder="e.g. Near Anganwadi Centre, Ward 4"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Language Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi (हिंदी)</option>
                        <option value="Santhali">Santhali (संताली)</option>
                        <option value="Nagpuri">Nagpuri (नागपुरी)</option>
                        <option value="Bengali">Bengali (বাংলা)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Your Name</label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Mobile Number</label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Submit Actions */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>

                    <button
                      id="btn-submit-problem-final"
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>AI Categorizing & Routing...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Civic Problem</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
