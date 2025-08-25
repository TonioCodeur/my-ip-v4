// Import dynamique pour éviter les erreurs de compilation
let PrismaClient: any

async function initPrisma() {
  try {
    const prismaModule = await import('../src/generated/prisma')
    PrismaClient = prismaModule.PrismaClient
    return new PrismaClient()
  } catch (error) {
    console.error('❌ Failed to import PrismaClient:', error)
    process.exit(1)
  }
}

let prisma: any

async function testDatabaseConnection() {
  try {
    console.log('🔌 Testing database connection...')
    
    // Initialize Prisma client
    prisma = await initPrisma()
    
    // Test the connection with a simple query
    await prisma.$connect()
    console.log('✅ Successfully connected to the database')
    
    // Test if we can query the database
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database query test successful:', result)
    
    console.log('🎉 Database configuration is working correctly!')
    
  } catch (error) {
    console.error('❌ Database connection failed:')
    
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      
      // Check if Prisma client needs to be generated
      if (error.message.includes('Cannot find module') && error.message.includes('@prisma/client')) {
        console.error('\n💡 Prisma client not generated:')
        console.error('  - Run: pnpm prisma generate')
        console.error('  - Then try again: pnpm db:test')
        process.exit(1)
      }
      
      // Provide helpful error messages based on common issues
      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        console.error('\n💡 This usually means:')
        console.error('  - The database server is not running')
        console.error('  - The DATABASE_URL is incorrect')
        console.error('  - Network connectivity issues')
      } else if (error.message.includes('password authentication failed')) {
        console.error('\n💡 This usually means:')
        console.error('  - Incorrect username or password in DATABASE_URL')
        console.error('  - User does not have permission to access the database')
      } else if (error.message.includes('database') && error.message.includes('does not exist')) {
        console.error('\n💡 This usually means:')
        console.error('  - The database specified in DATABASE_URL does not exist')
        console.error('  - Run: createdb your_database_name (if using PostgreSQL)')
      } else if (error.message.includes('Environment variable not found: DATABASE_URL')) {
        console.error('\n💡 DATABASE_URL not configured:')
        console.error('  - Create a .env file in the project root')
        console.error('  - Add: DATABASE_URL="postgresql://username:password@localhost:5432/database_name"')
        process.exit(1)
      }
    }
    
    console.error('\n🔧 Check your DATABASE_URL in your .env file')
    console.error('Expected format: postgresql://username:password@localhost:5432/database_name')
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason)
  process.exit(1)
})

testDatabaseConnection()