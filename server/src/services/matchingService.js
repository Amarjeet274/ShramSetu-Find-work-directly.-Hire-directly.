/**
 * Deterministic constraint-based matching.
 * Returns 0-100 score.
 */
exports.computeMatchScore = (job, worker) => {
  let score = 0;
  const breakdown = { skills: 0, distance: 0, availability: 0, experience: 0, rating: 0, verification: 0 };

  // Skills (max 30)
  const matched = job.requiredSkills.filter(s => worker.skills?.includes(s)).length;
  if (job.requiredSkills.length > 0) {
    breakdown.skills = Math.round((matched / job.requiredSkills.length) * 30);
  } else breakdown.skills = 30;
  score += breakdown.skills;

  // Distance (max 20) — must be within travelRadiusKm
  const distKm = worker.distanceKm ?? 0;
  if (distKm <= job.travelRadiusKm) {
    breakdown.distance = Math.round((1 - distKm / job.travelRadiusKm) * 20);
  }
  score += breakdown.distance;

  // Availability (max 15)
  if (job.schedule?.shift === worker.availability || worker.availability === 'flexible' || job.schedule?.shift === 'flexible') {
    breakdown.availability = 15;
  }
  score += breakdown.availability;

  // Experience (max 15)
  if (worker.experienceYears >= job.minExperienceYears) {
    breakdown.experience = Math.min(15, 5 + worker.experienceYears);
  }
  score += breakdown.experience;

  // Rating (max 10)
  breakdown.rating = Math.round((worker.rating / 5) * 10);
  score += breakdown.rating;

  // Verification (max 10)
  if (worker.verification?.idVerified) breakdown.verification = 10;
  score += breakdown.verification;

  return { score: Math.min(100, score), breakdown };
};