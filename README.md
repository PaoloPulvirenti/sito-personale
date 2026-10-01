# Sito personale · Paolo Pulvirenti

Portfolio e prova tecnica: il sito è costruito con lo stack che dichiaro
(Node.js + TypeScript, Fastify, Firestore, Cloud Run) e il codice è pubblico.

**Online:** https://paolo.presidium-app.com

```
            GET /                         POST /api/contact             add()
 Browser ─────────────▶ Firebase Hosting ──────────────────▶ Fastify su ─────────▶ Firestore
                        (pagine statiche)     rewrite         Cloud Run            (TTL 12 mesi)

 GitHub Actions: lint · format · typecheck · test (con emulatore) · build ─▶ deploy di Cloud Run e Hosting
```

## Struttura

```
.
├── api/                      API Fastify (Cloud Run)
│   ├── src/
│   │   ├── app.ts            costruzione dell'app (usata da server e test)
│   │   ├── server.ts         avvio, scelta dello storage, arresto su SIGTERM
│   │   ├── config.ts         configurazione da variabili d'ambiente
│   │   ├── contact.ts        logica di dominio: honeypot, normalizzazione
│   │   ├── schemas/          schemi TypeBox (validazione + tipi)
│   │   ├── routes/           /health e /api/contact
│   │   └── repositories/     interfaccia + Firestore + memoria
│   └── test/                 unit e integration (Vitest)
├── web/                      sito Astro (Firebase Hosting)
│   ├── src/content/          TUTTI i testi del sito (it.ts)
│   ├── src/components/       sezioni della pagina
│   ├── src/assets/           foto e screenshot (ottimizzati in build)
│   └── public/               CV in PDF, favicon
├── Dockerfile                immagine dell'API
├── docker-compose.yml        sviluppo locale con emulatore Firestore
├── firebase.json             hosting, rewrite verso Cloud Run, header di sicurezza
├── firestore.rules           nessun accesso diretto dai client
└── .github/workflows/ci.yml  CI/CD
```

## Scelte tecniche

| Scelta                                   | Perché                                                                                                          |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Astro statico**                        | Il sito è quasi tutto testo: HTML generato in build, un solo script (il form). Lighthouse 100 su tutte le voci. |
| **Fastify + TypeBox**                    | Lo schema è una sola fonte di verità: valida il body a runtime e genera i tipi TypeScript.                      |
| **Repository come interfaccia**          | Le route non conoscono Firestore: i test girano in memoria, Firestore si prova a parte con l'emulatore.         |
| **Firebase Hosting davanti a Cloud Run** | Sito e API sullo stesso dominio: niente CORS, certificato gestito da Google, CDN gratis.                        |
| **Cloud Run a zero istanze**             | Costo nullo a riposo; il cold start non pesa per un form di contatto.                                           |
| **Workload Identity Federation**         | La pipeline si autentica su GCP con OIDC: nessuna chiave JSON nei secret.                                       |
| **Log con `severity`**                   | Pino scrive JSON che Cloud Logging interpreta senza agent.                                                      |

### Sicurezza e GDPR

- **Validazione** di ogni campo lato server (TypeBox), campi extra scartati, body massimo 16 KB.
- **Honeypot**: un campo nascosto che solo i bot compilano. Il bot riceve comunque `201`, così non capisce cosa l'ha fermato.
- **Rate limit** per IP sul form (5 messaggi ogni 10 minuti). L'IP si legge da `X-Forwarded-For` fidandosi solo dei salti di proxy indicati in `TRUST_PROXY_HOPS`: su Cloud Run il container si raggiunge solo dal front end Google, quindi il conteggio non è falsificabile.
- **Minimizzazione**: si salvano solo nome, email, messaggio, data del consenso e versione dell'informativa. Niente IP né user agent nel database.
- **Conservazione**: ogni messaggio ha un campo `expireAt` e una policy TTL di Firestore lo cancella dopo 12 mesi, come dichiarato in `/privacy`.
- **Nessun cookie**. Le statistiche usano Cloudflare Web Analytics, senza cookie e solo aggregate. CSP senza `unsafe-inline`, `frame-ancestors 'none'`, HSTS.
- **Avviso email** a ogni messaggio (Gmail SMTP). La password per le app sta in Secret Manager e un errore di invio non fa perdere il messaggio, già salvato su Firestore.
- **Segreti**: nessuno nel repo. Su Cloud Run le credenziali arrivano dal service account.
- **Regole Firestore** chiuse: il database non è raggiungibile dal browser.

