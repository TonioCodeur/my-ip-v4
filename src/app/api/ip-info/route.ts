import { NextRequest, NextResponse } from 'next/server';
import { saveIpInfo } from '@/actions/save-ip-info';

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
  continent: string;
  continentCode: string;
  proxy: boolean;
  mobile: boolean;
  hosting: boolean;
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
    if (!ip) {
      if (process.env.NODE_ENV === 'development') {
        ip = '92.135.20.92'; // IP de test pour le développement
      } else {
        return NextResponse.json(
          { error: 'Impossible de déterminer l\'adresse IP' },
          { status: 400 }
        );
      }
    }

    // Appeler l'API IP-API.com
    const apiUrl = `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query,continent,continentCode,proxy,mobile,hosting`;

    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 }, // Cache pour 1 heure
      signal: AbortSignal.timeout(8000), // Timeout de 8 secondes
    });

    if (!response.ok) {
      // 502 Bad Gateway : L'API externe a renvoyé une erreur
      if (response.status >= 500) {
        return NextResponse.json(
          { error: 'Le service de géolocalisation est temporairement indisponible' },
          { status: 503 }
        );
      }

      // 404 si l'API retourne une erreur 404
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Adresse IP introuvable' },
          { status: 404 }
        );
      }

      // Autres erreurs de l'API externe
      return NextResponse.json(
        { error: `Erreur lors de la communication avec le service de géolocalisation: ${response.statusText}` },
        { status: 502 }
      );
    }

    const data: IpApiResponse = await response.json();

    // Vérifier le statut de la réponse
    if (data.status === 'fail') {
      return NextResponse.json(
        { error: 'Impossible de récupérer les informations pour cette IP' },
        { status: 422 } // 422 Unprocessable Entity : L'IP est valide mais ne peut pas être traitée
      );
    }

    // Sauvegarder les informations IP en base de données (async, ne bloque pas la réponse)
    saveIpInfo(ip).catch((error) => {
      console.error('[API /ip-info] Erreur lors de la sauvegarde en DB:', error);
    });

    return NextResponse.json(data);

  } catch (error) {
    console.error('[API /ip-info] Erreur:', error);

    // 504 Gateway Timeout : Timeout lors de l'appel à l'API externe
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Le service de géolocalisation met trop de temps à répondre' },
        { status: 504 }
      );
    }

    // 500 Internal Server Error : Erreur serveur générique
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des informations IP' },
      { status: 500 }
    );
  }
}