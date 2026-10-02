import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../../i18n/i18nContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

export const LanguageDropdown = () => {
  const { currentLang, currentLangMeta, supportedLanguages, changeLanguage, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="lang-dropdown-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="lang-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title={t('app.switchLanguage')}
      >
        <Globe size={16} />
        <span>{currentLangMeta?.nativeName || 'हिन्दी'}</span>
        <ChevronDown size={14} style={{ opacity: 0.7 }} />
      </button>

      {isOpen && (
        <div className="lang-dropdown-menu" role="listbox" aria-label="Select Language">
          <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--slate-400)', textTransform: 'uppercase' }}>
            {t('app.switchLanguage')}
          </div>
          {supportedLanguages.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                className={`lang-dropdown-item ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={isSelected}
              >
                <div>
                  <div style={{ fontWeight: isSelected ? '700' : '600' }}>{lang.nativeName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{lang.name}</div>
                </div>
                {isSelected && <Check size={16} color="var(--primary-600)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
