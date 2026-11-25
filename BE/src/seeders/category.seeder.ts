import { Category } from "../models/category.model"

const categories = [
    {
        name: "Pizza",
        slug: "pizza",
        iconImage: "/images/categories/pizza.png",
    },
    {
        name: "Burger",
        slug: "burger",
        iconImage: "/images/categories/burger.png",
    },
    {
        name: "Cơm",
        slug: "com",
        iconImage: "/images/categories/rice.png",
    },
    {
        name: "Mì",
        slug: "mi",
        iconImage: "/images/categories/noodles.png",
    },
    {
        name: "Phở",
        slug: "pho",
        iconImage: "/images/categories/pho.png",
    },
    {
        name: "Món Việt",
        slug: "mon-viet",
        iconImage: "/images/categories/vietnamese-food.png",
    },
    {
        name: "Đồ ăn nhanh",
        slug: "do-an-nhanh",
        iconImage: "/images/categories/fast-food.png",
    },
    {
        name: "Gà rán",
        slug: "ga-ran",
        iconImage: "/images/categories/fried-chicken.png",
    },
    {
        name: "BBQ",
        slug: "bbq",
        iconImage: "/images/categories/bbq.png",
    },
    {
        name: "Sushi",
        slug: "sushi",
        iconImage: "/images/categories/sushi.png",
    },
    {
        name: "Đồ chay",
        slug: "do-chay",
        iconImage: "/images/categories/vegetarian-food.png",
    },
    {
        name: "Đồ uống",
        slug: "do-uong",
        iconImage: "/images/categories/drinks.png",
    },
    {
        name: "Trà sữa",
        slug: "tra-sua",
        iconImage: "/images/categories/milk-tea.png",
    },
    {
        name: "Cà phê",
        slug: "ca-phe",
        iconImage: "/images/categories/coffee.png",
    },
    {
        name: "Tráng miệng",
        slug: "trang-mieng",
        iconImage: "/images/categories/desserts.png",
    },
]

const seedCategories = async () => {
    try {
        for (const category of categories) {
            await Category.findOneAndUpdate(
                { slug: category.slug },
                { $setOnInsert: category },
                { upsert: true, returnDocument: "after" }
            )
        }
    }
    catch (error) {
        console.error("Category seeding error:", error)
    }
}

export default seedCategories