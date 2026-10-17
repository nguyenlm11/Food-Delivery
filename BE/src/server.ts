import "dotenv/config"
import express from "express"
import http from "http"
import cors from "cors"
import cookieParser from "cookie-parser"
import initSocket from "./configs/socket"

import connectDatabase from "./configs/database"
import setupAPI from "./configs/api"
import seedRoles from "./seeders/role.seeder"
import seedCategories from "./seeders/category.seeder"
import { startWalletTransactionJob } from "./jobs/walletTransactionJob"

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 8080

// 1. CORS Configuration
app.use(cors({
    origin: [
        "http://127.0.0.1:5500",
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "https://foodie-rho-smoky.vercel.app"
    ],
    credentials: true
}))

// 2. Parsers Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// 3. Socket.io
const io = initSocket(server)

// 4. Routes Setup
setupAPI(app)

// 5. Connect MongoDB & Seed Data
connectDatabase().then(() => {
    seedRoles()
    seedCategories()

    // Start background jobs after DB is connected
    startWalletTransactionJob()
})

// 6. Start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})