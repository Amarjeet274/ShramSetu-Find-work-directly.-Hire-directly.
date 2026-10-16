const Job = require('../models/Job');
const WorkerProfile = require('../models/WorkerProfile');
const aiService = require('../services/aiService');
const catchAsync = require('../utils/catchAsync');
const { computeMatchScore } = require('../services/matchingService');

exports.chat = catchAsync(async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ success: false, message: 'messages array required' });
  }

  // Build permission-scoped context
  const userContext = { role: req.user.role, language: req.user.language };
  let extraContext = '';

  // If worker asks for nearby jobs, fetch top 3 matches (read-only)
  const lastMsg = messages[messages.length - 1].content.toLowerCase();
  if (req.user.role === 'worker' && (lastMsg.includes('job') || lastMsg.includes('काम') || lastMsg.includes('kaam'))) {
    const worker = await WorkerProfile.findOne({ user: req.user._id });
    if (worker?.location?.coordinates?.length) {
      const [lng, lat] = worker.location.coordinates;
      const jobs = await Job.find({
        status: 'POSTED',
        location: { $near: { $geometry: { type: 'Point', coordinates: [lng, lat] }, $maxDistance: 20000 } },
      }).limit(5);
      const ranked = jobs.map(j => ({ job: j, ...computeMatchScore(j, worker.toObject()) }))
        .sort((a, b) => b.score - a.score).slice(0, 3);
      extraContext = 'Nearby jobs for this worker:\n' + ranked.map(r =>
        `- ${r.job.title} at ${r.job.address || ''} — ₹${r.job.payRate}/${r.job.payType} (match ${r.score}%)`).join('\n');
    }
  }

  const finalMessages = extraContext
    ? [{ role: 'system', content: extraContext }, ...messages]
    : messages;

  const { reply } = await aiService.chat({ messages: finalMessages, userContext });
  res.json({ success: true, reply });
});