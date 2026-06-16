/**
 * PrimeADB i18n Engine
 * Handles localization, RTL layouts, and language persistence.
 */

const SUPPORTED_LOCALES = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', rtl: false },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', rtl: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', rtl: false },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', rtl: false },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', rtl: false },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', rtl: false },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', rtl: false },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', rtl: false },
  { code: 'fr', name: 'French', nativeName: 'Français', rtl: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', rtl: false },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', rtl: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', rtl: false },
  { code: 'ko', name: 'Korean', nativeName: '한국어', rtl: false }
];

class I18nEngine {
  constructor() {
    this.locale = 'en';
    this.translations = {};
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    // Load persisted locale or detect from device
    let savedLocale = localStorage.getItem('primeadb_locale');
    if (!savedLocale) {
      savedLocale = this.detectLocale();
    }
    
    // Ensure we only use supported locales
    if (!SUPPORTED_LOCALES.find(l => l.code === savedLocale)) {
      savedLocale = 'en';
    }

    await this.setLocale(savedLocale, false);
    this.initialized = true;
  }

  detectLocale() {
    try {
      const browserLang = navigator.language.split('-')[0];
      const match = SUPPORTED_LOCALES.find(l => l.code === browserLang);
      return match ? match.code : 'en';
    } catch (e) {
      return 'en';
    }
  }

  async setLocale(localeCode, dispatchEvent = true) {
    if (!SUPPORTED_LOCALES.find(l => l.code === localeCode)) {
      console.warn(`[i18n] Locale ${localeCode} not supported. Falling back to en.`);
      localeCode = 'en';
    }

    try {
      const response = await fetch(`locales/${localeCode}.json`);
      if (!response.ok) throw new Error(`Failed to load locales/${localeCode}.json`);
      
      this.translations = await response.json();
      this.locale = localeCode;
      
      localStorage.setItem('primeadb_locale', localeCode);
      
      // Update HTML dir and lang for RTL support
      const localeObj = SUPPORTED_LOCALES.find(l => l.code === localeCode);
      document.documentElement.lang = localeCode;
      document.documentElement.dir = localeObj.rtl ? 'rtl' : 'ltr';

      if (dispatchEvent) {
        window.dispatchEvent(new CustomEvent('languagechange', { detail: { locale: localeCode } }));
      }
    } catch (e) {
      console.error('[i18n] Failed to set locale:', e);
      if (localeCode !== 'en') {
        await this.setLocale('en', dispatchEvent);
      }
    }
  }

  getLocale() {
    return this.locale;
  }

  isRTL() {
    const localeObj = SUPPORTED_LOCALES.find(l => l.code === this.locale);
    return localeObj ? localeObj.rtl : false;
  }

  getSupportedLocales() {
    return SUPPORTED_LOCALES;
  }

  /**
   * Translate a key with optional parameter interpolation.
   * Example: t('common.welcome', { name: 'User' })
   */
  t(key, params = {}) {
    let text = this.translations[key];
    
    // Fallback to English key visually if missing
    if (text === undefined) {
      console.warn(`[i18n] Missing translation for key: ${key}`);
      return key;
    }

    // Interpolate params: {name} -> params.name
    for (const [paramKey, paramValue] of Object.entries(params)) {
      text = text.replace(new RegExp(`{${paramKey}}`, 'g'), paramValue);
    }
    
    return text;
  }
}

// Export singleton instance
window.i18n = new I18nEngine();
