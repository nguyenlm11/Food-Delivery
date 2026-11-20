import type { Food, MenuFoodGroup } from "@/types/food.type"
import type { Menu } from "@/types/menu.type"
import type { ModifierGroup } from "@/types/modifier.type"

export const mockRestaurant = {
    _id: "r-01",
    name: "Quán Phở Hà Nội",
    description: "Phở bò truyền thống, phục vụ từ 7h sáng đến 22h.",
    phone: "0912345678",
    address: "12 Lý Thường Kiệt, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
    openTime: "07:00",
    closeTime: "22:00",
    logoImage: "",
    coverImage: "",
    status: "ACTIVE" as const,
    approvalStatus: "APPROVED" as const,
    commissionRate: 15,
}

export const mockRestaurants = [
    mockRestaurant,
    {
        _id: "r-02",
        name: "Cà phê Sài Gòn",
        description: "Cà phê rang xay và bánh ngọt.",
        phone: "0987654321",
        address: "45 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
        openTime: "06:30",
        closeTime: "21:00",
        logoImage: "",
        coverImage: "",
        status: "ACTIVE" as const,
        approvalStatus: "PENDING" as const,
        commissionRate: 12,
    }
]

export const mockMenus: Menu[] = [
    {
        _id: "menu-01",
        restaurantId: "r-01",
        name: "Phở",
        description: "Các loại phở truyền thống và đặc biệt",
        status: "ACTIVE"
    },
    {
        _id: "menu-02",
        restaurantId: "r-01",
        name: "Bánh mì",
        description: "Bánh mì ăn kèm nước chấm",
        status: "ACTIVE"
    },
    {
        _id: "menu-03",
        restaurantId: "r-01",
        name: "Đồ uống",
        description: "Trà, cà phê và nước giải khát",
        status: "INACTIVE"
    },
    {
        _id: "menu-04",
        restaurantId: "r-01",
        name: "Combo",
        description: "Combo phở bánh mì tiết kiệm",
        status: "DELETED"
    }
]

// Ảnh minh hoạ tạm, sẽ thay bằng ảnh thật của nhà hàng khi nối API.
export const FOOD_IMAGES = {
    pho: "/img/photo-f86056483.jpg",
    banhMi: "/img/photo-f39396148-960.jpg",
    traDa: "/img/photo-f148903552-500.jpg",
    cha: "/img/photo-f157014746-500.jpg",
    caPhe: "/img/photo-f97116273.jpg"
}

