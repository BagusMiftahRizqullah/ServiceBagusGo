const userService = require('../services/userService')

async function list(req, res) {
  const page = req.query.page ? Number(req.query.page) : 1
  const perPage = req.query.per_page ? Number(req.query.per_page) : 20
  const phone_number = req.query.phone_number
  const name = req.query.name

  const safePage = Number.isInteger(page) && page > 0 ? page : 1
  const safePerPage = Number.isInteger(perPage) && perPage > 0 && perPage <= 100 ? perPage : 20

  const data = await userService.listUsers({
    page: safePage,
    perPage: safePerPage,
    phone_number,
    name
  })
  res.json({ success: true, data })
}

async function getOne(req, res) {
  const id = req.params.id
  const user = await userService.getUserById(id)
  res.json({ success: true, data: user })
}

async function create(req, res) {
  const user = await userService.createUser(req.body)
  res.status(201).json({ success: true, data: user, message: 'User created' })
}

async function update(req, res) {
  const id = req.params.id
  const user = await userService.updateUser(id, req.body)
  res.json({ success: true, data: user, message: 'User updated' })
}

async function remove(req, res) {
  const id = req.params.id
  await userService.deleteUser(id)
  res.json({ success: true, data: null, message: 'User deleted' })
}

module.exports = { list, getOne, create, update, remove }
