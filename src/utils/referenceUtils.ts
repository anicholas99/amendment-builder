/**
 * Utility functions for formatting and handling reference numbers
 */

/**
 * Formats a reference number by removing hyphens for display
 * @param referenceNumber - The reference number to format
 * @returns The formatted reference number without hyphens
 */
export function formatReferenceNumber(referenceNumber: string): string {
  return referenceNumber.replace(/-/g, '');
}

/**
 * Normalizes a reference number by removing common variations
 * @param referenceNumber - The reference number to normalize
 * @returns The normalized reference number
 */
export function normalizeReferenceNumber(referenceNumber: string): string {
  return referenceNumber.replace(/[-\s]/g, '').toUpperCase();
}

/**
 * Extracts the core patent number from a reference number
 * @param referenceNumber - The reference number to extract from
 * @returns The core patent number
 */
export function extractCorePatentNumber(referenceNumber: string): string {
  // Remove common prefixes and suffixes
  return referenceNumber
    .replace(
      /^(US|EP|WO|JP|CN|DE|FR|GB|KR|CA|AU|BR|RU|IN|MX|TW|SG|MY|TH|VN|PH|ID|NZ|ZA|IL|TR|EG|MA|DZ|TN|JO|LB|SY|IQ|IR|AF|PK|BD|LK|NP|MM|KH|LA|BN|FJ|PG|SB|VU|NC|PF|AS|GU|MH|FM|PW|KI|TV|NR|WS|TO|CK|NU|TK|PN|NF|CC|CX|HM|TF|BV|SJ|GL|FO|AX|AN|AW|BQ|CW|SX|GP|BL|MF|YT|RE|MQ|GF|PM|WF|PF|TF|BV|SJ|GL|FO|AX|AN|AW|BQ|CW|SX)-?/i,
      ''
    )
    .replace(/-(A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z)\d*$/i, '')
    .replace(/[^0-9]/g, '');
}
