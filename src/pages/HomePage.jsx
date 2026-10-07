import React, { useState } from 'react';
import { useI18n } from '../i18n/i18nContext';
import { dbService } from '../db/databaseService';
import { ContractorCard } from '../components/marketplace/ContractorCard';
import { WorkerCard } from '../components/marketplace/WorkerCard';
import {
  Search,
  MapPin,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle,
  PhoneCall,
  Languages,
  ArrowRight,
  PlusCircle,
  Hammer,
  Wrench,
  Paintbrush,
  BrickWall,
  Briefcase
} from 'lucide-react';
import { CityAutocomplete } from '../components/common/CityAutocomplete';

export const HomePage = ({
  setActiveTab,
  onViewContractor,
  onRequestQuote,
  onViewWorker,
  onHireWorker,
  onOpenPostJob
}) => {
  const { t } = useI18n();

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const contractors = dbService.getContractors();
  const workers = dbService.getWorkers();
  const labourPosts = dbService.getLabourPosts().filter(p => p.status === 'active');

  const categories = [
    { id: 'mason', name: t('categories.mason'), icon: '🧱' },
    { id: 'contractor', name: t('categories.contractor'), icon: '🏗️' },
    { id: 'labour', name: t('categories.labour'), icon: '👷' },
    { id: 'carpenter', name: t('categories.carpenter'), icon: '🪚' },
    { id: 'electrician', name: t('categories.electrician'), icon: '⚡' },
    { id: 'plumber', name: t('categories.plumber'), icon: '🔧' },
    { id: 'painter', name: t('categories.painter'), icon: '🎨' },
    { id: 'tile_worker', name: t('categories.tile_worker'), icon: '🔲' }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (selectedCategory === 'contractor') {
      setActiveTab('contractors');
    } else {
      setActiveTab('workers');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-badge">
            <ShieldCheck size={16} />
            <span>{t('home.heroBadge')}</span>
          </div>

          <h1 className="hero-title">
            {t('home.heroTitle')}
          </h1>

          <p className="hero-subtitle">
            {t('home.heroSubtitle')}
          </p>

          {/* Search Box Card */}
          <div className="search-card-container">
            <form onSubmit={handleSearchSubmit} className="search-grid">
              <div className="search-input-group">
                <Search size={18} color="var(--slate-400)" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label={t('home.searchCategory')}
                >
                  <option value="">{t('home.searchCategory')}</option>
                  <option value="contractor">{t('categories.contractor')}</option>
                  <option value="mason">{t('categories.mason')}</option>
                  <option value="labour">{t('categories.labour')}</option>
                  <option value="carpenter">{t('categories.carpenter')}</option>
                  <option value="electrician">{t('categories.electrician')}</option>
                  <option value="plumber">{t('categories.plumber')}</option>
                  <option value="painter">{t('categories.painter')}</option>
                  <option value="tile_worker">{t('categories.tile_worker')}</option>
                </select>
              </div>

              <div className="search-input-group">
                <MapPin size={18} color="var(--slate-400)" />
                <CityAutocomplete
                  value={selectedCity}
                  onChange={(val) => setSelectedCity(val)}
                  placeholder={t('home.searchLocation') || "Search city..."}
                  className="search-input-field"
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ height: '100%' }}>
                <Search size={18} />
                <span>{t('home.findProfessionals')}</span>
              </button>
            </form>
          </div>

          {/* Quick CTA Buttons */}
          <div className="hero-quick-actions">
            <button
              type="button"
              className="btn btn-outline btn-lg"
              onClick={onOpenPostJob}
            >
              <PlusCircle size={18} />
              <span>{t('home.postYourWork')}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={() => setActiveTab('labourMarketplace')}
            >
              <Zap size={18} color="#EF4444" />
              <span>{t('labourMarketplace.title')} ({labourPosts.length} Active)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Category Icons Grid */}
      <section className="category-strip">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Popular Trade Categories</h2>
              <p className="section-subtitle">Select a specialty to find verified local professionals</p>
            </div>
          </div>

          <div className="category-grid">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="category-card"
                onClick={() => {
                  if (cat.id === 'contractor') {
                    setActiveTab('contractors');
                  } else {
                    setActiveTab('workers');
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="category-icon">{cat.icon}</div>
                <div className="category-name">{cat.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Digital Labour Chowk Section */}
      {labourPosts.length > 0 && (
        <section style={{ padding: '2.5rem 0', background: 'var(--slate-50)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="container">
            <div className="section-header">
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#EF4444', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></span>
                  LIVE DIGITAL CHOWK
                </div>
                <h2 className="section-title">{t('labourMarketplace.title')}</h2>
                <p className="section-subtitle">{t('labourMarketplace.subtitle')}</p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={onOpenPostJob}
                >
                  <PlusCircle size={14} /> {t('labourMarketplace.postRequirement')}
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setActiveTab('labourMarketplace')}
                >
                  View All ({labourPosts.length}) <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {labourPosts.slice(0, 3).map((job) => (
                <div key={job.id} className="chowk-card">
                  <div className="chowk-card-header">
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary-700)', background: 'var(--primary-50)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                        {t(`categories.${job.category}`)}
                      </span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginTop: '0.4rem', color: 'var(--slate-900)' }}>
                        {job.title}
                      </h3>
                    </div>
                    <div className="chowk-rate-tag">
                      ₹{job.dailyRate}
                      <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>/day</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: '1.5' }}>
                    {job.description}
                  </p>

                  <div className="chowk-meta-row">
                    <div>📍 {job.locality}, {job.city}</div>
                    <div>👷 {job.workersNeeded} Workers</div>
                    <div>📅 {job.startDate} ({job.startTime})</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--slate-100)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      Posted by {job.customerName}
                    </span>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setActiveTab('labourMarketplace')}
                    >
                      {t('labourMarketplace.applyForJob')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Contractors */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">{t('home.featuredContractors')}</h2>
              <p className="section-subtitle">Verified thekedars with completed project portfolios</p>
            </div>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setActiveTab('contractors')}
            >
              {t('home.viewAllContractors')} <ArrowRight size={16} />
            </button>
          </div>

          <div className="card-grid">
            {contractors.slice(0, 3).map((cont) => (
              <ContractorCard
                key={cont.id}
                contractor={cont}
                onViewProfile={onViewContractor}
                onRequestQuote={onRequestQuote}
                onContact={onViewContractor}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Skilled Workers / Karigars */}
      <section style={{ padding: '3rem 0', background: 'var(--slate-50)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">{t('home.featuredWorkers')}</h2>
              <p className="section-subtitle">Trusted mistris, carpenters, and electricians ready for work</p>
            </div>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setActiveTab('workers')}
            >
              {t('home.viewAllWorkers')} <ArrowRight size={16} />
            </button>
          </div>

          <div className="card-grid">
            {workers.slice(0, 3).map((w) => (
              <WorkerCard
                key={w.id}
                worker={w}
                onViewProfile={onViewWorker}
                onHireWorker={onHireWorker}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How Karvanta Works */}
      <section style={{ padding: '3.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 className="section-title" style={{ fontSize: '2rem' }}>
              {t('home.howItWorksTitle')}
            </h2>
            <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0.4rem auto 0 auto' }}>
              {t('home.howItWorksSubtitle')}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.3rem', marginBottom: '1rem' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--slate-900)' }}>
                {t('home.step1Title')}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', lineHeight: '1.6' }}>
                {t('home.step1Desc')}
              </p>
            </div>

            <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', background: 'var(--emerald-100)', color: 'var(--emerald-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.3rem', marginBottom: '1rem' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--slate-900)' }}>
                {t('home.step2Title')}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', lineHeight: '1.6' }}>
                {t('home.step2Desc')}
              </p>
            </div>

            <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', background: '#FEF3C7', color: '#92400E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.3rem', marginBottom: '1rem' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--slate-900)' }}>
                {t('home.step3Title')}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', lineHeight: '1.6' }}>
                {t('home.step3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Built On Trust for India */}
      <section style={{ padding: '3.5rem 0', background: 'linear-gradient(135deg, var(--slate-900), #1E293B)', color: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#fff' }}>
              {t('home.whyTrustUsTitle')}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <ShieldCheck size={28} color="var(--emerald-500)" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.4rem', color: '#fff' }}>
                {t('home.trust1Title')}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-300)', lineHeight: '1.6' }}>
                {t('home.trust1Desc')}
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <PhoneCall size={28} color="var(--primary-500)" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.4rem', color: '#fff' }}>
                {t('home.trust2Title')}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-300)', lineHeight: '1.6' }}>
                {t('home.trust2Desc')}
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Languages size={28} color="#FBBF24" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.4rem', color: '#fff' }}>
                {t('home.trust3Title')}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-300)', lineHeight: '1.6' }}>
                {t('home.trust3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
