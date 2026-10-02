import React from 'react';
import { useI18n } from '../../i18n/i18nContext';
import { ShieldCheck, Phone, UserCheck, Briefcase, Award } from 'lucide-react';

export const VerificationBadge = ({ verified = {}, showDetails = false }) => {
  const { t } = useI18n();

  // If verified object is passed: { phone, identity, trade, business, project }
  const isAnyVerified = verified.phone || verified.identity || verified.trade || verified.business || verified.project;

  if (!isAnyVerified) {
    return (
      <span className="verified-chip" style={{ color: 'var(--slate-500)', background: 'var(--slate-100)', borderColor: 'var(--slate-200)' }}>
        {t('verification.unverified')}
      </span>
    );
  }

  if (!showDetails) {
    return (
      <span className="verified-chip" title="Independently verified by Karvanta">
        <ShieldCheck size={14} color="var(--emerald-600)" />
        <span>
          {verified.business ? t('verification.businessVerified') :
           verified.trade ? t('verification.tradeVerified') :
           verified.identity ? t('verification.idVerified') :
           t('verification.phoneVerified')}
        </span>
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
      {verified.phone && (
        <span className="verified-chip" title={t('verification.phoneVerified')}>
          <Phone size={12} /> {t('verification.phoneVerified')}
        </span>
      )}
      {verified.identity && (
        <span className="verified-chip" title={t('verification.idVerified')}>
          <UserCheck size={12} /> {t('verification.idVerified')}
        </span>
      )}
      {verified.trade && (
        <span className="verified-chip" title={t('verification.tradeVerified')}>
          <Award size={12} /> {t('verification.tradeVerified')}
        </span>
      )}
      {verified.business && (
        <span className="verified-chip" title={t('verification.businessVerified')}>
          <Briefcase size={12} /> {t('verification.businessVerified')}
        </span>
      )}
      {verified.project && (
        <span className="verified-chip" title={t('verification.projectVerified')}>
          <ShieldCheck size={12} /> {t('verification.projectVerified')}
        </span>
      )}
    </div>
  );
};
