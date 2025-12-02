"use server";

import prisma from "@/lib/prisma";

// Format ipstack (nouvelle API)
interface IpstackResponse {
  ip: string;
  continent_code?: string;
  continent_name?: string;
  country_code: string;
  country_name: string;
  region_code?: string;
  region_name?: string;
  city: string;
  zip?: string;
  latitude: number;
  longitude: number;
  time_zone?: { id?: string };
  security?: {
    is_proxy?: boolean;
    is_tor?: boolean;
  };
}

// Format legacy ip-api.com (maintenu pour compatibilité)
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
  continent?: string;
  proxy?: boolean;
  mobile?: boolean;
  hosting?: boolean;
}

// Type unifié pour accepter les deux formats
type IpDataResponse = IpstackResponse | IpApiResponse;

/**
 * Vérifie si les données sont au format ipstack
 */
function isIpstackResponse(data: IpDataResponse): data is IpstackResponse {
  return 'country_name' in data && 'latitude' in data;
}

/**
 * Normalise les données IP pour l'enregistrement en DB
 */
function normalizeIpData(data: IpDataResponse) {
  if (isIpstackResponse(data)) {
    // Format ipstack
    return {
      continent: data.continent_name || data.continent_code || data.country_code,
      country: data.country_name,
      city: data.city,
      region: data.region_name || data.region_code || "N/A",
      district: data.region_code || "N/A",
      zip: data.zip || "N/A",
      timezone: data.time_zone?.id || "N/A",
      latitude: data.latitude,
      longitude: data.longitude,
      proxy: data.security?.is_proxy ?? false,
      mobile: false, // ipstack n'a pas ce champ dans le plan gratuit
      hosting: data.security?.is_tor ?? false, // On utilise is_tor comme indicateur d'hébergement suspect
    };
  } else {
    // Format legacy ip-api.com
    return {
      continent: data.continent || data.countryCode,
      country: data.country,
      city: data.city,
      region: data.regionName,
      district: data.region,
      zip: data.zip || "N/A",
      timezone: data.timezone,
      latitude: data.lat,
      longitude: data.lon,
      proxy: data.proxy ?? false,
      mobile: data.mobile ?? false,
      hosting: data.hosting ?? false,
    };
  }
}

/**
 * Sauvegarde une IP et ses informations de géolocalisation en base de données
 * @param ip - L'adresse IP à sauvegarder
 * @param ipData - Les données de géolocalisation (format ipstack ou ip-api.com)
 * @returns Résultat de la sauvegarde
 */
export async function saveIpInfo(ip?: string, ipData?: IpDataResponse) {
  try {
    console.log(`[saveIpInfo] Démarrage - IP: ${ip}, Data fournie: ${!!ipData}`);

    // Validation de l'IP
    if (!ip) {
      console.error("[saveIpInfo] ❌ Aucune IP fournie");
      return {
        success: false,
        error: "Aucune IP fournie",
      };
    }

    // Vérifier que les données ont été fournies
    if (!ipData) {
      console.error("[saveIpInfo] ❌ Aucune donnée fournie");
      return {
        success: false,
        error: "Les données IP doivent être fournies",
      };
    }

    console.log(`[saveIpInfo] Utilisation des données fournies pour IP: ${ip}`);
    const data = ipData;

    // Vérifier si cette IP existe déjà dans les dernières 24h (éviter les doublons)
    console.log(`[saveIpInfo] Vérification des doublons pour IP: ${ip}`);
    const recentVisit = await prisma.user.findFirst({
      where: {
        ipAddress: ip,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Dernières 24h
        },
      },
    });

    if (recentVisit) {
      console.log(`[saveIpInfo] ⏭️ IP ${ip} déjà enregistrée récemment (ID: ${recentVisit.id}), skip insertion`);
      return {
        success: true,
        data: recentVisit,
        skipped: true,
      };
    }

    // Normaliser les données pour le format DB
    const normalizedData = normalizeIpData(data);

    // Créer le record en DB
    console.log(`[saveIpInfo] 💾 Création du record en DB pour IP: ${ip}`);
    const userRecord = await prisma.user.create({
      data: {
        ipAddress: ip,
        ...normalizedData,
      },
    });

    console.log(`[saveIpInfo] ✅ Record créé avec succès - ID: ${userRecord.id}, IP: ${userRecord.ipAddress}`);
    return {
      success: true,
      data: userRecord,
    };
  } catch (error) {
    console.error("[saveIpInfo] ❌ Erreur lors de la sauvegarde:", error);
    if (error instanceof Error) {
      console.error("[saveIpInfo] Message:", error.message);
      console.error("[saveIpInfo] Stack:", error.stack);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue lors de la sauvegarde",
    };
  }
}
