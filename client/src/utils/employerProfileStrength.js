/**
 * Employer profile completion scoring — adapts to account type.
 */

export function computeEmployerStrength(profile) {
  if (!profile) return 0;

  // Legacy records without accountType → treat as business
  const type = profile.accountType || 'business';

  let s = 0;

  /* ── Common fields ── */
  if (profile.email) s += 5;
  if (profile.address) s += 10;
  if (profile.photoUrl) s += 5;
  if (profile.upiId || profile.bankAccount) s += 5;

  if (type === 'business') {
    if (profile.businessName) s += 15;
    if (profile.businessType) s += 5;
    if (profile.ownerName) s += 5;
    if (profile.description && profile.description.length >= 30) s += 10;
    if (profile.yearsInBusiness > 0) s += 5;
    if (profile.gstNumber && profile.panNumber) s += 20;
    if (profile.businessDocUrl && profile.selfieUrl) s += 15;
  } else {
    if (profile.fullName) s += 15;
    if (profile.hireReason && profile.hireReason.length >= 20) s += 10;
    if (profile.householdSize) s += 5;
    if (profile.idType && profile.idNumber) s += 15;
    if (profile.idDocUrl && profile.selfieUrl) s += 20;
  }

  return Math.min(100, s);
}

export function getEmployerTier(strength) {
  if (strength >= 85) return 'trusted';
  if (strength >= 55) return 'verified';
  return 'basic';
}

export function getNextEmployerAction(profile) {
  if (!profile) {
    return { key: 'accountType', label: 'Choose your account type' };
  }

  const type = profile.accountType || 'business';

  if (!profile.accountType) return { key: 'accountType', label: 'Choose your account type' };
  if (!profile.email) return { key: 'email', label: 'Add your email' };
  if (!profile.address) return { key: 'address', label: 'Add your location' };

  if (type === 'business') {
    if (!profile.businessName) return { key: 'businessName', label: 'Add your business name' };
    if (!profile.businessType) return { key: 'businessType', label: 'Select business type' };
    if (!profile.photoUrl) return { key: 'photo', label: 'Add a logo or shop photo' };
    if (!profile.ownerName) return { key: 'ownerName', label: 'Add owner / manager name' };
    if (!profile.description || profile.description.length < 30) {
      return { key: 'description', label: 'Describe your business (min 30 chars)' };
    }
    if (!profile.gstNumber || !profile.panNumber) {
      return { key: 'gst', label: 'Add GST & PAN to get verified' };
    }
    if (!profile.businessDocUrl || !profile.selfieUrl) {
      return { key: 'documents', label: 'Upload registration doc & selfie' };
    }
  } else {
    if (!profile.fullName) return { key: 'fullName', label: 'Add your full name' };
    if (!profile.hireReason || profile.hireReason.length < 20) {
      return { key: 'hireReason', label: 'Tell us what you need (min 20 chars)' };
    }
    if (!profile.photoUrl) return { key: 'photo', label: 'Add a photo' };
    if (!profile.idType || !profile.idNumber) {
      return { key: 'idNumber', label: 'Add your ID for verification' };
    }
    if (!profile.idDocUrl || !profile.selfieUrl) {
      return { key: 'documents', label: 'Upload ID document & selfie' };
    }
  }

  if (!profile.upiId && !profile.bankAccount) {
    return { key: 'payment', label: 'Add payment method' };
  }

  return null;
}