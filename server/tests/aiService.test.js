/**
 * Unit tests for the AI request-understanding fallback parser and
 * output validation/coercion. These never hit a real Ollama server.
 * Run with: node --test server/tests
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const { keywordParse, validateAndCoerce } = require('../services/aiService');

test('keywordParse: plumbing keywords map to plumber/pipe_repair', () => {
  const result = keywordParse('My kitchen tap is leaking');
  assert.equal(result.serviceCategory, 'plumber');
  assert.equal(result.requiredSkill, 'pipe_repair');
  assert.equal(result.urgency, 'normal');
  assert.equal(result.source, 'keyword_fallback');
});

test('keywordParse: electrical keywords map to electrician/wiring', () => {
  const result = keywordParse('the fan and switch wiring is sparking');
  assert.equal(result.serviceCategory, 'electrician');
  assert.equal(result.requiredSkill, 'wiring');
});

test('keywordParse: cleaning keywords map to cleaner', () => {
  const result = keywordParse('need deep cleaning for my sofa');
  assert.equal(result.serviceCategory, 'cleaner');
});

test('keywordParse: carpentry keywords map to carpenter', () => {
  const result = keywordParse('my wooden door and furniture are broken');
  assert.equal(result.serviceCategory, 'carpenter');
});

test('keywordParse: urgency keyword detection', () => {
  const urgent = keywordParse('tap is leaking, need it fixed urgently, emergency!');
  assert.equal(urgent.urgency, 'urgent');

  const normal = keywordParse('tap is leaking, please fix whenever convenient');
  assert.equal(normal.urgency, 'normal');
});

test('keywordParse: unknown text falls back to technician/general_repair, never throws', () => {
  const result = keywordParse('asdkjahsdkjahsd random gibberish');
  assert.equal(result.serviceCategory, 'technician');
  assert.equal(result.requiredSkill, 'general_repair');
});

test('validateAndCoerce: AI NEVER outputs a worker field, even if asked to', () => {
  const malicious = {
    serviceCategory: 'plumber',
    requiredSkill: 'pipe_repair',
    urgency: 'normal',
    description: 'leak',
    workerId: 'w001', // should be stripped / ignored entirely
    selectedWorker: 'Rajan Kumar',
  };
  const result = validateAndCoerce(malicious, 'my tap is leaking');
  assert.equal(result.workerId, undefined);
  assert.equal(result.selectedWorker, undefined);
  assert.deepEqual(Object.keys(result).sort(), ['description', 'requiredSkill', 'serviceCategory', 'source', 'urgency'].sort());
});

test('validateAndCoerce: rejects unknown serviceCategory and falls back to keyword parse', () => {
  const bad = { serviceCategory: 'wizardry', requiredSkill: 'spellcasting', urgency: 'normal', description: 'x' };
  const result = validateAndCoerce(bad, 'my tap is leaking');
  assert.equal(result.serviceCategory, 'plumber'); // corrected via fallback
});

test('validateAndCoerce: rejects malformed requiredSkill (injection attempt) and falls back', () => {
  const bad = { serviceCategory: 'plumber', requiredSkill: '"; DROP TABLE workers; --', urgency: 'normal', description: 'x' };
  const result = validateAndCoerce(bad, 'my tap is leaking');
  assert.equal(result.requiredSkill, 'pipe_repair');
});

test('validateAndCoerce: rejects invalid urgency value', () => {
  const bad = { serviceCategory: 'plumber', requiredSkill: 'pipe_repair', urgency: 'right now!!', description: 'x' };
  const result = validateAndCoerce(bad, 'my tap is leaking, normal priority');
  assert.equal(result.urgency, 'normal');
});

test('validateAndCoerce: non-object input never throws, returns fallback', () => {
  const result = validateAndCoerce(null, 'my tap is leaking');
  assert.equal(result.serviceCategory, 'plumber');
  assert.equal(result.source, 'keyword_fallback');
});
