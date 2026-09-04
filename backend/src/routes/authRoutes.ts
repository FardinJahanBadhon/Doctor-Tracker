import { Router } from "express";
import rateLimit from "express-rate-limit";
import { loginHandler, meHandler, logoutHandler } from "../controllers/authController";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { loginSchema } from "../validators/authValidator";

const router = Router();

// Slows down brute-force password guessing without affecting normal use.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again later." },
});

router.post("/login", loginLimiter, validate(loginSchema), loginHandler);
router.get("/me", authenticate, meHandler);
router.post("/logout", logoutHandler);

export default router;
