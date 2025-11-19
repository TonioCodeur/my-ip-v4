/**
 * Test de la détection de l'IP publique réelle
 */
import { getPublicIp } from "../src/lib/get-public-ip";
import { saveIpInfo } from "../src/actions/save-ip-info";
import prisma from "../src/lib/prisma";

async function testPublicIpDetection() {
  console.log("🧪 Test: Détection de l'IP publique réelle\n");
  console.log("=".repeat(70));

  // Test 1: Obtenir l'IP publique
  console.log("1️⃣  Test de getPublicIp()");
  console.log("-".repeat(70));

  const publicIp = await getPublicIp();

  if (publicIp) {
    console.log(`\n✅ IP publique détectée: ${publicIp}`);
    console.log(`   Type: ${publicIp.includes(':') ? 'IPv6' : 'IPv4'}`);
  } else {
    console.log(`\n❌ Impossible de détecter l'IP publique`);
    await prisma.$disconnect();
    return;
  }

  // Test 2: Sauvegarder cette IP en DB
  console.log(`\n${"=".repeat(70)}`);
  console.log("2️⃣  Test de sauvegarde en DB");
  console.log("-".repeat(70));

  // Nettoyer si existe déjà
  await prisma.user.deleteMany({ where: { ipAddress: publicIp } });

  const result = await saveIpInfo(publicIp);

  console.log(`\n📋 Résultat:`);
  console.log(`   - Success: ${result.success}`);
  console.log(`   - Skipped: ${result.skipped || false}`);

  if (result.success && result.data) {
    console.log(`\n✅ DONNÉES SAUVEGARDÉES:`);
    console.log(`   - IP: ${result.data.ipAddress}`);
    console.log(`   - Continent: ${result.data.continent}`);
    console.log(`   - Pays: ${result.data.country}`);
    console.log(`   - Ville: ${result.data.city}`);
    console.log(`   - Région: ${result.data.region}`);
    console.log(`   - Lat/Lon: ${result.data.latitude}, ${result.data.longitude}`);
    console.log(`   - Timezone: ${result.data.timezone}`);
    console.log(`   - ID: ${result.data.id}`);

    // Vérifier en DB
    const dbRecord = await prisma.user.findFirst({
      where: { ipAddress: publicIp },
    });

    if (dbRecord) {
      console.log(`\n🔍 Vérification DB: ✅ Trouvé avec IP ${dbRecord.ipAddress}`);
    } else {
      console.log(`\n🔍 Vérification DB: ❌ PAS trouvé!`);
    }
  } else {
    console.log(`\n❌ Erreur: ${result.error}`);
  }

  console.log(`\n${"=".repeat(70)}`);
  console.log("📦 Statistiques DB");
  console.log("-".repeat(70));

  const count = await prisma.user.count();
  console.log(`Total d'enregistrements: ${count}\n`);

  const recent = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  recent.forEach((r, i) => {
    const age = Math.round((Date.now() - r.createdAt.getTime()) / (1000 * 60));
    const ageStr = age < 60 ? `${age}min` : `${Math.round(age / 60)}h`;
    const marker = r.ipAddress === publicIp ? "🎯" : "  ";
    console.log(
      `${marker} ${(i + 1).toString().padStart(2)}. ${r.ipAddress.padEnd(17)} | ${r.city.padEnd(20)} | ${r.country.padEnd(20)} | ${ageStr.padStart(6)} ago`
    );
  });

  console.log(`\n${"=".repeat(70)}`);

  if (result.success) {
    console.log("🎉 SUCCÈS!");
    console.log("\n✅ L'IP publique réelle de la machine est détectée et stockée en DB!");
    console.log(`\n📌 Votre IP publique: ${publicIp}`);
    console.log(
      `📍 Localisation: ${result.data?.city}, ${result.data?.region}, ${result.data?.country}`
    );
  } else {
    console.log("❌ ÉCHEC");
  }

  console.log(`\n${"=".repeat(70)}`);
  console.log("✅ Test terminé!\n");

  await prisma.$disconnect();
}

testPublicIpDetection().catch((error) => {
  console.error("❌ Erreur:", error);
  process.exit(1);
});