## Sviluppo locale

Serve Node.js 24 (vedi `.nvmrc`).

```bash
npm install
```

**Senza Docker**, con i messaggi in memoria:

```bash
cp api/.env.example api/.env    # MESSAGE_STORE=memory
npm run dev:api                 # http://localhost:8080
npm run dev:web                 # http://localhost:4321 (/api va all'API locale)
```

**Con Docker**, con l'emulatore Firestore:

```bash
docker compose up
```

Sito su http://localhost:4321, API su http://localhost:8080.

### Comandi

| Comando                                           | Cosa fa                                 |
| ------------------------------------------------- | --------------------------------------- |
| `npm test`                                        | test unit e integration dell'API        |
| `FIRESTORE_EMULATOR_HOST=localhost:8081 npm test` | anche i test sull'emulatore Firestore   |
| `npm run lint` / `npm run format`                 | ESLint / Prettier                       |
| `npm run typecheck`                               | `tsc` sull'API e `astro check` sul sito |
| `npm run build`                                   | build di API e sito                     |

### Modificare i contenuti

- **Testi**: solo `web/src/content/it.ts`.
- **Foto**: `web/src/assets/foto.jpg` (quadrata, almeno 400×400).
- **Screenshot del gestionale**: file in `web/src/assets/progetti/`, poi elencati in `screenshots` dentro `it.ts`. Solo dati fittizi.
- **CV**: `web/public/cv-paolo-pulvirenti.pdf`.
- **Inglese**: creare `web/src/content/en.ts`, aggiungere `'en'` a `Locale` (`types.ts`) e ai `locales` in `web/astro.config.mjs`.

Dove manca un dato il sito mostra un riquadro **TODO** rosso: va tolto prima della pubblicazione.

## Deploy

Il deploy è automatico a ogni push su `main`, dopo che lint e test sono passati. La configurazione su Google Cloud va fatta una volta sola.

### 1. Progetto Google Cloud e Firebase

