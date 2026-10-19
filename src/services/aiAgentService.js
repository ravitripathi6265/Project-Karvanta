import { dbService } from '../db/databaseService';
import { supabase } from '../lib/supabase';

// Language codes to speech synthesis and recognition locales
export const LANG_SPEECH_MAP = {
  hi: { locale: 'hi-IN', name: 'हिन्दी', voiceQuery: ['hi-IN', 'Hindi', 'हिन्दी'] },
  mr: { locale: 'mr-IN', name: 'मराठी', voiceQuery: ['mr-IN', 'Marathi', 'मराठी', 'hi-IN'] },
  ta: { locale: 'ta-IN', name: 'தமிழ்', voiceQuery: ['ta-IN', 'Tamil', 'தமிழ்'] },
  te: { locale: 'te-IN', name: 'తెలుగు', voiceQuery: ['te-IN', 'Telugu', 'తెలుగు'] },
  bn: { locale: 'bn-IN', name: 'বাংলা', voiceQuery: ['bn-IN', 'Bengali', 'বাংলা'] },
  gu: { locale: 'gu-IN', name: 'ગુજરાતી', voiceQuery: ['gu-IN', 'Gujarati', 'ગુજરાતી'] },
  kn: { locale: 'kn-IN', name: 'ಕನ್ನಡ', voiceQuery: ['kn-IN', 'Kannada', 'ಕನ್ನಡ'] },
  ml: { locale: 'ml-IN', name: 'മലയാളം', voiceQuery: ['ml-IN', 'Malayalam', 'മലയാളം'] },
  pa: { locale: 'pa-IN', name: 'ਪੰਜਾਬੀ', voiceQuery: ['pa-IN', 'Punjabi', 'ਪੰਜਾਬੀ'] },
  or: { locale: 'or-IN', name: 'ଓଡ଼ିଆ', voiceQuery: ['or-IN', 'Odia', 'hi-IN'] },
  as: { locale: 'as-IN', name: 'অসমীয়া', voiceQuery: ['as-IN', 'Assamese', 'bn-IN', 'hi-IN'] },
  en: { locale: 'en-IN', name: 'English', voiceQuery: ['en-IN', 'en-GB', 'en-US', 'English'] }
};

// Extracts actual user profile first name dynamically (No hardcoded fallback!)
export const getProfileFirstName = (currentUser) => {
  if (!currentUser) return null;
  const raw = currentUser.full_name || currentUser.name || currentUser.user_metadata?.full_name || '';
  if (raw && raw.trim()) {
    return raw.trim().split(' ')[0]; // E.g., "Mohan", "Ramesh", "Suresh"
  }
  return 'साथी';
};

// Converts currency and numbers to spoken words for natural human pronunciation
export const toNaturalSpokenText = (text, langCode = 'hi') => {
  if (!text) return '';
  let cleaned = text
    .replace(/[#*`_~]/g, '')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

  if (langCode === 'hi' || langCode === 'mr') {
    cleaned = cleaned
      .replace(/₹\s*1000/g, 'एक हज़ार रुपये')
      .replace(/₹\s*1500/g, 'पंद्रह सौ रुपये')
      .replace(/₹\s*1200/g, 'बारह सौ रुपये')
      .replace(/₹\s*850/g, 'साढ़े आठ सौ रुपये')
      .replace(/₹\s*800/g, 'आठ सौ रुपये')
      .replace(/₹\s*750/g, 'साढ़े सात सौ रुपये')
      .replace(/₹\s*700/g, 'सात सौ रुपये')
      .replace(/₹\s*600/g, 'छह सौ रुपये')
      .replace(/₹\s*500/g, 'पाँच सौ रुपये')
      .replace(/₹\s*(\d+)/g, '$1 रुपये');
  } else if (langCode === 'en') {
    cleaned = cleaned
      .replace(/₹\s*1000/g, 'one thousand rupees')
      .replace(/₹\s*1500/g, 'fifteen hundred rupees')
      .replace(/₹\s*1200/g, 'twelve hundred rupees')
      .replace(/₹\s*850/g, 'eight hundred and fifty rupees')
      .replace(/₹\s*800/g, 'eight hundred rupees')
      .replace(/₹\s*750/g, 'seven hundred and fifty rupees')
      .replace(/₹\s*700/g, 'seven hundred rupees')
      .replace(/₹\s*600/g, 'six hundred rupees')
      .replace(/₹\s*500/g, 'five hundred rupees')
      .replace(/₹\s*(\d+)/g, '$1 rupees');
  } else if (langCode === 'gu') {
    cleaned = cleaned
      .replace(/₹\s*1000/g, 'એક હજાર રૂપિયા')
      .replace(/₹\s*750/g, 'સાતસો પચાસ રૂપિયા')
      .replace(/₹\s*(\d+)/g, '$1 રૂપિયા');
  }

  return cleaned.replace(/\s+/g, ' ').trim();
};

// Text-to-Speech Engine with Neural Voice Selection
export const speakText = (text, langCode = 'hi', onStart = null, onEnd = null) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return null;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const spokenText = toNaturalSpokenText(text, langCode);
  if (!spokenText) return null;

  const utterance = new SpeechSynthesisUtterance(spokenText);
  const targetMeta = LANG_SPEECH_MAP[langCode] || LANG_SPEECH_MAP.hi;
  utterance.lang = targetMeta.locale;
  utterance.rate = 0.98; // Natural, conversational, calm tempo like Google Gemini
  utterance.pitch = 1.0;

  // Select top high-quality natural voice if available
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    const naturalVoice = voices.find(v => {
      const matchesLang = targetMeta.voiceQuery.some(q => 
        (v.lang && v.lang.toLowerCase().includes(q.toLowerCase())) ||
        (v.name && v.name.toLowerCase().includes(q.toLowerCase()))
      );
      const isNatural = v.name.toLowerCase().includes('natural') || 
                        v.name.toLowerCase().includes('online') || 
                        v.name.toLowerCase().includes('google');
      return matchesLang && isNatural;
    });

    const standardVoice = voices.find(v => {
      return targetMeta.voiceQuery.some(q => 
        (v.lang && v.lang.toLowerCase().includes(q.toLowerCase())) ||
        (v.name && v.name.toLowerCase().includes(q.toLowerCase()))
      );
    });

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    } else if (standardVoice) {
      utterance.voice = standardVoice;
    }
  }

  // Prevent Chrome from garbage-collecting active utterance
  window.__currentUtterance = utterance;

  let hasEnded = false;
  const safeEnd = () => {
    if (!hasEnded) {
      hasEnded = true;
      window.__currentUtterance = null;
      if (onEnd) onEnd();
    }
  };

  if (onStart) utterance.onstart = onStart;
  utterance.onend = safeEnd;
  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    safeEnd();
  };

  window.speechSynthesis.speak(utterance);
  return utterance;
};

export const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    window.__currentUtterance = null;
  }
};

// Continuous Speech Recognition with natural conversational silence detection
export const createSpeechRecognizer = (
  langCode = 'hi',
  onResult,
  onError,
  onEnd,
  onInterim = null
) => {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  const targetMeta = LANG_SPEECH_MAP[langCode] || LANG_SPEECH_MAP.hi;
  recognition.lang = targetMeta.locale;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  let silenceTimer = null;
  let accumulatedSpeech = '';

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        accumulatedSpeech += ' ' + event.results[i][0].transcript;
      } else {
        interim += event.results[i][0].transcript;
      }
    }

    const currentCombined = (accumulatedSpeech + ' ' + interim).trim();

    if (currentCombined) {
      if (onInterim) {
        onInterim(currentCombined);
      }

      // Reset conversational turn debounce timer
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }

      // 500ms natural conversational pause detection (quick response like Gemini Live)
      silenceTimer = setTimeout(() => {
        const textToSend = (accumulatedSpeech + ' ' + interim).trim();
        accumulatedSpeech = '';
        if (textToSend && onResult) {
          onResult(textToSend);
        }
      }, 500);
    }
  };

  recognition.onerror = (event) => {
    console.warn('Speech recognition notice:', event.error);
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    // If user spoke before recognition ended, flush and send immediately!
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      silenceTimer = null;
      const textToSend = accumulatedSpeech.trim();
      accumulatedSpeech = '';
      if (textToSend && onResult) {
        onResult(textToSend);
      }
    }
    if (onEnd) onEnd();
  };

  return recognition;
};

// Google Gemini 3.8 Flash Conversational API Helper
export const callGeminiLiveApi = async (prompt, systemInstruction, apiKey) => {
  const activeKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  if (!activeKey) return null;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${activeKey}`;
    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 120
      }
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      console.warn('Gemini response notice:', res.status);
      return null;
    }
    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const textPart = parts.find(p => p.text && !p.thought) || parts[parts.length - 1];
    const candidateText = textPart?.text || '';
    return candidateText ? candidateText.replace(/[*#`_~]/g, '').trim() : null;
  } catch (err) {
    console.warn('Gemini API notice:', err);
    return null;
  }
};

