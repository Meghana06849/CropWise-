import { Router } from "express";
import { getWeather } from "../controllers/weatherController.js";
import { weatherValidation } from "../validators/weatherValidators.js";
import { validateRequest } from "../utils/validate.js";

const router = Router();

router.get("/weather", weatherValidation, validateRequest, getWeather);

export default router;
