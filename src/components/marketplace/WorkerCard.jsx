import React from 'react';
import { useI18n } from '../../i18n/i18nContext';
import { VerificationBadge } from '../common/VerificationBadge';
import { RatingStars } from '../common/RatingStars';
import { MapPin, Phone, MessageSquare, Clock, Globe, ShieldCheck } from 'lucide-react';

export const WorkerCard = ({ worker, onViewProfile, onHireWorker }) => {
  const { t } = useI18n();

  const isAvailable = worker.status === 'availableToday';

  return (
    <article className="pro-card">
      <div className="pro-card-header">
        <img
          src={worker.avatar}
          alt={worker.name}
          className="pro-avatar"
          loading="lazy"
        />
        <div className="pro-header-meta">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 className="pro-name">{worker.name}</h3>
            <span className={`status-pill ${isAvailable ? 'status-available' : 'status-busy'}`}>
              <span className="status-dot"></span>
              {isAvailable ? t('workers.availableToday') : t('workers.busy')}
            </span>
          </div>

          <div className="pro-role" style={{ color: 'var(--primary-700)', fontWeight: '600' }}>
            {worker.profession}
          </div>

          <div className="pro-stats-strip">
            <RatingStars rating={worker.rating} count={worker.reviewCount} />
            <span>•</span>
            <span>{worker.yearsExp} {t('contractors.yearsExp')}</span>
          </div>
        </div>
      </div>

      <div className="pro-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="pro-info-row">
            <MapPin size={15} color="var(--slate-500)" />
            <span>{worker.locality}, {worker.city}</span>
          </div>
          <VerificationBadge verified={worker.verified} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--slate-50)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: '600' }}>
              {t('workers.dailyRate')}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--slate-900)' }}>
              ₹{worker.dailyRate}
              <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--slate-500)' }}>{t('labourMarketplace.perDay')}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: '600' }}>
              {t('workers.languagesSpoken')}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--slate-800)' }}>
              {worker.languages.join(', ')}
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--slate-500)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
            {t('workers.skills')}
          </div>
          <div className="tag-cloud">
            {worker.skills.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="tag-pill">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pro-card-footer">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => onViewProfile(worker)}
        >
          {t('contractors.viewProfile')}
        </button>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <a
            href={`tel:${worker.phone}`}
            className="btn btn-call btn-sm"
            title={`${t('workers.callWorker')}: ${worker.name}`}
            aria-label={`${t('workers.callWorker')} ${worker.name}`}
          >
            <Phone size={14} />
            <span>{t('workers.callWorker')}</span>
          </a>

          <a
            href={`https://wa.me/${worker.whatsapp}?text=Namaste%20${encodeURIComponent(worker.name)},%20I%20saw%20your%20profile%20on%20Karvanta%20and%20need%20work.`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp btn-sm"
            title="WhatsApp"
            aria-label={`WhatsApp ${worker.name}`}
          >
            <MessageSquare size={14} />
            <span>WA</span>
          </a>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onHireWorker(worker)}
          >
            {t('workers.hireWorker')}
          </button>
        </div>
      </div>
    </article>
  );
};
