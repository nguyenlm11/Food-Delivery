import mongoose from "mongoose"
import dns from "dns"
import bcrypt from "bcrypt"
import "dotenv/config"

dns.setServers(["8.8.8.8", "8.8.4.4"])

const CUSTOMER_EMAIL = "order-test-cus@test.com"
const PASSWORD = "Test@123"

const main = async () => {
    await mongoose.connect(process.env.MONGO_URL!)
    const db = mongoose.connection.db!

    const roleCustomer = await db.collection("roles").findOne({ name: "CUSTOMER" })
    const roleOwner = await db.collection("roles").findOne({ name: "OWNER" })

    // Quán ACTIVE có sẵn
    const restaurant = await db.collection("restaurants").findOne({ status: "ACTIVE" })
    if (!restaurant) throw new Error("Khong tim thay restaurant ACTIVE")

    // Khach test
    let customer = await db.collection("users").findOne({ email: CUSTOMER_EMAIL })
    if (!customer) {
        const result = await db.collection("users").insertOne({
            fullname: "Order Test Customer",
            email: CUSTOMER_EMAIL,
            password: await bcrypt.hash(PASSWORD, 10),
            status: "ACTIVE",
            roleId: roleCustomer._id,
            avatar: null,
            phone: "0900000001",
            createdAt: new Date(),
            updatedAt: new Date()
        })
        customer = await db.collection("users").findOne({ _id: result.insertedId })
    }

    // Owner tai khoan rieng
    let ownerUser = await db.collection("users").findOne({ email: "order-test-owner@test.com" })
    if (!ownerUser) {
        const result = await db.collection("users").insertOne({
            fullname: "Order Test Owner",
            email: "order-test-owner@test.com",
            password: await bcrypt.hash(PASSWORD, 10),
            status: "ACTIVE",
            roleId: roleOwner._id,
            avatar: null,
            phone: "0900000002",
            createdAt: new Date(),
            updatedAt: new Date()
        })
        ownerUser = await db.collection("users").findOne({ _id: result.insertedId })
    }

    // Wallet
    await db.collection("wallets").updateOne(
        { userId: customer._id },
        { $set: { balance: 1000000, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
    )

    // Dia chi mac dinh
    await db.collection("addresses").deleteMany({ customerId: customer._id })
    const addressResult = await db.collection("addresses").insertOne({
        customerId: customer._id,
        label: "HOME",
        recipientName: "Order Test Customer",
        recipientPhone: "0900000001",
        addressLine: "1 Nguyen Trai, Quan 1, TP. Ho Chi Minh",
        longitude: restaurant.longitude,
        latitude: restaurant.latitude,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
    })
    const address = await db.collection("addresses").findOne({ _id: addressResult.insertedId })

    // Mon an cua quan
    const food = await db.collection("foods").findOne({ restaurantId: restaurant._id, status: "ACTIVE" })
    if (!food) throw new Error("Khong tim thay food ACTIVE cua restaurant")

    // Option
    const option = await db.collection("modifieroptions").findOne({ status: "ACTIVE" })

    // Cart
    const oldCarts = await db.collection("carts").find({ userId: customer._id }).project({ _id: 1 }).toArray()
    const oldCartIds = oldCarts.map(c => c._id)
    const oldItems = await db.collection("cartitems").find({ cartId: { $in: oldCartIds } }).project({ _id: 1 }).toArray()
    await db.collection("cartitemoptions").deleteMany({ cartItemId: { $in: oldItems.map(i => i._id) } })
    await db.collection("cartitems").deleteMany({ cartId: { $in: oldCartIds } })
    await db.collection("carts").deleteMany({ userId: customer._id })

    const cartResult = await db.collection("carts").insertOne({
        userId: customer._id,
        restaurantId: restaurant._id,
        totalItemCount: 0,
        totalPrice: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    })
    const cart = await db.collection("carts").findOne({ _id: cartResult.insertedId })

    const itemResult = await db.collection("cartitems").insertOne({
        cartId: cart._id,
        foodId: food._id,
        quantity: 2,
        price: food.platformPrice,
        optionsKey: option ? option._id.toString() : "",
        createdAt: new Date(),
        updatedAt: new Date()
    })
    const cartItem = await db.collection("cartitems").findOne({ _id: itemResult.insertedId })

    if (option) {
        await db.collection("cartitemoptions").insertOne({
            cartItemId: cartItem._id,
            modifierOptionId: option._id,
            groupName: "Topping",
            optionName: option.name,
            priceAdjustment: option.priceAdjustment,
            createdAt: new Date(),
            updatedAt: new Date()
        })
    }

    await db.collection("cartitems").insertOne({
        cartId: cart._id,
        foodId: food._id,
        quantity: 1,
        price: food.platformPrice,
        optionsKey: "",
        createdAt: new Date(),
        updatedAt: new Date()
    })

    // Voucher test: startDate/endDate luon luon "YYYY-MM-DD" de so sanh string dung
    await db.collection("vouchers").deleteMany({ code: "TESTQUOTE10" })
    await db.collection("vouchers").insertOne({
        name: "Test Quote Voucher",
        description: "Voucher test cho API quote",
        code: "TESTQUOTE10",
        typeVoucher: "SYSTEM",
        type: "FOOD",
        typeDiscount: "PERCENT",
        discountValue: 10,
        maxDiscount: 30000,
        minPrice: 0,
        startDate: "2020-01-01",
        endDate: "2030-12-31",
        startTime: "00:00",
        endTime: "23:59",
        maxQuantity: null,
        usedQuantity: 0,
        status: "ACTIVE",
        restaurantId: null,
        createdBy: ownerUser._id,
        createdAt: new Date(),
        updatedAt: new Date()
    })

    console.log("=== TAI KHOAN ===")
    console.log(`customer: ${CUSTOMER_EMAIL} / ${PASSWORD}`)
    console.log(`owner:    order-test-owner@test.com / ${PASSWORD}`)
    console.log(`customerId: ${customer._id}`)
    console.log(`ownerUserId: ${ownerUser._id}`)

    console.log("\n=== ID DUNG CHO POSTMAN ===")
    console.log(`restaurantId: ${restaurant._id}`)
    console.log(`addressId:    ${address._id}`)
    console.log(`cartId:       ${cart._id}`)
    console.log(`foodId:       ${food._id} (${food.name}, ${food.platformPrice})`)
    console.log(`cartItemId:   ${cartItem._id}`)

    console.log("\n=== POST /api/orders/quote ===")
    console.log(`curl -X POST http://127.0.0.1:8080/api/orders/quote -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d "{\\"restaurantId\\":\\"${restaurant._id}\\",\\"addressId\\":\\"${address._id}\\"}"`)

    await mongoose.disconnect()
}

main()
