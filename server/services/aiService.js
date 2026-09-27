/**
 * AI Request Understanding Service (Person 2 — matching-ai branch)
 *
 * Converts a customer's free-text request into a small, validated,
 * structured object. Tries Ollama + Qwen first (if configured and
 * reachable); always falls back to a deterministic keyword parser so
 * the demo never breaks just because Ollama isn't running.
 *
 * HARD RULE: this service NEVER selects or ranks a worker. It only
 * ever returns { serviceCategory, requiredSkill, urgency, description }.
 * Worker selection is exclusively matchingService's job.
 */

const {
  KNOWN_CATEGORIES,
  KEYWORD_RULES,
  URGENT_KEYWORDS,
} = require('../config/matching');

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:3b';
// Explicit escape hatch for local/dev/demo when Ollama isn't running
// at all — skips even attempting the network call.
const AI_MOCK_MODE = String(process.env.AI_MOCK_MODE || '').toLowerCase() === 'true';
const OLLAMA_TIMEOUT_MS = parseInt(process.env.OLLAMA_TIMEOUT_MS || '4000', 10);

const VALID_URGENCIES = ['normal', 'urgent', 'emergency'];

// ─────────────────────────────────────────────────────────────
// Deterministic fallback parser
// ─────────────────────────────────────────────────────────────

/**
 * Keyword-based parser. Always available, always fast, no network
 * calls. This is also what validates/repairs a malformed LLM response
 * (see validateAndCoerce below), so it's the single source of truth
 * for "what counts as a known category/skill".
 */
function keywordParse(text) {
  const lower = (text || '').toLowerCase();

  let match = null;
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      match = rule;
      break;
    }
  }

  const urgency = URGENT_KEYWORDS.some((kw) => lower.includes(kw)) ? 'urgent' : 'normal';

  return {
    serviceCategory: match ? match.serviceCategory : 'technician',
    requiredSkill: match ? match.requiredSkill : 'general_repair',
    urgency,
    description: (text || '').trim().replace(/\s+/g, ' ').slice(0, 300),
    source: 'keyword_fallback',
  };
}

// ─────────────────────────────────────────────────────────────
// Ollama / Qwen path
// ─────────────────────────────────────────────────────────────

function buildPrompt(text) {
  return (
    `You are a strict JSON extraction function for a home-services app. ` +
    `Read the customer's request and output ONLY a single JSON object, ` +
    `no markdown, no explanation, no code fences. Schema:\n` +
    `{"serviceCategory": one of [${KNOWN_CATEGORIES.join(', ')}], ` +
    `"requiredSkill": short_snake_case_string, ` +
    `"urgency": one of ["normal","urgent","emergency"], ` +
    `"description": short plain-English restatement of the request}\n\n` +
    `Customer request: """${text}"""\n` +
    `JSON:`
  );
}

async function callOllama(text) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: buildPrompt(text),
        stream: false,
        format: 'json',
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Ollama responded with HTTP ${response.status}`);
    }

    const data = await response.json();
    const raw = data.response;
    const cleaned = String(raw).replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed;
  } finally {
    clearTimeout(timeout);
  }
}

// ─────────────────────────────────────────────────────────────
// Validation — the ONLY thing allowed to leave this module.
// Anything the LLM (or a caller) produces gets coerced into this
// exact shape, with unknown values replaced by the keyword parser's
// output. This is what "AI output must be converted into safe
// structured JSON" means in practice.
// ─────────────────────────────────────────────────────────────
function validateAndCoerce(candidate, originalText) {
  const fallback = keywordParse(originalText);

  if (!candidate || typeof candidate !== 'object') return fallback;

  const serviceCategory = KNOWN_CATEGORIES.includes(candidate.serviceCategory)
    ? candidate.serviceCategory
    : fallback.serviceCategory;

  const requiredSkill =
    typeof candidate.requiredSkill === 'string' && /^[a-z0-9_]{2,50}$/.test(candidate.requiredSkill)
      ? candidate.requiredSkill
      : fallback.requiredSkill;

  const urgency = VALID_URGENCIES.includes(candidate.urgency) ? candidate.urgency : fallback.urgency;

  const description =
    typeof candidate.description === 'string' && candidate.description.trim()
      ? candidate.description.trim().slice(0, 300)
      : fallback.description;

  return { serviceCategory, requiredSkill, urgency, description, source: 'ollama_qwen' };
}

/**
 * Main entry point.
 * @param {string} text - raw customer request text
 * @returns {Promise<{serviceCategory, requiredSkill, urgency, description, source}>}
 */
async function parseRequest(text) {
  if (!text || !text.trim()) {
    throw new Error('text is required.');
  }

  if (AI_MOCK_MODE) {
    return keywordParse(text);
  }

  try {
    const raw = await callOllama(text);
    return validateAndCoerce(raw, text);
  } catch (err) {
    // Ollama unreachable, timed out, or returned garbage — fail
    // gracefully to the deterministic parser instead of erroring the
    // whole request.
    const result = keywordParse(text);
    result.aiError = err.message;
    return result;
  }
}

module.exports = {
  parseRequest,
  keywordParse,
  validateAndCoerce,
  buildPrompt,
};
