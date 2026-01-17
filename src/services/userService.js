const bcrypt = require('bcryptjs')
const { prisma } = require('../prisma/client')
const { normalizePhoneNumber } = require('../utils/phone')

async function listUsers({ page, perPage, phone_number, name }) {
  const skip = (page - 1) * perPage

  const where = {}
  if (phone_number) {
    const phone = normalizePhoneNumber(phone_number)
    if (!phone) {
      const err = new Error('phone_number is invalid')
      err.statusCode = 400
      throw err
    }
    where.phone_number = phone
  }

  if (name) {
    where.name = {
      contains: name,
      mode: 'insensitive'
    }
  }

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        phone_number: true,
        name: true,
        subscription_type: true,
        subscription_start_date: true,
        subscription_end_date: true,
        trial_start_date: true,
        trial_end_date: true,
        created_at: true,
        updated_at: true
      }
    }),
    prisma.user.count({ where })
  ])

  const totalPages = total === 0 ? 0 : Math.ceil(total / perPage)

  return { items: rows, total, page, perPage, totalPages }
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      phone_number: true,
      name: true,
      subscription_type: true,
      subscription_start_date: true,
      subscription_end_date: true,
      trial_start_date: true,
      trial_end_date: true,
      created_at: true,
      updated_at: true
    }
  })

  if (!user) {
    const err = new Error('User not found')
    err.statusCode = 404
    throw err
  }

  return user
}

async function createUser({ phone_number, password, name }) {
  const phone = normalizePhoneNumber(phone_number)
  if (!phone) {
    const err = new Error('phone_number is required')
    err.statusCode = 400
    throw err
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    const err = new Error('password must be at least 6 characters')
    err.statusCode = 400
    throw err
  }

  const existing = await prisma.user.findUnique({ where: { phone_number: phone } })
  if (existing) {
    const err = new Error('phone_number already registered')
    err.statusCode = 409
    throw err
  }

  const hashed = await bcrypt.hash(password, 10)

  const now = new Date()

  const user = await prisma.user.create({
    data: {
      phone_number: phone,
      name: name || null,
      password: hashed,
      trial_start_date: now,
      trial_end_date: null,
      subscription_type: 'free'
    },
    select: {
      id: true,
      phone_number: true,
      name: true,
      subscription_type: true,
      subscription_start_date: true,
      subscription_end_date: true,
      trial_start_date: true,
      trial_end_date: true,
      created_at: true,
      updated_at: true
    }
  })

  return user
}

async function updateUser(id, { phone_number, password, name }) {
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) {
    const err = new Error('User not found')
    err.statusCode = 404
    throw err
  }

  let phone = undefined
  if (phone_number !== undefined) {
    const normalized = normalizePhoneNumber(phone_number)
    if (!normalized) {
      const err = new Error('phone_number is invalid')
      err.statusCode = 400
      throw err
    }
    phone = normalized

    if (phone !== existing.phone_number) {
      const duplicate = await prisma.user.findUnique({ where: { phone_number: phone } })
      if (duplicate) {
        const err = new Error('phone_number already registered')
        err.statusCode = 409
        throw err
      }
    }
  }

  let hashedPassword = undefined
  if (password !== undefined) {
    if (!password || typeof password !== 'string' || password.length < 6) {
      const err = new Error('password must be at least 6 characters')
      err.statusCode = 400
      throw err
    }
    hashedPassword = await bcrypt.hash(password, 10)
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      phone_number: phone !== undefined ? phone : undefined,
      name: name !== undefined ? name : undefined,
      password: hashedPassword !== undefined ? hashedPassword : undefined
    },
    select: {
      id: true,
      phone_number: true,
      name: true,
      subscription_type: true,
      subscription_start_date: true,
      subscription_end_date: true,
      trial_start_date: true,
      trial_end_date: true,
      created_at: true,
      updated_at: true
    }
  })

  return updated
}

async function deleteUser(id) {
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) {
    const err = new Error('User not found')
    err.statusCode = 404
    throw err
  }

  await prisma.user.delete({ where: { id } })
}

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
}
