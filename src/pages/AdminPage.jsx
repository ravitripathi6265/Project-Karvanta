import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n/i18nContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Users,
  Briefcase,
  Wrench,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Settings
} from 'lucide-react';

export const AdminPage = () => {
  const { t } = useI18n();
  const { addToast } = useToast();
  const { currentUser } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'settings'
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const fetchProfiles = async (status) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*, professional_details(*)')
      .eq('status', status)
      .neq('role', 'customer')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching profiles:', error);
      addToast('Failed to load profiles', 'error');
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeSubTab !== 'settings') {
      fetchProfiles(activeSubTab);
    }
  }, [activeSubTab]);

  const handleUpdateStatus = async (profileId, newStatus) => {
    const { error } = await supabase.rpc('admin_update_status', {
      p_id: profileId,
      p_status: newStatus,
      p_secret: 'karvanta_admin_secret_2026'
    });

    if (error) {
      console.error('Error updating status:', error);
      addToast('Failed to update status', 'error');
    } else {
      addToast(`Profile ${newStatus} successfully`, 'success');
      fetchProfiles(activeSubTab); // Refresh list
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);

    if (error) {
      console.error('Error changing password:', error);
      addToast('Failed to change password. ' + error.message, 'error');
    } else {
      addToast('Password changed successfully!', 'success');
      setNewPassword('');
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <ShieldCheck size={48} color="#DC2626" style={{ margin: '0 auto 1rem auto' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--slate-900)' }}>Access Denied</h1>
        <p style={{ color: 'var(--slate-600)', marginTop: '0.5rem' }}>You do not have administrator privileges to view this page.</p>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginTop: '1rem' }}>Please log in via the Admin Portal Login in the main menu.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#DC2626', fontWeight: '800', fontSize: '0.825rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          <ShieldCheck size={16} /> ADMIN OPERATIONS
        </div>
        <h1 className="section-title" style={{ fontSize: '2.1rem' }}>
          {t('admin.title')}
        </h1>
        <p className="section-subtitle">
          Manage identity verifications, user moderation, review reports, and platform operations.
        </p>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button
          type="button"
          className={`btn btn-sm ${activeSubTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('pending')}
        >
          <Clock size={14} /> Pending Approvals
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeSubTab === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('approved')}
        >
          <CheckCircle size={14} /> Approved
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeSubTab === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('rejected')}
        >
          <XCircle size={14} /> Rejected
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeSubTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('settings')}
        >
          <Settings size={14} /> Settings
        </button>
      </div>

      {activeSubTab === 'settings' ? (
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem' }}>Change Admin Password</h2>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={passwordLoading} style={{ width: '100%' }}>
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
          Loading profiles...
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Professional</th>
                <th>Role & City</th>
                <th>Phone</th>
                <th>Skills & Rate</th>
                <th>Images</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No profiles found for this status.</td>
                </tr>
              ) : (
                profiles.map((p) => {
                  const profDetails = Array.isArray(p.professional_details) ? p.professional_details[0] : p.professional_details;
                  return (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.full_name || 'N/A'}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        Registered: {new Date(p.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <span className="tag-pill" style={{ textTransform: 'capitalize' }}>{p.role}</span>
                      <div style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>{p.city || 'N/A'}</div>
                    </td>
                    <td>{p.phone_number || 'N/A'}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        {profDetails?.skills?.join(', ') || 'N/A'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                        Rate: ₹{profDetails?.rate_per_day || 0}/day
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {p.avatar_url && (
                          <a href={p.avatar_url} target="_blank" rel="noreferrer">
                            <img src={p.avatar_url} alt="Avatar" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          </a>
                        )}
                        {profDetails?.portfolio_image_url && profDetails.portfolio_image_url.split(',').map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer">
                            <img src={url} alt={`Portfolio ${i}`} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          </a>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {activeSubTab !== 'approved' && (
                          <button
                            className="btn btn-sm"
                            style={{ background: 'var(--emerald-600)', color: 'white' }}
                            onClick={() => handleUpdateStatus(p.id, 'approved')}
                          >
                            <CheckCircle size={14} /> Approve
                          </button>
                        )}
                        {activeSubTab !== 'rejected' && (
                          <button
                            className="btn btn-sm"
                            style={{ background: '#DC2626', color: 'white' }}
                            onClick={() => handleUpdateStatus(p.id, 'rejected')}
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
