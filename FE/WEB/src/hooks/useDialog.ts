import { useState } from "react"
import type { AxiosError } from "axios"
import type { BackendErrorResponse } from "@/types/api"
import { getLocalizedErrorMessage } from "@/utils/errorDictionary"

export function useDialog() {
    const [confirm, setConfirm] = useState({
        isOpen: false,
        isProcessing: false
    })

    const [result, setResult] = useState({
        isOpen: false,
        isSuccess: true,
        message: ""
    })

    const openConfirm = () => {
        setConfirm({ isOpen: true, isProcessing: false })
    }

    const closeConfirm = (isOpen: boolean) => {
        setConfirm((current) => ({ ...current, isOpen }))
    }

    const setProcessing = (isProcessing: boolean) => {
        setConfirm((current) => ({ ...current, isProcessing }))
    }

    const showResult = (isSuccess: boolean, message: string) => {
        setResult({ isOpen: true, isSuccess, message })
    }

    const closeResult = (isOpen: boolean) => {
        setResult((current) => ({ ...current, isOpen }))
    }

    const runAction = async (runApi: () => Promise<void>, successMessage: string) => {
        setProcessing(true)
        try {
            await runApi()
            showResult(true, successMessage)
        }
        catch (error) {
            const response = (error as AxiosError<BackendErrorResponse>).response?.data
            showResult(false, getLocalizedErrorMessage(response))
        }
        finally {
            setProcessing(false)
            closeConfirm(false)
        }
    }

    return { confirm, result, openConfirm, closeConfirm, setProcessing, showResult, closeResult, runAction }
}
