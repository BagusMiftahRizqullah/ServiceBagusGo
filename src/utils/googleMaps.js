const { env } = require('../config/env')

function assertGoogleKey() {
  if (!env.GOOGLE_MAPS_API_KEY) {
    const err = new Error('Missing required env var: GOOGLE_MAPS_API_KEY')
    err.statusCode = 500
    throw err
  }
}

async function geocodeAddress(address) {
  assertGoogleKey()
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  url.searchParams.set('address', address)
  url.searchParams.set('key', env.GOOGLE_MAPS_API_KEY)

  const resp = await fetch(url)
  const data = await resp.json()
  if (!resp.ok) {
    const err = new Error('Failed to geocode address')
    err.statusCode = 502
    err.details = data
    throw err
  }

  if (data.status !== 'OK' || !Array.isArray(data.results) || data.results.length === 0) {
    const err = new Error(`Geocoding failed for address: ${address}`)
    err.statusCode = 400
    err.details = data
    throw err
  }

  const result = data.results[0]
  return {
    formattedAddress: result.formatted_address || address,
    location: result.geometry.location
  }
}

async function distanceMatrix(origin, destinationLatLngList) {
  assertGoogleKey()
  
  console.log('Distance Matrix Origin:', origin)
  console.log('Distance Matrix Destinations:', destinationLatLngList)

  const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json')
  url.searchParams.set('origins', `${origin.lat},${origin.lng}`)
  url.searchParams.set(
    'destinations',
    destinationLatLngList.map((d) => `${d.lat},${d.lng}`).join('|')
  )
  url.searchParams.set('key', env.GOOGLE_MAPS_API_KEY)

  const resp = await fetch(url)
  const data = await resp.json()
  if (!resp.ok) {
    const err = new Error('Failed to calculate distance matrix')
    err.statusCode = 502
    err.details = data
    throw err
  }

  if (data.status !== 'OK' || !Array.isArray(data.rows) || !data.rows[0]) {
    console.error('Distance Matrix Error Response:', JSON.stringify(data, null, 2))
    const err = new Error('Distance Matrix API returned invalid response')
    err.statusCode = 502
    err.details = data
    throw err
  }

  // Debug elements
  const elements = data.rows[0].elements
  console.log('Distance Matrix Elements:', elements)
  
  return elements
}

module.exports = { geocodeAddress, distanceMatrix }

