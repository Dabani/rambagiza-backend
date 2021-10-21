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
  deleteHobby,
  addFavorites,
  getUserFavorites,
  deleteFavorite,
  uploadImages,
  getUserImages,
  deleteImage,
  addLikes,
  getUserLikes,
  sendFriendRequest,
  showFriendRequest,
  acceptFriend,
  getFriends,
  rejectFriend
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

router.route('/favorite').put(isAuthenticatedUser, addFavorites);
router.route('/favorites')
  .get(isAuthenticatedUser, getUserFavorites)
  .delete(isAuthenticatedUser, deleteFavorite);

router.route('/image').put(isAuthenticatedUser, uploadImages);

router.route('/images')
  .get(isAuthenticatedUser, getUserImages)
  .delete(isAuthenticatedUser, deleteImage);

router.route('/userLike/:id').put(isAuthenticatedUser, addLikes);
router.route('/likes')
  .get(isAuthenticatedUser, getUserLikes);

// Friend request process
router.route('/sendFriendRequest/:id').get(isAuthenticatedUser, sendFriendRequest)
router.route('/showFriendRequest/:id').get(isAuthenticatedUser, showFriendRequest)
router.route('/acceptFriend/:id').get(isAuthenticatedUser, acceptFriend)
router.route('/friends').get(isAuthenticatedUser, getFriends)
router.route('/rejectFriend/:id').get(isAuthenticatedUser, rejectFriend)

export default router;