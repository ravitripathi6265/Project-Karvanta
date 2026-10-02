import React from 'react';
import { useI18n } from '../../i18n/i18nContext';
import { VerificationBadge } from '../common/VerificationBadge';
import { RatingStars } from '../common/RatingStars';
import { dbService } from '../../db/databaseService';
import { X, MapPin, Phone, MessageSquare, Clock, Globe, ShieldCheck, Star } from 'lucide-react';

export const WorkerProfileModal = ({ worker, isOpen, onClose, onHireWorker, onOpenReview }) => {
  const { t } = useI18n();

  if (!isOpen || !worker) return null;

  const reviews = dbService.getReviews('worker', worker.id);
  const isAvailable = worker.status === 'availableToday';

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="worker-modal-title">
      <div className="modal-dialog" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={worker.avatar}
              alt={worker.name}
              style={{ width: '3.5rem', height: '3.5rem', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
            />
            <div>
              <h2 id="worker-modal-title" className="modal-title" style={{ fontSize: '1.25rem' }}>
                {worker.name}
              </h2>
              <div style={{ color: 'var(--primary-700)', fontWeight: '600', fontSize: '0.9rem' }}>
                {worker.profession}
              </div>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label={t('common.close')}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Quick Rates Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem', border: '1px solid var(--slate-200)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: '700' }}>
                {t('workers.dailyRate').toUpperCase()}
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--slate-900)' }}>
                ₹{worker.dailyRate}
                <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--slate-500)' }}>{t('labourMarketplace.perDay')}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`status-pill ${isAvailable ? 'status-available' : 'status-busy'}`}>
                <span className="status-dot"></span>
                {isAvailable ? t('workers.availableToday') : t('workers.busy')}
              </span>
              <div style={{ marginTop: '0.35rem' }}>
                <RatingStars rating={worker.rating} count={worker.reviewCount} />
              </div>
            </div>
          </div>

          {/* Verification Badges */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Verification Tiers
            </div>
            <VerificationBadge verified={worker.verified} showDetails={true} />
          </div>

          {/* Location & Languages */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--slate-700)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={15} color="var(--primary-600)" /> Location
              </div>
              <div style={{ color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                {worker.locality}, {worker.city}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--slate-700)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Globe size={15} color="var(--primary-600)" /> {t('workers.languagesSpoken')}
              </div>
              <div style={{ color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                {worker.languages.join(', ')}
              </div>
            </div>
          </div>

          {/* Skills & Experience */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--slate-800)' }}>
              Skills & Experience ({worker.yearsExp} Years in Trade)
            </h4>
            <div className="tag-cloud">
              {worker.skills.map((skill, idx) => (
                <span key={idx} className="tag-pill" style={{ padding: '0.35rem 0.75rem', fontSize: '0.825rem' }}>
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Direct Contact Buttons */}
          <div style={{ background: 'var(--primary-50)', padding: '1rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', border: '1px solid var(--primary-100)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-800)', marginBottom: '0.65rem' }}>
              Connect directly with zero middleman fee:
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a
                href={`tel:${worker.phone}`}
                className="btn btn-call"
                style={{ flex: 1 }}
              >
                <Phone size={16} /> {t('workers.callWorker')} ({worker.phone})
              </a>
              <a
                href={`https://wa.me/${worker.whatsapp}?text=Namaste%20${encodeURIComponent(worker.name)},%20I%20saw%20your%20profile%20on%20Karvanta%20and%20need%20work.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{ flex: 1 }}
              >
                <MessageSquare size={16} /> {t('workers.whatsappWorker')}
              </a>
            </div>
          </div>

          {/* Reviews */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--slate-800)' }}>
                {t('reviews.title')} ({reviews.length})
              </h4>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => onOpenReview('worker', worker.id, worker.name)}
              >
                <Star size={13} /> {t('reviews.writeReview')}
              </button>
            </div>

            {reviews.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                No reviews yet. Work with {worker.name} and share your experience!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{ background: 'var(--slate-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontWeight: '700', fontSize: '0.875rem' }}>{rev.authorName}</span>
                        {rev.verified && (
                          <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', color: 'var(--emerald-600)', background: 'var(--emerald-50)', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-sm)', fontWeight: '700' }}>
                            ✓ Verified Customer
                          </span>
                        )}
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                          {rev.projectRef} • {rev.city} • {rev.date}
                        </div>
                      </div>
                      <RatingStars rating={rev.rating} count={0} showCount={false} size={14} />
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--slate-700)', marginTop: '0.4rem' }}>
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('common.close')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onClose();
              onHireWorker(worker);
            }}
          >
            {t('workers.hireWorker')}
          </button>
        </div>
      </div>
    </div>
  );
};
