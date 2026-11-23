/// <reference types="node" />
import * as crypto from "crypto"

export const encodeVnpayParams = (params: Record<string, any>) => {
    const sortedParams: Record<string, any> = {}

    Object.keys(params)
        .sort()
        .forEach((key) => { sortedParams[key] = params[key] })

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
    return formatVnpayDate(new Date())
}

export const getVnpayExpireDate = () => {
    const expireDate = new Date()
    expireDate.setMinutes(expireDate.getMinutes() + 15)
    return formatVnpayDate(expireDate)
}

const formatVnpayDate = (date: Date) => {
    const vn = new Date(date.getTime() + 7 * 60 * 60 * 1000)
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${vn.getUTCFullYear()}${pad(vn.getUTCMonth() + 1)}${pad(vn.getUTCDate())}${pad(vn.getUTCHours())}${pad(vn.getUTCMinutes())}${pad(vn.getUTCSeconds())}`
}