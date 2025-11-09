import { Router } from "express";
import {
  getPaymentConfig,
  processPayment,
  verifyPayment
} from "./googlePayController";

const router = Router();

// Payment configuration routes (for frontend widget)
router.get("/config", getPaymentConfig);

// Payment processing routes
router.post("/process", processPayment);
router.get("/verify/:paymentId", verifyPayment);

export default router;