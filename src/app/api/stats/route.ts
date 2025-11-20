import { getIpStats } from '@/actions/get-ip-stats';
import { NextResponse } from 'next/server';

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
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
