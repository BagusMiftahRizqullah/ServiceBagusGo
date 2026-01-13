function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function isActiveRange(now, start, end) {
  if (!start || !end) return false
  const nowMs = now.getTime()
  return nowMs >= new Date(start).getTime() && nowMs <= new Date(end).getTime()
}

module.exports = { addDays, isActiveRange }

