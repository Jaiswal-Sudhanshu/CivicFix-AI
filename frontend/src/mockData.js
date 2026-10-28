// Realistic Civic Complaints Dataset matching CivicFix AI Mockup
export const INITIAL_COMPLAINTS = [
  {
    id: "CFA-2026-001",
    title: "Large Crater Pothole Outside College Gate",
    description: "There is a large pothole on the road near the college gate. It is dangerous for two-wheelers and cars, especially during night.",
    category: "Roads & Potholes",
    department: "Road Maintenance Department",
    location: "Near SMS College Gate, Lucknow, Uttar Pradesh",
    lat: 26.8500,
    lng: 80.9380,
    priority: "High",
    priorityReason: "Large pothole can cause accidents and affect vehicle movement.",
    status: "resolved",
    upvotes: 24,
    createdAt: "2026-10-25T10:24:00Z",
    slaHours: 24,
    assignedOfficer: "Er. Alok Verma (LDA Road Maintenance)",
    photoUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    recommendedActions: [
      "Inspect the road section for size and severity of the pothole.",
      "Plan and schedule repair by the road maintenance team.",
      "Add temporary warning signs if required.",
      "Verify and mark as resolved after completion."
    ],
    timeline: [
      { step: "Complaint Submitted", time: "25 Oct 2026, 10:24 AM", desc: "Your complaint has been successfully registered." },
      { step: "Under Review", time: "25 Oct 2026, 12:15 PM", desc: "Our team is reviewing the complaint." },
      { step: "Assigned", time: "26 Oct 2026, 09:30 AM", desc: "Assigned to Road Maintenance Department." },
      { step: "In Progress", time: "28 Oct 2026, 11:20 AM", desc: "Work has started on the reported issue." },
      { step: "Resolved", time: "29 Oct 2026, 04:10 PM", desc: "The issue has been resolved. Thank you for reporting!" }
    ]
  },
  {
    id: "CFA-2026-005",
    title: "Faulty Streetlight on Main Avenue",
    description: "Streetlight fixture sparking and completely dark around evening pedestrian crossing.",
    category: "Streetlights & Lighting",
    department: "LDA Electrical & Lighting Wing",
    location: "Near Park, Sector B, Lucknow",
    lat: 26.8467,
    lng: 80.9462,
    priority: "High",
    priorityReason: "Total absence of street illumination creating high night-time pedestrian collision risk.",
    status: "under_review",
    upvotes: 8,
    createdAt: "2026-10-29T08:15:00Z",
    slaHours: 24,
    assignedOfficer: "Vikramaditya Singh (LDA Electrical Wing)",
    photoUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    recommendedActions: [
      "Dispatch bucket crane unit to inspect junction box.",
      "Check phase wiring and circuit breaker.",
      "Replace lamp fixture with LED module.",
      "Confirm Lux test reading."
    ],
    timeline: [
      { step: "Complaint Submitted", time: "29 Oct 2026, 08:15 AM", desc: "Your complaint has been successfully registered." },
      { step: "Under Review", time: "29 Oct 2026, 09:40 AM", desc: "Field officer reviewing priority and safety perimeter." }
    ]
  },
  {
    id: "CFA-2026-004",
    title: "Overflowing Community Garbage Bin",
    description: "Waste containers overflowing on pedestrian sidewalk with foul odor.",
    category: "Garbage & Sanitation",
    department: "LDA & LMC Solid Waste Directorate",
    location: "Sector A, Hazratganj, Lucknow",
    lat: 26.8540,
    lng: 80.9980,
    priority: "Medium",
    priorityReason: "Sanitation hazard and pedestrian obstruction in residential block.",
    status: "in_progress",
    upvotes: 14,
    createdAt: "2026-10-29T06:30:00Z",
    slaHours: 48,
    assignedOfficer: "Ramesh Chandra (Sanitation Directorate)",
    photoUrl: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80",
    recommendedActions: [
      "Schedule heavy compactor vehicle route.",
      "Clear surrounding sidewalk spill.",
      "Spray chemical disinfectant.",
      "Certify area sanitation clearance."
    ],
    timeline: [
      { step: "Complaint Submitted", time: "29 Oct 2026, 06:30 AM", desc: "Citizen filed via CivicFix portal." },
      { step: "Under Review", time: "29 Oct 2026, 07:10 AM", desc: "Reviewed by sanitation control cell." },
      { step: "Assigned", time: "29 Oct 2026, 08:00 AM", desc: "Assigned to Zone Compactor Unit." },
      { step: "In Progress", time: "29 Oct 2026, 09:30 AM", desc: "Sanitation vehicle dispatched to Sector A." }
    ]
  },
  {
    id: "CFA-2026-003",
    title: "Missing Stormwater Drain Grate",
    description: "Deep open drainage pit with missing cast iron grill near bus stop.",
    category: "Drainage & Sewerage",
    department: "Urban Drainage & Flood Mitigation",
    location: "Main Road, Alambagh, Lucknow",
    lat: 26.8690,
    lng: 80.9130,
    priority: "High",
    priorityReason: "Severe fall hazard for commuters and schoolchildren near public bus stand.",
    status: "in_progress",
    upvotes: 19,
    createdAt: "2026-10-28T16:20:00Z",
    slaHours: 12,
    assignedOfficer: "Er. Dinesh Kumar (Drainage Unit)",
    photoUrl: "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80",
    recommendedActions: [
      "Place reflective safety cones around open orifice immediately.",
      "Fabricate heavy-duty ductile iron grating.",
      "Weld grate lock onto frame to prevent theft.",
      "Inspect flow clearance inside chamber."
    ],
    timeline: [
      { step: "Complaint Submitted", time: "28 Oct 2026, 04:20 PM", desc: "Your complaint has been successfully registered." },
      { step: "Under Review", time: "28 Oct 2026, 04:45 PM", desc: "High hazard flag triggered by CivicFix AI." },
      { step: "Assigned", time: "28 Oct 2026, 05:30 PM", desc: "Assigned to Alambagh Rapid Emergency Squad." },
      { step: "In Progress", time: "28 Oct 2026, 06:15 PM", desc: "Safety barricades erected; replacement grate dispatched." }
    ]
  }
];

export const MOCK_STATISTICS = {
  reported: 1240,
  inProgress: 980,
  resolved: 760,
  categories: "15+"
};

export const MOCK_DASHBOARD_STATS = {
  total: 248,
  pending: 96,
  inProgress: 112,
  resolved: 40
};
