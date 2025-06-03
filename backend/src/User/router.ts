import * as userController from "./controller";
import express from "express";
import { deleteUserController, updateUserProfileController, verifyEmailController } from "./controller";

const userRouter = express.Router();

/**
 * Create user route i.e register
 * @name POST /api/user/register   
 * sss
 * req.body must contain all the filters:  username, email, password, phoneNumber
 * @return {user} - A user created with fields
 */
userRouter.post("/register", userController.userRegisterController);

/**
 * authenticate user route i.e login
 * @name POST /api/user/login
 * req.body must contain all the filters: email, password, role
 * @return {user} - A user logged in with fields
 */
userRouter.post("/login", userController.loginController);

/**
 * authenticate admin route i.e login
 * @name POST /api/user/admin-login
 * req.body must contain all the filters: email, password, role
 * @return {user} - A user logged in with fields
 */
// userRouter.post("/admin-login", userController.adminLoginController);

/**
 * send reset otp to user route i.e forgot password
 * @name POST /api/user/forgot-password
 * req.body must contain all the filters: email
 * @return {otp} - A user password reset link
 */
userRouter.post(
  "/forgot-password",
  userController.userForgotPasswordController
);

/**
 * update user password route i.e reset password
 * @name PUT /api/user/reset-password
 * req.body must contain all the filters: password
 * @param / user-id, token from reset link
 * @return {password-reset-message} - An upadted user with new password
 */
// userRouter.put("/reset-password/:id/:token", userController.userUpdatePassword);

userRouter.post(
  "/verify-email-and-otp-password",
  userController.verifyEmailAndOTP
);

/**fe
 * update user password route i.e reset password
 * @name POST /api/user/reset-password
 * req.body must contain all the filters: password
 * @param /  otp from e-mail and new-PASSWORD
 * @return {password-reset-message} - An upadted user with new password
 */
userRouter.post("/update/password", userController.verifyEmailAndOTP);
userRouter.get('/users', userController.getAllUsersController);
userRouter.patch("/profile/update", updateUserProfileController);
userRouter.post('/verify-email', userController.verifyEmailController);
userRouter.post('/resend-verification', verifyEmailController);
userRouter.delete('/usersof/:userId', deleteUserController);


export default userRouter;
