/**
 * Shared configuration for the Fair Matching Engine, Eligibility Service
 * and AI Request Parser (Person 2 scope: matching-ai branch).
 *
 * Keeping weights / thresholds / skill vocab in one place means nobody
 * has to go hunting through matchingService.js, eligibilityService.js
 * and aiService.js to find a magic number.
 */

// ─────────────────────────────────────────────────────────────
// Fair Matching weights (must sum to 1.0)
// ─────────────────────────────────────────────────────────────
const MATCHING_WEIGHTS = Object.freeze({
  skill: 0.35,
  distance: 0.25,
  rating: 0.20,
  workload: 0.20,
});

// Default max service radius (km) used when a request doesn't specify one.
const DEFAULT_MAX_DISTANCE_KM = 15;

// Rating is stored out of 5 in the DB.
const MAX_RATING = 5;

// Job statuses that mean a worker is currently "busy" and should not
// be handed a second job at the same time.
const ACTIVE_JOB_STATUSES = ['pending_acceptance', 'accepted', 'in_progress'];

// ─────────────────────────────────────────────────────────────
// AI service category / skill vocabulary.
// serviceCategory MUST match service_categories.id (schema.sql).
// requiredSkill is a free-text tag matched against worker_skills.skill
// (see seed.js) — kept deliberately small & explicit for a hackathon
// prototype rather than a full NLU taxonomy.
// ─────────────────────────────────────────────────────────────
const KNOWN_CATEGORIES = [
  'plumber', 'electrician', 'cleaner', 'cook', 'carpenter',
  'painter', 'caregiver', 'technician', 'driver', 'gardener',
];

// Ordered keyword -> {serviceCategory, requiredSkill} rules for the
// fallback parser. Order matters: first match wins, so more specific
// phrases can be listed before generic ones if needed later.
const KEYWORD_RULES = [
  { keywords: ['tap', 'pipe', 'leak', 'leaking', 'drain', 'drainage', 'plumb', 'sanitary', 'bathroom', 'toilet', 'flush'], serviceCategory: 'plumber', requiredSkill: 'pipe_repair' },
  { keywords: ['fan', 'switch', 'wiring', 'wire', 'electric', 'short circuit', 'mcb', 'socket', 'bulb', 'light'], serviceCategory: 'electrician', requiredSkill: 'wiring' },
  { keywords: ['clean', 'cleaning', 'sofa', 'carpet', 'housekeeping', 'laundry', 'dusting'], serviceCategory: 'cleaner', requiredSkill: 'deep_cleaning' },
  { keywords: ['wood', 'door', 'furniture', 'cabinet', 'carpenter', 'carpentry', 'hinge', 'shelf'], serviceCategory: 'carpenter', requiredSkill: 'furniture_repair' },
  { keywords: ['paint', 'painting', 'wall paint', 'whitewash'], serviceCategory: 'painter', requiredSkill: 'interior_painting' },
  { keywords: ['cook', 'cooking', 'meal', 'catering', 'chef', 'food'], serviceCategory: 'cook', requiredSkill: 'south_indian' },
  { keywords: ['elder', 'caregiver', 'patient', 'nursing', 'care of'], serviceCategory: 'caregiver', requiredSkill: 'elder_care' },
  { keywords: ['ac ', 'air conditioner', 'appliance', 'fridge', 'washing machine', 'repair'], serviceCategory: 'technician', requiredSkill: 'appliance_repair' },
  { keywords: ['driver', 'driving', 'ride', 'pickup', 'drop'], serviceCategory: 'driver', requiredSkill: 'personal_driving' },
  { keywords: ['garden', 'lawn', 'landscap', 'plants'], serviceCategory: 'gardener', requiredSkill: 'lawn_care' },
];

const URGENT_KEYWORDS = ['urgent', 'asap', 'immediately', 'emergency', 'right now', 'today itself'];
const NORMAL_SCHEDULING_KEYWORDS = ['today', 'now', 'soon'];

module.exports = {
  MATCHING_WEIGHTS,
  DEFAULT_MAX_DISTANCE_KM,
  MAX_RATING,
  ACTIVE_JOB_STATUSES,
  KNOWN_CATEGORIES,
  KEYWORD_RULES,
  URGENT_KEYWORDS,
  NORMAL_SCHEDULING_KEYWORDS,
};
