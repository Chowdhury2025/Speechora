import { companyName } from "../config";

export interface EmailLayoutOptions {
  bodyContent: string; 
  title?: string;      
}

export const generateEmailLayout = (options: EmailLayoutOptions): string => {
  const { bodyContent, title } = options;
  return `
    <div style="max-width: 600px; margin: 20px auto; background: #ffffff; padding: 30px; border: 1px solid #cccccc; border-radius: 8px; font-family: Arial, sans-serif; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
      <div style="background: #0d47a1; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold;">${companyName}</h1>
      </div>
      <div style="padding: 20px; text-align: center;">
        <h2 style="font-size: 22px; font-weight: bold; color: #10b981; margin-bottom: 10px;">${title || "Welcome to Our Service!"}</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">${bodyContent}</p>
      </div>
      <div style="border-top: 1px solid #eeeeee; padding: 15px; text-align: center; font-size: 14px; color: #666666; background: #f9f9f9; border-radius: 0 0 8px 8px;">
        Best regards, <br />
        <strong style="color: #0d47a1;">Management Team</strong>
      </div>
    </div>
  `;
};
