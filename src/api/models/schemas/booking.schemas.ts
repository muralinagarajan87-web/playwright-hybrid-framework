import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Single Ajv instance shared across all schema validations
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// ── Reusable sub-schemas ─────────────────────────────────────────────────────

const bookingDatesSchema = {
  type: 'object',
  required: ['checkin', 'checkout'],
  properties: {
    checkin:  { type: 'string', format: 'date' },
    checkout: { type: 'string', format: 'date' },
  },
  additionalProperties: false,
};

const partialBookingDatesSchema = {
  type: 'object',
  minProperties: 1,
  properties: {
    checkin:  { type: 'string', format: 'date' },
    checkout: { type: 'string', format: 'date' },
  },
  additionalProperties: false,
};

// ── Response schemas (mirrors the API contract developers publish) ────────────

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

/** POST /booking */
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

// ── Request schemas (validates what WE send before the API processes it) ─────
// This is L1 — catches DataFactory bugs and test-data errors at the source,
// not after the response comes back.

/** POST /auth request body */
export const authRequestSchema = {
  type: 'object',
  required: ['username', 'password'],
  properties: {
    username: { type: 'string', minLength: 1 },
    password: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
};

/** POST /booking and PUT /booking/:id request body */
export const bookingRequestSchema = {
  type: 'object',
  required: ['firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates'],
  properties: {
    firstname:    { type: 'string', minLength: 1 },
    lastname:     { type: 'string', minLength: 1 },
    totalprice:   { type: 'number', minimum: 0 },
    depositpaid:  { type: 'boolean' },
    bookingdates: bookingDatesSchema,
    additionalneeds: { type: 'string' },
  },
  additionalProperties: false,
};

/** PATCH /booking/:id request body — partial, at least 1 field required */
export const partialBookingRequestSchema = {
  type: 'object',
  minProperties: 1,
  properties: {
    firstname:    { type: 'string', minLength: 1 },
    lastname:     { type: 'string', minLength: 1 },
    totalprice:   { type: 'number', minimum: 0 },
    depositpaid:  { type: 'boolean' },
    bookingdates: partialBookingDatesSchema,
    additionalneeds: { type: 'string' },
  },
  additionalProperties: false,
};

// ── Validators ───────────────────────────────────────────────────────────────

/**
 * Validates `data` against `schema` using AJV.
 * Throws with the exact field path that violated the contract so Playwright
 * reports precisely what broke.
 */
export function assertSchema(schema: object, data: unknown): void {
  const validate = ajv.compile(schema);
  if (!validate(data)) {
    const errors = ajv.errorsText(validate.errors, { separator: '\n  ' });
    throw new Error(`JSON Schema validation failed:\n  ${errors}`);
  }
}

/**
 * Asserts that checkout date is on or after checkin date.
 * Catches booking systems silently accepting invalid date ranges.
 */
export function assertDateOrder(checkin: string, checkout: string): void {
  const checkinMs  = new Date(checkin).getTime();
  const checkoutMs = new Date(checkout).getTime();
  if (checkoutMs < checkinMs) {
    throw new Error(
      `Date ordering violation: checkout (${checkout}) is before checkin (${checkin})`
    );
  }
}
