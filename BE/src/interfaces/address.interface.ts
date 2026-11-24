type AddressLabel = "HOME" | "OFFICE"

interface CreateAddressBody {
    label?: AddressLabel
    recipientName?: string
    recipientPhone?: string
    addressLine?: string
    longitude: number
    latitude: number
    isDefault?: boolean
}

interface UpdateAddressBody {
    label: AddressLabel
    recipientName?: string
    recipientPhone?: string
    addressLine?: string
    longitude?: number
    latitude?: number
}

interface GetAddressesQuery {
    page?: number
    limit?: number
}

export { AddressLabel, CreateAddressBody, UpdateAddressBody, GetAddressesQuery }
