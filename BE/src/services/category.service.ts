import Category from "../models/category.model"

const handleGetAllCategories = async () => {
    const categories = await Category
        .find()
        .select("-__v")
        .lean()

    return categories
}

export { handleGetAllCategories }