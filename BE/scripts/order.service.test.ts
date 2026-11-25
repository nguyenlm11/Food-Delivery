import assert from "node:assert/strict"
import test from "node:test"
import mongoose from "mongoose"
import dns from "node:dns"
import dotenv from "dotenv"
import { handleCreateOrder, handleUpdateOrderStatus, handleCancelOrder, handleGetOrders } from "../src/services/order.service"
import Order from "../src/models/order.model"
import { Cart, CartItem } from "../src/models/cart.model"
import Food from "../src/models/food.model"
import Menu from "../src/models/menu.model"
import Address from "../src/models/address.model"
import Restaurant from "../src/models/restaurant.model"
import Owner from "../src/models/owner.model"
import Role from "../src/models/role.model"
import User from "../src/models/user.model"
import ShipFee from "../src/models/shipfee.model"
import RestaurantSettlement from "../src/models/restaurant-settlement.model"
import DriverEarning from "../src/models/driver-earning.model"
import Driver from "../src/models/driver.model"
import VoucherUsage from "../src/models/voucher_usage.model"
import Wallet from "../src/models/wallet.model"
import WalletTransaction from "../src/models/wallet_transaction.model"

dotenv.config()
dns.setServers(["8.8.8.8", "8.8.4.4"])

let customerId = ""
let restaurantId = ""
let ownerId = ""
let addressId = ""
let menuId = ""
let foodId = ""
let foodPrice = 0
let baseFee = 0
let driverUserId = ""
let ownerUserId = ""

test.before(async () => {
    await mongoose.connect(process.env.MONGO_URL as string)

    const role = await Role.findOne({ name: "CUSTOMER" })
    const ownerRole = await Role.findOne({ name: "OWNER" })

    const suffix = Date.now()

    const [customer] = await User.create([{
        fullname: "Order Test Customer",
        email: `order-test-customer-${suffix}@test.com`,
        phone: `090${String(suffix).slice(-8)}`,
        password: "hashed",
        status: "ACTIVE",
        roleId: role!._id
    }])

    const [ownerUser] = await User.create([{
        fullname: "Order Test Owner",
        email: `order-test-owner-${suffix}@test.com`,
        phone: `091${String(suffix).slice(-8)}`,
        password: "hashed",
        status: "ACTIVE",
        roleId: ownerRole!._id
    }])

    const [owner] = await Owner.create([{
        userId: ownerUser._id,
        citizenId: `999999999${String(suffix).slice(-3)}`,
        bankAccount: {
            bankName: "Test Bank",
            accountNumber: "1234567890",
            accountHolder: "Order Test Owner"
        },
        approvalStatus: "APPROVED"
    }])

    const [restaurant] = await Restaurant.create([{
        name: "Order Test Restaurant",
        description: "test",
        phone: "0900000000",
        address: "Test address",
        latitude: 10.7769,
        longitude: 106.7009,
        status: "ACTIVE",
        approvalStatus: "APPROVED",
        commissionRate: 20,
        ownerId: owner._id,
        categoryIds: []
    }])

    const [menu] = await Menu.create([{ restaurantId: restaurant._id, name: "Test Menu", status: "ACTIVE" }])

    const [food] = await Food.create([{
        restaurantId: restaurant._id,
        menuId: menu._id,
        name: "Test Food",
        description: "test",
        originalPrice: 50000,
        platformPrice: 62500,
        status: "ACTIVE"
    }])

    const [address] = await Address.create([{
        customerId: customer._id,
        label: "HOME",
        recipientName: "Test Recipient",
        recipientPhone: "0900000000",
        addressLine: "1 Test Street",
        longitude: 106.7009,
        latitude: 10.7769,
        isDefault: true
    }])

    await ShipFee.create([{ ruleType: "BASE_FEE", name: "Base", baseFee: 15000, perKmFee: 5000, status: "ACTIVE" }])

    const driverRole = await Role.findOne({ name: "DRIVER" })
    const [driverUser] = await User.create([{
        fullname: "Order Test Driver",
        email: `order-test-driver-${suffix}@test.com`,
        phone: `092${String(suffix).slice(-8)}`,
        password: "hashed",
        status: "ACTIVE",
        roleId: driverRole!._id
    }])

    await Driver.create([{
        userId: driverUser._id,
        citizenId: `888888888${String(suffix).slice(-3)}`,
        driverLicenseId: `DL${suffix}`,
        vehicleModel: "Test Bike",
        vehicleRegistrationId: `VR${suffix}`,
        licensePlate: `TEST-${String(suffix).slice(-4)}`,
        bankAccount: {
            bankName: "Test Bank",
            accountNumber: "0987654321",
            accountHolder: "Order Test Driver"
        },
        status: "ONLINE",
        commissionRate: 30
    }])

    driverUserId = driverUser._id.toString()
    ownerUserId = ownerUser._id.toString()

    customerId = customer._id.toString()
    restaurantId = restaurant._id.toString()
    ownerId = owner._id.toString()
    addressId = address._id.toString()
    menuId = menu._id.toString()
    foodId = food._id.toString()
    foodPrice = food.platformPrice

    const baseRule = await ShipFee.findOne({ ruleType: "BASE_FEE", status: "ACTIVE" })
    baseFee = baseRule?.baseFee ?? 0
})

test.after(async () => {
    await mongoose.disconnect()
})

const seedCart = async () => {
    // Cart có unique index (userId, restaurantId): dùng upsert để test chạy lại được
    const cart = await Cart.findOneAndUpdate(
        { userId: customerId, restaurantId },
        { $set: { totalItemCount: 0, totalPrice: 0 } },
        { upsert: true, new: true }
    )

    await CartItem.deleteMany({ cartId: cart._id })
    await CartItem.create({ cartId: cart._id, foodId, quantity: 2, price: foodPrice })

    return cart
}

