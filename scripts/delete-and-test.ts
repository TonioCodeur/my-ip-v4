/**
 * Supprime les IPs 8.8.8.8 et teste la sauvegarde avec localhost
 */
import { saveIpInfo } from "../src/actions/save-ip-info";
import prisma from "../src/lib/prisma";

async function deleteAndTest() {
  console.log("🗑️  Suppression des IPs 8.8.8.8 existantes...\n");

  const deleted = await prisma.user.deleteMany({
    where: { ipAddress: "8.8.8.8" },
  });

  console.log(`✅ ${deleted.count} enregistrement(s) supprimé(s)\n`);

  console.log("=".repeat(70));
  console.log("📝 Test de sauvegarde avec IP localhost ::1");
  console.log("=".repeat(70));

  const result = await saveIpInfo("::1");

  console.log("\n📋 Résultat:");
  console.log(`   - Success: ${result.success}`);
  console.log(`   - Skipped: ${result.skipped || false}`);

  if (result.success && result.data) {
    console.log(`\n✅ SUCCÈS! Nouvelle IP sauvegardée:`);
    console.log(`   - IP: ${result.data.ipAddress}`);
    console.log(`   - Ville: ${result.data.city}`);
    console.log(`   - Pays: ${result.data.country}`);
    console.log(`   - ID: ${result.data.id}`);
  } else {
    console.log(`\n❌ ÉCHEC: ${result.error}`);
  }

  // Vérifier en DB
  const count = await prisma.user.count({
    where: { ipAddress: "8.8.8.8" },
  });

  console.log(`\n📊 Nombre d'enregistrements 8.8.8.8 en DB: ${count}`);

  if (count > 0) {
    console.log("\n🎉 Parfait! L'IP localhost ::1 a été convertie en 8.8.8.8 et sauvegardée!");
  }

  await prisma.$disconnect();
}

deleteAndTest().catch((error) => {
  console.error("❌ Erreur:", error);
  process.exit(1);
});
