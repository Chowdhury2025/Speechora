// bus-server/src/utils/otp.ts

const generateRandomDigit = (): number => {
  return Math.floor(Math.random() * 10);
};

export const generateOTP = (): string => {
  const otp = Array.from({ length: 3 }, generateRandomDigit).join('');
  return otp;
};
