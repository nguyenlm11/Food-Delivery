import "dotenv/config";
import express from "express";
import connectDatabase from "./configs/database";
import setupAPI from "./configs/api";
// import { initSocket } from "./config/socket";
import http from "http";
import cors from "cors";
import seedRoles from "./seeders/role.seeder";

// dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket
// const io = initSocket(server);

// CORS
app.use(cors({
    origin: [
        "http://127.0.0.1:5500",
        "http://localhost:5173"
    ]
}));

app.use(express.json());

seedRoles()

// Routes
setupAPI(app);

// Connect MongoDB
connectDatabase();

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});