import { headers } from 'next/headers';

export async function getUserIp(): Promise<string | null> {
  const headersList = await headers();
  
  // Vérifier différents headers dans l'ordre de priorité
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for peut contenir plusieurs IPs séparées par des virgules
    // On prend la première qui est l'IP originale du client
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = headersList.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  const remoteAddr = headersList.get('x-remote-addr');
  if (remoteAddr) {
    return remoteAddr;
  }
  
  // En développement, retourner une IP de test
  if (process.env.NODE_ENV === 'development') {
    return '8.8.8.8'; // IP de Google DNS pour les tests
  }
  
  return null;
}