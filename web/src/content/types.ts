/**
 * Forma dei contenuti del sito. Ogni lingua (oggi solo `it`) fornisce un oggetto
 * `SiteContent`: i componenti leggono solo da qui, nessun testo è scritto nel markup.
 */
export type Locale = 'it';

export interface Link {
  label: string;
  href: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  location: string;
  summary: string;
  points: string[];
}

export interface Project {
  title: string;
  kind: string;
  problem: string;
  solution: string;
  stack: string[];
  links: Link[];
  /** File in src/assets/progetti/ (screenshot con dati fittizi). */
  screenshots: { file: string; alt: string }[];
  /** Se valorizzato e non ci sono screenshot, compare un TODO visibile con questo testo. */
  screenshotsTodo?: string;
  /** Se true, sotto la card compare il diagramma dell'architettura del sito. */
  showArchitecture?: boolean;
}

export interface SkillGroup {
  area: string;
  items: string[];
}

export interface AiPractice {
  title: string;
  body: string;
}

export interface SiteContent {
  locale: Locale;
  meta: { title: string; description: string; siteName: string };
  nav: { href: string; label: string }[];
  skipLink: string;
  hero: {
    name: string;
    role: string;
    location: string;
    tagline: string;
    /** File in src/assets/ (ottimizzato da Astro); se manca compare un TODO. */
    photo: { file: string; alt: string };
    cv: { href: string; label: string };
    contactCta: string;
  };
  about: { title: string; paragraphs: string[] };
  experience: { title: string; items: ExperienceItem[] };
  projects: {
    title: string;
    problemLabel: string;
    solutionLabel: string;
    stackLabel: string;
    items: Project[];
  };
  architecture: {
    title: string;
    caption: string;
    nodes: { browser: string; hosting: string; api: string; db: string; ci: string };
    notes: string[];
  };
  ai: {
    title: string;
    intro: string;
    practices: AiPractice[];
    teamTitle: string;
    teamSteps: string[];
  };
  skills: { title: string; groups: SkillGroup[] };
  contact: {
    title: string;
    intro: string;
    email: string;
    phone: string;
    linkedin: Link;
    form: {
      name: string;
      email: string;
      message: string;
      privacy: string;
      privacyLink: string;
      submit: string;
      sending: string;
      success: string;
      errorGeneric: string;
      errorRateLimit: string;
      errorFields: string;
      honeypot: string;
      noscript: string;
    };
  };
  footer: { repo: Link; privacy: Link; builtWith: string };
  privacy: {
    title: string;
    updated: string;
    sections: { heading: string; body: string[] }[];
  };
  notFound: { title: string; body: string; back: string };
}
