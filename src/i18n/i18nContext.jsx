import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './languages';

import en from '../locales/en.json';
import hi from '../locales/hi.json';
import mr from '../locales/mr.json';
import ta from '../locales/ta.json';
import te from '../locales/te.json';
import bn from '../locales/bn.json';
import gu from '../locales/gu.json';
import kn from '../locales/kn.json';
import ml from '../locales/ml.json';
import pa from '../locales/pa.json';
import or from '../locales/or.json';
import as from '../locales/as.json';

const translations = { en, hi, mr, ta, te, bn, gu, kn, ml, pa, or, as };

const I18nContext = createContext(null);

const STORAGE_KEY = 'karvanta_user_lang';
const HAS_SELECTED_LANG_KEY = 'karvanta_lang_selected_flag';

export const I18nProvider = ({ children }) => {
  // Check local storage for previously saved language
  const [currentLang, setCurrentLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && translations[saved]) {
        return saved;
      }
    } catch (e) {
      console.error('Error reading saved language', e);
    }
    return DEFAULT_LANGUAGE;
  });

  // Track if language selection modal has been completed
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(() => {
    try {
      return localStorage.getItem(HAS_SELECTED_LANG_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [showLanguageModal, setShowLanguageModal] = useState(!hasSelectedLanguage);

  // Set html lang attribute and font family dynamically when language changes
  useEffect(() => {
    document.documentElement.lang = currentLang;
    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLang);
    if (langObj && langObj.fontFamily) {
      document.body.style.fontFamily = langObj.fontFamily;
    }
  }, [currentLang]);

  const changeLanguage = useCallback((langCode) => {
    if (!translations[langCode]) {
      console.warn(`[i18n] Language code "${langCode}" not supported. Fallback to English.`);
      langCode = 'en';
    }
    setCurrentLangState(langCode);
    try {
      localStorage.setItem(STORAGE_KEY, langCode);
      localStorage.setItem(HAS_SELECTED_LANG_KEY, 'true');
      setHasSelectedLanguage(true);
    } catch (e) {
      console.error('Error saving language preference', e);
    }
  }, []);

  const confirmInitialLanguage = useCallback((langCode) => {
    changeLanguage(langCode);
    setShowLanguageModal(false);
  }, [changeLanguage]);

  // Translation helper function: t('home.heroTitle', { param: 'val' })
  const t = useCallback((keyPath, params = {}) => {
    if (!keyPath) return '';
    const keys = keyPath.split('.');
    
    // Attempt lookup in current language
    let currentDict = translations[currentLang];
    let val = currentDict;
    for (const k of keys) {
      if (val && typeof val === 'object' && k in val) {
        val = val[k];
      } else {
        val = undefined;
        break;
      }
    }

    // Fallback to English if missing
    if (val === undefined) {
      if (import.meta.env.DEV) {
        console.warn(`[i18n MISSING KEY] Lang: "${currentLang}" Key: "${keyPath}"`);
      }
      let fallbackDict = translations['en'];
      val = fallbackDict;
      for (const k of keys) {
        if (val && typeof val === 'object' && k in val) {
          val = val[k];
        } else {
          val = undefined;
          break;
        }
      }
    }

    if (val === undefined) {
      return keyPath; // Last fallback
    }

    if (typeof val === 'string') {
      let str = val;
      for (const p of Object.keys(params)) {
        str = str.replace(new RegExp(`{${p}}`, 'g'), params[p]);
      }
      return str;
    }

    return val;
  }, [currentLang]);

  const currentLangMeta = useMemo(() => {
    return SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];
  }, [currentLang]);

  const value = useMemo(() => ({
    currentLang,
    currentLangMeta,
    supportedLanguages: SUPPORTED_LANGUAGES,
    changeLanguage,
    confirmInitialLanguage,
    showLanguageModal,
    setShowLanguageModal,
    hasSelectedLanguage,
    t
  }), [currentLang, currentLangMeta, changeLanguage, confirmInitialLanguage, showLanguageModal, hasSelectedLanguage, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
