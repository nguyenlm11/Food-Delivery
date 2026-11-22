const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/

export const isValidDateOnly = (value: string): boolean => {
    if (!DATE_ONLY_REGEX.test(value)) return false

    const [year, month, day] = value.split("-").map(Number)
    const date = new Date(Date.UTC(year, month - 1, day))

    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export const dateOnlyToDate = (value: string): Date | null => {
    if (!isValidDateOnly(value)) return null

    const [year, month, day] = value.split("-").map(Number)
    return new Date(Date.UTC(year, month - 1, day))
}

export const dateToDateOnly = (value: Date): string | null => {
    if (Number.isNaN(value.getTime())) return null

    return value.toISOString().slice(0, 10)
}
