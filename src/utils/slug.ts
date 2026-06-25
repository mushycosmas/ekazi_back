export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')      // spaces → dash
    .replace(/[^\w\-]+/g, '')  // remove special characters
    .replace(/\-\-+/g, '-');   // remove multiple dashes
}