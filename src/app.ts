import express from "express"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.routes.js"
import { errorHandler } from "./middleware/errorHandler.js"
import { validateRequest } from "./middleware/validation.middleware.js"
import { createUserBody } from "./validation/auth.validation.js"

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRoutes)

app.use(errorHandler)
export default app
