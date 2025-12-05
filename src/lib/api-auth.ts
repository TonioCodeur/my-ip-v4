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

  // Requêtes sans origin ni referer sont rejetées (sécurité)
  console.error("[API Auth] Origine non autorisée:", { origin, referer, host });
  return false;
}

/**
 * Vérifie le token API pour les requêtes externes
 * Le token doit être fourni dans le header Authorization: Bearer <token>
 * ou dans le header X-API-Token: <token>
 *
 * Les requêtes internes (depuis le frontend de l'app) sont autorisées via verifyOrigin()
 * Les requêtes externes (API publique) doivent fournir un token valide
 */
export function verifyApiToken(request: Request): {
  isValid: boolean;
  isInternal: boolean;
  message?: string;
} {
  const apiToken = process.env.API_TOKEN;
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  // Vérifier si c'est une requête interne (depuis notre propre frontend)
  const isInternalRequest = verifyOrigin(request);

  // Si c'est une requête interne, autoriser sans token
  if (isInternalRequest) {
    console.log("[API Auth] Requête interne autorisée (même origine)");
    return { isValid: true, isInternal: true };
  }

  // Pour les requêtes externes, vérifier le token
  console.log(
    "[API Auth] Requête externe détectée - Vérification du token requise"
  );

  // Si aucun token n'est configuré, refuser les requêtes externes
  if (!apiToken) {
    console.error("[API Auth] API_TOKEN non configuré dans l'environnement");
    return {
      isValid: false,
      isInternal: false,
      message: "API token not configured",
    };
  }

  // Récupérer le token depuis les headers
  const authHeader = request.headers.get("authorization");
  const apiTokenHeader = request.headers.get("x-api-token");

  let providedToken: string | null = null;

  // Vérifier le header Authorization (Bearer token)
  if (authHeader?.startsWith("Bearer ")) {
    providedToken = authHeader.substring(7);
  }
  // Sinon vérifier le header X-API-Token
  else if (apiTokenHeader) {
    providedToken = apiTokenHeader;
  }

  // Vérifier que le token fourni correspond au token configuré
  if (providedToken && providedToken === apiToken) {
    console.log("[API Auth] ✅ Token API valide pour requête externe");
    return { isValid: true, isInternal: false };
  }

  console.error(
    "[API Auth] ❌ Token API invalide ou manquant pour requête externe",
    {
      hasAuthHeader: !!authHeader,
      hasApiTokenHeader: !!apiTokenHeader,
      origin,
      referer,
      host,
    }
  );

  return {
    isValid: false,
    isInternal: false,
    message: "Invalid or missing API token",
  };
}
