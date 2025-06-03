import jwt from "jsonwebtoken";

interface User {
  id: number;
  [key: string]: any;
}

interface BackupData {
  users?: any[];
  sales?: any[];
  orders?: any[];
  [key: string]: any;
}

export const generateToken = (user: User) => {
  const secret: string = process.env.JWT_SECRET || "your_secret_key_here";
  return jwt.sign({ userId: user.id }, secret, { expiresIn: "1h" });
};

export const sanitizeDataForRestore = (data: BackupData) => {
  const sanitized = { ...data };
  
  // Handle user data - preserve password hashes
  if (Array.isArray(sanitized.users)) {
    sanitized.users = sanitized.users.map((user: any) => ({
      ...user,
      // Keep existing password hash, only clear tokens
      emailVerificationToken: null,
      token: null
    }));
  }

  // Remove circular references from related data
  if (Array.isArray(sanitized.sales)) {
    sanitized.sales = sanitized.sales.map((sale: any) => {
      const { product, store, ...saleData } = sale;
      return {
        ...saleData,
        productId: sale.productId || product?.id,
        storeId: sale.storeId || store?.id
      };
    });
  }

  if (Array.isArray(sanitized.orders)) {
    sanitized.orders = sanitized.orders.map((order: any) => {
      const { product, store, ...orderData } = order;
      return {
        ...orderData,
        productId: order.productId || product?.id,
        storeId: order.storeId || store?.id
      };
    });
  }
  
  return sanitized;
};
