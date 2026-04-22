const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const FormData = require('form-data');
const fetch    = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
});

// Trim any whitespace/newlines that Vercel may add to env vars
const AILAB_KEY      = (process.env.AILAB_API_KEY || '').trim();
const TRYON_URL      = 'https://www.ailabapi.com/api/portrait/editing/try-on-clothes';
const POLL_URL       = 'https://www.ailabapi.com/api/common/query-async-task-result';
const MAX_POLLS      = 24;   // 24 × 5s = 2 min max wait
const POLL_INTERVAL  = 5000; // 5 seconds

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * POST /api/tryon
 * Body: multipart/form-data
 *   person_image  — file  (person photo)
 *   clothes_image — file  (clothing image)
 *   clothes_type  — string (upper_body | lower_body | full_body)  default: upper_body
 */
router.post('/', upload.fields([
  { name: 'person_image',  maxCount: 1 },
  { name: 'clothes_image', maxCount: 1 },
]), async (req, res) => {
  if (!AILAB_KEY) {
    return res.status(503).json({ error: 'AI try-on not configured. AILAB_API_KEY missing.' });
  }

  const personFile  = req.files?.person_image?.[0];
  const clothesFile = req.files?.clothes_image?.[0];

  if (!personFile)  return res.status(400).json({ error: 'person_image is required' });
  if (!clothesFile) return res.status(400).json({ error: 'clothes_image is required' });

  const clothesType = req.body.clothes_type || 'upper_body';

  try {
    // ── Step 1: Submit try-on task ────────────────────────────────
    const form = new FormData();
    form.append('task_type',    'async');
    form.append('clothes_type', clothesType);
    form.append('person_image',  personFile.buffer,  {
      filename:    personFile.originalname  || 'person.jpg',
      contentType: personFile.mimetype,
    });
    form.append('clothes_image', clothesFile.buffer, {
      filename:    clothesFile.originalname || 'clothes.jpg',
      contentType: clothesFile.mimetype,
    });

    const submitRes  = await fetch(TRYON_URL, {
      method:  'POST',
      headers: { 'ailabapi-api-key': AILAB_KEY, ...form.getHeaders() },
      body:    form,
    });
    const submitData = await submitRes.json();

    if (submitData.error_code !== 0) {
      return res.status(400).json({ error: submitData.error_detail?.message || 'AILab submission failed' });
    }

    const taskId = submitData.task_id;
    if (!taskId) return res.status(500).json({ error: 'No task_id returned' });

    // ── Step 2: Poll for result ────────────────────────────────────
    for (let i = 0; i < MAX_POLLS; i++) {
      await sleep(POLL_INTERVAL);

      const pollRes  = await fetch(`${POLL_URL}?task_id=${taskId}`, {
        headers: { 'ailabapi-api-key': AILAB_KEY },
      });
      const pollData = await pollRes.json();

      if (pollData.task_status === 2) {
        const imageUrl = pollData.data?.image || pollData.data?.images?.[0];
        if (!imageUrl) return res.status(500).json({ error: 'No image in result' });
        return res.json({ success: true, image_url: imageUrl });
      }

      if (pollData.error_code && pollData.error_code !== 0) {
        return res.status(500).json({ error: pollData.error_detail?.message || 'Processing failed' });
      }
      // status 0 or 1 = still processing — keep polling
    }

    return res.status(504).json({ error: 'Try-on timed out. Please try again.' });
  } catch (err) {
    console.error('Try-on error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

module.exports = router;
