import { Type, type Static } from 'typebox';

/** Nome del campo trappola: invisibile alle persone, compilato dai bot. */
export const HONEYPOT_FIELD = 'website';

export const MIN_NAME_LENGTH = 2;
export const MIN_MESSAGE_LENGTH = 10;

export const ContactBody = Type.Object(
  {
    name: Type.String({ minLength: MIN_NAME_LENGTH, maxLength: 100 }),
    email: Type.String({ format: 'email', maxLength: 254 }),
    message: Type.String({ minLength: MIN_MESSAGE_LENGTH, maxLength: 5000 }),
    privacy: Type.Literal(true),
    [HONEYPOT_FIELD]: Type.Optional(Type.String({ maxLength: 200 })),
  },
  { additionalProperties: false },
);
export type ContactBody = Static<typeof ContactBody>;

/** Stessa risposta per messaggi veri e per quelli scartati dal honeypot. */
export const ContactAccepted = Type.Object({
  status: Type.Literal('received'),
});

export const ErrorResponse = Type.Object({
  error: Type.String(),
  message: Type.String(),
  fields: Type.Optional(Type.Array(Type.String())),
});
