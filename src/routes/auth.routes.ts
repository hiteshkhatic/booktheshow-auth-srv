import { Router } from "express"
import { validateRequest } from "../middleware/validation.middleware.js"
import { createUserBody, refreshSchema } from "../validation/auth.validation.js"
import {
  handleLogout,
  handleRefresh,
  handleVerify,
  loginController,
  registerController,
} from "../controller/auth.controller.js"
import {
  loginRateLimiter,
  registerRateLimiter,
} from "../middleware/rate-limit.middleware.js"

const router = Router()

router.post(
  "/register",
  registerRateLimiter,
  validateRequest({
    body: createUserBody,
  }),
  registerController,
)

router.post(
  "/login",
  loginRateLimiter,
  validateRequest({
    body: createUserBody,
  }),
  loginController,
)

router.post(
  "/refresh",
  validateRequest({
    body: refreshSchema,
  }),
  handleRefresh,
)

router.post("/logout", handleLogout)

router.get("/verify", handleVerify)
export default router
