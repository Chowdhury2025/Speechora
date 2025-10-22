import { Router } from "express";
import {
  getPaymentConfig,
  getPublicKey,
  verifyPayment,
  getPaymentStatus,
  generatePaymentReference,
  detectMobileProvider
} from "./controller";

const router = Router();

// Payment configuration routes (for frontend widget)
router.post("/config", getPaymentConfig);
router.get("/public-key", getPublicKey);

// Payment verification routes
router.get("/verify/:reference", verifyPayment);
router.get("/status/:reference", getPaymentStatus);

// Utility routes
router.post("/generate-reference", generatePaymentReference);
router.post("/detect-provider", detectMobileProvider);

export default router;