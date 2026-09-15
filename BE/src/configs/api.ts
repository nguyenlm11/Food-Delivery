import { Express } from "express"

import authRoutes from "../routes/auth.route"
import roleRoutes from "../routes/role.route"
import customerRoutes from "../routes/customer.route"
import ownerRoutes from "../routes/owner.route"
import restaurantRoutes from "../routes/restaurant.route"
import categoryRoutes from "../routes/category.route"
import uploadRoutes from "../routes/upload.route"

const setupAPI = (app: Express) => {
    app.use("/api/auth", authRoutes)
    app.use("/api", roleRoutes)
    app.use("/api", customerRoutes)
    app.use("/api", ownerRoutes)
    app.use("/api", restaurantRoutes)
    app.use("/api", categoryRoutes)
    app.use("/api", uploadRoutes)
};

export default setupAPI;