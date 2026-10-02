import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useI18n } from '../i18n/i18nContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { changeLanguage } = useI18n();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, professional_details(*)')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setCurrentUser({ ...session.user, ...profile });
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setCurrentUser({ ...session.user, ...profile });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true };
  };

  // We are using Email Magic Link instead of SMS OTP to bypass Twilio config issues
  const requestOtp = async (email) => {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Please enter a valid email address' };
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
    });
    
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: `OTP / Magic Link sent to ${email}.` };
  };

  const verifyOtpAndLogin = async (email, otp, registrationData = null) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: 'email',
    });

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
                  languages: [registrationData.preferredLanguage || 'hi']
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
    await supabase.auth.signOut();
  };

  const updateUserProfile = async (updates) => {
    if (!currentUser) return;
    
    const profileFields = ['full_name', 'phone_number', 'avatar_url', 'city'];
    const profFields = ['skills', 'experience_years', 'rate_per_day', 'languages', 'bio'];
    
    let profileData = {};
    let profData = {};
    
    for (const key in updates) {
        if (profileFields.includes(key)) profileData[key] = updates[key];
        if (profFields.includes(key)) profData[key] = updates[key];
    }
    
    if (Object.keys(profileData).length > 0) {
        await supabase.from('profiles').update(profileData).eq('id', currentUser.id);
    }
    
    if (Object.keys(profData).length > 0) {
        const { data: profExists } = await supabase.from('professional_details').select('id').eq('id', currentUser.id).single();
        if (profExists) {
            await supabase.from('professional_details').update(profData).eq('id', currentUser.id);
        } else {
            await supabase.from('professional_details').insert([{ id: currentUser.id, ...profData }]);
        }
    }
    
    const freshProfile = await fetchProfile(currentUser.id);
    setCurrentUser({ ...currentUser, ...freshProfile });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn: !!currentUser,
        loading,
        requestOtp, // now does email
        verifyOtpAndLogin, // now does email verify
        loginWithGoogle,
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
