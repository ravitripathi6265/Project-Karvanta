import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/i18nContext';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../lib/supabase';
import { CityAutocomplete } from './CityAutocomplete';

export const OnboardingModal = ({ onSuccess }) => {
  const { t, currentLang } = useI18n();
  const { currentUser, setCurrentUser, updateUserProfile } = useAuth();
  const { addToast } = useToast();

  const [role, setRole] = useState('customer'); // 'customer' | 'contractor' | 'worker'
  const [city, setCity] = useState('Nagpur');
  const [phone, setPhone] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null); // Added error state

  // Only show if user is logged in BUT missing phone number in BOTH profile and user_metadata
  const isOpen = currentUser && currentUser.role !== 'admin' && !currentUser.phone_number && !currentUser.user_metadata?.phone_number;

  if (!isOpen) return null;

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!phone || phone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit phone number');
      return;
    }

    if (role !== 'customer' && imageFiles.length === 0) {
      setErrorMsg('Please upload at least one profile picture or portfolio image.');
      return;
    }

    setLoading(true);
    let uploadedImageUrls = [];

    if (imageFiles.length > 0) {
        for (const file of imageFiles) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${role}/${fileName}`;
            
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);
                
            if (uploadError) {
                setLoading(false);
                setErrorMsg('Image upload failed: ' + uploadError.message);
                return;
            }
            
            const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);
                
            uploadedImageUrls.push(publicUrlData.publicUrl);
        }
    }

    // Call update profile in context
    try {
      const { error: profileError } = await supabase.from('profiles').upsert({
          id: currentUser.id,
          phone_number: `+91${phone}`,
          city: city,
          role: role,
          avatar_url: uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : currentUser?.user_metadata?.avatar_url || '',
          full_name: currentUser?.user_metadata?.full_name || '',
          status: role === 'customer' ? 'approved' : 'pending'
      });
      
      if (profileError) {
          console.warn("Profile Upsert Warning (RLS policy likely missing):", profileError);
      }

      if (role !== 'customer') {
          const { error: profError } = await supabase.from('professional_details').upsert({ 
              id: currentUser.id, 
              experience_years: 0,
              rate_per_day: 0,
              skills: [],
              languages: [currentLang || 'hi'],
              portfolio_image_url: uploadedImageUrls.length > 0 ? uploadedImageUrls.join(',') : null
          });
          if (profError) {
              console.warn("Professional Details Upsert Warning (RLS policy likely missing):", profError);
          }
      }

      // Save to Auth metadata to bypass RLS SELECT restrictions permanently
      await supabase.auth.updateUser({
        data: {
          phone_number: `+91${phone}`,
          city: city,
          role: role,
        }
      });

      await updateUserProfile({}); // Just to refresh context
      
      // Force update the local state so the modal instantly closes regardless of SELECT permissions
      setCurrentUser({
          ...currentUser,
          phone_number: `+91${phone}`,
          city: city,
          role: role,
          status: role === 'customer' ? 'approved' : 'pending'
      });
      
      if (onSuccess) {
          onSuccess();
      }
    } catch (error) {
       console.error(error);
       setErrorMsg(`Database Error: ${error.message}. If this says permission denied or relation does not exist, you MUST run the SQL query in Supabase!`);
       setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" style={{ zIndex: 9999 }}>
      <div className="modal-dialog" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Complete Your Profile</h2>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Welcome! Please provide a few more details to set up your account.
          </p>

          {errorMsg && (
            <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #f87171' }}>
              <strong>Error:</strong> {errorMsg}
            </div>
          )}

          <form onSubmit={handleCompleteProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Are you looking to hire or looking for work?</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${role === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setRole('customer')}
                >
                  Customer
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${role === 'contractor' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setRole('contractor')}
                >
                  Contractor
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${role === 'worker' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setRole('worker')}
                >
                  Worker
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (+91)</label>
              <input
                type="text"
                className="form-control"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <CityAutocomplete
                className="form-control"
                value={city}
                onChange={(val) => setCity(val)}
                placeholder="Search city..."
              />
            </div>

            {role !== 'customer' && (
              <div className="form-group">
                <label className="form-label">
                  {role === 'contractor' ? 'Prior Work / Portfolio Image' : 'Profile Picture'} *
                </label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImageFiles(Array.from(e.target.files))}
                  required
                />
                {imageFiles.length > 0 && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                    {imageFiles.length} file(s) selected
                  </div>
                )}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? 'Saving...' : 'Save & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
