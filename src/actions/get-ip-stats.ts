"use server";

import prisma from "../lib/prisma";

export interface IpStats {
  totalQueries: number;
  uniqueCountries: number;
  averageResponseTime: number;
  activeUsers: number;
  lastUpdated: string;
}

/**
 * Server Action pour récupérer les statistiques réelles depuis la base de données
 * Calcule le nombre total d'entrées, les pays uniques, et les utilisateurs actifs récents
 */
export async function getIpStats(): Promise<IpStats> {
  try {
    const startTime = Date.now();

    // Récupérer le nombre total d'entrées dans la table User
    const totalQueries = await prisma.user.count();

    // Récupérer le nombre de pays uniques
    const uniqueCountriesResult = await prisma.user.groupBy({
      by: ["country"],
      _count: {
        country: true,
      },
    });
    const uniqueCountries = uniqueCountriesResult.length;

    // Calculer le temps de réponse moyen (simulation basée sur le temps de la requête DB)
    const responseTime = Date.now() - startTime;

    // Compter les utilisateurs actifs (entrées créées dans les dernières 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: oneDayAgo,
        },
      },
    });

    return {
      totalQueries,
      uniqueCountries,
      averageResponseTime: responseTime,
      activeUsers,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      "[getIpStats] Erreur lors de la récupération des statistiques:",
      error
    );

    // Retourner des statistiques par défaut en cas d'erreur
    return {
      totalQueries: 0,
      uniqueCountries: 0,
      averageResponseTime: 0,
      activeUsers: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}
