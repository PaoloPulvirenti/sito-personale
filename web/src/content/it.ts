import type { SiteContent } from './types';

/**
 * Tutti i testi del sito in italiano. Per modificare il sito basta questo file.
 * Regola: niente esperienze, numeri o clienti inventati. Dove manca un dato
 * resta un TODO visibile (vedi `screenshots` del gestionale).
 */
const EMAIL = 'paolo.pulvirenti31@gmail.com';
const REPO_URL = 'https://github.com/PaoloPulvirenti/sito-personale';

export const it: SiteContent = {
  locale: 'it',
  meta: {
    siteName: 'Paolo Pulvirenti',
    title: 'Paolo Pulvirenti · Backend Software Engineer',
    description:
      'Backend engineer con oltre 6 anni su piattaforme web e microservizi (Go, Java, Node.js). Portfolio, esperienza e contatti.',
  },
  nav: [
    { href: '#chi-sono', label: 'Chi sono' },
    { href: '#esperienza', label: 'Esperienza' },
    { href: '#progetti', label: 'Progetti' },
    { href: '#ai', label: 'AI' },
    { href: '#competenze', label: 'Competenze' },
    { href: '#contatti', label: 'Contatti' },
  ],
  skipLink: 'Vai al contenuto',

  hero: {
    name: 'Paolo Pulvirenti',
    role: 'Backend Software Engineer',
    location: 'Acireale (CT) · disponibile full remote',
    tagline:
      'Costruisco servizi backend affidabili per prodotti che trattano dati delicati: fatture, dati fiscali, costi del personale.',
    photo: { file: 'foto.jpg', alt: 'Foto di Paolo Pulvirenti' },
    cv: { href: '/cv-paolo-pulvirenti.pdf', label: 'Scarica CV' },
    contactCta: 'Contattami',
  },

  about: {
    title: 'Chi sono',
    paragraphs: [
      'Sono un backend engineer con oltre 6 anni di esperienza su piattaforme web e microservizi. Oggi lavoro su Quickfisco, piattaforma di fatturazione elettronica e gestione fiscale per partite IVA: sviluppo microservizi in Go e Java e coordino task, rilasci e code review tra più gruppi di lavoro. Da un anno sono anche il referente della sede di Catania, 8 persone.',
      'Fuori dal lavoro dipendente ho progettato, venduto e mantengo Presidium, un gestionale per scuole con un cliente pagante: dall’analisi del bisogno all’architettura, fino al supporto in produzione. Uso Claude Code ogni giorno, e questo sito è costruito con lo stesso metodo di un progetto di lavoro: test, CI e deploy automatico.',
    ],
  },

  experience: {
    title: 'Esperienza',
    items: [
      {
        role: 'Software Engineer',
        company: 'Quickfisco',
        period: 'apr 2024 – oggi',
        location: 'Catania',
        summary: 'Piattaforma di fatturazione elettronica e gestione fiscale per partite IVA.',
        points: [
          'Sviluppo e manutenzione di microservizi backend in Go e Java (Spring Boot) su MongoDB, Redis e Kafka, con integrazione di API e servizi di terze parti.',
          'Code review per più gruppi di lavoro, creazione e assegnazione dei task, stima e gestione dei tempi di rilascio.',
          'Rilasci su staging e produzione con GitLab CI/CD e servizi containerizzati (Docker, Kubernetes), trattando dati fiscali e personali nel rispetto del GDPR.',
          'Referente della sede di Catania (8 persone, da settembre 2025): organizzazione dell’ufficio, fornitori e raccordo con la direzione aziendale.',
        ],
      },
      {
        role: 'Software Engineer',
        company: 'Madfarm',
        period: 'gen 2022 – mar 2024',
        location: 'Catania',
        summary: 'Applicazione web per la fatturazione elettronica basata su microservizi.',
        points: [
          'Progettazione e sviluppo di microservizi esposti tramite API REST, con architettura MVC.',
          'Migrazioni, cron job, operazioni CRUD e ottimizzazione di database MongoDB e MySQL.',
          'Testing funzionale, debugging e risoluzione dei conflitti di merge tra branch.',
          'Raccolta dei requisiti del cliente e rilascio delle feature nei tempi concordati.',
        ],
      },
    ],
  },

  projects: {
    title: 'Progetti',
    problemLabel: 'Problema',
    solutionLabel: 'Soluzione',
    stackLabel: 'Stack',
    items: [
      {
        title: 'Presidium · gestionale scolastico',
        kind: 'Prodotto mio · cliente pagante',
        problem:
          'Il dirigente di una scuola riceve ogni mese i cedolini del consulente del lavoro in PDF, ma non ha una vista chiara di quanto costa il personale, per dipendente e per plesso.',
        solution:
          'Un’applicazione desktop che legge i cedolini, ne estrae i dati e mostra i costi del personale per dipendente e per plesso, mensili e annuali. Seguita end-to-end: requisiti, architettura, sviluppo, rilascio e supporto, con contratto di manutenzione.',
        stack: [
          'Go (Beego)',
          'SQLite',
          'React',
          'TypeScript',
          'Tauri',
          'Python',
          'Cloudflare Workers',
        ],
        links: [],
        screenshots: [
          {
            file: 'presidium-home.png',
            alt: 'Home del gestionale: dipendenti in forza, buste paga del mese da inviare e grafico del netto erogato negli ultimi 12 mesi.',
          },
          {
            file: 'presidium-buste-paga.png',
            alt: 'Sezione buste paga: riepilogo dei mesi, caricamento dei PDF del consulente ed elenco dei cedolini riconosciuti.',
          },
          {
            file: 'presidium-presenze.png',
            alt: 'Riepilogo mensile delle presenze giorno per giorno, con legenda di ore corrette, extra e mancanti.',
          },
        ],
        screenshotsNote: 'Versione di prova con dati fittizi; nomi e dati anagrafici oscurati.',
      },
      {
        title: 'Gift Rush',
        kind: 'Progetto personale',
        problem:
          'Durante una diretta TikTok i regali degli spettatori passano in un attimo: chi trasmette vuole mostrarli sullo schermo in modo visibile e coinvolgente.',
        solution:
          'Un overlay in tempo reale per i regali delle LIVE: un servizio Node.js invia gli eventi via WebSocket all’overlay mostrato in OBS.',
        stack: ['Node.js', 'WebSocket', 'OBS'],
        links: [],
        screenshots: [],
      },
      {
        title: 'Questo sito',
        kind: 'Open source',
        problem:
          'Mi serviva un portfolio che fosse anche una prova tecnica: lo stack che dichiaro, usato davvero, con il codice pubblico da leggere.',
        solution:
          'Pagine statiche Astro su Firebase Hosting. Il form contatti chiama un’API Fastify su Cloud Run che valida i dati, blocca lo spam e salva il messaggio su Firestore. GitHub Actions esegue lint, test e deploy a ogni push su main.',
        stack: [
          'Astro',
          'TypeScript',
          'Tailwind CSS',
          'Fastify',
          'TypeBox',
          'Firestore',
          'Cloud Run',
          'GitHub Actions',
          'Vitest',
        ],
        links: [{ label: 'Codice su GitHub', href: REPO_URL }],
        screenshots: [],
        showArchitecture: true,
      },
    ],
  },

  architecture: {
    title: 'Architettura di questo sito',
    caption:
      'Il browser riceve pagine statiche da Firebase Hosting; solo le richieste /api arrivano al servizio Fastify su Cloud Run, che scrive su Firestore.',
    nodes: {
      browser: 'Browser',
      hosting: 'Firebase Hosting',
      api: 'Fastify · Cloud Run',
      db: 'Firestore',
      ci: 'GitHub Actions',
    },
    notes: [
      'Pagine statiche: nessun server da tenere acceso per leggere il sito.',
      'Stesso dominio per sito e API: niente CORS e nessun cookie.',
      'Cloud Run scala a zero: il costo a riposo è nullo.',
      'I messaggi scadono da soli dopo 12 mesi (TTL di Firestore).',
    ],
  },

  ai: {
    title: 'Come lavoro con l’AI',
    intro:
      'Uso Claude Code ogni giorno, al lavoro e sui miei progetti. Lo tratto come un collega molto veloce: gli do contesto e vincoli chiari, e rileggo tutto quello che produce prima che arrivi in produzione.',
    practices: [
      {
        title: 'Sviluppo',
        body: 'Parto da un piano: descrivo il problema, faccio proporre l’approccio e i file da toccare, e solo dopo si scrive codice. Un branch per attività, commit piccoli e leggibili.',
      },
      {
        title: 'Refactoring',
        body: 'Gli affido i cambi meccanici su molti file, come rinominare, spostare o uniformare, con la regola di non cambiare il comportamento. I test fanno da rete di sicurezza.',
      },
      {
        title: 'Debugging',
        body: 'Gli passo log, errore e contesto e gli chiedo ipotesi da verificare una per una, non correzioni alla cieca. La correzione arriva insieme a un test che riproduce il bug.',
      },
      {
        title: 'Code review',
        body: 'Una prima passata sul diff trova errori banali e casi limite. La review umana resta obbligatoria e si concentra su design, leggibilità e scelte di prodotto.',
      },
    ],
    teamTitle: 'Come lo introdurrei in un team',
    teamSteps: [
      'Un file di istruzioni condiviso nel repository, con convenzioni, comandi e zone da non toccare, versionato come il codice.',
      'Si parte da attività a basso rischio, come test, refactoring e documentazione, poi si passa alle feature.',
      'Regole chiare: niente segreti o dati dei clienti nei prompt, permessi minimi, ogni modifica passa da pull request e review umana.',
      'Brevi sessioni in cui ci si mostra i flussi che funzionano, così il metodo diventa del team e non del singolo.',
      'Si misura l’effetto su tempi di review e bug in produzione, e si tiene solo quello che funziona davvero.',
    ],
  },

  skills: {
    title: 'Competenze',
    groups: [
      {
        area: 'Backend',
        items: [
          'Go',
          'Java (Spring Boot)',
          'Node.js',
          'PHP',
          'API REST',
          'Microservizi',
          'Integrazioni con servizi terzi',
        ],
      },
      { area: 'Frontend', items: ['React', 'TypeScript', 'JavaScript', 'HTML/CSS'] },
      { area: 'Dati e messaging', items: ['MongoDB', 'MySQL', 'Redis', 'Kafka', 'MinIO'] },
      {
        area: 'DevOps e cloud',
        items: [
          'Docker',
          'Kubernetes',
          'AWS',
          'GitLab CI/CD',
          'Nginx',
          'VPS Linux/FreeBSD',
          'Cloudflare',
        ],
      },
      {
        area: 'Usati in questo sito',
        items: [
          'Astro',
          'Fastify',
          'TypeBox',
          'Firestore',
          'GCP Cloud Run',
          'Firebase Hosting',
          'GitHub Actions',
          'Vitest',
        ],
      },
      { area: 'AI tooling', items: ['Claude Code: sviluppo, refactoring, debugging, code review'] },
      {
        area: 'Metodo',
        items: [
          'Agile',
          'Code review',
          'Pianificazione e assegnazione task',
          'Gestione rilasci',
          'Collaborazione BE/FE',
        ],
      },
      { area: 'Lingue', items: ['Italiano madrelingua', 'Inglese B1 (lettura tecnica B2)'] },
    ],
  },

  contact: {
    title: 'Contatti',
    intro:
      'Per una posizione, una collaborazione o solo per parlare di un progetto: scrivimi qui o direttamente via email.',
    email: EMAIL,
    phone: '+39 340 310 4760',
    linkedin: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/paolo-pulvirenti-305b14371' },
    form: {
      name: 'Nome',
      email: 'Email',
      message: 'Messaggio',
      privacy:
        'Ho letto l’informativa privacy e acconsento al trattamento dei miei dati per ricevere una risposta.',
      privacyLink: 'Leggi l’informativa',
      submit: 'Invia messaggio',
      sending: 'Invio in corso…',
      success: 'Grazie! Ho ricevuto il tuo messaggio e ti rispondo al più presto.',
      errorGeneric: `Invio non riuscito. Riprova tra poco o scrivimi a ${EMAIL}.`,
      errorRateLimit: 'Hai inviato troppi messaggi in poco tempo. Riprova più tardi.',
      errorFields: 'Controlla i campi evidenziati.',
      honeypot: 'Lascia vuoto questo campo',
      noscript: `Il form richiede JavaScript. Puoi scrivermi direttamente a ${EMAIL}.`,
    },
  },

  footer: {
    repo: { label: 'Codice sorgente', href: REPO_URL },
    privacy: { label: 'Privacy', href: '/privacy/' },
    builtWith: 'Astro · Fastify · Firestore · Cloud Run',
  },

  privacy: {
    title: 'Informativa privacy',
    updated: 'Ultimo aggiornamento: 1 ottobre 2026',
    sections: [
      {
        heading: 'Titolare del trattamento',
        body: [`Paolo Pulvirenti, Acireale (CT). Contatto: ${EMAIL}.`],
      },
      {
        heading: 'Quali dati raccolgo',
        body: [
          'Solo quelli che inserisci nel form contatti: nome, email e messaggio, insieme alla data del consenso e alla versione di questa informativa.',
          'Il sito non usa cookie, né di profilazione né di statistica.',
          'Per sapere quante persone visitano il sito uso Cloudflare Web Analytics, che non usa cookie, non salva nulla sul tuo dispositivo e non identifica i singoli visitatori. Raccoglie solo dati aggregati: pagine viste, sito di provenienza, paese, browser e tipo di dispositivo.',
          'Come ogni servizio web, l’infrastruttura registra log tecnici delle richieste (ad esempio indirizzo IP e orario) per sicurezza e prevenzione degli abusi. Questi log non sono collegati ai messaggi e vengono conservati per il periodo standard di Google Cloud Logging (30 giorni).',
        ],
      },
      {
        heading: 'Perché li tratto',
        body: [
          'Per leggere il tuo messaggio e risponderti. La base giuridica è il tuo consenso (art. 6.1.a GDPR), che puoi revocare in qualsiasi momento, e, se mi contatti per una proposta di lavoro, l’esecuzione di misure precontrattuali su tua richiesta (art. 6.1.b).',
          'Le statistiche aggregate sulle visite servono a capire se il sito viene letto e da dove arrivano i visitatori. La base giuridica è il mio legittimo interesse (art. 6.1.f), dato che non identificano nessuno.',
        ],
      },
      {
        heading: 'Dove e per quanto tempo',
        body: [
          'I messaggi sono salvati su Google Cloud Firestore in un data center nell’Unione Europea. Quando ne arriva uno, ricevo una copia via email sulla mia casella Gmail per poterti rispondere.',
          'Ogni messaggio viene cancellato automaticamente da Firestore 12 mesi dopo l’invio, e cancello le copie email entro lo stesso termine. Non cedo i dati a terzi e non li uso per newsletter o marketing.',
          'Google (Firestore e Gmail) e Cloudflare (statistiche) agiscono come responsabili del trattamento. Eventuali trasferimenti fuori dall’Unione Europea avvengono nell’ambito dell’EU-U.S. Data Privacy Framework, a cui entrambe le società aderiscono.',
        ],
      },
      {
        heading: 'I tuoi diritti',
        body: [
          `Puoi chiedere in ogni momento di accedere ai tuoi dati, correggerli, cancellarli o limitarne il trattamento, e revocare il consenso, scrivendo a ${EMAIL}.`,
          'Hai anche il diritto di presentare reclamo al Garante per la protezione dei dati personali (garanteprivacy.it).',
        ],
      },
    ],
  },

  notFound: {
    title: 'Pagina non trovata',
    body: 'La pagina che cerchi non esiste o è stata spostata.',
    back: 'Torna alla home',
  },
};
