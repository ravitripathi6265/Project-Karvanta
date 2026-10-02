import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n/i18nContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import {
  User,
  Briefcase,
  Wrench,
  Clock,
  CheckCircle,
  FileText,
  Send,
  Calendar,
  IndianRupee,
  Phone,
  ShieldCheck,
  Edit3
} from 'lucide-react';

export const DashboardPage = ({ setActiveTab }) => {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const role = currentUser?.role || 'customer';

  const [labourPosts, setLabourPosts] = useState([]);
  const [profileDetails, setProfileDetails] = useState(null);
  
  // Edit Profile Form State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editExperience, setEditExperience] = useState(0);
  const [editRate, setEditRate] = useState(0);
  const [editSkills, setEditSkills] = useState('');
  const [editBio, setEditBio] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    if (role === 'customer') {
      fetchCustomerPosts();
    } else if (role === 'worker' || role === 'contractor') {
      fetchProfessionalDetails();
      fetchWorkerOpportunities();
    }
  }, [currentUser, role]);

  const fetchCustomerPosts = async () => {
    const { data, error } = await supabase
      .from('labour_posts')
      .select('*, job_applicants(worker_id)')
      .eq('customer_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const formatted = data.map(post => ({
        ...post,
        applicants: post.job_applicants.map(a => a.worker_id)
      }));
      setLabourPosts(formatted);
    }
  };

  const fetchProfessionalDetails = async () => {
    const { data, error } = await supabase
      .from('professional_details')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (!error && data) {
      setProfileDetails(data);
      setEditExperience(data.experience_years || 0);
      setEditRate(data.rate_per_day || 0);
      setEditSkills((data.skills || []).join(', '));
      setEditBio(data.bio || '');
    }
  };

  const fetchWorkerOpportunities = async () => {
    const { data, error } = await supabase
      .from('labour_posts')
      .select('*, job_applicants(worker_id)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const formatted = data.map(post => ({
        ...post,
        applicants: post.job_applicants.map(a => a.worker_id)
      }));
      setLabourPosts(formatted);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const skillsArray = editSkills.split(',').map(s => s.trim()).filter(Boolean);

    const { error } = await supabase
      .from('professional_details')
      .update({
        experience_years: editExperience,
        rate_per_day: editRate,
        skills: skillsArray,
        bio: editBio
      })
      .eq('id', currentUser.id);

    if (error) {
      console.error('Update error:', error);
      addToast('Failed to update profile details', 'error');
    } else {
      addToast('Profile updated. Submitted to admin for approval.', 'success');
      setIsEditingProfile(false);
      fetchProfessionalDetails();
      
      // Also ensure profile status is pending if edited
      if (currentUser.status !== 'approved') {
         await supabase.from('profiles').update({ status: 'pending' }).eq('id', currentUser.id);
      }
    }
  };

  const handleApplyForJob = async (jobId) => {
    const { error } = await supabase
      .from('job_applicants')
      .insert([{ job_id: jobId, worker_id: currentUser.id }]);
      
    if (error) {
      addToast('Error applying for this job', 'error');
    } else {
      addToast('Application Sent successfully!', 'success');
      fetchWorkerOpportunities();
    }
  };

  if (!currentUser) {
    return <div className="container" style={{ padding: '2rem' }}>Please login to view dashboard.</div>;
  }

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Profile Header Bar */}
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: 'var(--radius-md)', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.5rem' }}>
            {(currentUser?.full_name || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--slate-900)' }}>
                {currentUser?.full_name || currentUser?.phone_number || 'User'}
              </h1>
              <span className="verified-chip">
                <ShieldCheck size={13} /> {t(`roles.${role}`)}
              </span>
              {(role === 'worker' || role === 'contractor') && (
                <span className="verified-chip" style={{ background: currentUser.status === 'approved' ? 'var(--emerald-50)' : '#FEF3C7', color: currentUser.status === 'approved' ? 'var(--emerald-700)' : '#92400E' }}>
                  {currentUser.status === 'approved' ? 'Verified & Listed' : 'Pending Admin Approval'}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
              📞 +91 {currentUser?.phone_number || 'N/A'} • 📍 {currentUser?.city || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOMER PERSPECTIVE */}
      {role === 'customer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="section-title" style={{ fontSize: '1.35rem' }}>
                My Labour Chowk Posts ({labourPosts.length})
              </h2>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setActiveTab('postWork')}
              >
                + Post New Work
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {labourPosts.length === 0 ? (
                <div style={{ padding: '2rem', background: '#fff', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--slate-500)' }}>
                  You haven't posted any requirements yet.
                </div>
              ) : labourPosts.map((post) => (
                <div key={post.id} className="chowk-card" style={{ marginBottom: 0 }}>
                  <div className="chowk-card-header">
                    <div>
                      <span className="tag-pill" style={{ textTransform: 'uppercase', color: 'var(--primary-700)' }}>
                        {t(`categories.${post.category}`)}
                      </span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginTop: '0.35rem' }}>
                        {post.title}
                      </h3>
                    </div>
                    <div className="chowk-rate-tag">
                      ₹{post.daily_rate}/day
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                    {post.description}
                  </p>

                  <div style={{ background: 'var(--slate-50)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', color: 'var(--slate-600)' }}>
                    📍 {post.locality}, {post.city} • 👷 {post.workers_needed} Workers • 📅 {post.start_date}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--slate-100)', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--emerald-600)', fontWeight: '700' }}>
                      {post.applicants.length} Karigars Applied
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* WORKER / CONTRACTOR PERSPECTIVE */}
      {(role === 'worker' || role === 'contractor') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* PROFESSIONAL DETAILS EDITOR */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="section-title" style={{ fontSize: '1.35rem', marginBottom: 0 }}>
                My Professional Details
              </h2>
              {!isEditingProfile && (
                <button className="btn btn-outline btn-sm" onClick={() => setIsEditingProfile(true)}>
                  <Edit3 size={14} /> Edit Profile
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Years of Experience</label>
                    <input type="number" className="form-control" value={editExperience} onChange={e => setEditExperience(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Daily Rate / Project Min (₹)</label>
                    <input type="number" className="form-control" value={editRate} onChange={e => setEditRate(e.target.value)} required />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Skills (comma separated)</label>
                  <input type="text" className="form-control" placeholder="e.g. Masonry, Plaster, Tile Fixing" value={editSkills} onChange={e => setEditSkills(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Bio / About Me</label>
                  <textarea className="form-control" rows={3} value={editBio} onChange={e => setEditBio(e.target.value)}></textarea>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary">Save Details for Admin Review</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: '700' }}>EXPERIENCE</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>{profileDetails?.experience_years || 0} Years</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: '700' }}>DAILY RATE</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>₹{profileDetails?.rate_per_day || 0}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: '700' }}>SKILLS</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{(profileDetails?.skills || []).join(', ') || 'None listed'}</div>
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE OPPORTUNITIES (Worker only) */}
          {role === 'worker' && (
            <div>
              <h2 className="section-title" style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>
                Opportunities in Your Area ({labourPosts.length})
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {labourPosts.map((post) => {
                  const hasApplied = post.applicants.includes(currentUser.id);
                  return (
                    <div key={post.id} className="chowk-card">
                      <div className="chowk-card-header">
                        <div>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>{post.title}</h3>
                          <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                            📍 {post.locality}, {post.city} • 📅 {post.start_date} at {post.start_time}
                          </div>
                        </div>
                        <div className="chowk-rate-tag">
                          ₹{post.daily_rate}/day
                        </div>
                      </div>

                      <p style={{ fontSize: '0.9rem', color: 'var(--slate-700)' }}>
                        {post.description}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--slate-100)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                          Homeowner: {post.customer_name}
                        </span>
                        {hasApplied ? (
                           <span className="btn btn-sm" style={{ background: 'var(--emerald-100)', color: 'var(--emerald-800)', fontWeight: '700' }}>
                             ✓ Applied
                           </span>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleApplyForJob(post.id)}
                          >
                            Accept Work
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADMIN SHORTCUT */}
      {role === 'admin' && (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>
            Welcome Administrator
          </h2>
          <p style={{ color: 'var(--slate-600)', marginBottom: '1.5rem' }}>
            Manage marketplace users, approve verification tiers, moderate reviews, and view city-wise analytics.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => setActiveTab('admin')}
          >
            Open Full Admin Control Center
          </button>
        </div>
      )}
    </div>
  );
};
