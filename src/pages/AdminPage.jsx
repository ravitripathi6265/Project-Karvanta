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
  Clock
} from 'lucide-react';

export const AdminPage = () => {
  const { t } = useI18n();
  const { addToast } = useToast();
  const { currentUser } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState('pending'); // 'pending' | 'approved' | 'rejected'
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetchProfiles(activeSubTab);
  }, [activeSubTab]);

  const handleUpdateStatus = async (profileId, newStatus) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', profileId);

    if (error) {
      console.error('Error updating status:', error);
      addToast('Failed to update status', 'error');
    } else {
      addToast(`Profile ${newStatus} successfully`, 'success');
      fetchProfiles(activeSubTab); // Refresh list
    }
  };

  // Restrict access
  if (currentUser?.role !== 'admin') {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <ShieldCheck size={48} color="#DC2626" style={{ margin: '0 auto 1rem auto' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--slate-900)' }}>Access Denied</h1>
        <p style={{ color: 'var(--slate-600)', marginTop: '0.5rem' }}>You do not have administrator privileges to view this page.</p>
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
      </div>

      {loading ? (
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No profiles found for this status.</td>
                </tr>
              ) : (
                profiles.map((p) => (
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
                        {p.professional_details?.skills?.join(', ') || 'N/A'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                        Rate: ₹{p.professional_details?.rate_per_day || 0}/day
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
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
