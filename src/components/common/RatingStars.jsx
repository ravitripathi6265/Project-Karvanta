import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ rating = 5.0, count = 0, size = 15, showCount = true }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center' }}>
        {stars.map((s) => {
          const isFilled = rating >= s;
          const isHalf = rating >= s - 0.5 && rating < s;
          return (
            <Star
              key={s}
              size={size}
              fill={isFilled ? 'var(--amber-500)' : isHalf ? 'var(--amber-500)' : 'none'}
              color={isFilled || isHalf ? 'var(--amber-500)' : 'var(--slate-300)'}
              style={{ marginRight: '1px' }}
            />
          );
        })}
      </div>
      <span style={{ fontWeight: '800', fontSize: '0.85rem', color: 'var(--slate-900)' }}>
        {rating.toFixed(1)}
      </span>
      {showCount && count > 0 && (
        <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
          ({count})
        </span>
      )}
    </div>
  );
};
