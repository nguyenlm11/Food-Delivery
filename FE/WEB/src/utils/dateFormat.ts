import { format } from "date-fns"

export const formatDateTime = (value?: string | null) => {
    if (!value) {
        return "—"
    }

    const date = new Date(value)

    if (isNaN(date.getTime())) {
        return "—"
    }

    return format(date, "dd/MM/yyyy HH:mm")
}

export const formatDate = (value?: string | null) => {
    if (!value) {
        return "—"
    }

    const date = new Date(value)

    if (isNaN(date.getTime())) {
        return "—"
    }

    return format(date, "dd/MM/yyyy")
}
