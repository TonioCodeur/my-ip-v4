/**
 * Script de test complet du flux de sauvegarde d'IP
 * Simule ce qui se passe dans la page principale
 */
import { saveIpInfo } from "../src/actions/save-ip-info";
import prisma from "../src/lib/prisma";

async function testFullFlow() {
  console.log("🧪 Test du flux complet de sauvegarde d'IP\n");

  // Simuler différentes IPs de test
  const testIps = ["1.1.1.1", "8.8.8.8", "92.135.20.92"];

  for (const testIp of testIps) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📝 Test avec IP: ${testIp}`);
    console.log("=".repeat(60));

    const result = await saveIpInfo(testIp);

    if (result.success) {
      if (result.skipped) {
        console.log(`✅ IP ${testIp} déjà enregistrée (skipped)`);
      } else {
        console.log(`✅ IP ${testIp} sauvegardée avec succès!`);
        console.log(`   - ID: ${result.data?.id}`);
        console.log(`   - Ville: ${result.data?.city}`);
        console.log(`   - Pays: ${result.data?.country}`);
        console.log(`   - Latitude: ${result.data?.latitude}`);
        console.log(`   - Longitude: ${result.data?.longitude}`);
      }
    } else {
      console.error(`❌ Erreur: ${result.error}`);
    }
  }

  // Afficher le résumé de la DB
  console.log(`\n${"=".repeat(60)}`);
  console.log("📊 Résumé de la base de données");
  console.log("=".repeat(60));

  const totalCount = await prisma.user.count();
  console.log(`\nTotal d'enregistrements: ${totalCount}`);

  const recentRecords = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  console.log(`\nDerniers 10 enregistrements:`);
  recentRecords.forEach((record, idx) => {
    const age = Math.round(
      (Date.now() - record.createdAt.getTime()) / (1000 * 60)
    );
    console.log(
      `  ${idx + 1}. ${record.ipAddress.padEnd(15)} | ${record.city.padEnd(20)} | ${record.country.padEnd(20)} | ${age}min ago`
    );
  });

  // Test de la logique de déduplication (24h)
  console.log(`\n${"=".repeat(60)}`);
  console.log("🔄 Test de déduplication (24h)");
  console.log("=".repeat(60));

  const testDuplicateIp = testIps[0];
  console.log(`\nTentative de sauvegarder à nouveau ${testDuplicateIp}...`);
  const duplicateResult = await saveIpInfo(testDuplicateIp);

  if (duplicateResult.skipped) {
    console.log(
      `✅ Déduplication fonctionne! L'IP ${testDuplicateIp} a été skippée.`
    );
  } else if (duplicateResult.success) {
    console.log(
      `⚠️  L'IP ${testDuplicateIp} a été sauvegardée à nouveau (peut-être > 24h?)`
    );
  } else {
    console.log(`❌ Erreur: ${duplicateResult.error}`);
  }

  await prisma.$disconnect();
  console.log("\n✅ Tests terminés!\n");
}

testFullFlow().catch((error) => {
  console.error("❌ Erreur lors du test:", error);
  process.exit(1);
});
