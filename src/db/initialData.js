export const INITIAL_CITIES = [
  { id: 'nagpur', name: 'Nagpur', state: 'Maharashtra', localities: ['Dharampeth', 'Sitabuldi', 'Wardha Road', 'Sadar', 'Trimurti Nagar'] },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', localities: ['Andheri', 'Thane', 'Borivali', 'Dadar', 'Navi Mumbai'] },
  { id: 'pune', name: 'Pune', state: 'Maharashtra', localities: ['Kothrud', 'Wakad', 'Hadapsar', 'Baner', 'Hinjawadi'] },
  { id: 'indore', name: 'Indore', state: 'Madhya Pradesh', localities: ['Vijay Nagar', 'Palasia', 'Rajwada', 'Bhanwarkuan'] },
  { id: 'bhopal', name: 'Bhopal', state: 'Madhya Pradesh', localities: ['MP Nagar', 'Arera Colony', 'Kolar Road', 'Hoshangabad Rd'] },
  { id: 'delhi', name: 'Delhi NCR', state: 'Delhi', localities: ['Dwarka', 'Rohini', 'South Ex', 'Noida', 'Gurugram'] },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', localities: ['Gachibowli', 'Kukatpally', 'Banjara Hills', 'Secunderabad'] },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', localities: ['Whitefield', 'Koramangala', 'Indiranagar', 'HSR Layout'] },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', localities: ['Anna Nagar', 'T. Nagar', 'Velachery', 'Guindy'] },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', localities: ['Salt Lake', 'New Town', 'Garia', 'Howrah'] }
];

export const INITIAL_USERS = [
  {
    id: 'u_admin_1',
    name: 'Vikram Joshi (Admin)',
    phone: '9876543210',
    email: 'admin@karvanta.in',
    role: 'admin',
    preferredLanguage: 'hi',
    city: 'Nagpur',
    createdAt: '2026-01-01'
  },
  {
    id: 'u_cust_1',
    name: 'Anand Deshmukh',
    phone: '9822114455',
    email: 'anand.deshmukh@gmail.com',
    role: 'customer',
    preferredLanguage: 'mr',
    city: 'Nagpur',
    createdAt: '2026-02-10'
  },
  {
    id: 'u_cust_2',
    name: 'Meera Subramanian',
    phone: '9844556677',
    email: 'meera.s@gmail.com',
    role: 'customer',
    preferredLanguage: 'ta',
    city: 'Chennai',
    createdAt: '2026-02-15'
  },
  {
    id: 'u_cont_1',
    name: 'Ramesh Kumar',
    phone: '9890123456',
    email: 'ramesh.builders@gmail.com',
    role: 'contractor',
    preferredLanguage: 'hi',
    city: 'Nagpur',
    createdAt: '2025-11-20'
  },
  {
    id: 'u_cont_2',
    name: 'Dinesh Patil',
    phone: '9823456789',
    email: 'patil.construction@gmail.com',
    role: 'contractor',
    preferredLanguage: 'mr',
    city: 'Pune',
    createdAt: '2025-12-05'
  },
  {
    id: 'u_cont_3',
    name: 'Arvind Sharma',
    phone: '9811223344',
    email: 'sharma.associates@gmail.com',
    role: 'contractor',
    preferredLanguage: 'hi',
    city: 'Indore',
    createdAt: '2026-01-12'
  },
  {
    id: 'u_work_1',
    name: 'Raju Sharma',
    phone: '9850123456',
    role: 'worker',
    preferredLanguage: 'hi',
    city: 'Nagpur',
    createdAt: '2025-10-15'
  },
  {
    id: 'u_work_2',
    name: 'Mohan Lal Badhai',
    phone: '9860234567',
    role: 'worker',
    preferredLanguage: 'hi',
    city: 'Mumbai',
    createdAt: '2025-11-01'
  },
  {
    id: 'u_work_3',
    name: 'Santosh Yadav',
    phone: '9870345678',
    role: 'worker',
    preferredLanguage: 'mr',
    city: 'Pune',
    createdAt: '2025-11-18'
  },
  {
    id: 'u_work_4',
    name: 'Bablu Paswan',
    phone: '9880456789',
    role: 'worker',
    preferredLanguage: 'hi',
    city: 'Nagpur',
    createdAt: '2025-12-01'
  },
  {
    id: 'u_work_5',
    name: 'Ganesh Thoke',
    phone: '9890567890',
    role: 'worker',
    preferredLanguage: 'hi',
    city: 'Bhopal',
    createdAt: '2026-01-05'
  },
  {
    id: 'u_work_6',
    name: 'K. Murugan',
    phone: '9840678901',
    role: 'worker',
    preferredLanguage: 'ta',
    city: 'Chennai',
    createdAt: '2026-01-10'
  }
];

