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

const todayStr = new Date().toISOString().split('T')[0];

export const INITIAL_USERS = [
  {
    id: 'u_ravi_1',
    name: 'Ravi',
    phone: '9822114455',
    role: 'worker',
    city: 'Nagpur',
    preferredLanguage: 'hi',
    createdAt: todayStr
  }
];

export const INITIAL_CONTRACTORS = [
  {
    id: 'cont_1',
    userId: 'u_cont_1',
    name: 'Rajesh Sharma',
    businessName: 'Sharma & Sons Construction',
    profession: 'General Contractor',
    city: 'Nagpur',
    locality: 'Dharampeth',
    rating: 4.9,
    reviewCount: 38,
    yearsExp: 14,
    teamSize: '25+ Workers',
    completedProjects: 42,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    verified: { phone: true, identity: true, trade: true, business: true, project: true },
    services: ['Residential Building', 'Home Renovation', 'RCC Structure'],
    about: 'Certified civil thekedar with 14 years experience across Nagpur and Vidarbha. Turnkey construction with transparent material billing.',
    languages: ['Hindi', 'Marathi', 'English'],
    availability: 'Available for New Projects',
    minBudget: '₹2,50,000',
    phone: '9822001122',
    whatsapp: '919822001122',
    projects: []
  },
  {
    id: 'cont_2',
    userId: 'u_cont_2',
    name: 'Manoj Patil',
    businessName: 'Vidarbha Interior & Civil',
    profession: 'Renovation Contractor',
    city: 'Nagpur',
    locality: 'Sitabuldi',
    rating: 4.8,
    reviewCount: 24,
    yearsExp: 9,
    teamSize: '15 Workers',
    completedProjects: 29,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    verified: { phone: true, identity: true, trade: true, business: true, project: false },
    services: ['Tile & Granite', 'POP False Ceiling', 'Painting'],
    about: 'Specialist contractor in home renovations, modular spaces, and complete waterproofing.',
    languages: ['Hindi', 'Marathi'],
    availability: 'Available for New Projects',
    minBudget: '₹1,00,000',
    phone: '9822334455',
    whatsapp: '919822334455',
    projects: []
  }
];

export const INITIAL_WORKERS = [
  {
    id: 'work_1',
    userId: 'u_work_1',
    name: 'Ramesh Kumar Mistri',
    category: 'mason',
    profession: 'Senior Rajmistri',
    city: 'Nagpur',
    locality: 'Dharampeth',
    rating: 4.9,
    reviewCount: 47,
    yearsExp: 11,
    dailyRate: 950,
    status: 'availableToday',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    verified: { phone: true, identity: true, trade: true, business: false, project: false },
    languages: ['Hindi', 'Marathi'],
    skills: ['Brickwork', 'Plaster', 'Lintel Casting', 'Boundary Wall'],
    phone: '9822998877',
    whatsapp: '919822998877'
  },
  {
    id: 'work_2',
    userId: 'u_work_2',
    name: 'Santosh Yadav',
    category: 'tile_worker',
    profession: 'Tile & Granite Karigar',
    city: 'Nagpur',
    locality: 'Wardha Road',
    rating: 4.8,
    reviewCount: 31,
    yearsExp: 8,
    dailyRate: 1000,
    status: 'availableToday',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    verified: { phone: true, identity: true, trade: true, business: false, project: false },
    languages: ['Hindi'],
    skills: ['Vitrified Tiles', 'Marble Polishing', 'Kitchen Counter Granite'],
    phone: '9822445566',
    whatsapp: '919822445566'
  }
];

export const INITIAL_LABOUR_POSTS = [
  {
    id: 'job_today_1',
    customer_id: 'u_cust_101',
    customerId: 'u_cust_101',
    customer_name: 'सुरेश शर्मा (मकान मालिक)',
    customerName: 'सुरेश शर्मा (मकान मालिक)',
    customerPhone: '9822113344',
    category: 'mason',
    title: 'धरमपेठ में 2 राजमिस्त्री चाहिए - 9 इंच ईंट चिनाई और प्लास्टर कार्य',
    description: 'घर के पहले माले की दीवार और बाहरी प्लास्टर का काम है। मसाला और ईंटें साइट पर तैयार हैं। तुरंत काम शुरू करना है।',
    workers_needed: 2,
    workersNeeded: 2,
    daily_rate: 1000,
    dailyRate: 1000,
    start_date: todayStr,
    startDate: todayStr,
    start_time: '08:30 AM',
    startTime: '08:30 AM',
    city: 'Nagpur',
    locality: 'Dharampeth',
    status: 'active',
    applicants: []
  },
  {
    id: 'job_today_2',
    customer_id: 'u_cust_102',
    customerId: 'u_cust_102',
    customer_name: 'राजेश पाटिल (कंट्रैक्टर)',
    customerName: 'राजेश पाटिल (कंट्रैक्टर)',
    customerPhone: '9822556677',
    category: 'labour',
    title: 'सीताबरडी में 4 दैनिक मज़दूर चाहिए - मटेरियल शिफ्टिंग',
    description: 'सीमेंट बोरी और रेत तीसरी मंजिल पर ले जाना है। पूरा दिन का काम, दोपहर का चाय-नाश्ता दिया जाएगा।',
    workers_needed: 4,
    workersNeeded: 4,
    daily_rate: 750,
    dailyRate: 750,
    start_date: todayStr,
    startDate: todayStr,
    start_time: '09:00 AM',
    startTime: '09:00 AM',
    city: 'Nagpur',
    locality: 'Sitabuldi',
    status: 'active',
    applicants: []
  },
  {
    id: 'job_today_3',
    customer_id: 'u_cust_103',
    customerId: 'u_cust_103',
    customer_name: 'अमित वर्मा',
    customerName: 'अमित वर्मा',
    customerPhone: '9822778899',
    category: 'tile_worker',
    title: 'वर्धा रोड पर 2 टाइल मिस्त्री चाहिए - 600 sq ft फ्लोरिंग',
    description: 'हॉल और किचन में विट्रीफाइड टाइल फिटिंग का काम है। लेजर लेवल मशीन साइट पर उपलब्ध है।',
    workers_needed: 2,
    workersNeeded: 2,
    daily_rate: 1100,
    dailyRate: 1100,
    start_date: todayStr,
    startDate: todayStr,
    start_time: '09:00 AM',
    startTime: '09:00 AM',
    city: 'Nagpur',
    locality: 'Wardha Road',
    status: 'active',
    applicants: []
  }
];

export const INITIAL_QUOTATIONS = [];
export const INITIAL_REVIEWS = [];
