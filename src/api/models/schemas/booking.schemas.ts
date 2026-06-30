import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Single Ajv instance shared across all schema validations
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// ── Reusable sub-schema ──────────────────────────────────────────────────────

const bookingDatesSchema = {
  type: 'object',
  required: ['checkin', 'checkout'],
  properties: {
    checkin:  { type: 'string', format: 'date' },
    checkout: { type: 'string', format: 'date' },
  },
  additionalProperties: false,
};

// ── Response schemas (mirrors what developers publish in the API contract) ───

/** GET /booking/:id */
export const bookingSchema = {
  type: 'object',
  required: ['firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates'],
  properties: {
    firstname:       { type: 'string', minLength: 1 },
    lastname:        { type: 'string', minLength: 1 },
    totalprice:      { type: 'number' },
    depositpaid:     { type: 'boolean' },
    bookingdates:    bookingDatesSchema,
    additionalneeds: { type: 'string' },
  },
  additionalProperties: false,
};

/** POST /booking  */
export const createBookingResponseSchema = {
  type: 'object',
  required: ['bookingid', 'booking'],
  properties: {
    bookingid: { type: 'integer', minimum: 1 },
    booking:   bookingSchema,
  },
  additionalProperties: false,
};

/** GET /booking (list) */
export const bookingListSchema = {
  type: 'array',
  minItems: 1,
  items: {
    type: 'object',
    required: ['bookingid'],
    properties: {
      bookingid: { type: 'integer', minimum: 1 },
    },
    additionalProperties: false,
  },
};

/** POST /auth — success */
export const authSuccessSchema = {
  type: 'object',
  required: ['token'],
  properties: {
    token: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
};

/** POST /auth — failure */
export const authErrorSchema = {
  type: 'object',
  required: ['reason'],
  properties: {
    reason: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
};

// ── Validator ────────────────────────────────────────────────────────────────

/**
 * Validates `data` against `schema` using AJV.
 * Throws with a detailed error message on any violation so Playwright
 * reports the exact field path that broke the contract.
 */
export function assertSchema(schema: object, data: unknown): void {
  const validate = ajv.compile(schema);
  if (!validate(data)) {
    const errors = ajv.errorsText(validate.errors, { separator: '\n  ' });
    throw new Error(`JSON Schema validation failed:\n  ${errors}`);
  }
}
