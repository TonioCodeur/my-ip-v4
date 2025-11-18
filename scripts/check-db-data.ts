// Script pour vérifier les données dans la base de données
import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 Vérification des données dans la base de données...\n');

    // Compter le nombre total d'enregistrements
    const totalCount = await prisma.user.count();
    console.log(`📊 Nombre total d'enregistrements: ${totalCount}\n`);

    // Récupérer les 5 derniers enregistrements
    const recentUsers = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    console.log('📋 Les 5 derniers enregistrements:');
    console.log('─'.repeat(100));

    recentUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ID: ${user.id}`);
      console.log(`   IP: ${user.ipAddress}`);
      console.log(`   Pays: ${user.country} (${user.continent})`);
      console.log(`   Ville: ${user.city}, ${user.region}`);
      console.log(`   Coordonnées: ${user.latitude}, ${user.longitude}`);
      console.log(`   Créé le: ${user.createdAt.toLocaleString('fr-FR')}`);
    });

    console.log('\n' + '─'.repeat(100));
    console.log('\n✅ Vérification terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
