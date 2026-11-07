export const RTB_CHECK_REGISTER_URL =
  "https://rtb.ie/compliance/check-the-register/";

/** Irish Eircode: A65 F4E2 (routing key + unique identifier). */
export function extractEircode(text: string): string | undefined {
  const match = text.toUpperCase().match(/\b([AC-FHKNPRTV-Y]\d{2})\s?([AC-FHKNPRTV-Y0-9]{4})\b/);
  if (!match) return undefined;
  return `${match[1]} ${match[2]}`;
}
