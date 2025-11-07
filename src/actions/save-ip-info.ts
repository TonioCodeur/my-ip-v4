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
    // Construire l'URL de l'API interne
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
    const apiUrl = new URL("/api/ip-info", baseUrl);
    if (ip) {
      apiUrl.searchParams.set("ip", ip);
    }

    // Fetch les données IP depuis l'API interne
    const response = await fetch(apiUrl.toString(), {
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
