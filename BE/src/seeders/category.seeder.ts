import Category from "../models/category.model"

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
        name: "Rice",
        slug: "rice",
        iconImage: "/images/categories/rice.png",
    },
    {
        name: "Noodles",
        slug: "noodles",
        iconImage: "/images/categories/noodles.png",
    },
    {
        name: "Pho",
        slug: "pho",
        iconImage: "/images/categories/pho.png",
    },
    {
        name: "Vietnamese Food",
        slug: "vietnamese-food",
        iconImage: "/images/categories/vietnamese-food.png",
    },
    {
        name: "Fast Food",
        slug: "fast-food",
        iconImage: "/images/categories/fast-food.png",
    },
    {
        name: "Fried Chicken",
        slug: "fried-chicken",
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
        name: "Vegetarian Food",
        slug: "vegetarian-food",
        iconImage: "/images/categories/vegetarian-food.png",
    },
    {
        name: "Drinks",
        slug: "drinks",
        iconImage: "/images/categories/drinks.png",
    },
    {
        name: "Milk Tea",
        slug: "milk-tea",
        iconImage: "/images/categories/milk-tea.png",
    },
    {
        name: "Coffee",
        slug: "coffee",
        iconImage: "/images/categories/coffee.png",
    },
    {
        name: "Desserts",
        slug: "desserts",
        iconImage: "/images/categories/desserts.png",
    },
]

const seedCategories = async () => {
    try {
        for (const category of categories) {
            await Category.findOneAndUpdate(
                { slug: category.slug },
                {
                    $setOnInsert: category,
                },
                {
                    upsert: true,
                    returnDocument: "after",
                }
            )
        }
        console.log("Categories seeded successfully!")
    } catch (error) {
        console.error("Category seeding error:", error)
    }
}

export default seedCategories