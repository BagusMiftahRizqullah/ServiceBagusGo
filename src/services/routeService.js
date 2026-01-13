const { geocodeAddress, distanceMatrix } = require('../utils/googleMaps')

function haversineDistance(coords1, coords2) {
  function toRad(x) {
    return (x * Math.PI) / 180
  }

  const R = 6371 // km
  const dLat = toRad(coords2.lat - coords1.lat)
  const dLon = toRad(coords2.lng - coords1.lng)
  const lat1 = toRad(coords1.lat)
  const lat2 = toRad(coords2.lat)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

async function optimizeRoute(origin, destinationAddresses) {
  const geocoded = await Promise.all(
    destinationAddresses.map(async (address) => {
      const g = await geocodeAddress(address)
      return {
        inputAddress: address,
        formattedAddress: g.formattedAddress,
        location: g.location
      }
    })
  )

  const elements = await distanceMatrix(
    origin,
    geocoded.map((d) => d.location)
  )
  console.log('Origin:', origin)
  console.log('Distance Matrix Elements:', elements)
  console.log('Geocoded:', geocoded)

  const enriched = geocoded.map((d, idx) => {
    const el = elements[idx]
    if (!el || el.status !== 'OK') {
      return {
        address: d.inputAddress,
        distance_km: null,
        duration: null,
        _sortDistance: Number.POSITIVE_INFINITY
      }
    }

    const meters = el.distance && typeof el.distance.value === 'number' ? el.distance.value : null
    const km = meters === null ? null : Number((meters / 1000).toFixed(1))
    const duration = el.duration && el.duration.text ? el.duration.text : null


    return {
      address: d.inputAddress,
      distance_km: km,
      duration,
      _sortDistance: meters === null ? Number.POSITIVE_INFINITY : meters
    }
  })
  console.log('Enriched:', enriched)

  enriched.sort((a, b) => a._sortDistance - b._sortDistance)
  return enriched.map(({ _sortDistance, ...rest }) => rest)
}

module.exports = { optimizeRoute }

