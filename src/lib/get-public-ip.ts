/**
 * Obtient l'IP publique réelle de la machine via un service externe
 * Utilisé en développement quand aucun header IP n'est disponible
 */
export async function getPublicIp(): Promise<string | null> {
  try {
    console.log('[getPublicIp] Récupération de l\'IP publique via API externe...');

    // Utiliser api.ipify.org (service gratuit et fiable)
    const response = await fetch('https://api.ipify.org?format=json', {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('[getPublicIp] ❌ Erreur HTTP:', response.status);
      return null;
    }

    const data = await response.json();
    const publicIp = data.ip;

    if (publicIp) {
      console.log('[getPublicIp] ✅ IP publique obtenue:', publicIp);
      return publicIp;
    }

    console.error('[getPublicIp] ❌ Aucune IP dans la réponse');
    return null;
  } catch (error) {
    console.error('[getPublicIp] ❌ Erreur lors de la récupération:', error);
    return null;
  }
}
