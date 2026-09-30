/**
 * Invio del form contatti all'API (POST /api/contact, JSON).
 * Validazione nativa del browser prima dell'invio, poi segnala i campi rifiutati dal server.
 */
interface FormMessages {
  sending: string;
  success: string;
  errorGeneric: string;
  errorRateLimit: string;
  errorFields: string;
}

type Status = 'idle' | 'sending' | 'success' | 'error';

const FIELD_NAMES = ['name', 'email', 'message', 'privacy'] as const;

export function submitContactForm(form: HTMLFormElement): void {
  const messages = JSON.parse(form.dataset.messages ?? '{}') as FormMessages;
  const statusEl = form.querySelector<HTMLElement>('#cf-status');
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  const setStatus = (status: Status, text = '') => {
    if (statusEl) {
      statusEl.textContent = text;
      statusEl.className = `text-sm ${status === 'error' ? 'text-danger' : status === 'success' ? 'text-success' : 'text-muted'}`;
    }
    if (button) button.disabled = status === 'sending';
  };

  const markInvalid = (fields: readonly string[]) => {
    for (const name of FIELD_NAMES) {
      const input = form.elements.namedItem(name);
      if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
        input.setAttribute('aria-invalid', String(fields.includes(name)));
      }
    }
    const first = fields[0] ? form.elements.namedItem(fields[0]) : null;
    if (first instanceof HTMLElement) first.focus();
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const invalid = FIELD_NAMES.filter((name) => {
      const input = form.elements.namedItem(name);
      return (
        (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) &&
        !input.checkValidity()
      );
    });
    if (invalid.length > 0) {
      markInvalid(invalid);
      setStatus('error', messages.errorFields);
      return;
    }

    const data = new FormData(form);
    const body = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      message: String(data.get('message') ?? ''),
      privacy: data.get('privacy') === 'on',
      website: String(data.get('website') ?? ''),
    };

    setStatus('sending', messages.sending);
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        form.reset();
        markInvalid([]);
        setStatus('success', messages.success);
        return;
      }
      if (response.status === 429) {
        setStatus('error', messages.errorRateLimit);
        return;
      }
      if (response.status === 400) {
        const payload = (await response.json().catch(() => ({}))) as { fields?: string[] };
        markInvalid(payload.fields ?? []);
        setStatus('error', messages.errorFields);
        return;
      }
      setStatus('error', messages.errorGeneric);
    } catch {
      setStatus('error', messages.errorGeneric);
    }
  });
}
