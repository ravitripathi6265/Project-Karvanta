import React, { useState } from 'react';
import { useI18n } from '../i18n/i18nContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { Send, MapPin, Users, Calendar, IndianRupee, ShieldCheck } from 'lucide-react';

export const PostWorkPage = ({ setActiveTab }) => {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [category, setCategory] = useState('mason');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [workersNeeded, setWorkersNeeded] = useState(2);
  const [dailyRate, setDailyRate] = useState(1000);
  
  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  
  const [startTime, setStartTime] = useState('08:00');
  const [city, setCity] = useState(currentUser?.city || 'Nagpur');
  const [locality, setLocality] = useState('Dharampeth');
  const [pincode, setPincode] = useState('440010');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      addToast('You must be logged in to post a requirement', 'error');
      return;
    }
    
    if (!title.trim() || !description.trim()) {
      addToast('Please enter title and description', 'error');
      return;
    }

    const { error } = await supabase
      .from('labour_posts')
      .insert([{
        customer_id: currentUser.id,
        customer_name: currentUser.full_name || 'Customer',
        category,
        title,
        description,
        workers_needed: parseInt(workersNeeded, 10),
        daily_rate: parseInt(dailyRate, 10),
        start_date: startDate,
        start_time: startTime,
        city,
        locality
      }]);

    if (error) {
      console.error('Error posting work:', error);
      addToast('Failed to post requirement', 'error');
    } else {
      addToast(t('labourMarketplace.jobPostedSuccess'), 'success', 5000);
      setActiveTab('labourMarketplace');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem', maxWidth: '780px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ fontSize: '2.2rem' }}>
          {t('postWork.title')}
        </h1>
        <p className="section-subtitle">
          {t('postWork.subtitle')}
        </p>
      </div>

      <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('postWork.workCategory')}</label>
            <select
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="mason">{t('categories.mason')}</option>
              <option value="contractor">{t('categories.contractor')}</option>
              <option value="labour">{t('categories.labour')}</option>
              <option value="carpenter">{t('categories.carpenter')}</option>
              <option value="electrician">{t('categories.electrician')}</option>
              <option value="plumber">{t('categories.plumber')}</option>
              <option value="painter">{t('categories.painter')}</option>
              <option value="tile_worker">{t('categories.tile_worker')}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t('postWork.projectTitle')}</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Need 2 Masons tomorrow for 9-inch brick wall and plaster"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('postWork.description')}</label>
            <textarea
              className="form-control"
              placeholder="Describe the construction or repair tasks, site readiness, materials on site, scaffolding needed, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('labourMarketplace.workersNeeded')}</label>
              <input
                type="number"
                min="1"
                max="50"
                className="form-control"
                value={workersNeeded}
                onChange={(e) => setWorkersNeeded(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('labourMarketplace.dailyWageRate')} (₹/day)</label>
              <input
                type="number"
                step="50"
                min="400"
                max="10000"
                className="form-control"
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('labourMarketplace.startDate')}</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('labourMarketplace.startTime')}</label>
              <input
                type="time"
                className="form-control"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">City</label>
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

            <div className="form-group">
              <label className="form-label">Locality / Landmark</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Dharampeth"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input
                type="text"
                className="form-control"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                maxLength={6}
                required
              />
            </div>
          </div>

          <div style={{ background: 'var(--emerald-50)', border: '1px solid var(--emerald-100)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShieldCheck size={20} color="var(--emerald-600)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--emerald-800)', fontWeight: '600' }}>
              Your exact house address will remain private. Only locality is shared with nearby verified workers.
            </span>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg">
            <Send size={18} /> {t('postWork.submitWork')}
          </button>
        </form>
      </div>
    </div>
  );
};
