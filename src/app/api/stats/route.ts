import { getIpStats } from '@/actions/get-ip-stats';
import { NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * API Route pour récupérer les statistiques en temps réel
 * GET /api/stats
 *
 * Cache: 30 secondes pour réduire la charge sur la DB
 */
export async function GET() {
  try {
    const stats = await getIpStats();

    return NextResponse.json(stats, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('[API /stats] Erreur:', error);

    // Erreur de connexion à la base de données Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P1001: Can't reach database server
      // P1002: The database server was reached but timed out
      // P1008: Operations timed out
      if (['P1001', 'P1002', 'P1008'].includes(error.code)) {
        return NextResponse.json(
          { error: 'La base de données est temporairement indisponible' },
          { status: 503 } // 503 Service Unavailable
        );
      }

      // P2024: Timed out fetching a new connection from the connection pool
      if (error.code === 'P2024') {
        return NextResponse.json(
          { error: 'Trop de connexions simultanées, veuillez réessayer' },
          { status: 429 } // 429 Too Many Requests
        );
      }

      // Autres erreurs Prisma connues
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des statistiques' },
        { status: 500 }
      );
    }

    // Erreur d'initialisation du client Prisma
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { error: 'La base de données n\'est pas accessible' },
        { status: 503 } // 503 Service Unavailable
      );
    }

    // Erreur de validation Prisma
    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        { error: 'Erreur de validation des données' },
        { status: 400 } // 400 Bad Request
      );
    }

    // Erreur générique
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des statistiques' },
      { status: 500 } // 500 Internal Server Error
    );
  }
}
