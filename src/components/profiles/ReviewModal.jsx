import React, { useState } from 'react';
import { useI18n } from '../../i18n/i18nContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dbService } from '../../db/databaseService';
import { X, Star, Check } from 'lucide-react';

export const ReviewModal = ({ targetType, targetId, targetName, isOpen, onClose }) => {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [projectRef, setProjectRef] = useState('');
  const [authorName, setAuthorName] = useState(currentUser?.name || 'Satisfied Homeowner');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      addToast('Please write a brief comment describing your experience', 'error');
      return;
    }

    dbService.addReview({
      targetType,
      targetId,
      authorName,
      rating,
      comment,
      projectRef: projectRef || 'Construction / Maintenance',
      city: currentUser?.city || 'Nagpur'
    });

    addToast(t('reviews.reviewSuccess'), 'success');
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
      <div className="modal-dialog" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div>
            <h2 id="review-modal-title" className="modal-title">
              {t('reviews.writeReview')}
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
              For: {targetName} ({targetType === 'contractor' ? t('roles.contractor') : t('roles.worker')})
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label={t('common.close')}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Star Rating Selector */}
            <div className="form-group" style={{ textAlign: 'center', margin: '0.75rem 0 1.25rem 0' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                {t('reviews.yourRating')}
              </label>
              <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                    onClick={() => setRating(star)}
                    aria-label={`${star} Stars`}
                  >
                    <Star
                      size={32}
                      fill={rating >= star ? 'var(--amber-500)' : 'none'}
                      color={rating >= star ? 'var(--amber-500)' : 'var(--slate-300)'}
                    />
                  </button>
                ))}
              </div>
              <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--slate-800)', marginTop: '0.35rem' }}>
                {rating === 5 ? '⭐⭐⭐⭐⭐ Excellent (5.0)' :
                 rating === 4 ? '⭐⭐⭐⭐ Very Good (4.0)' :
                 rating === 3 ? '⭐⭐⭐ Average (3.0)' :
                 rating === 2 ? '⭐⭐ Needs Improvement (2.0)' : '⭐ Poor (1.0)'}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Project / Work Done</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 2BHK Renovation, Boundary Wall, Wiring..."
                value={projectRef}
                onChange={(e) => setProjectRef(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Review Details</label>
              <textarea
                className="form-control"
                placeholder={t('reviews.reviewPlaceholder')}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input
                type="text"
                className="form-control"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} /> {t('reviews.submitReview')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
