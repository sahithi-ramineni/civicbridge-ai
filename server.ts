import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  initDatabase,
  getChallenges,
  getChallengeById,
  addChallenge,
  updateChallenge,
  getUniversities,
  getUniversityById,
  getPanchayats,
  getIndustries,
  getIndustryById,
  getStudents,
  getFaculty,
  getProjects,
  getProjectById,
  addProject,
  updateProject,
  getNotifications,
  markNotificationRead,
  getPlatformStats,
  addNotification
} from './server/db.js';
import {
  analyzeCivicProblem,
  detectDuplicateProblems,
  matchUniversitiesForChallenge
} from './server/ai.js';
import { Challenge, Project } from './src/types.js';

dotenv.config();

// Initialize data layer
initDatabase();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // 1. Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'CivicSolve AI Platform (SIH26043)',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      aiMode: process.env.GEMINI_API_KEY ? 'Gemini 3.8 Flash (Live)' : 'CivicSolve AI Engine (Deterministic Fallback)'
    });
  });

  // 2. Authentication & Demo Logins
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password, role, isDemo } = req.body;

    // Demo Logins with pre-configured verified profiles
    if (isDemo || !email) {
      if (role === 'citizen') {
        return res.json({
          user: {
            id: 'USR-CITIZEN-01',
            name: 'Sunita Devi',
            email: 'sunita.devi@jharkhand.in',
            mobile: '+91 94311 82910',
            role: 'citizen',
            state: 'Jharkhand',
            district: 'Ranchi',
            mandal: 'Ormanjhi',
            village: 'Ormanjhi Tola 1',
            preferredLanguage: 'Hindi',
            verified: true,
            avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=60'
          },
          token: 'demo-token-citizen'
        });
      }
      if (role === 'university') {
        return res.json({
          user: {
            id: 'USR-UNIV-01',
            name: 'Prof. (Dr.) A. K. Sharma',
            email: 'aksharma@bitmesra.ac.in',
            mobile: '+91 94313 11849',
            role: 'university',
            organization: 'Birla Institute of Technology, Mesra',
            department: 'Civil & Environmental Engineering',
            state: 'Jharkhand',
            district: 'Ranchi',
            verified: true,
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=60'
          },
          token: 'demo-token-university'
        });
      }
      if (role === 'industry') {
        return res.json({
          user: {
            id: 'USR-IND-01',
            name: 'Er. Vikram Sengupta',
            email: 'vikram.sengupta@tatasteel.com',
            mobile: '+91 94319 88301',
            role: 'industry',
            organization: 'Tata Steel Rural Development Society (TSRDS)',
            department: 'Rural Technology & Prototyping Division',
            state: 'Jharkhand',
            district: 'East Singhbhum',
            verified: true,
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=60'
          },
          token: 'demo-token-industry'
        });
      }
      // Default to Government
      return res.json({
        user: {
          id: 'USR-GOV-01',
          name: 'Shri R. K. Choudhary, IAS',
          email: 'dm.ranchi@jharkhand.gov.in',
          mobile: '+91 94317 62819',
          role: 'government',
          organization: 'Government of Jharkhand — Urban & Rural Development',
          department: 'Panchayati Raj & State Innovation Cell',
          state: 'Jharkhand',
          district: 'Statewide',
          verified: true,
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=60'
        },
        token: 'demo-token-government'
      });
    }

    // Standard credential login
    const detectedRole = role || 'citizen';
    return res.json({
      user: {
        id: `USR-${Date.now()}`,
        name: email.split('@')[0],
        email,
        mobile: '+91 98351 00000',
        role: detectedRole,
        state: 'Jharkhand',
        district: 'Ranchi',
        verified: true
      },
      token: `token-${Date.now()}`
    });
  });

  // 3. User Registration
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, mobile, role, state, district, mandal, village, organization, department, preferredLanguage } = req.body;
    const newUser = {
      id: `USR-${Date.now()}`,
      name: name || 'Citizen User',
      email: email || 'citizen@jharkhand.in',
      mobile: mobile || '+91 94310 00000',
      role: role || 'citizen',
      state: state || 'Jharkhand',
      district: district || 'Ranchi',
      mandal: mandal || 'Ormanjhi',
      village: village || 'Ormanjhi',
      organization,
      department,
      preferredLanguage: preferredLanguage || 'Hindi',
      verified: role === 'citizen'
    };
    return res.status(201).json({ user: newUser, token: `token-${Date.now()}` });
  });

  // 4. Challenges List & Filtering
  app.get('/api/challenges', (req: Request, res: Response) => {
    const { category, priority, status, district, routing, search } = req.query;
    const list = getChallenges({
      category: category as string,
      priority: priority as string,
      status: status as string,
      district: district as string,
      routing: routing as string,
      search: search as string
    });
    res.json(list);
  });

  // 5. Single Challenge Detail
  app.get('/api/challenges/:id', (req: Request, res: Response) => {
    const challenge = getChallengeById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    res.json(challenge);
  });

  // 6. Citizen Submits New Challenge (Unified Pipeline: AI Analysis + Duplicate Check + Routing)
  app.post('/api/challenges', async (req: Request, res: Response) => {
    try {
      const {
        title,
        description,
        category,
        state = 'Jharkhand',
        district = 'Ranchi',
        mandal = 'Ormanjhi',
        village = 'Ormanjhi',
        location,
        latitude = 23.3441,
        longitude = 85.3096,
        submittedBy,
        media,
        preferredLanguage = 'English'
      } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required.' });
      }

      // Step 1: AI Analysis
      const aiAnalysis = await analyzeCivicProblem({
        title,
        description,
        categoryHint: category,
        village,
        mandal,
        district
      });

      // Step 2: Semantic Duplicate Check against all existing challenges
      const duplicateInfo = detectDuplicateProblems({
        title,
        description,
        category: aiAnalysis.primaryCategory,
        district
      });

      // Generate sequential ID
      const all = getChallenges();
      const nextNum = all.length + 1;
      const challengeId = `CH-JH-2026-${nextNum.toString().padStart(6, '0')}`;

      // Routing target assignment
      let assignedTo: Challenge['assignedTo'];
      if (aiAnalysis.routingTarget === 'University') {
        const univMatches = matchUniversitiesForChallenge({
          id: challengeId,
          title,
          description,
          category: aiAnalysis.primaryCategory,
          subcategory: aiAnalysis.subcategory,
          state,
          district,
          mandal,
          village,
          location: location || `${village}, ${mandal}, ${district}`,
          latitude,
          longitude,
          priority: aiAnalysis.priority,
          status: 'Routed',
          submittedBy: submittedBy || { name: 'Citizen', userId: 'USR-ANON' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        const topUniv = univMatches[0]?.university;
        assignedTo = topUniv ? { type: 'University', id: topUniv.id, name: topUniv.name } : undefined;
      } else {
        // Panchayat assignment
        const panchayats = getPanchayats();
        const matchedPanchayat = panchayats.find(p => p.district.toLowerCase() === district.toLowerCase()) || panchayats[0];
        assignedTo = { type: 'Panchayat', id: matchedPanchayat.id, name: matchedPanchayat.panchayatName };
      }

      const newChallenge: Challenge = {
        id: challengeId,
        title,
        description,
        category: aiAnalysis.primaryCategory,
        subcategory: aiAnalysis.subcategory,
        state,
        district,
        mandal,
        village,
        location: location || `${village}, ${mandal}, ${district}, Jharkhand`,
        latitude: Number(latitude) || 23.3441,
        longitude: Number(longitude) || 85.3096,
        priority: aiAnalysis.priority,
        status: 'AI Analyzed',
        submittedBy: submittedBy || {
          name: 'Sunita Devi',
          mobile: '+91 94311 82910',
          email: 'sunita.devi@jharkhand.in',
          userId: 'USR-CITIZEN-01'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignedTo,
        media,
        preferredLanguage,
        aiAnalysis,
        duplicateInfo
      };

      const saved = addChallenge(newChallenge);
      res.status(201).json(saved);
    } catch (err) {
      console.error('Error creating challenge:', err);
      res.status(500).json({ error: 'Internal server error while processing problem' });
    }
  });

  // 7. On-demand AI Analysis preview
  app.post('/api/ai/analyze', async (req: Request, res: Response) => {
    try {
      const { title, description, categoryHint, village, mandal, district } = req.body;
      const result = await analyzeCivicProblem({
        title,
        description,
        categoryHint,
        village,
        mandal,
        district
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'AI analysis failed' });
    }
  });

  // 8. On-demand Duplicate Check preview
  app.post('/api/ai/duplicate-check', (req: Request, res: Response) => {
    const { title, description, category, district } = req.body;
    const result = detectDuplicateProblems({
      title: title || '',
      description: description || '',
      category,
      district
    });
    res.json(result);
  });

  // 9. University Matching for a challenge
  app.post('/api/universities/match', (req: Request, res: Response) => {
    const challenge = req.body as Challenge;
    if (!challenge || !challenge.title) {
      return res.status(400).json({ error: 'Valid challenge object required' });
    }
    const matches = matchUniversitiesForChallenge(challenge);
    res.json(matches);
  });

  // 10. Master Data Endpoints
  app.get('/api/universities', (req: Request, res: Response) => {
    res.json(getUniversities());
  });

  app.get('/api/panchayats', (req: Request, res: Response) => {
    res.json(getPanchayats());
  });

  app.get('/api/industries', (req: Request, res: Response) => {
    res.json(getIndustries());
  });

  app.get('/api/students', (req: Request, res: Response) => {
    const { universityId } = req.query;
    res.json(getStudents(universityId as string));
  });

  app.get('/api/faculty', (req: Request, res: Response) => {
    const { universityId } = req.query;
    res.json(getFaculty(universityId as string));
  });

  // 11. Projects (University Solutions & Industry Collaborations)
  app.get('/api/projects', (req: Request, res: Response) => {
    res.json(getProjects());
  });

  app.get('/api/projects/:id', (req: Request, res: Response) => {
    const proj = getProjectById(req.params.id);
    if (!proj) return res.status(404).json({ error: 'Project not found' });
    res.json(proj);
  });

  // University accepts challenge and submits solution proposal
  app.post('/api/projects', (req: Request, res: Response) => {
    try {
      const { challengeId, universityId, proposal } = req.body;
      const challenge = getChallengeById(challengeId);
      const univ = getUniversityById(universityId);

      if (!challenge || !univ) {
        return res.status(400).json({ error: 'Challenge or University not found' });
      }

      const allProjects = getProjects();
      const projectId = `PRJ-JH-2026-${(allProjects.length + 1).toString().padStart(3, '0')}`;

      const newProject: Project = {
        id: projectId,
        challengeId,
        challengeTitle: challenge.title,
        category: challenge.category,
        district: challenge.district,
        universityId: univ.id,
        universityName: univ.name,
        status: 'Solution Proposed',
        proposal: {
          id: `PROP-${Date.now()}`,
          challengeId,
          universityId: univ.id,
          proposedSolution: proposal.proposedSolution,
          problemAnalysis: proposal.problemAnalysis,
          technologyRequired: proposal.technologyRequired || [],
          requiredResources: proposal.requiredResources || [],
          estimatedCost: Number(proposal.estimatedCost) || 200000,
          expectedTimelineWeeks: Number(proposal.expectedTimelineWeeks) || 6,
          expectedImpact: proposal.expectedImpact || 'Improves community quality of life.',
          prototypeRequirement: proposal.prototypeRequirement || 'Skid mounted mechanical assembly.',
          facultyMentorId: proposal.facultyMentorId || 'FAC-001',
          facultyMentorName: proposal.facultyMentorName || 'Prof. (Dr.) A. K. Sharma',
          studentTeamIds: proposal.studentTeamIds || [],
          studentTeamNames: proposal.studentTeamNames || ['Student Innovation Cell'],
          technicalRequirements: proposal.technicalRequirements || 'Field deployable.',
          submittedAt: new Date().toISOString(),
          status: 'Submitted'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        milestones: [
          {
            id: 'M1',
            title: 'Technical Feasibility & Baseline Sampling',
            description: 'Laboratory assessment of soil/water samples and site survey.',
            dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            completed: false
          },
          {
            id: 'M2',
            title: 'CAD Modeling & Prototype Component Sourcing',
            description: 'Engineering drawings and procurement of sensor/filtration components.',
            dueDate: new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0],
            completed: false
          },
          {
            id: 'M3',
            title: 'Fabrication & Bench Validation',
            description: 'Assembly at university makerspace and bench safety testing.',
            dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
            completed: false
          },
          {
            id: 'M4',
            title: 'Field Installation & Handover',
            description: 'Community commissioning and local maintenance operator training.',
            dueDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
            completed: false
          }
        ]
      };

      const saved = addProject(newProject);
      res.status(201).json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Error submitting solution proposal' });
    }
  });

  // Update Project Status & Milestones
  app.put('/api/projects/:id/status', (req: Request, res: Response) => {
    const { status, completedMilestoneId } = req.body;
    const project = getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const updates: Partial<Project> = { status };

    if (completedMilestoneId) {
      updates.milestones = project.milestones.map(m => {
        if (m.id === completedMilestoneId) {
          return { ...m, completed: true, completedAt: new Date().toISOString().split('T')[0] };
        }
        return m;
      });
    }

    const updated = updateProject(project.id, updates);
    // Also keep challenge status synced
    updateChallenge(project.challengeId, { status });

    res.json(updated);
  });

  // 12. Industry Collaboration & Support
  app.post('/api/industry/support', (req: Request, res: Response) => {
    try {
      const {
        projectId,
        industryId,
        supportTypes,
        resourcesProvided,
        committedFundingInr,
        technicalMentorAssigned
      } = req.body;

      const project = getProjectById(projectId);
      const industry = getIndustryById(industryId);

      if (!project || !industry) {
        return res.status(400).json({ error: 'Project or Industry not found' });
      }

      const supportData = {
        id: `IND-SUPP-${Date.now()}`,
        projectId: project.id,
        industryId: industry.id,
        industryName: industry.name,
        supportTypes: supportTypes || ['Prototype Development', 'Funding'],
        resourcesProvided: resourcesProvided || 'Engineering design mentoring and precision equipment access.',
        committedFundingInr: Number(committedFundingInr) || 250000,
        technicalMentorAssigned: technicalMentorAssigned || industry.contactPerson,
        prototypeStatus: 'CAD/Design' as const,
        testingStatus: 'Pending' as const,
        governmentCompensationInr: Math.round((Number(committedFundingInr) || 250000) * 0.8),
        compensationStatus: 'Pending Review' as const,
        updatedAt: new Date().toISOString()
      };

      const updatedProject = updateProject(project.id, {
        industrySupport: supportData,
        status: 'Industry Collaborating'
      });

      updateChallenge(project.challengeId, {
        status: 'Industry Collaborating'
      });

      addNotification({
        id: `NOTIF-${Date.now()}`,
        recipientRole: 'university',
        title: 'Industry Collaboration Confirmed',
        message: `${industry.name} offered ₹${supportData.committedFundingInr.toLocaleString('en-IN')} and prototype support for ${project.id}.`,
        type: 'success',
        projectId: project.id,
        read: false,
        createdAt: new Date().toISOString()
      });

      addNotification({
        id: `NOTIF-${Date.now() + 1}`,
        recipientRole: 'government',
        title: 'New University-Industry Collaboration',
        message: `${project.universityName} + ${industry.name} partnered on "${project.challengeTitle}".`,
        type: 'info',
        projectId: project.id,
        read: false,
        createdAt: new Date().toISOString()
      });

      res.json(updatedProject);
    } catch (err) {
      res.status(500).json({ error: 'Error attaching industry support' });
    }
  });

  // 13. Panchayat Operations: Accept, Resolve, or Escalate to University
  app.post('/api/panchayat/accept', (req: Request, res: Response) => {
    const { challengeId, panchayatId } = req.body;
    const challenge = getChallengeById(challengeId);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    const updated = updateChallenge(challengeId, {
      status: 'Panchayat In Progress'
    });
    res.json(updated);
  });

  app.post('/api/panchayat/resolve', (req: Request, res: Response) => {
    const { challengeId, notes, costIncurred } = req.body;
    const challenge = getChallengeById(challengeId);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    const updated = updateChallenge(challengeId, {
      status: 'Panchayat Resolved',
      resolvedAt: new Date().toISOString(),
      impactMetrics: {
        citizensBenefited: challenge.aiAnalysis?.citizensAffectedEstimate || 350,
        villagesBenefited: 1,
        costEstimate: Number(costIncurred) || 25000,
        actualCost: Number(costIncurred) || 22000,
        impactScore: 92,
        impactSummary: notes || 'Resolved via local Panchayat maintenance squad with verified functional test.'
      }
    });

    addNotification({
      id: `NOTIF-${Date.now()}`,
      recipientRole: 'citizen',
      title: `Challenge Resolved: ${challenge.id}`,
      message: `Your reported problem in ${challenge.village} has been resolved by the Panchayat.`,
      type: 'success',
      challengeId: challenge.id,
      read: false,
      createdAt: new Date().toISOString()
    });

    res.json(updated);
  });

  // CRUCIAL: Panchayat Escalation to University
  app.post('/api/panchayat/escalate', (req: Request, res: Response) => {
    const { challengeId, escalationReason, selectedUniversityId } = req.body;
    const challenge = getChallengeById(challengeId);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    // AI Matches suitable university if not specified
    let targetUniv = selectedUniversityId ? getUniversityById(selectedUniversityId) : null;
    if (!targetUniv) {
      const matches = matchUniversitiesForChallenge(challenge);
      targetUniv = matches[0]?.university || getUniversities()[0];
    }

    const updated = updateChallenge(challengeId, {
      status: 'Panchayat Escalated',
      escalatedFromPanchayat: true,
      escalationReason: escalationReason || 'Technical complexity exceeds Panchayat local resources; requires university research.',
      escalationDate: new Date().toISOString(),
      assignedTo: {
        type: 'University',
        id: targetUniv.id,
        name: targetUniv.name
      }
    });

    addNotification({
      id: `NOTIF-${Date.now()}`,
      recipientRole: 'university',
      title: `Panchayat Escalation Alert: ${challenge.id}`,
      message: `${challenge.mandal} Panchayat escalated "${challenge.title}" to ${targetUniv.name}. Technical evaluation requested!`,
      type: 'warning',
      challengeId: challenge.id,
      read: false,
      createdAt: new Date().toISOString()
    });

    addNotification({
      id: `NOTIF-${Date.now() + 1}`,
      recipientRole: 'government',
      title: `Escalation Logged: ${challenge.id}`,
      message: `Challenge escalated from ${challenge.mandal} Panchayat to ${targetUniv.name}. Reason: ${escalationReason || 'Technical investigation required.'}`,
      type: 'alert',
      challengeId: challenge.id,
      read: false,
      createdAt: new Date().toISOString()
    });

    res.json({
      success: true,
      challenge: updated,
      escalatedTo: targetUniv
    });
  });

  // 14. Government Approval of Industry Compensation
  app.post('/api/government/approve-compensation', (req: Request, res: Response) => {
    const { projectId, approvedAmountInr } = req.body;
    const project = getProjectById(projectId);
    if (!project || !project.industrySupport) {
      return res.status(404).json({ error: 'Project or industry support not found' });
    }

    const updatedSupport = {
      ...project.industrySupport,
      compensationStatus: 'Approved' as const,
      governmentCompensationInr: Number(approvedAmountInr) || project.industrySupport.governmentCompensationInr,
      updatedAt: new Date().toISOString()
    };

    const updatedProject = updateProject(project.id, {
      industrySupport: updatedSupport
    });

    addNotification({
      id: `NOTIF-${Date.now()}`,
      recipientRole: 'industry',
      title: `Compensation Approved: ₹${updatedSupport.governmentCompensationInr.toLocaleString('en-IN')}`,
      message: `Govt of Jharkhand approved CSR reimbursement for Project ${project.id}. Disbursal underway.`,
      type: 'success',
      projectId: project.id,
      read: false,
      createdAt: new Date().toISOString()
    });

    res.json(updatedProject);
  });

  // 15. Notifications
  app.get('/api/notifications', (req: Request, res: Response) => {
    const { role } = req.query;
    res.json(getNotifications(role as string));
  });

  app.post('/api/notifications/mark-read', (req: Request, res: Response) => {
    const { id } = req.body;
    if (id) markNotificationRead(id);
    res.json({ success: true });
  });

  // 16. Platform Stats
  app.get('/api/stats', (req: Request, res: Response) => {
    res.json(getPlatformStats());
  });

  // 17. Government Analytics Aggregations
  app.get('/api/analytics', (req: Request, res: Response) => {
    const all = getChallenges();
    const allProjects = getProjects();

    // Category breakdown
    const categoryCount: Record<string, number> = {
      Water: 0,
      'Waste Management': 0,
      'Roads & Infrastructure': 0
    };
    all.forEach(c => {
      if (categoryCount[c.category] !== undefined) {
        categoryCount[c.category]++;
      }
    });

    // District breakdown
    const districtCount: Record<string, { total: number; resolved: number; active: number }> = {};
    all.forEach(c => {
      if (!districtCount[c.district]) {
        districtCount[c.district] = { total: 0, resolved: 0, active: 0 };
      }
      districtCount[c.district].total++;
      if (c.status.includes('Resolved')) {
        districtCount[c.district].resolved++;
      } else {
        districtCount[c.district].active++;
      }
    });

    // Routing distribution
    let panchayatCount = 0;
    let universityCount = 0;
    all.forEach(c => {
      if (c.assignedTo?.type === 'University' || c.aiAnalysis?.routingTarget === 'University') {
        universityCount++;
      } else {
        panchayatCount++;
      }
    });

    // Resolution over time (last 6 months)
    const monthlyResolutions = [
      { month: 'Apr 2026', resolved: 14, submitted: 22 },
      { month: 'May 2026', resolved: 19, submitted: 28 },
      { month: 'Jun 2026', resolved: 25, submitted: 35 },
      { month: 'Jul 2026', resolved: 31, submitted: 38 },
      { month: 'Aug 2026', resolved: 38, submitted: 42 },
      { month: 'Sep 2026', resolved: 46, submitted: 48 }
    ];

    // University participation counts
    const univParticipation = getUniversities().map(u => ({
      name: u.shortName,
      projects: allProjects.filter(p => p.universityId === u.id).length + Math.floor(Math.random() * 3 + 1),
      acceptedChallenges: all.filter(c => c.assignedTo?.id === u.id).length
    }));

    // Industry contribution breakdown
    const indParticipation = getIndustries().map(i => ({
      name: i.name.split('—')[0].replace('(TSRDS)', '').trim(),
      contributionInr: i.totalContributionInr,
      collaborations: i.activeCollaborationsCount
    }));

    res.json({
      categoryDistribution: Object.entries(categoryCount).map(([name, count]) => ({ name, count })),
      districtDistribution: Object.entries(districtCount).map(([district, stats]) => ({ district, ...stats })),
      routingDistribution: [
        { name: 'Panchayat (Local Civic)', value: panchayatCount, color: '#0284c7' },
        { name: 'University (Research & Tech)', value: universityCount, color: '#8b5cf6' }
      ],
      monthlyResolutions,
      universityParticipation: univParticipation,
      industryParticipation: indParticipation
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CivicSolve] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
