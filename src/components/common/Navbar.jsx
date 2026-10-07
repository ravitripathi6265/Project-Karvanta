import React, { useState } from 'react';
import { useI18n } from '../../i18n/i18nContext';
import { useAuth } from '../../context/AuthContext';
import { LanguageDropdown } from './LanguageDropdown';
import { AuthModal } from './AuthModal';
import {
  HardHat,
  Briefcase,
  Users,
  PlusCircle,
  LayoutDashboard,
  Shield,
  LogIn,
  LogOut,
  UserCheck
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { t } = useI18n();
  const { currentUser, isLoggedIn, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      {/* Main Navbar */}
      <header className="navbar">
        <div className="container nav-wrapper">
          {/* Brand Logo */}
          <button
            type="button"
            className="brand-logo"
            onClick={() => setActiveTab('home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <div className="brand-icon-box">
              <HardHat size={22} />
            </div>
            <div>
              <div style={{ lineHeight: 1.1 }}>{t('app.name')}</div>
              <span className="brand-tagline">
                {t('app.name') === 'Karvanta' ? 'करवंता' : 'Karvanta'}
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="nav-links">
            <button
              type="button"
              className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              {t('nav.home')}
            </button>
            <button
              type="button"
              className={`nav-link ${activeTab === 'contractors' ? 'active' : ''}`}
              onClick={() => setActiveTab('contractors')}
            >
              <Briefcase size={16} /> {t('nav.findContractors')}
            </button>
            <button
              type="button"
              className={`nav-link ${activeTab === 'workers' ? 'active' : ''}`}
              onClick={() => setActiveTab('workers')}
            >
              <Users size={16} /> {t('nav.findWorkers')}
            </button>
            <button
              type="button"
              className={`nav-link ${activeTab === 'labourMarketplace' ? 'active' : ''}`}
              onClick={() => setActiveTab('labourMarketplace')}
            >
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', animation: 'pulse 1.5s infinite' }}></span>
              {t('nav.labourMarketplace')}
            </button>
            <button
              type="button"
              className={`nav-link ${activeTab === 'postWork' ? 'active' : ''}`}
              onClick={() => setActiveTab('postWork')}
            >
              <PlusCircle size={16} /> {t('nav.postWork')}
            </button>
            <button
              type="button"
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={16} /> {t('nav.dashboard')}
            </button>
            {currentUser?.role === 'admin' && (
              <button
                type="button"
                className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
                style={{ color: '#DC2626' }}
              >
                <Shield size={16} /> {t('nav.admin')}
              </button>
            )}
          </nav>

          {/* Actions: Language Switcher & Auth */}
          <div className="nav-actions">
            <LanguageDropdown />

            {isLoggedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveTab('dashboard')}
                  title="View Profile / Dashboard"
                >
                  <UserCheck size={15} color="var(--emerald-600)" />
                  <span style={{ fontWeight: '700', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(currentUser.full_name || currentUser.user_metadata?.full_name || currentUser.email || currentUser.phone || 'User').split(' ')[0]}
                  </span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={logout}
                  title={t('nav.logout')}
                  aria-label={t('nav.logout')}
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowAuthModal(true)}
              >
                <LogIn size={15} />
                <span>{t('nav.login')}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};
