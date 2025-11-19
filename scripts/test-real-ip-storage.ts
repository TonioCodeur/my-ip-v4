/**
 * Test que l'IP RÉELLE de l'utilisateur est stockée en DB
 */
import { saveIpInfo } from "../src/actions/save-ip-info";
import prisma from "../src/lib/prisma";

async function testRealIpStorage() {
  console.log("🧪 Test: Stockage de l'IP RÉELLE de l'utilisateur\n");
  console.log("=".repeat(70));

  // Test avec différents types d'IPs
  const testCases = [
    {
      name: "Localhost IPv6 (dev local)",
      ip: "::1",
      expectedInDb: "::1",
      description: "L'IP ::1 doit être stockée telle quelle",
    },
    {
      name: "Localhost IPv4",
      ip: "127.0.0.1",
      expectedInDb: "127.0.0.1",
      description: "L'IP 127.0.0.1 doit être stockée telle quelle",
    },
    {
      name: "IP privée",
      ip: "192.168.1.50",
      expectedInDb: "192.168.1.50",
      description: "L'IP 192.168.1.50 doit être stockée telle quelle",
    },
    {
      name: "IP publique",
      ip: "185.199.108.153",
      expectedInDb: "185.199.108.153",
      description: "L'IP publique doit être stockée telle quelle",
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.name}`);
    console.log("=".repeat(70));
    console.log(`IP utilisateur: ${testCase.ip}`);

    // Nettoyer si existe déjà
    await prisma.user.deleteMany({ where: { ipAddress: testCase.ip } });

    // Appeler saveIpInfo
    const result = await saveIpInfo(testCase.ip);

    console.log(`\n📋 Résultat:`);
    console.log(`   - Success: ${result.success}`);
    console.log(`   - Skipped: ${result.skipped || false}`);

    if (result.success && result.data) {
      console.log(`\n✅ Données stockées:`);
      console.log(`   - IP dans DB: ${result.data.ipAddress}`);
      console.log(`   - Ville: ${result.data.city}`);
      console.log(`   - Pays: ${result.data.country}`);

      // Vérifier que l'IP stockée est bien celle de l'utilisateur
      if (result.data.ipAddress === testCase.expectedInDb) {
        console.log(`\n🎉 SUCCÈS! L'IP RÉELLE est stockée: ${result.data.ipAddress}`);
      } else {
        console.log(
          `\n❌ ÉCHEC! IP attendue: ${testCase.expectedInDb}, IP stockée: ${result.data.ipAddress}`
        );
      }
    } else {
      console.log(`\n❌ Erreur: ${result.error}`);
    }

    // Vérification directe en DB
    const dbRecord = await prisma.user.findFirst({
      where: { ipAddress: testCase.expectedInDb },
      orderBy: { createdAt: "desc" },
    });

    if (dbRecord) {
      console.log(
        `\n🔍 Vérification DB: ✅ Trouvé avec IP ${dbRecord.ipAddress}`
      );
    } else {
      console.log(
        `\n🔍 Vérification DB: ❌ PAS trouvé avec IP ${testCase.expectedInDb}`
      );
    }

    console.log("\n" + "=".repeat(70));
  }

  // Afficher les IPs stockées
  console.log("\n📦 IPs actuellement en DB:");
  console.log("=".repeat(70));

  const allIps = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  allIps.forEach((record, idx) => {
    const age = Math.round(
      (Date.now() - record.createdAt.getTime()) / (1000 * 60)
    );
    const ageStr = age < 60 ? `${age}min` : `${Math.round(age / 60)}h`;
    const isLocal = record.ipAddress.startsWith("::1") ||
      record.ipAddress.startsWith("127.") ||
      record.ipAddress.startsWith("192.168.");
    const marker = isLocal ? "🏠" : "🌐";
    console.log(
      `${(idx + 1).toString().padStart(2)}. ${marker} ${record.ipAddress.padEnd(17)} | ${record.city.padEnd(20)} | ${record.country.padEnd(20)} | ${ageStr.padStart(6)} ago`
    );
  });

  console.log("\n" + "=".repeat(70));
  console.log("✅ Test terminé!\n");
  console.log("Légende: 🏠 = IP locale/privée | 🌐 = IP publique\n");

  await prisma.$disconnect();
}

testRealIpStorage().catch((error) => {
  console.error("❌ Erreur:", error);
  process.exit(1);
});
