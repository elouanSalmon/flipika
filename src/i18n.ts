import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Landing & Global
import enCommon from './locales/en/common.json';
import frCommon from './locales/fr/common.json';

// Authenticated Pages - French
import frDashboard from './locales/fr/dashboard.json';
import frReports from './locales/fr/reports.json';
import frTemplates from './locales/fr/templates.json';
import frSchedules from './locales/fr/schedules.json';
import frSettings from './locales/fr/settings.json';
import frBilling from './locales/fr/billing.json';
import frCopilot from './locales/fr/copilot.json';
import frAudit from './locales/fr/audit.json';
import frThemes from './locales/fr/themes.json';
import frClients from './locales/fr/clients.json';
import frTutorial from './locales/fr/tutorial.json';
import frAlternatives from './locales/fr/alternatives.json';

// Authenticated Pages - English
import enDashboard from './locales/en/dashboard.json';
import enReports from './locales/en/reports.json';
import enTemplates from './locales/en/templates.json';
import enSchedules from './locales/en/schedules.json';
import enSettings from './locales/en/settings.json';
import enBilling from './locales/en/billing.json';
import enCopilot from './locales/en/copilot.json';
import enAudit from './locales/en/audit.json';
import enThemes from './locales/en/themes.json';
import enClients from './locales/en/clients.json';
import enTutorial from './locales/en/tutorial.json';
import enAlternatives from './locales/en/alternatives.json';

// ... other imports

const resources = {
  en: {
    common: enCommon,
    dashboard: enDashboard,
    reports: enReports,
    templates: enTemplates,
    schedules: enSchedules,
    settings: enSettings,
    billing: enBilling,
    copilot: enCopilot,
    audit: enAudit,
    themes: enThemes,
    clients: enClients,
    tutorial: enTutorial,
    alternatives: enAlternatives,
  },
  fr: {
    common: frCommon,
    dashboard: frDashboard,
    reports: frReports,
    templates: frTemplates,
    schedules: frSchedules,
    settings: frSettings,
    billing: frBilling,
    copilot: frCopilot,
    audit: frAudit,
    themes: frThemes,
    clients: frClients,
    tutorial: frTutorial,
    alternatives: frAlternatives,
  },
};

const detectionOptions = {
  order: ['localStorage', 'navigator', 'htmlTag'],
  lookupLocalStorage: 'i18nextLng',
  caches: ['localStorage'],
  fallbackLng: 'fr',
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: ['en', 'fr'],
    debug: false,
    detection: detectionOptions,
    interpolation: {
      escapeValue: false,
    },
    defaultNS: 'common',
    ns: ['common', 'dashboard', 'reports', 'templates', 'schedules', 'settings', 'billing', 'copilot', 'audit', 'themes', 'alternatives'],
    load: 'languageOnly',
  });

export default i18n;