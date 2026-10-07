import React, { useState } from 'react';
import { useI18n } from '../../i18n/i18nContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dbService } from '../../db/databaseService';
import { X, Send, Calendar, Clock, MapPin, IndianRupee, Users } from 'lucide-react';
import { CityAutocomplete } from '../common/CityAutocomplete';

export const PostJobModal = ({ isOpen, onClose, onJobCreated }) => {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [category, setCategory] = useState('mason');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [workersNeeded, setWorkersNeeded] = useState(2);
  const [dailyRate, setDailyRate] = useState(1000);
  const [startDate, setStartDate] = useState('Tomorrow');
  const [startTime, setStartTime] = useState('8:00 AM');
  const [duration, setDuration] = useState('1 Day');
  const [city, setCity] = useState(currentUser?.city || 'Nagpur');
  const [locality, setLocality] = useState('Dharampeth');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      addToast('Please provide a title and work description', 'error');
      return;
    }

    const newPost = dbService.createLabourPost({
      customerId: currentUser?.id || 'u_cust_1',
      customerName: currentUser?.name || 'Anand Deshmukh',
      customerPhone: currentUser?.phone || '9822114455',
      category,
      title,
      description,
      workersNeeded: parseInt(workersNeeded, 10),
      dailyRate: parseInt(dailyRate, 10),
      startDate,
      startTime,
      duration,
      city,
      locality
    });

    addToast(t('labourMarketplace.jobPostedSuccess'), 'success', 5000);
    if (onJobCreated) onJobCreated(newPost);
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="post-job-title">
      <div className="modal-dialog" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div>
            <h2 id="post-job-title" className="modal-title">
              {t('labourMarketplace.postRequirement')}
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
              {t('labourMarketplace.subtitle')}
            </p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label={t('common.close')}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">{t('postWork.workCategory')}</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="mason">{t('categories.mason')}</option>
                <option value="labour">{t('categories.labour')}</option>
                <option value="carpenter">{t('categories.carpenter')}</option>
                <option value="electrician">{t('categories.electrician')}</option>
                <option value="plumber">{t('categories.plumber')}</option>
                <option value="painter">{t('categories.painter')}</option>
                <option value="tile_worker">{t('categories.tile_worker')}</option>
                <option value="steel_worker">{t('categories.steel_worker')}</option>
                <option value="welder">{t('categories.welder')}</option>
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
                placeholder="Explain the work location, material availability, tools needed, and specific tasks..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
              />
            </div>

            {/* Workers Count and Daily Wage */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
                  max="5000"
                  className="form-control"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Date, Time, Duration */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <div className="form-group">
                <label className="form-label">{t('labourMarketplace.startDate')}</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tomorrow / Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('labourMarketplace.startTime')}</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="8:00 AM"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('labourMarketplace.duration')}</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="1 Day / 3 Days"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* City & Locality */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <CityAutocomplete
                  className="form-control"
                  value={city}
                  onChange={(val) => setCity(val)}
                  placeholder="Search city..."
                />
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
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary">
              <Send size={15} /> {t('postWork.submitWork')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
