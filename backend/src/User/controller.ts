import { prisma } from "../../config/db";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { hash, compare } from "bcrypt";
import { sendMail } from "../../utils/mail";
import { generateOTP } from "../../utils/otp";
import { VerifyEmailAndOTPRequest } from "../../types/interface";
import { generateEmailLayout } from "../../utils/emailTemplate";



export const userRegisterController = async (req: Request, res: Response) => {
  try {
    const { username, email, password, phoneNumber, role, frontendUrl } = req.body;

    // Check if email or phoneNumber already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phoneNumber }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: "Email already exists" });
      }
      if (existingUser.phoneNumber === phoneNumber) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: "Phone number already exists" });
      }
    }

    // Hash password and generate verification token
    const hashedPassword = await hash(password, 10);
    const verificationToken = generateOTP();

    // Set up trial period (7 days)
    const trialStartDate = new Date();
    const trialExpiry = new Date(trialStartDate);
    trialExpiry.setDate(trialExpiry.getDate() + 7);

    // Create user in the database with trial period
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        phoneNumber,
        role: role || "GUARDIAN_PARENT",
        emailVerificationToken: verificationToken,
        isEmailVerified: false,
        trialStartDate,
        trialExpiry,
        isTrialUsed: false,
        premiumActive: true // Active during trial
      },
    });

    // If this is user ID 1, make them a SUPERUSER
    if (user.id === 1) {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          role: "SUPERUSER",
          group: user.id 
        },
      });
      user.role = "SUPERUSER";
    }

    // Send verification email
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}&email=${email}`;
    const emailOptions = {
      to: email,
      subject: "Welcome to Book8 - Verify Your Email",
      html: generateEmailLayout({
        title: "Welcome to Book8!",
        bodyContent: `
          <p>Dear ${username},</p>
          <p>Welcome to Book8! You have a 7-day trial period to explore our premium features.</p>
          <p> this is your Verification Code ${verificationToken}</p>
          <p>Please verify your email by clicking the button below:</p>
          <a href="${verificationLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
        `,
      }),
    };

    await sendMail(emailOptions);

    res.status(StatusCodes.CREATED).json({
      message: user.id === 1
        ? "Registration successful. You have been assigned as SUPERUSER. Please verify your email."
        : "Registration successful. Your 7-day trial period has started. Please verify your email.",
    }); 
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to register user",
      error: error?.stack || error?.message || error,
    });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Find the user and include all necessary fields
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        phoneNumber: true,
        role: true,
        group: true,
        bloodGroup: true,
        address: true,
        dateOfBirth: true,
        gender: true,
        emergencyContact: true,
        isEmailVerified: true,
        premiumActive: true,
        premiumBalance: true,
        premiumDeduction: true,
        premiumExpiry: true,
        trialExpiry: true,
        trialStartDate: true,
        isTrialUsed: true,
        password: true,
      },
    });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
    }

    const verifyPassword = await compare(password, user.password);
    if (!verifyPassword) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid password" });
    }

    if (!user.isEmailVerified) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Email not verified. Please verify your email before logging in.",
        needsVerification: true,
      });
    }

    // Check trial and premium status
    let isPremium = user.premiumActive;
    let premiumExpiry = user.premiumExpiry;
    const now = new Date();

    // If user is in trial period
    if (user.trialExpiry && !user.isTrialUsed && user.trialExpiry > now) {
      isPremium = true;
      premiumExpiry = user.trialExpiry;
    } 
    // If trial has expired and user hasn't purchased premium
    else if (user.trialExpiry && !user.isTrialUsed && user.trialExpiry <= now) {
      // Mark trial as used
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          isTrialUsed: true,
          premiumActive: false 
        },
      });
      isPremium = false;
      premiumExpiry = null;
    }

    // Return user details with premium info
    return res.status(StatusCodes.OK).json({
      userId: user.id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      group: user.group,
      bloodGroup: user.bloodGroup,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      emergencyContact: user.emergencyContact,
      isEmailVerified: user.isEmailVerified,
      premium: {
        isActive: isPremium,
        balance: user.premiumBalance,
        deduction: user.premiumDeduction,
        expiry: premiumExpiry,
        trialExpiry: !user.isTrialUsed ? user.trialExpiry : null,
      },
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Failed to authenticate user",
      error: error?.stack || error?.message || error,
    });
  }
};

export const userForgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { email, frontendUrl } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json("User not found");
    }

    const otp = generateOTP(); // Generate OTP here

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { token: otp },
    });

    // Build OTP email content for password reset
    const bodyContent = `
    <p style="color: #2d3748; font-size: 1rem;">Dear ${updatedUser.username},</p>
    <p style="color: #4a5568; font-size: 1rem; margin-top: 0.5rem;">
      You have requested to reset your password. Use the OTP below to proceed.
    </p>
    <div style="text-align: center; font-size: 1.25rem; font-weight: bold; color: #2f855a; margin: 1rem auto; padding: 0.5rem; background-color: #f0fff4; border-radius: 0.375rem; max-width: 20rem;">
      ${otp}
    </div>
    <p style="color: #4a5568; font-size: 1rem; margin-top: 0.5rem;">
      If you did not request this, please ignore this message.
    </p>
    <p style="color: #4a5568; font-size: 1rem; margin-top: 0.5rem;">
      Use the link below to update your password:
    </p>
    <div style="text-align: center; margin-top: 1rem;">      <a href="${frontendUrl}/update/password" style="background-color: #48bb78; color: #ffffff; padding: 0.5rem 1rem; border-radius: 0.25rem; display: inline-block; text-decoration: none;">
        Update Password
      </a>
    </div>
  `;
  

    const emailOptions = {
      to: user.email,
      subject: "Your OTP for Password Reset",
      html: generateEmailLayout({
        title: "Password Reset Request",
        bodyContent,
      }),
    };

    await sendMail(emailOptions);

    return res
      .status(StatusCodes.OK)
      .json("OTP sent to your email account for password reset");
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Failed to send OTP for password reset",
      error: error?.stack || error?.message || error,
    });
  }
};

export const verifyEmailAndOTP = async (req: Request, res: Response) => {
  try {
    const { otp, email, password } = req.body as VerifyEmailAndOTPRequest;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json("Invalid email");
    }

    // Verify OTP
    if (user.token !== otp) {
      return res.status(StatusCodes.BAD_REQUEST).json("Invalid OTP");
    }

    // Clear the OTP after successful verification and update password
    await prisma.user.update({
      where: { id: user.id },
      data: { token: null },
    });

    const hashedPassword = await hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Build success notification email content
    const bodyContent = `
    <p class="text-gray-800 text-base">Dear ${user.username},</p>
    <p class="text-gray-700 text-base mt-2">
      Your password has been successfully reset.
    </p>
    <p class="text-gray-700 text-base mt-2">
      If you did not perform this action, please <a href="|" class="text-indigo-600 underline">contact support</a> immediately.
    </p>
  `;
  

    const emailOptions = {
      to: user.email,
      subject: "Password Reset Successful",
      html: generateEmailLayout({
        title: "Password Reset Successful",
        bodyContent,
      }),
    };

    await sendMail(emailOptions);

    return res.status(StatusCodes.OK).json("Password updated successfully");
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Failed to verify email and OTP or update password",
      error: error?.stack || error?.message || error,
    });
  }
};


export const updateUserProfileController = async (req: Request, res: Response) => {
  try {
    const { 
      userId,
      username, 
      email, 
      firstName,
      middleName,
      lastName,
      phoneNumber, 
      bloodGroup, 
      address, 
      dateOfBirth, 
      gender, 
      emergencyContact,
      profilePicture,
      bio,
      location,
      role,
      isEmailVerified,
      frontendUrl
    } = req.body;

    // Remove SUPERUSER auth check for TEACHER role
    const id = Number(userId);
    console.log("Request Body:", req.body);

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
    }

    let updateData: any = {};

    if (username) updateData.username = username;
    if (firstName) updateData.firstName = firstName;
    if (middleName) updateData.middleName = middleName;
    if (lastName) updateData.lastName = lastName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (bloodGroup?.trim()) updateData.bloodGroup = bloodGroup;
    if (address?.trim()) updateData.address = address;
    if (gender) updateData.gender = gender;
    if (emergencyContact?.trim()) updateData.emergencyContact = emergencyContact;
    if (profilePicture?.trim()) updateData.profilePicture = profilePicture;
    if (bio?.trim()) updateData.bio = bio;
    if (location?.trim()) updateData.location = location;
    if (role) updateData.role = role;

    // Handle dateOfBirth conversion with extra validation
    if (dateOfBirth) {
      const parsedDate = new Date(dateOfBirth);
      if (!isNaN(parsedDate.getTime())) {
        updateData.dateOfBirth = parsedDate;
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid dateOfBirth format" });
      }
    }

    let sendVerificationEmail = false;
    if (email && email !== existingUser.email) {
      const verificationToken = generateOTP();
      updateData.email = email;
      updateData.isEmailVerified = false;
      updateData.emailVerificationToken = verificationToken;
      sendVerificationEmail = true;
    } else if (typeof isEmailVerified === "boolean" && email === existingUser.email) {
      updateData.isEmailVerified = isEmailVerified;
    }

    console.log("Update Data:", updateData);
    const updatedUser = await prisma.user.update({ where: { id }, data: updateData });
    console.log("User updated successfully:", updatedUser);

    if (sendVerificationEmail) {
      const bodyContent = `
        <p class="text-gray-800 text-base">Dear ${username || existingUser.username},</p>
        <p class="text-gray-700 text-base mt-2">
          Please verify your new email address by using the following code:
        </p>
        <div class="text-center text-xl font-bold text-green-700 my-4 p-2 bg-green-100 rounded-md max-w-xs mx-auto">
          ${updatedUser.emailVerificationToken}
        </div>
        <p class="text-gray-700 text-base mt-2">Or click the link below to verify your email:</p>
        <div class="text-center mt-4">
          <a href="${frontendUrl}/verify/email/${updatedUser.emailVerificationToken}" 
             class="bg-green-500 text-white px-4 py-2 rounded inline-block">
            Verify Email  
          </a>
        </div>
        <p class="text-gray-700 text-base mt-2">
          If you did not request this change, please contact support immediately.
        </p>
      `;
      const verificationEmailOptions = {
        to: email,
        subject: "Verify Your New Email Address",
        html: generateEmailLayout({
          title: "Verify Your New Email Address",
          bodyContent,
        }),
      };

      try {
        await sendMail(verificationEmailOptions);
        console.log("Verification email sent to", email);
      } catch (mailError) {
        console.error("Error sending verification email:", mailError);
      }
    }

    // Send notification email confirming profile update
    const notificationBodyContent = `
      <p class="text-gray-800 text-base">Dear ${updatedUser.username},</p>
      <p class="text-gray-700 text-base mt-2">
        Your profile has been successfully updated.
      </p>
      ${sendVerificationEmail ? `<p class="text-gray-700 text-base mt-2">Please note that you need to verify your new email address.</p>` : ""}
      <p class="text-gray-700 text-base mt-2">
        Thank you for keeping your information up-to-date.
      </p>
    `;
    const notificationEmailOptions = {
      to: updatedUser.email,
      subject: "Profile Updated",
      html: generateEmailLayout({
        title: "Profile Updated",
        bodyContent: notificationBodyContent,
      }),
    };

    try {
      await sendMail(notificationEmailOptions);
      console.log("Profile update notification email sent to", updatedUser.email);
    } catch (mailError) {
      console.error("Error sending profile update notification email:", mailError);
    }

    const userResponse = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      firstName: updatedUser.username,
      middleName: updatedUser.middleName,
      lastName: updatedUser.lastName,
      phoneNumber: updatedUser.phoneNumber,
      bloodGroup: updatedUser.bloodGroup,
      address: updatedUser.address,
      dateOfBirth: updatedUser.dateOfBirth,
      gender: updatedUser.gender,
      emergencyContact: updatedUser.emergencyContact,
      // profilePicture: updatedUser.profilePicture,
      // bio: updatedUser.bio,
      // location: updatedUser.location,
      isEmailVerified: updatedUser.isEmailVerified,
      role: updatedUser.role,
    };

    return res.status(StatusCodes.OK).json({
      user: userResponse,
      message: sendVerificationEmail
        ? "Profile updated. Please verify your new email address."
        : "Profile updated successfully.",
    });
  } catch (error: any) {
    console.error("Error in updateUserProfileController:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to update user profile",
      error: error?.stack || error?.message || error,
    });
  }
};

export const verifyEmailController = async (req: Request, res: Response) => {
  try {
    const { email, token, frontendUrl } = req.body;

    if (!email || !token) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Email and verification token are required"
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "User not found"
      });
    }

    if (user.isEmailVerified) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Email is already verified"
      });
    }

    if (user.emailVerificationToken !== token) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid verification token"
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, emailVerificationToken: null },
    });

    const bodyContent = `
      <p class="text-gray-800 text-base">Dear ${user.username},</p>
      <p class="text-gray-700 text-base mt-2">
        Your email has been successfully verified. Thank you!
      </p>
      <p class="text-gray-700 text-base mt-2">
        You can now access all the features of our application.
      </p>
      <div class="text-center mt-4">
        <a href="${frontendUrl}" class="bg-green-500 text-white px-4 py-2 rounded inline-block">
          Go to Dashboard
        </a>
      </div>
    `;

    const emailOptions = {
      to: user.email,
      subject: "Email Verification Successful 🎉",
      html: generateEmailLayout({
        title: "Email Verification Successful",
        bodyContent,
      }),
    };

    await sendMail(emailOptions);
    return res.status(StatusCodes.OK).json({
      message: "Email verified successfully"
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to verify email",
      error: error?.stack || error?.message || error,
    });
  }
};

export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        isEmailVerified: true,
        role: true,
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const totalUsers = await prisma.user.count();

    return res.status(StatusCodes.OK).json({
      users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        pages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Failed to retrieve users",
      error: error?.stack || error?.message || error,
    });
  }
};

// Get single user with full details and relations
export const getUserDetailsController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId || req.query.userId || req.body.userId);
    if (!userId) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Missing userId' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        videos: true,
        images: true,
        tests: true,
        quizImages: true,
        presentation3: true,
        UsedPromoCode: true,
        Lesson: true,
      },
    });

    if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });

    // Normalize dates to ISO strings for the frontend
    const normalizeDate = (d: any) => (d ? new Date(d).toISOString() : null);

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      group: user.group,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      trialStartDate: normalizeDate(user.trialStartDate),
      trialExpiry: normalizeDate(user.trialExpiry),
      isTrialUsed: user.isTrialUsed,
      premiumActive: user.premiumActive,
      premiumBalance: user.premiumBalance,
      premiumDeduction: user.premiumDeduction,
      premiumExpiry: normalizeDate(user.premiumExpiry),
      // relations
      videos: user.videos || [],
      images: user.images || [],
      tests: user.tests || [],
      quizImages: user.quizImages || [],
      presentations: user.presentation3 || [],
      usedPromoCodes: user.UsedPromoCode || [],
      lessons: user.Lesson || [],
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch user details', error: error?.message || error });
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const existingUser = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!existingUser) {
      return res.status(StatusCodes.NOT_FOUND).json("User not found");
    }

    await prisma.user.delete({
      where: { id: Number(userId) },
    });

    const bodyContent = `
      <p class="text-gray-800 text-base">Dear ${existingUser.username},</p>
      <p class="text-gray-700 text-base mt-2">
        Your account has been deleted from our system.
      </p>
      <p class="text-gray-700 text-base mt-2">
        If you believe this was a mistake, please contact support immediately.
      </p>
    `;

    const emailOptions = {
      to: existingUser.email,
      subject: "Account Deletion Confirmation",
      html: generateEmailLayout({
        title: "Account Deletion Confirmation",
        bodyContent,
      }),
    };

    await sendMail(emailOptions);

    return res.status(StatusCodes.OK).json({
      message: "User deleted successfully",
    });
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to delete user",
      error: error?.stack || error?.message || error,
    });
  }
};

// --- Premium APIs ---

// Get premium info
export const getPremiumInfo = async (req: Request, res: Response) => {
  const userId = Number(req.body.userId || req.query.userId);
  if (!userId) return res.status(400).json({ message: "Missing userId" });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({
    isActive: user.premiumActive,
    balance: user.premiumBalance,
    deduction: user.premiumDeduction,
    expiry: user.premiumExpiry,
  });
};

// Add funds to premium balance
export const addPremiumFunds = async (req: Request, res: Response) => {
  const userId = Number(req.body.userId);
  const { amount } = req.body;
  if (!userId) return res.status(400).json({ message: "Missing userId" });
  if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      premiumBalance: { increment: amount },
      premiumActive: true,
    },
  });
  // Return full premium info for frontend consistency
  res.json({
    premiumActive: user.premiumActive,
    premiumBalance: user.premiumBalance,
    premiumDeduction: user.premiumDeduction,
    premiumExpiry: user.premiumExpiry,
  });
};

// Cancel premium
export const cancelPremium = async (req: Request, res: Response) => {
  const userId = Number(req.body.userId);
  if (!userId) return res.status(400).json({ message: "Missing userId" });
  await prisma.user.update({
    where: { id: userId },
    data: {
      premiumActive: false,
      premiumBalance: 0,
      premiumExpiry: null,
    },
  });
  res.json({ message: "Premium cancelled" });
};

// Upgrade/set deduction
export const upgradePremium = async (req: Request, res: Response) => {
  const userId = Number(req.body.userId);
  const { deduction } = req.body;
  if (!userId) return res.status(400).json({ message: "Missing userId" });
  if (!deduction || deduction <= 0) return res.status(400).json({ message: "Invalid deduction" });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ message: "User not found" });
  const months = Math.floor(user.premiumBalance / deduction);
  let expiry = null;
  if (months > 0) {
    expiry = new Date();
    expiry.setMonth(expiry.getMonth() + months);
  }
  await prisma.user.update({
    where: { id: userId },
    data: {
      premiumActive: true,
      premiumDeduction: deduction,
      premiumExpiry: expiry,
    },
  });
  res.json({ message: "Premium upgraded", expiry });
};

// Send premium-related email
export const sendPremiumEmail = async (req: Request, res: Response) => {
  try {
    const { userId, action, amount, paymentMethod, deduction } = req.body;
    const id = Number(userId);
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Missing or invalid userId" });
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    let subject = "";
    let bodyContent = "";
    if (action === "add_funds") {
      subject = "Premium Funds Added";
      bodyContent = `<p>Dear ${user.username},</p><p>Your premium account has been credited with ₦${amount} via ${paymentMethod}. Thank you!</p>`;
    } else if (action === "upgrade") {
      subject = "Premium Upgraded";
      bodyContent = `<p>Dear ${user.username},</p><p>Your premium deduction is now ₦${deduction} per month. Enjoy your premium benefits!</p>`;
    } else if (action === "cancel") {
      subject = "Premium Cancelled";
      bodyContent = `<p>Dear ${user.username},</p><p>Your premium subscription has been cancelled. You can re-activate anytime.</p>`;
    } else {
      subject = "Premium Account Update";
      bodyContent = `<p>Dear ${user.username},</p><p>Your premium account has been updated.</p>`;
    }
    const emailOptions = {
      to: user.email,
      subject,
      html: generateEmailLayout({ title: subject, bodyContent }),
    };
    await sendMail(emailOptions);
    res.json({ message: "Premium email sent" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send premium email", error: (error as any)?.message || String(error) });
  }
};

// ---- Subscription Status Endpoint ----
export const subscriptionStatusController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.query.userId || req.body.userId);
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const now = new Date();
    let state: 'trial' | 'premium' | 'expired' | 'free' = 'free';
    let expiry: Date | null = null;

    // Helper to persist any status transitions
    const persistUpdates: any = {};

    // Trial active?
    if (user.trialExpiry && !user.isTrialUsed && user.trialExpiry > now) {
      state = 'trial';
      expiry = user.trialExpiry;
    } else {
      // If trial period passed and not yet marked used
      if (user.trialExpiry && !user.isTrialUsed && user.trialExpiry <= now) {
        persistUpdates.isTrialUsed = true;
      }
      // Premium active? (expiry null means indefinite)
      if (user.premiumActive) {
        if (user.premiumExpiry) {
          if (user.premiumExpiry > now) {
            state = 'premium';
            expiry = user.premiumExpiry;
          } else {
            // premium expired
            persistUpdates.premiumActive = false;
            persistUpdates.premiumExpiry = null;
            state = user.isTrialUsed || user.trialExpiry ? 'expired' : 'free';
          }
        } else {
          // Indefinite premium
            state = 'premium';
            expiry = null;
        }
      } else {
        // Not premium active
        if (user.trialExpiry && user.trialExpiry <= now) {
          state = 'expired';
        } else {
          state = 'free';
        }
      }
    }

    // Persist transitions if any
    if (Object.keys(persistUpdates).length) {
      await prisma.user.update({ where: { id: user.id }, data: persistUpdates });
    }

    let daysRemaining: number | null = null;
    if (expiry) {
      const diffMs = expiry.getTime() - now.getTime();
      if (diffMs > 0) {
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      } else {
        daysRemaining = 0;
      }
    }

    res.json({ state, daysRemaining, expiry });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get subscription status', error: (error as any)?.message || String(error) });
  }
};

// ---- Purchase / Activate Premium Endpoint ----
export const purchasePremiumController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.body.userId);
    const months = req.body.months ? Number(req.body.months) : null;
    const days = req.body.days ? Number(req.body.days) : null;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });
    if ((!months || months <= 0) && (!days || days <= 0)) {
      return res.status(400).json({ message: 'Provide a positive months or days value' });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const now = new Date();
    let baseDate = now;
    if (user.premiumExpiry && user.premiumExpiry > now) {
      baseDate = user.premiumExpiry;
    }
    const newExpiry = new Date(baseDate);
    if (months && months > 0) {
      newExpiry.setMonth(newExpiry.getMonth() + months);
    } else if (days && days > 0) {
      newExpiry.setDate(newExpiry.getDate() + days);
    }
    await prisma.user.update({
      where: { id: userId },
      data: {
        premiumActive: true,
        premiumExpiry: newExpiry,
        isTrialUsed: true,
      }
    });
    res.json({ message: 'Premium activated', expiry: newExpiry });
  } catch (error) {
    res.status(500).json({ message: 'Failed to purchase premium', error: (error as any)?.message || String(error) });
  }
};
