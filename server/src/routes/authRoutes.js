import { Router } from "express";
import { login, logout, me, refresh, register } from "../controllers/authController.js";
import {
	loginValidation,
	logoutValidation,
	refreshValidation,
	registerValidation
} from "../validators/authValidators.js";
import { validateRequest } from "../utils/validate.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", registerValidation, validateRequest, register);
router.post("/login", loginValidation, validateRequest, login);
router.post("/refresh", refreshValidation, validateRequest, refresh);
router.post("/logout", logoutValidation, validateRequest, logout);
router.get("/me", requireAuth, me);

export default router;