test("checkout tao order, tinh ship fee, xoa cart", async () => {
    const cart = await seedCart()

    const order = await handleCreateOrder(customerId, {
        restaurantId,
        addressId,
        paymentMethod: "CASH"
    })

    assert.equal(order.status, "PENDING")
    assert.equal(order.paymentMethod, "CASH")
    assert.equal(order.paymentStatus, "PENDING")
    assert.equal(order.foodAmount, foodPrice * 2)
    assert.equal(order.shipFee, baseFee)
    assert.equal(order.totalAmount, foodPrice * 2 + baseFee)
    assert.equal(order.items.length, 1)
    assert.equal(order.items[0].quantity, 2)

    // Giỏ hàng phải được dọn sau khi checkout
    const remainingCart = await Cart.findOne({ userId: customerId, restaurantId })
    assert.equal(remainingCart, null)

    const remainingItems = await CartItem.find({ cartId: cart._id })
    assert.equal(remainingItems.length, 0)
})

test("thanh toan WALLET tru tien va ghi WalletTransaction", async () => {
    await Wallet.create({ userId: customerId, balance: 1000000 })
    await seedCart()

    const order = await handleCreateOrder(customerId, {
        restaurantId,
        addressId,
        paymentMethod: "WALLET"
    })

    const wallet = await Wallet.findOne({ userId: customerId })
    assert.equal(wallet!.balance, 1000000 - order.totalAmount)
    assert.equal(order.paymentStatus, "PAID")

    const transaction = await WalletTransaction.findOne({ transactionRef: order.orderCode })
    assert.ok(transaction)
    assert.equal(transaction!.type, "PAYMENT")
})

test("khong du tien thi khong tao order", async () => {
    await Wallet.updateOne({ userId: customerId }, { balance: 0 })
    await seedCart()

    const countBefore = await Order.countDocuments({ customerId })

    await assert.rejects(
        () => handleCreateOrder(customerId, {
            restaurantId,
            addressId,
            paymentMethod: "WALLET"
        }),
        /Insufficient wallet balance/
    )

    const countAfter = await Order.countDocuments({ customerId })
    assert.equal(countAfter, countBefore)
})

test("chuuyen trang thai sai bi tu choi", async () => {
    await Wallet.updateOne({ userId: customerId }, { balance: 1000000 })
    await seedCart()

    const order = await handleCreateOrder(customerId, {
        restaurantId,
        addressId,
        paymentMethod: "CASH"
    })

    await assert.rejects(
        () => handleUpdateOrderStatus(order._id.toString(), customerId, "CUSTOMER", "DELIVERED"),
        /Cannot change order from PENDING to DELIVERED/
    )
})

test("DELIVERED tao RestaurantSettlement va DriverEarning", async () => {
    await Wallet.updateOne({ userId: customerId }, { balance: 1000000 })
    await seedCart()

    const order = await handleCreateOrder(customerId, {
        restaurantId,
        addressId,
        paymentMethod: "CASH"
    })

    // Owner xác nhận
    const confirmed = await handleUpdateOrderStatus(order._id.toString(), ownerUserId, "OWNER", "CONFIRMED")
    assert.equal(confirmed.status, "CONFIRMED")

    // Driver nhận và giao
    const delivering = await handleUpdateOrderStatus(order._id.toString(), driverUserId, "DRIVER", "DELIVERING")
    assert.equal(delivering.status, "DELIVERING")
    assert.ok(delivering.driverId)

    const finalOrder = await handleUpdateOrderStatus(order._id.toString(), driverUserId, "DRIVER", "DELIVERED")
    assert.equal(finalOrder.status, "DELIVERED")
    assert.ok(finalOrder.deliveredAt)

    const settlement = await RestaurantSettlement.findOne({ orderId: order._id })
    assert.ok(settlement)
    assert.equal(settlement!.grossAmount, finalOrder.foodAmount)
    assert.equal(settlement!.commissionAmount, finalOrder.foodAmount * 0.2)
    assert.equal(settlement!.restaurantAmount, finalOrder.foodAmount * 0.8)
    assert.equal(settlement!.ownerId.toString(), ownerId)

    const earning = await DriverEarning.findOne({ orderId: order._id })
    assert.ok(earning)
    assert.equal(earning!.deliveryFee, finalOrder.shipFee)
    assert.equal(earning!.commissionRate, 30)
    assert.equal(earning!.baseEarning, finalOrder.shipFee * 0.3)
})

test("huy don hoan tien vi", async () => {
    await Wallet.updateOne({ userId: customerId }, { balance: 1000000 })
    await seedCart()

    const order = await handleCreateOrder(customerId, {
        restaurantId,
        addressId,
        paymentMethod: "WALLET"
    })

    const walletBefore = await Wallet.findOne({ userId: customerId })

    const cancelled = await handleCancelOrder(order._id.toString(), customerId, "CUSTOMER", { reason: "Test cancel" })
    assert.equal(cancelled.status, "CANCELLED")

    const walletAfter = await Wallet.findOne({ userId: customerId })
    assert.equal(walletAfter!.balance, walletBefore!.balance + order.totalAmount)

    const refund = await WalletTransaction.findOne({ transactionRef: `REFUND-${order.orderCode}` })
    assert.ok(refund)
    assert.equal(refund!.type, "REFUND")
})

test("scope theo role: CUSTOMER chi thay don cua minh", async () => {
    const result = await handleGetOrders({}, customerId, "CUSTOMER")

    assert.ok(Array.isArray(result.orders))
    result.orders.forEach(order => {
        assert.equal(order.customerId._id.toString(), customerId)
    })
})
