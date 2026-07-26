export function getLangName(lang) {
  return lang.charAt(0).toUpperCase() + lang.slice(1);
}

export function getLangFlag(lang) {
  if (lang === 'german') return 'germany flag';
  if (lang === 'french') return 'france flag';
  return 'united kingdom flag';
}

export function getLangCode(lang) {
  if (lang === 'german') return 'DE';
  if (lang === 'french') return 'FR';
  return 'EN';
}
