export function generateId(): string {
  // Eine einfache aber oft ausreichende ID-Generierung für Spiele ohne Backend
  return Math.random().toString(36).substring(2, 11);
}
