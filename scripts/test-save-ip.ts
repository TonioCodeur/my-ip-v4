import { saveIpInfo } from "../src/actions/save-ip-info";
import prisma from "../src/lib/prisma";

async function testSaveIp() {
  console.log("🧪 Test de la fonction saveIpInfo...\n");

  // Test 1: Sauvegarder une IP de test
  const testIp = "8.8.8.8";
  console.log(`📝 Test 1: Sauvegarde de l'IP ${testIp}`);
  const result = await saveIpInfo(testIp);

  console.log("\n📊 Résultat:", JSON.stringify(result, null, 2));

  // Test 2: Vérifier dans la DB
  console.log("\n🔍 Test 2: Vérification dans la base de données");
  const allRecords = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  console.log(`\n📦 Nombre total d'enregistrements récents: ${allRecords.length}`);
  allRecords.forEach((record, idx) => {
    console.log(
      `  ${idx + 1}. IP: ${record.ipAddress}, Ville: ${record.city}, Pays: ${record.country}, Créé: ${record.createdAt.toISOString()}`
    );
  });

  // Test 3: Compter tous les records
  const totalCount = await prisma.user.count();
  console.log(`\n📈 Total d'enregistrements dans la table User: ${totalCount}`);

  await prisma.$disconnect();
  console.log("\n✅ Tests terminés!");
}

testSaveIp().catch((error) => {
  console.error("❌ Erreur:", error);
  process.exit(1);
});
