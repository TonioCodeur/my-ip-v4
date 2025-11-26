"use server";

import prisma from "@/lib/prisma";

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

/**
 * Sauvegarde une IP et ses informations de géolocalisation en base de données
 * @param ip - L'adresse IP à sauvegarder
 * @param ipData - Les données de géolocalisation (optionnel, sera récupéré de l'API si non fourni)
 * @returns Résultat de la sauvegarde
 */
export async function saveIpInfo(ip?: string, ipData?: IpApiResponse) {
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

    // Si les données sont déjà fournies, on ne fait pas d'appel API
    let data: IpApiResponse;
    if (ipData) {
      console.log(`[saveIpInfo] Utilisation des données fournies pour IP: ${ip}`);
      data = ipData;
    } else {
      // Récupérer les données de géolocalisation depuis l'API
      console.log(`[saveIpInfo] Appel API ip-api.com pour IP: ${ip}`);
      const apiUrl = `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query,continent,continentCode,proxy,mobile,hosting`;

      const response = await fetch(apiUrl, {
        cache: "no-store",
      });

      if (!response.ok) {
        const error = `Erreur API (${response.status}): ${response.statusText}`;
        console.error(`[saveIpInfo] ${error}`);
        return {
          success: false,
          error: `Erreur lors de la récupération des données IP: ${response.statusText}`,
        };
      }

      data = await response.json();
      console.log(`[saveIpInfo] Réponse API reçue - Status: ${data.status}, IP: ${data.query}`);

      if (data.status === "fail") {
        console.error(`[saveIpInfo] API a retourné 'fail' pour IP: ${ip}`);
        return {
          success: false,
          error: "Impossible de récupérer les informations pour cette IP",
        };
      }
    }

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

    // Créer le record en DB
    console.log(`[saveIpInfo] 💾 Création du record en DB pour IP: ${ip}`);
    const userRecord = await prisma.user.create({
      data: {
        ipAddress: ip,
        continent: data.continent || data.countryCode, // Fallback si continent non disponible
        country: data.country,
        city: data.city,
        region: data.regionName,
        district: data.region, // code région comme district
        zip: data.zip || "N/A", // Certaines IPs n'ont pas de code postal
        timezone: data.timezone,
        latitude: data.lat,
        longitude: data.lon,
        proxy: data.proxy ?? false,
        mobile: data.mobile ?? false,
        hosting: data.hosting ?? false,
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
