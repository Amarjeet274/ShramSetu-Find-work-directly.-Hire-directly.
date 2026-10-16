/**
 * Pluggable face verification.
 * Implement using AWS Rekognition, Azure Face, or a self-hosted model.
 * For now: a contract that the rest of the system can call.
 */
exports.verify = async ({ userId, selfieBuffer, documentBuffer }) => {
  // Return: { status: 'APPROVED'|'REJECTED'|'PENDING', confidence }
  if (process.env.FACE_VERIFICATION_ENABLED !== 'true') {
    return { status: 'PENDING', confidence: 0, note: 'Face verification not enabled' };
  }
  // TODO: real provider call
  return { status: 'PENDING', confidence: 0 };
};