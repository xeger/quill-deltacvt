export function escapeFontFamily(text: string): string {
  return text
    .split(/,\s*/)
    .map((f) => (/\s+/.test(f) && !/^['"].*['"]$/.test(f) ? `'${f}'` : f))
    .join(', ');
}
