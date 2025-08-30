import { NextRequest, NextResponse } from 'next/server';

interface IpApiResponse {
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
}

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'IP depuis les paramètres de requête ou utiliser l'IP du client
    const searchParams = request.nextUrl.searchParams;
    const ipParam = searchParams.get('ip');
    
    // Si pas d'IP fournie, essayer de récupérer l'IP du client
    let ip = ipParam;
    
    if (!ip) {
      // Essayer différentes méthodes pour obtenir l'IP du client
      ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
           request.headers.get('x-real-ip') ||
           request.headers.get('x-remote-addr') ||
           null;
    }
    
    // En développement, utiliser une IP de test si aucune IP n'est trouvée
    if (!ip && process.env.NODE_ENV === 'development') {
      ip = '8.8.8.8'; // IP de Google DNS pour les tests
    }
    
    if (!ip) {
      return NextResponse.json(
        { error: 'Impossible de déterminer l\'adresse IP' },
        { status: 400 }
      );
    }
    
    // Appeler l'API IP-API.com
    const apiUrl = `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`;
    
    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 }, // Cache pour 1 heure
    });
    
    if (!response.ok) {
      throw new Error(`Erreur de l'API IP-API: ${response.statusText}`);
    }
    
    const data: IpApiResponse = await response.json();
    
    // Vérifier le statut de la réponse
    if (data.status === 'fail') {
      return NextResponse.json(
        { error: 'Impossible de récupérer les informations pour cette IP' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des informations IP:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des informations IP' },
      { status: 500 }
    );
  }
}