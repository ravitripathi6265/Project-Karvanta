import React, { useState } from 'react';
import { useI18n } from '../../i18n/i18nContext';
import { Globe, Check } from 'lucide-react';

export const LanguageSelectorModal = () => {
  const {
    showLanguageModal,
    confirmInitialLanguage,
    supportedLanguages,
    currentLang,
    t
  } = useI18n();

  const [selected, setSelected] = useState(currentLang || 'hi');

  if (!showLanguageModal) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="lang-modal-title">
      <div className="modal-dialog" style={{ maxWidth: '580px' }}>
        <div className="modal-header" style={{ textAlign: 'center', display: 'block' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-700)', marginBottom: '0.75rem' }}>
            <Globe size={28} />
          </div>
          <h2 id="lang-modal-title" className="modal-title" style={{ fontSize: '1.4rem' }}>
            {t('app.selectLanguagePrompt')}
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
            Select your preferred regional language. You can change this anytime from the menu.
          </p>
        </div>

        <div className="modal-body" style={{ padding: '1rem 1.5rem' }}>
          <div className="lang-modal-grid">
            {supportedLanguages.map((lang) => {
              const isSelected = selected === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  className={`lang-select-box ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelected(lang.code)}
                  aria-pressed={isSelected}
                >
                  <span className="lang-native-title">{lang.nativeName}</span>
                  <span className="lang-english-title">{lang.name}</span>
                  {isSelected && (
                    <span style={{ color: 'var(--primary-600)', marginTop: '0.2rem' }}>
                      <Check size={16} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'center', padding: '1.25rem' }}>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', maxWidth: '320px' }}
            onClick={() => confirmInitialLanguage(selected)}
          >
            {t('app.continueBtn')} ({supportedLanguages.find(l => l.code === selected)?.nativeName})
          </button>
        </div>
      </div>
    </div>
  );
};
