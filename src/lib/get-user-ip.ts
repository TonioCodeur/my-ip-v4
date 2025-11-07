import { headers } from 'next/headers';

export async function getUserIp(): Promise<string | null> {
  const headersList = await headers();

  // Vérifier différents headers dans l'ordre de priorité (Vercel utilise x-forwarded-for)
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for peut contenir plusieurs IPs séparées par des virgules
    // On prend la première qui est l'IP originale du client
    const clientIp = forwardedFor.split(',')[0].trim();
    console.log('✅ IP détectée via x-forwarded-for:', clientIp);
    return clientIp;
  }

  const realIp = headersList.get('x-real-ip');
  if (realIp) {
    console.log('✅ IP détectée via x-real-ip:', realIp);
    return realIp;
  }

  // Vercel utilise aussi parfois x-vercel-forwarded-for
  const vercelForwarded = headersList.get('x-vercel-forwarded-for');
  if (vercelForwarded) {
    const clientIp = vercelForwarded.split(',')[0].trim();
    console.log('✅ IP détectée via x-vercel-forwarded-for:', clientIp);
    return clientIp;
  }

  const remoteAddr = headersList.get('x-remote-addr');
  if (remoteAddr) {
    console.log('✅ IP détectée via x-remote-addr:', remoteAddr);
    return remoteAddr;
  }
  
  // En développement, retourner une IP de test
  if (process.env.NODE_ENV === 'development') {
    return '8.8.8.8'; // IP de Google DNS pour les tests
  }

  // En production, si aucun header n'est trouvé, essayer de détecter depuis le client
  // Retourner null et laisser le server action gérer le fallback
  console.warn('⚠️ Aucun header IP trouvé. Headers disponibles:',
    Array.from(headersList.keys()).join(', '));

  return null;
}