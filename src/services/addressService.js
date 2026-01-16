const { prisma } = require('../prisma/client')

const MAX_ADDRESSES_PER_USER = 20

function toNumberDecimal(value) {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return value
  return Number(value)
}

function serializeAddress(record) {
  return {
    id: record.id,
    address: record.address,
    lat: toNumberDecimal(record.lat),
    lng: toNumberDecimal(record.lng),
    created_at: record.created_at,
    updated_at: record.updated_at
  }
}

async function createAddress(userId, { address, lat, lng }) {
  const count = await prisma.savedAddress.count({ where: { userId } })
  if (count >= MAX_ADDRESSES_PER_USER) {
    const err = new Error(`Maximum number of saved addresses (${MAX_ADDRESSES_PER_USER}) reached`)
    err.statusCode = 400
    throw err
  }

  const created = await prisma.savedAddress.create({
    data: {
      address,
      lat,
      lng,
      user: { connect: { id: userId } }
    }
  })
  return serializeAddress(created)
}

async function listAddresses(userId, { page, perPage }) {
  const skip = (page - 1) * perPage

  const [rows, total] = await Promise.all([
    prisma.savedAddress.findMany({
      where: { userId },
      orderBy: { created_at: 'desc' },
      skip,
      take: perPage
    }),
    prisma.savedAddress.count({ where: { userId } })
  ])

  const items = rows.map(serializeAddress)
  const totalPages = total === 0 ? 0 : Math.ceil(total / perPage)

  return { items, total, page, perPage, totalPages }
}

async function getAddressById(userId, id) {
  const row = await prisma.savedAddress.findFirst({
    where: { id, userId }
  })
  if (!row) {
    const err = new Error('Address not found')
    err.statusCode = 404
    throw err
  }
  return serializeAddress(row)
}

async function updateAddress(userId, id, { address, lat, lng }) {
  const existing = await prisma.savedAddress.findFirst({ where: { id, userId } })
  if (!existing) {
    const err = new Error('Address not found')
    err.statusCode = 404
    throw err
  }

  const updated = await prisma.savedAddress.update({
    where: { id: existing.id },
    data: {
      address: address !== undefined ? address : existing.address,
      lat: lat !== undefined ? lat : existing.lat,
      lng: lng !== undefined ? lng : existing.lng
    }
  })
  return serializeAddress(updated)
}

async function deleteAddress(userId, id) {
  const existing = await prisma.savedAddress.findFirst({ where: { id, userId } })
  if (!existing) {
    const err = new Error('Address not found')
    err.statusCode = 404
    throw err
  }
  await prisma.savedAddress.delete({ where: { id: existing.id } })
}

module.exports = {
  createAddress,
  listAddresses,
  getAddressById,
  updateAddress,
  deleteAddress
}
