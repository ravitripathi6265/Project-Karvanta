import React from 'react';
import { useI18n } from '../../i18n/i18nContext';
import { HardHat, ShieldCheck, Heart } from 'lucide-react';

export const Footer = ({ setActiveTab }) => {
  const { t } = useI18n();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <div className="brand-icon-box" style={{ width: '2rem', height: '2rem', fontSize: '1rem' }}>
                <HardHat size={18} />
              </div>
              <span className="footer-brand-title">{t('app.name')}</span>
            </div>
            <p style={{ color: 'var(--slate-400)', fontSize: '0.85rem', lineHeight: '1.6', maxWidth: '340px', marginBottom: '1rem' }}>
              {t('home.heroSubtitle')}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-500)', fontSize: '0.8rem', fontWeight: '600' }}>
              <ShieldCheck size={16} />
              <span>Independent Government ID & Skill Verification</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <div style={{ color: '#fff', fontWeight: '700', marginBottom: '0.85rem', fontSize: '0.95rem' }}>
              {t('nav.findContractors')}
            </div>
            <ul className="footer-links">
              <li>
                <a href="#contractors" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveTab('contractors'); }}>
                  Residential Construction
                </a>
              </li>
              <li>
                <a href="#contractors" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveTab('contractors'); }}>
                  Home Renovation & Duplex
                </a>
              </li>
              <li>
                <a href="#contractors" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveTab('contractors'); }}>
                  RCC Column & Slab Casting
                </a>
              </li>
              <li>
                <a href="#postWork" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveTab('postWork'); }}>
                  {t('home.postYourWork')}
                </a>
              </li>
            </ul>
          </div>

          {/* Karigar & Labour */}
          <div>
            <div style={{ color: '#fff', fontWeight: '700', marginBottom: '0.85rem', fontSize: '0.95rem' }}>
              {t('nav.findWorkers')}
            </div>
            <ul className="footer-links">
              <li>
                <a href="#workers" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveTab('workers'); }}>
                  {t('categories.mason')}
                </a>
              </li>
              <li>
                <a href="#workers" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveTab('workers'); }}>
                  {t('categories.carpenter')}
                </a>
              </li>
              <li>
                <a href="#workers" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveTab('workers'); }}>
                  {t('categories.electrician')} & {t('categories.plumber')}
                </a>
              </li>
              <li>
                <a href="#chowk" className="footer-link" onClick={(e) => { e.preventDefault(); setActiveTab('labourMarketplace'); }}>
                  {t('labourMarketplace.title')}
                </a>
              </li>
            </ul>
          </div>

          {/* Major Cities */}
          <div>
            <div style={{ color: '#fff', fontWeight: '700', marginBottom: '0.85rem', fontSize: '0.95rem' }}>
              Major Hubs
            </div>
            <ul className="footer-links">
              <li><span style={{ color: 'var(--slate-400)' }}>Nagpur, Maharashtra</span></li>
              <li><span style={{ color: 'var(--slate-400)' }}>Pune & Mumbai</span></li>
              <li><span style={{ color: 'var(--slate-400)' }}>Indore & Bhopal</span></li>
              <li><span style={{ color: 'var(--slate-400)' }}>Chennai & Hyderabad</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © 2026 {t('app.name')} (कर्मवन्त). {t('app.allRightsReserved')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>Made with</span> <Heart size={14} color="#EF4444" fill="#EF4444" /> <span>for Indian Builders & Karigars</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
