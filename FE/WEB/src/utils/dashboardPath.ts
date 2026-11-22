export function getDashboardPath(role?: string) {
    switch (role) {
        case "ADMIN":
            return "/admin"
        case "OWNER":
            return "/owner"
        case "RESTAURANT":
            return "/restaurant"
        default:
            return "/login"
    }
}
