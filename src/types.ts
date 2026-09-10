export type UserRole = 'citizen' | 'university' | 'industry' | 'government';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  state?: string;
  district?: string;
  mandal?: string;
  village?: string;
  organization?: string;
  department?: string;
  preferredLanguage?: string;
  verified?: boolean;
  avatarUrl?: string;
}

export type ChallengeCategory = 'Water' | 'Waste Management' | 'Roads & Infrastructure' | 'Education' | 'Healthcare' | 'Agriculture' | 'Environment' | 'Energy';

export type ChallengePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type ChallengeStatus = 
  | 'Submitted'
  | 'AI Analyzed'
  | 'Routed'
  | 'Panchayat Received'
  | 'Panchayat In Progress'
  | 'Panchayat Resolved'
  | 'Panchayat Escalated'
  | 'University Matching'
  | 'University Accepted'
  | 'Team Formed'
  | 'Solution Proposed'
  | 'Industry Review'
  | 'Industry Collaborating'
  | 'Prototype Development'
  | 'Testing'
  | 'Ready for Deployment'
  | 'Implemented'
  | 'Resolved';

export type RoutingTarget = 'Panchayat' | 'University';

export interface LocationData {
  state: string;
  district: string;
  mandal: string;
  village: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface AIAnalysisResult {
  primaryCategory: ChallengeCategory;
  secondaryCategory?: string;
  subcategory: string;
  keywords: string[];
  priority: ChallengePriority;
  priorityReason: string;
  citizensAffectedEstimate: number;
  safetyRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  routingTarget: RoutingTarget;
  routingConfidence: number; // 0-100
  routingReason: string;
  suggestedAction: string;
  timestamp: string;
  modelUsed: string; // 'gemini-3.8-flash' or 'CivicSolve-AI-Engine-v2.6'
  isFallback: boolean;
}

export interface DuplicateDetectionResult {
  similarityScore: number; // 0-100
  classification: 'Duplicate' | 'Highly Similar' | 'Related' | 'New Problem';
  matchedChallengeId?: string;
  matchedChallengeTitle?: string;
  matchedChallengeLocation?: string;
  matchedChallengeStatus?: string;
  reasoning: string;
  semanticOverlapAreas: string[];
}

export interface Challenge {
  id: string; // e.g. CH-JH-2026-000001
  title: string;
  description: string;
  category: ChallengeCategory;
  subcategory: string;
  state: string;
  district: string;
  mandal: string;
  village: string;
  location: string;
  latitude: number;
  longitude: number;
  priority: ChallengePriority;
  status: ChallengeStatus;
  submittedBy: {
    name: string;
    mobile?: string;
    email?: string;
    userId: string;
  };
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    type: 'Panchayat' | 'University';
    id: string;
    name: string;
  };
  escalatedFromPanchayat?: boolean;
  escalationReason?: string;
  escalationDate?: string;
  media?: {
    images?: string[];
    videoUrl?: string;
    audioUrl?: string;
    audioTranscript?: string;
  };
  preferredLanguage?: string;
  aiAnalysis?: AIAnalysisResult;
  duplicateInfo?: DuplicateDetectionResult;
  projectId?: string; // Connected research/prototype project if routed to University
  resolvedAt?: string;
  impactMetrics?: {
    citizensBenefited: number;
    villagesBenefited: number;
    costEstimate: number;
    actualCost?: number;
    impactScore: number; // 0-100
    impactSummary: string;
    waterSavedLpd?: number;
    wasteReducedKgDay?: number;
  };
}

export interface University {
  id: string;
  name: string;
  shortName: string;
  state: string;
  district: string;
  departments: string[];
  facultyExpertise: string[];
  researchAreas: string[];
  laboratories: string[];
  innovationFacilities: string[];
  incubationFacilities: string[];
  studentTeamsCount: number;
  activeProjectsCount: number;
  completedProjectsCount: number;
  contactEmail: string;
  contactPerson: string;
}

