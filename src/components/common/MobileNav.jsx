import React from 'react';
import { useI18n } from '../../i18n/i18nContext';
import { Home, Briefcase, Users, Zap, LayoutDashboard } from 'lucide-react';

export const MobileNav = ({ activeTab, setActiveTab }) => {
  const { t } = useI18n();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <button
        type="button"
        className={`mobile-nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => setActiveTab('home')}
      >
        <Home size={19} />
        <span>{t('nav.home')}</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-item ${activeTab === 'contractors' ? 'active' : ''}`}
        onClick={() => setActiveTab('contractors')}
      >
        <Briefcase size={19} />
        <span>{t('nav.findContractors')}</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-item ${activeTab === 'labourMarketplace' ? 'active' : ''}`}
        onClick={() => setActiveTab('labourMarketplace')}
      >
        <Zap size={19} color="#EF4444" />
        <span style={{ color: '#EF4444' }}>{t('nav.labourMarketplace')}</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-item ${activeTab === 'workers' ? 'active' : ''}`}
        onClick={() => setActiveTab('workers')}
      >
        <Users size={19} />
        <span>{t('nav.findWorkers')}</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
      >
        <LayoutDashboard size={19} />
        <span>{t('nav.dashboard')}</span>
      </button>
    </nav>
  );
};
