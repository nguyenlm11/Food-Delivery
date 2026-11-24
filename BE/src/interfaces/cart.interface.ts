interface CreateCartBody {
    items: {
        foodId: string
        quantity: number
        modifierOptionIds?: string[]
    }[]
}

export { CreateCartBody }
