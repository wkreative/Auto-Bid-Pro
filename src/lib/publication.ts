/** Remove supplier branding from legacy and imported publication text. */
export function publicationText(value: string): string {
  return value.replace(/manheim(?:\s+puerto\s+rico)?/gi, 'Puerto Rico');
}
