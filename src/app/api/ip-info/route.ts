import { saveIpInfo } from "@/actions/save-ip-info";
import { verifyOrigin } from "@/lib/api-auth";
import { NextRequest, NextResponse } from "next/server";

interface IpstackResponse {
  ip: string;
  type: string;
  continent_code: string;
  continent_name: string;
  country_code: string;
  country_name: string;
  region_code: string;
  region_name: string;
  city: string;
  zip: string;
  latitude: number;
  longitude: number;
  location?: {
    geoname_id?: number;
    capital?: string;
    languages?: Array<{ code: string; name: string; native: string }>;
    country_flag?: string;
    country_flag_emoji?: string;
    calling_code?: string;
    is_eu?: boolean;
  };
  time_zone?: {
    id?: string;
    current_time?: string;
    gmt_offset?: number;
    code?: string;
    is_daylight_saving?: boolean;
  };
  currency?: {
    code?: string;
    name?: string;
    plural?: string;
    symbol?: string;
    symbol_native?: string;
  };
  connection?: {
    asn?: number;
    isp?: string;
  };
  security?: {
    is_proxy?: boolean;
    proxy_type?: string | null;
    is_crawler?: boolean;
    is_tor?: boolean;
    threat_level?: string;
    threat_types?: string[] | null;
  };
  error?: {
    code: number;
    type: string;
    info: string;
  };
}

// Format legacy pour compatibilité avec le frontend
interface LegacyIpApiResponse {
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

/**
 * Convertit la réponse ipstack au format legacy pour compatibilité frontend
 */
function convertToLegacyFormat(data: IpstackResponse): LegacyIpApiResponse {
  return {
    status: "success",
    query: data.ip,
    country: data.country_name,
    countryCode: data.country_code,
    region: data.region_code || "N/A",
    regionName: data.region_name || "N/A",
    city: data.city,
    zip: data.zip || "",
    lat: data.latitude,
    lon: data.longitude,
    timezone: data.time_zone?.id || "UTC",
    isp: data.connection?.isp || "N/A",
    org: data.connection?.isp || "N/A",
    as: data.connection?.asn ? `AS${data.connection.asn}` : "N/A",
    continent: data.continent_name,
    continentCode: data.continent_code,
    proxy: data.security?.is_proxy ?? false,
    mobile: false, // ipstack ne fournit pas cette info dans le plan gratuit
    hosting: data.security?.is_tor ?? false,
  };
}

export async function GET(request: NextRequest) {
  // Vérification de l'origine de la requête
  if (!verifyOrigin(request)) {
    return NextResponse.json(
      { error: "Accès refusé - Origine non autorisée" },
      { status: 403 }
    );
  }

  const startTime = Date.now();

  try {
    // Récupérer l'IP depuis les paramètres de requête ou utiliser l'IP du client
    const searchParams = request.nextUrl.searchParams;
    const ipParam = searchParams.get("ip");

    // Si pas d'IP fournie, essayer de récupérer l'IP du client
    let ip = ipParam;

    if (!ip) {
      // Essayer différentes méthodes pour obtenir l'IP du client
      const forwardedFor = request.headers.get("x-forwarded-for");
      const realIp = request.headers.get("x-real-ip");
      const remoteAddr = request.headers.get("x-remote-addr");

      ip = forwardedFor?.split(",")[0].trim() || realIp || remoteAddr || null;

      console.log("[API /ip-info] Headers:", {
        forwardedFor,
        realIp,
        remoteAddr,
        resolved: ip,
      });
    }

    // Si toujours pas d'IP, retourner une erreur
    if (!ip) {
      console.error(
        "[API /ip-info] ❌ Impossible de déterminer l'IP - Aucun header trouvé"
      );
      return NextResponse.json(
        { error: "Impossible de déterminer l'adresse IP" },
        { status: 400 }
      );
    }

    console.log(`[API /ip-info] Requête pour IP: ${ip} (param: ${!!ipParam})`);

    // Stratégie de fallback: essayer ipstack d'abord, puis ip-api.com
    const apiKey = process.env.API_KEY_IPSTACK;
    let response: Response;
    let data: IpstackResponse | LegacyIpApiResponse;
    let useIpstack = true;

    try {
      // Essayer ipstack d'abord
      const ipstackUrl = `http://api.ipstack.com/${ip}?access_key=${apiKey}&security=1`;
      console.log(`[API /ip-info] Tentative avec ipstack: ${ipstackUrl}`);

      response = await fetch(ipstackUrl, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(5000), // Timeout plus court pour fallback rapide
      });

      if (!response.ok) {
        throw new Error(`ipstack error: ${response.status}`);
      }

      data = await response.json();

      // Vérifier si ipstack a retourné une erreur
      if ('error' in data && data.error) {
        throw new Error(`ipstack API error: ${data.error.type}`);
      }

      console.log(`[API /ip-info] ✅ Réponse ipstack reçue pour IP: ${(data as IpstackResponse).ip}`);
    } catch (ipstackError) {
      // Fallback vers ip-api.com
      console.warn(`[API /ip-info] ⚠️ ipstack a échoué, fallback vers ip-api.com:`, ipstackError);
      useIpstack = false;

      const ipApiUrl = `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query,continent,continentCode,proxy,mobile,hosting`;

      response = await fetch(ipApiUrl, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        console.error(`[API /ip-info] ❌ Erreur ip-api.com - Status: ${response.status}`);
        throw new Error(`Both APIs failed. Last status: ${response.status}`);
      }

      data = await response.json();

      if ('status' in data && data.status === 'fail') {
        throw new Error('ip-api.com returned fail status');
      }

      console.log(`[API /ip-info] ✅ Réponse ip-api.com reçue pour IP: ${(data as LegacyIpApiResponse).query}`);
    }

    // Convertir au format legacy si nécessaire
    let legacyData: LegacyIpApiResponse;
    if (useIpstack) {
      legacyData = convertToLegacyFormat(data as IpstackResponse);
    } else {
      legacyData = data as LegacyIpApiResponse;
    }

    console.log(
      `[API /ip-info] Réponse API reçue - IP: ${legacyData.query}, Pays: ${legacyData.country}`
    );

    // Sauvegarder les informations IP en base de données
    console.log(`[API /ip-info] Sauvegarde en DB pour IP: ${ip}`);
    const saveResult = await saveIpInfo(ip, useIpstack ? (data as IpstackResponse) : legacyData);

    if (saveResult.success) {
      if (saveResult.skipped) {
        console.log(`[API /ip-info] ⏭️ IP déjà enregistrée récemment: ${ip}`);
      } else {
        console.log(
          `[API /ip-info] ✅ IP sauvegardée avec succès: ${ip} (ID: ${saveResult.data?.id})`
        );
      }
    } else {
      console.error(
        `[API /ip-info] ❌ Erreur sauvegarde DB: ${saveResult.error}`
      );
    }

    const duration = Date.now() - startTime;
    console.log(
      `[API /ip-info] ✅ Requête terminée en ${duration}ms pour IP: ${ip}`
    );

    return NextResponse.json(legacyData);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[API /ip-info] ❌ Erreur après ${duration}ms:`, error);

    // 504 Gateway Timeout : Timeout lors de l'appel à l'API externe
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Le service de géolocalisation met trop de temps à répondre" },
        { status: 504 }
      );
    }

    // 500 Internal Server Error : Erreur serveur générique
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des informations IP" },
      { status: 500 }
    );
  }
}
