/**
 * ISA Internationalization (i18n) Support
 * 
 * Provides Dutch and English language support for the ISA application.
 * Designed for GS1 Nederland users while maintaining English as default.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'nl';

interface Translations {
  [key: string]: {
    en: string;
    nl: string;
  };
}

// Core UI translations
export const translations: Translations = {
  // Navigation
  'nav.home': { en: 'Home', nl: 'Home' },
  'nav.dashboard': { en: 'Dashboard', nl: 'Dashboard' },
  'nav.askIsa': { en: 'Ask ISA', nl: 'Vraag ISA' },
  'nav.regulations': { en: 'Regulations', nl: 'Regelgeving' },
  'nav.standards': { en: 'Standards', nl: 'Standaarden' },
  'nav.news': { en: 'News', nl: 'Nieuws' },
  'nav.tools': { en: 'Tools', nl: 'Tools' },
  'nav.templates': { en: 'Templates', nl: 'Sjablonen' },
  'nav.about': { en: 'About', nl: 'Over ISA' },
  'nav.contact': { en: 'Contact', nl: 'Contact' },
  
  // Common actions
  'action.search': { en: 'Search', nl: 'Zoeken' },
  'action.filter': { en: 'Filter', nl: 'Filteren' },
  'action.export': { en: 'Export', nl: 'Exporteren' },
  'action.download': { en: 'Download', nl: 'Downloaden' },
  'action.save': { en: 'Save', nl: 'Opslaan' },
  'action.cancel': { en: 'Cancel', nl: 'Annuleren' },
  'action.submit': { en: 'Submit', nl: 'Verzenden' },
  'action.back': { en: 'Back', nl: 'Terug' },
  'action.next': { en: 'Next', nl: 'Volgende' },
  'action.previous': { en: 'Previous', nl: 'Vorige' },
  'action.viewAll': { en: 'View All', nl: 'Alles bekijken' },
  'action.learnMore': { en: 'Learn More', nl: 'Meer informatie' },
  'action.getStarted': { en: 'Get Started', nl: 'Aan de slag' },
  
  // Ask ISA
  'askIsa.title': { en: 'Ask ISA', nl: 'Vraag ISA' },
  'askIsa.subtitle': { en: 'Your AI-powered compliance assistant', nl: 'Uw AI-gestuurde compliance assistent' },
  'askIsa.placeholder': { en: 'Ask me anything about GS1 standards, ESG regulations, or compliance...', nl: 'Stel me een vraag over GS1 standaarden, ESG regelgeving of compliance...' },
  'askIsa.thinking': { en: 'Thinking...', nl: 'Aan het nadenken...' },
  'askIsa.sources': { en: 'Sources', nl: 'Bronnen' },
  'askIsa.relatedTopics': { en: 'Related Topics', nl: 'Gerelateerde onderwerpen' },
  'askIsa.suggestedQuestions': { en: 'Suggested Questions', nl: 'Voorgestelde vragen' },
  
  // Regulations Hub
  'hub.title': { en: 'Regulatory Hub', nl: 'Regelgeving Hub' },
  'hub.regulations': { en: 'Regulations', nl: 'Regelgeving' },
  'hub.initiatives': { en: 'Initiatives', nl: 'Initiatieven' },
  'hub.dutchInitiatives': { en: 'Dutch Initiatives', nl: 'Nederlandse Initiatieven' },
  'hub.calendar': { en: 'Calendar', nl: 'Kalender' },
  'hub.compare': { en: 'Compare', nl: 'Vergelijken' },
  'hub.mappings': { en: 'Mappings', nl: 'Koppelingen' },
  
  // Industry Templates
  'templates.title': { en: 'Industry-Specific Compliance Templates', nl: 'Sector-specifieke Compliance Sjablonen' },
  'templates.subtitle': { en: 'Pre-built compliance roadmaps tailored to your industry', nl: 'Kant-en-klare compliance roadmaps voor uw sector' },
  'templates.selectIndustry': { en: 'Select your industry', nl: 'Selecteer uw sector' },
  'templates.complexity': { en: 'Complexity', nl: 'Complexiteit' },
  'templates.timeline': { en: 'Timeline', nl: 'Tijdlijn' },
  'templates.phases': { en: 'Phases', nl: 'Fases' },
  'templates.requirements': { en: 'Key Requirements', nl: 'Belangrijkste vereisten' },
  'templates.quickWins': { en: 'Quick Wins', nl: 'Quick Wins' },
  'templates.deadlines': { en: 'Critical Deadlines', nl: 'Kritieke deadlines' },
  
  // Sectors (GS1 NL aligned)
  'sector.fmcg': { en: 'Food & Beverage (FMCG)', nl: 'Levensmiddelen & drogisterij (FMCG)' },
  'sector.retail': { en: 'Retail & Consumer Goods', nl: 'Doe-het-zelf, tuin & dier' },
  'sector.healthcare': { en: 'Healthcare & Medical Devices', nl: 'Gezondheidszorg' },
  'sector.agricultural': { en: 'Agricultural & Fresh', nl: 'Agrarisch & vers' },
  'sector.fashion': { en: 'Fashion & Textiles', nl: 'Mode & textiel' },
  'sector.marketplaces': { en: 'Marketplaces & E-commerce', nl: 'Marketplaces & e-commerce' },
  'sector.construction': { en: 'Construction & Installation', nl: 'Bouw & installatie' },
  
  // Compliance
  'compliance.status': { en: 'Compliance Status', nl: 'Compliance Status' },
  'compliance.compliant': { en: 'Compliant', nl: 'Compliant' },
  'compliance.nonCompliant': { en: 'Non-Compliant', nl: 'Niet-compliant' },
  'compliance.inProgress': { en: 'In Progress', nl: 'In uitvoering' },
  'compliance.notStarted': { en: 'Not Started', nl: 'Niet gestart' },
  'compliance.score': { en: 'Compliance Score', nl: 'Compliance Score' },
  'compliance.gap': { en: 'Gap Analysis', nl: 'Gap Analyse' },
  'compliance.roadmap': { en: 'Compliance Roadmap', nl: 'Compliance Roadmap' },
  
  // Data Quality
  'dataQuality.title': { en: 'Data Quality', nl: 'Datakwaliteit' },
  'dataQuality.score': { en: 'Quality Score', nl: 'Kwaliteitsscore' },
  'dataQuality.issues': { en: 'Issues Found', nl: 'Gevonden problemen' },
  'dataQuality.recommendations': { en: 'Recommendations', nl: 'Aanbevelingen' },
  
  // News
  'news.title': { en: 'News & Updates', nl: 'Nieuws & Updates' },
  'news.latest': { en: 'Latest News', nl: 'Laatste nieuws' },
  'news.regulatory': { en: 'Regulatory Updates', nl: 'Regelgeving updates' },
  'news.readMore': { en: 'Read More', nl: 'Lees meer' },
  'news.publishedOn': { en: 'Published on', nl: 'Gepubliceerd op' },
  
  // Common labels
  'label.date': { en: 'Date', nl: 'Datum' },
  'label.status': { en: 'Status', nl: 'Status' },
  'label.category': { en: 'Category', nl: 'Categorie' },
  'label.type': { en: 'Type', nl: 'Type' },
  'label.description': { en: 'Description', nl: 'Beschrijving' },
  'label.details': { en: 'Details', nl: 'Details' },
  'label.overview': { en: 'Overview', nl: 'Overzicht' },
  'label.summary': { en: 'Summary', nl: 'Samenvatting' },
  'label.results': { en: 'Results', nl: 'Resultaten' },
  'label.noResults': { en: 'No results found', nl: 'Geen resultaten gevonden' },
  'label.loading': { en: 'Loading...', nl: 'Laden...' },
  'label.error': { en: 'Error', nl: 'Fout' },
  'label.success': { en: 'Success', nl: 'Succes' },
  'label.warning': { en: 'Warning', nl: 'Waarschuwing' },
  
  // Complexity levels
  'complexity.low': { en: 'Low', nl: 'Laag' },
  'complexity.medium': { en: 'Medium', nl: 'Gemiddeld' },
  'complexity.high': { en: 'High', nl: 'Hoog' },
  
  // Time periods
  'time.days': { en: 'days', nl: 'dagen' },
  'time.weeks': { en: 'weeks', nl: 'weken' },
  'time.months': { en: 'months', nl: 'maanden' },
  'time.years': { en: 'years', nl: 'jaren' },
  
  // Footer
  'footer.copyright': { en: '© 2025 ISA - Intelligent Standards Assistant', nl: '© 2025 ISA - Intelligente Standaarden Assistent' },
  'footer.poweredBy': { en: 'Powered by GS1 Nederland', nl: 'Mogelijk gemaakt door GS1 Nederland' },
  'footer.privacy': { en: 'Privacy Policy', nl: 'Privacybeleid' },
  'footer.terms': { en: 'Terms of Service', nl: 'Algemene voorwaarden' },
  
  // GS1 specific
  'gs1.dataSource': { en: 'GS1 Data Source', nl: 'GS1 Data Source' },
  'gs1.beneluxDatamodel': { en: 'Benelux Datamodel', nl: 'Benelux Datamodel' },
  'gs1.digitalLink': { en: 'GS1 Digital Link', nl: 'GS1 Digital Link' },
  'gs1.verifiedByGs1': { en: 'Verified by GS1', nl: 'Geverifieerd door GS1' },
  
  // Sustainability
  'sustainability.dpp': { en: 'Digital Product Passport', nl: 'Digitaal Product Paspoort' },
  'sustainability.carbonFootprint': { en: 'Carbon Footprint', nl: 'CO2-voetafdruk' },
  'sustainability.ecoScore': { en: 'Eco-score', nl: 'Eco-score' },
  'sustainability.circularity': { en: 'Circularity', nl: 'Circulariteit' },
  'sustainability.traceability': { en: 'Traceability', nl: 'Traceerbaarheid' },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  // Default to Dutch for GS1 Nederland users, with browser detection
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('isa-language');
    if (stored === 'en' || stored === 'nl') return stored;
    
    // Check browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('nl')) return 'nl';
    
    // Default to Dutch for GS1 NL focus
    return 'nl';
  });

  useEffect(() => {
    localStorage.setItem('isa-language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, fallback?: string): string => {
    const translation = translations[key];
    if (translation) {
      return translation[language];
    }
    return fallback || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Language switcher component
export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();
  
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage('nl')}
        className={`px-2 py-1 text-sm rounded ${
          language === 'nl' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        NL
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 text-sm rounded ${
          language === 'en' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        EN
      </button>
    </div>
  );
}
