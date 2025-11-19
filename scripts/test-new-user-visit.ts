/**
 * Simule la visite d'un NOUVEL utilisateur avec une IP unique
 */
import { saveIpInfo } from "../src/actions/save-ip-info";
import prisma from "../src/lib/prisma";

async function testNewUserVisit() {
  console.log("🧪 Test: Visite d'un NOUVEL utilisateur\n");
  console.log("=".repeat(70));

  // Générer une IP de test unique qui n'existe pas encore
  const newIp = "203.0.113.42"; // IP de documentation (RFC 5737)

  console.log(`👤 Nouvel utilisateur avec IP: ${newIp}`);
  console.log("=".repeat(70));

  // Vérifier qu'elle n'existe pas déjà
  const existing = await prisma.user.findFirst({
    where: { ipAddress: newIp },
  });

  if (existing) {
    console.log(`\n🗑️  IP existante détectée, suppression...`);
    await prisma.user.delete({ where: { id: existing.id } });
    console.log(`   ✅ Supprimée\n`);
  }

  const countBefore = await prisma.user.count();
  console.log(`\n📊 Enregistrements AVANT: ${countBefore}\n`);

  // Simuler la visite (flux page.tsx)
  console.log("▶️  L'utilisateur accède à la page...\n");
  console.log("📝 Appel: await saveIpInfo(userIp)");

  const result = await saveIpInfo(newIp);

  console.log(`\n📋 Résultat:`);
  console.log(`   - Success: ${result.success}`);
  console.log(`   - Skipped: ${result.skipped || false}`);

  if (result.success && result.data) {
    console.log(`\n✅ DONNÉES SAUVEGARDÉES EN DB:`);
    console.log(`   - ID: ${result.data.id}`);
    console.log(`   - IP: ${result.data.ipAddress}`);
    console.log(`   - Continent: ${result.data.continent}`);
    console.log(`   - Pays: ${result.data.country}`);
    console.log(`   - Ville: ${result.data.city}`);
    console.log(`   - Région: ${result.data.region}`);
    console.log(`   - Latitude: ${result.data.latitude}`);
    console.log(`   - Longitude: ${result.data.longitude}`);
    console.log(`   - Timezone: ${result.data.timezone}`);
    console.log(`   - Proxy: ${result.data.proxy}`);
    console.log(`   - Mobile: ${result.data.mobile}`);
    console.log(`   - Hosting: ${result.data.hosting}`);
    console.log(`   - Créé le: ${result.data.createdAt.toISOString()}`);
  } else {
    console.log(`\n❌ ÉCHEC: ${result.error}`);
  }

  const countAfter = await prisma.user.count();
  console.log(`\n📊 Enregistrements APRÈS: ${countAfter}`);
  console.log(`📈 Différence: +${countAfter - countBefore}`);

  // Vérifier en DB
  console.log(`\n🔍 Vérification directe en DB...`);
  const dbRecord = await prisma.user.findFirst({
    where: { ipAddress: newIp },
  });

  if (dbRecord) {
    console.log(`✅ Trouvé en DB: ${dbRecord.ipAddress} - ${dbRecord.city}, ${dbRecord.country}`);
  } else {
    console.log(`❌ PAS trouvé en DB!`);
  }

  console.log("\n" + "=".repeat(70));

  if (result.success && countAfter > countBefore) {
    console.log("🎉 SUCCÈS TOTAL!");
    console.log("\n✅ L'application stocke correctement les IPs en DB quand un utilisateur se connecte!");
    console.log(`\n📌 Preuve:`);
    console.log(`   - Un nouvel utilisateur (IP ${newIp}) a visité la page`);
    console.log(`   - Son IP a été géolocalisée via ip-api.com`);
    console.log(`   - Toutes ses données ont été sauvegardées en DB`);
    console.log(`   - La DB a maintenant ${countAfter} enregistrements (+${countAfter - countBefore})`);
  } else if (result.success && result.skipped) {
    console.log("✅ Le système fonctionne (IP déjà existante, déduplication)");
  } else {
    console.log("❌ Le système ne fonctionne pas comme prévu");
  }

  console.log("\n" + "=".repeat(70));
  console.log("✅ Test terminé!\n");

  await prisma.$disconnect();
}

testNewUserVisit().catch((error) => {
  console.error("❌ Erreur:", error);
  process.exit(1);
});
