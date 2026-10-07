import React, { useState } from 'react';
import { useI18n } from '../../i18n/i18nContext';
import { VerificationBadge } from '../common/VerificationBadge';
import { RatingStars } from '../common/RatingStars';
import { dbService } from '../../db/databaseService';
import {
  X,
  MapPin,
  Briefcase,
  Users,
  Calendar,
  CheckCircle,
  Phone,
  FileText,
  Star
} from 'lucide-react';

export const ContractorProfileModal = ({ contractor, isOpen, onClose, onRequestQuote, onOpenReview }) => {
  const { t } = useI18n();

  if (!isOpen || !contractor) return null;

  const reviews = dbService.getReviews('contractor', contractor.id);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="cont-modal-title">
      <div className="modal-dialog" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={contractor.avatar}
              alt={contractor.name}
              style={{ width: '3.5rem', height: '3.5rem', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
            />
            <div>
              <h2 id="cont-modal-title" className="modal-title" style={{ fontSize: '1.25rem' }}>
                {contractor.name}
              </h2>
              <div style={{ color: 'var(--primary-700)', fontWeight: '600', fontSize: '0.9rem' }}>
                {contractor.businessName}
              </div>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label={t('common.close')}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Quick Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem', border: '1px solid var(--slate-200)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: '600' }}>RATING</div>
              <RatingStars rating={contractor.rating} count={contractor.reviewCount} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: '600' }}>EXPERIENCE</div>
              <div style={{ fontWeight: '800', color: 'var(--slate-900)' }}>{contractor.yearsExp} Years</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: '600' }}>PROJECTS</div>
              <div style={{ fontWeight: '800', color: 'var(--slate-900)' }}>{contractor.completedProjects} Delivered</div>
            </div>
          </div>

          {/* Verification Status */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Verification Tiers
            </div>
            <VerificationBadge verified={contractor.verified} showDetails={true} />
          </div>

          {/* About */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--slate-800)' }}>
              About Contractor & Firm
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', lineHeight: '1.6' }}>
              {contractor.about}
            </p>
          </div>

          {/* Location & Team */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--slate-700)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={15} color="var(--primary-600)" /> Operating Area
              </div>
              <div style={{ color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                {contractor.locality}, {contractor.city} & surrounding 25 km
              </div>
            </div>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--slate-700)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Users size={15} color="var(--primary-600)" /> On-Roll Team Size
              </div>
              <div style={{ color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                {contractor.teamSize} (Masons, Shuttering, Labour)
              </div>
            </div>
          </div>

          {/* Previous Projects Gallery */}
          {contractor.portfolioImage && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--slate-800)' }}>
                Work Evidence & Portfolio Images
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                {contractor.portfolioImage.split(',').filter(Boolean).map((imgUrl, idx) => (
                  <div
                    key={idx}
                    style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#fff' }}
                  >
                    <img
                      src={imgUrl}
                      alt={`Portfolio Image ${idx + 1}`}
                      style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified Reviews Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--slate-800)' }}>
                {t('reviews.title')} ({reviews.length})
              </h4>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => onOpenReview('contractor', contractor.id, contractor.name)}
              >
                <Star size={13} /> {t('reviews.writeReview')}
              </button>
            </div>

            {reviews.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                No reviews yet. Be the first customer to leave verified feedback!
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
              onRequestQuote(contractor);
            }}
          >
            <FileText size={16} /> {t('contractors.requestQuote')}
          </button>
        </div>
      </div>
    </div>
  );
};
