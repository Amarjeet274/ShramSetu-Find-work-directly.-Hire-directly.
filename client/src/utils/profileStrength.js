/**
 * Computes the profile completion percentage.
 * MUST match the backend's scoring logic — update both if changed.
 */
export function computeProfileStrength(profile) {
  if (!profile) return 0;

  let s = 0;
  if (profile.fullName) s += 15;
  if (profile.photoUrl) s += 10;
  if (profile.skills?.length) s += 10;
  if (profile.experienceYears > 0) s += 5;
  if (profile.address) s += 10;
  if (profile.languages?.length >= 2) s += 5;
  if (profile.aadhaarNumber && profile.selfieUrl) s += 30;
  if (profile.upiId || profile.bankAccount) s += 15;

  return Math.min(100, s);
}

export function getProfileTier(strength) {
  if (strength >= 85) return 'trusted';
  if (strength >= 55) return 'verified';
  return 'basic';
}

/**
 * Returns the next best action to improve the profile.
 * Used by the sidebar and profile page to render contextual hints.
 */
export function getNextProfileAction(profile) {
  if (!profile) return { key: 'basic', labelKey: 'worker.startProfile', target: 15 };

  if (!profile.fullName) return { key: 'name', labelKey: 'worker.addName', target: 15 };
  if (!profile.photoUrl) return { key: 'photo', labelKey: 'worker.addPhoto', target: 25 };
  if (!profile.skills?.length) return { key: 'skills', labelKey: 'worker.addSkills', target: 35 };
  if (!profile.address) return { key: 'address', labelKey: 'worker.addAddress', target: 45 };
  if (!profile.aadhaarNumber || !profile.selfieUrl)
    return { key: 'aadhaar', labelKey: 'worker.addAadhaar', target: 85 };
  if (!profile.upiId && !profile.bankAccount)
    return { key: 'payment', labelKey: 'worker.addPayment', target: 100 };

  return null; // 100% complete
}