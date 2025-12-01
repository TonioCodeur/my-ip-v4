/**
 * Vérifie que la requête provient du même domaine (même origine)
 * Protection contre les requêtes cross-origin non autorisées
 */
export function verifyOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  // En développement, autoriser localhost
  if (process.env.NODE_ENV === "development") {
    if (
      origin?.includes("localhost") ||
      referer?.includes("localhost") ||
      host?.includes("localhost")
    ) {
      return true;
    }
  }

  // Vérifier que l'origine ou le referer correspondent au host
  if (origin) {
    const originHost = new URL(origin).host;
    if (originHost === host) {
      return true;
    }
  }

  if (referer) {
    const refererHost = new URL(referer).host;
    if (refererHost === host) {
      return true;
    }
  }

  // Si pas d'origin ni de referer (requête directe depuis le serveur ou curl)
  // on accepte quand même pour permettre SSR et tests
  if (!origin && !referer) {
    console.warn(
      "[API Auth] Requête sans origin ni referer - Probablement SSR ou test"
    );
    return true;
  }

  console.error("[API Auth] Origine non autorisée:", { origin, referer, host });
  return false;
}
