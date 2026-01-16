const addressService = require('../services/addressService')

function parseId(param) {
  const id = Number(param)
  if (!Number.isInteger(id) || id <= 0) {
    const err = new Error('Invalid address id')
    err.statusCode = 400
    throw err
  }
  return id
}

async function create(req, res) {
  const userId = req.user.id
  const address = await addressService.createAddress(userId, req.body)
  res.status(201).json({ success: true, data: address, message: 'Address created' })
}

async function list(req, res) {
  const userId = req.user.id
  const page = req.query.page ? Number(req.query.page) : 1
  const perPage = req.query.per_page ? Number(req.query.per_page) : 10

  const safePage = Number.isInteger(page) && page > 0 ? page : 1
  const safePerPage = Number.isInteger(perPage) && perPage > 0 && perPage <= 100 ? perPage : 10

  const result = await addressService.listAddresses(userId, { page: safePage, perPage: safePerPage })
  res.json({ success: true, data: result })
}

async function getOne(req, res) {
  const userId = req.user.id
  const id = parseId(req.params.id)
  const address = await addressService.getAddressById(userId, id)
  res.json({ success: true, data: address })
}

async function update(req, res) {
  const userId = req.user.id
  const id = parseId(req.params.id)
  const address = await addressService.updateAddress(userId, id, req.body)
  res.json({ success: true, data: address, message: 'Address updated' })
}

async function remove(req, res) {
  const userId = req.user.id
  const id = parseId(req.params.id)
  await addressService.deleteAddress(userId, id)
  res.json({ success: true, data: null, message: 'Address deleted' })
}

module.exports = { create, list, getOne, update, remove }
