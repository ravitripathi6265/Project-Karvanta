import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/i18nContext';
import { useToast } from '../../context/ToastContext';
import { Mail, Shield, X } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { t, currentLang } = useI18n();
  const { requestOtp, verifyOtpAndLogin, loginWithGoogle } = useAuth();
  const { addToast } = useToast();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' | 'contractor' | 'worker'
  const [city, setCity] = useState('Nagpur');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast('Please enter a valid email', 'error');
      return;
    }
    setLoading(true);
    const res = await requestOtp(email);
    setLoading(false);
    if (res.success) {
      setStep('otp');
      addToast(res.message, 'success', 5000);
    } else {
      addToast(res.message, 'error');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      addToast('Please enter 6-digit OTP', 'error');
      return;
    }

    setLoading(true);
    const regData = isRegisterMode ? { name, role, city, preferredLanguage: currentLang } : null;
    const res = await verifyOtpAndLogin(email, otp, regData);
    setLoading(false);

    if (res.success) {
      addToast(`Welcome ${res.user.user_metadata?.full_name || ''}!`, 'success');
      onClose();
      // Reset
      setStep('email');
      setEmail('');
      setOtp('');
    } else {
      addToast(res.message, 'error');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const res = await loginWithGoogle();
    setLoading(false);
    if (res.success) {
      addToast('Redirecting to Google...', 'info');
    } else {
      addToast(res.message, 'error');
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div className="modal-dialog" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h2 id="auth-modal-title" className="modal-title">
            {isRegisterMode ? t('auth.registerTitle') : t('auth.loginTitle')}
          </h2>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label={t('common.close')} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {step === 'email' ? (
            <form onSubmit={handleSendOtp}>
              {isRegisterMode && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('auth.fullName')}</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Ramesh Patil"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('auth.selectRole')}</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${role === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setRole('customer')}
                      >
                        {t('roles.customer').split('/')[0]}
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${role === 'contractor' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setRole('contractor')}
                      >
                        {t('roles.contractor').split('/')[0]}
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${role === 'worker' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setRole('worker')}
                      >
                        {t('roles.worker').split('/')[0]}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('auth.city')}</label>
                    <select
                      className="form-control"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    >
                      <option value="Nagpur">Nagpur</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Pune">Pune</option>
                      <option value="Indore">Indore</option>
                      <option value="Bhopal">Bhopal</option>
                      <option value="Delhi">Delhi NCR</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Kolkata">Kolkata</option>
                    </select>
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '1rem', color: 'var(--slate-400)' }}>
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    style={{ paddingLeft: '2.8rem' }}
                    placeholder="ramesh@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                <Mail size={16} /> {loading ? 'Sending...' : 'Get Email OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label className="form-label">{t('auth.enterOtp')}</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '0.4em', fontWeight: '800' }}
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--slate-500)' }}>Sent to {email}</span>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--primary-600)', cursor: 'pointer', fontWeight: '600' }}
                    onClick={() => setStep('email')}
                    disabled={loading}
                  >
                    Change Email
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                <Shield size={16} /> {loading ? 'Verifying...' : t('auth.verifyAndProceed')}
              </button>
            </form>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0', color: 'var(--slate-400)' }}>
            <hr style={{ flex: 1, borderColor: 'var(--slate-200)', borderStyle: 'solid' }} />
            <span style={{ padding: '0 1rem', fontSize: '0.8rem', fontWeight: 600 }}>OR</span>
            <hr style={{ flex: 1, borderColor: 'var(--slate-200)', borderStyle: 'solid' }} />
          </div>

          <button 
            type="button" 
            className="btn btn-secondary btn-block btn-lg" 
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-100)' }}>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setStep('email');
              }}
              disabled={loading}
            >
              {isRegisterMode
                ? 'Already have an account? Login here'
                : "Don't have an account? Register new account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
