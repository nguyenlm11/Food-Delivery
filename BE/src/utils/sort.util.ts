export const resolveSortField = (requested: string | undefined, allowed: string[], fallback: string): string => {
    return requested && allowed.includes(requested) ? requested : fallback
}

export const resolveSortOrder = (requested: string | undefined): 1 | -1 => {
    return requested === "asc" ? 1 : -1
}
