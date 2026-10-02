import React, { useState, useEffect, useMemo } from 'react';
import { useI18n } from '../i18n/i18nContext';
import { supabase } from '../lib/supabase';
import { ContractorCard } from '../components/marketplace/ContractorCard';
import { Search, MapPin, Filter, ShieldCheck, ArrowUpDown } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const ContractorsPage = ({ onViewContractor, onRequestQuote }) => {
  const { t } = useI18n();
  const { addToast } = useToast();
  
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'experience'

  useEffect(() => {
    const fetchContractors = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
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
        .eq('role', 'contractor')
        .eq('status', 'approved');

      if (error) {
        console.error('Error fetching contractors:', error);
        addToast('Failed to load contractors.', 'error');
      } else {
        // Map to expected format
        const formatted = data.map(profile => ({
          id: profile.id,
          name: profile.full_name || 'Unknown',
          businessName: `${profile.full_name || 'Unknown'} Construction`,
          profession: 'General Contractor',
          city: profile.city || 'Nagpur',
          locality: 'Main City',
          rating: 5.0, // Default mock rating
          reviewCount: 0,
          yearsExp: profile.professional_details?.experience_years || 0,
          teamSize: '5-10 Workers',
          completedProjects: 0,
          avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          verified: { identity: true }, // Approved means verified
          services: profile.professional_details?.skills || ['Residential Construction'],
          about: profile.professional_details?.bio || `Professional contractor serving ${profile.city}.`,
          languages: profile.professional_details?.languages || ['Hindi'],
          availability: 'Available for New Projects',
          minBudget: '₹1,00,000',
          projects: []
        }));
        setContractors(formatted);
      }
      setLoading(false);
    };

    fetchContractors();
  }, [addToast]);

  const filteredContractors = useMemo(() => {
    return contractors.filter((c) => {
      // Search term
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesBiz = c.businessName.toLowerCase().includes(query);
        const matchesServ = c.services.some(s => s.toLowerCase().includes(query));
        if (!matchesName && !matchesBiz && !matchesServ) return false;
      }

      // City
      if (selectedCity && c.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // Service
      if (selectedService && !c.services.some(s => s.toLowerCase().includes(selectedService.toLowerCase()))) {
        return false;
      }

      // Verified
      if (verifiedOnly && !c.verified.identity) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'experience') return b.yearsExp - a.yearsExp;
      if (sortBy === 'projects') return b.completedProjects - a.completedProjects;
      return 0;
    });
  }, [contractors, searchTerm, selectedCity, selectedService, verifiedOnly, sortBy]);

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="section-title" style={{ fontSize: '2.1rem' }}>
          {t('contractors.title')}
        </h1>
        <p className="section-subtitle">
          {t('contractors.subtitle')}
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
              placeholder="Search contractor or business..."
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
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Indore">Indore</option>
              <option value="Bhopal">Bhopal</option>
              <option value="Delhi">Delhi NCR</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Chennai">Chennai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Kolkata">Kolkata</option>
            </select>
          </div>

          {/* Specialization */}
          <div className="search-input-group">
            <Filter size={16} color="var(--slate-400)" />
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              <option value="">All Services</option>
              <option value="Residential">Residential Construction</option>
              <option value="Renovation">Renovation & Interiors</option>
              <option value="RCC">RCC Structural Works</option>
              <option value="Flooring">Flooring & Plaster</option>
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
              <option value="projects">Most Projects Delivered</option>
            </select>
          </div>
        </div>

        {/* Verification Checkbox */}
        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--slate-100)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
            Showing <strong>{filteredContractors.length}</strong> contractors
          </span>
        </div>
      </div>

      {/* Grid of Contractors */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
          Loading contractors from Supabase...
        </div>
      ) : filteredContractors.length === 0 ? (
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
              setSelectedService('');
              setVerifiedOnly(false);
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {filteredContractors.map((cont) => (
            <ContractorCard
              key={cont.id}
              contractor={cont}
              onViewProfile={onViewContractor}
              onRequestQuote={onRequestQuote}
              onContact={onViewContractor}
            />
          ))}
        </div>
      )}
    </div>
  );
};
