/** Match Russian text without case, surrounding whitespace or ё/е differences. */
export function normalizeSearch(value: string) {
  return value.toLocaleLowerCase("ru").replaceAll("ё", "е").trim();
}
