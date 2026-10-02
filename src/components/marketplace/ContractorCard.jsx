import React from 'react';
import { useI18n } from '../../i18n/i18nContext';
import { VerificationBadge } from '../common/VerificationBadge';
import { RatingStars } from '../common/RatingStars';
import { MapPin, Briefcase, Users, Phone, FileText } from 'lucide-react';

export const ContractorCard = ({ contractor, onViewProfile, onRequestQuote, onContact }) => {
  const { t } = useI18n();

  return (
    <article className="pro-card">
      <div className="pro-card-header">
        <img
          src={contractor.avatar}
          alt={contractor.name}
          className="pro-avatar"
          loading="lazy"
        />
        <div className="pro-header-meta">
          <h3 className="pro-name">
            {contractor.name}
          </h3>
          <div className="pro-business">{contractor.businessName}</div>
          <div className="pro-role">{contractor.profession}</div>

          <div className="pro-stats-strip">
            <RatingStars rating={contractor.rating} count={contractor.reviewCount} />
            <span>•</span>
            <span>{contractor.yearsExp} {t('contractors.yearsExp')}</span>
          </div>
        </div>
      </div>

      <div className="pro-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="pro-info-row">
            <MapPin size={15} color="var(--slate-500)" />
            <span>{contractor.locality}, {contractor.city}</span>
          </div>
          <VerificationBadge verified={contractor.verified} />
        </div>

        <div className="pro-info-row">
          <Briefcase size={15} color="var(--slate-500)" />
          <span style={{ fontWeight: '600', color: 'var(--slate-800)' }}>
            {contractor.completedProjects} {t('contractors.projectsCompleted')}
          </span>
          <span style={{ color: 'var(--slate-300)' }}>|</span>
          <Users size={15} color="var(--slate-500)" />
          <span>{contractor.teamSize}</span>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--slate-500)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
            {t('contractors.servicesOffered')}
          </div>
          <div className="tag-cloud">
            {contractor.services.slice(0, 3).map((srv, idx) => (
              <span key={idx} className="tag-pill">
                {srv}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pro-card-footer">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => onViewProfile(contractor)}
        >
          {t('contractors.viewProfile')}
        </button>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onContact(contractor)}
            title="Call / WhatsApp"
          >
            <Phone size={14} />
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onRequestQuote(contractor)}
          >
            <FileText size={14} />
            <span>{t('contractors.requestQuote')}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
