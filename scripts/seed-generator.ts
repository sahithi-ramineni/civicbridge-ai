import fs from 'fs';
import path from 'path';

interface RawChallenge {
  id: string;
  title: string;
  description: string;
  category: 'Water' | 'Waste Management' | 'Roads & Infrastructure';
  subcategory: string;
  state: string;
  district: string;
  mandal: string;
  village: string;
  location: string;
  latitude: number;
  longitude: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: string;
  submittedBy: {
    name: string;
    mobile: string;
    email: string;
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
  projectId?: string;
  aiAnalysis?: {
    primaryCategory: 'Water' | 'Waste Management' | 'Roads & Infrastructure';
    secondaryCategory?: string;
    subcategory: string;
    keywords: string[];
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    priorityReason: string;
    citizensAffectedEstimate: number;
    safetyRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
    routingTarget: 'Panchayat' | 'University';
    routingConfidence: number;
    routingReason: string;
    suggestedAction: string;
    timestamp: string;
    modelUsed: string;
    isFallback: boolean;
  };
  impactMetrics?: {
    citizensBenefited: number;
    villagesBenefited: number;
    costEstimate: number;
    actualCost?: number;
    impactScore: number;
    impactSummary: string;
    waterSavedLpd?: number;
    wasteReducedKgDay?: number;
  };
}

const districts = [
  { name: 'Ranchi', mandals: ['Ormanjhi', 'Kanke', 'Ratu', 'Namkum', 'Angara', 'Bero'], baseLat: 23.3441, baseLng: 85.3096 },
  { name: 'East Singhbhum', mandals: ['Ghatshila', 'Potka', 'Golmuri', 'Baharagora', 'Musabani'], baseLat: 22.8046, baseLng: 86.2029 },
  { name: 'Dhanbad', mandals: ['Govindpur', 'Topchanchi', 'Nirsa', 'Baliapur', 'Baghmara'], baseLat: 23.7957, baseLng: 86.4304 },
  { name: 'Ramgarh', mandals: ['Mandu', 'Patratu', 'Chitarpur', 'Gola'], baseLat: 23.6322, baseLng: 85.5186 },
  { name: 'Bokaro', mandals: ['Chandankiyari', 'Chas', 'Bermo', 'Gomia', 'Jaridih'], baseLat: 23.6693, baseLng: 86.1511 },
  { name: 'Hazaribagh', mandals: ['Barhi', 'Katkamsandi', 'Ichak', 'Bishnugarh', 'Chouparan'], baseLat: 23.9937, baseLng: 85.3647 },
  { name: 'Palamu', mandals: ['Chainpur', 'Daltonganj', 'Hariharganj', 'Patan'], baseLat: 24.0416, baseLng: 84.0725 },
  { name: 'Deoghar', mandals: ['Mohanpur', 'Sarwan', 'Karon', 'Madhupur'], baseLat: 24.4826, baseLng: 86.7015 }
];

const citizenNames = [
  'Sunita Devi', 'Ramesh Kumar', 'Birsa Munda', 'Anjali Kumari', 'Md. Imran',
  'Deepak Mahato', 'Pooja Soren', 'Sanjay Tirkey', 'Meena Oraon', 'Rajesh Yadav',
  'Kavita Sinha', 'Manoj Karmakar', 'Laxmi Bauri', 'Santosh Pandey', 'Anita Hembrom',
  'Arun Mandal', 'Geeta Devi', 'Vikram Hansda', 'Suman Verma', 'Pankaj Shukla'
];

// Curated base templates with intentional duplicate clusters for each category
const waterTemplates = [
  // Cluster A: School drinking water crisis
  {
    title: "Severe shortage of safe drinking water for 450 students in Government High School, Ormanjhi",
    desc: "The only school handpump has dried up and the overhead tank motor is burnt. Students are forced to carry water from a contaminated pond 1 km away. High turbidity and bad smell.",
    subcat: "School Drinking Water Crisis",
    priority: "High" as const,
    routing: "University" as const,
    univId: "UNIV-JH-001",
    univName: "BIT Mesra",
    panchayatId: "PAN-JH-001",
    panchayatName: "Ormanjhi Gram Panchayat",
    reason: "Requires comprehensive solar-powered water filtration and groundwater testing beyond basic plumbing.",
    status: "Prototype Development",
    projectId: "PRJ-JH-2026-001",
    citizens: 1200
  },
  {
    title: "Government school students are suffering because safe drinking water is unavailable",
    desc: "In our village primary school, students have no potable water facility. Handpump yields yellow mud water. Children are falling ill with diarrhea.",
    subcat: "School Drinking Water Crisis",
    priority: "High" as const,
    routing: "University" as const,
    univId: "UNIV-JH-001",
    univName: "BIT Mesra",
    panchayatId: "PAN-JH-001",
    panchayatName: "Ormanjhi Gram Panchayat",
    reason: "High similarity to existing school water crisis; requires filtration technology.",
    status: "AI Analyzed",
    citizens: 550
  },
  {
    title: "Students don't have safe drinking water in village secondary school",
    desc: "No clean drinking water facility in school premises. Borewell water has chemical taste and children avoid drinking water during hot summer classes.",
    subcat: "School Drinking Water Crisis",
    priority: "High" as const,
    routing: "University" as const,
    univId: "UNIV-JH-001",
    univName: "BIT Mesra",
    panchayatId: "PAN-JH-002",
    panchayatName: "Kanke Central Panchayat",
    reason: "Water contamination and yield issue affecting educational institution.",
    status: "Submitted",
    citizens: 600
  },
  {
    title: "School has no clean water facility for midday meal cooking and drinking",
    desc: "Midday meal cooks have to fetch water from distant open well. School tap pipeline is completely dry for 3 months.",
    subcat: "School Drinking Water Crisis",
    priority: "High" as const,
    routing: "Panchayat" as const,
    panchayatId: "PAN-JH-003",
    panchayatName: "Ratu Gram Panchayat",
    reason: "Local pipe reconnection and pump replacement within Panchayat capability.",
    status: "Panchayat In Progress",
    citizens: 400
  },

  // Cluster B: Fluoride & Arsenic Contamination
  {
    title: "Excessive fluoride concentration in village tube-well causing dental fluorosis in children",
    desc: "Medical camp found 38 children with brown mottled teeth and joint pains. Water testing showed fluoride level 4.1 ppm against limit of 1.0 ppm.",
    subcat: "Fluoride Contamination",
    priority: "Critical" as const,
    routing: "University" as const,
    univId: "UNIV-JH-003",
    univName: "IIT (ISM) Dhanbad",
    panchayatId: "PAN-JH-015",
    panchayatName: "Daltonganj Rural Gram Panchayat",
    reason: "Deep aquifer chemical contamination requiring chemical adsorption / nanofiltration research.",
    status: "University Accepted",
    citizens: 2400
  },
  {
    title: "Village handpump water causes bone pain and yellow teeth due to chemical toxicity",
    desc: "Drinking water from public handpump is suspect. Residents have severe joint stiffness and dental decay. Immediate filtration filter required.",
    subcat: "Fluoride Contamination",
    priority: "Critical" as const,
    routing: "University" as const,
    univId: "UNIV-JH-003",
    univName: "IIT (ISM) Dhanbad",
    panchayatId: "PAN-JH-015",
    panchayatName: "Daltonganj Rural Gram Panchayat",
    reason: "Matches severe fluoride toxicity pattern; requires university water lab evaluation.",
    status: "AI Analyzed",
    citizens: 1800
  },
  {
    title: "High iron content turning drinking water rusty red and staining utensils",
    desc: "Water pumped from community handpump oxidizes into dark red precipitate within 15 minutes. Metallic taste causes nausea.",
    subcat: "Iron Contamination",
    priority: "Medium" as const,
    routing: "University" as const,
    univId: "UNIV-JH-006",
    univName: "Kolhan University",
    panchayatId: "PAN-JH-011",
    panchayatName: "Potka Tribal Gram Panchayat",
    reason: "Requires community terracotta/sand-gravel iron removal plant (IRP) design.",
    status: "Solution Proposed",
    citizens: 950
  },

  // Cluster C: Panchayat level local water repairs
  {
    title: "Community handpump handle broken and washer worn out in Ward 4",
    desc: "Single handpump serving 35 households has a snapped handle. Needs mechanical replacement of washer and bolt.",
    subcat: "Handpump Mechanical Repair",
    priority: "Medium" as const,
    routing: "Panchayat" as const,
    panchayatId: "PAN-JH-001",
    panchayatName: "Ormanjhi Gram Panchayat",
    reason: "Standard handpump mechanical repair within Panchayat technician and inventory capabilities.",
    status: "Panchayat Resolved",
    citizens: 180
  },
  {
    title: "Jal Jeevan Mission distribution pipe cracked causing clean water wastage on village street",
    desc: "PVC pipe cracked under tractor wheel. 5,000 liters of treated drinking water leaking daily into street drain.",
    subcat: "Pipeline Leakage",
    priority: "Medium" as const,
    routing: "Panchayat" as const,
    panchayatId: "PAN-JH-007",
    panchayatName: "Chandankiyari South Panchayat",
    reason: "Routine pipe coupler replacement and trench filling handled by Panchayat plumber.",
    status: "Panchayat Resolved",
    citizens: 320
  },
  {
    title: "Overhead community water tank motor burned out after power surge",
    desc: "Submersible pump motor failed during lightning storm. Entire tola is without piped water for past 4 days.",
    subcat: "Motor Replacement",
    priority: "High" as const,
    routing: "Panchayat" as const,
    panchayatId: "PAN-JH-004",
    panchayatName: "Namkum Rural Panchayat",
    reason: "Direct replacement of 5HP motor using Panchayat contingency funds.",
    status: "Panchayat In Progress",
    citizens: 750
  },

  // Cluster D: Groundwater depletion & Watershed check dams
  {
    title: "Rapidly falling water table in agricultural belt causing summer drought in 6 villages",
    desc: "Borewells drilled to 450 ft are yielding dry dust. Surface runoff during monsoon is lost completely. Need engineered check dam and groundwater recharge shaft.",
    subcat: "Aquifer Depletion & Check Dams",
    priority: "High" as const,
    routing: "University" as const,
    univId: "UNIV-JH-004",
    univName: "Birsa Agricultural University",
    panchayatId: "PAN-JH-005",
    panchayatName: "Mandu Gram Panchayat",
    reason: "Hydrological mapping and watershed bio-engineering required.",
    status: "University Accepted",
    citizens: 4200
  },
  {
    title: "Village check dam silted up and cracked, unable to store rainwater for livestock and irrigation",
    desc: "Old masonry check dam built in 2008 has 4-foot silt accumulation and cracked apron. Water drains out within 2 weeks of monsoon end.",
    subcat: "Check Dam Rehabilitation",
    priority: "Medium" as const,
    routing: "University" as const,
    univId: "UNIV-JH-004",
    univName: "Birsa Agricultural University",
    panchayatId: "PAN-JH-005",
    panchayatName: "Mandu Gram Panchayat",
    reason: "Civil structural redesign and desilting hydrology model required.",
    status: "Solution Proposed",
    citizens: 2100
  }
];

const wasteTemplates = [
  // Cluster A: Weekly Market Haat Garbage
  {
    title: "Overflowing organic and plastic garbage dump near Topchanchi weekly market polluting water body",
    desc: "Over 2 tons of rotten vegetables, fish entrails, and discarded polythene bags dumped every Tuesday. Leachate flows directly into the lake canal.",
    subcat: "Market Solid Waste",
    priority: "High" as const,
    routing: "University" as const,
    univId: "UNIV-JH-003",
    univName: "IIT (ISM) Dhanbad",
    panchayatId: "PAN-JH-010",
    panchayatName: "Topchanchi Gram Panchayat",
    reason: "Requires bio-composting drum design and plastic-to-paver conversion technology.",
    status: "Ready for Deployment",
    projectId: "PRJ-JH-2026-003",
    citizens: 5500
  },
  {
    title: "Weekly bazaar vegetable waste rotting on roadside creating foul stench and disease hazard",
    desc: "Market traders throw unsold vegetables and fruit waste on the road. Flies and stray animals creating severe public health crisis.",
    subcat: "Market Solid Waste",
    priority: "High" as const,
    routing: "University" as const,
    univId: "UNIV-JH-003",
    univName: "IIT (ISM) Dhanbad",
    panchayatId: "PAN-JH-010",
    panchayatName: "Topchanchi Gram Panchayat",
    reason: "Semantically identical to market solid waste issue; can share composting drum project.",
    status: "AI Analyzed",
    citizens: 3800
  },
  {
    title: "Piles of uncollected market refuse blocking pedestrian walkway and village entrance",
    desc: "No garbage bins provided for vegetable sellers. Waste pile has expanded across 50 meters of the village main approach.",
    subcat: "Market Solid Waste",
    priority: "Medium" as const,
    routing: "Panchayat" as const,
    panchayatId: "PAN-JH-002",
    panchayatName: "Kanke Central Panchayat",
    reason: "Panchayat tractor and sanitation workers can clear and establish designated dump yard.",
    status: "Panchayat Resolved",
    citizens: 1400
  },

  // Cluster B: Plastic waste clogging drains and watercourses
  {
    title: "Single-use plastic bottles and packaging chocking village drainage canal causing street inundation",
    desc: "Non-biodegradable plastic packets have formed a solid dam in the 2-meter wide main stormwater nullah. Foul wastewater backing up into homes.",
    subcat: "Plastic Clogged Drains",
    priority: "Critical" as const,
    routing: "University" as const,
    univId: "UNIV-JH-005",
    univName: "Central University of Jharkhand",
    panchayatId: "PAN-JH-008",
    panchayatName: "Chas Gram Panchayat",
    reason: "Requires mechanical plastic trash-rack filter and recycling into paver blocks.",
    status: "Industry Collaborating",
    citizens: 3100
  },
  {
    title: "Plastic waste blocking drainage channel causing dirty water to flood village roads",
    desc: "Every rain causes dirty sewage to submerge the main village road because plastic bags have jammed the culvert grates.",
    subcat: "Plastic Clogged Drains",
    priority: "High" as const,
    routing: "University" as const,
    univId: "UNIV-JH-005",
    univName: "Central University of Jharkhand",
    panchayatId: "PAN-JH-008",
    panchayatName: "Chas Gram Panchayat",
    reason: "Similar to Chas drainage blockage; candidate for automated screen installation.",
    status: "AI Analyzed",
    citizens: 2600
  },
  {
    title: "Village drain silted up with kitchen waste and mud near community tap",
    desc: "Stagnant greywater puddle around community standpost. Needs desilting and a 20-meter soak pit.",
    subcat: "Drainage Desilting",
    priority: "Low" as const,
    routing: "Panchayat" as const,
    panchayatId: "PAN-JH-003",
    panchayatName: "Ratu Gram Panchayat",
    reason: "Simple manual desilting and soak-pit construction by Panchayat MGNREGA team.",
    status: "Panchayat Resolved",
    citizens: 220
  },

  // Cluster C: Hazardous, Biomedical and Toxic Runoff
  {
    title: "Primary Health Sub-centre dumping syringes and medical bandages in open pit behind school",
    desc: "Biomedical waste disposed in unfenced ditch where village children play and cows graze. Serious risk of hepatitis and HIV transmission.",
    subcat: "Biomedical Waste Disposal",
    priority: "Critical" as const,
    routing: "University" as const,
    univId: "UNIV-JH-001",
    univName: "BIT Mesra",
    panchayatId: "PAN-JH-013",
    panchayatName: "Barhi Gram Panchayat",
    reason: "Biohazard engineering requires mini-incinerator or autoclaving solution.",
    status: "University Accepted",
    citizens: 1900
  },
  {
    title: "Toxic fly-ash slurry from nearby industrial unit entering agricultural fields and drinking pond",
    desc: "Ash pond bund breach has coated 40 acres of paddy land with gray silica dust. pH of farm soil turned to 9.2.",
    subcat: "Industrial Waste Contamination",
    priority: "Critical" as const,
    routing: "University" as const,
    univId: "UNIV-JH-002",
    univName: "NIT Jamshedpur",
    panchayatId: "PAN-JH-009",
    panchayatName: "Govindpur Gram Panchayat",
    reason: "Heavy industrial effluent analysis and lime-neutralization engineering needed.",
    status: "Solution Proposed",
    citizens: 4800
  }
];

const roadTemplates = [
  // Cluster A: Culvert collapse & Flash flood washouts
  {
    title: "Damaged culvert causing flash flooding and cutting off access to Primary Health Centre",
    desc: "Brick arch culvert cracked during heavy downpour. Large vehicles and ambulances cannot cross. Patients have to be carried on cots for 4 km.",
    subcat: "Culvert Failure",
    priority: "Critical" as const,
    routing: "University" as const,
    univId: "UNIV-JH-002",
    univName: "NIT Jamshedpur",
    panchayatId: "PAN-JH-012",
    panchayatName: "Ghatshila Rural Panchayat",
    reason: "Requires structural bridge design using slag-geopolymer precast box culverts.",
    status: "Testing",
    projectId: "PRJ-JH-2026-002",
    citizens: 3800
  },
  {
    title: "Broken bridge road over village drain leaves ambulance unable to reach clinic",
    desc: "The small bridge connecting our village to the block hospital has collapsed on one side. Vehicles cannot pass safely.",
    subcat: "Culvert Failure",
    priority: "Critical" as const,
    routing: "University" as const,
    univId: "UNIV-JH-002",
    univName: "NIT Jamshedpur",
    panchayatId: "PAN-JH-012",
    panchayatName: "Ghatshila Rural Panchayat",
    reason: "Semantically identical to Ghatshila culvert failure; high priority structural bridge issue.",
    status: "AI Analyzed",
    citizens: 3200
  },
  {
    title: "Culvert pipe blocked with tree branches and soil, flooding adjacent paddy fields",
    desc: "Single 600mm hume pipe culvert under village road is jammed with driftwood. Road is overtopping by 6 inches.",
    subcat: "Culvert Clearing",
    priority: "Medium" as const,
    routing: "Panchayat" as const,
    panchayatId: "PAN-JH-006",
    panchayatName: "Patratu Lake Panchayat",
    reason: "Panchayat JCB can clear debris obstruction in 2 hours.",
    status: "Panchayat Resolved",
    citizens: 450
  },

  // Cluster B: Street lights and Public Safety
  {
    title: "Broken solar street lights on 1.5 km road between village chowk and girls' high school",
    desc: "All 12 solar streetlight batteries were stolen or depleted. Complete darkness after 6 PM creates danger of eve-teasing and snakebites for girl students.",
    subcat: "Public Lighting & Safety",
    priority: "High" as const,
    routing: "Panchayat" as const,
    panchayatId: "PAN-JH-001",
    panchayatName: "Ormanjhi Gram Panchayat",
    reason: "Panchayat can replace batteries and install anti-theft clamps on existing poles.",
    status: "Panchayat In Progress",
    citizens: 1100
  },
  {
    title: "Street light pole damaged and flickering on Main Chowk road",
    desc: "Pole bent after mini-truck hit it. Exposed electrical wires dangling dangerously near tea stalls.",
    subcat: "Street Light Repair",
    priority: "High" as const,
    routing: "Panchayat" as const,
    panchayatId: "PAN-JH-004",
    panchayatName: "Namkum Rural Panchayat",
    reason: "Immediate lineman repair and pole realignment under Panchayat electrical maintenance.",
    status: "Panchayat Resolved",
    citizens: 600
  },
  {
    title: "Dark street due to fused sodium vapor lamps near bus stop",
    desc: "Four street lamp fixtures burnt out 2 weeks ago. Commuters waiting in pitch dark at night.",
    subcat: "Street Light Repair",
    priority: "Medium" as const,
    routing: "Panchayat" as const,
    panchayatId: "PAN-JH-013",
    panchayatName: "Barhi Gram Panchayat",
    reason: "Routine LED bulb replacement by Panchayat electrician.",
    status: "Panchayat Resolved",
    citizens: 520
  },

  // Cluster C: Chronic mud road and soil instability
  {
    title: "Black cotton soil track turns into knee-deep slush during monsoon blocking all vehicular movement",
    desc: "3 km stretch linking 3 tribal tolas to the main road has no stone soling. Even bullock carts get stuck. Heavy clay prevents normal gravel bonding.",
    subcat: "Soil Stabilization & Rural Roads",
    priority: "High" as const,
    routing: "University" as const,
    univId: "UNIV-JH-001",
    univName: "BIT Mesra",
    panchayatId: "PAN-JH-011",
    panchayatName: "Potka Tribal Gram Panchayat",
    reason: "Expansive clay soil stabilization requires geogrid and lime/fly-ash chemical stabilization research.",
    status: "University Accepted",
    citizens: 2900
  },
  {
    title: "Deep crater potholes on state highway approach road damaging vehicles and causing motorcycle skids",
    desc: "Continuous heavy coal trucks have created 10-inch deep craters. Three motorcycle riders suffered fractures last week.",
    subcat: "Road Surface Distress",
    priority: "High" as const,
    routing: "Panchayat" as const,
    panchayatId: "PAN-JH-005",
    panchayatName: "Mandu Gram Panchayat",
    reason: "Cold mix asphalt patching and warning signage directly actionable by local authority.",
    status: "Panchayat In Progress",
    citizens: 3500
  }
];

const allChallenges: RawChallenge[] = [];

// Helper to generate IDs
function formatId(num: number): string {
  return `CH-JH-2026-${num.toString().padStart(6, '0')}`;
}

let counter = 1;

// 1. First populate Water category (50 records)
for (let i = 0; i < 50; i++) {
  const base = waterTemplates[i % waterTemplates.length];
  const dist = districts[i % districts.length];
  const mandal = dist.mandals[i % dist.mandals.length];
  const citizen = citizenNames[i % citizenNames.length];
  const id = formatId(counter++);
  
  // Slight variation in title/desc if repeating
  const repeatIndex = Math.floor(i / waterTemplates.length);
  const title = repeatIndex === 0 
    ? base.title 
    : `${base.title} in ${mandal} (${dist.name})`;
  const desc = repeatIndex === 0
    ? base.desc
    : `${base.desc} Reported near ${mandal} block center.`;

  const lat = +(dist.baseLat + (Math.sin(i * 1.5) * 0.08)).toFixed(5);
  const lng = +(dist.baseLng + (Math.cos(i * 1.5) * 0.08)).toFixed(5);

  const daysAgo = (50 - i) * 2;
  const createdDate = new Date(Date.now() - daysAgo * 24 * 3600 * 1000).toISOString();

  allChallenges.push({
    id,
    title,
    description: desc,
    category: 'Water',
    subcategory: base.subcat,
    state: 'Jharkhand',
    district: dist.name,
    mandal,
    village: `${mandal} Tola ${((i % 4) + 1)}`,
    location: `${mandal}, ${dist.name}, Jharkhand`,
    latitude: lat,
    longitude: lng,
    priority: base.priority,
    status: base.status,
    submittedBy: {
      name: citizen,
      mobile: `+91 9431${(10000 + i).toString()}`,
      email: `${citizen.toLowerCase().replace(/[^a-z]/g, '')}${i}@gmail.com`,
      userId: `USR-${100 + i}`
    },
    createdAt: createdDate,
    updatedAt: new Date(Date.now() - (daysAgo - 2) * 24 * 3600 * 1000).toISOString(),
    assignedTo: base.routing === 'University' && base.univId
      ? { type: 'University', id: base.univId, name: base.univName || 'BIT Mesra' }
      : { type: 'Panchayat', id: base.panchayatId || 'PAN-JH-001', name: base.panchayatName || 'Gram Panchayat' },
    projectId: base.projectId,
    aiAnalysis: {
      primaryCategory: 'Water',
      subcategory: base.subcat,
      keywords: ['drinking water', 'contamination', 'handpump', 'filtration', 'school health'],
      priority: base.priority,
      priorityReason: `Affects approximately ${base.citizens} residents. Evaluated public health risk factor.`,
      citizensAffectedEstimate: base.citizens,
      safetyRiskLevel: base.priority === 'Critical' ? 'Severe' : base.priority === 'High' ? 'High' : 'Moderate',
      routingTarget: base.routing,
      routingConfidence: 91 + (i % 8),
      routingReason: base.reason,
      suggestedAction: base.routing === 'University' ? 'Assign faculty mentor & initiate technical feasibility' : 'Dispatch Panchayat maintenance crew',
      timestamp: createdDate,
      modelUsed: 'gemini-3.8-flash',
      isFallback: false
    },
    impactMetrics: base.status === 'Resolved' || base.status === 'Panchayat Resolved' ? {
      citizensBenefited: base.citizens,
      villagesBenefited: 2,
      costEstimate: 120000,
      actualCost: 112000,
      impactScore: 88,
      impactSummary: 'Successfully restored continuous clean water supply with tested safety compliance.',
      waterSavedLpd: 1500
    } : undefined
  });
}

// 2. Waste Management category (50 records)
for (let i = 0; i < 50; i++) {
  const base = wasteTemplates[i % wasteTemplates.length];
  const dist = districts[(i + 2) % districts.length];
  const mandal = dist.mandals[(i + 1) % dist.mandals.length];
  const citizen = citizenNames[(i + 5) % citizenNames.length];
  const id = formatId(counter++);

  const repeatIndex = Math.floor(i / wasteTemplates.length);
  const title = repeatIndex === 0 
    ? base.title 
    : `${base.title} in ${mandal} (${dist.name})`;
  const desc = repeatIndex === 0
    ? base.desc
    : `${base.desc} Located along ${mandal} sector.`;

  const lat = +(dist.baseLat + (Math.sin(i * 1.8) * 0.08)).toFixed(5);
  const lng = +(dist.baseLng + (Math.cos(i * 1.8) * 0.08)).toFixed(5);

  const daysAgo = (50 - i) * 2;
  const createdDate = new Date(Date.now() - daysAgo * 24 * 3600 * 1000).toISOString();

  allChallenges.push({
    id,
    title,
    description: desc,
    category: 'Waste Management',
    subcategory: base.subcat,
    state: 'Jharkhand',
    district: dist.name,
    mandal,
    village: `${mandal} Gram ${((i % 4) + 1)}`,
    location: `${mandal}, ${dist.name}, Jharkhand`,
    latitude: lat,
    longitude: lng,
    priority: base.priority,
    status: base.status,
    submittedBy: {
      name: citizen,
      mobile: `+91 9431${(20000 + i).toString()}`,
      email: `${citizen.toLowerCase().replace(/[^a-z]/g, '')}${i}@gmail.com`,
      userId: `USR-${200 + i}`
    },
    createdAt: createdDate,
    updatedAt: new Date(Date.now() - (daysAgo - 2) * 24 * 3600 * 1000).toISOString(),
    assignedTo: base.routing === 'University' && base.univId
      ? { type: 'University', id: base.univId, name: base.univName || 'IIT (ISM) Dhanbad' }
      : { type: 'Panchayat', id: base.panchayatId || 'PAN-JH-002', name: base.panchayatName || 'Gram Panchayat' },
    projectId: base.projectId,
    aiAnalysis: {
      primaryCategory: 'Waste Management',
      subcategory: base.subcat,
      keywords: ['solid waste', 'plastic clogging', 'composting', 'drainage', 'recycling'],
      priority: base.priority,
      priorityReason: `Estimated volume impacts sanitation for ${base.citizens} inhabitants.`,
      citizensAffectedEstimate: base.citizens,
      safetyRiskLevel: base.priority === 'Critical' ? 'Severe' : base.priority === 'High' ? 'High' : 'Moderate',
      routingTarget: base.routing,
      routingConfidence: 90 + (i % 9),
      routingReason: base.reason,
      suggestedAction: base.routing === 'University' ? 'Deploy mechanical bio-drum and plastic extruder' : 'Deploy Panchayat sanitation staff for clearance',
      timestamp: createdDate,
      modelUsed: 'gemini-3.8-flash',
      isFallback: false
    },
    impactMetrics: base.status === 'Resolved' || base.status === 'Panchayat Resolved' ? {
      citizensBenefited: base.citizens,
      villagesBenefited: 3,
      costEstimate: 85000,
      actualCost: 81000,
      impactScore: 91,
      impactSummary: 'Eliminated hazardous waste pile; established daily segregated collection routine.',
      wasteReducedKgDay: 280
    } : undefined
  });
}

// 3. Roads & Infrastructure category (50 records)
for (let i = 0; i < 50; i++) {
  const base = roadTemplates[i % roadTemplates.length];
  const dist = districts[(i + 4) % districts.length];
  const mandal = dist.mandals[(i + 2) % dist.mandals.length];
  const citizen = citizenNames[(i + 10) % citizenNames.length];
  const id = formatId(counter++);

  const repeatIndex = Math.floor(i / roadTemplates.length);
  const title = repeatIndex === 0 
    ? base.title 
    : `${base.title} in ${mandal} (${dist.name})`;
  const desc = repeatIndex === 0
    ? base.desc
    : `${base.desc} Crucial transport artery for ${mandal}.`;

  const lat = +(dist.baseLat + (Math.sin(i * 1.3) * 0.08)).toFixed(5);
  const lng = +(dist.baseLng + (Math.cos(i * 1.3) * 0.08)).toFixed(5);

  const daysAgo = (50 - i) * 2;
  const createdDate = new Date(Date.now() - daysAgo * 24 * 3600 * 1000).toISOString();

  allChallenges.push({
    id,
    title,
    description: desc,
    category: 'Roads & Infrastructure',
    subcategory: base.subcat,
    state: 'Jharkhand',
    district: dist.name,
    mandal,
    village: `${mandal} Ward ${((i % 4) + 1)}`,
    location: `${mandal}, ${dist.name}, Jharkhand`,
    latitude: lat,
    longitude: lng,
    priority: base.priority,
    status: base.status,
    submittedBy: {
      name: citizen,
      mobile: `+91 9431${(30000 + i).toString()}`,
      email: `${citizen.toLowerCase().replace(/[^a-z]/g, '')}${i}@gmail.com`,
      userId: `USR-${300 + i}`
    },
    createdAt: createdDate,
    updatedAt: new Date(Date.now() - (daysAgo - 2) * 24 * 3600 * 1000).toISOString(),
    assignedTo: base.routing === 'University' && base.univId
      ? { type: 'University', id: base.univId, name: base.univName || 'NIT Jamshedpur' }
      : { type: 'Panchayat', id: base.panchayatId || 'PAN-JH-001', name: base.panchayatName || 'Gram Panchayat' },
    projectId: base.projectId,
    aiAnalysis: {
      primaryCategory: 'Roads & Infrastructure',
      subcategory: base.subcat,
      keywords: ['culvert', 'bridge', 'pothole', 'street light', 'rural road', 'soil stabilization'],
      priority: base.priority,
      priorityReason: `Directly impairs transport connectivity for ${base.citizens} villagers and emergency medical transit.`,
      citizensAffectedEstimate: base.citizens,
      safetyRiskLevel: base.priority === 'Critical' ? 'Severe' : base.priority === 'High' ? 'High' : 'Moderate',
      routingTarget: base.routing,
      routingConfidence: 92 + (i % 7),
      routingReason: base.reason,
      suggestedAction: base.routing === 'University' ? 'Structural engineering evaluation with prefabricated culvert design' : 'Execute rapid cold asphalt patch & LED fixture replacement',
      timestamp: createdDate,
      modelUsed: 'gemini-3.8-flash',
      isFallback: false
    },
    impactMetrics: base.status === 'Resolved' || base.status === 'Panchayat Resolved' ? {
      citizensBenefited: base.citizens,
      villagesBenefited: 4,
      costEstimate: 210000,
      actualCost: 198000,
      impactScore: 93,
      impactSummary: 'Safe all-weather transit re-established with durable structural protection.',
    } : undefined
  });
}

// Write to /data/challenges.json
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(
  path.join(dataDir, 'challenges.json'),
  JSON.stringify(allChallenges, null, 2),
  'utf-8'
);

console.log(`Successfully generated ${allChallenges.length} synthetic challenges into /data/challenges.json`);
