interface MenuCreateParams {
    menus: {
        name: string
        description?: string
    }[]
}

interface MenuUpdateParams {
    name?: string
    description?: string
}

export { MenuCreateParams, MenuUpdateParams }
