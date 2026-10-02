import React, { useState } from 'react';
import { useI18n } from '../../i18n/i18nContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dbService } from '../../db/databaseService';
import { X, Send } from 'lucide-react';

export const RequestQuoteModal = ({ contractor, isOpen, onClose }) => {
  const { t } = useI18n();
  const { currentUser, isLoggedIn } = useAuth();
  const { addToast } = useToast();

  const [projectScope, setProjectScope] = useState('');
  const [materialPreference, setMaterialPreference] = useState('withMaterial');
  const [customerName, setCustomerName] = useState(currentUser?.name || 'Anand Deshmukh');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '9822114455');
  const [city, setCity] = useState(contractor?.city || 'Nagpur');

  if (!isOpen || !contractor) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!projectScope.trim()) {
      addToast('Please enter project details and scope', 'error');
      return;
    }

    dbService.createQuotationRequest({
      customerId: currentUser?.id || 'u_cust_1',
      customerName,
      customerPhone,
      contractorId: contractor.id,
      contractorName: contractor.name,
      projectScope,
      materialPreference,
      city
    });

    addToast(t('quotations.quoteSentSuccess'), 'success');
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="quote-modal-title">
      <div className="modal-dialog" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div>
            <h2 id="quote-modal-title" className="modal-title">
              {t('quotations.title')}
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
              To: {contractor.name} ({contractor.businessName})
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label={t('common.close')}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">{t('quotations.projectDetails')}</label>
              <textarea
                className="form-control"
                placeholder="e.g. Build 1200 sq ft duplex house (G+1) with 3 bedrooms, 3 bathrooms, and porch. RCC framed structure..."
                value={projectScope}
                onChange={(e) => setProjectScope(e.target.value)}
                required
                rows={4}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('quotations.materialPreference')}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${materialPreference === 'withMaterial' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setMaterialPreference('withMaterial')}
                >
                  {t('quotations.withMaterial')}
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${materialPreference === 'labourOnly' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setMaterialPreference('labourOnly')}
                >
                  {t('quotations.labourOnly')}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">{t('auth.fullName')}</label>
                <input
                  type="text"
                  className="form-control"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.phoneLabel')}</label>
                <input
                  type="tel"
                  className="form-control"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
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
              <Send size={15} /> {t('quotations.submitQuotation')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