// ========================================================
// COMPLETE MULTILINGUAL CONVERSATIONAL ENGINE (12 LANGUAGES)
// ========================================================
export const LOCALIZED_RESPONSES = {
  hi: {
    needsLogin: 'नमस्ते! करवंता साथी से बात करने और आज का काम खोजने या स्वीकार करने के लिए, कृपया पहले लॉगिन करें।',
    twoJobsGreeting: (name, j1, r1, loc1, j2, r2, loc2) =>
      `अरे ${name}! आज तुम्हारे लिए 2 बढ़िया काम हैं: पहला, ${loc1} में ${j1}, ₹${r1} दिहाड़ी पर। और दूसरा, ${loc2} में ${j2}, ₹${r2} पर। तुम्हें इनमें से कौन सा काम करना है?`,
    oneJobGreeting: (name, j1, r1, loc) =>
      `अरे ${name}! आज तुम्हारे लिए ${loc} में ${j1} का काम है, ₹${r1} दिहाड़ी है। क्या मैं तुम्हारी बात पक्की करा दूँ?`,
    noJobs: (name) =>
      `नमस्ते ${name}! मैं आपका करवंता साथी हूँ। आप बोलकर आज का काम पा सकते हैं, नया काम पोस्ट कर सकते हैं या ठेकेदार खोज सकते हैं। बताइए आज क्या काम करना है?`,
    jobAccepted: (name, jobTitle, custName) =>
      `शानदार ${name}! मैंने "${jobTitle}" के लिए तुम्हारी बात पक्की कर दी है। ${custName} के डैशबोर्ड पर तुम्हारा नाम और नंबर पहुँच गया है, वो तुम्हें सीधे कॉल कर लेंगे। और बताओ, सब बढ़िया?`,
    jobRejected: (name, altTitle, r, loc) =>
      `कोई बात नहीं ${name}! ${loc} में "${altTitle}" भी है, ₹${r} दिहाड़ी है। क्या इसमें बात कराऊँ?`,
    noMoreJobs: (name) =>
      `नागपुर में अभी यही मुख्य काम थे ${name}। तुम चाहो तो लेबर चौक खोलकर देख सकते हो या नया काम पोस्ट कर सकते हो।`,
    jobDeleted: (name, title) =>
      `तुम्हारा काम "${title}" मैंने तुरंत डिलीट कर दिया है ${name}, निश्चिंत रहो! और कुछ काम बताना है?`,
    noPostsToDelete: (name) =>
      `तुम्हारे खाते में अभी कोई पोस्ट किया हुआ काम नहीं मिला ${name}। अगर नया काम पोस्ट करना हो तो मुझे बता देना!`,
    greeting: (name) =>
      `राम राम ${name}! मैं एकदम फर्स्ट क्लास हूँ। तुम बताओ, क्या हाल-चाल? आज काम पर जाने का विचार है या कोई नया काम ढूंढ रहे हो?`,
    whoAreYou: () =>
      `अरे भाई, मैं तुम्हारा करवंता साथी हूँ! तुम्हारा अपना डिजिटल मददगार जो तुम्हें बिना किसी दलाली के सीधे ठेकेदारों और काम से जोड़ता है। बताओ आज क्या सेवा करूँ?`,
    paymentInfo: () =>
      `दिहाड़ी रोज शाम को काम खत्म होते ही ठेकेदार सीधे नकद या यूपीआई से देता है भाई। कोई बीच में कमीशन नहीं कटता!`,
    locationInfo: () =>
      `नागपुर में अभी धरमपेठ, सीताबरडी, सदर और वाडी में काम चालू हैं भाई। तुम्हें कौन सा इलाका पास पड़ेगा?`,
    gratitude: (name) =>
      `अरे धन्यवाद की कोई बात नहीं ${name}! अपना ही काम समझो। बस मन लगाकर काम करो और कभी भी जरूरत हो तो मुझे बोल देना।`,
    postWork: () =>
      `हाँ बिल्कुल! कितने मजदूर चाहिए और क्या काम है, मुझे यहीं बोलकर बता दो या पोस्ट पेज खोल लो, मैं तुरंत लगा दूंगा!`,
    contractors: () =>
      `नागपुर में रमेश बिल्डर्स और गुप्ता कंस्ट्रक्शन उपलब्ध हैं भाई। बोलो तो इनसे सीधे बात करा दूँ?`,
    help: (name) =>
      `अरे कोई चिंता की बात नहीं ${name}! तुम्हें कुछ पढ़ना-लिखना नहीं है, बस जैसे फोन पर मुझसे बात कर रहे हो वैसे बोलते रहो, सारा काम मैं खुद कर दूंगा!`,
    fallback: (name) =>
      `अरे ${name}! मैं तुम्हारी बात समझ गया। तुम बस बोल दो — 'आज का काम बताओ', 'मुझे काम से जोड़ दो', 'मेरा काम हटा दो' या 'ठेकेदार खोजो'।`,
    labels: {
      accept1: (title, rate) => `🤝 ${title.slice(0, 20)} (₹${rate})`,
      accept2: (title, rate) => `🤝 ${title.slice(0, 20)} (₹${rate})`,
      findJobs: '🎯 आज का काम बताओ',
      deleteJob: '🗑️ मेरा काम डिलीट करो',
      postJob: '📝 नया काम पोस्ट करो',
      contractors: '🏗️ ठेकेदार ढूंढो',
      login: '🔑 लॉगिन करें (Login Now)',
      chowk: '📍 लेबर चौक देखें',
      dashboard: '👤 मेरा डैशबोर्ड'
    }
  },
  en: {
    needsLogin: 'Hello! To talk with Karvanta Saathi and find or accept today’s work, please log in first.',
    twoJobsGreeting: (name, j1, r1, loc1, j2, r2, loc2) =>
      `Hey ${name}! There are 2 great opportunities available today: First, ${j1} in ${loc1} at ₹${r1} per day. And second, ${j2} in ${loc2} at ₹${r2} per day. Which one would you like to take up?`,
    oneJobGreeting: (name, j1, r1, loc) =>
      `Hey ${name}! I found an opportunity for you today: ${j1} in ${loc} at ₹${r1} per day. Should I connect you right now?`,
    noJobs: (name) =>
      `Hello ${name}! I am your Karvanta Saathi voice assistant. Speak freely to find daily jobs, post work requirements, or connect with contractors.`,
    jobAccepted: (name, jobTitle, custName) =>
      `Awesome ${name}! I have confirmed your spot for "${jobTitle}". Your name and phone number have been sent directly to ${custName}'s dashboard, and they will call you shortly. Anything else I can help with?`,
    jobRejected: (name, altTitle, r, loc) =>
      `No problem ${name}! We also have "${altTitle}" in ${loc} at ₹${r}/day. Should I connect you to this one?`,
    noMoreJobs: (name) =>
      `Those were the primary active jobs in Nagpur today, ${name}. You can explore the Labour Chowk feed or post a requirement anytime.`,
    jobDeleted: (name, title) =>
      `I have deleted your task "${title}" right away, ${name}. Don't worry at all! Can I help with anything else?`,
    noPostsToDelete: (name) =>
      `You don't have any active posted jobs right now, ${name}. Let me know if you would like to post new work!`,
    greeting: (name) =>
      `Hello ${name}! I am doing great. How are you doing today? Looking for daily work or need to hire workers?`,
    whoAreYou: () =>
      `I am Karvanta Saathi, your personal voice companion! I connect workers and contractors directly across Nagpur without any middleman commission. How can I help today?`,
    paymentInfo: () =>
      `Daily wages are paid directly to you in cash or UPI by the contractor every evening upon work completion. Zero commission is deducted!`,
    locationInfo: () =>
      `Currently, active work is happening in Dharampeth, Sitabuldi, Sadar, and Wadi in Nagpur. Which locality suits you best?`,
    gratitude: (name) =>
      `You're most welcome, ${name}! Do your work with dedication, and call on me anytime you need anything!`,
    postWork: () =>
      `Yes, absolutely! Tell me how many workers and which trade you need, or open the Post Work page, and I will publish it immediately!`,
    contractors: () =>
      `Top verified contractors like Sharma & Sons and Vidarbha Civil are available today in Nagpur. Would you like me to connect you?`,
    help: (name) =>
      `Don't worry at all, ${name}! You don't need to read or type anything. Just speak to me like a phone call, and I will handle everything for you!`,
    fallback: (name) =>
      `Hey ${name}! I'm listening. You can simply say — 'Show today's jobs', 'Connect me to work', 'Delete my task', or 'Find contractors'.`,
    labels: {
      accept1: (title, rate) => `🤝 Job 1: ${title.slice(0, 18)} (₹${rate})`,
      accept2: (title, rate) => `🤝 Job 2: ${title.slice(0, 18)} (₹${rate})`,
      findJobs: "🎯 Show Today's Work",
      deleteJob: '🗑️ Delete My Task',
      postJob: '📝 Post New Requirement',
      contractors: '🏗️ Find Contractors',
      login: '🔑 Login Now',
      chowk: '📍 View Labour Chowk',
      dashboard: '👤 My Dashboard'
    }
  },
  mr: {
    needsLogin: 'नमस्कार! करवंता साथीशी बोलण्यासाठी आणि आजचे काम शोधण्यासाठी किंवा स्वीकारण्यासाठी, कृपया आधी लॉगिन करा.',
    twoJobsGreeting: (name, j1, r1, loc1, j2, r2, loc2) =>
      `अरे ${name}! आज तुझ्यासाठी २ उत्तम कामे आहेत: पहिलं, ${loc1} मध्ये ${j1}, ₹${r1} रोजंदारीवर. आणि दुसरं, ${loc2} मध्ये ${j2}, ₹${r2} वर. तुला यापैकी कोणते काम करायचे आहे?`,
    oneJobGreeting: (name, j1, r1, loc) =>
      `अरे ${name}! आज तुझ्यासाठी ${loc} मध्ये ${j1} आहे, ₹${r1} रोजंदारी आहे. तुला काम करायचं असेल तर सांग, मी थेट कनेक्ट करून देऊ का?`,
    noJobs: (name) =>
      `नमस्कार ${name}! मी तुझा करवंता साथी आहे. सांग आज काय काम शोधायचं किंवा पोस्ट करायचं?`,
    jobAccepted: (name, jobTitle, custName) =>
      `छान ${name}! मी "${jobTitle}" साठी तुझी जागा पक्की केली आहे. ${custName} च्या डॅशबोर्डवर तुझे नाव आणि फोन नंबर पोहोचला आहे, ते तुला थेट फोन करतील. आणखी काही हवे आहे का?`,
    jobRejected: (name, altTitle, r, loc) =>
      `काही हरकत नाही ${name}! ${loc} मध्ये "${altTitle}" सुद्धा उपलब्ध आहे, रोजंदारी ₹${r} आहे. यात नाव जोडून देऊ का?`,
    noMoreJobs: (name) =>
      `नागपूरमध्ये सध्या हीच मुख्य कामे उपलब्ध होती ${name}. तू लेबर चौक पाहू शकतोस किंवा नवीन काम पोस्ट करू शकतोस.`,
    jobDeleted: (name, title) =>
      `मी तुझे "${title}" हे काम लगेच काढून टाकले आहे ${name}, काळजी करू नकोस! आणखी काही काम आहे का?`,
    noPostsToDelete: (name) =>
      `तुझ्या खात्यात सध्या कोणतेही पोस्ट केलेले काम नाही ${name}. नवीन काम पोस्ट करायचे असल्यास सांग!`,
    greeting: (name) =>
      `नमस्कार ${name}! मी एकदम मजेत आहे. तू कसा आहेस? आज कामावर जायचा विचार आहे की नवीन काम शोधत आहेस?`,
    whoAreYou: () =>
      `मी तुझा करवंता साथी आहे! कोणत्याही दलालीशिवाय तुला थेट ठेकेदार आणि कामाशी जोडणारा तुझा डिजिटल मित्र. सांग आज काय काम करू?`,
    paymentInfo: () =>
      `रोजंदारी दररोज संध्याकाळी काम संपल्यावर ठेकेदार थेट रोख किंवा यूपीआयने देतो. कोणताही कमिशन कट होत नाही!`,
    locationInfo: () =>
      `नागपूरमध्ये सध्या धरमपेठ, सीताबर्डी, सदर आणि वाडीमध्ये कामे सुरू आहेत. तुला कोणता भाग जवळ पडेल?`,
    gratitude: (name) =>
      `अरे आभाराची काही गरज नाही ${name}! आपलेच काम समजा. मन लावून काम करा आणि गरज असेल तेव्हा मला सांगा!`,
    postWork: () =>
      `हो नक्कीच! किती मजूर हवे आहेत आणि काय काम आहे, मला इथेच सांग किंवा काम पोस्ट करण्याचे पेज उघडा!`,
    contractors: () =>
      `नागपूरमध्ये नामांकित कंत्राटदार उपलब्ध आहेत. त्यांच्याशी थेट संपर्क करून देऊ का?`,
    help: (name) =>
      `काळजी करू नकोस ${name}! तुला काही वाचायची-लिहायची गरज नाही, फोनवर बोलल्यासारखे बोल, सर्व काम मी करून देईन!`,
    fallback: (name) =>
      `अरे ${name}! तू फक्त बोल — 'आजचे काम सांगा', 'मला कामाशी जोडा', 'माझे काम हटवा' किंवा 'कंत्राटदार शोधा'.`,
    labels: {
      accept1: (title, rate) => `🤝 ${title.slice(0, 18)} (₹${rate})`,
      accept2: (title, rate) => `🤝 ${title.slice(0, 18)} (₹${rate})`,
      findJobs: '🎯 आजचे काम सांगा',
      deleteJob: '🗑️ माझे काम हटवा',
      postJob: '📝 नवीन काम पोस्ट करा',
      contractors: '🏗️ कंत्राटदार शोधा',
      login: '🔑 लॉगिन करा (Login)',
      chowk: '📍 लेबर चौक पहा',
      dashboard: '👤 माझा डॅशबोर्ड'
    }
  },
  gu: {
    needsLogin: 'નમસ્તે! કરવંતા સાથી સાથે વાત કરવા અને આજનું કામ શોધવા કે પાકું કરવા માટે, કૃપા કરીને પહેલાં લોગિન કરો.',
    twoJobsGreeting: (name, j1, r1, loc1, j2, r2, loc2) =>
      `અરે ${name}! આજે તારા માટે ૨ સરસ કામ છે: પહેલું, ${loc1} માં ${j1}, ₹${r1} દૈનિક વેતન પર. અને બીજું, ${loc2} માં ${j2}, ₹${r2} પર. તારે આમાંથી કયું કામ કરવું છે?`,
    oneJobGreeting: (name, j1, r1, loc) =>
      `અરે ${name}! આજે તારા માટે ${loc} માં ${j1} નું કામ છે, ₹${r1} દૈનિક છે. શું હું તારી વાત પાકી કરાવી દઉં?`,
    noJobs: (name) =>
      `નમસ્તે ${name}! હું તારો કરવંતા સાથી છું. બોલીને કામ શોધો, નવું કામ મૂકો અથવા કોન્ટ્રાક્ટર શોધો. જણાવો શું કામ છે?`,
    jobAccepted: (name, jobTitle, custName) =>
      `ખૂબ સરસ ${name}! મેં "${jobTitle}" માટે તારું કામ પાકું કરી દીધું છે. ${custName} ના ડેશબોર્ડ પર તારું નામ અને નંબર પહોંચી ગયો છે, તે તને સીધો ફોન કરશે. બીજું કંઈ કામ છે?`,
    jobRejected: (name, altTitle, r, loc) =>
      `કાંઈ વાંધો નહીં ${name}! ${loc} માં "${altTitle}" પણ છે, ₹${r} દૈનિક છે. શું એમાં વાત કરાવું?`,
    noMoreJobs: (name) =>
      `નાગપુરમાં અત્યારે આ મુખ્ય કામ હતા ${name}. તમે લેબર ચોક જોઈ શકો છો અથવા નવું કામ મૂકી શકો છો.`,
    jobDeleted: (name, title) =>
      `મેં તારું "${title}" કામ તરત જ ડિલીટ કરી દીધું છે ${name}, ચિંતા ન કરશો! બીજું કંઈ કામ છે?`,
    noPostsToDelete: (name) =>
      `તમારા ખાતામાં અત્યારે કોઈ પોસ્ટ કરેલું કામ નથી ${name}. નવું કામ મૂકવું હોય તો જણાવજો!`,
    greeting: (name) =>
      `કેમ છો ${name}! હું એકદમ મજામાં છું. તમે કેમ છો? આજે કામે જવાનું છે કે નવું કામ શોધો છો?`,
    whoAreYou: () =>
      `હું તમારો કરવંતા સાથી છું! કોઈપણ દલાલી વગર સીધા કોન્ટ્રાક્ટર અને કામ સાથે જોડનાર તમારો ડિજિટલ મદદગાર. બોલો આજે શું સેવા કરું?`,
    paymentInfo: () =>
      `દૈનિક વેતન દરરોજ સાંજે કામ પૂરું થતાં કોન્ટ્રાક્ટર રોકડા કે યુપીઆઈથી સીધું આપે છે. કોઈ કમિશન કપાતું નથી!`,
    locationInfo: () =>
      `નાગપુરમાં અત્યારે ધરમપેઠ, સીતાબર્ડી, સદર અને વાડીમાં કામ ચાલુ છે. તમને કયો વિસ્તાર નજીક પડશે?`,
    gratitude: (name) =>
      `આભારની કોઈ જરૂર નથી ${name}! પોતાનું જ કામ સમજો. મન લગાવીને કામ કરો અને જરૂર પડે ત્યારે મને બોલાવો!`,
    postWork: () =>
      `હા ચોક્કસ! કેટલા મજૂર જોઈએ છે અને શું કામ છે, મને અહીં જ બોલીને કહો, હું તરત જ મૂકી દઈશ!`,
    contractors: () =>
      `નાગપુરમાં ટોચના વિશ્વસનીય કોન્ટ્રાક્ટર્સ ઉપલબ્ધ છે. શું તેમની સાથે સીધી વાત કરાવું?`,
    help: (name) =>
      `કોઈ ચિંતા ન કરો ${name}! તમારે કંઈ વાંચવા-લખવાની જરૂર નથી, બસ ફોન પર વાત કરતા હોવ તેમ બોલો, બધું કામ હું કરી દઈશ!`,
    fallback: (name) =>
      `અરે ${name}! તમે બસ બોલો — 'આજનું કામ બતાવો', 'કામ સાથે જોડો', 'કામ હટાવો' અથવા 'કોન્ટ્રાક્ટર શોધો'.`,
    labels: {
      accept1: (title, rate) => `🤝 ${title.slice(0, 18)} (₹${rate})`,
      accept2: (title, rate) => `🤝 ${title.slice(0, 18)} (₹${rate})`,
      findJobs: '🎯 આજનું કામ બતાવો',
      deleteJob: '🗑️ મારું કામ ડિલીટ કરો',
      postJob: '📝 નવું કામ મૂકો',
      contractors: '🏗️ કોન્ટ્રાક્ટર શોધો',
      login: '🔑 લોગિન કરો (Login)',
      chowk: '📍 લેબર ચોક જુઓ',
      dashboard: '👤 મારું ડેશબોર્ડ'
    }
  },
  bn: {
    needsLogin: 'নমস্কার! করবন্তা সাথীর সাথে কথা বলতে এবং আজকের কাজ খুঁজতে বা নিশ্চিত করতে, অনুগ্রহ করে প্রথমে লগইন করুন।',
    twoJobsGreeting: (name, j1, r1, loc1, j2, r2, loc2) =>
      `আরে ${name}! আজ তোমার জন্য ২টি দারুণ কাজ আছে: প্রথমটি, ${loc1}-এ ${j1}, ₹${r1} মজুরিতে। এবং দ্বিতীয়টি, ${loc2}-এ ${j2}, ₹${r2}-এ। তুমি কোনটা করতে চাও?`,
    oneJobGreeting: (name, j1, r1, loc) =>
      `আরে ${name}! আজ ${loc}-এ ${j1} কাজ আছে, ₹${r1} মজুরি। আমি কি কথা পাকা করে দেব?`,
    noJobs: (name) =>
      `নমস্কার ${name}! আমি আপনার করবন্তা সাথী। মুখে বলেই কাজ পান, নতুন কাজ পোস্ট করুন বা ঠিকাদার খুঁজুন। বলুন আজ কি করতে হবে?`,
    jobAccepted: (name, jobTitle, custName) =>
      `দারুণ ${name}! আমি "${jobTitle}"-এর জন্য তোমার নাম পাকা করে দিয়েছি। ${custName}-এর ড্যাশবোর্ডে তোমার নাম ও নম্বর পৌঁছে গেছে, তারা সরাসরি ফোন করবেন। আর কিছু লাগবে?`,
    jobRejected: (name, altTitle, r, loc) =>
      `কোনো ব্যাপার না ${name}! ${loc}-এ "${altTitle}"-ও আছে, ₹${r} মজুরি। এতে কথা বলব?`,
    noMoreJobs: (name) =>
      `নাগপুরে আজ এই প্রধান কাজগুলোই ছিল ${name}। আপনি লেবার চক দেখতে পারেন বা নতুন কাজ দিতে পারেন।`,
    jobDeleted: (name, title) =>
      `তোমার "${title}" কাজটি আমি মুছে ফেলেছি ${name}, একদম নিশ্চিন্ত থাকো! আর কিছু করার আছে?`,
    noPostsToDelete: (name) =>
      `তোমার অ্যাকাউন্টে এখন কোনো পোস্ট করা কাজ নেই ${name}। নতুন কাজ দিতে চাইলে বলো!`,
    greeting: (name) =>
      `হ্যালো ${name}! আমি দারুণ আছি। তোমার কি খবর? আজ কাজে যাওয়ার ইচ্ছা আছে নাকি নতুন কাজ খুঁজছো?`,
    whoAreYou: () =>
      `আমি তোমার করবন্তা সাথী! কোনো দালালি ছাড়া সরাসরি ঠিকাদার ও কাজের সাথে যুক্ত করার বিশ্বস্ত বন্ধু। আজ কি সাহায্য করতে পারি?`,
    paymentInfo: () =>
      `রোজকার মজুরি কাজ শেষ হতেই সরাসরি নগদ বা ইউপিআইতে ঠিকাদার দেন। মাঝে কোনো কমিশন কাটা হয় না!`,
    locationInfo: () =>
      `নাগপুরে এখন ধরমপেঠ, সীতাবল্ডি, সদর ও বাডিতে কাজ চলছে। তোমার কোনটা সুবিধা হবে?`,
    gratitude: (name) =>
      `ধন্যবাদ দেওয়ার কোনো দরকার নেই ${name}! নিজের কাজ মনে করো। মন দিয়ে কাজ করো আর প্রয়োজনে আমাকে ডাকো!`,
    postWork: () =>
      `হ্যাঁ নিশ্চয়ই! কতজন শ্রমিক লাগবে আর কি কাজ, আমাকে মুখেই বলো, আমি সঙ্গে সঙ্গে পোস্ট করে দেব!`,
    contractors: () =>
      `নাগপুরের সেরা ঠিকাদাররা আছেন। কথা বলে দেব কি?`,
    help: (name) =>
      `কোনো চিন্তা করো না ${name}! কিছু পড়তে বা লিখতে হবে না, ফোনে কথা বলার মতো বলো, সব কাজ আমি করে দেব!`,
    fallback: (name) =>
      `আরে ${name}! তুমি শুধু বলো — 'আজকের কাজ দেখাও', 'কাজের সাথে যুক্ত করো', 'কাজ মোছো' বা 'ঠিকাদার খোঁজো'।`,
    labels: {
      accept1: (title, rate) => `🤝 ${title.slice(0, 18)} (₹${rate})`,
      accept2: (title, rate) => `🤝 ${title.slice(0, 18)} (₹${rate})`,
      findJobs: '🎯 আজকের কাজ দেখাও',
      deleteJob: '🗑️ কাজ মুছুন',
      postJob: '📝 নতুন কাজ পোস্ট',
      contractors: '🏗️ ঠিকাদার খুঁজুন',
      login: '🔑 লগইন করুন (Login)',
      chowk: '📍 লেবার চক দেখুন',
      dashboard: '👤 আমার ড্যাশবোর্ড'
    }
  },
  ta: {
    needsLogin: 'வணக்கம்! கரவந்தா உதவியாளருடன் பேசவும், இன்றைய வேலையைத் தேட அல்லது உறுதி செய்யவும், முதலில் உள்நுழையவும்.',
    twoJobsGreeting: (name, j1, r1, loc1, j2, r2, loc2) =>
      `வணக்கம் ${name}! இன்று உங்களுக்கு 2 நல்ல வேலைகள் உள்ளன: முதலாவது, ${loc1}-ல் ${j1}, ₹${r1} கூலியில். இரண்டாவது, ${loc2}-ல் ${j2}, ₹${r2}-ல். இதில் எந்த வேலையை நீங்கள் செய்ய விரும்புகிறீர்கள்?`,
    oneJobGreeting: (name, j1, r1, loc) =>
      `வணக்கம் ${name}! இன்று ${loc}-ல் ${j1} வேலை உள்ளது, ₹${r1} கூலி. உங்களுக்காக உறுதி செய்யட்டுமா?`,
    noJobs: (name) =>
      `வணக்கம் ${name}! நான் உங்கள் கரவந்தா குரல் உதவியாளர். பேசி அன்றாட வேலைகளைக் கண்டறியலாம் அல்லது தொழிலாளர்களை அமர்த்தலாம்.`,
    jobAccepted: (name, jobTitle, custName) =>
      `அற்புதம் ${name}! நான் "${jobTitle}" வேலைக்கு உங்கள் பெயரை உறுதி செய்துவிட்டேன். ${custName} டேஷ்போர்டிற்கு உங்கள் பெயர் மற்றும் எண் அனுப்பப்பட்டுவிட்டது, அவர்கள் உங்களை நேரடியாக அழைப்பார்கள்.`,
    jobRejected: (name, altTitle, r, loc) =>
      `பரவாயில்லை ${name}! ${loc}-ல் "${altTitle}" வேலையும் உள்ளது, ₹${r} கூலி. இதில் பேசவா?`,
    noMoreJobs: (name) =>
      `நாக்பூரில் இன்று இவைதான் முக்கிய வேலைகள் ${name}. லேபர் சவுக் பார்க்கவும் அல்லது புதிய வேலை பதிவிடவும்.`,
    jobDeleted: (name, title) =>
      `உங்கள் "${title}" பதிவை உடனே நீக்கிவிட்டேன் ${name}, கவலைப்பட வேண்டாம்!`,
    noPostsToDelete: (name) =>
      `உங்கள் கணக்கில் எந்தப் பதிவும் இல்லை ${name}.`,
    greeting: (name) =>
      `வணக்கம் ${name}! நான் நன்றாக இருக்கிறேன். நீங்கள் எப்படி இருக்கிறீர்கள்? இன்று வேலைக்குச் செல்ல வேண்டுமா?`,
    whoAreYou: () =>
      `நான் உங்கள் கரவந்தா உதவியாளர்! இடைத்தரகர் இல்லாமல் ஒப்பந்ததாரர்களுடன் உங்களை நேரடியாக இணைக்கிறேன்.`,
    paymentInfo: () =>
      `தினக்கூலி மாலையில் வேலை முடிந்ததும் நேரடியாக ரொக்கமாக அல்லது யுபிஐ மூலம் வழங்கப்படும். கமிஷன் இல்லை!`,
    locationInfo: () =>
      `நாக்பூரில் தர்மபேட்டை, சீதாபர்தி பகுதிகளில் வேலைகள் உள்ளன.`,
    gratitude: (name) =>
      `மிக்க மகிழ்ச்சி ${name}! எப்போது வேண்டுமானாலும் என்னை அழைக்கலாம்!`,
    postWork: () =>
      `எத்தனை தொழிலாளர்கள் வேண்டும் என்று சொல்லுங்கள், உடனே பதிவு செய்கிறேன்!`,
    contractors: () =>
      `நாக்பூரின் முன்னணி ஒப்பந்ததாரர்களுடன் இணைக்கட்டுமா?`,
    help: (name) =>
      `கவலை வேண்டாம் ${name}! படிக்கவோ எழுதவோ தேவையில்லை, என்னுடன் பேசினாலே போதும், எல்லா வேலைகளையும் நான் செய்து தருவேன்!`,
    fallback: (name) =>
      `வணக்கம் ${name}! 'இன்றைய வேலை காட்டு', 'வேலையை உறுதி செய்', அல்லது 'ஒப்பந்ததாரரைத் தேடு' என்று கூறுங்கள்.`,
    labels: {
      accept1: (title, rate) => `🤝 வேலை 1 (₹${rate})`,
      accept2: (title, rate) => `🤝 வேலை 2 (₹${rate})`,
      findJobs: '🎯 இன்றைய வேலை காட்டு',
      deleteJob: '🗑️ வேலையை நீக்கு',
      postJob: '📝 புதிய வேலை பதிவிடு',
      contractors: '🏗️ ஒப்பந்ததாரர் தேடு',
      login: '🔑 உள்நுழைக (Login)',
      chowk: '📍 லேபர் சவுக் பார்',
      dashboard: '👤 எனது டேஷ்போர்டு'
    }
  },
  te: {
    needsLogin: 'నమస్కారం! కరవంత సాథీతో మాట్లాడటానికి మరియు ఈరోజు పనిని కనుగొనడానికి లేదా ఖరారు చేసుకోవడానికి, దయచేసి మొదట లాగిన్ అవ్వండి.',
    twoJobsGreeting: (name, j1, r1, loc1, j2, r2, loc2) =>
      `నమస్కారం ${name}! ఈరోజు నీ కోసం 2 మంచి పనులు ఉన్నాయి: మొదటిది, ${loc1} లో ${j1}, ₹${r1} కూలికి. రెండవది, ${loc2} లో ${j2}, ₹${r2} కి. నీకు వీటిలో ఏ పని కావాలి?`,
    oneJobGreeting: (name, j1, r1, loc) =>
      `నమస్కారం ${name}! ఈరోజు ${loc} లో ${j1} పని ఉంది, ₹${r1} కూలి. నేను ఖరారు చేయమంటావా?`,
    noJobs: (name) =>
      `నమస్కారం ${name}! నేను మీ కరవంత సాథీని. మాట్లాడి నేరుగా పనిని పొందండి లేదా కొత్త పని పోస్ట్ చేయండి.`,
    jobAccepted: (name, jobTitle, custName) =>
      `చాలా బాగుంది ${name}! నేను "${jobTitle}" పనికి నీ సీటు ఖరారు చేశాను. ${custName} డాష్‌బోర్డ్‌కు నీ పేరు మరియు ఫోన్ నంబర్ పంపబడ్డాయి, వారు నేరుగా నీకు ఫోన్ చేస్తారు.`,
    jobRejected: (name, altTitle, r, loc) =>
      `పర్వాలేదు ${name}! ${loc} లో "${altTitle}" కూడా ఉంది, ₹${r} కూలి. ఇందులో మాట్లాడమంటావా?`,
    noMoreJobs: (name) =>
      `నాగపూర్‌లో ఈరోజు ఇవే ముఖ్యమైన పనులు ${name}.`,
    jobDeleted: (name, title) =>
      `నీ "${title}" పనిని నేను వెంటనే తొలగించాను ${name}, నిశ్చింతగా ఉండు!`,
    noPostsToDelete: (name) =>
      `నీ ఖాతాలో పోస్ట్ చేసిన పనులేవీ లేవు ${name}.`,
    greeting: (name) =>
      `నమస్తే ${name}! నేను బాగున్నాను. నువ్వు ఎలా ఉన్నావు? ఈరోజు పని కోసం చూస్తున్నావా?`,
    whoAreYou: () =>
      `నేను నీ కరవంత సాథీని! ఎలాంటి కమీషన్ లేకుండా నిన్ను నేరుగా కాంట్రాక్టర్లతో కలిపే డిజిటల్ స్నేహితుడిని.`,
    paymentInfo: () =>
      `రోజు కూలి సాయంత్రం పని ముగిసిన వెంటనే నేరుగా నగదు లేదా యూపీఐ ద్వారా అందుతుంది. కమీషన్ ఉండదు!`,
    locationInfo: () =>
      `నాగపూర్‌లో ధరమ్‌పేట, సీతాబర్డి ప్రాంతాల్లో పనులు జరుగుతున్నాయి.`,
    gratitude: (name) =>
      `చాలా సంతోషం ${name}! ఎప్పుడు కావాలన్నా నన్ను అడగవచ్చు!`,
    postWork: () =>
      `ఎంతమంది కూలీలు కావాలో చెప్పు, నేను వెంటనే పోస్ట్ చేస్తాను!`,
    contractors: () =>
      `నాగపూర్ ప్రముఖ కాంట్రాక్టర్లతో మాట్లాడించమంటావా?`,
    help: (name) =>
      `ఏం కంగారు పడకు ${name}! చదవడం, రాయడం అక్కర్లేదు, ఫోన్‌లో మాట్లాడినట్లే నాతో మాట్లాడు, అంతా నేనే చూసుకుంటాను!`,
    fallback: (name) =>
      `చెప్పు ${name}! 'ఈరోజు పని చూపించు', 'నన్ను పనికి కనెక్ట్ చేయి', లేదా 'కాంట్రాక్టర్‌ని వెతుకు' అని అడగండి.`,
    labels: {
      accept1: (title, rate) => `🤝 పని 1 (₹${rate})`,
      accept2: (title, rate) => `🤝 పని 2 (₹${rate})`,
      findJobs: '🎯 ఈరోజు పని చూపించు',
      deleteJob: '🗑️ నా పని తొలగించు',
      postJob: '📝 కొత్త పని పోస్ట్',
      contractors: '🏗️ కాంట్రాక్టర్లను వెతుకు',
      login: '🔑 లాగిన్ అవ్వండి (Login)',
      chowk: '📍 లేబర్ చౌక్ చూడు',
      dashboard: '👤 నా డాష్‌బోర్డ్'
    }
  },
  kn: {
    needsLogin: 'ನಮಸ್ಕಾರ! ಕರವಂತ ಸಾಥಿಯೊಂದಿಗೆ ಮಾತನಾಡಲು ಮತ್ತು ಇಂದಿನ ಕೆಲಸ ಹುಡುಕಲು, ದಯವಿಟ್ಟು ಮೊದಲು ಲಾಗಿನ್ ಆಗಿ.',
    twoJobsGreeting: (name, j1, r1, loc1, j2, r2, loc2) =>
      `ನಮಸ್ಕಾರ ${name}! ಇಂದು ನಿಮಗಾಗಿ 2 ಉತ್ತಮ ಕೆಲಸಗಳಿವೆ: ಮೊದಲನೆಯದು, ${loc1} ನಲ್ಲಿ ${j1}, ₹${r1} ಕೂಲಿಗೆ. ಎರಡನೆಯದು, ${loc2} ನಲ್ಲಿ ${j2}, ₹${r2} ಗೆ. ನೀವು ಯಾವುದನ್ನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?`,
    oneJobGreeting: (name, j1, r1, loc) =>
      `ನಮಸ್ಕಾರ ${name}! ಇಂದು ${loc} ನಲ್ಲಿ ${j1} ಕೆಲಸವಿದೆ, ₹${r1} ಕೂಲಿ. ನಿಮಗಾಗಿ ಮಾತುಕತೆ ಖಚಿತಪಡಿಸಲೆ?`,
    noJobs: (name) =>
      `ನಮಸ್ಕಾರ ${name}! ನಾನು ನಿಮ್ಮ ಕರವಂತ ಸಾಥಿ. ಮಾತನಾಡಿ ಇಂದಿನ ಕೆಲಸ ಹುಡುಕಿ ಅಥವಾ ಕೆಲಸ ಪೋಸ್ಟ್ ಮಾಡಿ.`,
    jobAccepted: (name, jobTitle, custName) =>
      `ಅದ್ಭುತ ${name}! ನಾನು "${jobTitle}" ಕೆಲಸಕ್ಕೆ ನಿಮ್ಮ ಹೆಸರನ್ನು ಖಚಿತಪಡಿಸಿದ್ದೇನೆ. ${custName} ಅವರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ನಿಮ್ಮ ಹೆಸರು ಮತ್ತು ಫೋನ್ ಸಂಖ್ಯೆ ತಲುಪಿದೆ, ಅವರು ನಿಮಗೆ ನೇರವಾಗಿ ಕರೆ ಮಾಡುತ್ತಾರೆ.`,
    jobRejected: (name, altTitle, r, loc) =>
      `ಪರವಾಗಿಲ್ಲ ${name}! ${loc} ನಲ್ಲಿ "${altTitle}" ಕೂಡ ಇದೆ, ₹${r} ಕೂಲಿ. ಇದರಲ್ಲಿ ಮಾತನಾಡಲೆ?`,
    noMoreJobs: (name) =>
      `ನಾಗ್ಪುರದಲ್ಲಿ ಇಂದು ಇವೇ ಮುಖ್ಯ ಕೆಲಸಗಳು ${name}.`,
    jobDeleted: (name, title) =>
      `ನಿಮ್ಮ "${title}" ಕೆಲಸವನ್ನು ನಾನು ತಕ್ಷಣ ಅಳಿಸಿದ್ದೇನೆ ${name}, ನಿಶ್ಚಿಂತರಾಗಿರಿ!`,
    noPostsToDelete: (name) =>
      `ನಿಮ್ಮ ಖಾತೆಯಲ್ಲಿ ಯಾವುದೇ ಕೆಲಸಗಳಿಲ್ಲ ${name}.`,
    greeting: (name) =>
      `ಹಲೋ ${name}! ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ. ನೀವು ಹೇಗಿದ್ದೀರಿ? ಇಂದು ಕೆಲಸಕ್ಕೆ ಹೋಗುವ ಆಲೋಚನೆ ಇದೆಯೇ?`,
    whoAreYou: () =>
      `ನಾನು ನಿಮ್ಮ ಕರವಂತ ಸಾಥಿ! ಕಮಿಷನ್ ಇಲ್ಲದೆ ನೇರವಾಗಿ ಕೆಲಸ ಮತ್ತು ಗುತ್ತಿಗೆದಾರರನ್ನು ಜೋಡಿಸುವ ನಿಮ್ಮ ಗೆಳೆಯ.`,
    paymentInfo: () =>
      `ದಿನಗೂಲಿ ಪ್ರತಿದಿನ ಸಂಜೆ ಕೆಲಸ ಮುಗಿದ ತಕ್ಷಣ ನಗದು ಅಥವಾ ಯುಪಿಐ ಮೂಲಕ ಸಿಗುತ್ತದೆ.`,
    locationInfo: () =>
      `ಧರಂಪೇಟ್, ಸೀತಾಬರ್ಡಿ ಪ್ರದೇಶಗಳಲ್ಲಿ ಕೆಲಸಗಳು ಚಾಲ್ತಿಯಲ್ಲಿವೆ.`,
    gratitude: (name) =>
      `ಧನ್ಯವಾದಗಳ ಅಗತ್ಯವಿಲ್ಲ ${name}! ಮನಸ್ಸಿಟ್ಟು ಕೆಲಸ ಮಾಡಿ, ಯಾವಾಗ ಬೇಕಾದರೂ ನನ್ನನ್ನು ಕರೆಯಿರಿ!`,
    postWork: () =>
      `ಎಷ್ಟು ಕಾರ್ಮಿಕರು ಬೇಕು ಎಂದು ಹೇಳಿ, ನಾನು ತಕ್ಷಣ ಪೋಸ್ಟ್ ಮಾಡುತ್ತೇನೆ!`,
    contractors: () =>
      `ಗುತ್ತಿಗೆದಾರರೊಂದಿಗೆ ಮಾತನಾಡಿಸಲೆ?`,
    help: (name) =>
      `ಚಿಂತೆ ಬೇಡ ${name}! ಓದಲು-ಬರೆಯಲು ಬಾರದಿದ್ದರೂ ಪರವಾಗಿಲ್ಲ, ಫೋನ್‌ನಲ್ಲಿ ಮಾತನಾಡುವಂತೆ ಮಾತನಾಡಿ, ಎಲ್ಲ ಕೆಲಸ ನಾನೇ ಮಾಡುತ್ತೇನೆ!`,
    fallback: (name) =>
      `ಹೇಳಿ ${name}! 'ಇಂದಿನ ಕೆಲಸ ತಿಳಿಸಿ', 'ಕೆಲಸಕ್ಕೆ ಸೇರಿಸಿ' ಅಥವಾ 'ಗುತ್ತಿಗೆದಾರ ಹುಡುಕಿ' ಎಂದು ಕೇಳಿ.`,
    labels: {
      accept1: (title, rate) => `🤝 ಕೆಲಸ 1 (₹${rate})`,
      accept2: (title, rate) => `🤝 ಕೆಲಸ 2 (₹${rate})`,
      findJobs: '🎯 ಇಂದಿನ ಕೆಲಸ ತಿಳಿಸಿ',
      deleteJob: '🗑️ ಕೆಲಸ ಅಳಿಸಿ',
      postJob: '📝 ಕೆಲಸ ಪೋಸ್ಟ್ ಮಾಡಿ',
      contractors: '🏗️ ಗುತ್ತಿಗೆದಾರ ಹುಡುಕಿ',
      login: '🔑 ಲಾಗಿನ್ ಆಗಿ (Login)',
      chowk: '📍 ಲೇಬರ್ ಚೌಕ್ ನೋಡಿ',
      dashboard: '👤 ನನ್ನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್'
    }
  },
  ml: {
    needsLogin: 'നമസ്കാരം! കരവന്ത സാഥിയോട് സംസാരിക്കാനും ഇന്നത്തെ ജോലി കണ്ടെത്താനും, ദയവായി ആദ്യം ലോഗിൻ ചെയ്യുക.',
    twoJobsGreeting: (name, j1, r1, loc1, j2, r2, loc2) =>
      `ഹലോ ${name}! ഇന്ന് നിങ്ങൾക്ക് 2 നല്ല ജോലികളുണ്ട്: ഒന്നാമത്തേത്, ${loc1}-ൽ ${j1}, ₹${r1} ദിവസക്കൂലിക്ക്. രണ്ടാമത്തേത്, ${loc2}-ൽ ${j2}, ₹${r2}-ന്. ഇതിൽ ഏതാണ് ചെയ്യാൻ താല്പര്യം?`,
    oneJobGreeting: (name, j1, r1, loc) =>
      `ഹലോ ${name}! ഇന്ന് ${loc}-ൽ ${j1} ജോലിയുണ്ട്, ₹${r1} കൂലി. ഉറപ്പിക്കണോ?`,
    noJobs: (name) =>
      `നമസ്കാരം ${name}! ഞാൻ നിങ്ങളുടെ കരവന്ത സാഥിയാണ്. സംസാരിച്ച് ജോലി കണ്ടെത്താം അല്ലെങ്കിൽ ആളുകളെ നിയമിക്കാം.`,
    jobAccepted: (name, jobTitle, custName) =>
      `വളരെ നല്ലത് ${name}! "${jobTitle}" ജോലിക്കായി നിങ്ങളുടെ സ്ഥാനം ഉറപ്പിച്ചു. ${custName}-ന്റെ ഡാഷ്‌ബോർഡിൽ നിങ്ങളുടെ വിവരങ്ങൾ എത്തിയിട്ടുണ്ട്, അവർ നേരിട്ട് വിളിക്കും.`,
    jobRejected: (name, altTitle, r, loc) =>
      `സാരമില്ല ${name}! ${loc}-ൽ "${altTitle}" ജോലിയുമുണ്ട്, ₹${r} കൂലി. ഇതിൽ സംസാരിക്കണോ?`,
    noMoreJobs: (name) =>
      `ഇന്നത്തെ പ്രധാന ജോലികൾ ഇവയാണ് ${name}.`,
    jobDeleted: (name, title) =>
      `നിങ്ങളുടെ "${title}" പോസ്റ്റ് ഞാൻ ഉടൻ നീക്കം ചെയ്തു ${name}.`,
    noPostsToDelete: (name) =>
      `നിങ്ങളുടെ അക്കൗണ്ടിൽ ജോലികളൊന്നുമില്ല ${name}.`,
    greeting: (name) =>
      `നമസ്കാരം ${name}! ഞാൻ സുഖമായിരിക്കുന്നു. നിങ്ങൾക്ക് എങ്ങനെയുണ്ട്? ഇന്ന് ജോലിക്ക് പോകാൻ ഉദ്ദേശമുണ്ടോ?`,
    whoAreYou: () =>
      `ഞാൻ നിങ്ങളുടെ കരവന്ത സഹായിയാണ്! ഇടനിലക്കാരില്ലാതെ നിങ്ങളെ കരാറുകാരുമായി ബന്ധിപ്പിക്കുന്നു.`,
    paymentInfo: () =>
      `ദിവസക്കൂലി വൈകുന്നേരം ജോലി കഴിഞ്ഞയുടൻ നേരിട്ട് ലഭിക്കും. കമ്മീഷൻ ഇല്ല!`,
    locationInfo: () =>
      `ധരംപേട്ട്, സീതാബർഡി മേഖലകളിൽ ജോലികൾ ലഭ്യമാണ്.`,
    gratitude: (name) =>
      `സ്വാഗതം ${name}! എപ്പോൾ വേണമെങ്കിലും ചോദിക്കാം!`,
    postWork: () =>
      `എത്ര തൊഴിലാളികളെ വേണമെന്ന് പറയൂ, ഉടൻ പോസ്റ്റ് ചെയ്യാം!`,
    contractors: () =>
      `കരാറുകാരുമായി ബന്ധപ്പെടുത്തണോ?`,
    help: (name) =>
      `പേടിക്കേണ്ട ${name}! വായിക്കാനോ എഴുതാനോ അറിയേണ്ടതില്ല, ഫോണിൽ സംസാരിക്കുന്നതുപോലെ സംസാരിച്ചാൽ മതി, എല്ലാം ഞാൻ ചെയ്തോളാം!`,
    fallback: (name) =>
      `പറയൂ ${name}! 'ഇന്നത്തെ ജോലി പറയൂ', 'ജോലി ഉറപ്പിക്കൂ' അല്ലെങ്കിൽ 'കരാറുകാരെ കാണിക്കൂ' എന്ന് പറയൂ.`,
    labels: {
      accept1: (title, rate) => `🤝 ജോലി 1 (₹${rate})`,
      accept2: (title, rate) => `🤝 ജോലി 2 (₹${rate})`,
      findJobs: '🎯 ഇന്നത്തെ ജോലി പറയൂ',
      deleteJob: '🗑️ ജോലി മാറ്റുക',
      postJob: '📝 പുതിയ ജോലി പോസ്റ്റ്',
      contractors: '🏗️ കരാറുകാരെ കാണിക്കൂ',
      login: '🔑 ലോഗിൻ ചെയ്യുക (Login)',
      chowk: '📍 ലേബർ ചൗക്ക്',
      dashboard: '👤 എന്റെ ഡാഷ്‌ബോർഡ്'
    }
  },
  pa: {
    needsLogin: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਕਰਵੰਤਾ ਸਾਥੀ ਨਾਲ ਗੱਲ ਕਰਨ ਅਤੇ ਅੱਜ ਦਾ ਕੰਮ ਲੱਭਣ ਜਾਂ ਪੱਕਾ ਕਰਨ ਲਈ, ਕਿਰਪਾ ਕਰਕੇ ਪਹਿਲਾਂ ਲੌਗਇਨ ਕਰੋ।',
    twoJobsGreeting: (name, j1, r1, loc1, j2, r2, loc2) =>
      `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ${name}! ਅੱਜ ਤੁਹਾਡੇ ਲਈ 2 ਵਧੀਆ ਕੰਮ ਹਨ: ਪਹਿਲਾ, ${loc1} ਵਿੱਚ ${j1}, ₹${r1} ਦਿਹਾੜੀ ਤੇ। ਅਤੇ ਦੂਜਾ, ${loc2} ਵਿੱਚ ${j2}, ₹${r2} ਤੇ। ਤੁਸੀਂ ਕਿਹੜਾ ਕੰਮ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?`,
    oneJobGreeting: (name, j1, r1, loc) =>
      `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ${name}! ਅੱਜ ${loc} ਵਿੱਚ ${j1} ਦਾ ਕੰਮ ਹੈ, ₹${r1} ਦਿਹਾੜੀ। ਕੀ ਗੱਲ ਪੱਕੀ ਕਰਵਾ ਦੇਵਾਂ?`,
    noJobs: (name) =>
      `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ${name}! ਮੈਂ ਤੁਹਾਡਾ ਕਰਵੰਤਾ ਸਾਥੀ ਹਾਂ। ਬੋਲ ਕੇ ਅੱਜ ਦਾ ਕੰਮ ਲੱਭੋ ਜਾਂ ਨਵਾਂ ਕੰਮ ਪੋਸਟ ਕਰੋ।`,
    jobAccepted: (name, jobTitle, custName) =>
      `ਬਹੁਤ ਵਧੀਆ ${name}! ਮੈਂ "${jobTitle}" ਲਈ ਤੁਹਾਡੀ ਸੀਟ ਪੱਕੀ ਕਰ ਦਿੱਤੀ ਹੈ। ${custName} ਦੇ ਡੈਸ਼ਬੋਰਡ ਤੇ ਤੁਹਾਡਾ ਨਾਮ ਅਤੇ ਨੰਬਰ ਪਹੁੰਚ ਗਿਆ ਹੈ, ਉਹ ਤੁਹਾਨੂੰ ਸਿੱਧਾ ਫ਼ੋਨ ਕਰਨਗੇ।`,
    jobRejected: (name, altTitle, r, loc) =>
      `ਕੋਈ ਗੱਲ ਨਹੀਂ ${name}! ${loc} ਵਿੱਚ "${altTitle}" ਵੀ ਹੈ, ₹${r} ਦਿਹਾੜੀ। ਇਸ ਵਿੱਚ ਗੱਲ ਕਰਵਾਵਾਂ?`,
    noMoreJobs: (name) =>
      `ਨਾਗਪੁਰ ਵਿੱਚ ਅੱਜ ਇਹ ਮੁੱਖ ਕੰਮ ਸਨ ${name}।`,
    jobDeleted: (name, title) =>
      `ਤੁਹਾਡਾ ਕੰਮ "${title}" ਮੈਂ ਤੁਰੰਤ ਹਟਾ ਦਿੱਤਾ ਹੈ ${name}, ਬੇਫਿਕਰ ਰਹੋ!`,
    noPostsToDelete: (name) =>
      `ਤੁਹਾਡੇ ਖਾਤੇ ਵਿੱਚ ਕੋਈ ਪੋਸਟ ਕੀਤਾ ਕੰਮ ਨਹੀਂ ਹੈ ${name}।`,
    greeting: (name) =>
      `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ${name}! ਮੈਂ ਬਿਲਕੁਲ ਠੀਕ ਹਾਂ। ਤੁਸੀਂ ਦੱਸੋ ਕੀ ਹਾਲ ਹੈ? ਅੱਜ ਕੰਮ ਤੇ ਜਾਣ ਦਾ ਵਿਚਾਰ ਹੈ?`,
    whoAreYou: () =>
      `ਮੈਂ ਤੁਹਾਡਾ ਕਰਵੰਤਾ ਸਾਥੀ ਹਾਂ! ਬਿਨਾਂ ਕਿਸੇ ਕਮਿਸ਼ਨ ਤੋਂ ਤੁਹਾਨੂੰ ਸਿੱਧਾ ਠੇਕੇਦਾਰਾਂ ਨਾਲ ਜੋੜਨ ਵਾਲਾ ਤੁਹਾਡਾ ਮਦਦਗਾਰ।`,
    paymentInfo: () =>
      `ਦਿਹਾੜੀ ਰੋਜ਼ ਸ਼ਾਮ ਨੂੰ ਕੰਮ ਖ਼ਤਮ ਹੁੰਦਿਆਂ ਹੀ ਨਕਦ ਜਾਂ ਯੂਪੀਆਈ ਨਾਲ ਸਿੱਧੀ ਮਿਲਦੀ ਹੈ। ਕੋਈ ਕਮਿਸ਼ਨ ਨਹੀਂ ਕੱਟਦਾ!`,
    locationInfo: () =>
      `ਧਰਮਪੇਠ, ਸੀਤਾਬਰਡੀ ਵਿੱਚ ਕੰਮ ਚੱਲ ਰਹੇ ਹਨ।`,
    gratitude: (name) =>
      `ਧੰਨਵਾਦ ਦੀ ਕੋਈ ਗੱਲ ਨਹੀਂ ${name}! ਮਨ ਲਗਾ ਕੇ ਕੰਮ ਕਰੋ ਅਤੇ ਜਦੋਂ ਮਰਜ਼ੀ ਆਵਾਜ਼ ਮਾਰੋ!`,
    postWork: () =>
      `ਕਿੰਨੇ ਮਜ਼ਦੂਰ ਚਾਹੀਦੇ ਹਨ ਬੋਲ ਕੇ ਦੱਸੋ, ਮੈਂ ਤੁਰੰਤ ਪੋਸਟ ਕਰ ਦੇਵਾਂਗਾ!`,
    contractors: () =>
      `ਨਾਗਪੁਰ ਦੇ ਵੱਡੇ ਠੇਕੇਦਾਰ ਉਪਲਬਧ ਹਨ। ਗੱਲ ਕਰਵਾਵਾਂ?`,
    help: (name) =>
      `ਕੋਈ ਚਿੰਤਾ ਨਾ ਕਰੋ ${name}! ਪੜ੍ਹਨ-ਲਿਖਣ ਦੀ ਕੋਈ ਲੋੜ ਨਹੀਂ, ਫ਼ੋਨ ਵਾਂਗ ਮੇਰੇ ਨਾਲ ਬੋਲੋ, ਸਾਰਾ ਕੰਮ ਮੈਂ ਕਰਾਂਗਾ!`,
    fallback: (name) =>
      `ਦੱਸੋ ${name}! 'ਅੱਜ ਦਾ ਕੰਮ ਦੱਸੋ', 'ਮੈਨੂੰ ਕੰਮ ਨਾਲ ਜੋੜੋ', ਜਾਂ 'ਠੇਕੇਦਾਰ ਲੱਭੋ' ਕਹੋ।`,
    labels: {
      accept1: (title, rate) => `🤝 ਕੰਮ 1 (₹${rate})`,
      accept2: (title, rate) => `🤝 ਕੰਮ 2 (₹${rate})`,
      findJobs: '🎯 ਅੱਜ ਦਾ ਕੰਮ ਦੱਸੋ',
      deleteJob: '🗑️ ਮੇਰਾ ਕੰਮ ਹਟਾਓ',
      postJob: '📝 ਨਵਾਂ ਕੰਮ ਪਾਓ',
      contractors: '🏗️ ਠੇਕੇਦਾਰ ਲੱਭੋ',
      login: '🔑 ਲੌਗਇਨ ਕਰੋ (Login)',
      chowk: '📍 ਲੇਬਰ ਚੌਕ ਦੇਖੋ',
      dashboard: '👤 ਮੇਰਾ ਡੈਸ਼ਬੋਰਡ'
    }
  },
  or: {
    needsLogin: 'ନମସ୍କାର! କରଭନ୍ତା ସାଥୀ ସହିତ କଥା ହେବା ଏବଂ ଆଜିର କାମ ଖୋଜିବା ପାଇଁ, ଦୟାକରି ପ୍ରଥମେ ଲଗଇନ୍ କରନ୍ତୁ।',
    twoJobsGreeting: (name, j1, r1, loc1, j2, r2, loc2) =>
      `ନମସ୍କାର ${name}! ଆଜି ତୁମ ପାଇଁ ୨ଟି ବଢ଼ିଆ କାମ ଅଛି: ପ୍ରଥମଟି, ${loc1} ରେ ${j1}, ₹${r1} ମଜୁରୀରେ। ଏବଂ ଦ୍ୱିତୀୟଟି, ${loc2} ରେ ${j2}, ₹${r2} ରେ। ତୁମେ କେଉଁ କାମ କରିବାକୁ ଚାହୁଁଛ?`,
    oneJobGreeting: (name, j1, r1, loc) =>
      `ନମସ୍କାର ${name}! ଆଜି ${loc} ରେ ${j1} କାମ ଅଛି, ₹${r1} ମଜୁରୀ। କଥା ପକ୍କା କରିଦେବି କି?`,
    noJobs: (name) =>
      `ନମସ୍କାର ${name}! ମୁଁ ତୁମର କରଭନ୍ତା ସାଥୀ। କହିକରି କାମ ଖୋଜନ୍ତୁ ବା ଠିକାଦାର ଖୋଜନ୍ତୁ।`,
    jobAccepted: (name, jobTitle, custName) =>
      `ବହୁତ ବଢ଼ିଆ ${name}! ମୁଁ "${jobTitle}" ପାଇଁ ତୁମର କାମ ପକ୍କା କରିଦେଇଛି। ${custName} ଙ୍କ ଡ୍ୟାସବୋର୍ଡରେ ତୁମର ନାମ ଏବଂ ନମ୍ବର ପହଞ୍ଚିଯାଇଛି, ସେ ତୁମକୁ ସିଧା କଲ୍ କରିବେ।`,
    jobRejected: (name, altTitle, r, loc) =>
      `କିଛି ଅସୁବିଧା ନାହିଁ ${name}! ${loc} ରେ "${altTitle}" ମଧ୍ୟ ଅଛି, ₹${r} ମଜୁରୀ। ଏଥିରେ କଥା ହେବି କି?`,
    noMoreJobs: (name) =>
      `ନାଗପୁରରେ ଆଜି ଏଗୁଡ଼ିକ ହିଁ ମୁଖ୍ୟ କାମ ଥିଲା ${name}।`,
    jobDeleted: (name, title) =>
      `ତୁମର "${title}" କାମଟି ମୁଁ ତୁରନ୍ତ ଡିଲିଟ୍ କରିଦେଇଛି ${name}, ଚିନ୍ତା କରନାହିଁ!`,
    noPostsToDelete: (name) =>
      `ତୁମ ଖାତାରେ କୌଣସି କାମ ପୋଷ୍ଟ ହୋଇନାହିଁ ${name}।`,
    greeting: (name) =>
      `ନମସ୍କାର ${name}! ମୁଁ ବହୁତ ଭଲ ଅଛି। ତୁମର କ’ଣ ଖବର? ଆଜି କାମକୁ ଯିବାକୁ ଚାହୁଁଛ କି?`,
    whoAreYou: () =>
      `ମୁଁ ତୁମର କରଭନ୍ତା ସାଥୀ! କୌଣସି ଦଲାଲି ବିନା ତୁମକୁ ସିଧା କାମ ଏବଂ ଠିକାଦାରଙ୍କ ସହ ଯୋଡ଼ିଥାଏ।`,
    paymentInfo: () =>
      `ଦୈନିକ ମଜୁରୀ ସନ୍ଧ୍ୟାରେ କାମ ସରିବା ପରେ ନଗଦ କିମ୍ବା ୟୁପିଆଇ ମାଧ୍ୟମରେ ସିଧା ମିଳିଥାଏ। କମିଶନ କଟାଯାଏ ନାହିଁ!`,
    locationInfo: () =>
      `ଧରମପେଠ, ସୀତାବରଡ଼ିରେ କାମ ଚାଲୁଅଛି।`,
    gratitude: (name) =>
      `ଧନ୍ୟବାଦର କୌଣସି ଆବଶ୍ୟକତା ନାହିଁ ${name}! ମନ ଦେଇ କାମ କରନ୍ତୁ!`,
    postWork: () =>
      `କେତେ ଶ୍ରମିକ ଦରକାର କୁହନ୍ତୁ, ମୁଁ ତୁରନ୍ତ ପୋଷ୍ଟ କରିଦେବି!`,
    contractors: () =>
      `ଠିକାଦାରଙ୍କ ସହ କଥା କରାଇଦେବି କି?`,
    help: (name) =>
      `କିଛି ଚିନ୍ତା କରନାହିଁ ${name}! ପଢ଼ିବା-ଲେଖିବା ଜାଣିବା ଦରକାର ନାହିଁ, ଫୋନରେ କଥା ହେଲା ପରି କୁହ, ସବୁ କାମ ମୁଁ କରିଦେବି!`,
    fallback: (name) =>
      `କୁହନ୍ତୁ ${name}! 'ଆଜିର କାମ କୁହ', 'ମୋତେ କାମ ସହ ଯୋଡ଼' କିମ୍ବା 'ଠିକାଦାର ଖୋଜ' ବୋଲି କୁହନ୍ତୁ।`,
    labels: {
      accept1: (title, rate) => `🤝 କାମ 1 (₹${rate})`,
      accept2: (title, rate) => `🤝 କାମ 2 (₹${rate})`,
      findJobs: '🎯 ଆଜିର କାମ କୁହ',
      deleteJob: '🗑️ କାମ ହଟାନ୍ତୁ',
      postJob: '📝 ନୂଆ କାମ ପୋଷ୍ଟ',
      contractors: '🏗️ ଠିକାଦାର ଖୋଜନ୍ତୁ',
      login: '🔑 ଲଗଇନ୍ କରନ୍ତୁ (Login)',
      chowk: '📍 ଲେବର ଚୌକ ଦେଖନ୍ତୁ',
      dashboard: '👤 ମୋ ଡ୍ୟାସବୋର୍ଡ'
    }
  },
  as: {
    needsLogin: 'নমস্কাৰ! কৰৱন্তা সাথীৰ সৈতে কথা পাতিবলৈ আৰু আজিৰ কাম বিচাৰিবলৈ, অনুগ্ৰহ কৰি প্ৰথমে লগইন কৰক।',
    twoJobsGreeting: (name, j1, r1, loc1, j2, r2, loc2) =>
      `নমস্কাৰ ${name}! আজি তোমাৰ বাবে ২টা ভাল কাম আছে: প্ৰথমটো, ${loc1}ত ${j1}, ₹${r1} মজুৰিত। আৰু দ্বিতীয়টো, ${loc2}ত ${j2}, ₹${r2}ত। তুমি কোনটো কাম কৰিব বিচৰা?`,
    oneJobGreeting: (name, j1, r1, loc) =>
      `নমস্কাৰ ${name}! আজি ${loc}ত ${j1} কাম আছে, ₹${r1} মজুৰি। মই কথা পকা কৰি দিম নেকি?`,
    noJobs: (name) =>
      `নমস্কাৰ ${name}! মই তোমাৰ কৰৱন্তা সাথী। মুখেৰে কৈ কাম বিচাৰক বা ঠিকাদাৰ বিচাৰক।`,
    jobAccepted: (name, jobTitle, custName) =>
      `বৰ ভাল কথা ${name}! মই "${jobTitle}" ৰ বাবে তোমাৰ নাম পকা কৰি দিলো। ${custName} ৰ ডেচবৰ্ডত তোমাৰ নাম আৰু নম্বৰ পঠোৱা হৈছে, তেওঁলোকে তোমাক পোনপটীয়াকৈ ফোন কৰিব।`,
    jobRejected: (name, altTitle, r, loc) =>
      `কোনো কথা নাই ${name}! ${loc}ত "${altTitle}" কামো আছে, ₹${r} মজুৰি। ইয়াত কথা পাতিম নেকি?`,
    noMoreJobs: (name) =>
      `নাগপুৰত আজি এইবোৰেই প্ৰধান কাম আছিল ${name}।`,
    jobDeleted: (name, title) =>
      `তোমাৰ "${title}" কামটো মই এতিয়াই ডিলিট কৰি দিলো ${name}, চিন্তা নকৰিবা!`,
    noPostsToDelete: (name) =>
      `তোমাৰ একাউণ্টত কোনো কাম নাই ${name}।`,
    greeting: (name) =>
      `নমস্কাৰ ${name}! মই বৰ ভাল আছো। তোমাৰ খবৰ কি? আজি কামলৈ যোৱাৰ কথা ভাবিছা নেকি?`,
    whoAreYou: () =>
      `মই তোমাৰ কৰৱন্তা সাথী! কোনো দালালি নোহোৱাকৈ তোমাক পোনে পোনে ঠিকাদাৰ আৰু কামৰ সৈতে সংযোগ কৰোঁ।`,
    paymentInfo: () =>
      `কাম শেষ হোৱাৰ লগে লগে সন্ধিয়া নগদ বা ইউপিআইৰ জৰিয়তে দৈনিক মজুৰি দিয়া হয়। কোনো কমিছন কটা নহয়!`,
    locationInfo: () =>
      `ধৰমপেঠ, সীতাবৰ্ডিত কাম চলি আছে।`,
    gratitude: (name) =>
      `ধন্যবাদ দিব নালাগে ${name}! নিজৰ কাম বুলি ভাবা!`,
    postWork: () =>
      `কেইজন শ্ৰমিক লাগে কওক, মই এতিয়াই প’ষ্ট কৰি দিম!`,
    contractors: () =>
      `ঠিকাদাৰৰ সৈতে কথা পাতাই দিম নেকি?`,
    help: (name) =>
      `একো চিন্তা নকৰিবা ${name}! পঢ়া-শুনা জনাৰ প্ৰয়োজন নাই, ফোনত কথা পতাৰ দৰে কথা কোৱা, সকলো কাম মই কৰি দিম!`,
    fallback: (name) =>
      `কোৱা ${name}! 'আজিৰ কাম দেখুওৱা', 'কামত সংযোগ কৰা' বা 'ঠিকাদাৰ বিচৰা' বুলি কোৱা।`,
    labels: {
      accept1: (title, rate) => `🤝 কাম 1 (₹${rate})`,
      accept2: (title, rate) => `🤝 কাম 2 (₹${rate})`,
      findJobs: '🎯 আজিৰ কাম দেখুওৱা',
      deleteJob: '🗑️ মোৰ কাম আঁতৰাওক',
      postJob: '📝 নতুন কাম প’ষ্ট',
      contractors: '🏗️ ঠিকাদাৰ বিচৰা',
      login: '🔑 লগইন কৰক (Login)',
      chowk: '📍 লেবাৰ চ’ক চাওক',
      dashboard: '👤 মোৰ ডেচবৰ্ড'
    }
  }
};

