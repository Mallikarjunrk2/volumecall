/**
 * Server-safe, lightweight HTML sanitizer for Markdown output.
 * Does NOT depend on JSDOM, eliminating serverless runtime require() / ESM bundle errors.
 */

const DANGEROUS_TAGS_REGEX = /<\s*\/?\s*(script|style|iframe|object|embed|applet|form|input|button|select|textarea|meta|link|base|frame|frameset)[\s\S]*?>/gi;
const DANGEROUS_HANDLERS_REGEX = /\s+on[a-zA-Z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi;
const JAVASCRIPT_PROTOCOL_REGEX = /(href|src)\s*=\s*(['"])\s*(?:javascript|vbscript|data:text\/html):/gi;

export function sanitizeHtml(html: string): string {
  if (!html) return "";

  return html
    // 1. Remove dangerous executable/injection tags
    .replace(DANGEROUS_TAGS_REGEX, "")
    // 2. Remove inline event handlers (onclick, onerror, onload, etc.)
    .replace(DANGEROUS_HANDLERS_REGEX, "")
    // 3. Prevent javascript: / data: pseudo-protocols in href and src
    .replace(JAVASCRIPT_PROTOCOL_REGEX, '$1=$2#');
}
