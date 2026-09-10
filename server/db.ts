import fs from 'fs';
import path from 'path';
import {
  Challenge,
  University,
  Panchayat,
  Industry,
  Student,
  Faculty,
  Project,
  AppNotification,
  PlatformStats
} from '../src/types.js';

const dataDir = path.resolve(process.cwd(), 'data');

// In-memory collections backed by JSON files
let challenges: Challenge[] = [];
let universities: University[] = [];
let panchayats: Panchayat[] = [];
let industries: Industry[] = [];
let students: Student[] = [];
let faculty: Faculty[] = [];
let projects: Project[] = [];
let notifications: AppNotification[] = [];

// Safe JSON file loader
function loadJson<T>(filename: string, fallback: T): T {
  try {
    const filePath = path.join(dataDir, filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.error(`Error loading ${filename}:`, err);
  }
  return fallback;
}

// Safe JSON file writer
function saveJson(filename: string, data: unknown) {
  try {
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error saving ${filename}:`, err);
  }
}

export function initDatabase() {
  challenges = loadJson<Challenge[]>('challenges.json', []);
  universities = loadJson<University[]>('universities.json', []);
  panchayats = loadJson<Panchayat[]>('panchayats.json', []);
  industries = loadJson<Industry[]>('industries.json', []);
  students = loadJson<Student[]>('students.json', []);
  faculty = loadJson<Faculty[]>('faculty.json', []);
  projects = loadJson<Project[]>('projects.json', []);

  // Initial seed notifications if empty
  if (notifications.length === 0) {
    notifications = [
      {
        id: 'NOTIF-001',
        recipientRole: 'all',
        title: 'Platform Online',
        message: 'CivicSolve SIH26043 demo platform initialized with 150+ synthetic challenges across Jharkhand.',
        type: 'info',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'NOTIF-002',
        recipientRole: 'university',
        title: 'New High-Priority Challenge Routed',
        message: 'CH-JH-2026-000001 (Drinking Water Crisis in Ormanjhi) has been assigned to BIT Mesra for research solution.',
        type: 'warning',
        challengeId: 'CH-JH-2026-000001',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: 'NOTIF-003',
        recipientRole: 'industry',
        title: 'Collaboration Proposal Submitted',
        message: 'BIT Mesra submitted proposal for Solar Nanofiltration Kiosk; TSRDS review requested.',
        type: 'info',
        projectId: 'PRJ-JH-2026-001',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'NOTIF-004',
        recipientRole: 'government',
        title: 'Panchayat Escalation Alert',
        message: 'Ormanjhi Panchayat escalated industrial effluent issue to BIT Mesra due to lack of local chemical treatment.',
        type: 'alert',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];
  }

  console.log(`[DB] Initialized: ${challenges.length} challenges, ${universities.length} universities, ${panchayats.length} panchayats, ${industries.length} industries, ${projects.length} projects.`);
}

export function getChallenges(filters?: {
  category?: string;
  priority?: string;
  status?: string;
  district?: string;
  routing?: string;
  search?: string;
}) {
  let result = [...challenges];

  if (!filters) return result;

  if (filters.category && filters.category !== 'All') {
    result = result.filter(c => c.category === filters.category);
  }
  if (filters.priority && filters.priority !== 'All') {
    result = result.filter(c => c.priority === filters.priority);
  }
  if (filters.status && filters.status !== 'All') {
    result = result.filter(c => c.status === filters.status);
  }
  if (filters.district && filters.district !== 'All') {
    result = result.filter(c => c.district.toLowerCase() === filters.district!.toLowerCase());
  }
  if (filters.routing && filters.routing !== 'All') {
    result = result.filter(c => c.assignedTo?.type === filters.routing);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(c => 
      c.id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.mandal.toLowerCase().includes(q) ||
      c.village.toLowerCase().includes(q)
    );
  }

  return result;
}

export function getChallengeById(id: string) {
  return challenges.find(c => c.id === id);
}

export function addChallenge(challenge: Challenge): Challenge {
  challenges.unshift(challenge);
  saveJson('challenges.json', challenges);

  // Auto-generate notification
  addNotification({
    id: `NOTIF-${Date.now()}`,
    recipientRole: 'all',
    title: `New Challenge: ${challenge.id}`,
    message: `${challenge.title.substring(0, 70)}... reported in ${challenge.mandal}, ${challenge.district}.`,
    type: challenge.priority === 'Critical' ? 'alert' : 'info',
    challengeId: challenge.id,
    read: false,
    createdAt: new Date().toISOString()
  });

  return challenge;
}

export function updateChallenge(id: string, updates: Partial<Challenge>): Challenge | null {
  const index = challenges.findIndex(c => c.id === id);
  if (index === -1) return null;

  challenges[index] = {
    ...challenges[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  saveJson('challenges.json', challenges);
  return challenges[index];
}

export function getUniversities() {
  return universities;
}

export function getUniversityById(id: string) {
  return universities.find(u => u.id === id);
}

export function getPanchayats() {
  return panchayats;
}

export function getIndustries() {
  return industries;
}

export function getIndustryById(id: string) {
  return industries.find(i => i.id === id);
}

export function getStudents(universityId?: string) {
  if (universityId) {
    return students.filter(s => s.universityId === universityId);
  }
  return students;
}

export function getFaculty(universityId?: string) {
  if (universityId) {
    return faculty.filter(f => f.universityId === universityId);
  }
  return faculty;
}

export function getProjects() {
  return projects;
}

export function getProjectById(id: string) {
  return projects.find(p => p.id === id);
}

export function addProject(project: Project): Project {
  projects.unshift(project);
  saveJson('projects.json', projects);

  // Update associated challenge status & projectId
  updateChallenge(project.challengeId, {
    status: 'Solution Proposed',
    projectId: project.id
  });

  addNotification({
    id: `NOTIF-${Date.now()}`,
    recipientRole: 'industry',
    title: `New Solution Proposal: ${project.id}`,
    message: `${project.universityName} proposed a solution for "${project.challengeTitle}". Industry collaboration invited!`,
    type: 'success',
    projectId: project.id,
    read: false,
    createdAt: new Date().toISOString()
  });

  return project;
}

export function updateProject(id: string, updates: Partial<Project>): Project | null {
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return null;

  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  saveJson('projects.json', projects);
  return projects[index];
}

export function getNotifications(role?: string) {
  if (!role || role === 'all') return notifications;
  return notifications.filter(n => n.recipientRole === 'all' || n.recipientRole === role);
}

export function addNotification(notification: AppNotification) {
  notifications.unshift(notification);
  // Keep last 100
  if (notifications.length > 100) {
    notifications = notifications.slice(0, 100);
  }
}

export function markNotificationRead(id: string) {
  const notif = notifications.find(n => n.id === id);
  if (notif) notif.read = true;
}

export function getPlatformStats(): PlatformStats {
  const total = challenges.length;
  const newProblems = challenges.filter(c => c.status === 'Submitted' || c.status === 'AI Analyzed').length;
  const resolved = challenges.filter(c => c.status === 'Resolved' || c.status === 'Panchayat Resolved').length;
  const inProgress = challenges.filter(c => 
    c.status === 'Panchayat In Progress' || 
    c.status === 'University Accepted' || 
    c.status === 'Solution Proposed' || 
    c.status === 'Industry Collaborating' || 
    c.status === 'Prototype Development' || 
    c.status === 'Testing'
  ).length;

  const panchayatResolutions = challenges.filter(c => c.status === 'Panchayat Resolved').length;
  const universityProjects = projects.length;
  const industryCollaborations = projects.filter(p => p.industrySupport !== undefined).length;

  // Citizens benefited calculation
  const directBenefited = challenges.reduce((acc, c) => {
    if (c.impactMetrics?.citizensBenefited) {
      return acc + c.impactMetrics.citizensBenefited;
    }
    return acc;
  }, 0);

  // Total investment
  const totalInvestment = projects.reduce((acc, p) => {
    const funding = p.industrySupport?.committedFundingInr || 0;
    const est = p.proposal.estimatedCost || 0;
    return acc + Math.max(funding, est);
  }, 1450000);

  return {
    totalProblems: total,
    newProblems,
    inProgress,
    problemsResolved: resolved,
    panchayatResolutions,
    universityProjects,
    industryCollaborations,
    citizensBenefited: directBenefited + 24500, // Seed total
    totalInvestmentInr: totalInvestment + 3500000,
    averageResolutionDays: 18,
    platformImpactScore: 89
  };
}
