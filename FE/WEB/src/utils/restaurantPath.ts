export const buildOwnerResourcePath = (restaurantId: string, segment: string) => {
    return `/owner/restaurants/${restaurantId}/${segment}`
}

export const extractRestaurantId = (pathname: string) => {
    const parts = pathname.split("/").filter(Boolean)

    if (parts[0] !== "owner" || parts[1] !== "restaurants") {
        return ""
    }

    if (!parts[2] || parts[2] === "create") {
        return ""
    }

    return parts[2]
}

export const extractOwnerResourceSegment = (pathname: string) => {
    const parts = pathname.split("/").filter(Boolean)

    if (parts[0] !== "owner" || parts[1] !== "restaurants") {
        return ""
    }

    return parts[3] ?? ""
}
