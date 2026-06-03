const CACHE_NAME = "user-prefs";
const LANGUAGE_KEY = "/__prefs/language";

export async function saveLanguageForSW(language: string): Promise<void> {
  const cache = await caches.open(CACHE_NAME);
  await cache.put(new Request(LANGUAGE_KEY), new Response(language));
}

export async function loadLanguageFromSW(): Promise<string> {
  const cache = await caches.open(CACHE_NAME);
  const resp = await cache.match(LANGUAGE_KEY);
  return resp ? resp.text() : "sv";
}
