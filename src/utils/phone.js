function normalizePhoneNumber(input) {
  if (typeof input !== 'string') return ''
  const trimmed = input.trim()
  if (!trimmed) return ''
  return trimmed.replace(/\D/g, '')
}

module.exports = { normalizePhoneNumber }

