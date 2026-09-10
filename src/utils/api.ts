import {
  Challenge,
  Project,
  University,
  Panchayat,
  Industry,
  Student,
  Faculty,
  AppNotification,
  PlatformStats,
  AIAnalysisResult,
  DuplicateDetectionResult,
  User
} from '../types';

export async function fetchHealth() {
  const res = await fetch('/api/health');
  return res.json();
}

export async function loginUser(credentials: { email?: string; password?: string; role?: string; isDemo?: boolean }) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return res.json() as Promise<{ user: User; token: string }>;
}

export async function registerUser(userData: Partial<User>) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return res.json() as Promise<{ user: User; token: string }>;
}

export async function fetchChallenges(filters?: {
  category?: string;
  priority?: string;
  status?: string;
  district?: string;
  routing?: string;
  search?: string;
}) {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
  }
  const res = await fetch(`/api/challenges?${params.toString()}`);
  return res.json() as Promise<Challenge[]>;
}

export async function fetchChallengeById(id: string) {
  const res = await fetch(`/api/challenges/${id}`);
  if (!res.ok) throw new Error('Challenge not found');
  return res.json() as Promise<Challenge>;
}

export async function submitChallenge(data: Partial<Challenge>) {
  const res = await fetch('/api/challenges', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to submit challenge');
  return res.json() as Promise<Challenge>;
}

export async function checkAiAnalysis(data: {
  title: string;
  description: string;
  categoryHint?: string;
  village?: string;
  mandal?: string;
  district?: string;
}) {
  const res = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json() as Promise<AIAnalysisResult>;
}

export async function checkDuplicateProblems(data: {
  title: string;
  description: string;
  category?: string;
  district?: string;
}) {
  const res = await fetch('/api/ai/duplicate-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json() as Promise<DuplicateDetectionResult>;
}

export async function matchUniversities(challenge: Challenge) {
  const res = await fetch('/api/universities/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(challenge)
  });
  return res.json() as Promise<Array<{
    university: University;
    matchScore: number;
    matchingExpertise: string[];
    reason: string;
  }>>;
}

export async function fetchUniversities() {
  const res = await fetch('/api/universities');
  return res.json() as Promise<University[]>;
}

export async function fetchPanchayats() {
  const res = await fetch('/api/panchayats');
  return res.json() as Promise<Panchayat[]>;
}

export async function fetchIndustries() {
  const res = await fetch('/api/industries');
  return res.json() as Promise<Industry[]>;
}

export async function fetchStudents(universityId?: string) {
  const url = universityId ? `/api/students?universityId=${universityId}` : '/api/students';
  const res = await fetch(url);
  return res.json() as Promise<Student[]>;
}

export async function fetchFaculty(universityId?: string) {
  const url = universityId ? `/api/faculty?universityId=${universityId}` : '/api/faculty';
  const res = await fetch(url);
  return res.json() as Promise<Faculty[]>;
}

export async function fetchProjects() {
  const res = await fetch('/api/projects');
  return res.json() as Promise<Project[]>;
}

export async function fetchProjectById(id: string) {
  const res = await fetch(`/api/projects/${id}`);
  return res.json() as Promise<Project>;
}

export async function submitSolutionProposal(data: {
  challengeId: string;
  universityId: string;
  proposal: {
    proposedSolution: string;
    problemAnalysis: string;
    technologyRequired: string[];
    requiredResources: string[];
    estimatedCost: number;
    expectedTimelineWeeks: number;
    expectedImpact: string;
    prototypeRequirement: string;
    facultyMentorId: string;
    facultyMentorName: string;
    studentTeamIds: string[];
    studentTeamNames: string[];
    technicalRequirements: string;
  };
}) {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json() as Promise<Project>;
}

export async function updateProjectStatus(id: string, data: { status: string; completedMilestoneId?: string }) {
  const res = await fetch(`/api/projects/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json() as Promise<Project>;
}

export async function offerIndustrySupport(data: {
  projectId: string;
  industryId: string;
  supportTypes: string[];
  resourcesProvided: string;
  committedFundingInr: number;
  technicalMentorAssigned: string;
}) {
  const res = await fetch('/api/industry/support', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json() as Promise<Project>;
}

export async function panchayatAcceptChallenge(challengeId: string, panchayatId?: string) {
  const res = await fetch('/api/panchayat/accept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challengeId, panchayatId })
  });
  return res.json() as Promise<Challenge>;
}

export async function panchayatResolveChallenge(challengeId: string, notes?: string, costIncurred?: number) {
  const res = await fetch('/api/panchayat/resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challengeId, notes, costIncurred })
  });
  return res.json() as Promise<Challenge>;
}

export async function panchayatEscalateChallenge(challengeId: string, escalationReason: string, selectedUniversityId?: string) {
  const res = await fetch('/api/panchayat/escalate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challengeId, escalationReason, selectedUniversityId })
  });
  return res.json() as Promise<{ success: boolean; challenge: Challenge; escalatedTo: University }>;
}

export async function approveCompensation(projectId: string, approvedAmountInr?: number) {
  const res = await fetch('/api/government/approve-compensation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, approvedAmountInr })
  });
  return res.json() as Promise<Project>;
}

export async function fetchNotifications(role?: string) {
  const url = role ? `/api/notifications?role=${role}` : '/api/notifications';
  const res = await fetch(url);
  return res.json() as Promise<AppNotification[]>;
}

export async function markNotificationAsRead(id: string) {
  const res = await fetch('/api/notifications/mark-read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  return res.json();
}

export async function fetchPlatformStats() {
  const res = await fetch('/api/stats');
  return res.json() as Promise<PlatformStats>;
}

export const fetchStats = fetchPlatformStats;

export async function fetchAnalytics() {
  const res = await fetch('/api/analytics');
  return res.json();
}
