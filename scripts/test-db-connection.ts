import { PrismaClient } from '@prisma/client'

async function main() {
  console.log('Connecting to MongoDB...')
  const start = Date.now()

  const prisma = new PrismaClient()

  try {
    await prisma.$connect()
    const connectMs = Date.now() - start
    console.log(`✓ Connected (${connectMs}ms)`)

    const countStart = Date.now()
    const userCount = await prisma.user.count()
    const accountCount = await prisma.account.count()
    const queryMs = Date.now() - countStart
    console.log(`✓ Query OK (${queryMs}ms)`)
    console.log(`  Users:   ${userCount}`)
    console.log(`  Accounts: ${accountCount}`)

    console.log('\n✓ Database connection is healthy.')
  } catch (error) {
    console.error('\n✗ Connection failed:')
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
