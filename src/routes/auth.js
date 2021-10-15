import { Router } from 'express';
const router = Router();

import {
  registerUser,
  loginUser,
  logout, 
  forgotPassword, 
  resetPassword, 
  getUserProfile, 
  updatePassword, 
  updateProfile, 
  allUsers, 
  getUserDetails, 
  updateUser, 
  deleteUser,
  addHobbies,
  getUserHobbies,
  deleteHobby
} from '../controllers/authController.js';

import { 
  isAuthenticatedUser, 
  authorizeRoles 
} from '../middlewares/auth.js';

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);

router.route('/logout').get(logout);

router.route('/me').get(isAuthenticatedUser, getUserProfile);
router.route('/password/update').put(isAuthenticatedUser, updatePassword);
router.route('/me/update').put(isAuthenticatedUser, updateProfile);

router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles('admin'), allUsers);
router.route('/admin/user/:id')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getUserDetails)
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateUser)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser);

router.route('/hobby').put(isAuthenticatedUser, addHobbies);
router.route('/hobbies')
  .get(isAuthenticatedUser, getUserHobbies)
  .delete(isAuthenticatedUser, deleteHobby);

export default router;