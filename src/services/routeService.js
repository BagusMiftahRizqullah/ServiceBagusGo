const { geocodeAddress } = require('../utils/googleMaps')

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

  const remaining = geocoded.map((d, index) => ({ index, ...d }))
  const route = []
  let current = { lat: origin.lat, lng: origin.lng }
  let totalDistanceKm = 0

  while (remaining.length > 0) {
    let bestIdx = 0
    let bestDist = Number.POSITIVE_INFINITY

    for (let i = 0; i < remaining.length; i += 1) {
      const candidate = remaining[i]
      const d = haversineDistance(current, candidate.location)
      if (d < bestDist) {
        bestDist = d
        bestIdx = i
      }
    }

    const next = remaining.splice(bestIdx, 1)[0]
    totalDistanceKm += bestDist

    const distanceFromPreviousKm = Number(bestDist.toFixed(2))
    const cumulativeDistanceKm = Number(totalDistanceKm.toFixed(2))

    route.push({
      order: route.length + 1,
      address: next.inputAddress,
      formatted_address: next.formattedAddress,
      lat: next.location.lat,
      lng: next.location.lng,
      distance_from_previous_km: distanceFromPreviousKm,
      cumulative_distance_km: cumulativeDistanceKm
    })

    current = next.location
  }

  const averageSpeedKmH = 30
  const result = route.map((stop) => {
    const legMinutes = stop.distance_from_previous_km === 0
      ? 0
      : Math.round((stop.distance_from_previous_km / averageSpeedKmH) * 60)

    return {
      address: stop.address,
      distance_km: stop.distance_from_previous_km,
      duration: `${legMinutes} mins`,
      order: stop.order,
      cumulative_distance_km: stop.cumulative_distance_km
    }
  })

  return result
}

module.exports = { optimizeRoute }
