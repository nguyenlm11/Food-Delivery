import crypto from "node:crypto"

export const sortObject = (obj: Record<string, any>) => {
    const sorted: Record<string, any> = {}

    Object.keys(obj)
        .sort()
        .forEach((key) => { sorted[key] = obj[key] })

    return sorted
}

export const encodeVnpayParams = (params: Record<string, any>) => {
    const sortedParams = sortObject(params)
    const searchParams = new URLSearchParams()

    Object.entries(sortedParams).forEach(([key, value]) => { searchParams.append(key, String(value)) })

    return searchParams.toString()
}

export const createSecureHash = (params: Record<string, any>, secretKey: string) => {
    const hashData = encodeVnpayParams(params)
    return crypto
        .createHmac("sha512", secretKey)
        .update(hashData, "utf-8")
        .digest("hex")
}

export const verifySecureHash = (params: Record<string, any>, secretKey: string) => {
    const receivedHash = params.vnp_SecureHash

    if (!receivedHash) {
        return false
    }

    const paramsForHash = { ...params }

    delete paramsForHash.vnp_SecureHash
    delete paramsForHash.vnp_SecureHashType

    const expectedHash = createSecureHash(paramsForHash, secretKey)

    return (receivedHash.toLowerCase() === expectedHash.toLowerCase())
}

export const getVnpayCreateDate = () => {
    const now = new Date()
    const vietnamTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }))

    const yyyy = vietnamTime.getFullYear()
    const MM = String(vietnamTime.getMonth() + 1).padStart(2, "0")
    const dd = String(vietnamTime.getDate()).padStart(2, "0")
    const HH = String(vietnamTime.getHours()).padStart(2, "0")
    const mm = String(vietnamTime.getMinutes()).padStart(2, "0")
    const ss = String(vietnamTime.getSeconds()).padStart(2, "0")

    return `${yyyy}${MM}${dd}${HH}${mm}${ss}`
}

export const getVnpayExpireDate = () => {
    const now = new Date()
    const vietnamTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }))
    vietnamTime.setMinutes(vietnamTime.getMinutes() + 15)

    const yyyy = vietnamTime.getFullYear()
    const MM = String(vietnamTime.getMonth() + 1).padStart(2, "0")
    const dd = String(vietnamTime.getDate()).padStart(2, "0")
    const HH = String(vietnamTime.getHours()).padStart(2, "0")
    const mm = String(vietnamTime.getMinutes()).padStart(2, "0")
    const ss = String(vietnamTime.getSeconds()).padStart(2, "0")

    return `${yyyy}${MM}${dd}${HH}${mm}${ss}`
}