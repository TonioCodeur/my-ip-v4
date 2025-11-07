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
    // En développement sans IP fournie, utiliser une IP de test publique valide
    const targetIp =
      ip || (process.env.NODE_ENV === "development" ? "8.8.8.8" : undefined);

    if (!targetIp) {
      throw new Error("Aucune IP fournie");
    }

    // Appeler directement l'API ip-api.com (évite les problèmes de port/URL)
    const apiUrl = `http://ip-api.com/json/${targetIp}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query,continent,continentCode,proxy,mobile,hosting`;

    const response = await fetch(apiUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la récupération des données IP: ${response.statusText}`
      );
    }

    const data: IpApiResponse = await response.json();

    if (data.status === "fail") {
      throw new Error("Impossible de récupérer les informations pour cette IP");
    }

    // Vérifier si cette IP existe déjà dans les dernières 24h (éviter les doublons)
    const recentVisit = await prisma.user.findFirst({
      where: {
        ipAddress: data.query,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Dernières 24h
        },
      },
    });

    if (recentVisit) {
      console.log(`IP ${data.query} déjà enregistrée récemment, skip insertion`);
      return {
        success: true,
        data: recentVisit,
        skipped: true,
      };
    }

    // Mapper les données de l'API au schéma Prisma
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

    return {
      success: true,
      data: userRecord,
    };
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des informations IP:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}
