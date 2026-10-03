import { Express } from "express"

import authRoutes from "../routes/auth.route"
import roleRoutes from "../routes/role.route"
import customerRoutes from "../routes/customer.route"
import ownerRoutes from "../routes/owner.route"
import driverRoutes from "../routes/driver.route"
import restaurantRoutes from "../routes/restaurant.route"
import categoryRoutes from "../routes/category.route"
import menuRoutes from "../routes/menu.route"
import foodRoutes from "../routes/food.route"
import cartRoutes from "../routes/cart.route"
import walletRoutes from "../routes/wallet.route"
import uploadRoutes from "../routes/upload.route"

const setupAPI = (app: Express) => {
    app.use("/api/auth", authRoutes)
    app.use("/api", roleRoutes)
    app.use("/api", customerRoutes)
    app.use("/api", ownerRoutes)
    app.use("/api", driverRoutes)
    app.use("/api", restaurantRoutes)
    app.use("/api", categoryRoutes)
    app.use("/api", menuRoutes)
    app.use("/api", foodRoutes)
    app.use("/api", cartRoutes)
    app.use("/api", walletRoutes)
    app.use("/api", uploadRoutes)
};

export default setupAPI;