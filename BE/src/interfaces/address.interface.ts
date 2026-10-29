interface AddressCreateParams {
    label: string
    recipientName: string
    recipientPhone: string
    addressLine: string
    longitude: number
    latitude: number
    isDefault?: boolean
}

interface CustomerRegistrationAddressParams {
    label: string
    addressLine: string
    longitude: number
    latitude: number
    isDefault?: boolean
}

interface AddressUpdateParams {
    label?: string
    recipientName?: string
    recipientPhone?: string
    addressLine?: string
    longitude?: number
    latitude?: number
}

interface AddressSearchQuery {
    page?: string | number
    limit?: string | number
}

export { AddressCreateParams, CustomerRegistrationAddressParams, AddressUpdateParams, AddressSearchQuery }
