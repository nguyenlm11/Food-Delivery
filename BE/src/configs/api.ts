import { Express } from "express"

import authRoutes from "../routes/auth.route"
import customerRoutes from "../routes/customer.route"
import roleRoutes from "../routes/role.route"
import ownerRoutes from "../routes/owner.route"

const setupAPI = (app: Express) => {
    app.use("/api/auth", authRoutes)
    app.use("/api", customerRoutes)
    app.use("/api", roleRoutes)
    app.use("/api", ownerRoutes)
};

export default setupAPI;