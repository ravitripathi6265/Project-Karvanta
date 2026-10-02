import React, { useState, useEffect, useMemo } from 'react';
import { useI18n } from '../i18n/i18nContext';
import { supabase } from '../lib/supabase';
import { WorkerCard } from '../components/marketplace/WorkerCard';
import { Search, MapPin, Filter, ShieldCheck, ArrowUpDown, Clock } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const WorkersPage = ({ onViewWorker, onHireWorker }) => {
  const { t } = useI18n();
  const { addToast } = useToast();
  
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availableTodayOnly, setAvailableTodayOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'experience' | 'priceLow'

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          phone_number,
          city,
          avatar_url,
          status,
          professional_details (
            skills,
            experience_years,
            rate_per_day,
            languages,
            bio
          )
        `)
        .eq('role', 'worker')
        .eq('status', 'approved');

      if (error) {
        console.error('Error fetching workers:', error);
        addToast('Failed to load workers.', 'error');
      } else {
        const formatted = data.map(profile => ({
          id: profile.id,
          name: profile.full_name || 'Unknown',
          category: 'mason', // We can derive this from skills later
          profession: 'Skilled Karigar',
          city: profile.city || 'Nagpur',
          locality: 'Local Area',
          rating: 5.0,
          reviewCount: 0,
          yearsExp: profile.professional_details?.experience_years || 0,
          dailyRate: profile.professional_details?.rate_per_day || 850,
          status: 'availableToday', // Could be fetched from a live status column
          avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
          verified: { identity: true },
          languages: profile.professional_details?.languages || ['Hindi'],
          skills: profile.professional_details?.skills || ['General Masonry'],
          phone: profile.phone_number || '9876543210',
          whatsapp: `91${profile.phone_number || '9876543210'}`
        }));
        setWorkers(formatted);
      }
      setLoading(false);
    };

    fetchWorkers();
  }, [addToast]);

  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      // Keyword
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesName = w.name.toLowerCase().includes(query);
        const matchesProf = w.profession.toLowerCase().includes(query);
        const matchesSkills = w.skills.some(s => s.toLowerCase().includes(query));
        if (!matchesName && !matchesProf && !matchesSkills) return false;
      }

      // City
      if (selectedCity && w.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // Category
      if (selectedCategory && w.category !== selectedCategory) {
        return false;
      }

      // Available today
      if (availableTodayOnly && w.status !== 'availableToday') {
        return false;
      }

      // Verified
      if (verifiedOnly && !w.verified.identity) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'experience') return b.yearsExp - a.yearsExp;
      if (sortBy === 'priceLow') return a.dailyRate - b.dailyRate;
      return 0;
    });
  }, [workers, searchTerm, selectedCity, selectedCategory, availableTodayOnly, verifiedOnly, sortBy]);

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="section-title" style={{ fontSize: '2.1rem' }}>
          {t('workers.title')}
        </h1>
        <p className="section-subtitle">
          {t('workers.subtitle')}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ background: '#fff', padding: '1.25rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', alignItems: 'center' }}>
          {/* Keyword Search */}
          <div className="search-input-group">
            <Search size={16} color="var(--slate-400)" />
            <input
              type="text"
              placeholder="Search skill (e.g. Mason, Wiring, Plaster)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* City filter */}
          <div className="search-input-group">
            <MapPin size={16} color="var(--slate-400)" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">{t('common.allCities')}</option>
              <option value="Nagpur">Nagpur</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Pune">Pune</option>
              <option value="Bhopal">Bhopal</option>
              <option value="Chennai">Chennai</option>
              <option value="Delhi">Delhi NCR</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Bengaluru">Bengaluru</option>
            </select>
          </div>

          {/* Trade Category */}
          <div className="search-input-group">
            <Filter size={16} color="var(--slate-400)" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">{t('common.allCategories')}</option>
              <option value="mason">{t('categories.mason')}</option>
              <option value="carpenter">{t('categories.carpenter')}</option>
              <option value="electrician">{t('categories.electrician')}</option>
              <option value="plumber">{t('categories.plumber')}</option>
              <option value="labour">{t('categories.labour')}</option>
              <option value="tile_worker">{t('categories.tile_worker')}</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="search-input-group">
            <ArrowUpDown size={16} color="var(--slate-400)" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rating">{t('common.rating')}</option>
              <option value="experience">{t('common.experience')}</option>
              <option value="priceLow">Daily Wage (Low to High)</option>
            </select>
          </div>
        </div>

        {/* Checkboxes: Available Today & Verified Only */}
        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--slate-100)', display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--slate-700)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={availableTodayOnly}
              onChange={(e) => setAvailableTodayOnly(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--emerald-600)' }}
            />
            <Clock size={16} color="var(--emerald-600)" />
            <span>{t('workers.availableToday')} Only</span>
          </label>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--slate-700)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--emerald-600)' }}
            />
            <ShieldCheck size={16} color="var(--emerald-600)" />
            <span>{t('common.verifiedOnly')}</span>
          </label>

          <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--slate-500)' }}>
            Showing <strong>{filteredWorkers.length}</strong> skilled workers
          </span>
        </div>
      </div>

      {/* Grid of Workers */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
          Loading workers from Supabase...
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div style={{ background: '#fff', padding: '3rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--slate-600)', fontSize: '1rem' }}>
            {t('common.noResultsFound')}
          </p>
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginTop: '1rem' }}
            onClick={() => {
              setSearchTerm('');
              setSelectedCity('');
              setSelectedCategory('');
              setAvailableTodayOnly(false);
              setVerifiedOnly(false);
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {filteredWorkers.map((w) => (
            <WorkerCard
              key={w.id}
              worker={w}
              onViewProfile={onViewWorker}
              onHireWorker={onHireWorker}
            />
          ))}
        </div>
      )}
    </div>
  );
};
