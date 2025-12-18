export const prettifyCollegeName = (name: string) => {
  if (!name) return "";
  // Collapse extra spaces and trim
  return name.replace(/\s+/g, " ").trim();
};

/**
 * Returns a normalization key for a college name so that
 * variations like "CVR College", "CVR Collge of engineering",
 * "cvr college" are treated as one logical college.
 *
 * Strategy:
 * - Lowercase
 * - Remove punctuation
 * - Use the first short word (often the acronym) as the key
 */
export const getCollegeKey = (name: string) => {
  if (!name) return "";

  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "";

  const words = cleaned.split(" ");
  if (!words.length) return "";

  const first = words[0];

  // For typical acronyms like "cvr", "iit", "nit"
  if (first.length <= 5) return first;

  // Fallback: use first 5 chars to keep key compact but stable
  return first.slice(0, 5);
};


