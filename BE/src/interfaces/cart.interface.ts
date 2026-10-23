interface CartCreateParams {
    items: {
        foodId: string
        quantity: number
        modifierOptionIds?: string[]
    }[]
}

export { CartCreateParams }
