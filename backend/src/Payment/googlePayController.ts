import { Request, Response } from "express";
import googlePayService from "../services/GooglePayService";

export const getPaymentConfig = async (_req: Request, res: Response) => {
  try {
    const config = googlePayService.getPaymentConfig();
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error("Payment config generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate payment configuration",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const processPayment = async (req: Request, res: Response) => {
  try {
    const paymentInfo = req.body;
    
    if (!paymentInfo.amount || !paymentInfo.email || !paymentInfo.paymentData) {
      return res.status(400).json({
        success: false,
        message: "Amount, email, and payment data are required"
      });
    }

    const result = await googlePayService.processPayment(paymentInfo);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Payment processing error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process payment",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    
    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required"
      });
    }

    const result = await googlePayService.verifyPayment(paymentId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};