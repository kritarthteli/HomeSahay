const express = require('express');
const router = express.Router();

const { parseRequest } = require('../services/aiService');

/**
 * POST /api/ai/parse-request
 *
 * Body: { text: string }
 * Returns: { serviceCategory, requiredSkill, urgency, description, source }
 *
 * Uses Ollama + Qwen when reachable, otherwise falls back to a
 * deterministic keyword parser. Never selects a worker.
 */
router.post('/parse-request', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'text is required.' });
    }

    const result = await parseRequest(text);
    res.json(result);
  } catch (err) {
    console.error('Error parsing AI request:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
