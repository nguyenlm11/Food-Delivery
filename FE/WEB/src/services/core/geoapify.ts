const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY

export const searchAddress = async (text: string) => {
    const params = new URLSearchParams({
        text,
        filter: "countrycode:vn",
        limit: "5",
        apiKey: API_KEY,
    })

    const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?${params}`)
    if (!response.ok) throw new Error("Không thể tìm kiếm địa chỉ")

    return response.json()
}