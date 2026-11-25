interface CreateCartBody {
    restaurantId: string
    items: {
        foodId: string
        quantity: number
        modifierOptionIds?: string[]
    }[]
}

export { CreateCartBody }