export const INITIAL_CONTRACTORS = [
  {
    id: 'cont_1',
    userId: 'u_cont_1',
    name: 'Ramesh Kumar',
    businessName: 'Jai Bharat Construction & Interiors',
    profession: 'General Contractor',
    city: 'Nagpur',
    locality: 'Dharampeth',
    rating: 4.8,
    reviewCount: 37,
    yearsExp: 8,
    teamSize: '15-25 Workers',
    completedProjects: 15,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    verified: {
      phone: true,
      identity: true,
      trade: true,
      business: true,
      project: true
    },
    services: ['Residential Construction', 'Renovation', 'RCC Structural', 'Plaster & Flooring'],
    about: 'Leading residential construction contractor in Vidarbha region with 8+ years of delivering high-quality turnkey duplexes, RCC structures, and bungalow renovations.',
    languages: ['Hindi', 'Marathi', 'English'],
    availability: 'Available for New Projects',
    minBudget: '₹2,50,000',
    projects: [
      {
        id: 'p1',
        title: '3BHK Duplex Bungalow',
        location: 'Trimurti Nagar, Nagpur',
        area: '2400 sq.ft',
        year: '2025',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'p2',
        title: 'Complete Home Renovation & Modular Kitchen',
        location: 'Dharampeth, Nagpur',
        area: '1600 sq.ft',
        year: '2025',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'cont_2',
    userId: 'u_cont_2',
    name: 'Dinesh Patil',
    businessName: 'Patil Infrastructure & Builders',
    profession: 'Civil & RCC Contractor',
    city: 'Pune',
    locality: 'Kothrud',
    rating: 4.9,
    reviewCount: 52,
    yearsExp: 12,
    teamSize: '30+ Workers',
    completedProjects: 28,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    verified: {
      phone: true,
      identity: true,
      trade: true,
      business: true,
      project: true
    },
    services: ['RCC Framework', 'Independent Villas', 'Commercial Shops', 'Waterproofing'],
    about: '12 years of trusted civil execution in Pune and PCMC. Specialist in earthquake-resistant RCC columns, slab casting, and quality masonry with top brand cement/steel.',
    languages: ['Marathi', 'Hindi', 'English'],
    availability: 'Accepting Site Visits',
    minBudget: '₹5,00,000',
    projects: [
      {
        id: 'p3',
        title: 'G+2 Residential Building',
        location: 'Baner, Pune',
        area: '3800 sq.ft',
        year: '2025',
        image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'cont_3',
    userId: 'u_cont_3',
    name: 'Arvind Sharma',
    businessName: 'Sharma & Sons Civil Works',
    profession: 'Renovation & Finishing Contractor',
    city: 'Indore',
    locality: 'Vijay Nagar',
    rating: 4.7,
    reviewCount: 29,
    yearsExp: 9,
    teamSize: '10-18 Workers',
    completedProjects: 22,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    verified: {
      phone: true,
      identity: true,
      trade: true,
      business: true,
      project: false
    },
    services: ['Complete Renovation', 'Tile & Italian Marble', 'POP & False Ceiling', 'Painting'],
    about: 'Specialized in premium interior finishing and home extensions across Indore. Guaranteed timely delivery with transparent material bills.',
    languages: ['Hindi', 'English'],
    availability: 'Available Today',
    minBudget: '₹1,50,000',
    projects: [
      {
        id: 'p4',
        title: 'Modern Villa Interior & Elevation',
        location: 'Palasia, Indore',
        area: '2100 sq.ft',
        year: '2025',
        image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&auto=format&fit=crop&q=80'
      }
    ]
  }
];

export const INITIAL_WORKERS = [
  {
    id: 'work_1',
    userId: 'u_work_1',
    name: 'Raju Sharma',
    category: 'mason',
    profession: 'Master Mason / राजमिस्त्री',
    city: 'Nagpur',
    locality: 'Sitabuldi',
    rating: 4.8,
    reviewCount: 42,
    yearsExp: 7,
    dailyRate: 900,
    status: 'availableToday', // 'availableToday' | 'busy' | 'unavailable'
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    verified: {
      phone: true,
      identity: true,
      trade: true,
      business: false,
      project: true
    },
    languages: ['Hindi', 'Marathi'],
    skills: ['Brick Masonry', 'Plastering', 'Foundation Work', 'RCC Slab Casting', 'Lintel Work'],
    phone: '9850123456',
    whatsapp: '919850123456'
  },
  {
    id: 'work_2',
    userId: 'u_work_2',
    name: 'Mohan Lal Badhai',
    category: 'carpenter',
    profession: 'Carpenter / बढ़ई / सुतार',
    city: 'Mumbai',
    locality: 'Andheri East',
    rating: 4.9,
    reviewCount: 34,
    yearsExp: 10,
    dailyRate: 1100,
    status: 'availableToday',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    verified: {
      phone: true,
      identity: true,
      trade: true,
      business: false,
      project: true
    },
    languages: ['Hindi', 'Marathi', 'Gujarati'],
    skills: ['Door & Window Frames', 'Modular Kitchen Fitting', 'Wardrobe Making', 'Centering & Shuttering'],
    phone: '9860234567',
    whatsapp: '919860234567'
  },
  {
    id: 'work_3',
    userId: 'u_work_3',
    name: 'Santosh Yadav',
    category: 'electrician',
    profession: 'Licensed Electrician / वायरमन',
    city: 'Pune',
    locality: 'Wakad',
    rating: 4.7,
    reviewCount: 28,
    yearsExp: 6,
    dailyRate: 850,
    status: 'availableToday',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    verified: {
      phone: true,
      identity: true,
      trade: true,
      business: false,
      project: true
    },
    languages: ['Hindi', 'Marathi', 'English'],
    skills: ['Concealed House Wiring', 'MCB & Inverter Setup', 'Earthing Installation', 'LED Ceiling Fixtures'],
    phone: '9870345678',
    whatsapp: '919870345678'
  },
  {
    id: 'work_4',
    userId: 'u_work_4',
    name: 'Bablu Paswan',
    category: 'labour',
    profession: 'Construction Labour / दैनिक मज़दूर',
    city: 'Nagpur',
    locality: 'Wardha Road',
    rating: 4.6,
    reviewCount: 19,
    yearsExp: 4,
    dailyRate: 650,
    status: 'availableToday',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    verified: {
      phone: true,
      identity: true,
      trade: true,
      business: false,
      project: false
    },
    languages: ['Hindi'],
    skills: ['Concrete Mixing', 'Brick Carrying', 'Excavation & Trenching', 'Site Clearing', 'Debris Shifting'],
    phone: '9880456789',
    whatsapp: '919880456789'
  },
  {
    id: 'work_5',
    userId: 'u_work_5',
    name: 'Ganesh Thoke',
    category: 'plumber',
    profession: 'Master Plumber / प्लंबर',
    city: 'Bhopal',
    locality: 'MP Nagar',
    rating: 4.8,
    reviewCount: 31,
    yearsExp: 8,
    dailyRate: 950,
    status: 'busy',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    verified: {
      phone: true,
      identity: true,
      trade: true,
      business: false,
      project: true
    },
    languages: ['Hindi'],
    skills: ['CPVC & UPVC Piping', 'Overhead Tank Connection', 'Bathroom Sanitary Fittings', 'Leakage Diagnosis'],
    phone: '9890567890',
    whatsapp: '919890567890'
  },
  {
    id: 'work_6',
    userId: 'u_work_6',
    name: 'K. Murugan',
    category: 'tile_worker',
    profession: 'Tile & Granite Specialist / டைல்ஸ் மிஸ்திரி',
    city: 'Chennai',
    locality: 'Anna Nagar',
    rating: 4.9,
    reviewCount: 45,
    yearsExp: 11,
    dailyRate: 1000,
    status: 'availableToday',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80',
    verified: {
      phone: true,
      identity: true,
      trade: true,
      business: false,
      project: true
    },
    languages: ['Tamil', 'English'],
    skills: ['Vitrified Floor Tiles', 'Bathroom Wall Tiles', 'Granite Kitchen Platform', 'Laser Leveling & Grouting'],
    phone: '9840678901',
    whatsapp: '919840678901'
  }
];

export const INITIAL_LABOUR_POSTS = [
  {
    id: 'job_1',
    customerId: 'u_cust_1',
    customerName: 'Anand Deshmukh',
    customerPhone: '9822114455',
    category: 'mason',
    title: 'Need 2 Skilled Masons for Brick Wall Work',
    description: 'Constructing outer boundary brick wall (9-inch brickwork) and plastering. Mortar mixer is on site.',
    city: 'Nagpur',
    locality: 'Dharampeth',
    workersNeeded: 2,
    dailyRate: 1000,
    startDate: 'Tomorrow',
    startTime: '8:00 AM',
    duration: '2 Days',
    status: 'active',
    applicants: ['work_1'],
    createdAt: '2026-10-02'
  },
  {
    id: 'job_2',
    customerId: 'u_cust_1',
    customerName: 'Anand Deshmukh',
    customerPhone: '9822114455',
    category: 'labour',
    title: '4 Daily Helpers for Foundation Digging & Shifting',
    description: 'Excavation of trench for foundation and carrying sand and bricks to backyard.',
    city: 'Nagpur',
    locality: 'Trimurti Nagar',
    workersNeeded: 4,
    dailyRate: 700,
    startDate: '2026-10-04',
    startTime: '8:30 AM',
    duration: '1 Day',
    status: 'active',
    applicants: ['work_4'],
    createdAt: '2026-10-02'
  },
  {
    id: 'job_3',
    customerId: 'u_cust_2',
    customerName: 'Meera Subramanian',
    customerPhone: '9844556677',
    category: 'electrician',
    title: '1 Electrician for House Rewiring',
    description: 'Adding 4 new AC points and replacing distribution board switches.',
    city: 'Chennai',
    locality: 'Anna Nagar',
    workersNeeded: 1,
    dailyRate: 900,
    startDate: 'Tomorrow',
    startTime: '9:00 AM',
    duration: '1 Day',
    status: 'active',
    applicants: [],
    createdAt: '2026-10-02'
  }
];

export const INITIAL_QUOTATIONS = [
  {
    id: 'quote_1',
    customerId: 'u_cust_1',
    customerName: 'Anand Deshmukh',
    contractorId: 'cont_1',
    contractorName: 'Ramesh Kumar',
    projectScope: 'Build 1200 sq ft residential duplex house ground floor RCC + brick structure.',
    materialPreference: 'withMaterial',
    estimatedCost: '16,80,000',
    estimatedDuration: '90 Days',
    contractorNotes: 'Includes Ultratech Cement, Jindal TMT steel, red bricks, sand, and complete structural labour.',
    status: 'submitted',
    createdAt: '2026-10-01'
  }
];

export const INITIAL_REVIEWS = [
  {
    id: 'rev_1',
    targetType: 'contractor',
    targetId: 'cont_1',
    authorName: 'Sunil Agrawal',
    rating: 5,
    city: 'Nagpur',
    projectRef: 'Duplex in Trimurti Nagar',
    comment: 'Ramesh ji completed my 3BHK house within 5 months. Very transparent with material quality, daily progress photos on WhatsApp, and no hidden cost surprises.',
    date: '2026-09-15',
    verified: true,
    reported: false
  },
  {
    id: 'rev_2',
    targetType: 'worker',
    targetId: 'work_1',
    authorName: 'Pradeep Joshi',
    rating: 5,
    city: 'Nagpur',
    projectRef: 'Boundary Wall Construction',
    comment: 'Raju mistri is very punctual and skilled. Perfect line-dori work and solid plaster finish. Arrived at 8:00 AM sharp as committed.',
    date: '2026-09-22',
    verified: true,
    reported: false
  },
  {
    id: 'rev_3',
    targetType: 'contractor',
    targetId: 'cont_2',
    authorName: 'Amit Gokhale',
    rating: 5,
    city: 'Pune',
    projectRef: 'RCC Column & Slab Casting',
    comment: 'Dinesh Patil has a strong team of steel workers and shuttering karigars. Finished 2400 sq.ft slab casting in one day with test cubes checked.',
    date: '2026-09-10',
    verified: true,
    reported: false
  }
];
