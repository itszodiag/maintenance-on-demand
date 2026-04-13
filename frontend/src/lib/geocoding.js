export async function geocodeMorocco(query) {
  const trimmed = query.trim()

  if (!trimmed) {
    return null
  }

  const params = new URLSearchParams({
    q: trimmed,
    format: 'jsonv2',
    limit: '1',
    countrycodes: 'ma',
  })

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Unable to geocode this location right now.')
  }

  const results = await response.json()
  const first = results[0]

  if (!first) {
    throw new Error('No Morocco location found for that search.')
  }

  return {
    label: first.display_name,
    latitude: Number(first.lat),
    longitude: Number(first.lon),
  }
}
