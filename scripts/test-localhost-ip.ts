/**
 * Test avec une IP localhost pour simuler le comportement dev
 */
import { saveIpInfo } from "../src/actions/save-ip-info";
import prisma from "../src/lib/prisma";

async function testLocalhostIp() {
  console.log("🧪 Test avec IP localhost (simulation dev local)\n");

  // Compter les enregistrements avant
  const countBefore = await prisma.user.count();
  console.log(`📊 Nombre d'enregistrements AVANT: ${countBefore}\n`);

  // Tester avec ::1 (ce que getUserIp() retourne en dev local)
  console.log("=".repeat(70));
  console.log("📝 Test avec IP localhost ::1 (dev local)");
  console.log("=".repeat(70));

  const result = await saveIpInfo("::1");

  console.log("\n📋 Résultat:");
  console.log(`   - Success: ${result.success}`);
  console.log(`   - Skipped: ${result.skipped || false}`);
  console.log(`   - Error: ${result.error || "aucune"}`);

  if (result.success && result.data) {
    console.log(`   - IP sauvegardée: ${result.data.ipAddress}`);
    console.log(`   - Ville: ${result.data.city}`);
    console.log(`   - Pays: ${result.data.country}`);
    console.log(`   - ID: ${result.data.id}`);
  }

  // Compter les enregistrements après
  const countAfter = await prisma.user.count();
  console.log(`\n📊 Nombre d'enregistrements APRÈS: ${countAfter}`);

  if (result.success && !result.skipped && countAfter > countBefore) {
    console.log("\n✅ SUCCESS! L'IP localhost a été convertie en IP de test et sauvegardée en DB!");
  } else if (result.skipped) {
    console.log("\n✅ L'IP de test (8.8.8.8) existe déjà en DB (déduplication)");
  } else {
    console.log("\n❌ FAIL! Rien n'a été sauvegardé en DB");
  }

  // Afficher les derniers enregistrements
  console.log("\n" + "=".repeat(70));
  console.log("📦 Derniers enregistrements en DB:");
  console.log("=".repeat(70));

  const recentRecords = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  recentRecords.forEach((record, idx) => {
    const age = Math.round(
      (Date.now() - record.createdAt.getTime()) / (1000 * 60)
    );
    console.log(
      `  ${idx + 1}. ${record.ipAddress.padEnd(15)} | ${record.city.padEnd(20)} | ${record.country.padEnd(20)} | ${age}min ago`
    );
  });

  await prisma.$disconnect();
  console.log("\n✅ Test terminé!\n");
}

testLocalhostIp().catch((error) => {
  console.error("❌ Erreur lors du test:", error);
  process.exit(1);
});
