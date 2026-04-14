const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple in-memory rate limiter for backend-side throttling.
 * @param id Unique identifier (IP or fingerprint)
 * @param limit Max requests allowed in the window
 * @param windowMs Time window in milliseconds (default 1 minute)
 */
export function checkRateLimit(id: string, limit = 5, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimitMap.get(id);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(id, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= limit) {
    const secondsLeft = Math.ceil((record.resetTime - now) / 1000);
    return {
      allowed: false,
      message: `Rate limit reached (5 requests/min). Please wait ${secondsLeft} seconds.`,
    };
  }

  record.count++;
  return { allowed: true };
}
