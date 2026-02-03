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
import frTemplatesPillar from './locales/fr/templates-pillar.json';
import frLeadMagnets from './locales/fr/lead-magnets.json';
import frLookerStudio from './locales/fr/alternatives/looker-studio.json';
import frAgencyAnalytics from './locales/fr/alternatives/agency-analytics.json';
import frDashThis from './locales/fr/alternatives/dashthis.json';
import frExcel from './locales/fr/alternatives/excel-spreadsheets.json';

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
import enTemplatesPillar from './locales/en/templates-pillar.json';
import enLeadMagnets from './locales/en/lead-magnets.json';
import enLookerStudio from './locales/en/alternatives/looker-studio.json';
import enAgencyAnalytics from './locales/en/alternatives/agency-analytics.json';
import enDashThis from './locales/en/alternatives/dashthis.json';
import enExcel from './locales/en/alternatives/excel-spreadsheets.json';

// Templates - French
import frGoogleAds from './locales/fr/templates/google-ads.json';
import frPpc from './locales/fr/templates/ppc.json';
import frMarketingAgency from './locales/fr/templates/marketing-agency.json';
import frEcommerce from './locales/fr/templates/ecommerce.json';
import frExecutive from './locales/fr/templates/executive.json';

// Templates - English
import enGoogleAds from './locales/en/templates/google-ads.json';
import enPpc from './locales/en/templates/ppc.json';
import enMarketingAgency from './locales/en/templates/marketing-agency.json';
import enEcommerce from './locales/en/templates/ecommerce.json';
import enExecutive from './locales/en/templates/executive.json';

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
    'templates-pillar': enTemplatesPillar, // Keep for safety or remove if unused
    'lead-magnets': enLeadMagnets,
    'looker-studio': enLookerStudio,
    'agency-analytics': enAgencyAnalytics,
    'dashthis': enDashThis,
    'excel-spreadsheets': enExcel,

    // New Template Namespaces
    'templates:google-ads': enGoogleAds,
    'templates:ppc': enPpc,
    'templates:marketing-agency': enMarketingAgency,
    'templates:ecommerce': enEcommerce,
    'templates:executive': enExecutive,
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
    'templates-pillar': frTemplatesPillar,
    'lead-magnets': frLeadMagnets,
    'looker-studio': frLookerStudio,
    'agency-analytics': frAgencyAnalytics,
    'dashthis': frDashThis,
    'excel-spreadsheets': frExcel,

    // New Template Namespaces
    'templates:google-ads': frGoogleAds,
    'templates:ppc': frPpc,
    'templates:marketing-agency': frMarketingAgency,
    'templates:ecommerce': frEcommerce,
    'templates:executive': frExecutive,
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
    ns: [
      'common',
      'dashboard',
      'reports',
      'templates',
      'schedules',
      'settings',
      'billing',
      'copilot',
      'audit',
      'themes',
      'alternatives',
      'templates-pillar',
      'lead-magnets',
      'looker-studio',
      'agency-analytics',
      'dashthis',
      'excel-spreadsheets',
      // New namespaces
      'templates:google-ads',
      'templates:ppc',
      'templates:marketing-agency',
      'templates:ecommerce',
      'templates:executive'
    ],
    load: 'languageOnly',
  });

export default i18n;