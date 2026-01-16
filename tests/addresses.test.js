const request = require('supertest')
const bcrypt = require('bcryptjs')
const { app } = require('../src/app')
const { prisma } = require('../src/prisma/client')
const { signAccessToken } = require('../src/utils/jwt')

let testUser
let authToken

beforeAll(async () => {
  await prisma.savedAddress.deleteMany()
  await prisma.user.deleteMany({ where: { phone_number: '6281111111111' } })

  const passwordHash = await bcrypt.hash('password123', 10)
  testUser = await prisma.user.create({
    data: {
      phone_number: '6281111111111',
      password: passwordHash,
      subscription_type: 'free'
    }
  })

  authToken = signAccessToken({ userId: testUser.id })
})

afterAll(async () => {
  await prisma.savedAddress.deleteMany({ where: { userId: testUser.id } })
  await prisma.user.delete({ where: { id: testUser.id } })
  await prisma.$disconnect()
})

function auth() {
  return `Bearer ${authToken}`
}

describe('Saved addresses CRUD', () => {
  test('POST /api/addresses creates new address', async () => {
    const res = await request(app)
      .post('/api/addresses')
      .set('Authorization', auth())
      .send({
        address: 'Jl. Bagus No. 1',
        lat: -6.2,
        lng: 106.8
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toMatchObject({
      address: 'Jl. Bagus No. 1'
    })
    expect(typeof res.body.data.lat).toBe('number')
    expect(typeof res.body.data.lng).toBe('number')
  })

  test('GET /api/addresses returns list for user', async () => {
    const res = await request(app)
      .get('/api/addresses')
      .set('Authorization', auth())

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data.items)).toBe(true)
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(1)
    expect(typeof res.body.data.total).toBe('number')
  })

  test('GET /api/addresses/:id returns single address', async () => {
    const listRes = await request(app)
      .get('/api/addresses')
      .set('Authorization', auth())

    const id = listRes.body.data.items[0].id

    const res = await request(app)
      .get(`/api/addresses/${id}`)
      .set('Authorization', auth())

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBe(id)
  })

  test('PUT /api/addresses/:id updates address', async () => {
    const listRes = await request(app)
      .get('/api/addresses')
      .set('Authorization', auth())

    const id = listRes.body.data.items[0].id

    const res = await request(app)
      .put(`/api/addresses/${id}`)
      .set('Authorization', auth())
      .send({ address: 'Jl. Update No. 2' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.address).toBe('Jl. Update No. 2')
  })

  test('DELETE /api/addresses/:id deletes address', async () => {
    const createRes = await request(app)
      .post('/api/addresses')
      .set('Authorization', auth())
      .send({
        address: 'Jl. Hapus No. 3',
        lat: -6.21,
        lng: 106.81
      })

    const id = createRes.body.data.id

    const res = await request(app)
      .delete(`/api/addresses/${id}`)
      .set('Authorization', auth())

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)

    const getRes = await request(app)
      .get(`/api/addresses/${id}`)
      .set('Authorization', auth())

    expect(getRes.status).toBe(404)
    expect(getRes.body.success).toBe(false)
  })

  test('POST /api/addresses respects max addresses per user', async () => {
    for (let i = 0; i < 20; i++) {
      await request(app)
        .post('/api/addresses')
        .set('Authorization', auth())
        .send({
          address: `Alamat ${i}`,
          lat: -6.2,
          lng: 106.8
        })
    }

    const res = await request(app)
      .post('/api/addresses')
      .set('Authorization', auth())
      .send({
        address: 'Alamat exceed',
        lat: -6.2,
        lng: 106.8
      })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})
