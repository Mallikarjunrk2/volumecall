import sanitizeHtmlLib from "sanitize-html";

/**
 * Server-safe, purpose-built HTML sanitizer for CMS Markdown output.
 * Powered by sanitize-html (htmlparser2 engine) without JSDOM or browser dependencies.
 */

export const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "del",
  "strike",
  "blockquote",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "code",
  "pre",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "hr",
  "span",
  "div",
  "sub",
  "sup",
  "kbd",
  "a",
  "img",
];

export const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "target", "rel", "title", "id", "class"],
  img: ["src", "alt", "title", "width", "height", "loading", "decoding", "class"],
  h1: ["id", "class"],
  h2: ["id", "class"],
  h3: ["id", "class"],
  h4: ["id", "class"],
  h5: ["id", "class"],
  h6: ["id", "class"],
  div: ["class", "id"],
  span: ["class", "id"],
  code: ["class"],
  pre: ["class"],
  th: ["align", "colspan", "rowspan", "class"],
  td: ["align", "colspan", "rowspan", "class"],
  table: ["class"],
};

export const ALLOWED_SCHEMES = ["http", "https", "mailto"];

export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return "";

  return sanitizeHtmlLib(dirtyHtml, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ALLOWED_SCHEMES,
    allowedSchemesByTag: {
      a: ALLOWED_SCHEMES,
      img: ["http", "https"],
    },
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    transformTags: {
      a: sanitizeHtmlLib.simpleTransform("a", {
        rel: "noopener noreferrer",
      }),
    },
  });
}
