/**
 * Renders JSON-LD structured data as an `application/ld+json` script tag.
 *
 * @see https://json-ld.org/spec/latest/json-ld/#embedding-json-ld-in-html-documents
 */

/** Kept as named constants so the source file stays pure ASCII. */
const LINE_SEPARATOR = "\u2028";
const PARAGRAPH_SEPARATOR = "\u2029";

const scriptEscapes: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  [LINE_SEPARATOR]: "\\u2028",
  [PARAGRAPH_SEPARATOR]: "\\u2029",
};

const unsafeScriptCharacters = /[<>&\u2028\u2029]/gu;

function escapeJsonForScript(json: string): string {
  return json.replace(unsafeScriptCharacters, (char) => scriptEscapes[char] ?? char);
}

/**
 * Serializes JSON-LD for inline embedding.
 *
 * `<`, `>`, and `&` are escaped so a value containing `</script>` cannot close
 * the tag early, and U+2028/U+2029 are escaped because they are valid in JSON
 * but illegal raw inside a JavaScript string literal.
 */
function serializeJsonLd(data: unknown, space?: number): string {
  return escapeJsonForScript(JSON.stringify(data, null, space) ?? "null");
}

type JsonLdProps = {
  /** A single node, or several nodes rendered as a JSON-LD array. */
  data: unknown;
  /** Optional `id` so a framework can dedupe or replace the tag. */
  id?: string;
  /** Pretty-print with the given indent. Useful while debugging. */
  space?: number;
};

function JsonLd({ data, id, space }: JsonLdProps) {
  if (data === null || data === undefined) {
    return null;
  }

  if (Array.isArray(data) && data.length === 0) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      id={id}
      suppressHydrationWarning
      // Escaped by serializeJsonLd: JSON.stringify output is never raw markup.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data, space) }}
    />
  );
}

export { JsonLd, serializeJsonLd, type JsonLdProps };
