/**
 * Simule exactement le flux de src/app/[locale]/page.tsx
 */
import { saveIpInfo } from "../src/actions/save-ip-info";
import prisma from "../src/lib/prisma";

async function testPageFlow() {
  console.log("🧪 Test du flux exact de page.tsx\n");
  console.log("=".repeat(70));
  console.log("Simule: Un utilisateur accède à la page d'accueil");
  console.log("=".repeat(70));

  // Compter avant
  const countBefore = await prisma.user.count();
  console.log(`\n📊 Enregistrements en DB AVANT visite: ${countBefore}\n`);

  // ===== DÉBUT DU FLUX PAGE.TSX =====
  console.log("▶️  DÉBUT DU FLUX (comme dans page.tsx)\n");

  // Étape 1: getUserIp() - ligne 20 de page.tsx
  console.log("1️⃣  const userIp = await getUserIp();");

  // Note: On ne peut pas vraiment appeler getUserIp() ici car elle a besoin du contexte Next.js
  // On simule donc avec une IP localhost (ce qui arriverait en dev)
  const userIp = "::1"; // Simule le résultat de getUserIp() en dev local
  console.log(`   → userIp = "${userIp}"\n`);

  // Étape 2: Log - ligne 22 de page.tsx
  console.log(
    `2️⃣  console.log('[Page Home] Locale: en, IP détectée: ${userIp || "null"}');`
  );
  console.log(`   [Page Home] Locale: en, IP détectée: ${userIp || "null"}\n`);

  // Étape 3: Sauvegarde - lignes 26-37 de page.tsx
  console.log("3️⃣  const result = await saveIpInfo(userIp || undefined);");

  try {
    const result = await saveIpInfo(userIp || undefined);

    if (!result.success) {
      console.error(
        `   [Page Home] ❌ Erreur lors de la sauvegarde de l'IP: ${result.error}`
      );
    } else if (result.skipped) {
      console.log(
        `   [Page Home] ⏭️ IP déjà enregistrée récemment: ${result.data?.ipAddress}`
      );
    } else {
      console.log(
        `   [Page Home] ✅ IP sauvegardée avec succès: ${result.data?.id}, ${result.data?.ipAddress}`
      );
    }

    console.log("\n▶️  FIN DU FLUX\n");
    console.log("=".repeat(70));

    // Vérifier en DB
    const countAfter = await prisma.user.count();
    console.log(`\n📊 Enregistrements en DB APRÈS visite: ${countAfter}`);
    console.log(`📈 Différence: ${countAfter - countBefore > 0 ? "+" : ""}${countAfter - countBefore}\n`);

    if (result.success) {
      console.log("✅ SUCCÈS! Le flux page.tsx fonctionne correctement:");
      console.log(`   - IP utilisateur: ${userIp}`);
      console.log(`   - IP stockée: ${result.data?.ipAddress}`);
      console.log(`   - Ville: ${result.data?.city}`);
      console.log(`   - Pays: ${result.data?.country}`);

      if (result.skipped) {
        console.log(`   - Note: IP déjà en DB (déduplication 24h)`);
      }
    } else {
      console.log("❌ ÉCHEC! Rien n'a été sauvegardé");
      console.log(`   - Erreur: ${result.error}`);
    }
  } catch (error) {
    console.error(
      `   [Page Home] ❌ Exception lors de la sauvegarde: ${error}`
    );
    console.log("\n❌ ÉCHEC! Exception levée");
  }

  // Afficher les derniers enregistrements
  console.log(`\n📦 Derniers 5 enregistrements en DB:`);
  console.log("=".repeat(70));

  const recent = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  recent.forEach((r, i) => {
    const age = Math.round((Date.now() - r.createdAt.getTime()) / (1000 * 60));
    const ageStr = age < 60 ? `${age}min` : `${Math.round(age / 60)}h`;
    console.log(
      `${(i + 1).toString().padStart(2)}. ${r.ipAddress.padEnd(15)} | ${r.city.padEnd(20)} | ${r.country.padEnd(20)} | ${ageStr.padStart(6)} ago`
    );
  });

  console.log("\n" + "=".repeat(70));
  console.log("✅ Test terminé!\n");

  await prisma.$disconnect();
}

testPageFlow().catch((error) => {
  console.error("❌ Erreur:", error);
  process.exit(1);
});
