import { Router } from 'express';
const router = Router();

import { 
  getPosts, 
  newPost, 
  getSinglePost, 
  updatePost, 
  deletePost, 
  createPostReview, 
  getPostReviews, 
  deleteReview 
} from '../controllers/postController.js';

import { 
  isAuthenticatedUser, 
  authorizeRoles 
} from '../middlewares/auth.js';

router.route('/posts').get(getPosts);
router.route('/post/:id').get(getSinglePost);

router.route('/admin/post/new').post(isAuthenticatedUser, authorizeRoles('admin'), newPost);

router.route('/admin/post/:id')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updatePost)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deletePost);

router.route('/review').put(isAuthenticatedUser, createPostReview);
router.route('/reviews')
  .get(isAuthenticatedUser, getPostReviews)
  .delete(isAuthenticatedUser, deleteReview);
/* 
router.route('/like').put(isAuthenticatedUser, likePost);
router.route('/likes')
  .get(isAuthenticatedUser, getPostLikes)
  .delete(isAuthenticatedUser, dislikePost);
 */
export default router;
