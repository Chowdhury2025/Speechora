import { Request, Response } from "express";
import lencoService from "../services/LencoService";
import { prisma } from "../../config/db";

// Get payment configuration for frontend widget
export const getPaymentConfig = async (req: Request, res: Response) => {
  try {
    const paymentInfo = req.body;
    
    // Validate required fields
    if (!paymentInfo.amount || !paymentInfo.email || !paymentInfo.customerName) {
      return res.status(400).json({
        success: false,
        message: "Amount, email, and customer name are required"
      });
    }

    const paymentData = lencoService.generatePaymentData(paymentInfo);
    
    res.json({
      success: true,
      data: paymentData
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

// Get Lenco public key
export const getPublicKey = async (_req: Request, res: Response) => {
  try {
    const publicKey = lencoService.getPublicKey();
    
    res.json({
      success: true,
      publicKey
    });
  } catch (error) {
    console.error("Public key retrieval error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get public key",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Verify payment
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    
    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Payment reference is required"
      });
    }

    const result = await lencoService.verifyPayment(reference);

    // If Lenco reports success, try to update the user's premium balance
    if (result.success) {
      try {
        const raw = result.data || result;
        // Try multiple common places for metadata / amount
        const metadata = raw.metadata || raw.meta || raw.data?.metadata || raw.payment?.metadata;
        const amount = raw.amount || raw.data?.amount || raw.payment?.amount || raw.paidAmount;
        const userId = metadata?.userId || metadata?.user_id || metadata?.user || metadata?.customerUserId;

        if (userId && amount) {
          const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
          if (user) {
            const current = user.premiumBalance || 0;
            const newBalance = current + Number(amount);
            await prisma.user.update({
              where: { id: Number(userId) },
              data: {
                premiumBalance: newBalance,
                premiumActive: true
              }
            });
            // attach updated info for client convenience
            result.enriched = { premiumBalance: newBalance, premiumActive: true };
          }
        }
      } catch (e) {
        console.error('Error while updating user after payment verification:', e);
      }

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

// Get payment status (alias for verify payment)
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    
    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Payment reference is required"
      });
    }

    const result = await lencoService.verifyPayment(reference);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get payment status",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Generate payment reference
export const generatePaymentReference = async (req: Request, res: Response) => {
  try {
    const { prefix } = req.body;
    const reference = lencoService.generateReference(prefix);
    
    res.json({
      success: true,
      reference
    });
  } catch (error) {
    console.error("Reference generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate payment reference",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Detect mobile provider
export const detectMobileProvider = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required"
      });
    }

    const provider = lencoService.detectMobileProvider(phoneNumber);
    const formattedPhone = lencoService.formatPhoneNumber(phoneNumber);
    
    res.json({
      success: true,
      provider,
      formattedPhone
    });
  } catch (error) {
    console.error("Provider detection error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to detect mobile provider",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};