import {
  INITIAL_CITIES,
  INITIAL_USERS,
  INITIAL_CONTRACTORS,
  INITIAL_WORKERS,
  INITIAL_LABOUR_POSTS,
  INITIAL_QUOTATIONS,
  INITIAL_REVIEWS
} from './initialData';

const STORAGE_KEYS = {
  USERS: 'karvanta_db_users',
  CONTRACTORS: 'karvanta_db_contractors',
  WORKERS: 'karvanta_db_workers',
  LABOUR_POSTS: 'karvanta_db_labour_posts',
  QUOTATIONS: 'karvanta_db_quotations',
  REVIEWS: 'karvanta_db_reviews',
  NOTIFICATIONS: 'karvanta_db_notifications',
  AUDIT_LOGS: 'karvanta_db_audit_logs'
};

const getFromStorage = (key, defaultData) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from storage`, e);
  }
  try {
    localStorage.setItem(key, JSON.stringify(defaultData));
  } catch (e) {
    console.error(`Error writing default ${key} to storage`, e);
  }
  return defaultData;
};

const setToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to storage`, e);
  }
};

export const dbService = {
  // Cities
  getCities: () => INITIAL_CITIES,

  // Users
  getUsers: () => getFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS),

  getUserById: (id) => {
    const users = dbService.getUsers();
    return users.find(u => u.id === id);
  },

  getUserByPhone: (phone) => {
    const users = dbService.getUsers();
    return users.find(u => u.phone === phone);
  },

  registerUser: ({ name, phone, role, city, preferredLanguage = 'hi' }) => {
    const users = dbService.getUsers();
    const existing = users.find(u => u.phone === phone);
    if (existing) {
      return { success: false, message: 'Phone number already registered. Please login.' };
    }
    const newUser = {
      id: `u_${Date.now()}`,
      name,
      phone,
      role,
      city,
      preferredLanguage,
      createdAt: new Date().toISOString().split('T')[0]
    };
    users.push(newUser);
    setToStorage(STORAGE_KEYS.USERS, users);

    // If registered as contractor or worker, create default profile record
    if (role === 'contractor') {
      const contractors = dbService.getContractors();
      contractors.push({
        id: `cont_${Date.now()}`,
        userId: newUser.id,
        name: newUser.name,
        businessName: `${newUser.name} Construction`,
        profession: 'General Contractor',
        city: newUser.city || 'Nagpur',
        locality: 'Main City',
        rating: 5.0,
        reviewCount: 0,
        yearsExp: 2,
        teamSize: '5-10 Workers',
        completedProjects: 1,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        verified: { phone: true, identity: false, trade: false, business: false, project: false },
        services: ['Residential Construction', 'Renovation'],
        about: `Professional contractor serving ${newUser.city}. Dedicated to honest estimates and quality work.`,
        languages: ['Hindi'],
        availability: 'Available for New Projects',
        minBudget: '₹1,00,000',
        projects: []
      });
      setToStorage(STORAGE_KEYS.CONTRACTORS, contractors);
    } else if (role === 'worker') {
      const workers = dbService.getWorkers();
      workers.push({
        id: `work_${Date.now()}`,
        userId: newUser.id,
        name: newUser.name,
        category: 'mason',
        profession: 'Skilled Karigar',
        city: newUser.city || 'Nagpur',
        locality: 'Local Area',
        rating: 5.0,
        reviewCount: 0,
        yearsExp: 3,
        dailyRate: 850,
        status: 'availableToday',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        verified: { phone: true, identity: false, trade: false, business: false, project: false },
        languages: ['Hindi'],
        skills: ['General Masonry', 'Repair Work'],
        phone: newUser.phone,
        whatsapp: `91${newUser.phone}`
      });
      setToStorage(STORAGE_KEYS.WORKERS, workers);
    }

    dbService.addAuditLog('User Registered', `New ${role} registered: ${name} (${phone})`);
    return { success: true, user: newUser };
  },

  // Contractors
  getContractors: () => getFromStorage(STORAGE_KEYS.CONTRACTORS, INITIAL_CONTRACTORS),

  getContractorById: (id) => {
    const list = dbService.getContractors();
    return list.find(c => c.id === id || c.userId === id);
  },

  updateContractorProfile: (id, updates) => {
    const list = dbService.getContractors();
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      setToStorage(STORAGE_KEYS.CONTRACTORS, list);
      return list[idx];
    }
    return null;
  },

  // Workers
  getWorkers: () => getFromStorage(STORAGE_KEYS.WORKERS, INITIAL_WORKERS),

  getWorkerById: (id) => {
    const list = dbService.getWorkers();
    return list.find(w => w.id === id || w.userId === id);
  },

  updateWorkerStatus: (workerId, newStatus) => {
    const list = dbService.getWorkers();
    const idx = list.findIndex(w => w.id === workerId);
    if (idx !== -1) {
      list[idx].status = newStatus;
      setToStorage(STORAGE_KEYS.WORKERS, list);
      return list[idx];
    }
    return null;
  },

  updateWorkerProfile: (id, updates) => {
    const list = dbService.getWorkers();
    const idx = list.findIndex(w => w.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      setToStorage(STORAGE_KEYS.WORKERS, list);
      return list[idx];
    }
    return null;
  },

  // Labour Chowk / Job Posts
  getLabourPosts: () => getFromStorage(STORAGE_KEYS.LABOUR_POSTS, INITIAL_LABOUR_POSTS),

  createLabourPost: (postData) => {
    const posts = dbService.getLabourPosts();
    const newPost = {
      id: `job_${Date.now()}`,
      applicants: [],
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      ...postData
    };
    posts.unshift(newPost);
    setToStorage(STORAGE_KEYS.LABOUR_POSTS, posts);
    dbService.addAuditLog('Labour Post Created', `Post: ${newPost.title} in ${newPost.city}`);

    // Create notification for workers
    dbService.createNotification({
      targetRole: 'worker',
      title: 'New Labour Opportunity in ' + newPost.city,
      message: `${newPost.workersNeeded} workers needed: ${newPost.title} at ₹${newPost.dailyRate}/day`,
      link: '/labour-chowk'
    });

    return newPost;
  },

  applyForLabourPost: (postId, workerId) => {
    const posts = dbService.getLabourPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
      if (!post.applicants.includes(workerId)) {
        post.applicants.push(workerId);
        setToStorage(STORAGE_KEYS.LABOUR_POSTS, posts);
        dbService.addAuditLog('Labour Job Accepted', `Worker ${workerId} accepted job ${postId}`);
        
        // Notify customer
        dbService.createNotification({
          userId: post.customerId,
          title: 'Worker Accepted Your Work!',
          message: `A skilled worker has accepted your post "${post.title}". Check details in dashboard.`,
          link: '/dashboard'
        });
      }
      return { success: true, post };
    }
    return { success: false };
  },

  // Quotations
  getQuotations: () => getFromStorage(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS),

  createQuotationRequest: (quoteData) => {
    const quotes = dbService.getQuotations();
    const newQuote = {
      id: `quote_${Date.now()}`,
      status: 'requested',
      createdAt: new Date().toISOString().split('T')[0],
      ...quoteData
    };
    quotes.unshift(newQuote);
    setToStorage(STORAGE_KEYS.QUOTATIONS, quotes);

    // Notify contractor
    dbService.createNotification({
      targetId: quoteData.contractorId,
      title: 'New Quotation Request!',
      message: `${quoteData.customerName} requested an itemized quote for: ${quoteData.projectScope.slice(0, 60)}...`,
      link: '/dashboard'
    });

    return newQuote;
  },

  respondToQuotation: (quoteId, { estimatedCost, estimatedDuration, contractorNotes }) => {
    const quotes = dbService.getQuotations();
    const quote = quotes.find(q => q.id === quoteId);
    if (quote) {
      quote.estimatedCost = estimatedCost;
      quote.estimatedDuration = estimatedDuration;
      quote.contractorNotes = contractorNotes;
      quote.status = 'submitted';
      setToStorage(STORAGE_KEYS.QUOTATIONS, quotes);

      // Notify customer
      dbService.createNotification({
        userId: quote.customerId,
        title: 'Quotation Received!',
        message: `${quote.contractorName} submitted quote of ₹${estimatedCost} for your project.`,
        link: '/dashboard'
      });

      return quote;
    }
    return null;
  },

  // Reviews
  getReviews: (targetType = null, targetId = null) => {
    let reviews = getFromStorage(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    if (targetType) {
      reviews = reviews.filter(r => r.targetType === targetType);
    }
    if (targetId) {
      reviews = reviews.filter(r => r.targetId === targetId);
    }
    return reviews;
  },

  addReview: (reviewData) => {
    const reviews = dbService.getReviews();
    const newRev = {
      id: `rev_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      verified: true,
      reported: false,
      ...reviewData
    };
    reviews.unshift(newRev);
    setToStorage(STORAGE_KEYS.REVIEWS, reviews);

    // Recalculate target average rating & review count
    if (newRev.targetType === 'contractor') {
      const contractors = dbService.getContractors();
      const cont = contractors.find(c => c.id === newRev.targetId);
      if (cont) {
        const contReviews = reviews.filter(r => r.targetType === 'contractor' && r.targetId === cont.id && !r.reported);
        const avg = contReviews.reduce((acc, r) => acc + r.rating, 0) / contReviews.length;
        cont.rating = parseFloat(avg.toFixed(1));
        cont.reviewCount = contReviews.length;
        setToStorage(STORAGE_KEYS.CONTRACTORS, contractors);
      }
    } else if (newRev.targetType === 'worker') {
      const workers = dbService.getWorkers();
      const w = workers.find(work => work.id === newRev.targetId);
      if (w) {
        const wReviews = reviews.filter(r => r.targetType === 'worker' && r.targetId === w.id && !r.reported);
        const avg = wReviews.reduce((acc, r) => acc + r.rating, 0) / wReviews.length;
        w.rating = parseFloat(avg.toFixed(1));
        w.reviewCount = wReviews.length;
        setToStorage(STORAGE_KEYS.WORKERS, workers);
      }
    }

    dbService.addAuditLog('New Review Added', `Review by ${newRev.authorName} for ${newRev.targetType} ${newRev.targetId}`);
    return newRev;
  },

  reportReview: (reviewId, reason = 'Flagged as suspicious') => {
    const reviews = dbService.getReviews();
    const rev = reviews.find(r => r.id === reviewId);
    if (rev) {
      rev.reported = true;
      rev.reportReason = reason;
      setToStorage(STORAGE_KEYS.REVIEWS, reviews);
      dbService.addAuditLog('Review Reported', `Review ${reviewId} flagged: ${reason}`);
      return true;
    }
    return false;
  },

  moderateReview: (reviewId, action) => { // 'dismiss' | 'delete'
    const reviews = dbService.getReviews();
    if (action === 'delete') {
      const updated = reviews.filter(r => r.id !== reviewId);
      setToStorage(STORAGE_KEYS.REVIEWS, updated);
      dbService.addAuditLog('Review Deleted by Admin', `Review ID: ${reviewId}`);
    } else if (action === 'dismiss') {
      const rev = reviews.find(r => r.id === reviewId);
      if (rev) rev.reported = false;
      setToStorage(STORAGE_KEYS.REVIEWS, reviews);
      dbService.addAuditLog('Review Report Dismissed', `Review ID: ${reviewId}`);
    }
    return true;
  },

  // Admin Verification Tiers
  updateVerificationTier: (targetType, targetId, tier, value) => {
    if (targetType === 'contractor') {
      const contractors = dbService.getContractors();
      const c = contractors.find(item => item.id === targetId);
      if (c && c.verified) {
        c.verified[tier] = value;
        setToStorage(STORAGE_KEYS.CONTRACTORS, contractors);
        dbService.addAuditLog('Contractor Verification Updated', `${c.name} tier [${tier}] set to ${value}`);
        return c;
      }
    } else if (targetType === 'worker') {
      const workers = dbService.getWorkers();
      const w = workers.find(item => item.id === targetId);
      if (w && w.verified) {
        w.verified[tier] = value;
        setToStorage(STORAGE_KEYS.WORKERS, workers);
        dbService.addAuditLog('Worker Verification Updated', `${w.name} tier [${tier}] set to ${value}`);
        return w;
      }
    }
    return null;
  },

  // Notifications
  getNotifications: (userId = null) => {
    const notifs = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: 'notif_1',
        title: 'Welcome to Karvanta!',
        message: 'Explore verified thekedars and karigars in your area with zero middleman fee.',
        date: '2026-10-02',
        read: false
      }
    ]);
    if (userId) {
      return notifs.filter(n => !n.userId || n.userId === userId);
    }
    return notifs;
  },

  createNotification: (data) => {
    const notifs = dbService.getNotifications();
    const newNotif = {
      id: `notif_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      read: false,
      ...data
    };
    notifs.unshift(newNotif);
    setToStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return newNotif;
  },

  // Audit Logs
  getAuditLogs: () => {
    return getFromStorage(STORAGE_KEYS.AUDIT_LOGS, [
      { id: 'log_1', action: 'System Init', details: 'Karvanta Marketplace database initialized', timestamp: new Date().toLocaleString() }
    ]);
  },

  addAuditLog: (action, details) => {
    const logs = dbService.getAuditLogs();
    logs.unshift({
      id: `log_${Date.now()}`,
      action,
      details,
      timestamp: new Date().toLocaleString('en-IN')
    });
    if (logs.length > 100) logs.pop();
    setToStorage(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  // Analytics
  getAnalytics: () => {
    const users = dbService.getUsers();
    const contractors = dbService.getContractors();
    const workers = dbService.getWorkers();
    const jobs = dbService.getLabourPosts();
    const reviews = dbService.getReviews();

    return {
      totalUsers: users.length,
      customersCount: users.filter(u => u.role === 'customer').length,
      contractorsCount: contractors.length,
      workersCount: workers.length,
      activeJobs: jobs.filter(j => j.status === 'active').length,
      completedJobs: 48,
      pendingVerifications: workers.filter(w => !w.verified.identity).length + contractors.filter(c => !c.verified.identity).length,
      reportedReviews: reviews.filter(r => r.reported).length
    };
  }
};
