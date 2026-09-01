function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate()
}

function addMonths(date, months) {
    const d = new Date(date.getTime())
    const day = d.getDate()
    const totalMonths = d.getMonth() + months
    const targetYear = d.getFullYear() + Math.floor(totalMonths / 12)
    const targetMonth = ((totalMonths % 12) + 12) % 12
    d.setFullYear(targetYear, targetMonth, 1)
    d.setDate(Math.min(day, daysInMonth(targetYear, targetMonth)))
    return d
}

function addDays(date, days) {
    const d = new Date(date.getTime())
    d.setDate(d.getDate() + days)
    return d
}

export function calculateProbationEndDate(startDate, durationValue, durationUnit, endDateAfterCompletion) {
    if (!startDate || !durationValue || !durationUnit) return null

    const start = new Date(`${startDate}T00:00:00`)
    if (Number.isNaN(start.getTime())) return null

    let base
    switch (durationUnit) {
        case 'MONTHS':
            base = addMonths(start, Number(durationValue))
            break
        case 'WEEKS':
            base = addDays(start, Number(durationValue) * 7)
            break
        case 'DAYS':
            base = addDays(start, Number(durationValue))
            break
        default:
            return null
    }

    const end = endDateAfterCompletion ? base : addDays(base, -1)
    return end.toISOString().slice(0, 10)
}