1. Su https://console.firebase.google.com crea un progetto (es. `paolo-sito`). Serve il piano **Blaze** perché Hosting possa inoltrare le richieste a Cloud Run. Con questo traffico si resta nei limiti gratuiti. Imposta comunque un **budget con avviso** (es. 1 €) in Fatturazione → Budget.
2. Metti l'id del progetto in `.firebaserc` al posto di `TODO-id-progetto-gcp`.
3. Da terminale, con [gcloud](https://cloud.google.com/sdk/docs/install):

```bash
PROJECT_ID=paolo-sito
REPO=PaoloPulvirenti/sito-personale
gcloud config set project $PROJECT_ID
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
  firestore.googleapis.com iamcredentials.googleapis.com \
  firebasehosting.googleapis.com firebaserules.googleapis.com

# Firestore in UE e cancellazione automatica dei messaggi dopo 12 mesi
gcloud firestore databases create --location=eur3
gcloud firestore fields ttls update expireAt \
  --collection-group=contactMessages --enable-ttl

# Registry delle immagini
gcloud artifacts repositories create sito \
  --repository-format=docker --location=europe-west1

# Service account con cui gira l'API: può solo scrivere su Firestore
gcloud iam service-accounts create sito-api-runtime
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:sito-api-runtime@$PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/datastore.user

# Service account usato da GitHub Actions per il deploy
gcloud iam service-accounts create github-deploy
for role in roles/run.admin roles/artifactregistry.writer \
  roles/firebasehosting.admin roles/firebaserules.admin \
  roles/serviceusage.serviceUsageConsumer; do
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:github-deploy@$PROJECT_ID.iam.gserviceaccount.com --role=$role
done
gcloud iam service-accounts add-iam-policy-binding \
  sito-api-runtime@$PROJECT_ID.iam.gserviceaccount.com \
  --member=serviceAccount:github-deploy@$PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/iam.serviceAccountUser

# Workload Identity Federation: solo questo repository può impersonare github-deploy
gcloud iam workload-identity-pools create github --location=global
gcloud iam workload-identity-pools providers create-oidc github \
  --location=global --workload-identity-pool=github \
  --issuer-uri=https://token.actions.githubusercontent.com \
  --attribute-mapping=google.subject=assertion.sub,attribute.repository=assertion.repository \
  --attribute-condition="assertion.repository=='$REPO'"
gcloud iam service-accounts add-iam-policy-binding \
  github-deploy@$PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/iam.workloadIdentityUser \
  --member=principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/attribute.repository/$REPO
```

### 2. Variabili su GitHub

In _Settings → Secrets and variables → Actions → Variables_ (non sono segreti):

| Variabile                        | Valore                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------ |
| `GCP_PROJECT_ID`                 | `paolo-sito`                                                                               |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | `projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github/providers/github` |
| `GCP_DEPLOY_SERVICE_ACCOUNT`     | `github-deploy@paolo-sito.iam.gserviceaccount.com`                                         |
| `GCP_RUNTIME_SERVICE_ACCOUNT`    | `sito-api-runtime@paolo-sito.iam.gserviceaccount.com`                                      |

Finché `GCP_PROJECT_ID` è vuota, la pipeline esegue solo lint, test e build e salta il deploy.

Facoltative:

| Variabile            | Effetto                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `NOTIFY_EMAIL_TO`    | casella che riceve un'email a ogni messaggio; richiede il secret `smtp-password` (sotto) |
| `CF_ANALYTICS_TOKEN` | token di Cloudflare Web Analytics; vuoto = nessuna statistica                            |

### Avviso email

1. Con la verifica in due passaggi attiva, crea una password per le app su https://myaccount.google.com/apppasswords.
2. Salvala in Secret Manager **dal tuo terminale**, così non passa da nessun file né chat:

```bash
gcloud services enable secretmanager.googleapis.com --project paolo-sito
gcloud secrets create smtp-password --replication-policy=automatic --project paolo-sito
gcloud secrets versions add smtp-password --data-file=- --project paolo-sito
```

L'ultimo comando aspetta la password: incollala, premi Invio e poi Ctrl+Z e Invio (su Windows) o Ctrl+D (su macOS/Linux).

3. Dai al service account dell'API il permesso di leggerla, poi imposta `NOTIFY_EMAIL_TO`:

```bash
gcloud secrets add-iam-policy-binding smtp-password --project paolo-sito   --member=serviceAccount:sito-api-runtime@paolo-sito.iam.gserviceaccount.com   --role=roles/secretmanager.secretAccessor
```

### 3. Primo deploy

Push su `main` (o _Actions → CI/CD → Run workflow_). La pipeline:

1. costruisce l'immagine e la carica su Artifact Registry;
2. aggiorna il servizio Cloud Run `sito-api` in `europe-west1`;
3. pubblica il sito e le regole Firestore su Firebase Hosting.

Il sito risponde subito su `https://<PROJECT_ID>.web.app`.

### 4. Dominio `paolo.presidium-app.com` (Cloudflare)

1. Firebase console → **Hosting → Aggiungi dominio personalizzato** → `paolo.presidium-app.com`.
2. Firebase mostra i record DNS (un `TXT` di verifica e uno o più record `A`, oppure un `CNAME`).
3. Su Cloudflare, zona `presidium-app.com` → **DNS → Aggiungi record**, con i valori di Firebase e il proxy **disattivato (nuvola grigia, "DNS only")**. Con il proxy attivo Google non riesce a emettere il certificato.
4. Dopo qualche minuto (a volte qualche ora) Firebase segna il dominio come _Connesso_ e il certificato HTTPS è attivo.

### Verifica dopo il deploy

```bash
curl https://paolo.presidium-app.com/api/health
```

Il rate limit usa `TRUST_PROXY_HOPS=2` (Firebase Hosting + front end Cloud Run). Per verificarlo, invia sei messaggi di prova di fila: il sesto deve ricevere `429`, mentre da un'altra rete (es. il telefono in 4G) si deve poter scrivere subito. Se il blocco scatta per tutti insieme, il valore è troppo basso.

## Licenza

Codice MIT. Testi, foto e CV restano di Paolo Pulvirenti.
