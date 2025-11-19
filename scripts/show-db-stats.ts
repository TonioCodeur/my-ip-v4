import prisma from "../src/lib/prisma";

async function showDbStats() {
  console.log("📊 Statistiques de la base de données\n");
  console.log("=".repeat(70));

  const total = await prisma.user.count();
  console.log(`Total d'enregistrements: ${total}\n`);

  const allRecords = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  console.log("Tous les enregistrements:");
  console.log("=".repeat(70));

  allRecords.forEach((record, idx) => {
    const age = Math.round(
      (Date.now() - record.createdAt.getTime()) / (1000 * 60)
    );
    const ageStr = age < 60 ? `${age}min` : `${Math.round(age / 60)}h`;
    console.log(
      `${(idx + 1).toString().padStart(2)}. ${record.ipAddress.padEnd(15)} | ${record.city.padEnd(20)} | ${record.country.padEnd(20)} | ${ageStr.padStart(6)} ago | ${record.createdAt.toISOString()}`
    );
  });

  console.log("\n" + "=".repeat(70));
  console.log("✅ Statistiques affichées!\n");

  await prisma.$disconnect();
}

showDbStats().catch(console.error);