export interface Panchayat {
  id: string;
  panchayatName: string;
  village: string;
  mandal: string;
  district: string;
  state: string;
  servicesHandled: string[];
  availableResources: string[];
  contact: {
    mukhiyaName: string;
    phone: string;
    email: string;
  };
  resolvedCount: number;
  activeCount: number;
  escalatedCount: number;
}

export interface Industry {
  id: string;
  name: string;
  industryType: string;
  expertise: string[];
  availableInfrastructure: string[];
  supportTypes: string[];
  fundingCapacity: string;
  prototypeCapabilities: string[];
  contactPerson: string;
  contactEmail: string;
  activeCollaborationsCount: number;
  totalContributionInr: number;
}

export interface Student {
  id: string;
  name: string;
  universityId: string;
  universityName: string;
  department: string;
  year: string;
  role: 'Team Lead' | 'Researcher' | 'AI/ML Developer' | 'Backend Developer' | 'Frontend Developer' | 'Hardware Engineer' | 'UI/UX Designer' | 'Testing/QA';
  skills: string[];
  avatarUrl?: string;
}

export interface Faculty {
  id: string;
  name: string;
  designation: string;
  universityId: string;
  universityName: string;
  department: string;
  specialization: string[];
  projectsMentored: number;
  email: string;
  avatarUrl?: string;
}

export interface SolutionProposal {
  id: string;
  challengeId: string;
  universityId: string;
  proposedSolution: string;
  problemAnalysis: string;
  technologyRequired: string[];
  requiredResources: string[];
  estimatedCost: number; // in INR
  expectedTimelineWeeks: number;
  expectedImpact: string;
  prototypeRequirement: string;
  facultyMentorId: string;
  facultyMentorName: string;
  studentTeamIds: string[];
  studentTeamNames: string[];
  technicalRequirements: string;
  submittedAt: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Industry Matched' | 'Funded' | 'In Development';
}

export interface IndustrySupport {
  id: string;
  projectId: string;
  industryId: string;
  industryName: string;
  supportTypes: string[];
  resourcesProvided: string;
  committedFundingInr: number;
  technicalMentorAssigned: string;
  prototypeStatus: 'Planning' | 'CAD/Design' | 'Component Sourcing' | 'Assembly' | 'Testing' | 'Ready for Field Pilot';
  testingStatus: 'Pending' | 'Lab Validation' | 'Field Trial' | 'Certified Safe' | 'Ready for Deployment';
  governmentCompensationInr: number;
  compensationStatus: 'Pending Review' | 'Verified' | 'Approved' | 'Disbursed';
  updatedAt: string;
}

export interface Project {
  id: string; // PRJ-JH-2026-001
  challengeId: string;
  challengeTitle: string;
  category: ChallengeCategory;
  district: string;
  universityId: string;
  universityName: string;
  status: ChallengeStatus;
  proposal: SolutionProposal;
  industrySupport?: IndustrySupport;
  createdAt: string;
  updatedAt: string;
  milestones: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    completed: boolean;
    completedAt?: string;
  }[];
  impactReport?: {
    citizensBenefited: number;
    villagesBenefited: number;
    estimatedCost: number;
    actualCost: number;
    beforeDescription: string;
    afterDescription: string;
    socialImpact: string;
    environmentalImpact: string;
    waterSavedLpd?: number;
    wasteReducedKgDay?: number;
    impactScore: number;
  };
}

export interface AppNotification {
  id: string;
  recipientRole: UserRole | 'all';
  recipientId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  challengeId?: string;
  projectId?: string;
  read: boolean;
  createdAt: string;
}

export interface PlatformStats {
  totalProblems: number;
  newProblems: number;
  inProgress: number;
  problemsResolved: number;
  panchayatResolutions: number;
  universityProjects: number;
  industryCollaborations: number;
  citizensBenefited: number;
  totalInvestmentInr: number;
  averageResolutionDays: number;
  platformImpactScore: number;
}
