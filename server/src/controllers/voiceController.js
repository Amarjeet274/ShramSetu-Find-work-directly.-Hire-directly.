const axios = require('axios');
const catchAsync = require('../utils/catchAsync');

exports.transcribe = catchAsync(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No audio' });
  // Forward to your STT provider
  const { data } = await axios.post(
    process.env.STT_API_URL,
    req.file.buffer,
    { headers: { Authorization: `Bearer ${process.env.STT_API_KEY}`, 'Content-Type': 'audio/webm' } }
  );
  res.json({ success: true, text: data.transcript });
});