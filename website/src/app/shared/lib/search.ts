/** Match Russian text without case, surrounding whitespace or ё/е differences. */
export const normalizeSearch = (value: string) =>
  value.toLowerCase().replaceAll("ё", "е").trim();
