interface AddressCreateParams {
    label?: "HOME" | "OFFICE"
    recipientName?: string
    recipientPhone?: string
    addressLine?: string
    longitude: number
    latitude: number
    isDefault?: boolean
}

interface AddressUpdateParams {
    label: "HOME" | "OFFICE"
    recipientName?: string
    recipientPhone?: string
    addressLine?: string
    longitude?: number
    latitude?: number
}

interface AddressSearchQuery {
    page?: number
    limit?: number
}

export { AddressCreateParams, AddressUpdateParams, AddressSearchQuery }
