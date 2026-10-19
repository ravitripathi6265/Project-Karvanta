import React, { useState, useEffect, useMemo } from 'react';
import { useI18n } from '../i18n/i18nContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { Zap, PlusCircle, Check, X, MapPin, Calendar, Clock, Users, IndianRupee, Trash2 } from 'lucide-react';
import { CityAutocomplete } from '../components/common/CityAutocomplete';
import { dbService } from '../db/databaseService';

export const LabourMarketplacePage = ({ onOpenPostJob }) => {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const currentWorkerId = currentUser?.role === 'worker' ? currentUser.id : null;

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('labour_posts')
        .select('*, job_applicants(worker_id)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        // Fallback to local storage posts
        const localPosts = dbService.getLabourPosts().filter(p => p.status === 'active');
        const formatted = localPosts.map(post => ({
          ...post,
          id: post.id,
          title: post.title,
          category: post.category,
          daily_rate: post.daily_rate || post.dailyRate,
          workers_needed: post.workers_needed || post.workersNeeded,
          start_date: post.start_date || post.startDate,
          start_time: post.start_time || post.startTime,
          customer_name: post.customer_name || post.customerName,
          customer_id: post.customer_id || post.customerId,
          city: post.city,
          locality: post.locality,
          description: post.description,
          applicants: post.applicants || []
        }));
        setPosts(formatted);
      } else {
        const formatted = data.map(post => ({
          ...post,
          applicants: (post.job_applicants || []).map(a => a.worker_id)
        }));
        setPosts(formatted);
      }
    } catch (err) {
      console.warn('Error fetching jobs, using local store:', err);
      const localPosts = dbService.getLabourPosts().filter(p => p.status === 'active');
      setPosts(localPosts.map(post => ({
        ...post,
        daily_rate: post.daily_rate || post.dailyRate,
        workers_needed: post.workers_needed || post.workersNeeded,
        start_date: post.start_date || post.startDate,
        start_time: post.start_time || post.startTime,
        customer_name: post.customer_name || post.customerName,
        customer_id: post.customer_id || post.customerId,
        applicants: post.applicants || []
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
    const handleUpdate = () => fetchPosts();
    window.addEventListener('karvanta-post-updated', handleUpdate);
    return () => window.removeEventListener('karvanta-post-updated', handleUpdate);
  }, []);

  const handleDeleteJob = async (jobId) => {
    const confirmMsg = t('labourMarketplace.deleteConfirm') || 'Are you sure you want to delete this job requirement?';
    if (!window.confirm(confirmMsg)) return;

    try {
      await supabase.from('labour_posts').delete().eq('id', jobId);
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }

    dbService.deleteLabourPost(jobId);
    setPosts(prev => prev.filter(p => p.id !== jobId));
    addToast(t('labourMarketplace.jobDeletedSuccess') || 'Requirement deleted successfully!', 'success');
  };

  const handleAcceptJob = async (jobId) => {
    if (!currentWorkerId) {
      addToast('Please login to apply for this job', 'error');
      return;
    }
    
    try {
      await supabase
        .from('job_applicants')
        .insert([{ job_id: jobId, worker_id: currentWorkerId }]);
    } catch (error) {
      console.warn('Supabase apply error:', error);
    }
      
    dbService.applyForLabourPost(
      jobId,
      currentWorkerId,
      currentUser?.full_name || currentUser?.name || 'कुशल कारीगर',
      currentUser?.phone_number || currentUser?.phone
    );

    addToast(t('labourMarketplace.applicationSent') || 'काम स्वीकार कर लिया गया है!', 'success', 5000);
    fetchPosts();
  };

  const handleDeclineJob = (jobId) => {
    addToast('Opportunity dismissed.', 'info');
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (selectedCity && p.city && p.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
      if (selectedCategory && p.category !== selectedCategory) return false;
      return true;
    });
  }, [posts, selectedCity, selectedCategory]);

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#EF4444', fontWeight: '800', fontSize: '0.825rem', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            <Zap size={16} /> LIVE CHOWK FEED
          </div>
          <h1 className="section-title" style={{ fontSize: '2.1rem' }}>
            {t('labourMarketplace.title')}
          </h1>
          <p className="section-subtitle">
            {t('labourMarketplace.subtitle')}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={onOpenPostJob}
        >
          <PlusCircle size={18} />
          <span>{t('labourMarketplace.postRequirement')}</span>
        </button>
      </div>

      {/* Filter Strip */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="search-input-group" style={{ maxWidth: '240px' }}>
          <MapPin size={16} color="var(--slate-400)" />
          <CityAutocomplete 
            value={selectedCity} 
            onChange={(val) => setSelectedCity(val)} 
            placeholder={t('common.allCities') || "Search city..."} 
          />
        </div>

        <div className="search-input-group" style={{ maxWidth: '240px' }}>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">{t('common.allCategories')}</option>
            <option value="mason">{t('categories.mason')}</option>
            <option value="labour">{t('categories.labour')}</option>
            <option value="carpenter">{t('categories.carpenter')}</option>
            <option value="electrician">{t('categories.electrician')}</option>
            <option value="tile_worker">{t('categories.tile_worker')}</option>
          </select>
        </div>
      </div>

      {/* Job Postings */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
          Loading live feed from Supabase...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div style={{ background: '#fff', padding: '3rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--slate-600)', fontSize: '1.05rem' }}>
            {t('labourMarketplace.noJobsFound')}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
            onClick={onOpenPostJob}
          >
            <PlusCircle size={16} /> Post Work in this Area
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredPosts.map((job) => {
            const hasApplied = currentWorkerId ? (job.applicants || []).some(a => (typeof a === 'string' ? a === currentWorkerId : a?.id === currentWorkerId)) : false;

            return (
              <div key={job.id} className="chowk-card">
                <div className="chowk-card-header">
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary-700)', background: 'var(--primary-100)', padding: '0.2rem 0.6rem', border: '1px solid var(--primary-200)', borderRadius: 'var(--radius-full)' }}>
                      {t(`categories.${job.category}`)}
                    </span>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: '0.45rem', color: 'var(--slate-900)' }}>
                      {job.title}
                    </h2>
                  </div>

                  <div className="chowk-rate-tag">
                    ₹{job.daily_rate}
                    <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>{t('labourMarketplace.perDay')}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.925rem', color: 'var(--slate-700)', lineHeight: '1.6' }}>
                  {job.description}
                </p>

                <div className="chowk-meta-row" style={{ background: 'var(--slate-50)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={15} color="var(--primary-600)" />
                    <strong>{job.locality}, {job.city}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Users size={15} color="var(--primary-600)" />
                    <span>{job.workers_needed} {t('labourMarketplace.workersNeeded')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={15} color="var(--primary-600)" />
                    <span>{t('labourMarketplace.startDate')}: <strong>{job.start_date} ({job.start_time})</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                    Posted by: <strong>{job.customer_name}</strong> • 
                    <span style={{ color: 'var(--emerald-600)', fontWeight: '700', marginLeft: '0.35rem' }}>
                      {job.applicants.length} karigars applied
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {currentUser && (currentUser.id === job.customer_id || currentUser.id === job.customerId || currentUser.role === 'admin') && (
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        onClick={() => handleDeleteJob(job.id)}
                        title={t('labourMarketplace.deleteJob') || 'Delete Post'}
                      >
                        <Trash2 size={14} /> {t('labourMarketplace.deleteJob') || 'Delete Post'}
                      </button>
                    )}

                    {hasApplied ? (
                      <span className="btn btn-sm" style={{ background: 'var(--emerald-100)', color: 'var(--emerald-800)', fontWeight: '700' }}>
                        ✓ {t('labourMarketplace.accepted')}
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDeclineJob(job.id)}
                        >
                          <X size={14} /> {t('labourMarketplace.rejectJob')}
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAcceptJob(job.id)}
                        >
                          <Check size={14} /> {t('labourMarketplace.applyForJob')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
