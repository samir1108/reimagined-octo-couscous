// ============================================================
// Input sanitization for AI prompts
// Prevents prompt injection attacks by stripping/escaping
// malicious patterns from user input before sending to AI providers.
// ============================================================

/**
 * Sanitize user input before sending to AI providers.
 * Removes HTML tags, prompt injection patterns, and escapes special characters.
 */
export function sanitizeForAI(input: string): string {
  if (typeof input !== "string") return "";

  // 1. Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, "");

  // 2. Remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "");

  // 3. Remove common prompt injection patterns
  const injectionPatterns = [
    /\b(system|assistant|user)\s*:/gi,
    /\b(ignore|disregard|forget)\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|context)\b/gi,
    /\b(you\s+are\s+now|act\s+as|pretend\s+to\s+be|roleplay\s+as)\b/gi,
    /\b(new\s+instructions?|override\s+instructions?|replace\s+instructions?)\b/gi,
    /\b(DAN|developer\s+mode|admin\s+mode|jailbreak)\b/gi,
    /\[INST\]/gi,
    /\[\/INST\]/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
    /<\|system\|>/gi,
    /<\|user\|>/gi,
    /<\|assistant\|>/gi,
    /```system/gi,
    /```assistant/gi,
  ];

  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, "");
  }

  // 4. Trim excessive whitespace
  sanitized = sanitized.replace(/\s+/g, " ").trim();

  // 5. Limit length to prevent token exhaustion attacks
  const MAX_LENGTH = 50000;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.slice(0, MAX_LENGTH);
  }

  return sanitized;
}

/**
 * Sanitize a system prompt (more permissive - allows structured content)
 * but still blocks injection attempts.
 */
export function sanitizeSystemPrompt(input: string): string {
  if (typeof input !== "string") return "";

  let sanitized = input;

  // Remove null bytes
  sanitized = sanitized.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "");

  // Remove injection patterns that try to escape system context
  const systemInjectionPatterns = [
    /\b(ignore|disregard|forget)\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|context)\b/gi,
    /\b(you\s+are\s+now|act\s+as|pretend\s+to\s+be)\b/gi,
    /\b(new\s+instructions?|override\s+instructions?)\b/gi,
    /\[INST\]/gi,
    /\[\/INST\]/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
  ];

  for (const pattern of systemInjectionPatterns) {
    sanitized = sanitized.replace(pattern, "");
  }

  // Limit length
  const MAX_SYSTEM_LENGTH = 100000;
  if (sanitized.length > MAX_SYSTEM_LENGTH) {
    sanitized = sanitized.slice(0, MAX_SYSTEM_LENGTH);
  }

  return sanitized;
}

/**
 * Validate that a string doesn't contain obvious injection attempts.
 * Returns true if the input appears safe.
 */
export function isPromptInjection(input: string): boolean {
  if (typeof input !== "string") return false;

  const dangerousPatterns = [
    /\b(system|assistant|user)\s*:/gi,
    /\b(ignore|disregard|forget)\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?)\b/gi,
    /\b(you\s+are\s+now|act\s+as|pretend\s+to\s+be)\b/gi,
    /\[INST\]/gi,
    /<\|im_start\|>/gi,
  ];

  return dangerousPatterns.some(pattern => pattern.test(input));
}
