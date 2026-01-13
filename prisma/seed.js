const { prisma } = require('../src/prisma/client')
const bcrypt = require('bcryptjs')
const { addDays } = require('../src/utils/dates')

async function main() {
  const now = new Date()

  const users = [
    {
      phone_number: '6281212345678',
      password: 'password123',
      subscription_type: 'free',
      trial_start_date: now,
      trial_end_date: addDays(now, 30)
    },
    {
      phone_number: '6281299990000',
      password: 'password123',
      subscription_type: 'monthly',
      subscription_start_date: now,
      subscription_end_date: addDays(now, 30)
    },
    {
      phone_number: '6281233334444',
      password: 'password123',
      subscription_type: 'yearly',
      subscription_start_date: now,
      subscription_end_date: addDays(now, 365)
    }
  ]

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10)
    await prisma.user.upsert({
      where: { phone_number: u.phone_number },
      update: {},
      create: {
        phone_number: u.phone_number,
        password: hash,
        trial_start_date: u.trial_start_date || null,
        trial_end_date: u.trial_end_date || null,
        subscription_type: u.subscription_type,
        subscription_start_date: u.subscription_start_date || null,
        subscription_end_date: u.subscription_end_date || null
      }
    })
  }

  const count = await prisma.user.count()
  console.log(`Seed selesai. Total user: ${count}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

