import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useI18n } from '../i18n/i18nContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { changeLanguage } = useI18n();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId, userMetadata = {}) => {
    let { data, error } = await supabase
      .from('profiles')
      .select('*, professional_details(*)')
      .eq('id', userId)
      .single();
    
    // If no profile exists yet (e.g., first time Google Login), create one
    if (error && error.code === 'PGRST116') {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([{ 
           id: userId, 
           role: 'customer', 
           full_name: userMetadata?.full_name || '',
           avatar_url: userMetadata?.avatar_url || ''
        }])
        .select()
        .single();
        
      if (!insertError) {
         data = newProfile;
      } else {
         console.error('Error auto-creating profile:', insertError);
      }
    } else if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.user_metadata);
        setCurrentUser({ 
          ...session.user, 
          ...profile,
          full_name: profile?.full_name || session.user.user_metadata?.full_name || '',
          avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || '',
          phone_number: profile?.phone_number || session.user.user_metadata?.phone_number || '',
          city: profile?.city || session.user.user_metadata?.city || '',
          role: profile?.role || session.user.user_metadata?.role || 'customer'
        });
      } else {
        const storedMockAdmin = localStorage.getItem('mockAdmin');
        if (storedMockAdmin) {
          setCurrentUser(JSON.parse(storedMockAdmin));
        } else {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.user_metadata);
        setCurrentUser({ 
          ...session.user, 
          ...profile,
          full_name: profile?.full_name || session.user.user_metadata?.full_name || '',
          avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || '',
          phone_number: profile?.phone_number || session.user.user_metadata?.phone_number || '',
          city: profile?.city || session.user.user_metadata?.city || '',
          role: profile?.role || session.user.user_metadata?.role || 'customer'
        });
      } else {
        const storedMockAdmin = localStorage.getItem('mockAdmin');
        if (storedMockAdmin) {
          setCurrentUser(JSON.parse(storedMockAdmin));
        } else {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true };
  };

  const requestOtp = async (contact) => {
    if (!contact) {
      return { success: false, message: 'Please enter a valid email or phone number' };
    }
    
    let error = null;
    if (contact.includes('@')) {
      const res = await supabase.auth.signInWithOtp({ email: contact });
      error = res.error;
    } else {
      const phone = contact.startsWith('+') ? contact : `+91${contact}`;
      const res = await supabase.auth.signInWithOtp({ phone });
      error = res.error;
    }
    
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: `OTP sent to ${contact}.` };
  };

  const loginWithPassword = async (email, password) => {
    // For production level, admins can login with a predefined email and password in Supabase
    // Or we can provide a fallback hardcoded check for demonstration if Supabase auth fails
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Fallback for local testing or simple deployment without Supabase setup
      const adminEmail = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
      const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

      if (email === adminEmail && password === adminPass) {
        const mockAdmin = {
          id: 'admin-mock-id',
          role: 'admin',
          full_name: 'System Administrator',
          email: adminEmail
        };
        localStorage.setItem('mockAdmin', JSON.stringify(mockAdmin));
        setCurrentUser(mockAdmin);
        return { success: true, user: mockAdmin };
      }
      return { success: false, message: error.message };
    }
    return { success: true, user: data.user };
  };

  const verifyOtpAndLogin = async (contact, otp, registrationData = null) => {
    let error = null, data = null;
    
    if (contact.includes('@')) {
      const res = await supabase.auth.verifyOtp({
        email: contact,
        token: otp,
        type: 'email',
      });
      error = res.error;
      data = res.data;
    } else {
      const phone = contact.startsWith('+') ? contact : `+91${contact}`;
      const res = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });
      error = res.error;
      data = res.data;
    }

    if (error) {
      return { success: false, message: error.message };
    }

    if (registrationData && data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: registrationData.name,
          role: registrationData.role || 'customer',
          city: registrationData.city || 'Nagpur',
          avatar_url: registrationData.role === 'worker' && registrationData.imageUrls?.length > 0 ? registrationData.imageUrls[0] : null
        })
        .eq('id', data.user.id);
        
      if (registrationData.role !== 'customer') {
          await supabase.from('profiles').update({ status: 'pending' }).eq('id', data.user.id);
          
          await supabase.from('professional_details').insert([
              { 
                  id: data.user.id, 
                  experience_years: registrationData.experience || 0,
                  rate_per_day: registrationData.rate || 0,
                  skills: registrationData.skills || [],
                  languages: [registrationData.preferredLanguage || 'hi'],
                  portfolio_image_url: registrationData.role === 'contractor' && registrationData.imageUrls?.length > 0 ? registrationData.imageUrls.join(',') : null
              }
          ]);
      }

      if (profileError) {
        console.error("Error updating profile during registration", profileError);
      }
    }

    return { success: true, user: data.user };
  };

  const logout = async () => {
    localStorage.removeItem('mockAdmin');
    await supabase.auth.signOut();
  };

  const updateUserProfile = async (updates) => {
    if (!currentUser) return;
    
    const profileFields = ['full_name', 'phone_number', 'avatar_url', 'city', 'role', 'status'];
    const profFields = ['skills', 'experience_years', 'rate_per_day', 'languages', 'bio', 'portfolio_image_url'];
    
    let profileData = {};
    let profData = {};
    
    for (const key in updates) {
        if (profileFields.includes(key)) profileData[key] = updates[key];
        if (profFields.includes(key)) profData[key] = updates[key];
    }
    
    if (Object.keys(profileData).length > 0) {
        const { error: profileError } = await supabase.from('profiles').update(profileData).eq('id', currentUser.id);
        if (profileError) {
            console.warn('Warning updating profiles (RLS):', profileError);
        }
    }
    
    if (Object.keys(profData).length > 0) {
        const { data: profExists } = await supabase.from('professional_details').select('id').eq('id', currentUser.id).single();
        if (profExists) {
            const { error: profError } = await supabase.from('professional_details').update(profData).eq('id', currentUser.id);
            if (profError) console.warn("Prof details update warning:", profError);
        } else {
            const { error: profError } = await supabase.from('professional_details').insert([{ id: currentUser.id, ...profData }]);
            if (profError) console.warn("Prof details insert warning:", profError);
        }
    }
    
    const freshProfile = await fetchProfile(currentUser.id);
    setCurrentUser({ ...currentUser, ...freshProfile });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isLoggedIn: !!currentUser,
        loading,
        requestOtp, // now does email
        verifyOtpAndLogin, // now does email verify
        loginWithGoogle,
        loginWithPassword,
        logout,
        updateUserProfile
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
