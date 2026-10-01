import nodemailer, { type Transporter } from 'nodemailer';
import type { ContactMessage } from '../repositories/message-repository.js';
import type { Notifier } from './notifier.js';

export interface SmtpSettings {
  host: string;
  port: number;
  user: string;
  password: string;
  /** Casella che riceve gli avvisi. */
  to: string;
}

/** Testo dell'email di avviso: semplice testo, nessun HTML da sanificare. */
export function buildNotification(message: ContactMessage, messageId: string) {
  return {
    subject: `Nuovo messaggio dal sito: ${message.name}`,
    text: [
      `Da: ${message.name} <${message.email}>`,
      `Ricevuto: ${message.consentAt.toISOString()}`,
      '',
      message.message,
      '',
      '—',
      'Rispondi a questa email per scrivere direttamente a chi ti ha contattato.',
      `Id su Firestore: ${messageId}`,
    ].join('\n'),
  };
}

/** Invia l'avviso via SMTP (Gmail con password per le app). */
export class EmailNotifier implements Notifier {
  private readonly transporter: Transporter;

  constructor(
    private readonly settings: SmtpSettings,
    transporter?: Transporter,
  ) {
    this.transporter =
      transporter ??
      nodemailer.createTransport({
        host: settings.host,
        port: settings.port,
        secure: settings.port === 465,
        auth: { user: settings.user, pass: settings.password },
        // Un SMTP lento non deve tenere appesa la risposta al form.
        connectionTimeout: 5_000,
        greetingTimeout: 5_000,
        socketTimeout: 10_000,
      });
  }

  async notify(message: ContactMessage, messageId: string): Promise<void> {
    const { subject, text } = buildNotification(message, messageId);
    await this.transporter.sendMail({
      from: { name: 'Sito personale', address: this.settings.user },
      to: this.settings.to,
      // Nodemailer valida e codifica l'indirizzo: niente header injection dal form.
      replyTo: { name: message.name, address: message.email },
      subject,
      text,
    });
  }
}
