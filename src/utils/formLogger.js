/**
 * Log incoming form submissions without sensitive fields.
 */
function logFormSubmission(formType, body = {}) {
  const safe = { ...body };
  delete safe.cf_turnstile_response;

  if (safe.message && safe.message.length > 120) {
    safe.message = `${safe.message.slice(0, 120)}…`;
  }

  console.log(`[form:${formType}] received`, JSON.stringify(safe));
}

module.exports = { logFormSubmission };
