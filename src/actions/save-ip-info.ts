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

// Helper pour vérifier si une IP est locale/privée
function isLocalIp(ip: string): boolean {
  return (
    ip === '::1' ||
    ip === '127.0.0.1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('172.17.') ||
    ip.startsWith('172.18.') ||
    ip.startsWith('172.19.') ||
    ip.startsWith('172.2') ||
    ip.startsWith('172.30.') ||
    ip.startsWith('172.31.')
  );
}

export async function saveIpInfo(ip?: string) {
  try {
    console.log(`[saveIpInfo] Démarrage - IP reçue: ${ip}`);

    // Si aucune IP n'est fournie, on ne peut pas continuer
    if (!ip) {
      console.error("[saveIpInfo] ❌ Aucune IP fournie");
      return {
        success: false,
        error: "Aucune IP fournie - headers manquants",
      };
    }

    // Si l'IP est locale, utiliser une IP de test pour la géolocalisation
    let targetIp = ip;
    if (isLocalIp(ip)) {
      targetIp = "8.8.8.8"; // IP de test Google DNS
      console.log(`[saveIpInfo] 🔄 IP locale détectée (${ip}), utilisation de l'IP de test ${targetIp}`);
    }

    console.log(`[saveIpInfo] Traitement de l'IP: ${targetIp}`);

    // Appeler directement l'API ip-api.com
    const apiUrl = `http://ip-api.com/json/${targetIp}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query,continent,continentCode,proxy,mobile,hosting`;

    console.log(`[saveIpInfo] Appel API ip-api.com pour IP: ${targetIp}`);
    const response = await fetch(apiUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      const error = `Erreur API (${response.status}): ${response.statusText}`;
      console.error(`[saveIpInfo] ${error}`);
      throw new Error(`Erreur lors de la récupération des données IP: ${response.statusText}`);
    }

    const data: IpApiResponse = await response.json();
    console.log(`[saveIpInfo] Réponse API reçue - Status: ${data.status}, IP: ${data.query}`);

    if (data.status === "fail") {
      console.error(`[saveIpInfo] API a retourné 'fail' pour IP: ${ip}`);
      throw new Error("Impossible de récupérer les informations pour cette IP");
    }

    // Vérifier si cette IP existe déjà dans les dernières 24h (éviter les doublons)
    // Important: On vérifie avec l'IP ORIGINALE de l'utilisateur, pas l'IP de test
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

    // Mapper les données de l'API au schéma Prisma
    // Important: On stocke l'IP ORIGINALE de l'utilisateur, mais avec les données géographiques de l'IP de test
    console.log(`[saveIpInfo] 💾 Création du record en DB pour IP originale: ${ip} (géoloc de ${targetIp})`);
    const userRecord = await prisma.user.create({
      data: {
        ipAddress: ip, // IP ORIGINALE de l'utilisateur
        continent: data.continent || data.countryCode, // Fallback si continent non disponible
        country: data.country,
        city: data.city,
        region: data.regionName,
        district: data.region, // code région comme district
        zip: data.zip,
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
      console.error("[saveIpInfo] Message d'erreur:", error.message);
      console.error("[saveIpInfo] Stack trace:", error.stack);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}