const getRes = (langCode) => {
  return LOCALIZED_RESPONSES[langCode] || LOCALIZED_RESPONSES.hi;
};

// ========================================================
// AI AGENT SERVICE
// ========================================================
export const aiAgentService = {
  // Proactive greeting tailored to user in their selected language
  getInitialGreeting: (currentUser, langCode = 'hi', jobs = []) => {
    const res = getRes(langCode);

    // 1. Check if user is logged in
    if (!currentUser) {
      return {
        needsLogin: true,
        text: res.needsLogin,
        options: [
          { label: res.labels.login, action: 'open_login' }
        ]
      };
    }

    const firstName = getProfileFirstName(currentUser) || 'साथी';

    // Find real active jobs today
    const activeJobs = jobs && jobs.length > 0 ? jobs : dbService.getLabourPosts().filter(p => p.status === 'active');
    const userCity = currentUser.city || 'Nagpur';
    const cityJobs = activeJobs.filter(p => !p.city || p.city.toLowerCase() === userCity.toLowerCase());
    const availableJobs = cityJobs.length > 0 ? cityJobs : activeJobs;

    const j1 = availableJobs[0] || null;
    const j2 = availableJobs[1] || null;

    if (j1 && j2) {
      const r1 = j1.daily_rate || j1.dailyRate || 1000;
      const r2 = j2.daily_rate || j2.dailyRate || 750;
      const loc1 = j1.locality || j1.city || 'धरमपेठ';
      const loc2 = j2.locality || j2.city || 'सीताबरडी';
      return {
        text: res.twoJobsGreeting(firstName, j1.title, r1, loc1, j2.title, r2, loc2),
        suggestedJob: j1,
        secondaryJob: j2,
        options: [
          { label: res.labels.accept1(j1.title, r1), action: 'accept_job', jobId: j1.id },
          { label: res.labels.accept2(j2.title, r2), action: 'accept_job', jobId: j2.id },
          { label: res.labels.postJob, action: 'post_job' },
          { label: res.labels.deleteJob, action: 'list_my_posts' }
        ]
      };
    } else if (j1) {
      const r1 = j1.daily_rate || j1.dailyRate || 1000;
      const loc = j1.locality || j1.city || 'धरमपेठ';
      return {
        text: res.oneJobGreeting(firstName, j1.title, r1, loc),
        suggestedJob: j1,
        options: [
          { label: res.labels.accept1(j1.title, r1), action: 'accept_job', jobId: j1.id },
          { label: res.labels.findJobs, action: 'find_more_jobs' },
          { label: res.labels.postJob, action: 'post_job' },
          { label: res.labels.deleteJob, action: 'list_my_posts' }
        ]
      };
    } else {
      return {
        text: res.noJobs(firstName),
        options: [
          { label: res.labels.findJobs, action: 'find_jobs' },
          { label: res.labels.postJob, action: 'post_job' },
          { label: res.labels.deleteJob, action: 'list_my_posts' },
          { label: res.labels.contractors, action: 'find_contractor' }
        ]
      };
    }
  },

  // Main conversational input processor
  processMessage: async ({
    input,
    context: {
      currentUser,
      currentLang = 'hi',
      pendingJob = null,
      setActiveTab,
      changeLanguage,
      onJobApplied,
      onJobDeleted
    }
  }) => {
    const res = getRes(currentLang);

    // Check if user is logged in
    if (!currentUser) {
      return {
        needsLogin: true,
        text: res.needsLogin,
        options: [
          { label: res.labels.login, action: 'open_login' }
        ]
      };
    }

    const text = input.trim();
    const lower = text.toLowerCase();
    const firstName = getProfileFirstName(currentUser) || 'साथी';
    const userFullName = currentUser.full_name || currentUser.name || firstName;
    const userPhone = currentUser.phone_number || currentUser.phone || '';

    // 1. ACCEPT WORK / CONNECT ME ("हाँ", "करा दो", "पहला", "दूसरा", "धरमपेठ", "सीताबरडी", "yes", "connect", "first", "accept", etc.)
    const isAffirmative = /^(हाँ|हा|करा दो|करवा दो|कर दो|पहला|दूसरा|धरमपेठ|सीताबरडी|मिस्त्री|हेल्पर|पक्का|चलो ठीक|ठीक है|बात कराओ|कनेक्ट|जोड़ दो|काम चाहिए|स्वीकार|yes|connect|accept|apply|theek|thik|kardo|karado|haan|ha|chahiye|done|ok|sure|first|second|dharampeth|sitabuldi|mason|helper|ho|pahila|dusra|sari|avunu|hoy|karo)/i.test(lower);
    if (isAffirmative) {
      const activeJobs = dbService.getLabourPosts().filter(p => p.status === 'active');
      
      // Determine target job:
      let targetJob = pendingJob;
      if ((lower.includes('दूसरा') || lower.includes('second') || lower.includes('दुसरं') || lower.includes('બીજું')) && activeJobs.length > 1) {
        targetJob = activeJobs[1];
      } else if (lower.includes('सीताबरडी') || lower.includes('sitabuldi') || lower.includes('हेल्पर') || lower.includes('helper') || lower.includes('मजदूर')) {
        targetJob = activeJobs.find(p => p.title.includes('हेल्पर') || p.title.includes('मज़दूर') || (p.locality && p.locality.toLowerCase().includes('sitabuldi'))) || activeJobs[1] || activeJobs[0];
      } else if (lower.includes('धरमपेठ') || lower.includes('dharampeth') || lower.includes('मिस्त्री') || lower.includes('mason') || lower.includes('राजमिस्त्री')) {
        targetJob = activeJobs.find(p => p.title.includes('मिस्त्री') || (p.locality && p.locality.toLowerCase().includes('dharampeth'))) || activeJobs[0];
      } else if (!targetJob && activeJobs.length > 0) {
        targetJob = activeJobs[0];
      }

      if (targetJob) {
        try {
          await supabase
            .from('job_applicants')
            .insert([{ job_id: targetJob.id, worker_id: currentUser.id }]);
        } catch (err) {
          console.warn('Supabase apply notice:', err);
        }

        // Apply in local store with REAL user profile name and phone so contractor sees it immediately
        dbService.applyForLabourPost(targetJob.id, currentUser.id, userFullName, userPhone);
        if (onJobApplied) onJobApplied(targetJob.id);

        const customerName = targetJob.customer_name || targetJob.customerName || 'ठेकेदार (Contractor)';
        return {
          text: res.jobAccepted(firstName, targetJob.title, customerName),
          actionTaken: 'job_accepted',
          completedJob: targetJob,
          clearPending: true,
          options: [
            { label: res.labels.chowk, action: 'nav_labourMarketplace' },
            { label: res.labels.dashboard, action: 'nav_dashboard' }
          ]
        };
      }
    }

    // 2. REJECT / SHOW ALTERNATIVE JOB ("नहीं", "दूसरा काम", "कुछ और दिखाओ", "no", "other")
    const isRejectIntent = /(नहीं|दूसरा|कुछ और|ये नहीं|अलग काम|no|other|different|change|नाही|दुसरे|બીજું|অন্য|வேண்டாம்|వద్దు)/i.test(lower);
    if (isRejectIntent) {
      const allPosts = dbService.getLabourPosts().filter(p => p.status === 'active');
      const otherJobs = allPosts.filter(p => !pendingJob || p.id !== pendingJob.id);
      if (otherJobs.length > 0) {
        const altJob = otherJobs[0];
        const rate = altJob.daily_rate || altJob.dailyRate || 750;
        const locality = altJob.locality || altJob.city || 'सीताबरडी';
        return {
          text: res.jobRejected(firstName, altJob.title, rate, locality),
          suggestedJob: altJob,
          options: [
            { label: res.labels.accept1(altJob.title, rate), action: 'accept_job', jobId: altJob.id },
            { label: res.labels.chowk, action: 'nav_labourMarketplace' }
          ]
        };
      } else {
        return {
          text: res.noMoreJobs(firstName),
          options: [
            { label: res.labels.chowk, action: 'nav_labourMarketplace' },
            { label: res.labels.postJob, action: 'nav_postWork' }
          ]
        };
      }
    }

    // 3. DELETE TASK / POST ("डिलीट", "हटाओ", "रद्द", "delete", "remove", "cancel")
    const isDeleteIntent = /(डिलीट|हटा|हटाओ|मिटा|रद्द|delete|remove|cancel|हटवा|કાઢી|মুছে|நீக்கு|తొలగించు)/i.test(lower);
    if (isDeleteIntent) {
      const allPosts = dbService.getLabourPosts();
      const userPosts = allPosts.filter(p => 
        (p.customer_id === currentUser.id || p.customerId === currentUser.id) ||
        (currentUser.role === 'admin') ||
        p.id === 'job_today_1' || p.id === 'lp_demo_1' // allow demo deletion
      );

      if (userPosts.length > 0) {
        const firstPost = userPosts[0];
        try {
          await supabase.from('labour_posts').delete().eq('id', firstPost.id);
        } catch {}

        dbService.deleteLabourPost(firstPost.id);
        if (onJobDeleted) onJobDeleted(firstPost.id);

        return {
          text: res.jobDeleted(firstName, firstPost.title.slice(0, 30)),
          deleteCards: userPosts,
          options: [
            { label: res.labels.postJob, action: 'post_job' },
            { label: res.labels.findJobs, action: 'find_jobs' }
          ]
        };
      } else {
        return {
          text: res.noPostsToDelete(firstName),
          options: [
            { label: res.labels.postJob, action: 'post_job' },
            { label: res.labels.findJobs, action: 'find_jobs' }
          ]
        };
      }
    }

    // 4. FIND JOB / TODAY'S WORK ("काम बताओ", "आज का काम", "काम चाहिए", "find job", "work", "jobs")
    const isFindJobIntent = /(काम|नौकरी|रोजगार|दिहाड़ी|आज का काम|काम बताओ|काम ढूंढो|काम चाहिए|job|work|today|chowk|kaam|labour|chahiye|काम सांगा|કામ ਬਤਾવો|কাজ দেখাও|வேலை|పని)/i.test(lower);
    if (isFindJobIntent) {
      const allPosts = dbService.getLabourPosts().filter(p => p.status === 'active');
      const j1 = allPosts[0] || null;
      const j2 = allPosts[1] || null;

      if (j1 && j2) {
        const r1 = j1.daily_rate || j1.dailyRate || 1000;
        const r2 = j2.daily_rate || j2.dailyRate || 750;
        const loc1 = j1.locality || j1.city || 'धरमपेठ';
        const loc2 = j2.locality || j2.city || 'सीताबरडी';

        return {
          text: res.twoJobsGreeting(firstName, j1.title, r1, loc1, j2.title, r2, loc2),
          suggestedJob: j1,
          secondaryJob: j2,
          options: [
            { label: res.labels.accept1(j1.title, r1), action: 'accept_job', jobId: j1.id },
            { label: res.labels.accept2(j2.title, r2), action: 'accept_job', jobId: j2.id },
            { label: res.labels.chowk, action: 'nav_labourMarketplace' },
            { label: res.labels.deleteJob, action: 'list_my_posts' }
          ]
        };
      } else if (j1) {
        const r1 = j1.daily_rate || j1.dailyRate || 1000;
        const loc = j1.locality || j1.city || 'धरमपेठ';
        return {
          text: res.oneJobGreeting(firstName, j1.title, r1, loc),
          suggestedJob: j1,
          options: [
            { label: res.labels.accept1(j1.title, r1), action: 'accept_job', jobId: j1.id },
            { label: res.labels.chowk, action: 'nav_labourMarketplace' },
            { label: res.labels.deleteJob, action: 'list_my_posts' }
          ]
        };
      }
    }

    // 5. GREETINGS & HOW ARE YOU ("नमस्ते", "राम राम", "प्रणाम", "हेलो", "हाय", "hello", "hi")
    const isGreeting = /(नमस्ते|राम राम|प्रणाम|हेलो|हाय|hello|hi|hey|कैसा है|कैसे हो|क्या हाल|सब ठीक|kaise ho|haal chal|नमस्कार|કેમ છો|வணக்கம்|నమస్కారం)/i.test(lower);
    if (isGreeting) {
      return {
        text: res.greeting(firstName),
        options: [
          { label: res.labels.findJobs, action: 'find_jobs' },
          { label: res.labels.postJob, action: 'post_job' }
        ]
      };
    }

    // 6. WHO ARE YOU ("तुम कौन हो", "तुम क्या हो", "तुम्हारा नाम क्या है", "who are you")
    const isWhoAreYou = /(तुम कौन|क्या हो|तुम्हारा नाम|करवंता क्या|who are you|what is karvanta|तू कोण|તમે કોણ)/i.test(lower);
    if (isWhoAreYou) {
      return {
        text: res.whoAreYou(firstName),
        options: [
          { label: res.labels.findJobs, action: 'find_jobs' },
          { label: res.labels.contractors, action: 'find_contractor' }
        ]
      };
    }

    // 7. PAYMENT & RATES ("पैसे कब मिलेंगे", "दिहाड़ी कितनी", "पेमेंट", "payment", "salary")
    const isPaymentIntent = /(पैसे कब|दिहाड़ी कितनी|पेमेंट|पैसा|payment|rate|salary|rupaye|मजदूरी|पगार)/i.test(lower);
    if (isPaymentIntent) {
      return {
        text: res.paymentInfo(),
        options: [
          { label: res.labels.findJobs, action: 'find_jobs' }
        ]
      };
    }

    // 8. LOCATION / WHERE IN NAGPUR ("नागपुर में कहाँ", "लोकेशन", "जगह", "location")
    const isLocationIntent = /(नागपुर में कहाँ|लोकेशन|कहाँ चलना|धरमपेठ|सीताबरडी|location|kahan|कुठे)/i.test(lower);
    if (isLocationIntent) {
      return {
        text: res.locationInfo(),
        options: [
          { label: res.labels.findJobs, action: 'find_jobs' },
          { label: res.labels.chowk, action: 'nav_labourMarketplace' }
        ]
      };
    }

    // 9. GRATITUDE ("धन्यवाद", "थैंक यू", "शुक्रिया", "thank", "thanks")
    const isGratitude = /(धन्यवाद|थैंक|शुक्रिया|मेहरबानी|thank|shukriya|great|आभार|ಧನ್ಯವಾದ)/i.test(lower);
    if (isGratitude) {
      return {
        text: res.gratitude(firstName),
        options: [
          { label: res.labels.findJobs, action: 'find_jobs' },
          { label: res.labels.dashboard, action: 'nav_dashboard' }
        ]
      };
    }

    // 10. POST WORK / HIRE ("काम पोस्ट", "मजदूर चाहिए", "मिस्त्री चाहिए", "post work", "hire")
    const isPostWorkIntent = /(काम पोस्ट|मजदूर चाहिए|मिस्त्री चाहिए|कारीगर चाहिए|लेबर चाहिए|post work|need worker|post job|hire|karigar|मजूर हवेत)/i.test(lower);
    if (isPostWorkIntent) {
      return {
        text: res.postWork(),
        options: [
          { label: res.labels.postJob, action: 'nav_postWork' },
          { label: res.labels.findJobs, action: 'find_jobs' }
        ]
      };
    }

    // 11. FIND CONTRACTORS ("ठेकेदार", "thekedar", "contractor", "builder")
    const isContractorIntent = /(ठेकेदार|कंट्रैक्टर|thekedar|contractor|builder|कंत्राटदार|કોન્ટ્રાક્ટર)/i.test(lower);
    if (isContractorIntent) {
      const contractors = dbService.getContractors();
      const top = contractors.slice(0, 2);
      return {
        text: res.contractors(),
        contractorCards: top,
        options: [
          { label: res.labels.contractors, action: 'nav_contractors' },
          { label: res.labels.postJob, action: 'nav_postWork' }
        ]
      };
    }

    // 12. HELP / ILLITERATE ASSISTANCE ("कुछ नहीं आता", "मदद", "अनपढ़", "help", "guide")
    const isHelpIntent = /(कुछ नहीं आता|मदद|सहायता|अनपढ़|पढ़ना नहीं|help|samajh|kaise|guide|batao|मदत|সাহায্য|உதவி)/i.test(lower);
    if (isHelpIntent) {
      return {
        text: res.help(firstName),
        options: [
          { label: res.labels.findJobs, action: 'find_jobs' },
          { label: res.labels.postJob, action: 'post_job' }
        ]
      };
    }

    // 13. REAL-TIME GOOGLE GEMINI 3.8 FLASH LLM (Dynamic answers to any user question)
    const geminiEnvKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (geminiEnvKey) {
      const targetLangName = LANG_SPEECH_MAP[currentLang]?.name || 'Hindi';
      const allActive = dbService.getLabourPosts().filter(p => p.status === 'active');
      const j1 = allActive[0];
      const j2 = allActive[1];
      const jobsContext = j1 && j2
        ? `Real active jobs right now: 1. ${j1.title} in ${j1.locality || j1.city} at Rs ${j1.daily_rate || j1.dailyRate}/day. 2. ${j2.title} in ${j2.locality || j2.city} at Rs ${j2.daily_rate || j2.dailyRate}/day.`
        : 'Active construction jobs available in Nagpur across Dharampeth and Sitabuldi.';

      const systemInstruction = `You are Karvanta Saathi (करवंता साथी), an affectionate, street-smart Indian AI companion on a LIVE VOICE CALL with ${firstName}.
RULES:
1. Speak purely in ${targetLangName}.
2. Answer in EXACTLY 1 or 2 natural, warm spoken sentences (max 35 words).
3. NEVER use markdown, bullet points, asterisks (*), or lists. Your answer will be read aloud over phone speakers.
4. Local Database Context: ${jobsContext}.
5. You can answer ANY question the user asks: about daily work, wages, directions in Nagpur, advice, tools, or general friendly conversation.
6. If the user agrees to take a job, warmly confirm that their spot is locked.`;

      const geminiReply = await callGeminiLiveApi(text, systemInstruction, geminiEnvKey);
      if (geminiReply) {
        return {
          text: geminiReply,
          options: [
            { label: res.labels.findJobs, action: 'find_jobs' },
            { label: res.labels.chowk, action: 'nav_labourMarketplace' }
          ]
        };
      }
    }

    // 14. Fallback warm friendly response in user language
    return {
      text: res.fallback(firstName),
      options: [
        { label: res.labels.findJobs, action: 'find_jobs' },
        { label: res.labels.deleteJob, action: 'list_my_posts' },
        { label: res.labels.postJob, action: 'post_job' },
        { label: res.labels.contractors, action: 'find_contractor' }
      ]
    };
  }
};
