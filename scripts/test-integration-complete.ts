/**
 * Test d'intégration complet simulant un utilisateur qui se connecte
 * Teste toute la chaîne : getUserIp() -> saveIpInfo() -> DB
 */
import { getUserIp } from "../src/lib/get-user-ip";
import { saveIpInfo } from "../src/actions/save-ip-info";
import prisma from "../src/lib/prisma";

async function testCompleteIntegration() {
  console.log("🧪 Test d'intégration complet (simulation utilisateur)\n");
  console.log("=".repeat(70));

  // Compter avant
  const countBefore = await prisma.user.count();
  console.log(`📊 Enregistrements AVANT: ${countBefore}\n`);

  // ÉTAPE 1: Simuler getUserIp() en dev local
  console.log("📍 ÉTAPE 1: Détection de l'IP utilisateur");
  console.log("-".repeat(70));

  // En dev local, getUserIp() retourne généralement ::1 ou null
  // Simulons différents scénarios
  const testScenarios = [
    { name: "Localhost IPv6", ip: "::1" },
    { name: "Localhost IPv4", ip: "127.0.0.1" },
    { name: "IP privée", ip: "192.168.1.100" },
    { name: "IP publique (prod)", ip: "51.75.126.150" },
  ];

  for (const scenario of testScenarios) {
    console.log(`\n🔬 Scénario: ${scenario.name} (${scenario.ip})`);
    console.log("=".repeat(70));

    // ÉTAPE 2: Appeler saveIpInfo
    console.log("\n📝 ÉTAPE 2: Sauvegarde en DB via saveIpInfo()");
    const result = await saveIpInfo(scenario.ip);

    console.log(`\n📋 Résultat:`);
    console.log(`   - Success: ${result.success}`);
    console.log(`   - Skipped: ${result.skipped || false}`);
    console.log(`   - Error: ${result.error || "aucune"}`);

    if (result.success && result.data) {
      console.log(`\n✅ Données sauvegardées:`);
      console.log(`   - IP dans DB: ${result.data.ipAddress}`);
      console.log(`   - Ville: ${result.data.city}`);
      console.log(`   - Pays: ${result.data.country}`);
      console.log(`   - ID: ${result.data.id}`);
      console.log(`   - Créé le: ${result.data.createdAt.toISOString()}`);
    } else if (!result.success) {
      console.log(`\n❌ Erreur: ${result.error}`);
    }

    // ÉTAPE 3: Vérifier en DB
    console.log(`\n🔍 ÉTAPE 3: Vérification en base de données`);
    const ipInDb = result.data?.ipAddress || scenario.ip;
    const dbRecord = await prisma.user.findFirst({
      where: { ipAddress: ipInDb },
      orderBy: { createdAt: "desc" },
    });

    if (dbRecord) {
      console.log(`   ✅ Trouvé en DB: ${dbRecord.ipAddress} - ${dbRecord.city}, ${dbRecord.country}`);
    } else {
      console.log(`   ❌ PAS trouvé en DB pour IP: ${ipInDb}`);
    }

    console.log("\n" + "=".repeat(70));
  }

  // Statistiques finales
  const countAfter = await prisma.user.count();
  console.log(`\n📊 STATISTIQUES FINALES:`);
  console.log(`   - Enregistrements AVANT: ${countBefore}`);
  console.log(`   - Enregistrements APRÈS: ${countAfter}`);
  console.log(`   - Nouveaux: ${countAfter - countBefore}`);

  console.log(`\n📦 Derniers 10 enregistrements en DB:`);
  console.log("=".repeat(70));

  const recent = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  recent.forEach((r, i) => {
    const age = Math.round((Date.now() - r.createdAt.getTime()) / (1000 * 60));
    const ageStr = age < 60 ? `${age}min` : `${Math.round(age / 60)}h`;
    console.log(
      `${(i + 1).toString().padStart(2)}. ${r.ipAddress.padEnd(15)} | ${r.city.padEnd(20)} | ${r.country.padEnd(20)} | ${ageStr.padStart(6)} ago`
    );
  });

  console.log("\n" + "=".repeat(70));
  console.log("✅ Test d'intégration terminé!\n");

  await prisma.$disconnect();
}

testCompleteIntegration().catch((error) => {
  console.error("❌ Erreur:", error);
  process.exit(1);
});
