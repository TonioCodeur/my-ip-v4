import { NextResponse } from 'next/server';
import { getUserIp } from '@/lib/get-user-ip';
import { saveIpInfo } from '@/actions/save-ip-info';
import prisma from '@/lib/prisma';

export async function GET() {
  const logs: string[] = [];

  try {
    logs.push('🧪 Test de stockage en DB - Démarrage');

    // Test 1: Détection IP
    logs.push('\n1️⃣  Test getUserIp()');
    const ip = await getUserIp();
    logs.push(`   → IP détectée: ${ip || 'null'}`);

    if (!ip) {
      return NextResponse.json({
        success: false,
        error: 'Aucune IP détectée',
        logs,
      }, { status: 400 });
    }

    // Test 2: Sauvegarde en DB
    logs.push('\n2️⃣  Test saveIpInfo()');
    const result = await saveIpInfo(ip);
    logs.push(`   → Success: ${result.success}`);
    logs.push(`   → Skipped: ${result.skipped || false}`);

    if (result.data) {
      logs.push(`   → IP en DB: ${result.data.ipAddress}`);
      logs.push(`   → Ville: ${result.data.city}`);
      logs.push(`   → Pays: ${result.data.country}`);
    }

    if (!result.success) {
      logs.push(`   → Erreur: ${result.error}`);
    }

    // Test 3: Vérification DB
    logs.push('\n3️⃣  Vérification en DB');
    const dbRecord = await prisma.user.findFirst({
      where: { ipAddress: ip },
      orderBy: { createdAt: 'desc' },
    });

    if (dbRecord) {
      logs.push(`   → ✅ Trouvé: ${dbRecord.ipAddress} - ${dbRecord.city}, ${dbRecord.country}`);
    } else {
      logs.push(`   → ❌ PAS trouvé en DB`);
    }

    // Test 4: Statistiques
    logs.push('\n4️⃣  Statistiques DB');
    const count = await prisma.user.count();
    logs.push(`   → Total enregistrements: ${count}`);

    const recent = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    logs.push(`   → 3 derniers enregistrements:`);
    recent.forEach((r, i) => {
      logs.push(`      ${i + 1}. ${r.ipAddress} - ${r.city}, ${r.country}`);
    });

    logs.push('\n✅ Test terminé avec succès!');

    return NextResponse.json({
      success: true,
      ip,
      savedData: result.data,
      skipped: result.skipped || false,
      totalRecords: count,
      logs: logs.join('\n'),
    });

  } catch (error) {
    logs.push(`\n❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      logs: logs.join('\n'),
    }, { status: 500 });
  }
}
