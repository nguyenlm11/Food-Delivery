import mongoose from "mongoose"

// Expected model name -> collection name.
// The collection name is derived from the model name by mongoose, so any rename of a
// registered model silently points at a different collection. This map pins both.
const EXPECTED: Record<string, string> = {
    Address: "addresses",
    Cart: "carts",
    CartItem: "cartitems",
    CartItemOption: "cartitemoptions",
    Category: "categories",
    Driver: "drivers",
    DriverEarning: "driverearnings",
    DriverLocation: "driverlocations",
    Food: "foods",
    FoodModifierGroup: "foodmodifiergroups",
    Menu: "menus",
    ModifierGroup: "modifiergroups",
    ModifierOption: "modifieroptions",
    Notification: "notifications",
    OTP: "otps",
    Order: "orders",
    Owner: "owners",
    RefreshToken: "refreshtokens",
    Restaurant: "restaurants",
    RestaurantCategory: "restaurantcategories",
    RestaurantSettlement: "restaurantsettlements",
    Role: "roles",
    ShipFee: "shipfees",
    User: "users",
    Voucher: "vouchers",
    VoucherUsage: "voucherusages",
    Wallet: "wallets",
    WalletTransaction: "wallettransactions"
}

const files = [
    "../src/models/address.model",
    "../src/models/cart.model",
    "../src/models/cart_item.model",
    "../src/models/cart_item_option.model",
    "../src/models/category.model",
    "../src/models/driver.model",
    "../src/models/driver_location.model",
    "../src/models/driver-earning.model",
    "../src/models/food.model",
    "../src/models/food_modifier_group.model",
    "../src/models/menu.model",
    "../src/models/modifier_group.model",
    "../src/models/modifier_option.model",
    "../src/models/notification.model",
    "../src/models/otp.model",
    "../src/models/order.model",
    "../src/models/owner.model",
    "../src/models/refresh_token.model",
    "../src/models/restaurant.model",
    "../src/models/restaurant_category.model",
    "../src/models/restaurant-settlement.model",
    "../src/models/role.model",
    "../src/models/shipfee.model",
    "../src/models/user.model",
    "../src/models/voucher.model",
    "../src/models/voucher_usage.model",
    "../src/models/wallet.model",
    "../src/models/wallet_transaction.model"
]

async function main() {
    for (const file of files) {
        await import(file)
    }

    const actual = new Map<string, string>()
    for (const name of mongoose.modelNames()) {
        actual.set(name, mongoose.model(name).collection.name)
    }

    const problems: string[] = []

    for (const [name, collection] of Object.entries(EXPECTED)) {
        if (!actual.has(name)) {
            problems.push(`missing model: ${name}`)
            continue
        }

        const got = actual.get(name)!
        if (got !== collection) {
            problems.push(`wrong collection: ${name} -> ${got} (expected ${collection})`)
        }
    }

    for (const name of actual.keys()) {
        if (!(name in EXPECTED)) {
            problems.push(`unexpected model: ${name}`)
        }
    }

    if (problems.length > 0) {
        console.error("Model manifest mismatch:")
        for (const problem of problems) {
            console.error(`  - ${problem}`)
        }
        process.exit(1)
    }

    console.log(`OK: ${actual.size} models, ${actual.size} collections`)
}

main()
