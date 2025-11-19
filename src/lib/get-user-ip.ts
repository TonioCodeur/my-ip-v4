import { headers } from 'next/headers';
import { getPublicIp } from './get-public-ip';

export async function getUserIp(): Promise<string | null> {
  const headersList = await headers();

  console.log('[getUserIp] Détection de l\'IP utilisateur...');

  // Vérifier différents headers dans l'ordre de priorité (Vercel utilise x-forwarded-for)
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for peut contenir plusieurs IPs séparées par des virgules
    // On prend la première qui est l'IP originale du client
    const clientIp = forwardedFor.split(',')[0].trim();
    console.log('[getUserIp] ✅ IP détectée via x-forwarded-for:', clientIp);
    return clientIp;
  }

  const realIp = headersList.get('x-real-ip');
  if (realIp) {
    console.log('[getUserIp] ✅ IP détectée via x-real-ip:', realIp);
    return realIp;
  }

  // Vercel utilise aussi parfois x-vercel-forwarded-for
  const vercelForwarded = headersList.get('x-vercel-forwarded-for');
  if (vercelForwarded) {
    const clientIp = vercelForwarded.split(',')[0].trim();
    console.log('[getUserIp] ✅ IP détectée via x-vercel-forwarded-for:', clientIp);
    return clientIp;
  }

  const remoteAddr = headersList.get('x-remote-addr');
  if (remoteAddr) {
    console.log('[getUserIp] ✅ IP détectée via x-remote-addr:', remoteAddr);
    return remoteAddr;
  }

  // Aucune IP trouvée dans les headers
  const availableHeaders = Array.from(headersList.keys()).join(', ');
  console.log('[getUserIp] ⚠️ Aucun header IP trouvé');
  console.log('[getUserIp] Headers disponibles:', availableHeaders);

  // En dernier recours, obtenir l'IP publique via un service externe
  // Cela arrive typiquement en développement local
  console.log('[getUserIp] 🔄 Tentative de récupération de l\'IP publique...');
  const publicIp = await getPublicIp();

  if (publicIp) {
    console.log('[getUserIp] ✅ IP publique de la machine:', publicIp);
    return publicIp;
  }

  console.error('[getUserIp] ❌ Impossible de déterminer l\'IP');
  return null;
}