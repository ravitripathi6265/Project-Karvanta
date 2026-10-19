import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../../i18n/i18nContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dbService } from '../../db/databaseService';
import { supabase } from '../../lib/supabase';
import {
  aiAgentService,
  speakText,
  stopSpeech,
  createSpeechRecognizer,
  LANG_SPEECH_MAP,
  LOCALIZED_RESPONSES,
  getProfileFirstName
} from '../../services/aiAgentService';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  X,
  Sparkles,
  CheckCircle,
  Briefcase,
  MapPin,
  Calendar,
  Users,
  Trash2,
  Phone,
  PhoneOff,
  MessageSquare,
  Globe,
  Radio,
  Headphones,
  RotateCcw,
  LogIn
} from 'lucide-react';

export const KarvantaAiAgent = ({
  activeTab,
  setActiveTab,
  onOpenPostJob
}) => {
  const { currentLang, changeLanguage, supportedLanguages, t } = useI18n();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  // Real-time conversational states
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [liveCaptions, setLiveCaptions] = useState('');
  const [liveInterim, setLiveInterim] = useState('');
  const [callDuration, setCallDuration] = useState(0);

  // Live Web Audio Equalizer Waveform Bars (5 frequencies)
  const [waveformBars, setWaveformBars] = useState([14, 18, 24, 18, 14]);

  const [pendingJob, setPendingJob] = useState(null);
  const [latestCard, setLatestCard] = useState(null);
  const [hasGreeted, setHasGreeted] = useState(false);

  const messagesEndRef = useRef(null);
  const recognizerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animFrameRef = useRef(null);

  // Synchronous refs to prevent stale closure issues during continuous audio loop
  const isLiveModeRef = useRef(isLiveMode);
  isLiveModeRef.current = isLiveMode;
  const isSpeakingRef = useRef(isSpeaking);
  isSpeakingRef.current = isSpeaking;
  const isThinkingRef = useRef(isThinking);
  isThinkingRef.current = isThinking;
  const isMicMutedRef = useRef(isMicMuted);
  isMicMutedRef.current = isMicMuted;
  const isVoiceMutedRef = useRef(isVoiceMuted);
  isVoiceMutedRef.current = isVoiceMuted;
  const currentLangRef = useRef(currentLang);
  currentLangRef.current = currentLang;
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Call duration counter when in Live Mode
  useEffect(() => {
    let interval = null;
    if (isOpen && isLiveMode) {
      setCallDuration(0);
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isLiveMode]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Global custom event listener
  useEffect(() => {
    const handleOpenAi = (e) => {
      setIsOpen(true);
      if (e.detail?.liveMode !== undefined) {
        setIsLiveMode(e.detail.liveMode);
      }
      if (e.detail?.prompt) {
        setTimeout(() => {
          handleSendMessage(e.detail.prompt);
        }, 300);
      }
    };
    window.addEventListener('open-karvanta-ai', handleOpenAi);
    return () => window.removeEventListener('open-karvanta-ai', handleOpenAi);
  }, []);

  // Web Audio Stream initialiser for real-time waveform equalizer visual
  const initAudioStream = async () => {
    if (micStreamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      micStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateWaveform = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Map frequency bands to 5 dancing bars
        const b1 = Math.max(12, Math.min(55, (dataArray[1] || 10) * 0.4 + 10));
        const b2 = Math.max(16, Math.min(75, (dataArray[3] || 15) * 0.5 + 14));
        const b3 = Math.max(20, Math.min(90, (dataArray[5] || 20) * 0.6 + 18));
        const b4 = Math.max(16, Math.min(75, (dataArray[7] || 15) * 0.5 + 14));
        const b5 = Math.max(12, Math.min(55, (dataArray[9] || 10) * 0.4 + 10));

        setWaveformBars([b1, b2, b3, b4, b5]);
        animFrameRef.current = requestAnimationFrame(updateWaveform);
      };

      updateWaveform();
    } catch (err) {
      console.warn('Microphone stream access notice:', err);
    }
  };

  const stopAudioStream = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
      audioContextRef.current = null;
    }
  };

  // Cleanup on unmount or dialog close
  useEffect(() => {
    if (!isOpen) {
      stopSpeech();
      stopAudioStream();
      if (recognizerRef.current) {
        try { recognizerRef.current.stop(); } catch {}
      }
      setIsListening(false);
      setIsSpeaking(false);
      setIsThinking(false);
    }
  }, [isOpen]);

  // Clean conversational turn-taking: Agent speaks, recognition paused; Agent finishes, recognition begins!
  const speakResponse = (text, lang) => {
    const targetLang = lang || currentLangRef.current;
    
    // 1. Pause speech recognition while AI speaks to avoid listening to its own voice
    if (recognizerRef.current) {
      try { recognizerRef.current.stop(); } catch {}
    }
    setIsListening(false);

    if (isVoiceMutedRef.current) {
      setIsSpeaking(false);
      if (isLiveModeRef.current && !isMicMutedRef.current && currentUserRef.current) {
        setTimeout(() => startLiveListening(), 600);
      }
      return;
    }

    speakText(
      text,
      targetLang,
      () => {
        setIsSpeaking(true);
        setIsListening(false);
      },
      () => {
        setIsSpeaking(false);
        // Seamless conversational turn-taking: start listening as soon as agent finishes speaking!
        if (isLiveModeRef.current && !isMicMutedRef.current && currentUserRef.current) {
          setTimeout(() => {
            if (isLiveModeRef.current && !isMicMutedRef.current && !isSpeakingRef.current) {
              startLiveListening();
            }
          }, 300);
        }
      }
    );
  };

  // Continuous hands-free live listening loop (Gemini Live & ChatGPT Voice style)
  const startLiveListening = () => {
    if (!isLiveModeRef.current || isMicMutedRef.current || isSpeakingRef.current) {
      return;
    }

    initAudioStream();

    if (recognizerRef.current) {
      try { recognizerRef.current.stop(); } catch {}
    }

    const recognizer = createSpeechRecognizer(
      currentLangRef.current,
      (finalTranscript) => {
        // Conversational pause detected (user finished sentence)
        if (finalTranscript && finalTranscript.trim()) {
          setLiveInterim('');
          setLiveCaptions(`आप: "${finalTranscript}"`);
          setIsListening(false);
          setIsThinking(true);
          handleSendMessage(finalTranscript);
        }
      },
      (error) => {
        if (isLiveModeRef.current && (error === 'no-speech' || error === 'network')) {
          setTimeout(() => {
            if (isLiveModeRef.current && !isMicMutedRef.current && !isSpeakingRef.current) {
              startLiveListening();
            }
          }, 350);
        } else {
          setIsListening(false);
        }
      },
      () => {
        if (isLiveModeRef.current && !isMicMutedRef.current && !isSpeakingRef.current) {
          setTimeout(() => {
            if (isLiveModeRef.current && !isMicMutedRef.current && !isSpeakingRef.current) {
              startLiveListening();
            }
          }, 250);
        } else {
          setIsListening(false);
        }
      },
      (interim) => {
        if (interim) {
          setLiveInterim(interim);
        }
      }
    );

    if (recognizer) {
      try {
        recognizer.start();
        recognizerRef.current = recognizer;
        setIsListening(true);
      } catch (e) {
        console.warn('Speech recognizer start notice:', e);
      }
    }
  };

  // Language Change handler (Immediate multilingual live response!)
  const handleLanguageChange = (newLang) => {
    changeLanguage(newLang);
    currentLangRef.current = newLang;
    stopSpeech();
    setIsSpeaking(false);
    if (recognizerRef.current) {
      try { recognizerRef.current.stop(); } catch {}
    }
    setIsListening(false);

    // Re-generate proactive greeting in the newly selected language!
    const activeJobs = dbService.getLabourPosts().filter(p => p.status === 'active');
    const greeting = aiAgentService.getInitialGreeting(currentUserRef.current, newLang, activeJobs);

    const langChangeMsg = {
      id: `msg_lang_${Date.now()}`,
      sender: 'agent',
      text: greeting.text,
      suggestedJob: greeting.suggestedJob || null,
      needsLogin: greeting.needsLogin || false,
      options: greeting.options || []
    };

    setMessages(prev => [...prev, langChangeMsg]);
    setLiveCaptions(greeting.text);

    if (greeting.suggestedJob) {
      setPendingJob(greeting.suggestedJob);
      setLatestCard({ type: 'job', data: greeting.suggestedJob });
    }

    // Speak greeting in the newly selected language and automatically resume listening!
    speakResponse(greeting.text, newLang);
  };

  // Proactive greeting when modal opens
  useEffect(() => {
    if (isOpen && (!hasGreeted || messages.length === 0)) {
      const activeJobs = dbService.getLabourPosts().filter(p => p.status === 'active');
      const greeting = aiAgentService.getInitialGreeting(currentUser, currentLang, activeJobs);
      
      const initialMsg = {
        id: `msg_${Date.now()}`,
        sender: 'agent',
        text: greeting.text,
        suggestedJob: greeting.suggestedJob || null,
        needsLogin: greeting.needsLogin || false,
        options: greeting.options || []
      };

      setMessages([initialMsg]);
      setLiveCaptions(greeting.text);

      if (greeting.suggestedJob) {
        setPendingJob(greeting.suggestedJob);
        setLatestCard({ type: 'job', data: greeting.suggestedJob });
      } else if (greeting.needsLogin) {
        setLatestCard({ type: 'login' });
      }
      setHasGreeted(true);

      initAudioStream();
      speakResponse(greeting.text, currentLang);
    }
  }, [isOpen, currentUser]);

  // Interrupt / Barge-In handler (tap orb or dock button to stop agent instantly and speak)
  const handleInterrupt = () => {
    stopSpeech();
    setIsSpeaking(false);
    setIsThinking(false);
    if (isLiveModeRef.current && !isMicMutedRef.current && currentUserRef.current) {
      setTimeout(() => startLiveListening(), 100);
    }
  };

  // Toggle Live Mode
  const toggleLiveMode = () => {
    const nextMode = !isLiveMode;
    setIsLiveMode(nextMode);
    isLiveModeRef.current = nextMode;

    if (!nextMode) {
      stopSpeech();
      setIsSpeaking(false);
      stopAudioStream();
      if (recognizerRef.current) {
        try { recognizerRef.current.stop(); } catch {}
      }
      setIsListening(false);
    } else {
      initAudioStream();
      if (currentUser) {
        setTimeout(() => startLiveListening(), 250);
      }
    }
  };

  // Mic Mute in Live Mode
  const toggleMicMute = () => {
    const nextMute = !isMicMuted;
    setIsMicMuted(nextMute);
    isMicMutedRef.current = nextMute;

    if (nextMute) {
      if (recognizerRef.current) {
        try { recognizerRef.current.stop(); } catch {}
      }
      setIsListening(false);
      addToast('माइक म्यूट कर दिया गया (Mic Muted)', 'info');
    } else {
      addToast('माइक ऑन (Mic Active)', 'success');
      startLiveListening();
    }
  };

  // Replay a message in chat view
  const handleReplayVoice = (text) => {
    speakResponse(text, currentLangRef.current);
  };

  // Trigger Login
  const handleOpenLogin = () => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('open-auth-modal'));
  };

  // Execute real job acceptance
  const handleAcceptJob = (job) => {
    if (!currentUser) {
      handleOpenLogin();
      return;
    }

    const firstName = getProfileFirstName(currentUser) || 'साथी';
    const workerName = currentUser.full_name || currentUser.name || firstName;
    const workerPhone = currentUser.phone_number || currentUser.phone || '';

    // Apply in real database
    dbService.applyForLabourPost(job.id, currentUser.id, workerName, workerPhone);
    try {
      supabase.from('job_applicants').insert([{ job_id: job.id, worker_id: currentUser.id }]);
    } catch {}

    const res = LOCALIZED_RESPONSES[currentLangRef.current] || LOCALIZED_RESPONSES.hi;
    const customerName = job.customer_name || job.customerName || 'ठेकेदार';
    const confirmText = res.jobAccepted(firstName, job.title, customerName);

    const userMsg = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: res.labels.accept1 ? res.labels.accept1(job.title, job.daily_rate || job.dailyRate) : '🤝 काम स्वीकार किया'
    };

    const agentMsg = {
      id: `msg_a_${Date.now()}`,
      sender: 'agent',
      text: confirmText,
      options: [
        { label: res.labels.chowk || '📍 लेबर चौक देखें', action: 'nav_labourMarketplace' },
        { label: res.labels.dashboard || '👤 मेरा डैशबोर्ड', action: 'nav_dashboard' }
      ]
    };

    setMessages(prev => [...prev, userMsg, agentMsg]);
    setLiveCaptions(confirmText);
    setPendingJob(null);
    setLatestCard(null);
    addToast('काम स्वीकार कर लिया गया है! (Job Accepted)', 'success');

    speakResponse(confirmText, currentLangRef.current);
  };

  // Execute real task deletion
  const handleDeletePost = (postId) => {
    const firstName = getProfileFirstName(currentUser) || 'साथी';
    dbService.deleteLabourPost(postId);
    try {
      supabase.from('labour_posts').delete().eq('id', postId);
    } catch {}

    addToast('काम सफलतापूर्वक डिलीट कर दिया गया है! (Task Deleted)', 'success');

    const res = LOCALIZED_RESPONSES[currentLangRef.current] || LOCALIZED_RESPONSES.hi;
    const confirmText = res.jobDeleted(firstName, 'आवश्यकता');
    const agentMsg = {
      id: `msg_del_${Date.now()}`,
      sender: 'agent',
      text: confirmText,
      options: [
        { label: res.labels.postJob || '📝 नया काम पोस्ट करें', action: 'post_job' },
        { label: res.labels.findJobs || '🎯 आज का काम खोजें', action: 'find_jobs' }
      ]
    };

    setMessages(prev => [...prev, agentMsg]);
    setLiveCaptions(confirmText);
    setLatestCard(null);

    speakResponse(confirmText, currentLangRef.current);
  };

  // Main message processor
  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    stopSpeech();
    setIsSpeaking(false);
    setIsThinking(true);

    const response = await aiAgentService.processMessage({
      input: text,
      context: {
        currentUser,
        currentLang: currentLangRef.current,
        pendingJob,
        setActiveTab,
        changeLanguage,
        onJobApplied: () => {
          setPendingJob(null);
          setLatestCard(null);
        },
        onJobDeleted: () => {
          setLatestCard(null);
        }
      }
    });

    setIsThinking(false);

    if (response.needsLogin) {
      setLatestCard({ type: 'login' });
    } else if (response.suggestedJob) {
      setPendingJob(response.suggestedJob);
      setLatestCard({ type: 'job', data: response.suggestedJob });
    } else if (response.deleteCards && response.actionTaken !== 'deleted') {
      setLatestCard({ type: 'delete', data: response.deleteCards });
    } else if (response.clearPending) {
      setPendingJob(null);
      setLatestCard(null);
    }

    const agentMsg = {
      id: `msg_agent_${Date.now()}`,
      sender: 'agent',
      text: response.text,
      suggestedJob: response.suggestedJob || null,
      deleteCards: response.deleteCards || null,
      contractorCards: response.contractorCards || null,
      workerCards: response.workerCards || null,
      needsLogin: response.needsLogin || false,
      options: response.options || []
    };

    setMessages(prev => [...prev, agentMsg]);
    setLiveCaptions(response.text);

    speakResponse(response.text, currentLangRef.current);
  };

  // Handle option click
  const handleOptionClick = (opt) => {
    if (opt.action === 'open_login') {
      handleOpenLogin();
      return;
    }

    if (opt.action === 'accept_job') {
      const allPosts = dbService.getLabourPosts().filter(p => p.status === 'active');
      const target = allPosts.find(p => p.id === opt.jobId) || pendingJob || allPosts[0];
      if (target) {
        handleAcceptJob(target);
      }
      return;
    }

    if (opt.action === 'find_jobs' || opt.action === 'find_more_jobs') {
      handleSendMessage('आज का काम बताओ');
      return;
    }

    if (opt.action === 'list_my_posts') {
      handleSendMessage('मेरा काम डिलीट करो');
      return;
    }

    if (opt.action === 'post_job') {
      if (onOpenPostJob) onOpenPostJob();
      setIsOpen(false);
      return;
    }

    if (opt.action === 'find_contractor') {
      handleSendMessage('ठेकेदार ढूंढो');
      return;
    }

    if (opt.action === 'nav_labourMarketplace') {
      setActiveTab('labourMarketplace');
      setIsOpen(false);
      return;
    }

    if (opt.action === 'nav_dashboard') {
      setActiveTab('dashboard');
      setIsOpen(false);
      return;
    }

    if (opt.action === 'nav_contractors') {
      setActiveTab('contractors');
      setIsOpen(false);
      return;
    }

    if (opt.action === 'nav_workers') {
      setActiveTab('workers');
      setIsOpen(false);
      return;
    }

    handleSendMessage(opt.label);
  };

  // Latest options to show in Live Mode as convenient one-tap pills
  const currentOptions = messages.length > 0 ? (messages[messages.length - 1].options || []) : [];

  return (
    <>
      {/* ========================================================
          FLOATING AI AGENT TRIGGER BUTTON
          ======================================================== */}
      <div className="karvanta-ai-launcher-wrapper">
        <button
          type="button"
          className={`karvanta-ai-launcher-btn ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Karvanta Saathi AI Live Assistant"
          title="लाइव बात करें (Live Talk Like Person)"
        >
          <div className="ai-launcher-pulse-ring"></div>
          <div className="ai-launcher-icon-box">
            <Radio size={19} className="ai-sparkle-icon" />
            <Mic size={20} className="ai-mic-icon" />
          </div>
          <div className="ai-launcher-text">
            <span className="ai-launcher-title">करवंता साथी 🔴</span>
            <span className="ai-launcher-badge">लाइव बोलकर बात करें</span>
          </div>
        </button>
      </div>

      {/* ========================================================
          MAIN AI LIVE VOICE & CHAT DIALOG
          ======================================================== */}
      {isOpen && (
        <div className="karvanta-ai-dialog-backdrop" onClick={() => setIsOpen(false)}>
          <div
            className={`karvanta-ai-dialog ${isLiveMode ? 'live-mode-active' : ''}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="ai-dialog-header">
              <div className="ai-dialog-brand">
                <div className={`ai-avatar ${isSpeaking ? 'speaking-pulse' : ''}`}>
                  <Sparkles size={18} color="#FFF" />
                </div>
                <div>
                  <div className="ai-header-title">
                    करवंता साथी
                    <span className="ai-live-badge-pill">
                      <span className="live-red-dot"></span> LIVE TALK
                    </span>
                    {isLiveMode && (
                      <span className="ai-live-timer-chip">
                        {formatTimer(callDuration)}
                      </span>
                    )}
                  </div>
                  <div className="ai-header-subtitle">
                    {LANG_SPEECH_MAP[currentLang]?.name || 'हिन्दी'} • इंसान की तरह सीधी बातचीत
                  </div>
                </div>
              </div>

              <div className="ai-dialog-controls">
                {/* Switch between Live Call View and Chat View */}
                <button
                  type="button"
                  className={`ai-mode-toggle-btn ${isLiveMode ? 'active' : ''}`}
                  onClick={toggleLiveMode}
                  title={isLiveMode ? 'चैट और कार्ड्स देखें (Switch to Chat)' : 'लाइव कॉल पर आएं (Live Call)'}
                >
                  {isLiveMode ? <MessageSquare size={15} /> : <Headphones size={15} />}
                  <span>{isLiveMode ? 'चैट' : '🔴 लाइव बात'}</span>
                </button>

                {/* Multilingual Switcher - switches speech and voice dynamically */}
                <div className="ai-lang-select-wrapper" title="भाषा बदलें / Language">
                  <Globe size={14} />
                  <select
                    className="ai-lang-select"
                    value={currentLang}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                  >
                    {supportedLanguages.map(l => (
                      <option key={l.code} value={l.code}>
                        {l.nativeName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Voice Audio Mute */}
                <button
                  type="button"
                  className={`ai-ctrl-btn ${isVoiceMuted ? 'muted' : ''}`}
                  onClick={() => {
                    if (!isVoiceMuted) stopSpeech();
                    setIsVoiceMuted(!isVoiceMuted);
                  }}
                  title={isVoiceMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isVoiceMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  className="ai-ctrl-btn close-btn"
                  onClick={() => {
                    stopSpeech();
                    setIsOpen(false);
                  }}
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ========================================================
                VIEW 1: LIVE TALK MODE (GEMINI LIVE & CHATGPT ORB STYLE)
                ======================================================== */}
            {isLiveMode ? (
              <div className="ai-live-talk-container">
                {/* Status Bar */}
                <div className="ai-live-status-pill">
                  {!currentUser ? (
                    <span className="muted-text">🔒 लॉगिन आवश्यक है (Please Login)</span>
                  ) : isThinking ? (
                    <span className="thinking-text">✨ साथी सोच रहा है... (Thinking...)</span>
                  ) : isSpeaking ? (
                    <span className="speaking-text">🔊 करवंता साथी बोल रहा है... (रोकने के लिए ऑर्ब दबाएं)</span>
                  ) : isListening ? (
                    <span className="listening-text">🎙️ मैं लाइव सुन रहा हूँ... बोलिए (Listening... Speak now)</span>
                  ) : isMicMuted ? (
                    <span className="muted-text">🔇 माइक म्यूट है (Mic Muted)</span>
                  ) : (
                    <span>बोलकर बातचीत करें</span>
                  )}
                </div>

                {/* Central Ethereal Live Voice Orb with Dancing Waveform Bars */}
                <div
                  className={`ai-live-orb-wrapper ${
                    isSpeaking ? 'state-speaking' : isThinking ? 'state-thinking' : isListening ? 'state-listening' : 'state-idle'
                  }`}
                  onClick={handleInterrupt}
                  title="टैप करके रोकें या अपनी बात बोलें (Tap to interrupt)"
                >
                  <div className="orb-ripple orb-ripple-1"></div>
                  <div className="orb-ripple orb-ripple-2"></div>
                  <div className="orb-ripple orb-ripple-3"></div>
                  
                  <div className="ai-live-orb-core">
                    <div className="orb-inner-glow"></div>
                    
                    {/* Live Waveform Equalizer (ChatGPT & Gemini Live Dancing Bars) */}
                    <div className="orb-waveform-container">
                      {waveformBars.map((height, i) => (
                        <div
                          key={i}
                          className="orb-waveform-bar"
                          style={{
                            height: isSpeaking
                              ? `${22 + (i % 2 === 0 ? 30 : 16)}px`
                              : isListening
                              ? `${height}px`
                              : '10px'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Captions & Speech Transcript */}
                <div className="ai-live-caption-box">
                  {liveInterim ? (
                    <div className="ai-live-interim-text">
                      <span className="interim-label">आप:</span> "{liveInterim}..."
                    </div>
                  ) : (
                    <div className="ai-live-caption-text">
                      {liveCaptions || 'नमस्ते! मैं लाइव सुन रहा हूँ। आप एक दोस्त की तरह कुछ भी बोल सकते हैं...'}
                    </div>
                  )}
                </div>

                {/* Interactive Action Card Slide-in (Login, Recommended Job, or Delete Card) */}
                {latestCard && (
                  <div className="ai-live-slidein-card">
                    {latestCard.type === 'login' && (
                      <div className="ai-login-required-box">
                        <div className="ai-login-required-icon">
                          <LogIn size={26} />
                        </div>
                        <h4 className="ai-login-required-title">लॉगिन आवश्यक है</h4>
                        <p className="ai-login-required-desc">
                          करवंता साथी आपकी प्रोफाइल और नाम के अनुसार काम खोजता और पक्का करता है।
                        </p>
                        <button
                          type="button"
                          className="ai-login-required-btn"
                          onClick={handleOpenLogin}
                        >
                          <LogIn size={18} />
                          <span>लॉगिन / रजिस्टर करें (Login Now)</span>
                        </button>
                      </div>
                    )}

                    {latestCard.type === 'job' && (
                      <div className="ai-rich-card job-card-highlight">
                        <div className="ai-card-badge">🎯 आज का काम उपलब्ध है</div>
                        <h4 className="ai-card-title">{latestCard.data.title}</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                          <span style={{ color: '#EA580C', fontWeight: '800' }}>
                            ₹{latestCard.data.daily_rate || latestCard.data.dailyRate}/दिन
                          </span>
                          <span style={{ color: 'var(--slate-600)' }}>
                            📍 {latestCard.data.locality}, {latestCard.data.city}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="ai-card-action-btn accept-btn"
                          onClick={() => handleAcceptJob(latestCard.data)}
                        >
                          <CheckCircle size={17} />
                          <span>🤝 हाँ, मुझे कनेक्ट करा दो (बोलें या दबाएं)</span>
                        </button>
                      </div>
                    )}

                    {latestCard.type === 'delete' && latestCard.data && latestCard.data[0] && (
                      <div className="ai-rich-card delete-card">
                        <div className="ai-card-badge" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                          🗑️ पोस्ट किया हुआ काम
                        </div>
                        <h4 className="ai-card-title">{latestCard.data[0].title}</h4>
                        <button
                          type="button"
                          className="ai-card-action-btn delete-btn"
                          onClick={() => handleDeletePost(latestCard.data[0].id)}
                        >
                          <Trash2 size={16} />
                          <span>🗑️ यह काम हटाएं (Delete)</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Action Pills in Live Mode (For uneducated workers or noisy rooms) */}
                {currentOptions && currentOptions.length > 0 && (
                  <div className="ai-live-quick-pills">
                    {currentOptions.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        className="ai-live-pill-btn"
                        onClick={() => handleOptionClick(opt)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Live Call Control Dock */}
                <div className="ai-live-control-dock">
                  {/* Mute Mic Toggle */}
                  <button
                    type="button"
                    className={`live-dock-btn ${isMicMuted ? 'active-mute' : ''}`}
                    onClick={toggleMicMute}
                    title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
                  >
                    {isMicMuted ? <MicOff size={22} /> : <Mic size={22} />}
                  </button>

                  {/* Interrupt / Speak Button */}
                  <button
                    type="button"
                    className="live-dock-btn live-interrupt-btn"
                    onClick={handleInterrupt}
                    title="बोलना शुरू करें या एजेंट को रोकें"
                  >
                    <RotateCcw size={22} />
                  </button>

                  {/* Switch to Chat Button */}
                  <button
                    type="button"
                    className="live-dock-btn"
                    onClick={() => setIsLiveMode(false)}
                    title="चैट और इतिहास देखें"
                  >
                    <MessageSquare size={22} />
                  </button>

                  {/* End Call Button */}
                  <button
                    type="button"
                    className="live-dock-btn end-call-btn"
                    onClick={() => {
                      stopSpeech();
                      setIsOpen(false);
                    }}
                    title="कॉल समाप्त करें (End Call)"
                  >
                    <PhoneOff size={22} />
                  </button>
                </div>
              </div>
            ) : (
              /* ========================================================
                  VIEW 2: CHAT & TRANSCRIPT STREAM VIEW
                  ======================================================== */
              <>
                <div className="ai-dialog-body">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`ai-msg-row ${msg.sender}`}>
                      {msg.sender === 'agent' && (
                        <div className="ai-msg-avatar">
                          <Sparkles size={14} color="#FFF" />
                        </div>
                      )}

                      <div className="ai-msg-content-box">
                        <div className="ai-msg-bubble">
                          <div className="ai-msg-text">{msg.text}</div>

                          {msg.sender === 'agent' && (
                            <button
                              type="button"
                              className="ai-msg-audio-btn"
                              onClick={() => handleReplayVoice(msg.text)}
                              title="आवाज़ सुनें"
                            >
                              <Volume2 size={13} />
                              <span>आवाज़ सुनें</span>
                            </button>
                          )}
                        </div>

                        {/* LOGIN CARD IF REQUIRED */}
                        {msg.needsLogin && (
                          <div className="ai-login-required-box" style={{ margin: '0.75rem 0' }}>
                            <div className="ai-login-required-icon">
                              <LogIn size={22} />
                            </div>
                            <h4 className="ai-login-required-title">लॉगिन आवश्यक है</h4>
                            <p className="ai-login-required-desc">
                              काम खोजने या स्वीकार करने के लिए कृपया पहले लॉगिन करें।
                            </p>
                            <button
                              type="button"
                              className="ai-login-required-btn"
                              onClick={handleOpenLogin}
                            >
                              <LogIn size={16} />
                              <span>लॉगिन करें (Login Now)</span>
                            </button>
                          </div>
                        )}

                        {/* RECOMMENDED JOB CARD */}
                        {msg.suggestedJob && (
                          <div className="ai-rich-card job-card-highlight">
                            <div className="ai-card-badge">🎯 आज के लिए काम</div>
                            <h4 className="ai-card-title">{msg.suggestedJob.title}</h4>

                            <div className="ai-card-details-grid">
                              <div className="ai-detail-item">
                                <span className="ai-detail-label">दैनिक दिहाड़ी</span>
                                <span className="ai-detail-val rate">
                                  ₹{msg.suggestedJob.daily_rate || msg.suggestedJob.dailyRate}/दिन
                                </span>
                              </div>
                              <div className="ai-detail-item">
                                <span className="ai-detail-label">स्थान</span>
                                <span className="ai-detail-val">
                                  📍 {msg.suggestedJob.locality}, {msg.suggestedJob.city}
                                </span>
                              </div>
                              <div className="ai-detail-item">
                                <span className="ai-detail-label">मज़दूर चाहिए</span>
                                <span className="ai-detail-val">
                                  👷 {msg.suggestedJob.workers_needed || msg.suggestedJob.workersNeeded}
                                </span>
                              </div>
                              <div className="ai-detail-item">
                                <span className="ai-detail-label">तारीख</span>
                                <span className="ai-detail-val">
                                  📅 {msg.suggestedJob.start_date || msg.suggestedJob.startDate}
                                </span>
                              </div>
                            </div>

                            <p className="ai-card-desc">{msg.suggestedJob.description}</p>

                            <button
                              type="button"
                              className="ai-card-action-btn accept-btn"
                              onClick={() => handleAcceptJob(msg.suggestedJob)}
                            >
                              <CheckCircle size={17} />
                              <span>🤝 हाँ, मुझे कनेक्ट करा दो (Accept Work)</span>
                            </button>
                          </div>
                        )}

                        {/* DELETE USER POSTS CARDS */}
                        {msg.deleteCards && (
                          <div className="ai-delete-cards-list">
                            {msg.deleteCards.map(post => (
                              <div key={post.id} className="ai-rich-card delete-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <h4 className="ai-card-title" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>
                                    {post.title}
                                  </h4>
                                  <span className="ai-rate-chip">
                                    ₹{post.daily_rate || post.dailyRate}/day
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginBottom: '0.75rem' }}>
                                  📍 {post.locality}, {post.city} • 📅 {post.start_date || post.startDate}
                                </div>
                                <button
                                  type="button"
                                  className="ai-card-action-btn delete-btn"
                                  onClick={() => handleDeletePost(post.id)}
                                >
                                  <Trash2 size={15} />
                                  <span>🗑️ यह काम डिलीट करें (Delete Post)</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* CONTRACTOR CARDS */}
                        {msg.contractorCards && (
                          <div className="ai-cards-horizontal">
                            {msg.contractorCards.map(c => (
                              <div key={c.id} className="ai-rich-card contact-card">
                                <h4 className="ai-card-title">{c.name}</h4>
                                <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                                  ⭐ {c.rating} ({c.reviewCount} Reviews) • {c.profession}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', margin: '0.35rem 0' }}>
                                  📍 {c.locality}, {c.city}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                  <a
                                    href={`tel:${c.phone}`}
                                    className="ai-card-action-btn"
                                    style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem', textDecoration: 'none' }}
                                  >
                                    <Phone size={13} /> कॉल करें
                                  </a>
                                  <a
                                    href={`https://wa.me/${c.whatsapp}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="ai-card-action-btn"
                                    style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem', background: '#22C55E', textDecoration: 'none' }}
                                  >
                                    <MessageSquare size={13} /> व्हाट्सएप
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* ACTION CHIP OPTIONS */}
                        {msg.options && msg.options.length > 0 && (
                          <div className="ai-msg-options">
                            {msg.options.map((opt, i) => (
                              <button
                                key={i}
                                type="button"
                                className="ai-option-chip"
                                onClick={() => handleOptionClick(opt)}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestion Chips */}
                <div className="ai-quick-chips-strip">
                  <button
                    type="button"
                    className="ai-quick-chip"
                    onClick={() => handleSendMessage('आज का काम बताओ')}
                  >
                    🎯 आज का काम बताओ
                  </button>
                  <button
                    type="button"
                    className="ai-quick-chip"
                    onClick={() => handleSendMessage('हाँ मुझे काम से कनेक्ट करा दो')}
                  >
                    🤝 काम से कनेक्ट करा दो
                  </button>
                  <button
                    type="button"
                    className="ai-quick-chip"
                    onClick={() => handleSendMessage('मेरा काम डिलीट करो')}
                  >
                    🗑️ मेरा काम डिलीट करो
                  </button>
                  <button
                    type="button"
                    className="ai-quick-chip"
                    onClick={() => handleSendMessage('ठेकेदार ढूंढो')}
                  >
                    🏗️ ठेकेदार ढूंढो
                  </button>
                </div>

                {/* Chat Footer Input Area */}
                <div className="ai-dialog-footer">
                  <button
                    type="button"
                    className={`ai-giant-mic-btn ${isListening ? 'recording' : ''}`}
                    onClick={() => {
                      if (isListening) {
                        if (recognizerRef.current) try { recognizerRef.current.stop(); } catch {}
                        setIsListening(false);
                      } else {
                        startLiveListening();
                      }
                    }}
                    title="बोलें (Speak)"
                  >
                    <Mic size={24} color="#FFF" />
                  </button>

                  <form
                    className="ai-input-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                  >
                    <input
                      type="text"
                      className="ai-input-field"
                      placeholder="बोलें या यहाँ लिखें..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />

                    <button
                      type="submit"
                      className="ai-send-btn"
                      disabled={!inputText.trim()}
                      title="Send message"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