export const mockFoods: Food[] = [
    {
        _id: "food-01",
        restaurantId: "r-01",
        menuId: "menu-01",
        name: "Phở bò tái",
        description: "Phở bò tái, thịt bò mềm, thêm trứng hấp",
        originalPrice: 45000,
        platformPrice: 52941,
        image: FOOD_IMAGES.pho,
        status: "ACTIVE"
    },
    {
        _id: "food-02",
        restaurantId: "r-01",
        menuId: "menu-01",
        name: "Phở gầu",
        description: "Phở gầu thơm ngon, nước dùng ninh xương 12 giờ",
        originalPrice: 42000,
        platformPrice: 49412,
        image: FOOD_IMAGES.pho,
        status: "ACTIVE"
    },
    {
        _id: "food-03",
        restaurantId: "r-01",
        menuId: "menu-01",
        name: "Phở gà",
        description: "Phở gà chính từ",
        originalPrice: 38000,
        platformPrice: 44706,
        image: FOOD_IMAGES.pho,
        status: "INACTIVE"
    },
    {
        _id: "food-04",
        restaurantId: "r-01",
        menuId: "menu-01",
        name: "Phở xào",
        description: "Phở xào tôm cay Hải Phòng",
        originalPrice: 46000,
        platformPrice: 54118,
        image: FOOD_IMAGES.cha,
        status: "ACTIVE"
    },
    {
        _id: "food-05",
        restaurantId: "r-01",
        menuId: "menu-02",
        name: "Bánh mì đặc biệt",
        description: "Bánh mì thịt nguội, đầy ủi, rau thơm",
        originalPrice: 35000,
        platformPrice: 41176,
        image: FOOD_IMAGES.banhMi,
        status: "ACTIVE"
    },
    {
        _id: "food-06",
        restaurantId: "r-01",
        menuId: "menu-02",
        name: "Bánh mì chả cá",
        description: "Bánh mì chả cá chiên giòn, sốt cà chua",
        originalPrice: 38000,
        platformPrice: 44706,
        image: FOOD_IMAGES.banhMi,
        status: "DELETED"
    },
    {
        _id: "food-07",
        restaurantId: "r-01",
        menuId: "menu-03",
        name: "Trà đá",
        description: "Trà đá pha lạnh",
        originalPrice: 15000,
        platformPrice: 17647,
        image: FOOD_IMAGES.traDa,
        status: "ACTIVE"
    },
    {
        _id: "food-08",
        restaurantId: "r-01",
        menuId: "menu-03",
        name: "Cà phê trứng",
        description: "Cà phê trứng đặc trưng Hà Nội",
        originalPrice: 22000,
        platformPrice: 25882,
        image: FOOD_IMAGES.caPhe,
        status: "ACTIVE"
    },
    {
        _id: "food-09",
        restaurantId: "r-01",
        menuId: "menu-04",
        name: "Combo phở bò tái + trà",
        description: "Phở bò tái kèm ly trà đá",
        originalPrice: 55000,
        platformPrice: 64706,
        image: FOOD_IMAGES.pho,
        status: "ACTIVE"
    },
    {
        _id: "food-10",
        restaurantId: "r-01",
        menuId: "menu-04",
        name: "Combo bánh mì + cà phê",
        description: "Bánh mì đặc biệt kèm cà phê trứng",
        originalPrice: 52000,
        platformPrice: 61176,
        image: FOOD_IMAGES.banhMi,
        status: "INACTIVE"
    }
]

export const mockMenuFoodGroups: MenuFoodGroup[] = mockMenus.map(menu => ({
    _id: menu._id,
    name: menu.name,
    description: menu.description,
    status: menu.status,
    foods: mockFoods.filter(food => food.menuId === menu._id)
}))

export const mockModifierGroups: ModifierGroup[] = [
    {
        _id: "mg-01",
        name: "Nước chấm",
        minSelect: 1,
        maxSelect: 1,
        status: "ACTIVE",
        options: [
            { _id: "opt-01", modifierGroupId: "mg-01", name: "Nước chấm đặc biệt", priceAdjustment: 10000, status: "ACTIVE" },
            { _id: "opt-02", modifierGroupId: "mg-01", name: "Nước mắm pha", priceAdjustment: 0, status: "ACTIVE" }
        ]
    },
    {
        _id: "mg-02",
        name: "Phần ăn",
        minSelect: 1,
        maxSelect: 2,
        status: "ACTIVE",
        options: [
            { _id: "opt-03", modifierGroupId: "mg-02", name: "Phần nhỏ", priceAdjustment: -10000, status: "ACTIVE" },
            { _id: "opt-04", modifierGroupId: "mg-02", name: "Phần vừa", priceAdjustment: 0, status: "ACTIVE" },
            { _id: "opt-05", modifierGroupId: "mg-02", name: "Phần lớn", priceAdjustment: 15000, status: "INACTIVE" }
        ]
    },
    {
        _id: "mg-03",
        name: "Topping",
        minSelect: 0,
        maxSelect: 3,
        status: "INACTIVE",
        options: [
            { _id: "opt-06", modifierGroupId: "mg-03", name: "Trứng hấp", priceAdjustment: 5000, status: "ACTIVE" },
            { _id: "opt-07", modifierGroupId: "mg-03", name: "Quả trứng", priceAdjustment: 7000, status: "ACTIVE" }
        ]
    }
]
