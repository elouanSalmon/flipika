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
import frRoadmap from './locales/fr/roadmap.json';
import frFeatures from './locales/fr/features.json';
import frSolutions from './locales/fr/solutions.json';
import frSeo from './locales/fr/seo.json';
import frLookerStudio from './locales/fr/alternatives/looker-studio.json';
import frAgencyAnalytics from './locales/fr/alternatives/agency-analytics.json';
import frDashThis from './locales/fr/alternatives/dashthis.json';
import frExcel from './locales/fr/alternatives/excel-spreadsheets.json';
import frSwydo from './locales/fr/alternatives/swydo.json';
import frReportGarden from './locales/fr/alternatives/reportgarden.json';
import frWhatagraph from './locales/fr/alternatives/whatagraph.json';

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
import enRoadmap from './locales/en/roadmap.json';
import enFeatures from './locales/en/features.json';
import enSolutions from './locales/en/solutions.json';
import enSeo from './locales/en/seo.json';
import enLookerStudio from './locales/en/alternatives/looker-studio.json';
import enAgencyAnalytics from './locales/en/alternatives/agency-analytics.json';
import enDashThis from './locales/en/alternatives/dashthis.json';
import enExcel from './locales/en/alternatives/excel-spreadsheets.json';
import enSwydo from './locales/en/alternatives/swydo.json';
import enReportGarden from './locales/en/alternatives/reportgarden.json';
import enWhatagraph from './locales/en/alternatives/whatagraph.json';

// Templates - French
import frGoogleAds from './locales/fr/templates/google-ads.json';
import frPpc from './locales/fr/templates/ppc.json';
import frMarketingAgency from './locales/fr/templates/marketing-agency.json';
import frEcommerce from './locales/fr/templates/ecommerce.json';
import frExecutive from './locales/fr/templates/executive.json';
import frRealEstate from './locales/fr/templates/real-estate.json';
import frFreelancer from './locales/fr/templates/freelancer.json';
import frSaas from './locales/fr/templates/saas.json';

// Templates - English
import enGoogleAds from './locales/en/templates/google-ads.json';
import enPpc from './locales/en/templates/ppc.json';
import enMarketingAgency from './locales/en/templates/marketing-agency.json';
import enEcommerce from './locales/en/templates/ecommerce.json';
import enExecutive from './locales/en/templates/executive.json';
import enRealEstate from './locales/en/templates/real-estate.json';
import enFreelancer from './locales/en/templates/freelancer.json';
import enSaas from './locales/en/templates/saas.json';

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
    roadmap: enRoadmap,
    features: enFeatures,
    solutions: enSolutions,
    'looker-studio': enLookerStudio,
    'agency-analytics': enAgencyAnalytics,
    'dashthis': enDashThis,
    'excel-spreadsheets': enExcel,
    'swydo': enSwydo,
    'reportgarden': enReportGarden,
    'whatagraph': enWhatagraph,

    // New Template Namespaces
    'templates-google-ads': enGoogleAds,
    'templates-ppc': enPpc,
    'templates-marketing-agency': enMarketingAgency,
    'templates-ecommerce': enEcommerce,
    'templates-executive': enExecutive,
    'templates-real-estate': enRealEstate,
    'templates-freelancer': enFreelancer,
    'templates-saas': enSaas,
    seo: enSeo,
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
    roadmap: frRoadmap,
    features: frFeatures,
    solutions: frSolutions,
    'looker-studio': frLookerStudio,
    'agency-analytics': frAgencyAnalytics,
    'dashthis': frDashThis,
    'excel-spreadsheets': frExcel,
    'swydo': frSwydo,
    'reportgarden': frReportGarden,
    'whatagraph': frWhatagraph,

    // New Template Namespaces
    'templates-google-ads': frGoogleAds,
    'templates-ppc': frPpc,
    'templates-marketing-agency': frMarketingAgency,
    'templates-ecommerce': frEcommerce,
    'templates-executive': frExecutive,
    'templates-real-estate': frRealEstate,
    'templates-freelancer': frFreelancer,
    'templates-saas': frSaas,
    seo: frSeo,
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
      'roadmap',
      'features',
      'looker-studio',
      'agency-analytics',
      'dashthis',
      'excel-spreadsheets',
      'swydo',
      'reportgarden',
      'whatagraph',
      // New namespaces
      'templates-google-ads',
      'templates-ppc',
      'templates-marketing-agency',
      'templates-ecommerce',
      'templates-executive',
      'templates-real-estate',
      'templates-freelancer',
      'templates-saas',
      'solutions',
      'seo'
    ],
    load: 'languageOnly',
  });

export default i18n;