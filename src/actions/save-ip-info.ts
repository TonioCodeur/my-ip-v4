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

export async function saveIpInfo(ip?: string) {
  try {
    console.log(`[saveIpInfo] Démarrage - IP reçue: ${ip}, NODE_ENV: ${process.env.NODE_ENV}`);

    let targetIp = ip;

    // Filtrer les IPs locales/privées
    const isLocalIp = (ipAddr: string | undefined) => {
      if (!ipAddr) return true;
      return (
        ipAddr === "::1" ||
        ipAddr === "127.0.0.1" ||
        ipAddr.startsWith("192.168.") ||
        ipAddr.startsWith("10.") ||
        ipAddr.startsWith("172.16.")
      );
    };

    // En développement avec IP locale, utiliser une IP de test publique valide
    if (process.env.NODE_ENV === "development" && isLocalIp(targetIp)) {
      console.log("🔄 IP locale détectée en dev, utilisation de l'IP de test 8.8.8.8");
      targetIp = "8.8.8.8";
    }

    // En production avec IP locale (cas anormal), logger mais continuer avec l'IP
    if (process.env.NODE_ENV === "production" && targetIp && isLocalIp(targetIp)) {
      console.warn(`⚠️ IP locale détectée en production: ${targetIp} - Cela ne devrait pas arriver!`);
    }

    // Si aucune IP n'est fournie, on ne peut pas continuer
    if (!targetIp) {
      const errorMsg = `❌ Aucune IP fournie. NODE_ENV: ${process.env.NODE_ENV}`;
      console.error(errorMsg);
      return {
        success: false,
        error: "Aucune IP fournie - headers manquants",
      };
    }

    console.log(`[saveIpInfo] IP cible finale: ${targetIp}`);

    // Appeler directement l'API ip-api.com (évite les problèmes de port/URL)
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
      console.error(`[saveIpInfo] API a retourné 'fail' pour IP: ${targetIp}`);
      throw new Error("Impossible de récupérer les informations pour cette IP");
    }

    // Vérifier si cette IP existe déjà dans les dernières 24h (éviter les doublons)
    console.log(`[saveIpInfo] Vérification des doublons pour IP: ${data.query}`);
    const recentVisit = await prisma.user.findFirst({
      where: {
        ipAddress: data.query,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Dernières 24h
        },
      },
    });

    if (recentVisit) {
      console.log(`[saveIpInfo] ⏭️ IP ${data.query} déjà enregistrée récemment (ID: ${recentVisit.id}), skip insertion`);
      return {
        success: true,
        data: recentVisit,
        skipped: true,
      };
    }

    // Mapper les données de l'API au schéma Prisma
    console.log(`[saveIpInfo] 💾 Création du record en DB pour IP: ${data.query}`);
    const userRecord = await prisma.user.create({
      data: {
        ipAddress: data.query,
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
